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
`
});
