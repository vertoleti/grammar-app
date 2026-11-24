# Грамматика

Russian grammar practice in the browser. Every answer comes with a short verdict and a box with the full explanation.

Live site: https://vertoleti.github.io/grammar-app/

## Exercises

- **Глаголы движения** (`verbs-of-motion/`): pick the right verb of motion, then the right form. 154 sentences in six topics (идти/ходить, ехать/ездить, бежать/лететь/плыть, нести/везти/вести, prefixes, prefixed aspect), plus a "My mistakes" review list.

## How it is built

Plain static files, no build step. Each exercise is one self-contained `index.html` in its own folder. The home page lists them, `manifest.webmanifest` makes the site installable, and `sw.js` keeps it working offline.

To add an exercise: create a new folder with its `index.html`, add an entry to the `EX` list in the home page `index.html`, add the folder to `SHELL` in `sw.js`, and bump `VERSION` there.
