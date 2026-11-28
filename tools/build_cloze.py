"""Builds gap sentences ("words in context") for each language from the deck examples and the reading texts.
A word is found in a sentence through its full list of forms (tools/build_forms.py), so inflected forms count.
Writes vocabulary/decks/ru-cloze.json and de/vocabulary/decks/de-cloze.json:
  [ { "id": card id, "s": sentence with ___, "a": the missing form, "en": translation or "", "src": "deck"|"text", "cat": category, "lv": level } ]
Run after build_forms.py: python3 tools/build_cloze.py"""
import json, re, subprocess
from build_forms import rows

STRESS = '́'
WORD = re.compile(r"[\ẃ’'-]+", re.U)


def norm(w):
    return w.replace(STRESS, '').lower().replace('ё', 'е')


def texts(path):
    js = open(path, encoding='utf-8').read()
    out = subprocess.run(['node', '-e', 'const window={};' + js + ';console.log(JSON.stringify(window.TEXTS))'], capture_output=True, text=True).stdout
    return json.loads(out)


def split_sents(p):
    return [s for s in re.split(r'(?<=[.!?…»“])\s+(?=[«„"–—A-ZÄÖÜА-ЯЁ])', p) if s]


def build(lang, decks, forms_path, text_paths, out_path):
    K = (lambda w: w.replace(STRESS, '')) if lang == 'de' else norm   # German: case matters (Abend vs abends)
    cards = [c for d in decks for c in rows(d) if c.get('id')]
    forms = json.load(open(forms_path, encoding='utf-8'))
    index = {}   # form -> card ids
    for c in cards:
        if c['kind'] != 'word': continue
        fs = set(forms.get(c['id'], {}).get('all', []))
        head = c['term'].replace(STRESS, '')
        if c['category'] == 'noun' and lang == 'de': head = head.split(' ', 1)[-1]
        fs.add(head)
        for f in fs:
            if ' ' in f: continue
            index.setdefault(K(f), set()).add(c['id'])
    byid = {c['id']: c for c in cards}
    items, seen = [], set()

    def add(cid, sent, tok, en, src):
        key = (cid, sent)
        if key in seen: return
        seen.add(key)
        c = byid[cid]
        s = sent.replace(tok, '___', 1)
        if '___' not in s: return
        items.append({'id': cid, 's': s, 'a': tok, 'en': en, 'src': src, 'cat': c['category'], 'lv': c['cefr'].upper()})

    for c in cards:
        ex = re.sub(r'<[^>]+>', '', c['example_target'] or '').strip()
        if not ex: continue
        en = re.sub(r'<[^>]+>', '', c['example_en'] or '').strip()
        if c['kind'] == 'phrase' or ' ' in c['term'].replace(STRESS, '').strip('!?.…'):
            t = c['term'].replace(STRESS, '').rstrip('!?.…').replace(' …', '').strip()
            i = ex.lower().find(t.lower())
            if t and i >= 0 and c['kind'] == 'phrase': add(c['id'], ex, ex[i:i + len(t)], en, 'deck')
            if c['kind'] == 'phrase': continue
        for tok in WORD.findall(ex):
            if c['id'] in index.get(K(tok), ()):
                add(c['id'], ex, tok, en, 'deck'); break
    for tp in text_paths:
        for t in texts(tp):
            for para in t['p']:
                txt = para[0] if isinstance(para, list) else para
                for sent in split_sents(txt):
                    if len(sent) > 160: continue
                    for tok in WORD.findall(sent):
                        for cid in index.get(K(tok), ()):
                            if byid[cid]['category'] in ('noun', 'verb', 'adjective', 'adverb') and sum(1 for x in items if x['id'] == cid) < 4:
                                add(cid, sent, tok, '', 'text')
    json.dump(items, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(lang, 'gap sentences:', len(items), '| from texts:', sum(1 for x in items if x['src'] == 'text'), '| words covered:', len({x['id'] for x in items}))


if __name__ == '__main__':
    build('ru', ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'], 'vocabulary/decks/ru-forms.json', ['reading/texts.js'], 'vocabulary/decks/ru-cloze.json')
    build('de', ['de/vocabulary/decks/de-core.tsv'], 'de/vocabulary/decks/de-forms.json', ['de/reading/texts.js'], 'de/vocabulary/decks/de-cloze.json')
