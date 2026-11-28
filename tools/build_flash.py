"""Builds the flashcard app pages: vocabulary/index.html (Russian) and de/vocabulary/index.html (German).
Behaviour: shared/flash.js. Styles: shared/flash.css. Run: python3 tools/build_flash.py"""
import json

RU_THEMES = {'basic': 'Основное · Basics', 'people': 'Люди · People', 'feelings': 'Чувства · Feelings', 'health': 'Здоровье · Health',
  'society': 'Общество · Society', 'communication': 'Общение · Communication', 'abstract': 'Понятия · Ideas', 'home': 'Дом · Home',
  'city': 'Город · City', 'travel': 'Путешествия · Travel', 'shopping': 'Покупки · Shopping', 'food': 'Еда · Food', 'work': 'Работа · Work',
  'study': 'Учёба · Study', 'time': 'Время · Time', 'qualities': 'Качества · Qualities', 'linking': 'Связки · Linking words',
  'nature': 'Природа · Nature', 'economy': 'Экономика · Economy', 'general': 'Общее · General', 'imported': 'Мои · Mine'}
DE_THEMES = {'basic': 'Grundlagen · Basics', 'people': 'Menschen · People', 'feelings': 'Gefühle · Feelings', 'health': 'Gesundheit · Health', 'society': 'Gesellschaft · Society',
  'communication': 'Kommunikation · Communication', 'abstract': 'Begriffe · Ideas', 'home': 'Wohnen · Home', 'city': 'Stadt · City', 'travel': 'Reisen · Travel',
  'shopping': 'Einkaufen · Shopping', 'food': 'Essen · Food', 'work': 'Arbeit · Work', 'study': 'Lernen · Study', 'time': 'Zeit · Time', 'qualities': 'Eigenschaften · Qualities',
  'linking': 'Verbindungswörter · Linking words', 'nature': 'Natur · Nature', 'economy': 'Wirtschaft · Economy', 'transport': 'Verkehr · Transport', 'weather': 'Wetter · Weather',
  'leisure': 'Freizeit · Leisure', 'environment': 'Umwelt · Environment', 'media': 'Medien · Media', 'science': 'Wissenschaft · Science', 'general': 'Allgemein · General', 'imported': 'Meine · Mine'}

PAGES = [
  dict(path='vocabulary/index.html', R='../', head='', title='Карточки', cfg=dict(decks=['decks/ru-core.tsv', 'decks/ru-levels.tsv'], forms='decks/ru-forms.json', prefix='voc-', lang='ru', tts='ru-RU', name='Карточки · Flashcards', home='../', themes=RU_THEMES)),
  dict(path='de/vocabulary/index.html', R='../../', head="<script>window.GR_LANG='de'</script>\n", title='Karteikarten', cfg=dict(decks=['decks/de-core.tsv'], forms='decks/de-forms.json', prefix='de-voc-', lang='de', tts='de-DE', name='Karteikarten · Flashcards', home='../', themes=DE_THEMES)),
]

for P in PAGES:
    R = P['R']
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{P['title']}</title>
<meta name="theme-color" content="#f6f6f4">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Грамматика">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="{R}manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="{R}icons/favicon-32.png">
<link rel="apple-touch-icon" href="{R}icons/apple-touch-icon.png">
<script src="{R}shared/progress.js"></script>
{P['head']}<script src="{R}shared/lang.js"></script>
<script src="{R}shared/config.js"></script>
<script src="{R}shared/account.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}shared/theme.css">
<link rel="stylesheet" href="{R}shared/flash.css">
</head>
<body>
<div id="app"></div>
<script>window.VOC_CFG={json.dumps(P['cfg'], ensure_ascii=False)}</script>
<script src="{R}shared/levels.js"></script>
<script src="{R}shared/coach.js"></script>
<script src="{R}shared/lookup.js"></script>
<script src="{R}shared/flash.js"></script>
<script>try{{if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('{R}sw.js',{{scope:'{R}'}}).catch(()=>{{}}))}}catch(e){{}}</script>
</body>
</html>
'''
    open(P['path'], 'w', encoding='utf-8').write(html)
    print('built', P['path'])
