# Builds the grammar guides from plain-text chapters:
#   guide/ru/*.txt  -> grammar/index.html      (Russian)
#   guide/de/*.txt  -> de/grammar/index.html   (German)
# and shared/guide-map.js, which tells each exercise topic which section explains it.
#
# Source syntax (one block per paragraph, blocks separated by blank lines):
#   # Chapter title {#id}        chapter (h2)          ## Section {#id}   section (h3)     ### Heading   (h4)
#   @for line:topic, line:topic  link these exercise topics (or a whole line: "line") to the current section
#   | a | b |  rows             table; the first row is the header
#   > Russian or German — English   example lines (one per line)
#   - item                      bulleted list
#   !! text                     a tip box
#   **bold**  _target-language italics_
import os, re, glob, json, html

LANGS = {
  'ru': dict(src='guide/ru', out='grammar/index.html', root='../', home='../', lang='ru', title='Русская грамматика', en='Russian grammar reference',
             back='← Все упражнения · All exercises', search='Search the guide · Поиск', toc='Contents · Содержание'),
  'de': dict(src='guide/de', out='de/grammar/index.html', root='../../', home='../', lang='de', title='Deutsche Grammatik', en='German grammar reference',
             back='← Alle Übungen · All exercises', search='Search the guide · Suchen', toc='Contents · Inhalt'),
}

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<![\w/])_(.+?)_(?![\w])', r'<i>\1</i>', s)
    s = re.sub(r'\[([^\]]+)\]\(#([\w-]+)\)', r'<a href="#\2">\1</a>', s)
    return s

def build(code, cfg):
    files = sorted(glob.glob(cfg['src'] + '/*.txt'))
    text = '\n\n'.join(open(f, encoding='utf-8').read() for f in files)
    blocks = re.split(r'\n\s*\n', text.strip())
    body, toc, gmap = [], [], {}
    chapter = section = None
    open_ch = open_sec = False
    ids = set()
    def close_sec():
        nonlocal open_sec
        if open_sec: body.append('</section>'); open_sec = False
    def close_ch():
        nonlocal open_ch
        close_sec()
        if open_ch: body.append('</section>'); open_ch = False
    for b in blocks:
        lines = b.strip('\n').split('\n')
        first = lines[0]
        m = re.match(r'^(#{1,3}) (.+?)(?: \{#([\w-]+)\})?$', first)
        if m and len(lines) == 1:
            level, title, aid = len(m.group(1)), m.group(2), m.group(3)
            if level < 3 and not aid: raise SystemExit(f'{code}: heading without id: {first}')
            if aid:
                if aid in ids: raise SystemExit(f'{code}: duplicate id {aid}')
                ids.add(aid)
            if level == 1:
                close_ch(); chapter = aid; section = aid
                body.append(f'<section class="ch" id="{aid}"><h2>{inline(title)}</h2>'); open_ch = True
                toc.append([aid, title, []])
            elif level == 2:
                close_sec(); section = aid
                body.append(f'<section class="sec" id="{aid}"><h3>{inline(title)}</h3>'); open_sec = True
                toc[-1][2].append([aid, title])
            else:
                body.append(f'<h4>{inline(title)}</h4>')
            continue
        if first.startswith('@for '):
            for k in first[5:].split(','):
                k = k.strip()
                if k: gmap.setdefault(k, section)
            lines = lines[1:]
            if not lines: continue
            first = lines[0]
        if first.startswith('|'):
            rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in lines if not re.match(r'^\|[\s:-]+\|?$', l.replace('|', '|'))]
            rows = [r for r in rows if not all(re.fullmatch(r':?-{2,}:?', c) for c in r)]
            head, rest = rows[0], rows[1:]
            body.append('<div class="tw"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>' +
                        ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in rest) + '</tbody></table></div>')
        elif first.startswith('> '):
            items = []
            for l in lines:
                l = l[2:] if l.startswith('> ') else l
                parts = l.split(' — ', 1)
                items.append(f'<li><span lang="{cfg["lang"]}">{inline(parts[0])}</span>' + (f'<span>{inline(parts[1])}</span>' if len(parts) > 1 else '') + '</li>')
            body.append('<ul class="ex">' + ''.join(items) + '</ul>')
        elif first.startswith('- '):
            body.append('<ul>' + ''.join(f'<li>{inline(l[2:])}</li>' for l in lines if l.startswith('- ')) + '</ul>')
        elif first.startswith('!! '):
            body.append(f'<p class="tip">{inline(" ".join(l.lstrip("! ") if i == 0 else l for i, l in enumerate(lines)))}</p>')
        else:
            body.append(f'<p>{inline(" ".join(lines))}</p>')
    close_ch()
    words = len(re.sub(r'<[^>]+>', ' ', '\n'.join(body)).split())
    tochtml = ''.join(f'<li><a href="#{a}">{inline(t)}</a>' + (f'<ol>' + ''.join(f'<li><a href="#{sa}">{inline(st)}</a></li>' for sa, st in subs) + '</ol>' if subs else '') + '</li>' for a, t, subs in toc)
    R = cfg['root']
    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{cfg['title']} · {cfg['en']}</title>
<meta name="description" content="{cfg['en']}: every topic the exercises practise, with tables and examples, A1 to C2.">
<meta name="theme-color" content="#f6f6f4">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Грамматика">
<link rel="manifest" href="{R}manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="{R}icons/favicon-32.png">
<link rel="apple-touch-icon" href="{R}icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}shared/theme.css">
<link rel="stylesheet" href="{R}shared/guide.css">
</head>
<body class="guide">
<header class="gtop">
  <div class="gwrap">
    <a class="gback" href="{cfg['home']}">{cfg['back']}</a>
    <h1>{cfg['title']}</h1>
    <p class="gsub">{cfg['en']} · {len(toc)} chapters · about {round(words, -3) // 1000}k words</p>
    <input id="q" type="search" placeholder="{cfg['search']}" aria-label="{cfg['search']}" autocomplete="off">
  </div>
</header>
<div class="gwrap glayout">
  <nav class="gtoc" aria-label="{cfg['toc']}"><details id="tocbox"><summary>{cfg['toc']}</summary><ol>{tochtml}</ol></details></nav>
  <main id="guide">
{chr(10).join(body)}
    <p class="none" id="none" hidden>Nothing found. Try a shorter word.</p>
  </main>
</div>
<script>
{{
  const box = document.getElementById('tocbox');
  const wide = matchMedia('(min-width: 1000px)');
  const sync = () => {{ box.open = wide.matches; }}; sync(); wide.addEventListener('change', sync);
  box.addEventListener('click', e => {{ if (e.target.closest('a') && !wide.matches) box.open = false; }});
  const q = document.getElementById('q'), secs = [...document.querySelectorAll('#guide section')];
  const norm = s => s.toLowerCase().replace(/ё/g, 'е');
  q.addEventListener('input', () => {{
    const t = norm(q.value.trim()); let any = false;
    document.querySelectorAll('#guide section.sec').forEach(s => {{ const hit = !t || norm(s.textContent).includes(t); s.hidden = !hit; any = any || hit; }});
    document.querySelectorAll('#guide section.ch').forEach(c => {{ const own = norm(c.querySelector('h2').textContent).includes(t); const kids = [...c.querySelectorAll('section.sec')]; c.hidden = t && !own && kids.every(k => k.hidden); if (own) kids.forEach(k => k.hidden = false); if (!c.hidden) any = true; }});
    document.getElementById('none').hidden = any;
  }});
  if (location.hash) {{ const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView(), 0); }}
}}
</script>
</body>
</html>
'''
    os.makedirs(os.path.dirname(cfg['out']), exist_ok=True)
    open(cfg['out'], 'w', encoding='utf-8').write(page)
    print(f'{code}: {len(toc)} chapters, {sum(len(t[2]) for t in toc)} sections, {words} words, {len(gmap)} exercise links')
    return gmap

maps = {code: build(code, cfg) for code, cfg in LANGS.items() if glob.glob(cfg['src'] + '/*.txt')}
open('shared/guide-map.js', 'w').write('/* Generated by tools/build_guide.py: exercise line:topic -> guide section. */\nwindow.GUIDE_MAP = ' + json.dumps(maps, ensure_ascii=False, indent=1) + ';\n')
