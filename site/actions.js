// A family only combines values that make sense together. Both representations
// use the same sampled values, including every location, direction and count.
const pick = values => values[Math.floor(Math.random() * values.length)];
const words = value => value.split('|');
const colors = words('amber|blue|green|red|violet|white|yellow|silver');
const shapes = words('ring|disk|square|crescent|triangle|star');
const tones = words('bell|whistle|hum|flute|chime|buzz');
const sides = words('to your left|to your right|behind you|overhead|far ahead');
const materials = words('felt|velvet|bark|cork|silk|linen|sandpaper');
const fingers = words('thumb|index finger|middle finger|little finger');
const scents = words('orange peel|fresh mint|crushed pine needles|cinnamon|coffee|lemon zest|fresh basil|vanilla|wet soil|lavender');
const tastes = words('lemon juice|honey|sea salt|cocoa|lime|maple syrup|espresso|grapefruit');
const limbs = words('left elbow|right toe|left heel|right knee|left wrist|right shoulder');
const directions = words('left|right|forward|backward');
const rates = words('slowly|quickly');
const counts = words('two|three|four');

function family(slots, render) {
  return () => render(...slots.map(pick));
}

const domains = {
  sight: [
    family([shapes, colors, words('ivory|black|pink|gold')], (s, c, t) => [`Let a ${s} change from ${c} to ${t}.`, `recolor(${s}, ${c} → ${t})`]),
    family([colors, shapes], (c, s) => [`Picture a ${s} in ${c}.`, `see(${c} ${s})`]),
    family([colors, shapes], (c, s) => [`Watch a ${s} in ${c} shrink to a point.`, `shrink(${c} ${s} → point)`]),
    family([shapes, words('clockwise|counterclockwise'), words('quarter|half')], (s, d, t) => [`Rotate a ${s} a ${t} turn ${d}.`, `rotate(${s}, ${t} turn, ${d})`]),
    family([colors, words('left|right|top|bottom')], (c, d) => [`Picture a dot in ${c} at the ${d} edge of a page.`, `place(${c} dot @ ${d} edge of page)`]),
    family([words('a blurred letter|a hazy skyline|a fuzzy outline')], s => [`Bring ${s} into sharp focus.`, `sharpen(${s})`])
  ],
  sound: [
    family([tones, sides, rates], (s, d, r) => [`Hear a ${s} ${d} drifting away ${r}.`, `recede(${s} @ ${d}, ${r})`]),
    family([tones, sides], (s, d) => [`Hear a ${s} ${d}.`, `hear(${s} @ ${d})`]),
    family([tones], s => [`Hear a ${s} fade to silence.`, `fade(${s} → silence)`]),
    family([counts, words('knocks|taps|water drops|footsteps|clicks')], (n, s) => [`Hear ${n} evenly spaced ${s}.`, `repeat(${s} ×${n}, even)`]),
    family([tones, words('rise|fall')], (s, d) => [`Hear the pitch of a ${s} ${d}.`, `pitch(${s}, ${d})`]),
    family([words('low|high|muffled|sharp'), words('knock|click|pop|tap')], (p, s) => [`Hear a single ${p} ${s}.`, `hear(${p} ${s} ×1)`])
  ],
  touch: [
    family([words('light|firm'), materials, words('wrist|cheek|forearm|palm')], (p, m, l) => [`Feel the ${p} pressure of ${m} against your ${l}.`, `press(${m} @ ${l}, ${p})`]),
    family([materials, fingers], (m, f) => [`Feel ${m} under your ${f}.`, `feel(${m} @ ${f})`]),
    family([words('warm|cool|cold'), words('coin|pebble|key|marble')], (t, s) => [`Feel a ${t} ${s} in your palm.`, `feel(${t} ${s} @ palm)`]),
    family([fingers, materials], (f, m) => [`Imagine sliding your ${f} from glass onto ${m}.`, `slide(${f}, glass → ${m})`]),
    family([words('wrist|forearm|cheek|palm'), counts], (s, n) => [`Feel ${n} light taps on your ${s}.`, `feel(light tap ×${n} @ ${s})`])
  ],
  smell: [
    family([scents, words('soap|fresh bread|woodsmoke|warm butter')], (s, t) => [`Pick out the scent of ${s} beneath the smell of ${t}.`, `isolate(${s} beneath ${t})`]),
    family([scents], s => [`Imagine the scent of ${s}.`, `evoke(${s})`]),
    family([scents], s => [`Let the scent of ${s} fade.`, `fade(${s})`]),
    family([scents], s => [`Imagine the smell of ${s} growing stronger.`, `intensify(${s})`]),
    family([words('a lemon|an orange|a grapefruit'), words('cut|peeled')], (s, v) => [`Imagine the first whiff as ${s} is ${v}.`, `smell(${s}, freshly ${v})`])
  ],
  taste: [
    family([tastes, words('strong|faint'), words('mint|ginger|cinnamon')], (s, p, t) => [`Taste ${s} with a ${p} hint of ${t}.`, `combine(${s}, ${p} ${t})`]),
    family([tastes], s => [`Imagine the taste of ${s}.`, `taste(${s})`]),
    family([tastes], s => [`Let the taste of ${s} weaken.`, `fade(${s})`]),
    family([words('lemon juice|grapefruit|lime'), words('faint|strong')], (s, p) => [`Imagine the ${p} sourness of ${s}.`, `taste(${s}, ${p} sourness)`]),
    family([words('honey|caramel|maple syrup'), words('tip|center')], (s, p) => [`Imagine tasting ${s} at the ${p} of your tongue.`, `taste(${s} @ tongue ${p})`])
  ],
  move: [
    family([limbs, words('spiral|zigzag|loop'), words('tiny|wide')], (l, p, size) => [`Trace a ${size} ${p} in your mind with your ${l}.`, `trace(${size} ${p}, ${l})`]),
    family([limbs, words('circle|figure eight|zigzag|spiral'), rates], (l, p, r) => [`Imagine tracing a ${p} ${r} with your ${l}.`, `trace(${p}, ${l}, ${r})`]),
    family([limbs, directions], (l, d) => [`Imagine moving your ${l} slightly ${d}.`, `move(${l}, ${d})`]),
    family([words('left hand|right hand'), counts], (l, n) => [`Imagine opening your ${l} ${n} times.`, `open(${l} ×${n})`]),
    family([words('left foot|right foot'), rates], (l, r) => [`Imagine tapping your ${l} ${r}.`, `tap(${l}, ${r})`])
  ],
  position: [
    family([words('above|below|beside'), words('left knee|right knee|left ankle|right ankle'), words('left|right')], (p, anchor, d) => [`Imagine your ${d} hand hovering just ${p} your ${anchor}.`, `place(${d} hand ${p} ${anchor})`]),
    family([words('left|right'), words('chin|nose|ear|forehead')], (d, p) => [`Sense your imagined ${d} hand just below your ${p}.`, `place(${d} hand below ${p})`]),
    family([words('left|right'), words('straight ahead|upward|out to the side')], (d, p) => [`Imagine your ${d} arm pointing ${p}.`, `hold(${d} arm, ${p})`]),
    family([words('wide|narrow'), words('left|right')], (s, d) => [`Sense a ${s} gap between your ${d} thumb and index finger.`, `hold(${s} gap, ${d} thumb/index)`]),
    family([words('left|right'), words('inward|outward')], (d, p) => [`Sense your imagined ${d} foot angled ${p}.`, `angle(${d} foot, ${p})`])
  ],
  balance: [
    family([words('raft|boat|floating dock'), directions, rates], (s, d, r) => [`Feel a ${s} tipping ${d} ${r} beneath you.`, `tilt(${s}, ${d}, ${r})`]),
    family([directions], d => [`Imagine leaning ${d} on a gently tilting deck.`, `lean(${d}, tilting deck)`]),
    family([words('left|right'), rates], (d, r) => [`Imagine shifting your weight ${r} onto your ${d} foot.`, `shift(weight → ${d} foot, ${r})`]),
    family([words('rising|descending'), words('lift|platform')], (d, s) => [`Feel the motion of a ${d} ${s} beneath you.`, `sense(${s}, ${d})`]),
    family([words('left|right'), words('train|bus|tram')], (d, s) => [`Imagine the tilt as a ${s} curves ${d}.`, `tilt(${s} turning ${d})`])
  ]
};

const domainNames = Object.keys(domains);

export function generateSequence(length) {
  if (!Number.isInteger(length) || length < 1 || length > 10000) {
    throw new RangeError('Choose a whole number from 1 to 10,000.');
  }
  return Array.from({ length }, () => {
    const domain = pick(domainNames);
    const [words, action] = pick(domains[domain])();
    return { words, notation: `${domain} · ${action}` };
  });
}
