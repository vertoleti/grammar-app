# Builds every German page under de/ from the same templates as the Russian side.
# Run from the repo root after tools/build_pages.py:  python3 tools/build_de.py
import os, re
src = open('tools/build_pages.py').read()
T = re.search(r"T='''(.*?)'''", src, re.S).group(1)
exec(re.search(r"(def tbl\(head,rows\):.*?return [^\n]*\n)", src, re.S).group(1))

HEAD = '<script>window.GR_LANG=\'de\'</script>\n<script src="../../shared/lang.js"></script>\n'
SWAP = [
  ('"../shared/', '"../../shared/'), ('"../icons/', '"../../icons/'), ('"../manifest.webmanifest"', '"../../manifest.webmanifest"'),
  ('<script src="../../shared/lang.js"></script>\n', ''),
  ('<script src="../../shared/progress.js"></script>\n', '<script src="../../shared/progress.js"></script>\n' + HEAD),
  ('<h3>Level · Уровень</h3>', '<h3>Level · Niveau</h3>'), ('<h3>Topic · Тема</h3>', '<h3>Topic · Thema</h3>'),
  ('<h3>Answer by · Как отвечать</h3>', '<h3>Answer by · Antworten</h3>'), ('<h3>Steps · Шаги</h3>', '<h3>Steps · Schritte</h3>'),
  ('<h3>Questions per round · Вопросов в раунде</h3>', '<h3>Questions per round · Fragen pro Runde</h3>'),
  ('<a href="../#progress">Back it up or sync it between devices · Сохранить прогресс</a>', '<a href="../../profile/">Sign in to keep it on every device · Profil</a>'),
  (' Tap any Russian word to look it up.', ' Tap any German word to look it up.'),
  ('Quick reference <a href="../grammar/">Full grammar guide →</a>', 'Spickzettel · Quick reference <a href="../grammar/">Grammatik · Full guide →</a>'),
  ('<p class="home"><a href="../">← All exercises</a> · <a href="../grammar/">Grammar guide</a></p>', '<p class="home"><a href="../">← Alle Übungen · All exercises</a> · <a href="../grammar/">Grammatik · Guide</a></p>'),
  ('<h3>Translation · Перевод</h3>', '<h3>Translation · Übersetzung</h3>'),
]
def de(h):
    for a, b in SWAP: h = h.replace(a, b)
    return h

def page(slug, v):
    h = de(T.format(**v)).replace('<script src="data.js"></script>', '<script src="../../shared/lines.js"></script>\n<script src="data.js"></script>')
    os.makedirs(f'de/{slug}', exist_ok=True); open(f'de/{slug}/index.html', 'w').write(h)

C2 = lambda a, b: f'<div class="cols"><div>{a}</div><div>{b}</div></div>'
pages = {
 'cases': dict(num='2', color='#1f8a3b', title='Fälle & Artikel', en='Cases and articles', sub='pick the case, then the form', desc='German cases: nominative, accusative, dative and genitive, with articles and pronouns.',
  cheat=C2('<h3>The articles</h3>' + tbl(['', 'm', 'f', 'n', 'pl'], [['Nom', 'der / ein', 'die / eine', 'das / ein', 'die / –'], ['Akk', '<b>den / einen</b>', 'die / eine', 'das / ein', 'die / –'], ['Dat', 'dem / einem', 'der / einer', 'dem / einem', 'den …-n'], ['Gen', 'des …-s', 'der / einer', 'des …-s', 'der']]),
   '<h3>How to find the case</h3>' + tbl(['Case', 'Question', 'Typical triggers'], [['Nominativ', 'wer? was?', 'the subject; after sein, werden, heißen'], ['Akkusativ', 'wen? was?', 'direct object; es gibt; durch, für, gegen, ohne, um'], ['Dativ', 'wem?', 'receiver; helfen, danken, gefallen, gehören; aus, bei, mit, nach, seit, von, zu'], ['Genitiv', 'wessen?', 'owner; wegen, trotz, während, statt']]) + '<p class="note">Only the masculine changes in the accusative: der → den. The dative plural adds -n to the noun: den Kindern.</p>')),
 'adj': dict(num='4', color='#c2185b', title='Adjektivendungen', en='Adjective endings', sub='pick the declension, then the ending', desc='German adjective endings after der, after ein and with no article.',
  cheat=C2('<h3>After der, die, das (weak)</h3>' + tbl(['', 'm', 'f', 'n', 'pl'], [['Nom', '-e', '-e', '-e', '-en'], ['Akk', '-en', '-e', '-e', '-en'], ['Dat', '-en', '-en', '-en', '-en'], ['Gen', '-en', '-en', '-en', '-en']]) + '<h3>After ein, kein, mein (mixed)</h3>' + tbl(['', 'm', 'f', 'n', 'pl'], [['Nom', '<b>-er</b>', '-e', '<b>-es</b>', '-en'], ['Akk', '-en', '-e', '<b>-es</b>', '-en'], ['Dat', '-en', '-en', '-en', '-en'], ['Gen', '-en', '-en', '-en', '-en']]),
   '<h3>No article (strong)</h3>' + tbl(['', 'm', 'f', 'n', 'pl'], [['Nom', '-er', '-e', '-es', '-e'], ['Akk', '-en', '-e', '-es', '-e'], ['Dat', '-em', '-er', '-em', '-en'], ['Gen', '-en', '-er', '-en', '-er']]) + '<p class="note">The idea: somebody has to show the case and gender. If the article does it, the adjective takes -e or -en. If there is no article, or ein has no ending, the adjective does it.</p>')),
 'verbs': dict(num='1', color='#0a68b0', title='Verben & Zeiten', en='Verbs and tenses', sub='pick the pattern, then the form', desc='German verbs: present tense, modal verbs, Perfekt with haben or sein, participles and Präteritum.',
  cheat=C2('<h3>Present tense</h3>' + tbl(['', 'machen', 'fahren', 'sprechen', 'sein'], [['ich', 'mache', 'fahre', 'spreche', 'bin'], ['du', 'machst', '<b>fährst</b>', '<b>sprichst</b>', 'bist'], ['er/sie/es', 'macht', '<b>fährt</b>', '<b>spricht</b>', 'ist'], ['wir', 'machen', 'fahren', 'sprechen', 'sind'], ['ihr', 'macht', 'fahrt', 'sprecht', 'seid'], ['sie/Sie', 'machen', 'fahren', 'sprechen', 'sind']]),
   '<h3>Perfekt: haben or sein?</h3><p><b>sein</b>: movement from A to B (gehen, fahren, fliegen, kommen), change of state (aufwachen, einschlafen, sterben, werden), and sein, bleiben, passieren. <b>haben</b>: everything else, including all verbs with an accusative object and all reflexive verbs.</p><h3>Participle</h3>' + tbl(['Type', 'Pattern', 'Example'], [['weak', 'ge- … -t', 'gemacht'], ['strong', 'ge- … -en', 'gelesen, gegangen'], ['mixed', 'ge- … -t + vowel change', 'gebracht, gedacht'], ['-ieren, be-, ver-, er- …', 'no ge-', 'studiert, verstanden'], ['separable', 'prefix + ge + …', 'abgeholt, aufgestanden']]))),
 'prep': dict(num='3', color='#8d5b2d', title='Präpositionen', en='Prepositions', sub='pick the case, then the form', desc='German prepositions with the accusative, dative and genitive, and the two-way prepositions.',
  cheat=C2(tbl(['Case', 'Prepositions'], [['Akkusativ', 'durch, für, gegen, ohne, um'], ['Dativ', 'aus, außer, bei, gegenüber, mit, nach, seit, von, zu'], ['Genitiv', 'wegen, trotz, während, statt, innerhalb, außerhalb'], ['Akk or Dat', 'an, auf, hinter, in, neben, über, unter, vor, zwischen']]),
   '<h3>Two-way prepositions</h3>' + tbl(['Question', 'Case', 'Verbs'], [['wohin? (movement to a place)', 'Akkusativ', 'legen, stellen, setzen, hängen + object, gehen, fahren'], ['wo? (location)', 'Dativ', 'liegen, stehen, sitzen, hängen, sein, wohnen']]) + '<p class="note">Contractions: im, ins, am, ans, zum, zur, vom, beim.</p>')),
 'conn': dict(num='5', color='#c25e00', title='Satzbau & Konnektoren', en='Word order and connectors', sub='pick the type, then the word', desc='German connectors and the word order they need: weil, denn, deshalb, obwohl, als, wenn and more.',
  cheat=C2('<h3>Three word orders</h3>' + tbl(['Type', 'Words', 'Example'], [['position 0', 'und, aber, oder, denn, sondern', '…, <b>denn ich bin</b> krank.'], ['verb to the end', 'weil, dass, ob, obwohl, wenn, als, damit …', '…, <b>weil ich</b> krank <b>bin</b>.'], ['adverb in position 1', 'deshalb, trotzdem, dann, außerdem …', '…, <b>deshalb bleibe ich</b> zu Hause.']]),
   '<h3>Easily confused</h3>' + tbl(['', 'Use'], [['als', 'one event or period in the past'], ['wenn', 'repeated events; present and future; “if”'], ['wann', 'question word only'], ['dass', 'that (statements)'], ['ob', 'whether (yes/no questions)'], ['damit', 'so that, any subject'], ['um … zu', 'in order to, same subject']]))),
 'konj': dict(num='6', color='#7a2a8c', title='Konjunktiv II & Passiv', en='Subjunctive and passive', sub='pick the construction, then the form', desc='German Konjunktiv II (würde, hätte, wäre, könnte) and the passive with werden.',
  cheat=C2('<h3>Konjunktiv II</h3>' + tbl(['', 'Present', 'Past'], [['haben', 'hätte', 'hätte gehabt'], ['sein', 'wäre', 'wäre gewesen'], ['können', 'könnte', 'hätte … können'], ['most verbs', 'würde + infinitive', 'hätte/wäre + participle']]) + '<p class="note">Real possibility: indicative (Wenn ich Zeit habe, komme ich). Unreal: Konjunktiv II (Wenn ich Zeit hätte, würde ich kommen).</p>',
   '<h3>Passive</h3>' + tbl(['Tense', 'Form'], [['Präsens', 'wird gebaut'], ['Präteritum', 'wurde gebaut'], ['Perfekt', 'ist gebaut worden'], ['with a modal', 'muss gebaut werden'], ['state', 'ist gebaut (Zustandspassiv)']]))),
 'adv': dict(num='7', color='#9a7b00', title='Fortgeschritten', en='Advanced grammar', sub='B2 to C2', desc='Advanced German: verbs with prepositions, n-declension, formal prepositions, Konjunktiv I, participle attributes.',
  cheat=C2('<h3>Verbs with prepositions</h3>' + tbl(['Accusative', 'Dative'], [['warten auf, denken an', 'teilnehmen an, abhängen von'], ['sich freuen auf / über', 'Angst haben vor, träumen von'], ['sich interessieren für', 'bestehen aus'], ['sich gewöhnen an, sprechen über', 'zweifeln an']]) + '<h3>Konjunktiv I</h3>' + tbl(['', 'sein', 'haben', 'werden'], [['er/sie', 'sei', 'habe', 'werde'], ['sie (pl)', 'seien', 'hätten*', 'würden*']]) + '<p class="note">* where Konjunktiv I looks like the indicative, Konjunktiv II replaces it.</p>',
   '<h3>n-declension</h3><p>Masculine nouns for people and animals in -e (Kollege, Junge, Kunde), in -ent, -ant, -ist, -at (Student, Polizist), and Herr, Mensch, Nachbar: -(e)n everywhere except the nominative singular.</p><h3>Participles before a noun</h3>' + tbl(['Form', 'Meaning', 'Example'], [['Partizip I', 'active, ongoing', 'die steigenden Preise'], ['Partizip II', 'done, passive', 'das reparierte Auto'], ['zu + Partizip I', 'must or can be done', 'die zu lösende Aufgabe']]))),
}
for k, v in pages.items(): page(k, v)

# ---------- Täglicher Mix and Einstufungstest ----------
LINES = ['verbs', 'cases', 'prep', 'adj', 'conn', 'konj', 'adv']
def multi(slug, builder, color, title, en, sub, desc, about, hide):
    h = de(T.format(num='★', color=color, title=title, en=en, sub=sub, desc=desc, cheat=about))
    h = h.replace(' · <span id="count"></span> sentences', '<span id="count" hidden></span>')
    data = ''.join(f'<script src="../{l}/data.js"></script><script>ALL.push(EXERCISE)</script>\n' for l in LINES)
    h = h.replace('<script src="data.js"></script>\n<script src="../../shared/coach.js"></script>',
      '<script src="../../shared/catalog-de.js"></script>\n<script src="../../shared/coach.js"></script>\n<script src="../../shared/lines.js"></script>\n<script>window.ALL=[]</script>\n' + data +
      f'<script src="../../shared/multi.js"></script>\n<script>{builder}()</script>')
    if hide: h = h.replace('</style>', '#lvls,#topics,#sizes{display:none}.grp:has(#lvls),.grp:has(#topics),.grp:has(#sizes){display:none}</style>')
    os.makedirs(f'de/{slug}', exist_ok=True); open(f'de/{slug}/index.html', 'w').write(h)
multi('mix', 'buildMix', '#141414', 'Täglicher Mix', 'Daily mix', 'about 10 minutes of everything',
 'One short daily German session: grammar mistakes that are due, then the topics you most need, across every line.',
 '<h2>How the daily mix works</h2><div class="cols"><div><p>Each round starts with German grammar mistakes that are due again (they come back after 1, 3, 7 and 21 days). The rest is one recommended question from each line in turn, starting with the lines that have the most topics left to learn.</p></div><div><p>Your level filter applies here too. Answers count toward each line’s progress, your daily goal and your streak.</p></div></div>', False)
multi('placement', 'buildPlacement', '#3d3d3d', 'Einstufungstest', 'Placement test', '16 questions, A1 to B2',
 'Find your German grammar level in 16 questions.',
 '<h2>How the test works</h2><div class="cols"><div><p>Four questions at each level from A1 to B2, easiest first, from all the German grammar lines. You pass a level with 3 of 4 right; the test places you at the highest level you pass without a gap.</p></div><div><p>If you accept the result, your German level is set to the next one up, and topics at and below your level are marked as known. Your Russian progress isn’t touched.</p></div></div>', True)

# ---------- Sätze and Tabellen (shared scripts from sentences/ and tables/) ----------
def practice(slug, appdir, v, aside, keys):
    h = de(T.format(**v))
    h = re.sub(r'<aside class="ctrls" data-sheet>.*?</aside>', '<aside class="ctrls" data-sheet>' + aside + '</aside>', h, flags=re.S)
    h = h.replace('<script src="../../shared/engine.js"></script>', f'<script src="../../{appdir}/app.js"></script>')
    h = re.sub(r'<p class="keys">.*?</p>', '<p class="keys">' + keys + '</p>', h)
    os.makedirs(f'de/{slug}', exist_ok=True); open(f'de/{slug}/index.html', 'w').write(h)
LV = '<section class="grp" data-all="All levels" data-fmt="Level {v}"><h3>Level · Niveau</h3><div class="seg segctl" id="lvls" role="group" aria-label="Level"></div></section>'
NOTE = '<p class="note">Progress is saved in this browser. <a href="../../profile/">Sign in to keep it on every device · Profil</a></p>'
practice('saetze', 'sentences', dict(num='8', color='#3949ab', title='Sätze', en='Sentences', sub='translate, order, dictation, mistakes', desc='Whole-sentence German practice: translate, put words in order, write what you hear, find the mistake.',
  cheat=C2('<h3>How answers are checked</h3><p>Translations are checked word by word. In German, word order is grammar (the verb goes second, or to the end), so only correct orders count; common alternatives are accepted. Capital letters don’t matter for the check, and a one-letter slip in a long word counts as right. You can type ss for ß and ae, oe, ue for umlauts. If your translation is right but different from ours, tap <b>My answer was right too</b>.</p>',
   '<h3>Finding mistakes</h3><p>Every sentence has exactly one mistake: usually an ending (case, gender, person), sometimes word order (verb second, verb at the end), haben or sein, or a preposition. Check the verb position first, then what the verb or preposition needs.</p>')),
  LV + '<section class="grp" data-all="Recommended"><h3>Exercise · Übung</h3><div class="seg list" id="topics" role="group" aria-label="Exercise"></div></section><section class="grp" data-fmt="{v} per round"><h3>Questions per round · Fragen pro Runde</h3><div class="seg segctl" id="sizes" role="group" aria-label="Questions per round"></div></section>' + NOTE,
  'Keyboard: <kbd>Enter</kbd> to check and for the next station')
practice('tabellen', 'tables', dict(num='9', color='#5d7a00', title='Tabellen', en='Tables', sub='conjugation and declension', desc='Fill in German conjugation and declension tables: verbs, articles, adjective endings and pronouns.',
  cheat=C2('<h3>Verbs</h3><p>Present: vowel changes only in du and er/sie/es (fährst, liest, nimmt). Modals have no ending in ich and er (ich kann, er muss). Präteritum: strong verbs change the vowel and have no ending in ich and er (ging, kam); weak verbs add -te (machte).</p>',
   '<h3>Articles and endings</h3><p>Only the masculine accusative differs from the nominative (den, einen). Every dative plural adds -n. After der the adjective takes -e or -en; after ein it shows the gender where ein can’t (ein guter Mann, ein gutes Kind).</p>')),
  LV + '<section class="grp" data-all="Recommended"><h3>Table · Tabelle</h3><div class="seg list" id="topics" role="group" aria-label="Table"></div></section><section class="grp" data-fmt="{v}"><h3>Gaps · Lücken</h3><div class="seg segctl" id="gaps" role="group" aria-label="Gaps"></div></section><section class="grp" data-fmt="{v} per round"><h3>Tables per round · Tabellen pro Runde</h3><div class="seg segctl" id="sizes" role="group" aria-label="Tables per round"></div></section>' + NOTE,
  '<kbd>Enter</kbd> moves to the next gap, then checks the table')
print('German pages ok')

# The German home page is built by tools/build_hub.py.

# ---------- German flashcards page, from the Russian one ----------
h = open('vocabulary/index.html').read()
R = [('"../shared/', '"../../shared/'), ('"../icons/', '"../../icons/'), ('"../manifest.webmanifest"', '"../../manifest.webmanifest"'),
   ('<script src="../../shared/progress.js"></script>\n', '<script src="../../shared/progress.js"></script>\n<script>window.GR_LANG=\'de\'</script>\n<script src="../../shared/lang.js"></script>\n'),
   ('<title>Словарь</title>', '<title>Wortschatz</title>'), ('title="All exercises">6</a>', 'title="All exercises">10</a>'),
   ('<h1>Словарь</h1>', '<h1>Wortschatz</h1>'), ('<p class="home"><a href="../">← All exercises</a></p>', '<p class="home"><a href="../">← Alle Übungen · All exercises</a></p>'),
   ('<summary>All cards · Все карточки</summary>', '<summary>All cards · Alle Karten</summary>'),
   ('<summary>Export to Anki · Экспорт</summary>', '<summary>Export to Anki · Export</summary>'),
   ('<summary>Import Anki cards · Импорт</summary>', '<summary>Import Anki cards · Import</summary>'),
   ('placeholder="дом&#9;house&#10;кот&#9;cat"', 'placeholder="das Haus&#9;house&#10;die Katze&#9;cat"'),
   ('<a href="decks/ru-core.tsv" download>ru-core.tsv</a> (your 300 cards, re-levelled) and <a href="decks/ru-levels.tsv" download>ru-levels.tsv</a> (new cards for every level, A1 to C2)', '<a href="decks/de-core.tsv" download>de-core.tsv</a> (German cards for every level, A1 to C2)'),
   ('<h3>Card direction · Направление</h3>', '<h3>Card direction · Richtung</h3>'),
   ('data-d="r">RU → EN</button><button id="d-p" data-d="p">EN → RU</button>', 'data-d="r">DE → EN</button><button id="d-p" data-d="p">EN → DE</button>'),
   ('<h3>New cards per day · Новых в день</h3>', '<h3>New cards per day · Neue pro Tag</h3>'), ('<h3>Theme · Тема</h3>', '<h3>Theme · Thema</h3>'),
   ('<a href="../#progress">Back it up or sync it between devices · Сохранить прогресс</a>', '<a href="../../profile/">Sign in to keep it on every device · Profil</a>'),
   ('<script src="vocab.js"></script>', '''<script>window.VOC_CFG = { decks: ['decks/de-core.tsv'], prefix: 'de-voc-', lang: 'de', tts: 'de-DE', all: 'Alle Themen · All', done: 'Fertig!', listen: 'Listen · Anhören', themes: {
  basic: 'Grundlagen · Basics', people: 'Menschen · People', feelings: 'Gefühle · Feelings', health: 'Gesundheit · Health', society: 'Gesellschaft · Society',
  communication: 'Kommunikation · Communication', abstract: 'Begriffe · Ideas', home: 'Wohnen · Home', city: 'Stadt · City', travel: 'Reisen · Travel',
  shopping: 'Einkaufen · Shopping', food: 'Essen · Food', work: 'Arbeit · Work', study: 'Lernen · Study', time: 'Zeit · Time', qualities: 'Eigenschaften · Qualities',
  linking: 'Verbindungswörter · Linking words', nature: 'Natur · Nature', economy: 'Wirtschaft · Economy', transport: 'Verkehr · Transport', weather: 'Wetter · Weather', leisure: 'Freizeit · Leisure',
  environment: 'Umwelt · Environment', media: 'Medien · Media', science: 'Wissenschaft · Science', general: 'Allgemein · General', imported: 'Import · Imported' } };</script>
<script src="../../vocabulary/vocab.js"></script>''')]
for a, b in R:
    if a not in h: raise SystemExit('vocab: not found: ' + a[:70])
    h = h.replace(a, b)
open('de/vocabulary/index.html', 'w').write(h)
print('German flashcards ok')
