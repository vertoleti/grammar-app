# Builds the pages that don't use the grammar engine: weekly review, der/die/das, reading, phrasebook, exam.
# Run from the repo root:  python3 tools/build_extra.py
import os

def shell(path, lang, title, en, num, color, body, scripts, sub='', score=True):
    depth = path.count('/')           # 'review/index.html' -> 1, 'de/review/index.html' -> 2
    R = '../' * depth
    de = lang == 'de'
    head_lang = f"<script>window.GR_LANG='de'</script>\n" if de else ''
    home = '← Alle Übungen · All exercises' if de else '← All exercises'
    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{en}">
<meta name="theme-color" content="#f6f6f4">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Грамматика">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="{R}manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="{R}icons/favicon-32.png">
<link rel="apple-touch-icon" href="{R}icons/apple-touch-icon.png">
<script src="{R}shared/progress.js"></script>
{head_lang}<script src="{R}shared/lang.js"></script>
<script src="{R}shared/config.js"></script>
<script src="{R}shared/account.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}shared/engine.css">
<link rel="stylesheet" href="{R}shared/ui.css">
<style>:root{{--red:{color}}}</style>
<link rel="stylesheet" href="{R}shared/theme.css">
<link rel="stylesheet" href="{R}shared/extra.css">
</head>
<body>
<header class="top band">
  <div class="wrap">
    <div class="head">
      <div class="brand"><a class="m" href="../" aria-label="All exercises">{num}</a><div><p class="home"><a href="../">{home}</a> · <a href="../grammar/">{'Grammatik · Guide' if de else 'Grammar guide'}</a></p><h1>{title}</h1><p class="sub">{en}{(' · ' + sub) if sub else ''}</p></div></div>
      {'<div class="score" id="score"></div>' if score else ''}
    </div>
    {'<div class="track" id="track" aria-hidden="true"></div>' if score else ''}
  </div>
</header>
<main class="band">
  <div class="wrap">
{body}
  </div>
</main>
{scripts.replace('{R}', R)}
<script>try{{if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('{R}sw.js',{{scope:'{R}'}}).catch(()=>{{}}))}}catch(e){{}}</script>
</body>
</html>
'''
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(page)
    return path

built = []

# ---------- weekly review ----------
REVIEW = '''<section class="xcard"><h2>This week <small>Monday to Sunday</small></h2><div id="week"></div></section>
<section class="xcard"><h2>What changed <small>since last week</small></h2><div id="changed"></div></section>
<section class="xcard"><h2>Due now</h2><div id="due"></div></section>
<section class="xcard"><h2>Plan for the coming week</h2><div id="plan"></div></section>'''
built.append(shell('review/index.html', 'ru', 'Неделя', 'Weekly review', '↻', '#141414', REVIEW,
  '<script src="{R}shared/levels.js"></script>\n<script src="{R}shared/catalog.js"></script>\n<script src="{R}shared/coach.js"></script>\n<script src="{R}shared/review.js"></script>', score=False))
built.append(shell('de/review/index.html', 'de', 'Wochenrückblick', 'Weekly review', '↻', '#141414', REVIEW,
  '<script src="{R}shared/levels.js"></script>\n<script src="{R}shared/catalog-de.js"></script>\n<script src="{R}shared/coach.js"></script>\n<script src="{R}shared/review.js"></script>', score=False))

# ---------- der / die / das ----------
GENUS = '''<div class="seg segctl" id="lvls" role="group" aria-label="Level" style="margin-bottom:14px"></div>
<section class="card" id="card" aria-live="polite"></section>
<p class="note" style="margin-top:12px">Keyboard: <kbd>1</kbd> der, <kbd>2</kbd> die, <kbd>3</kbd> das, <kbd>Enter</kbd> next. Wrong nouns come back sooner; a noun counts as known after three right answers in a row.</p>
<details class="refbox" style="margin-top:16px"><summary>Endings that tell you the gender <a href="../grammar/#gender">Grammar guide →</a></summary><div class="refin">
<div class="tw"><table><thead><tr><th>Article</th><th>Endings and groups</th></tr></thead><tbody>
<tr><td>der</td><td>-ling, -ismus, -or, -ig, -ich, -ant, -ent, -ist; days, months, seasons, weather; most nouns from verbs without an ending (der Lauf)</td></tr>
<tr><td>die</td><td>-ung, -heit, -keit, -schaft, -ion, -tät, -ie, -ik, -ur, -ei, -in (women); most nouns in -e</td></tr>
<tr><td>das</td><td>-chen, -lein (always), -ment, -um, -ma; infinitives used as nouns (das Essen); many nouns with Ge-</td></tr>
</tbody></table></div></div></details>'''
built.append(shell('de/genus/index.html', 'de', 'der · die · das', 'Noun genders', 'Ⓐ', '#1f8a3b', GENUS,
  '<script src="{R}shared/levels.js"></script>\n<script src="{R}shared/coach.js"></script>\n<script src="data.js"></script>\n<script src="app.js"></script>', sub='275 common nouns'))

if __name__ == '__main__':
    for p in built: print('built', p)

# ---------- reading ----------
READ_JS = '<script src="{R}shared/levels.js"></script>\n<script src="{R}shared/coach.js"></script>\n<script src="{R}shared/speech.js"></script>\n<script src="texts.js"></script>\n<script src="{R}shared/reading.js"></script>\n<script src="{R}shared/lookup.js"></script>'
built.append(shell('reading/index.html', 'ru', 'Чтение', 'Reading', '¶', '#00796b', '<div id="main"></div>', READ_JS, sub='graded texts and your own', score=False))
built.append(shell('de/reading/index.html', 'de', 'Lesen', 'Reading', '¶', '#00796b', '<div id="main"></div>', READ_JS, sub='graded texts and your own', score=False))
if __name__ == '__main__':
    for p in built[-2:]: print('built', p)

# ---------- phrasebooks ----------
PB_JS = '<script src="{R}shared/coach.js"></script>\n<script src="{R}shared/speech.js"></script>\n<script src="data.js"></script>\n<script src="{R}shared/phrases.js"></script>\n<script src="{R}shared/lookup.js"></script>'
built.append(shell('phrases/index.html', 'ru', 'Разговорник', 'Phrasebook', '“', '#5c6bc0', '<div id="main"></div>', PB_JS, sub='situations: phrases, dialogues, drills', score=False))
built.append(shell('de/phrases/index.html', 'de', 'Redemittel', 'Phrasebook', '“', '#5c6bc0', '<div id="main"></div>', PB_JS, sub='situations: phrases, dialogues, drills', score=False))
if __name__ == '__main__':
    for p in built[-2:]: print('built', p)

# ---------- exam ----------
import re as _re
def exam_js(lang):
    place = open(('de/' if lang == 'de' else '') + 'placement/index.html', encoding='utf-8').read()
    data = ''.join(m + '\n' for m in _re.findall(r'<script src="\.\./[a-z]+/data\.js"></script><script>ALL\.push\(EXERCISE\)</script>', place))
    lines = '<script src="{R}shared/lines.js"></script>\n' if lang == 'de' else ''
    return ('<script src="{R}shared/coach.js"></script>\n<script src="{R}shared/speech.js"></script>\n' + lines + '<script>window.ALL=[]</script>\n' + data +
            '<script src="../reading/texts.js"></script>\n<script src="../phrases/data.js"></script>\n<script src="{R}shared/lookup.js"></script>\n<script src="{R}shared/exam.js"></script>')
built.append(shell('exam/index.html', 'ru', 'Экзамен', 'Mock exam', '✓', '#37474f', '<div id="main"></div>', exam_js('ru'), sub='timed, in the style of ТРКИ', score=False))
built.append(shell('de/exam/index.html', 'de', 'Prüfung', 'Mock exam', '✓', '#37474f', '<div id="main"></div>', exam_js('de'), sub='timed, in the style of the Goethe-Zertifikat', score=False))
if __name__ == '__main__':
    for p in built[-2:]: print('built', p)
