/* Fälle & Artikel. Format: see shared/lines.js. Forms follow Nom;Akk;Dat;Gen unless the item lists its own choices. */
buildLine({
  id: 'de-cases', step1: 'Which case?', step1Short: 'Case', scoreLabel: 'Cases right', keepOrder1: true, parallel: true, labels: true,
  kinds: ['nom', 'akk', 'dat', 'gen'],
  topics: {
    akk: 'Nominativ oder Akkusativ · Subject or object',
    dat: 'Dativ · Dative',
    pron: 'Pronomen · Pronouns',
    gen: 'Genitiv · Genitive'
  },
  levels: { akk: 'A1', dat: 'A2', pron: 'A2', gen: 'B1' },
  opts: {
    nom: { name: 'Nominativ · Nominative', use: 'the subject (who does it), and after sein, werden, heißen: der, ein, mein' },
    akk: { name: 'Akkusativ · Accusative', use: 'the direct object (who or what is affected), after es gibt and haben, and after durch, für, gegen, ohne, um. Only the masculine changes: den, einen, meinen' },
    dat: { name: 'Dativ · Dative', use: 'the person who receives (indirect object), after verbs like helfen, danken, gefallen, gehören, and after aus, bei, mit, nach, seit, von, zu: dem, der, den …-n' },
    gen: { name: 'Genitiv · Genitive', use: 'whose (das Auto meines Bruders), and after wegen, trotz, während, statt: des …-s, der' }
  },
  rules: {
    nom_subj: ['The subject is nominative', 'The person or thing doing the action is in the nominative. Find it by asking wer? or was? before the verb. German word order is flexible, so the subject is not always first: the article tells you.', 'Der Mann wohnt in Hamburg.'],
    nom_pred: ['After sein, werden, heißen: nominative', 'Sein, werden, heißen and bleiben connect two things that are the same person or thing. Both sides are nominative.', 'Das ist mein Lehrer.'],
    akk_obj: ['The direct object is accusative', 'The person or thing that the action affects is accusative: ask wen? or was? In the accusative only masculine articles change: der → den, ein → einen, mein → meinen. Feminine, neuter and plural look like the nominative.', 'Ich sehe den Mann.'],
    akk_es_gibt: ['Es gibt + accusative', 'Es gibt (there is, there are) always takes the accusative, because what “is given” is the object of gibt.', 'Es gibt hier einen guten Bäcker.'],
    dat_io: ['The receiver is dative', 'With verbs of giving, showing, telling, explaining (geben, schenken, zeigen, sagen, erklären), the person who receives is dative and the thing is accusative. Dative endings: dem (m, n), der (f), den + -n (plural).', 'Sie gibt dem Kind das Buch.'],
    dat_verb: ['Verbs with the dative', 'A group of common verbs takes the dative instead of the accusative: helfen, danken, gefallen, gehören, antworten, gratulieren, passen, schmecken, fehlen, folgen. Learn them as a list.', 'Ich helfe meinem Nachbarn.'],
    dat_es: ['Wie geht es + dative', 'In set phrases about how someone feels, the person is dative: Wie geht es dir? Mir ist kalt. Es tut mir leid.', 'Wie geht es deinem Vater?'],
    gen_poss: ['The genitive shows whose', 'The owner follows the thing owned and is in the genitive: des (m, n) with -s or -es on the noun, der (f, plural). In speech, von + dative is common: das Auto von meinem Bruder.', 'Das ist das Auto meines Bruders.'],
    gen_prep: ['Prepositions with the genitive', 'Wegen, trotz, während and statt take the genitive in writing. In everyday speech you often hear the dative (wegen dem Regen), but the genitive is the standard.', 'Wegen des Regens bleiben wir zu Hause.'],
    pron_akk: ['Pronouns in the accusative', 'mich, dich, ihn, sie, es, uns, euch, sie, Sie. Used for the direct object and after accusative prepositions (für, durch, ohne, gegen, um) and verbs with a preposition like warten auf.', 'Ich liebe dich.'],
    pron_dat: ['Pronouns in the dative', 'mir, dir, ihm, ihr, ihm, uns, euch, ihnen, Ihnen. Used for the receiver, after dative verbs (helfen, gefallen, gehören) and after dative prepositions (mit, bei, von, zu).', 'Kannst du mir helfen?']
  },
  fnote: q => `Needed: the ${['nominative', 'accusative', 'dative', 'genitive'][['nom', 'akk', 'dat', 'gen'].indexOf(q.o1[q.a1].kind)]} of ${q.hint}.`,
  data: `
akk|Ich sehe ___ jeden Morgen.|I see the man every morning.|der Mann||akk|der Mann;den Mann;dem Mann;des Mannes||akk_obj|sehe|
akk|___ wohnt in Hamburg.|The man lives in Hamburg.|der Mann||nom|Der Mann;Den Mann;Dem Mann;Des Mannes||nom_subj|wohnt|
akk|Wir brauchen ___.|We need a new table.|ein neuer Tisch||akk|ein neuer Tisch;einen neuen Tisch;einem neuen Tisch;eines neuen Tisches||akk_obj|brauchen|
akk|Hast du ___?|Do you have a brother?|ein Bruder||akk|ein Bruder;einen Bruder;einem Bruder;eines Bruders||akk_obj|Hast|Haben always takes the accusative.
akk|Das ist ___.|That is my teacher.|mein Lehrer||nom|mein Lehrer;meinen Lehrer;meinem Lehrer;meines Lehrers||nom_pred|ist|
akk|Es gibt hier ___.|There is a good baker here.|ein guter Bäcker||akk|ein guter Bäcker;einen guten Bäcker;einem guten Bäcker;eines guten Bäckers||akk_es_gibt|Es gibt|
akk|Sie kauft ___.|She is buying the blue coat.|der blaue Mantel||akk|der blaue Mantel;den blauen Mantel;dem blauen Mantel;des blauen Mantels||akk_obj|kauft|
akk|___ kostet zwei Euro.|The pen costs two euros.|der Kuli||nom|Der Kuli;Den Kuli;Dem Kuli;Des Kulis||nom_subj|kostet|
akk|Kennst du ___?|Do you know the new colleague?|der neue Kollege||akk|der neue Kollege;den neuen Kollegen;dem neuen Kollegen;des neuen Kollegen||akk_obj|Kennst|Kollege is an n-noun: it adds -n in every case except the nominative.|A2
akk|Ich trinke ___.|I'm drinking a coffee.|ein Kaffee||akk|ein Kaffee;einen Kaffee;einem Kaffee;eines Kaffees||akk_obj|trinke|
akk|Wir besuchen am Wochenende ___.|We're visiting our grandfather at the weekend.|unser Großvater||akk|unser Großvater;unseren Großvater;unserem Großvater;unseres Großvaters||akk_obj|besuchen|
akk|Den Film kennt ___ schon.|My father already knows the film.|mein Vater||nom|mein Vater;meinen Vater;meinem Vater;meines Vaters||nom_subj|kennt|Den Film comes first, but it is the object (den). The subject is after the verb.|A2
akk|Mein Bruder wird ___.|My brother is becoming a doctor.|ein Arzt||nom|ein Arzt;einen Arzt;einem Arzt;eines Arztes||nom_pred|wird|
dat|Ich helfe ___.|I'm helping my neighbour.|mein Nachbar||dat|mein Nachbar;meinen Nachbarn;meinem Nachbarn;meines Nachbarn||dat_verb|helfe|Nachbar is an n-noun: meinem Nachbarn.
dat|Sie gibt ___ das Buch.|She gives the child the book.|das Kind||dat|das Kind;das Kind;dem Kind;des Kindes||dat_io|gibt|
dat|Der Pullover gefällt ___.|My sister likes the sweater.|meine Schwester||dat|meine Schwester;meine Schwester;meiner Schwester;meiner Schwester||dat_verb|gefällt|With gefallen, the thing liked is the subject and the person is dative.
dat|Wir danken ___ für die Hilfe.|We thank our teacher for the help.|unsere Lehrerin||dat|unsere Lehrerin;unsere Lehrerin;unserer Lehrerin;unserer Lehrerin||dat_verb|danken|
dat|Das Auto gehört ___.|The car belongs to my father.|mein Vater||dat|mein Vater;meinen Vater;meinem Vater;meines Vaters||dat_verb|gehört|
dat|Ich schenke ___ Blumen.|I'm giving my mother flowers.|meine Mutter||dat|meine Mutter;meine Mutter;meiner Mutter;meiner Mutter||dat_io|schenke|
dat|Kannst du bitte ___ antworten?|Can you answer the customer, please?|der Kunde||dat|der Kunde;den Kunden;dem Kunden;des Kunden||dat_verb|antworten|Kunde is an n-noun: dem Kunden.|B1
dat|Wir gratulieren ___ zum Geburtstag.|We congratulate the children on their birthday.|die Kinder||dat|die Kinder;die Kinder;den Kindern;der Kinder||dat_verb|gratulieren|The dative plural adds -n: den Kindern.
dat|Er zeigt ___ die Stadt.|He shows the guests the city.|die Gäste||dat|die Gäste;die Gäste;den Gästen;der Gäste||dat_io|zeigt|The dative plural adds -n: den Gästen.
dat|Wie geht es ___?|How is your father?|dein Vater||dat|dein Vater;deinen Vater;deinem Vater;deines Vaters||dat_es|geht es|
dat|Ich erkläre ___ die Regel.|I'm explaining the rule to the student.|die Schülerin||dat|die Schülerin;die Schülerin;der Schülerin;der Schülerin||dat_io|erkläre|
dat|Die Suppe schmeckt ___ nicht.|The guest doesn't like the soup.|der Gast||dat|der Gast;den Gast;dem Gast;des Gastes||dat_verb|schmeckt|
pron|Kannst du ___ helfen?|Can you help me?|ich|nom;akk;dat|dat|ich;mich;mir||pron_dat|helfen|
pron|Ich liebe ___.|I love you.|du|nom;akk;dat|akk|du;dich;dir||pron_akk|liebe|
pron|Das Buch gehört ___.|The book belongs to him.|er|nom;akk;dat|dat|er;ihn;ihm||pron_dat|gehört|
pron|Wir sehen ___ morgen.|We'll see her tomorrow.|sie (she)|nom;akk;dat|akk|sie;sie;ihr||pron_akk|sehen|
pron|Ich rufe ___ später an.|I'll call you (all) later.|ihr|nom;akk;dat|akk|ihr;euch;euch||pron_akk|rufe|Anrufen takes the accusative in German.
pron|Gefällt ___ die Musik?|Do you (formal) like the music?|Sie|nom;akk;dat|dat|Sie;Sie;Ihnen||pron_dat|Gefällt|
pron|Kennst du ___?|Do you know them?|sie (they)|nom;akk;dat|akk|sie;sie;ihnen||pron_akk|Kennst|
pron|Er hat ___ ein Geschenk gegeben.|He gave us a present.|wir|nom;akk;dat|dat|wir;uns;uns||pron_dat|gegeben|Uns is both accusative and dative.
pron|Ich warte auf ___.|I'm waiting for you.|du|nom;akk;dat|akk|du;dich;dir||pron_akk|auf|Warten auf takes the accusative.
pron|Kommst du mit ___?|Are you coming with me?|ich|nom;akk;dat|dat|ich;mich;mir||pron_dat|mit|Mit always takes the dative.
pron|Das ist für ___.|That's for him.|er|nom;akk;dat|akk|er;ihn;ihm||pron_akk|für|Für always takes the accusative.
gen|Das ist das Auto ___.|That is my brother's car.|mein Bruder||gen|mein Bruder;meinen Bruder;meinem Bruder;meines Bruders||gen_poss|das Auto|
gen|Die Farbe ___ gefällt mir.|I like the colour of the dress.|das Kleid||gen|das Kleid;das Kleid;dem Kleid;des Kleides||gen_poss|Die Farbe|
gen|Am Ende ___ gibt es ein Fest.|At the end of the week there's a party.|die Woche||gen|die Woche;die Woche;der Woche;der Woche||gen_poss|Am Ende|
gen|Die Wohnung ___ ist sehr groß.|My parents' flat is very big.|meine Eltern||gen|meine Eltern;meine Eltern;meinen Eltern;meiner Eltern||gen_poss|Die Wohnung|
gen|Das Büro ___ ist im dritten Stock.|The boss's office is on the third floor.|der Chef||gen|der Chef;den Chef;dem Chef;des Chefs||gen_poss|Das Büro|
gen|Die Meinung ___ ist wichtig.|The customer's opinion is important.|der Kunde||gen|der Kunde;den Kunden;dem Kunden;des Kunden||gen_poss|Die Meinung|N-nouns take -n, not -s: des Kunden.|B2
gen|Wegen ___ bleiben wir zu Hause.|Because of the rain we're staying at home.|der Regen||gen|der Regen;den Regen;dem Regen;des Regens||gen_prep|Wegen|
gen|Während ___ darf man nicht sprechen.|You mustn't talk during the exam.|die Prüfung||gen|die Prüfung;die Prüfung;der Prüfung;der Prüfung||gen_prep|Während|
gen|Trotz ___ sind wir gewandert.|We went hiking despite the bad weather.|das schlechte Wetter||gen|das schlechte Wetter;das schlechte Wetter;dem schlechten Wetter;des schlechten Wetters||gen_prep|Trotz|
gen|Der Titel ___ ist lang.|The title of the book is long.|das Buch||gen|das Buch;das Buch;dem Buch;des Buches||gen_poss|Der Titel|
`
});
