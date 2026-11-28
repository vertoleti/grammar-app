/* Verben & Zeiten. Format: see shared/lines.js. Each item lists its own choices. */
buildLine({
  id: 'de-verbs', step1: 'Which pattern?', step1Short: 'Pattern', scoreLabel: 'Patterns right',
  kinds: [],
  topics: {
    praes: 'Präsens · Present tense',
    modal: 'Modalverben · Modal verbs',
    perf: 'Perfekt: haben oder sein · Perfect: haben or sein',
    part: 'Partizip II · Past participle',
    praet: 'Präteritum · Simple past'
  },
  levels: { praes: 'A1', modal: 'A2', perf: 'A2', part: 'A2', praet: 'B1' },
  opts: {
    reg: { name: 'Regelmäßig · Regular', use: 'stem + -e, -st, -t, -en, -t, -en; stems in -t or -d add -e- (du arbeitest)' },
    stem: { name: 'Vokalwechsel · Vowel change', use: 'strong verbs change the vowel in the du- and er-forms only: a → ä (fahren, fährst), e → i (sprechen, spricht), e → ie (lesen, liest)' },
    irr: { name: 'Unregelmäßig · Irregular', use: 'sein, haben, werden and wissen have their own forms to learn by heart' },
    koennen: { name: 'können · ability, possibility', use: 'can, be able to: ich kann, du kannst, er kann' },
    muessen: { name: 'müssen · necessity', use: 'must, have to: ich muss, du musst. Nicht müssen = don’t have to' },
    duerfen: { name: 'dürfen · permission', use: 'may, be allowed to: ich darf. Nicht dürfen = must not' },
    wollen: { name: 'wollen · intention', use: 'want to, plan to: ich will, du willst' },
    sollen: { name: 'sollen · someone else’s wish', use: 'be supposed to, shall: advice or orders from another person, and offers (Soll ich …?)' },
    moechten: { name: 'möchten · polite wish', use: 'would like to: the polite way to say what you want' },
    haben: { name: 'Perfekt mit haben · with haben', use: 'most verbs: all verbs with an accusative object, reflexive verbs, and verbs with no movement or change of state (schlafen, arbeiten)' },
    sein: { name: 'Perfekt mit sein · with sein', use: 'verbs of movement from A to B (gehen, fahren, fliegen), changes of state (aufwachen, sterben, werden), and sein, bleiben, passieren' },
    weak: { name: 'Schwach · Weak (regular)', use: 'no vowel change. Participle ge- … -t (gemacht); simple past -te (machte)' },
    strong: { name: 'Stark · Strong', use: 'vowel change. Participle ge- … -en (gelesen, gegangen); simple past with a new vowel and no ending in the ich/er-form (kam, ging)' },
    mixed: { name: 'Gemischt · Mixed', use: 'vowel change but weak endings: bringen – brachte – gebracht, denken – dachte – gedacht, wissen – wusste – gewusst, kennen – kannte – gekannt' },
    noge: { name: 'Ohne ge- · No ge-', use: 'verbs in -ieren (studiert) and verbs with an inseparable prefix be-, ge-, er-, ver-, zer-, ent-, emp-, miss- (verstanden, besucht)' },
    sep: { name: 'Trennbar · Separable', use: 'the ge- goes between the prefix and the verb: abgeholt, aufgestanden, eingekauft' },
    aux: { name: 'Hilfs- und Modalverb · Auxiliary or modal', use: 'sein (war), haben (hatte), werden (wurde) and the modals (konnte, musste, durfte, wollte, sollte): learn them by heart; modals lose the umlaut' }
  },
  rules: {
    praes_reg: ['Regular present tense', 'Take the stem (infinitive minus -en) and add -e, -st, -t, -en, -t, -en. If the stem ends in -t or -d (arbeiten, finden) or in a consonant + m/n (öffnen), add an -e- before -st and -t: du arbeitest, er findet.', 'du machst, du arbeitest'],
    praes_stem: ['Vowel change in du and er/sie/es', 'Many strong verbs change their vowel only in the du- and er/sie/es-forms. The other forms stay regular. a → ä: fahren, schlafen, tragen. e → i: sprechen, nehmen, geben, essen. e → ie: lesen, sehen.', 'ich fahre, du fährst, er fährt, wir fahren'],
    praes_irr: ['sein, haben, werden, wissen', 'sein: bin, bist, ist, sind, seid, sind. haben: habe, hast, hat, haben, habt, haben. werden: werde, wirst, wird, werden, werdet, werden. wissen: weiß, weißt, weiß, wissen, wisst, wissen.', 'Ihr seid nett. Weißt du das?'],
    modal: ['Modal verb + infinitive at the end', 'The modal verb is conjugated in position 2 and the main verb goes to the end as an infinitive. In the singular, modals have no ending in the ich- and er-forms and usually a different vowel: ich kann, er muss, ich darf, er will.', 'Hier darf man nicht rauchen.'],
    modal_neg: ['Nicht müssen ≠ must not', 'Nicht müssen means “don’t have to” (it isn’t necessary). “Must not” is nicht dürfen.', 'Du musst nicht kommen. Du darfst nicht rauchen.'],
    modal_polite: ['Möchten for polite wishes', 'Ich möchte is the standard polite way to ask for something or say what you want. Ich will sounds blunt in a shop or restaurant.', 'Wir möchten ein Zimmer reservieren.'],
    perf_haben: ['Perfekt with haben', 'Most verbs form the perfect with haben + participle at the end: all verbs with an accusative object, reflexive verbs, and verbs that don’t describe movement to a new place or a change of state.', 'Ich habe lange geschlafen.'],
    perf_sein: ['Perfekt with sein', 'Verbs that describe movement from one place to another (gehen, fahren, fliegen, kommen, schwimmen across), a change of state (aufwachen, einschlafen, sterben, werden), and sein, bleiben, passieren take sein.', 'Wir sind ins Kino gegangen.'],
    perf_object: ['Movement verbs with an object take haben', 'When fahren, fliegen and similar verbs have an accusative object (you drive something), they take haben.', 'Ich habe das Auto in die Garage gefahren.'],
    part_weak: ['Weak participle: ge- … -t', 'Regular verbs: ge + stem + t. Stems in -t or -d add -et: gearbeitet, geredet.', 'geschickt, gearbeitet'],
    part_strong: ['Strong participle: ge- … -en', 'Strong verbs end in -en and often change the vowel: gehen – gegangen, lesen – gelesen, trinken – getrunken. Learn them with the verb.', 'gelesen, gegangen'],
    part_mixed: ['Mixed participle: vowel change + -t', 'A few verbs change the vowel but end in -t: bringen – gebracht, denken – gedacht, kennen – gekannt, wissen – gewusst, nennen – genannt.', 'gebracht, gedacht'],
    part_noge: ['No ge-', 'Verbs in -ieren and verbs with an inseparable prefix (be-, ge-, er-, ver-, zer-, ent-, emp-, miss-) have no ge-: studiert, verstanden, besucht, gefallen.', 'Wir haben in Rom studiert.'],
    part_sep: ['Separable verbs: ge- in the middle', 'With separable prefixes (ab-, an-, auf-, aus-, ein-, mit-, zu- …) the ge- goes between the prefix and the stem.', 'abgeholt, aufgestanden'],
    praet_weak: ['Weak simple past: -te', 'Stem + -te, -test, -te, -ten, -tet, -ten. Stems in -t, -d or consonant + n add -e-: arbeitete, regnete.', 'Als Kind wohnte ich in Köln.'],
    praet_strong: ['Strong simple past: new vowel, no ending', 'Strong verbs change the vowel and have no ending in the ich- and er/sie/es-forms: kommen – kam, gehen – ging, fahren – fuhr, singen – sang. Plural: kamen, gingen.', 'Er kam um neun nach Hause.'],
    praet_mixed: ['Mixed simple past', 'Vowel change and weak endings: wissen – wusste, denken – dachte, bringen – brachte, kennen – kannte, erkennen – erkannte.', 'Ich wusste das nicht.'],
    praet_aux: ['Simple past of sein, haben, werden and modals', 'In speech, Germans use the Präteritum mainly for these verbs: war, hatte, wurde, konnte, musste, durfte, wollte, sollte. Modals lose their umlaut: konnte, not könnte (that is Konjunktiv II).', 'Sie war sehr müde.']
  },
  fnote: q => `${q.hint ? q.hint + ': ' : ''}${q.forms[q.a2]}.`,
  data: `
praes|Du ___ sehr schnell.|You drive very fast.|fahren|reg;stem;irr|stem|fahrst;fährst;fahrt;fährt|fährst|praes_stem|Du|
praes|Er ___ jeden Abend ein Buch.|He reads a book every evening.|lesen|reg;stem;irr|stem|lest;liest;lesst;les|liest|praes_stem|Er|
praes|Was ___ du morgen?|What are you doing tomorrow?|machen|reg;stem;irr|reg|machst;macht;machest;mach|machst|praes_reg|du|
praes|Sie ___ sehr gut Deutsch.|She speaks German very well.|sprechen|reg;stem;irr|stem|sprecht;spricht;sprichst;sprech|spricht|praes_stem|Sie|
praes|Ihr ___ wirklich nett.|You (all) are really nice.|sein|reg;stem;irr|irr|seid;sind;seit;bist|seid|praes_irr|Ihr|Seid is the verb; seit means “since”.
praes|Wir ___ heute keine Zeit.|We don't have time today.|haben|reg;stem;irr|irr|haben;habt;hat;hast|haben|praes_irr|Wir|
praes|___ du, wo er wohnt?|Do you know where he lives?|wissen|reg;stem;irr|irr|Weißt;Wisst;Wissen;Weiß|Weißt|praes_irr|du||A2
praes|Es ___ langsam dunkel.|It's slowly getting dark.|werden|reg;stem;irr|irr|wird;werdet;wirst;werd|wird|praes_irr|Es|
praes|Er ___ den Bus um acht.|He takes the bus at eight.|nehmen|reg;stem;irr|stem|nehmt;nimmt;nimmst;nehmet|nimmt|praes_stem|Er|Nehmen also changes a consonant: du nimmst, er nimmt.
praes|Du ___ zu viel.|You work too much.|arbeiten|reg;stem;irr|reg|arbeitst;arbeitest;arbeitet;arbeit|arbeitest|praes_reg|Du|
praes|Das Baby ___ noch.|The baby is still asleep.|schlafen|reg;stem;irr|stem|schlaft;schläft;schläfst;schlafen|schläft|praes_stem|Das Baby|
praes|Was ___ du dort?|What do you see there?|sehen|reg;stem;irr|stem|sehst;siehst;sieht;seht|siehst|praes_stem|du|
modal|Ich ___ leider nicht kommen, ich bin krank.|Unfortunately I can't come; I'm ill.||koennen;muessen;duerfen;wollen;sollen|koennen|kann;muss;darf;will;soll|kann|modal|krank|
modal|Hier ___ man nicht rauchen.|You're not allowed to smoke here.||koennen;muessen;duerfen;wollen;sollen|duerfen|kann;muss;darf;will;soll|darf|modal|nicht rauchen|
modal|Ich ___ morgen früh aufstehen, ich habe einen Termin.|I have to get up early tomorrow; I have an appointment.||koennen;muessen;duerfen;wollen;sollen|muessen|kann;muss;darf;will;soll|muss|modal|Termin|
modal|Du ___ nicht kommen, wenn du keine Zeit hast.|You don't have to come if you haven't got time.||koennen;muessen;duerfen;wollen;sollen|muessen|kannst;musst;darfst;willst;sollst|musst|modal_neg|wenn du keine Zeit hast||B1
modal|Mein Sohn ___ Pilot werden.|My son wants to become a pilot.||koennen;muessen;duerfen;wollen;sollen|wollen|kann;muss;darf;will;soll|will|modal|werden|
modal|Der Arzt sagt, ich ___ mehr schlafen.|The doctor says I should sleep more.||koennen;muessen;duerfen;wollen;sollen|sollen|kann;muss;darf;will;soll|soll|modal|Der Arzt sagt|
modal|___ ihr Englisch sprechen?|Can you (all) speak English?||koennen;muessen;duerfen;wollen;sollen|koennen|Könnt;Müsst;Dürft;Wollt;Sollt|Könnt|modal|sprechen|
modal|Wir ___ gern ein Zimmer reservieren.|We'd like to book a room.||koennen;muessen;duerfen;wollen;moechten|moechten|können;müssen;dürfen;wollen;möchten|möchten|modal_polite|gern|
modal|___ ich das Fenster öffnen?|Shall I open the window?||koennen;muessen;duerfen;wollen;sollen|sollen|Kann;Muss;Darf;Will;Soll|Soll|modal|ich|An offer to do something for someone: Soll ich …?|B1
modal|Kinder ___ hier nicht schwimmen.|Children aren't allowed to swim here.||koennen;muessen;duerfen;wollen;sollen|duerfen|können;müssen;dürfen;wollen;sollen|dürfen|modal|nicht schwimmen|
perf|Wir ___ gestern ins Kino gegangen.|We went to the cinema yesterday.||haben;sein|sein|haben;sind;hatten;waren|sind|perf_sein|gegangen|
perf|Ich ___ lange geschlafen.|I slept for a long time.||haben;sein|haben|habe;bin;hatte;war|habe|perf_haben|geschlafen|
perf|Er ___ in Berlin geblieben.|He stayed in Berlin.||haben;sein|sein|hat;ist;hatte;war|ist|perf_sein|geblieben|Bleiben takes sein, although nothing moves.
perf|Was ___ passiert?|What happened?||haben;sein|sein|hat;ist;habe;sind|ist|perf_sein|passiert|
perf|___ du schon gegessen?|Have you eaten yet?||haben;sein|haben|Hast;Bist;Hat;Ist|Hast|perf_haben|gegessen|
perf|Sie ___ um sieben aufgewacht.|She woke up at seven.||haben;sein|sein|hat;ist;habe;sind|ist|perf_sein|aufgewacht|Waking up is a change of state.
perf|Ich ___ das Auto in die Garage gefahren.|I drove the car into the garage.||haben;sein|haben|habe;bin;hatte;war|habe|perf_object|das Auto||B1
perf|Wir ___ über den See geschwommen.|We swam across the lake.||haben;sein|sein|haben;sind;hatten;waren|sind|perf_sein|über den See|Swimming to the other side is movement from A to B.|B1
perf|Das Baby ___ die ganze Nacht geweint.|The baby cried all night.||haben;sein|haben|hat;ist;habe;sind|hat|perf_haben|geweint|
perf|Meine Oma ___ letztes Jahr gestorben.|My grandma died last year.||haben;sein|sein|hat;ist;hatte;war|ist|perf_sein|gestorben|
perf|Wir ___ uns im Urlaub gut erholt.|We had a good rest on holiday.||haben;sein|haben|haben;sind;hatten;waren|haben|perf_haben|uns|Reflexive verbs always take haben.|B1
part|Ich habe dir eine E-Mail ___.|I sent you an email.|schicken|weak;strong;mixed;noge;sep|weak|geschickt;geschicken;schickt;geschickte|geschickt|part_weak|habe|
part|Hast du das Buch schon ___?|Have you read the book yet?|lesen|weak;strong;mixed;noge;sep|strong|gelest;gelesen;lesen;geliest|gelesen|part_strong|Hast|
part|Wir haben in Rom ___.|We studied in Rome.|studieren|weak;strong;mixed;noge;sep|noge|gestudiert;studiert;studieren;gestudieren|studiert|part_noge|haben|
part|Er hat mich am Bahnhof ___.|He picked me up at the station.|abholen|weak;strong;mixed;noge;sep|sep|abgeholt;geabholt;abholt;abgeholen|abgeholt|part_sep|hat|
part|Ich habe das Problem nicht ___.|I didn't understand the problem.|verstehen|weak;strong;mixed;noge;sep|noge|verstanden;geverstanden;verstehet;verstand|verstanden|part_noge|habe||B1
part|Sie ist nach Hause ___.|She went home.|gehen|weak;strong;mixed;noge;sep|strong|gegeht;gegangen;gangen;gegehen|gegangen|part_strong|ist|
part|Wann bist du ___?|When did you get up?|aufstehen|weak;strong;mixed;noge;sep|sep|aufgestanden;aufgestehen;geaufstanden;aufstanden|aufgestanden|part_sep|bist|
part|Wir haben den ganzen Tag ___.|We worked all day.|arbeiten|weak;strong;mixed;noge;sep|weak|gearbeitt;gearbeitet;arbeitet;gearbeiten|gearbeitet|part_weak|haben|
part|Hat dir der Film ___?|Did you like the film?|gefallen|weak;strong;mixed;noge;sep|noge|gefallen;gegefallen;gefallt;gefällt|gefallen|part_noge|Hat|Ge- is already part of the verb, so no second ge-.|B1
part|Ich habe ihm ein Geschenk ___.|I brought him a present.|bringen|weak;strong;mixed;noge;sep|mixed|gebringt;gebracht;gebrungen;bracht|gebracht|part_mixed|habe||B1
part|Wir haben oft an dich ___.|We often thought of you.|denken|weak;strong;mixed;noge;sep|mixed|gedenkt;gedacht;gedanken;dachten|gedacht|part_mixed|haben||B1
part|Hast du schon ___?|Have you done the shopping yet?|einkaufen|weak;strong;mixed;noge;sep|sep|eingekauft;geeinkauft;einkauft;eingekaufen|eingekauft|part_sep|Hast|
praet|Als Kind ___ ich in Köln.|As a child I lived in Cologne.|wohnen|weak;strong;mixed;aux|weak|wohnte;wohnt;wohnen;wohnten|wohnte|praet_weak|Als Kind|
praet|Gestern ___ wir keine Zeit.|We had no time yesterday.|haben|weak;strong;mixed;aux|aux|hatten;habten;hätten;haben|hatten|praet_aux|Gestern|
praet|Er ___ um neun nach Hause.|He came home at nine.|kommen|weak;strong;mixed;aux|strong|kommte;kam;kamen;komm|kam|praet_strong|um neun|
praet|Sie ___ sehr müde.|She was very tired.|sein|weak;strong;mixed;aux|aux|war;wart;waren;ist|war|praet_aux|Sie|
praet|Ich ___ nicht, dass du hier bist.|I didn't know you were here.|wissen|weak;strong;mixed;aux|mixed|wusste;wisste;weißte;wusst|wusste|praet_mixed|nicht|
praet|Wir ___ den ganzen Abend.|We sang the whole evening.|singen|weak;strong;mixed;aux|strong|singten;sangen;sungen;sang|sangen|praet_strong|Wir|
praet|Es ___ die ganze Nacht.|It rained all night.|regnen|weak;strong;mixed;aux|weak|regnete;regnte;rann;regnet|regnete|praet_weak|die ganze Nacht|
praet|Er ___ seinen Schlüssel nicht finden.|He couldn't find his key.|können|weak;strong;mixed;aux|aux|konnte;könnte;kann;konnt|konnte|praet_aux|finden|Not könnte: that is Konjunktiv II, “could, would be able to”.
praet|Der Zug ___ pünktlich ab.|The train left on time.|abfahren|weak;strong;mixed;aux|strong|fuhr;fahrte;fährt;fuhren|fuhr|praet_strong|ab|In a main clause the separable prefix goes to the end.
praet|Ich ___ ihn sofort.|I recognised him immediately.|erkennen|weak;strong;mixed;aux|mixed|erkannte;erkennte;erkann;erkannt|erkannte|praet_mixed|sofort|
praet|Was ___ du als Kind werden?|What did you want to be as a child?|wollen|weak;strong;mixed;aux|aux|wolltest;wollst;willst;wölltest|wolltest|praet_aux|als Kind|
praet|Plötzlich ___ das Telefon.|Suddenly the phone rang.|klingeln|weak;strong;mixed;aux|weak|klingelte;klang;klingelt;klingte|klingelte|praet_weak|Plötzlich|
praet|Wir ___ an den See.|We went to the lake.|fahren|weak;strong;mixed;aux|strong|fuhren;fahrten;fuhr;führen|fuhren|praet_strong|an den See|
`
});
