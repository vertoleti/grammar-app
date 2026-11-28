/* Tabellen: German conjugation and declension tables. Builds window.TABLES.T for tables/app.js. */
(function () {
  const P = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
  const T = [];
  // Präsens: [level, infinitive, English, ich, du, er, wir, ihr, sie]
  [
    ['A1', 'sein', 'to be', 'bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
    ['A1', 'haben', 'to have', 'habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
    ['A1', 'arbeiten', 'to work', 'arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten'],
    ['A1', 'fahren', 'to drive, go', 'fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren'],
    ['A1', 'lesen', 'to read', 'lese', 'liest', 'liest', 'lesen', 'lest', 'lesen'],
    ['A1', 'sprechen', 'to speak', 'spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'],
    ['A1', 'essen', 'to eat', 'esse', 'isst', 'isst', 'essen', 'esst', 'essen'],
    ['A2', 'werden', 'to become', 'werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'],
    ['A2', 'wissen', 'to know', 'weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen'],
    ['A2', 'nehmen', 'to take', 'nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt', 'nehmen'],
    ['A2', 'geben', 'to give', 'gebe', 'gibst', 'gibt', 'geben', 'gebt', 'geben'],
    ['A2', 'sehen', 'to see', 'sehe', 'siehst', 'sieht', 'sehen', 'seht', 'sehen'],
    ['A2', 'schlafen', 'to sleep', 'schlafe', 'schläfst', 'schläft', 'schlafen', 'schlaft', 'schlafen'],
    ['A2', 'laufen', 'to run, walk', 'laufe', 'läufst', 'läuft', 'laufen', 'lauft', 'laufen'],
    ['A2', 'können', 'can', 'kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
    ['A2', 'müssen', 'must', 'muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
    ['A2', 'dürfen', 'may', 'darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'],
    ['A2', 'wollen', 'to want', 'will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
    ['A2', 'mögen', 'to like', 'mag', 'magst', 'mag', 'mögen', 'mögt', 'mögen']
  ].forEach(([lv, inf, en, ...f]) => T.push({ t: 'praes', lv, key: 'praes:' + inf, title: inf, sub: `${en} · Präsens, present tense`, cols: ['', 'Präsens'], rows: P.map((p, i) => ({ h: p, cells: [f[i]] })) }));
  // Präteritum + Perfekt: [level, infinitive, English, ich, du, er, wir, ihr, sie, Perfekt (er)]
  [
    ['A2', 'sein', 'to be', 'war', 'warst', 'war', 'waren', 'wart', 'waren', 'ist gewesen'],
    ['A2', 'haben', 'to have', 'hatte', 'hattest', 'hatte', 'hatten', 'hattet', 'hatten', 'hat gehabt'],
    ['A2', 'machen', 'to do, make', 'machte', 'machtest', 'machte', 'machten', 'machtet', 'machten', 'hat gemacht'],
    ['A2', 'gehen', 'to go', 'ging', 'gingst', 'ging', 'gingen', 'gingt', 'gingen', 'ist gegangen'],
    ['A2', 'kommen', 'to come', 'kam', 'kamst', 'kam', 'kamen', 'kamt', 'kamen', 'ist gekommen'],
    ['A2', 'können', 'can', 'konnte', 'konntest', 'konnte', 'konnten', 'konntet', 'konnten', 'hat gekonnt'],
    ['B1', 'werden', 'to become', 'wurde', 'wurdest', 'wurde', 'wurden', 'wurdet', 'wurden', 'ist geworden'],
    ['B1', 'fahren', 'to drive, go', 'fuhr', 'fuhrst', 'fuhr', 'fuhren', 'fuhrt', 'fuhren', 'ist gefahren'],
    ['B1', 'sehen', 'to see', 'sah', 'sahst', 'sah', 'sahen', 'saht', 'sahen', 'hat gesehen'],
    ['B1', 'nehmen', 'to take', 'nahm', 'nahmst', 'nahm', 'nahmen', 'nahmt', 'nahmen', 'hat genommen'],
    ['B1', 'geben', 'to give', 'gab', 'gabst', 'gab', 'gaben', 'gabt', 'gaben', 'hat gegeben'],
    ['B1', 'finden', 'to find', 'fand', 'fandest', 'fand', 'fanden', 'fandet', 'fanden', 'hat gefunden'],
    ['B1', 'schreiben', 'to write', 'schrieb', 'schriebst', 'schrieb', 'schrieben', 'schriebt', 'schrieben', 'hat geschrieben'],
    ['B1', 'trinken', 'to drink', 'trank', 'trankst', 'trank', 'tranken', 'trankt', 'tranken', 'hat getrunken'],
    ['B1', 'bleiben', 'to stay', 'blieb', 'bliebst', 'blieb', 'blieben', 'bliebt', 'blieben', 'ist geblieben'],
    ['B1', 'arbeiten', 'to work', 'arbeitete', 'arbeitetest', 'arbeitete', 'arbeiteten', 'arbeitetet', 'arbeiteten', 'hat gearbeitet'],
    ['B1', 'denken', 'to think', 'dachte', 'dachtest', 'dachte', 'dachten', 'dachtet', 'dachten', 'hat gedacht'],
    ['B1', 'bringen', 'to bring', 'brachte', 'brachtest', 'brachte', 'brachten', 'brachtet', 'brachten', 'hat gebracht'],
    ['B1', 'wissen', 'to know', 'wusste', 'wusstest', 'wusste', 'wussten', 'wusstet', 'wussten', 'hat gewusst'],
    ['B2', 'verstehen', 'to understand', 'verstand', 'verstandest', 'verstand', 'verstanden', 'verstandet', 'verstanden', 'hat verstanden'],
    ['B2', 'anrufen', 'to call', 'rief an', 'riefst an', 'rief an', 'riefen an', 'rieft an', 'riefen an', 'hat angerufen']
  ].forEach(([lv, inf, en, ...f]) => T.push({ t: 'praet', lv, key: 'praet:' + inf, title: inf, sub: `${en} · Präteritum and Perfekt`, cols: ['', 'Form'], rows: P.map((p, i) => ({ h: `${p} <small>Präteritum</small>`, cells: [f[i]] })).concat([{ h: 'er / sie / es <small>Perfekt</small>', cells: [f[6]] }]) }));
  // Articles and adjective endings: rows Nom, Akk, Dat, Gen × Maskulin, Feminin, Neutrum, Plural
  const C = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'], G = ['', 'Maskulin', 'Feminin', 'Neutrum', 'Plural'];
  const grid = (t, lv, key, title, sub, rows) => T.push({ t, lv, key, title, sub, cols: G, rows: C.map((c, i) => ({ h: c, cells: rows[i] })) });
  grid('art', 'A1', 'art:der', 'der, die, das', 'the definite article', [['der', 'die', 'das', 'die'], ['den', 'die', 'das', 'die'], ['dem', 'der', 'dem', 'den'], ['des', 'der', 'des', 'der']]);
  grid('art', 'A2', 'art:ein', 'ein, eine · kein', 'the indefinite article; the plural column is kein (ein has no plural)', [['ein', 'eine', 'ein', 'keine'], ['einen', 'eine', 'ein', 'keine'], ['einem', 'einer', 'einem', 'keinen'], ['eines', 'einer', 'eines', 'keiner']]);
  grid('art', 'A2', 'art:mein', 'mein, meine', 'possessives (mein, dein, sein, unser …) work like kein', [['mein', 'meine', 'mein', 'meine'], ['meinen', 'meine', 'mein', 'meine'], ['meinem', 'meiner', 'meinem', 'meinen'], ['meines', 'meiner', 'meines', 'meiner']]);
  grid('art', 'B1', 'art:weak', 'der alte …', 'adjective endings after der, die, das (weak): type only the adjective', [['alte', 'alte', 'alte', 'alten'], ['alten', 'alte', 'alte', 'alten'], ['alten', 'alten', 'alten', 'alten'], ['alten', 'alten', 'alten', 'alten']]);
  grid('art', 'B1', 'art:mixed', 'ein neuer …', 'adjective endings after ein, kein, mein (mixed): type only the adjective; plural after keine', [['neuer', 'neue', 'neues', 'neuen'], ['neuen', 'neue', 'neues', 'neuen'], ['neuen', 'neuen', 'neuen', 'neuen'], ['neuen', 'neuen', 'neuen', 'neuen']]);
  grid('art', 'B1', 'art:strong', 'guter …', 'adjective endings with no article (strong): type only the adjective', [['guter', 'gute', 'gutes', 'gute'], ['guten', 'gute', 'gutes', 'gute'], ['gutem', 'guter', 'gutem', 'guten'], ['guten', 'guter', 'guten', 'guter']]);
  grid('pron', 'B2', 'pron:rel', 'der, die, das (relativ)', 'relative pronouns: like the article, except dessen, deren, denen', [['der', 'die', 'das', 'die'], ['den', 'die', 'das', 'die'], ['dem', 'der', 'dem', 'denen'], ['dessen', 'deren', 'dessen', 'deren']]);
  T.push({ t: 'pron', lv: 'A2', key: 'pron:pers', title: 'ich, du, er …', sub: 'personal pronouns and possessives', cols: ['', 'Akkusativ', 'Dativ', 'Possessiv'],
    rows: [['ich', 'mich', 'mir', 'mein'], ['du', 'dich', 'dir', 'dein'], ['er', 'ihn', 'ihm', 'sein'], ['sie', 'sie', 'ihr', 'ihr'], ['es', 'es', 'ihm', 'sein'], ['wir', 'uns', 'uns', 'unser'], ['ihr', 'euch', 'euch', 'euer'], ['sie', 'sie', 'ihnen', 'ihr'], ['Sie', 'Sie', 'Ihnen', 'Ihr']].map(r => ({ h: r[0], cells: r.slice(1) })) });
  window.TABLES = {
    TOP: { smart: 'Empfohlen · Recommended', praes: 'Präsens · Present tense', praet: 'Präteritum & Perfekt · Past tenses', art: 'Artikel & Adjektive · Articles and adjectives', pron: 'Pronomen · Pronouns' },
    T
  };
})();
