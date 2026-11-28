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

### Government (C1–C2)

`gov/` (line 11) practises the cases governed by verbs (бояться + genitive, завидовать + dative, руководить + instrumental, зависеть от, участвовать в…) and by formal and bookish prepositions (благодаря, согласно, в течение, в связи с, во избежание, по истечении, в ущерб…), B2 to C2. Same two-step format as Cases.

### Word lookup

`shared/lookup.js` runs on every exercise page: tap a Russian word to see it in the flashcard decks and add it to your flashcards with one tap. Inflected forms are matched to the closest dictionary form, so those results are suggestions. A word that isn't in the decks can be added as your own card with an English meaning; the sentence becomes its example. Added cards show up in the flashcards whatever the level filter.

### Sentences and Tables

`sentences/` practises whole sentences in four ways: translate from English (checked word by word; another word order counts as right; a one-letter slip in a long word is accepted and shown; “My answer was right too” overrides the check), put the words in order, dictation (needs a Russian voice in the browser), and find the mistake (exactly one wrong word per sentence). Data: `sentences/data.js`.

`tables/` asks you to fill in conjugation tables (present or future, past), noun declension tables (singular and plural) and the personal pronoun table, with a few gaps, half or the whole table. Data: `tables/data.js`.

Both lines record progress per exercise type with the coach, and wrong answers come back after 1, 3, 7 and 21 days. They are not part of the grammar level estimate.

### Daily mix and placement test

`mix/` is one short daily session across every grammar line: mistakes that are due again come first, then one recommended question per line, lines with the most left to learn first. `placement/` asks four questions at each level from A1 to B2; passing a level takes 3 of 4. Accepting the result sets your level one above the highest level passed and marks the topics up to it as known. Both are built from all the lines' `data.js` files by `shared/multi.js`, and `tools/build_pages.py` generates their pages.

## Home page

`index.html` (Russian) and `de/index.html` (German) are built by `python3 tools/build_hub.py` from one template; behaviour in `shared/hub.js`, styles in `shared/hub.css`. Five tabs (a bottom bar on phones, a top bar on wider screens):

- **Today**: *Continue where you left off* first (the last exercise, text or situation you opened, saved as `gr-last` / `de-last` by `shared/progress.js`), then today's goal and streak, then up to three next steps.
- **Grammar**: level picker, the grammar guide, the grammar lines by area, whole sentences and tables.
- **Words**: flashcards, the dictionary, der · die · das.
- **Reading**: the next text at your level, all texts, the phrasebook.
- **Progress**: level, streak and totals, weekly review, charts, mock exam, placement test, skill map, settings.

**Dictionary** (`dictionary/`, `de/dictionary/`, `shared/dictionary.js`): every word in the decks plus your own, searchable in either language (accents, ё and umlauts ignored), filtered by status (learning, known, not started, mine) and level. Tap a word for forms, an example and audio; *Learn this word* adds it to the flashcards. You can add your own words here too.

## Reading, phrasebooks, exam, review (both languages)

- **Reading** (`reading/`, `de/reading/`): 10 graded texts per language (A1–C1, `texts.js`) with translations and questions. **Import a text** (paste or a .txt file) to read your own; saved in the browser and synced. Tap any word to look it up and add it to that language's flashcards (with der/die/das for German nouns). ▶ Listen reads sentence by sentence; 🎤 Speaking practice checks each sentence with speech recognition (iPhone: Safari with Siri & Dictation on).
- **Phrasebooks** (`phrases/`, `de/phrases/`): 8 situations (doctor, renting, phone, work emails, restaurant, shopping and returns, public office, transport). Each has 10 phrases (listen, say, save as a flashcard), a dialogue with role-play (your lines hidden, the dialogue pauses for you), and an 8-question drill.
- **Mock exam** (`exam/`, `de/exam/`): ТРКИ / Goethe-Zertifikat style, A1–C1, timed. Grammar (15 gap items from the lines), vocabulary (10 from the decks), reading (2 texts), listening (8 recordings, two plays each). Marked when handed in; passing needs 66 % (ТРКИ) or 60 % (Goethe) in every part. History in `gr-exams` / `de-exams`.
- **der · die · das** (`de/genus/`): 275 nouns with ending-rule hints and a Leitner box.
- **Weekly review** (`review/`, `de/review/`): this week against last, what improved, what is due, a plan.
- **Dark mode**: Settings → Appearance (Auto, Light, Dark), on the home page and the profile.

Pages built by `python3 tools/build_extra.py`. Tests: `tools/test_reading.py`, `tools/test_phrases.py`, `tools/test_exam.py`, `tools/test_extra.py`.

## Grammar guides

`grammar/` (Russian) and `de/grammar/` (German) are full reference guides: about 11,600 and 9,400 words, 14 chapters each, with endings tables, examples and a search box. They are written as plain-text chapters in `guide/ru/*.txt` and `guide/de/*.txt` and built by `python3 tools/build_guide.py`, which also writes `shared/guide-map.js`. Each section can claim exercise topics with a line like `@for cases:gen`; after a wrong answer, **Rule** opens that section.

## Look and task screens

`shared/theme.css` (loaded last on every page) gives the app its calm style: one typeface (Inter), white cards, the line colour only as a small accent, a thin progress bar. Task screens show only the sentence and the choices; the translation appears after answering (or on tap, or always: Settings → Translation). A wrong answer shows the right answer and one specific reason, with links to the guide section and to the full details.

Build everything: `python3 tools/build_guide.py && python3 tools/build_pages.py && python3 tools/build_vom.py && python3 tools/build_de.py && python3 tools/build_extra.py && python3 tools/build_hub.py && node tools/build_catalog.js`.

## Deutsch · German

`de/` is a second, complete language side with the same system: CEFR levels, the coach, Daily mix, placement test, sentences, tables and flashcards. The home page has a Русский / Deutsch switch; the app remembers the choice and opens on that side.

Grammar lines (`de/*/data.js`, compact text tables read by `shared/lines.js`):

| Line | Levels | Topics |
|---|---|---|
| Verben & Zeiten | A1–B1 | present tense, modal verbs, Perfekt with haben or sein, participles, Präteritum |
| Fälle & Artikel | A1–B1 | nominative or accusative, dative, pronouns, genitive |
| Präpositionen | A2–B2 | accusative, dative and genitive prepositions, two-way prepositions |
| Adjektivendungen | A2–C1 | weak, mixed and strong endings, after quantifiers, adjectives as nouns |
| Satzbau & Konnektoren | A2–C1 | where the verb goes after weil, denn, deshalb, obwohl, als, wenn, damit, um … zu |
| Konjunktiv II & Passiv | B1–C1 | würde, hätte, wäre, könnte; passive tenses, Zustandspassiv, modal passive |
| Fortgeschritten | B2–C2 | verbs with prepositions, n-declension, formal prepositions, Konjunktiv I, participle attributes |

Plus Sätze (translate, word order, dictation, find the mistake; German word order must be correct), Tabellen (present, past, articles, adjective endings, pronouns), and Wortschatz (424 cards A1–C2 in `de/vocabulary/decks/de-core.tsv`, same Anki columns). Typing accepts ss for ß and ae, oe, ue for umlauts.

Progress for German uses keys starting with `de-` and is saved and synced with everything else. The daily goal and streak count both languages.

Build: `python3 tools/build_pages.py && python3 tools/build_de.py && node tools/build_catalog.js`. Check: `node tools/validate_de.js`, `python3 tools/test_de.py`.

### Account and login

`shared/account.js` adds sign-in with a 6-digit email code (Supabase Auth) and saves all progress to the signed-in account automatically. A code is used instead of a magic link because links open in Safari, not in the home-screen app on iPhone. To switch it on:

1. Create a free project at supabase.com.
2. In the SQL editor, run `tools/supabase.sql` (creates the `progress` table with row-level security).
3. Authentication → Email Templates → Magic Link: make the email show the code, for example `Your code: {{ .Token }}`.
4. Project Settings → API: copy the Project URL and the anon public key into `shared/config.js`.

The profile page (`profile/`) has the login, your name, target level, daily goal, streak, a practice calendar and charts of answers, accuracy and level over time.

### Export to Anki

Словарь → Export to Anki downloads the words you have practised (all, only hard ones, or only the ones you added) as a TSV in the same `Vocab` note type and columns as the anki-decks repo, tagged `grammar-app` plus `learned`, `learning` or `hard`. The id column is the Anki GUID, so re-importing updates cards instead of duplicating them. Example sentences on the flashcards have their own Listen button.

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
