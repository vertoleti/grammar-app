"""Appends item lines (one per line, # comments allowed) to a line's data block.
Usage: python3 tools/add_lines.py de/konj/data.js tools/more/de-konj.txt
Skips lines whose sentence already exists, so running it twice is safe."""
import re, sys
target, src = sys.argv[1], sys.argv[2]
s = open(target, encoding='utf-8').read()
m = re.search(r'(data: `|const DATA = `)', s)
start = m.end(); end = s.index('`', start)
block = s[start:end]
have = {l.split('|')[1] for l in block.split('\n') if '|' in l}
new = [l.strip() for l in open(src, encoding='utf-8') if l.strip() and not l.startswith('#')]
for l in new:
    assert '`' not in l, l
new = [l for l in new if l.split('|')[1] not in have]
if not new: print(target, 'nothing new'); sys.exit()
ins = ('\n' if not block.endswith('\n') else '') + '\n'.join(new) + ('\n' if block.endswith('\n') else '')
s = s[:end] + ins + s[end:]
open(target, 'w', encoding='utf-8').write(s)
print(target, '+', len(new))
