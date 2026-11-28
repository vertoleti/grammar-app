/* Präpositionen. Format: see shared/lines.js. */
buildLine({
  id: 'de-prep', step1: 'Which case?', step1Short: 'Case', scoreLabel: 'Cases right', keepOrder1: true,
  kinds: ['akk', 'dat', 'gen'],
  topics: {
    akkp: 'Mit Akkusativ · durch, für, gegen, ohne, um',
    datp: 'Mit Dativ · aus, bei, mit, nach, seit, von, zu',
    wech: 'Wechselpräpositionen · Two-way prepositions',
    genp: 'Mit Genitiv · wegen, trotz, während, statt'
  },
  levels: { akkp: 'A2', datp: 'A2', wech: 'B1', genp: 'B2' },
  opts: {
    akk: { name: 'Akkusativ · Accusative', use: 'after durch, für, gegen, ohne, um (and bis, entlang); after the two-way prepositions when there is movement to a new place (wohin?)' },
    dat: { name: 'Dativ · Dative', use: 'after aus, außer, bei, gegenüber, mit, nach, seit, von, zu; after the two-way prepositions for a location (wo?)' },
    gen: { name: 'Genitiv · Genitive', use: 'after wegen, trotz, während, statt, innerhalb, außerhalb and most formal prepositions' }
  },
  rules: {
    akk_prep: ['durch, für, gegen, ohne, um + accusative', 'These five always take the accusative. A memory aid is the made-up word DOGFU: durch, ohne, gegen, für, um.', 'Das Geschenk ist für meinen Vater.'],
    dat_prep: ['aus, bei, mit, nach, seit, von, zu + dative', 'These always take the dative, even when there is movement: zu dem Arzt (zum Arzt), nach der Arbeit. Contractions: zu + dem = zum, zu + der = zur, von + dem = vom, bei + dem = beim.', 'Ich fahre mit dem Bus.'],
    wechsel_akk: ['Two-way preposition + movement: accusative', 'an, auf, hinter, in, neben, über, unter, vor, zwischen take the accusative when something moves to a new place: the question is wohin? Verbs like legen, stellen, setzen, hängen (transitive), gehen, fahren. Contractions: in + das = ins, an + das = ans.', 'Ich lege das Buch auf den Tisch.'],
    wechsel_dat: ['Two-way preposition + location: dative', 'The same prepositions take the dative for where something is: the question is wo? Verbs like liegen, stehen, sitzen, hängen (intransitive), sein, wohnen, treffen. Contractions: in + dem = im, an + dem = am.', 'Das Buch liegt auf dem Tisch.'],
    gen_prep: ['wegen, trotz, während, statt + genitive', 'In standard written German these take the genitive. In everyday speech the dative is common (wegen dem Wetter), but in exams and formal writing use the genitive.', 'Wegen des Sturms fällt das Spiel aus.']
  },
  fnote: q => `${q.hint} → ${q.forms[q.a2]}.`,
  data: `
akkp|Das Geschenk ist für ___.|The present is for my father.|mein Vater|akk;dat;gen|akk|meinen Vater;meinem Vater;meines Vaters|meinen Vater|akk_prep|für|
akkp|Wir gehen durch ___.|We're walking through the park.|der Park|akk;dat;gen|akk|den Park;dem Park;des Parks|den Park|akk_prep|durch|
akkp|Ich fahre ohne ___ in den Urlaub.|I'm going on holiday without my brother.|mein Bruder|akk;dat;gen|akk|meinen Bruder;meinem Bruder;meines Bruders|meinen Bruder|akk_prep|ohne|
akkp|Er ist gegen ___ gefahren.|He drove into a tree.|ein Baum|akk;dat;gen|akk|einen Baum;einem Baum;eines Baumes|einen Baum|akk_prep|gegen|
akkp|Wir sitzen um ___ herum.|We're sitting around the table.|der Tisch|akk;dat;gen|akk|den Tisch;dem Tisch;des Tisches|den Tisch|akk_prep|um|
akkp|Ich habe nichts gegen ___.|I have nothing against your friend.|dein Freund|akk;dat;gen|akk|deinen Freund;deinem Freund;deines Freundes|deinen Freund|akk_prep|gegen|
akkp|Danke für ___!|Thanks for the flowers!|die Blumen|akk;dat;gen|akk|die Blumen;den Blumen;der Blumen|die Blumen|akk_prep|für|
datp|Ich fahre mit ___ zur Arbeit.|I go to work by bus.|der Bus|akk;dat;gen|dat|den Bus;dem Bus;des Busses|dem Bus|dat_prep|mit|
datp|Er kommt gerade aus ___.|He's just coming out of the office.|das Büro|akk;dat;gen|dat|das Büro;dem Büro;des Büros|dem Büro|dat_prep|aus|
datp|Seit ___ lerne ich Deutsch.|I've been learning German for a year.|ein Jahr|akk;dat;gen|dat|ein Jahr;einem Jahr;eines Jahres|einem Jahr|dat_prep|Seit|Seit + present tense: something that started in the past and is still going on.
datp|Nach ___ gehen wir spazieren.|After dinner we go for a walk.|das Essen|akk;dat;gen|dat|das Essen;dem Essen;des Essens|dem Essen|dat_prep|Nach|
datp|Ich wohne noch bei ___.|I still live with my parents.|meine Eltern|akk;dat;gen|dat|meine Eltern;meinen Eltern;meiner Eltern|meinen Eltern|dat_prep|bei|
datp|Ich muss heute ___.|I have to go to the doctor today.|zu + der Arzt|akk;dat;gen|dat|zum Arzt;zu den Arzt;zu des Arztes|zum Arzt|dat_prep|muss|Zu + dem = zum.
datp|Gegenüber ___ ist eine Bank.|Opposite the station there's a bank.|der Bahnhof|akk;dat;gen|dat|den Bahnhof;dem Bahnhof;des Bahnhofs|dem Bahnhof|dat_prep|Gegenüber||B1
datp|Das ist ein Brief von ___.|That's a letter from our son.|unser Sohn|akk;dat;gen|dat|unseren Sohn;unserem Sohn;unseres Sohnes|unserem Sohn|dat_prep|von|
datp|Außer ___ waren alle da.|Everyone was there except my sister.|meine Schwester|akk;dat;gen|dat|meine Schwester;meiner Schwester;meinen Schwestern|meiner Schwester|dat_prep|Außer||B1
wech|Ich lege das Buch auf ___.|I put the book on the table.|der Tisch|akk;dat|akk|den Tisch;dem Tisch|den Tisch|wechsel_akk|lege|
wech|Das Buch liegt auf ___.|The book is lying on the table.|der Tisch|akk;dat|dat|den Tisch;dem Tisch|dem Tisch|wechsel_dat|liegt|
wech|Wir gehen heute Abend ___.|We're going to the theatre tonight.|in + das Theater|akk;dat|akk|ins Theater;im Theater|ins Theater|wechsel_akk|gehen|In + das = ins.
wech|Wir waren gestern ___.|We were at the theatre yesterday.|in + das Theater|akk;dat|dat|ins Theater;im Theater|im Theater|wechsel_dat|waren|In + dem = im.
wech|Häng das Bild an ___!|Hang the picture on the wall!|die Wand|akk;dat|akk|die Wand;der Wand|die Wand|wechsel_akk|Häng|
wech|Das Bild hängt an ___.|The picture is hanging on the wall.|die Wand|akk;dat|dat|die Wand;der Wand|der Wand|wechsel_dat|hängt|
wech|Die Katze springt auf ___.|The cat jumps onto the sofa.|das Sofa|akk;dat|akk|das Sofa;dem Sofa|das Sofa|wechsel_akk|springt|
wech|Der Hund schläft unter ___.|The dog sleeps under the bed.|das Bett|akk;dat|dat|das Bett;dem Bett|dem Bett|wechsel_dat|schläft|
wech|Stell die Flaschen neben ___!|Put the bottles next to the fridge!|der Kühlschrank|akk;dat|akk|den Kühlschrank;dem Kühlschrank|den Kühlschrank|wechsel_akk|Stell|
wech|Zwischen ___ steht ein Baum.|There's a tree between the houses.|die Häuser|akk;dat|dat|die Häuser;den Häusern|den Häusern|wechsel_dat|steht|
wech|Er setzt sich neben ___.|He sits down next to me.|ich|akk;dat|akk|mich;mir|mich|wechsel_akk|setzt sich|
wech|Er sitzt neben ___.|He is sitting next to me.|ich|akk;dat|dat|mich;mir|mir|wechsel_dat|sitzt|
wech|Wir treffen uns vor ___.|We're meeting in front of the cinema.|das Kino|akk;dat|dat|das Kino;dem Kino|dem Kino|wechsel_dat|treffen uns|Meeting at a place: wo? dative.
wech|Am Wochenende fahren wir ___.|At the weekend we're going to the seaside.|an + das Meer|akk;dat|akk|ans Meer;am Meer|ans Meer|wechsel_akk|fahren|An + das = ans.
wech|Die Lampe hängt über ___.|The lamp hangs above the table.|der Tisch|akk;dat|dat|den Tisch;dem Tisch|dem Tisch|wechsel_dat|hängt|Hängen without an object describes where something is: dative.|B1
genp|Wegen ___ fällt das Spiel aus.|The match is cancelled because of the storm.|der Sturm|akk;dat;gen|gen|den Sturm;dem Sturm;des Sturms|des Sturms|gen_prep|Wegen|
genp|Trotz ___ ist er gekommen.|He came despite his cold.|sein Schnupfen|akk;dat;gen|gen|seinen Schnupfen;seinem Schnupfen;seines Schnupfens|seines Schnupfens|gen_prep|Trotz|
genp|Statt ___ hat sie Tee getrunken.|She drank tea instead of a coffee.|ein Kaffee|akk;dat;gen|gen|einen Kaffee;einem Kaffee;eines Kaffees|eines Kaffees|gen_prep|Statt|
genp|Während ___ hat er geschlafen.|He slept during the film.|der Film|akk;dat;gen|gen|den Film;dem Film;des Films|des Films|gen_prep|Während|
genp|Wegen ___ müssen wir warten.|We have to wait because of the traffic jam.|der Stau|akk;dat;gen|gen|den Stau;dem Stau;des Staus|des Staus|gen_prep|Wegen|
genp|Innerhalb ___ bekommen Sie eine Antwort.|You'll get an answer within a month.|ein Monat|akk;dat;gen|gen|einen Monat;einem Monat;eines Monats|eines Monats|gen_prep|Innerhalb|
genp|Außerhalb ___ ist es ruhiger.|It's quieter outside the city centre.|das Zentrum|akk;dat;gen|gen|das Zentrum;dem Zentrum;des Zentrums|des Zentrums|gen_prep|Außerhalb|
akkp|Wir fahren ohne ___ in den Urlaub.|We're going on holiday without the children.|die Kinder|akk;dat;gen|akk|die Kinder;den Kindern;der Kinder|die Kinder|akk_prep|ohne|
akkp|Er läuft um ___ herum.|He runs around the lake.|der See|akk;dat;gen|akk|den See;dem See;des Sees|den See|akk_prep|um|
akkp|Das Auto fuhr gegen ___.|The car drove into a tree.|ein Baum|akk;dat;gen|akk|einen Baum;einem Baum;eines Baums|einen Baum|akk_prep|gegen|
akkp|Wir gehen durch ___ zum Bahnhof.|We're walking through the town centre to the station.|das Zentrum|akk;dat;gen|akk|das Zentrum;dem Zentrum;des Zentrums|das Zentrum|akk_prep|durch|
akkp|Ich mache das für ___.|I'm doing it for my grandmother.|meine Oma|akk;dat;gen|akk|meine Oma;meiner Oma;meiner Oma|meine Oma|akk_prep|für|
akkp|Ohne ___ kann ich nicht arbeiten.|I can't work without my glasses.|meine Brille|akk;dat;gen|akk|meine Brille;meiner Brille;meiner Brille|meine Brille|akk_prep|Ohne|
akkp|Wir sitzen um ___.|We're sitting round the big table.|der große Tisch|akk;dat;gen|akk|den großen Tisch;dem großen Tisch;des großen Tisches|den großen Tisch|akk_prep|um|
akkp|Die Straße führt durch ___.|The road leads through the forest.|der Wald|akk;dat;gen|akk|den Wald;dem Wald;des Waldes|den Wald|akk_prep|durch|
akkp|Sie kämpft für ___.|She's fighting for her rights.|ihre Rechte|akk;dat;gen|akk|ihre Rechte;ihren Rechten;ihrer Rechte|ihre Rechte|akk_prep|für|
akkp|Bis ___ muss alles fertig sein.|Everything has to be ready by next week.|nächste Woche|akk;dat;gen|akk|nächste Woche;nächster Woche;nächster Woche|nächste Woche|akk_prep|Bis|Bis + a time without an article: the accusative.
datp|Ich wohne bei ___.|I'm living with my aunt.|meine Tante|akk;dat;gen|dat|meine Tante;meiner Tante;meiner Tante|meiner Tante|dat_prep|bei|
datp|Das Geschenk ist von ___.|The present is from my friends.|meine Freunde|akk;dat;gen|dat|meine Freunde;meinen Freunden;meiner Freunde|meinen Freunden|dat_prep|von|Dative plural: -n on the noun too.
datp|Wir fahren zu ___.|We're driving to my parents'.|meine Eltern|akk;dat;gen|dat|meine Eltern;meinen Eltern;meiner Eltern|meinen Eltern|dat_prep|zu|
datp|Gegenüber ___ ist eine Apotheke.|Opposite the station there's a pharmacy.|der Bahnhof|akk;dat;gen|dat|den Bahnhof;dem Bahnhof;des Bahnhofs|dem Bahnhof|dat_prep|Gegenüber|
datp|Ich gehe mit ___ ins Kino.|I'm going to the cinema with my colleague.|meine Kollegin|akk;dat;gen|dat|meine Kollegin;meiner Kollegin;meiner Kollegin|meiner Kollegin|dat_prep|mit|
datp|Das Buch ist aus ___.|The book is from the library.|die Bibliothek|akk;dat;gen|dat|die Bibliothek;der Bibliothek;der Bibliothek|der Bibliothek|dat_prep|aus|
datp|Wir haben nach ___ gesucht.|We searched for a solution.|eine Lösung|akk;dat;gen|dat|eine Lösung;einer Lösung;einer Lösung|einer Lösung|dat_prep|nach|
datp|Ab ___ habe ich Urlaub.|I'm on holiday from Monday.|der Montag|akk;dat;gen|dat|den Montag;dem Montag;des Montags|dem Montag|dat_prep|Ab|
wech|Ich hänge das Bild an ___.|I'm hanging the picture on the wall.|die Wand|akk;dat|akk|die Wand;der Wand|die Wand|wechsel_akk|hänge|Movement to a place (wohin?): accusative.
wech|Wir gehen heute in ___.|We're going to the theatre today.|das Theater|akk;dat|akk|das Theater;dem Theater|das Theater|wechsel_akk|gehen|
wech|Die Katze schläft unter ___.|The cat is sleeping under the bed.|das Bett|akk;dat|dat|das Bett;dem Bett|dem Bett|wechsel_dat|schläft|
wech|Stell die Flaschen neben ___.|Put the bottles next to the fridge.|der Kühlschrank|akk;dat|akk|den Kühlschrank;dem Kühlschrank|den Kühlschrank|wechsel_akk|Stell|
wech|Er setzt sich vor ___.|He sits down in front of the computer.|der Computer|akk;dat|akk|den Computer;dem Computer|den Computer|wechsel_akk|setzt sich|Sich setzen is a movement: accusative.
wech|Er sitzt den ganzen Tag vor ___.|He sits in front of the computer all day.|der Computer|akk;dat|dat|den Computer;dem Computer|dem Computer|wechsel_dat|sitzt|
genp|Während ___ war ich in Spanien.|During the holidays I was in Spain.|die Ferien|akk;dat;gen|gen|die Ferien;den Ferien;der Ferien|der Ferien|gen_prep|Während|
genp|Statt ___ haben wir Tee getrunken.|Instead of coffee we drank tea.|der Kaffee|akk;dat;gen|gen|den Kaffee;dem Kaffee;des Kaffees|des Kaffees|gen_prep|Statt|
genp|Innerhalb ___ müssen Sie zahlen.|You have to pay within a month.|ein Monat|akk;dat;gen|gen|einen Monat;einem Monat;eines Monats|eines Monats|gen_prep|Innerhalb|
genp|Wegen ___ kam er zu spät.|He was late because of the traffic jam.|der Stau|akk;dat;gen|gen|den Stau;dem Stau;des Staus|des Staus|gen_prep|Wegen|
genp|Trotz ___ ist das Restaurant immer voll.|Despite the high prices the restaurant is always full.|die hohen Preise|akk;dat;gen|gen|die hohen Preise;den hohen Preisen;der hohen Preise|der hohen Preise|gen_prep|Trotz|
genp|Während ___ hat er kein Wort gesagt.|He didn't say a word during the meeting.|die Besprechung|akk;dat;gen|gen|die Besprechung;der Besprechung;der Besprechung|der Besprechung|gen_prep|Während|The feminine forms look alike: during = genitive.
genp|Oberhalb ___ liegt eine Hütte.|Above the village there's a hut.|das Dorf|akk;dat;gen|gen|das Dorf;dem Dorf;des Dorfes|des Dorfes|gen_prep|Oberhalb|
genp|Wegen ___ wurde die Straße gesperrt.|The road was closed because of an accident.|ein Unfall|akk;dat;gen|gen|einen Unfall;einem Unfall;eines Unfalls|eines Unfalls|gen_prep|Wegen|
genp|Anstatt ___ hat er eine Mail geschrieben.|Instead of a letter he wrote an email.|ein Brief|akk;dat;gen|gen|einen Brief;einem Brief;eines Briefes|eines Briefes|gen_prep|Anstatt|
genp|Trotz ___ hat sie die Prüfung bestanden.|She passed the exam despite her illness.|ihre Krankheit|akk;dat;gen|gen|ihre Krankheit;ihrer Krankheit;ihrer Krankheit|ihrer Krankheit|gen_prep|Trotz|
genp|Innerhalb ___ war alles geregelt.|Within a few days everything was settled.|wenige Tage|akk;dat;gen|gen|wenige Tage;wenigen Tagen;weniger Tage|weniger Tage|gen_prep|Innerhalb|
genp|Unterhalb ___ fließt ein Bach.|A stream flows below the castle.|die Burg|akk;dat;gen|gen|die Burg;der Burg;der Burg|der Burg|gen_prep|Unterhalb|
genp|Infolge ___ fiel der Strom aus.|As a result of the storm the power went out.|das Unwetter|akk;dat;gen|gen|das Unwetter;dem Unwetter;des Unwetters|des Unwetters|gen_prep|Infolge|
`
});
