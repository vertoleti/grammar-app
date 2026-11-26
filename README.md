# Грамматика

Russian grammar and vocabulary practice in the browser, sorted by CEFR level (A1–C2). Each grammar question has two steps: pick the rule (which verb, which case, which form type), then the right form. Every answer gets a short verdict and a box with the full explanation: the rule, the signal words in the sentence, why the other options don't fit, and the full table of forms.

Live site: https://vertoleti.github.io/grammar-app/

## Exercises (metro lines)

| Line | Folder | Sentences | Topics |
|---|---|---|---|
| 1 Глаголы движения | `verbs-of-motion/` | 194 | идти/ходить, ехать/ездить, бежать/лететь/плыть, нести/везти/вести, prefixes, prefixed aspect |
| 2 Падежи | `cases/` | 133 | prepositional, accusative, genitive, dative, instrumental, pronouns, adjective + noun, plural |
| 3 Вид глагола | `aspect/` | 79 | aspect in the past and future, imperative, irregular verbs |
| 4 Числа | `numbers/` | 78 | counting, age, time, money, много/мало/сколько |
| 5 Продвинутый уровень | `advanced/` | 75 | participles, verbal adverbs, -ся verbs, бы and чтобы |
| 6 Словарь | `vocabulary/` | 448 words | Anki-style flashcards, A1–C2, by theme |
| 7 Предлоги | `prep/` | 43 | where, where to, where from, у/к/от, time, other prepositions |
| 8 Сравнение и краткие формы | `compare/` | 35 | comparatives, superlatives, short adjectives, adjective or adverb |

### CEFR levels

Every task and every word has a level. Grammar topics are levelled in each `data.js` (`LEVELS`), verbs of motion in its page (`TLV`). The home page has a level picker; exercises and flashcards open at the chosen level. Level names follow the Russian test system: A1 Элементарный (ТЭУ), A2 Базовый (ТБУ), B1 Первый (ТРКИ-1), B2 Второй (ТРКИ-2), C1 Третий (ТРКИ-3), C2 Четвёртый (ТРКИ-4).

| Level | Grammar tasks | Words |
|---|---|---|
| A1 | see the home page | 88 |

### One step or two

By default every question is answered in one step: you pick or type the finished form, and the options mix the typical mistakes (wrong case, wrong preposition, wrong verb, missing -ся). The Steps setting switches to two steps (first the rule, then the form). Verb aspect always uses two steps, because choosing the aspect is the point of that exercise.

### The coach

`shared/coach.js` keeps the last 12 answers for every topic (`<exercise>-stats` in localStorage). A topic is *mastered* at 85 % or better over at least 8 answers, *good* at 65 %, otherwise *needs work*.

- **Recommended rounds** (the default topic on every exercise page) skip mastered topics, weight weak and new ones, and add the next CEFR level once the current one is solid.
- After every round a report shows each topic's change and the next step.
- The home page estimates your grammar level (a level counts as reached when 70 % of its topics are good or mastered), suggests up to three next steps, and shows a skill map of every topic.
- The topic name and tense stay hidden until you have answered.

`shared/catalog.js` lists every line and topic for the home page. It is generated: run `node tools/build_catalog.js` after changing any `data.js`.

### Vocabulary (Словарь)

The flashcards read Anki text files directly, in the same 25-column `Vocab` format as the anki-decks repo:

- `vocabulary/decks/ru-core.tsv`: the 300 cards from anki-decks `decks/ru.tsv`, re-levelled from B1-for-everything to A1–B2 and tagged by theme. IDs are unchanged.
- `vocabulary/decks/ru-levels.tsv`: 148 new cards for A1, A2, B2, C1 and C2 (IDs `ru-wrd-1001`+, `ru-phr-1001`+).

Both files import straight into Anki. Scheduling follows Anki's defaults: learning steps 1 and 10 minutes, graduating interval 1 day, easy 4 days, starting ease 250 %, Again/Hard/Good/Easy. Cards can be studied RU → EN, EN → RU or both, and you can import your own Anki exports on the page.

### Progress

Everything is stored in the browser (localStorage), and `shared/progress.js` adds:

- a backup file you can download and restore on any device (newest data wins when merging);
- optional sync through a private GitHub Gist, using a fine-grained token with only the Gists permission; it is stored only in the browser that uses it;
- a request for persistent storage so the browser doesn't clear the data.

Every exercise has: topic filters, a "My mistakes" review list, choose or type the form, and 5 / 10 / 20 / 30 / all questions per round. Progress is saved in the browser.

## How it is built

Plain static files, no build step. `shared/ui.css` and `shared/ui.js` turn each page's settings into a bottom sheet on phones and a sidebar on computers. `shared/levels.js` holds the CEFR names and `shared/progress.js` the progress storage; every page loads both. Lines 2–5 share `shared/engine.js` and `shared/engine.css`; each has an `index.html` (header and cheat sheet) and a `data.js` with its sentences, rules and explanations. Line 1 is a self-contained page that generates every verb form from rules. `manifest.webmanifest` makes the site installable and `sw.js` keeps it working offline.

### Tools

- `node tools/validate.js` checks every exercise's data; `node tools/check_vom.js` checks verbs of motion.
- `python3 tools/build_pages.py` regenerates the exercise pages; `python3 tools/build_vom.py` builds `verbs-of-motion/index.html` from `tools/verbs-of-motion.src.html`.
- `node tools/build_catalog.js` regenerates the home page catalog.
- `tools/test_rounds.py` and `tools/test_coach.py` are browser tests (Playwright) against a local server on port 8765.

### Adding sentences

Each `data.js` has a `DATA` block with one sentence per line; the comment at the top of the file explains the fields. Add a line, run `node tools/build_catalog.js`, then bump `VERSION` in `sw.js` so installed copies update.

### Adding an exercise

Copy one of the exercise folders, rewrite its `data.js` and cheat sheet, add it to the `EX` list in the home page `index.html`, add its files to `SHELL` in `sw.js`, and bump `VERSION`.
