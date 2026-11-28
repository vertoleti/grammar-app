"""Turns the short Russian sentence lists in tools/more/ into full lines (with the six case forms from
tools/ru_forms.py) and appends them to the lines' data. Run: python3 tools/build_ru_more.py"""
import subprocess, sys
sys.path.insert(0, 'tools')
from ru_forms import six

def conv(src, kind):
    out = []
    for l in open(src, encoding='utf-8'):
        l = l.rstrip('\n')
        if not l.strip() or l.startswith('#'): continue
        f = l.split('|')
        if kind == 'gov':      # topic|sentence|English|hint|case|rule|signal|note
            t, ru, en, hint, c, rule, cue, note = (f + [''] * 8)[:8]
            forms = six(hint); out.append('|'.join([t, ru, en, hint, c, ','.join(forms), rule, cue, note]))
        elif kind == 'prep':   # topic|sentence|English|noun|options|answer|case|rule|signal|note
            t, ru, en, noun, opts, ans, c, rule, cue, note = (f + [''] * 10)[:10]
            forms = six(noun); out.append('|'.join([t, ru, en, noun, opts, ans, ','.join(forms), c, rule, cue, note]))
        elif kind == 'cases':  # topic|sentence|English|hint|case|rule|signal|note|group
            t, ru, en, hint, c, rule, cue, note, grp = (f + [''] * 9)[:9]
            forms = six(hint); out.append('|'.join([t, ru, en, hint, c, ','.join(forms), rule, cue, note, grp]))
        # check: the answer form must fit the gap's case
    tmp = src.replace('.txt', '.full.txt'); open(tmp, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    return tmp

for src, kind, target in [('tools/more/ru-gov.txt', 'gov', 'gov/data.js'), ('tools/more/ru-prep.txt', 'prep', 'prep/data.js'), ('tools/more/ru-cases.txt', 'cases', 'cases/data.js')]:
    try: open(src).close()
    except FileNotFoundError: continue
    tmp = conv(src, kind)
    subprocess.run(['python3', 'tools/add_lines.py', target, tmp], check=True)
