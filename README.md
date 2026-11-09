# Action sequences

A browser-based practice sheet for independent mental actions across sight, sound, touch, smell, taste, movement, position, and balance.

[Open the practice app](https://danysdragons.github.io/random-action-sequences/)

Choose a sequence length (1–10,000), Words or Notation, and a pace. Rhythm mode starts with four count-in beats and advances at the selected tempo. Space pauses or resumes a rhythmic run. In self-paced mode, use the arrow keys or the onscreen controls. Replay repeats the same draw. Practice settings let you change the pace before replaying. The sequence lives in the current tab until you change its length, draw again, or reload.

## Local preview

Run `python3 -m http.server 8000 --directory site` and open <http://localhost:8000>. The app uses static HTML, CSS, JavaScript modules, and locally hosted fonts. No build or API key is required.

## Publishing

GitHub Pages uses GitHub Actions as its source. The workflow in `.github/workflows/pages.yml` publishes the contents of `site/` on every push to `main`. The `github-pages` deployment environment allows the `main` branch. Relative asset paths support the repository's Pages URL. Design reference images and generation prompts live under `output/imagegen/`.
