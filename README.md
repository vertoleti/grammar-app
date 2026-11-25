# Грамматика

Russian grammar and vocabulary practice in the browser, sorted by CEFR level (A1–C2). Each grammar question has two steps: pick the rule (which verb, which case, which form type), then the right form. Every answer gets a short verdict and a box with the full explanation: the rule, the signal words in the sentence, why the other options don't fit, and the full table of forms.

Live site: https://vertoleti.github.io/grammar-app/

## Exercises (metro lines)

| Line | Folder | Sentences | Topics |
|---|---|---|---|
| 1 Глаголы движения | `verbs-of-motion/` | 154 | идти/ходить, ехать/ездить, бежать/лететь/плыть, нести/везти/вести, prefixes, prefixed aspect |
| 2 Падежи | `cases/` | 85 | prepositional, accusative, genitive, dative, instrumental, pronouns, adjective + noun, plural |
| 3 Вид глагола | `aspect/` | 49 | aspect in the past and future, imperative, irregular verbs |
| 4 Числа | `numbers/` | 48 | counting, age, time, money, много/мало/сколько |
| 5 Продвинутый уровень | `advanced/` | 43 | participles, verbal adverbs, -ся verbs, бы and чтобы |
| 6 Словарь | `vocabulary/` | 448 words | Anki-style flashcards, A1–C2, by theme |

### CEFR levels

Every task and every word has a level. Grammar topics are levelled in each `data.js` (`LEVELS`), verbs of motion in its page (`TLV`). The home page has a level picker; exercises and flashcards open at the chosen level. Level names follow the Russian test system: A1 Элементарный (ТЭУ), A2 Базовый (ТБУ), B1 Первый (ТРКИ-1), B2 Второй (ТРКИ-2), C1 Третий (ТРКИ-3), C2 Четвёртый (ТРКИ-4).

| Level | Grammar tasks | Words |
|---|---|---|
| A1 | 53 | 88 |
| A2 | 130 | 181 |
| B1 | 143 | 83 |
| B2 | 53 | 58 |
| C1 | – | 26 |
| C2 | – | 12 |

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

Plain static files, no build step. `shared/levels.js` holds the CEFR names and `shared/progress.js` the progress storage; every page loads both. Lines 2–5 share `shared/engine.js` and `shared/engine.css`; each has an `index.html` (header and cheat sheet) and a `data.js` with its sentences, rules and explanations. Line 1 is a self-contained page that generates every verb form from rules. `manifest.webmanifest` makes the site installable and `sw.js` keeps it working offline.

### Adding sentences

Each `data.js` has a `DATA` block with one sentence per line; the comment at the top of the file explains the fields. Add a line, then bump `VERSION` in `sw.js` so installed copies update.

### Adding an exercise

Copy one of the exercise folders, rewrite its `data.js` and cheat sheet, add it to the `EX` list in the home page `index.html`, add its files to `SHELL` in `sw.js`, and bump `VERSION`.
