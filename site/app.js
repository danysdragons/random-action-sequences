import { generateSequence } from './actions.js';

const $ = id => document.getElementById(id);
const form = $('settings');
const cueSlots = ['previous', 'current', 'next', 'after'];
let sequence = generateSequence(128);
let shown = 0;
let screen = 'setup';
let index = 0;
let paused = false;
let rhythm = true;
let bpm = 60;
let beats = 2;
let epoch = 0;
let startIndex = 0;
let nextClick = 0;
let lastTick = null;
let frame = 0;
let clockVersion = 0;
let audio;
let audible = false;
const scheduled = new Set();

function display() { return form.elements.format.value; }
function duration(seconds) {
  const rounded = Math.round(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}

function showScreen(name) {
  screen = name;
  for (const section of ['setup', 'practice', 'complete']) $(section).hidden = name !== section;
  document.body.classList.toggle('running', name === 'practice');
  $('pause').hidden = name !== 'practice' || !rhythm;
  window.scrollTo(0, 0);
}

function cueParts(actionIndex) {
  const number = document.createElement('span');
  number.className = 'num';
  number.textContent = actionIndex + 1;
  const text = document.createElement('span');
  text.textContent = sequence[actionIndex][display()];
  return [number, text];
}

function moreRows(reset = false) {
  if (reset) {
    $('sheet').replaceChildren();
    shown = 0;
  }
  const end = Math.min(shown + 32, sequence.length);
  const fragment = document.createDocumentFragment();
  for (; shown < end; shown++) {
    const row = document.createElement('li');
    row.append(...cueParts(shown));
    fragment.append(row);
  }
  $('sheet').append(fragment);
  $('more').hidden = shown === sequence.length;
}

function refreshSettings() {
  const timed = form.elements.pace.value === 'rhythm';
  $('rhythm-settings').hidden = !timed;
  $('tempo').disabled = !timed;
  $('legend').hidden = display() !== 'notation';
  const length = $('length').valueAsNumber;
  const tempo = $('tempo').valueAsNumber;
  if (!$('length').validity.valid || (timed && !$('tempo').validity.valid)) {
    $('estimate').textContent = '';
    return;
  }
  const seconds = length * Number($('beats').value) * 60 / tempo;
  $('estimate').textContent = timed ? `${length} actions · ${duration(seconds)}` : `${length} actions · self-paced`;
}

function draw(force = false) {
  if (!$('length').reportValidity()) return false;
  const length = $('length').valueAsNumber;
  if (force || length !== sequence.length) {
    sequence = generateSequence(length);
    moreRows(true);
  }
  return true;
}

function renderCues() {
  cueSlots.forEach((slot, offset) => {
    const at = index + offset - 1;
    $(slot).replaceChildren(...(at >= 0 && at < sequence.length ? cueParts(at) : []));
  });
  $('position').textContent = `${index + 1} of ${sequence.length}`;
  $('progress').value = index + 1;
  $('back').disabled = index === 0;
  $('advance').textContent = index === sequence.length - 1 ? 'Finish' : 'Next action →';
}

function pulse(count, current) {
  const dots = Array.from({ length: count }, (_, i) => {
    const dot = document.createElement('i');
    dot.classList.toggle('on', i === current);
    return dot;
  });
  $('pulses').replaceChildren(...dots);
}

function stopClock() {
  clockVersion++;
  cancelAnimationFrame(frame);
  for (const tone of scheduled) tone.stop();
  scheduled.clear();
}

function playClick(when, accent) {
  const tone = audio.createOscillator();
  const gain = audio.createGain();
  tone.frequency.value = accent ? 990 : 700;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.16, when + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.046);
  tone.connect(gain).connect(audio.destination);
  scheduled.add(tone);
  tone.onended = () => {
    scheduled.delete(tone);
    tone.disconnect();
    gain.disconnect();
  };
  tone.start(when);
  tone.stop(when + 0.05);
}

function finish() {
  stopClock();
  showScreen('complete');
  $('result').textContent = rhythm
    ? `${sequence.length} actions · ${bpm} BPM · ${beats} ${beats === 1 ? 'beat' : 'beats'} per action`
    : `${sequence.length} actions · self-paced`;
  $('replay').focus();
}

function tick() {
  const now = performance.now();
  const period = 60000 / bpm;
  const elapsed = (now - epoch) / period;
  const tickNumber = Math.floor(elapsed);
  const total = 4 + (sequence.length - startIndex) * beats;
  if (tickNumber >= total) { finish(); return; }
  // Schedule against a fixed epoch so rendering delays don't accumulate.
  if (audible) {
    nextClick = Math.max(nextClick, tickNumber);
    while (nextClick < total && epoch + nextClick * period <= now + 140) {
      const delay = epoch + nextClick * period - now;
      if (delay >= -20) {
        playClick(audio.currentTime + Math.max(0, delay) / 1000,
          nextClick === 0 || (nextClick >= 4 && (nextClick - 4) % beats === 0));
      }
      nextClick++;
    }
  }
  if (tickNumber >= 0 && tickNumber !== lastTick) {
    lastTick = tickNumber;
    if (tickNumber < 4) {
      $('hint').textContent = `Count in · ${4 - tickNumber}`;
      pulse(4, tickNumber);
    } else {
      const actionIndex = startIndex + Math.floor((tickNumber - 4) / beats);
      if (index !== actionIndex) { index = actionIndex; renderCues(); }
      pulse(beats, (tickNumber - 4) % beats);
      $('hint').textContent = $('sound').checked && !audible ? 'Visual beat · click unavailable' : 'Space to pause';
    }
  }
  frame = requestAnimationFrame(tick);
}

async function beginClock() {
  stopClock();
  const version = clockVersion;
  paused = false;
  audible = false;
  $('pause').textContent = 'Pause';
  $('hint').textContent = 'Get ready';
  pulse(4, -1);
  if ($('sound').checked) {
    try {
      audio ??= new AudioContext();
      await audio.resume();
      if (version !== clockVersion) return;
      audible = audio.state === 'running';
    } catch { audible = false; }
  }
  if (version !== clockVersion) return;
  startIndex = index;
  epoch = performance.now() + 80;
  nextClick = 0;
  lastTick = null;
  tick();
}

function pause() {
  stopClock();
  paused = true;
  $('pause').textContent = 'Resume';
  $('hint').textContent = 'Paused · Space to resume';
  pulse(beats, -1);
}

function start() {
  if (!form.reportValidity() || !draw()) return;
  rhythm = form.elements.pace.value === 'rhythm';
  bpm = $('tempo').valueAsNumber;
  beats = Number($('beats').value);
  index = 0;
  paused = false;
  showScreen('practice');
  $('back').hidden = $('advance').hidden = rhythm;
  $('pulses').hidden = !rhythm;
  $('progress').max = sequence.length;
  $('speed').textContent = rhythm ? `${bpm} BPM · ${beats} ${beats === 1 ? 'beat' : 'beats'} per action` : 'Self-paced';
  renderCues();
  if (rhythm) {
    $('pause').focus();
    beginClock();
  } else {
    $('hint').textContent = 'Arrow keys to move through the sequence';
    $('advance').focus();
  }
}

function step(delta) {
  if (index + delta >= sequence.length) { finish(); return; }
  index = Math.max(0, index + delta);
  renderCues();
}

function setup() {
  stopClock();
  showScreen('setup');
  form.querySelector('[type="submit"]').focus({preventScroll: true});
}

form.addEventListener('input', event => {
  if (event.target.id === 'length' && $('length').validity.valid) draw();
  refreshSettings();
});
form.addEventListener('change', event => {
  if (event.target.name === 'format') moreRows(true);
  refreshSettings();
});
form.addEventListener('submit', event => { event.preventDefault(); start(); });
$('draw').onclick = () => draw(true);
$('more').onclick = () => moreRows();
$('pause').onclick = () => paused ? beginClock() : pause();
$('back').onclick = () => step(-1);
$('advance').onclick = () => step(1);
$('end').onclick = setup;
$('edit').onclick = setup;
$('fresh').onclick = () => { draw(true); setup(); };
$('replay').onclick = start;
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'practice' && rhythm && !paused) pause();
});
document.addEventListener('keydown', event => {
  if (screen !== 'practice' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (rhythm && event.code === 'Space' && (!event.target.closest('button') || event.target === $('pause'))) {
    event.preventDefault();
    if (!event.repeat) $('pause').click();
  } else if (!rhythm && ['ArrowRight', 'ArrowLeft'].includes(event.key)) {
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  }
});

refreshSettings();
moreRows(true);
