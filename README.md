# Грамматика

Russian grammar practice in the browser. Each question has two steps: pick the rule (which verb, which case, which form type), then the right form. Every answer gets a short verdict and a box with the full explanation: the rule, the signal words in the sentence, why the other options don't fit, and the full table of forms.

Live site: https://vertoleti.github.io/grammar-app/

## Exercises (metro lines)

| Line | Folder | Sentences | Topics |
|---|---|---|---|
| 1 Глаголы движения | `verbs-of-motion/` | 154 | идти/ходить, ехать/ездить, бежать/лететь/плыть, нести/везти/вести, prefixes, prefixed aspect |
| 2 Падежи | `cases/` | 85 | prepositional, accusative, genitive, dative, instrumental, pronouns, adjective + noun, plural |
| 3 Вид глагола | `aspect/` | 49 | aspect in the past and future, imperative, irregular verbs |
| 4 Числа | `numbers/` | 48 | counting, age, time, money, много/мало/сколько |
| 5 Продвинутый уровень | `advanced/` | 43 | participles, verbal adverbs, -ся verbs, бы and чтобы |

Every exercise has: topic filters, a "My mistakes" review list, choose or type the form, and 5 / 10 / 20 / 30 / all questions per round. Progress is saved in the browser.

## How it is built

Plain static files, no build step. Lines 2–5 share `shared/engine.js` and `shared/engine.css`; each has an `index.html` (header and cheat sheet) and a `data.js` with its sentences, rules and explanations. Line 1 is a self-contained page that generates every verb form from rules. `manifest.webmanifest` makes the site installable and `sw.js` keeps it working offline.

### Adding sentences

Each `data.js` has a `DATA` block with one sentence per line; the comment at the top of the file explains the fields. Add a line, then bump `VERSION` in `sw.js` so installed copies update.

### Adding an exercise

Copy one of the exercise folders, rewrite its `data.js` and cheat sheet, add it to the `EX` list in the home page `index.html`, add its files to `SHELL` in `sw.js`, and bump `VERSION`.
