"""Six case forms (N,G,D,A,I,P) of a Russian noun phrase with pymorphy3, keeping its number.
Adjectives and possessives agree with the head noun (the last noun), including animacy in the accusative."""
import pymorphy3
M = pymorphy3.MorphAnalyzer()
CASES = ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct']

def best(word, pos):
    ps = [p for p in M.parse(word) if p.tag.POS in pos and 'nomn' in p.tag]
    ps.sort(key=lambda p: ('Supr' in p.tag) + ('Name' in p.tag and not word[0].isupper()))
    return ps[0] if ps else None

def six(phrase):
    words = phrase.split()
    head_i = max(i for i, w in enumerate(words) if best(w, {'NOUN'}) or i == len(words) - 1)
    head = best(words[head_i], {'NOUN'})
    if head is None: raise ValueError('no noun in ' + phrase)
    num = 'plur' if 'plur' in head.tag else 'sing'
    gender, anim = head.tag.gender, head.tag.animacy
    out = []
    for c in CASES:
        res = []
        for i, w in enumerate(words):
            if i == head_i:
                f = head.inflect({c, num}) if num == 'sing' or 'Pltm' in head.tag or True else None
                res.append(f.word if f else w); continue
            p = best(w, {'ADJF', 'PRTF', 'NPRO'})
            if p is None or i > head_i: res.append(w); continue
            g = {c, num} | ({gender} if num == 'sing' and gender in ('masc', 'femn', 'neut') else set())
            if c == 'accs' and (num == 'plur' or gender == 'masc'): g |= {anim or 'inan'}
            f = p.inflect(g)
            if f is None or f.word[:3].lower() != w[:3].lower():   # e.g. лучший is stored as a form of хороший
                alt = [x for x in p.lexeme if g <= set(str(x.tag).replace(' ', ',').split(',')) and x.word[:3].lower() == w[:3].lower()]
                f = alt[0] if alt else f
            res.append(f.word if f else w)
        s = ' '.join(res)
        if words[0][0].isupper(): s = s[0].upper() + s[1:]
        out.append(s)
    if out[0].lower() != phrase.lower(): raise ValueError(f'{phrase}: nominative came out as {out[0]}')
    return out

if __name__ == '__main__':
    import sys
    for ph in sys.argv[1:]: print(ph, '→', ','.join(six(ph)))
