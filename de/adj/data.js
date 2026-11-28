/* Adjektivendungen. Format: see shared/lines.js. */
buildLine({
  id: 'de-adj', step1: 'Which declension?', step1Short: 'Declension', scoreLabel: 'Types right', keepOrder1: true,
  kinds: ['weak', 'mixed', 'strong'],
  topics: {
    weak: 'Nach der, die, das · After the definite article',
    mixed: 'Nach ein, kein, mein · After ein-words',
    strong: 'Ohne Artikel · No article',
    quant: 'Nach viele, alle, etwas · After quantifiers'
  },
  levels: { weak: 'A2', mixed: 'B1', strong: 'B1', quant: 'B2' },
  opts: {
    weak: { name: 'Schwach · Weak', use: 'after der, die, das, dieser, jeder, welcher, alle, beide: the article already shows the case, so the adjective only takes -e (nominative singular, and accusative feminine and neuter) or -en (everything else)' },
    mixed: { name: 'Gemischt · Mixed', use: 'after ein, kein and the possessives (mein, dein, unser …): where ein has no ending (masculine nominative, neuter nominative and accusative), the adjective shows the gender: -er, -es; elsewhere like weak' },
    strong: { name: 'Stark · Strong', use: 'with no article, or after viele, einige, mehrere, wenige, etwas, nichts: the adjective takes the ending the article would have had: -er, -es, -e, -en, -em' }
  },
  rules: {
    adj_weak: ['After der, die, das: -e or -en', 'When a definite article (or dieser, jeder, welcher) is there, the article does the work. The adjective ends in -e in the five “nominative-like” places: der/die/das in the nominative singular, and die/das in the accusative. Everywhere else, including every dative, genitive and plural: -en.', 'der alte Mann, den alten Mann, mit dem neuen Auto, die großen Häuser'],
    adj_mixed: ['After ein, kein, mein: show the gender where ein can’t', 'Ein, kein and the possessives have no ending in three places: masculine nominative (ein), neuter nominative and accusative (ein). There the adjective takes the missing ending: ein netter Mann, ein schnelles Auto. Everywhere else the endings are the same as after der: -e or -en.', 'ein netter Mann, einen guten Job, in einer kleinen Wohnung'],
    adj_strong: ['No article: the adjective takes the article’s ending', 'When there is no article, the adjective has to show case and gender itself, so it takes the ending of der/die/das: -er (der), -e (die), -es (das), -en (den), -em (dem). The only exception: masculine and neuter genitive take -en (wegen schlechten Wetters).', 'heißen Kaffee, mit frischer Butter, bei schönem Wetter'],
    adj_quant: ['Quantifiers: viele works like no article, alle like der', 'Viele, einige, mehrere, wenige and numbers are not articles, so the adjective takes strong endings (viele gute Freunde). Alle and beide work like die, so the adjective is weak (alle neuen Studenten).', 'viele gute Freunde, alle neuen Studenten'],
    adj_nom: ['Adjectives as nouns after etwas, nichts, alles', 'After etwas, nichts, viel, wenig the adjective becomes a capitalised neuter noun with the strong ending -es: etwas Neues, nichts Besonderes. After alles it is weak: alles Gute.', 'Etwas Neues ist passiert.']
  },
  fnote: q => `${q.hint}: ${['weak', 'mixed', 'strong'][q.a1]} declension.`,
  data: `
weak|Der ___ Mann ist mein Onkel.|The old man is my uncle.|alt||weak|alte;alten;alter;altes;altem|alte|adj_weak|Der|After der in the masculine nominative: -e.
weak|Ich kenne den ___ Mann.|I know the old man.|alt||weak|alte;alten;alter;altes;altem|alten|adj_weak|den|Masculine accusative after den: -en.
weak|Mit dem ___ Auto fahren wir nach Italien.|We're driving to Italy in the new car.|neu||weak|neue;neuen;neuer;neues;neuem|neuen|adj_weak|dem|After an article, every dative takes -en.
weak|Die ___ Häuser sind teuer.|The big houses are expensive.|groß||weak|große;großen;großer;großes;großem|großen|adj_weak|Die|Plural after die: -en.
weak|Das ___ Kind spielt im Garten.|The little child is playing in the garden.|klein||weak|kleine;kleinen;kleiner;kleines;kleinem|kleine|adj_weak|Das|Neuter nominative after das: -e.
weak|Ich nehme die ___ Jacke.|I'll take the red jacket.|rot||weak|rote;roten;roter;rotes;rotem|rote|adj_weak|die|Feminine accusative looks like the nominative: -e.
weak|Diese ___ Schuhe sind bequem.|These black shoes are comfortable.|schwarz||weak|schwarze;schwarzen;schwarzer;schwarzes;schwarzem|schwarzen|adj_weak|Diese|Dieser, jeder, welcher work like der.
weak|Wir wohnen in der ___ Straße.|We live in the quiet street.|ruhig||weak|ruhige;ruhigen;ruhiger;ruhiges;ruhigem|ruhigen|adj_weak|der|Dative feminine after der: -en.
weak|Der Preis des ___ Hotels war hoch.|The price of the new hotel was high.|neu||weak|neue;neuen;neuer;neues;neuem|neuen|adj_weak|des|Genitive after an article: -en.|B1
weak|Welchen ___ Film möchtest du sehen?|Which new film would you like to see?|neu||weak|neue;neuen;neuer;neues;neuem|neuen|adj_weak|Welchen||B1
weak|Jedes ___ Kind bekommt ein Eis.|Every small child gets an ice cream.|klein||weak|kleine;kleinen;kleiner;kleines;kleinem|kleine|adj_weak|Jedes||B1
mixed|Das ist ein ___ Mann.|That is a nice man.|nett||mixed|nette;netten;netter;nettes;nettem|netter|adj_mixed|ein|Ein shows no gender here, so the adjective does: -er.
mixed|Sie hat ein ___ Auto.|She has a fast car.|schnell||mixed|schnelle;schnellen;schneller;schnelles;schnellem|schnelles|adj_mixed|ein|Neuter after ein: -es.
mixed|Ich suche einen ___ Job.|I'm looking for a good job.|gut||mixed|gute;guten;guter;gutes;gutem|guten|adj_mixed|einen|Einen already shows the case: -en.
mixed|Er wohnt in einer ___ Wohnung.|He lives in a small flat.|klein||mixed|kleine;kleinen;kleiner;kleines;kleinem|kleinen|adj_mixed|einer|
mixed|Mein ___ Bruder studiert in Wien.|My older brother studies in Vienna.|älter||mixed|ältere;älteren;älterer;älteres;älterem|älterer|adj_mixed|Mein|Possessives work like ein. Comparatives take the same endings.
mixed|Das ist keine ___ Idee.|That's not a bad idea.|schlecht||mixed|schlechte;schlechten;schlechter;schlechtes;schlechtem|schlechte|adj_mixed|keine|Feminine nominative after eine or keine: -e.
mixed|Wir haben keine ___ Zimmer mehr.|We have no free rooms left.|frei||mixed|freie;freien;freier;freies;freiem|freien|adj_mixed|keine|Plural after keine or meine: -en.
mixed|Sie trägt ein ___ Kleid.|She's wearing a long dress.|lang||mixed|lange;langen;langer;langes;langem|langes|adj_mixed|ein|
mixed|Mit meinem ___ Freund gehe ich ins Kino.|I'm going to the cinema with my best friend.|best-||mixed|beste;besten;bester;bestes;bestem|besten|adj_mixed|meinem|
mixed|Das ist das Haus unseres ___ Nachbarn.|That's our new neighbour's house.|neu||mixed|neue;neuen;neuer;neues;neuem|neuen|adj_mixed|unseres||B2
strong|Ich trinke gern ___ Kaffee.|I like drinking hot coffee.|heiß||strong|heiße;heißen;heißer;heißes;heißem|heißen|adj_strong|trinke|No article: the adjective takes the ending of den: -en.
strong|Das ist ___ Wein aus Italien.|This is good wine from Italy.|gut||strong|gute;guten;guter;gutes;gutem|guter|adj_strong|ist|Masculine nominative without article: -er, like der.
strong|Wir essen ___ Brot.|We eat fresh bread.|frisch||strong|frische;frischen;frischer;frisches;frischem|frisches|adj_strong|essen|Neuter accusative without article: -es, like das.
strong|Ich wünsche dir ___ Erfolg.|I wish you great success.|groß||strong|große;großen;großer;großes;großem|großen|adj_strong|wünsche|
strong|Sie kocht mit ___ Butter.|She cooks with fresh butter.|frisch||strong|frische;frischen;frischer;frisches;frischem|frischer|adj_strong|mit|Feminine dative without article: -er, like der.
strong|Wir sprechen mit ___ Leuten.|We talk to friendly people.|freundlich||strong|freundliche;freundlichen;freundlicher;freundliches;freundlichem|freundlichen|adj_strong|mit|Dative plural: -en, like den.
strong|Bei ___ Wetter gehen wir spazieren.|In nice weather we go for a walk.|schön||strong|schöne;schönen;schöner;schönes;schönem|schönem|adj_strong|Bei|Neuter dative without article: -em, like dem.
strong|Das sind ___ Nachrichten.|That's good news.|gut||strong|gute;guten;guter;gutes;gutem|gute|adj_strong|sind|Plural nominative without article: -e, like die.
strong|Ich möchte ein Glas ___ Wasser.|I'd like a glass of cold water.|kalt||strong|kalte;kalten;kalter;kaltes;kaltem|kaltes|adj_strong|Glas|
strong|Mit ___ Grüßen, Anna|Kind regards, Anna|freundlich||strong|freundliche;freundlichen;freundlicher;freundliches;freundlichem|freundlichen|adj_strong|Mit|The standard closing of a letter.
strong|Wegen ___ Wetters fiel das Konzert aus.|The concert was cancelled because of bad weather.|schlecht||strong|schlechte;schlechten;schlechter;schlechtes;schlechtem|schlechten|adj_strong|Wetters|The exception: masculine and neuter genitive without article take -en, because the noun already ends in -s.|C1
quant|Ich habe viele ___ Freunde.|I have many good friends.|gut||strong|gute;guten;guter;gutes;gutem|gute|adj_quant|viele|
quant|Alle ___ Studenten waren da.|All the new students were there.|neu||weak|neue;neuen;neuer;neues;neuem|neuen|adj_quant|Alle|
quant|Einige ___ Kollegen kommen später.|Some older colleagues are coming later.|älter||strong|ältere;älteren;älterer;älteres;älterem|ältere|adj_quant|Einige|
quant|Beide ___ Kinder schlafen schon.|Both little children are already asleep.|klein||weak|kleine;kleinen;kleiner;kleines;kleinem|kleinen|adj_quant|Beide|
quant|Das Hotel hat mehrere ___ Zimmer.|The hotel has several large rooms.|groß||strong|große;großen;großer;großes;großem|große|adj_quant|mehrere|
quant|Etwas ___ ist passiert.|Something new has happened.|neu||strong|Neue;Neuen;Neuer;Neues;Neuem|Neues|adj_nom|Etwas||C1
quant|Ich wünsche dir alles ___!|I wish you all the best!|gut||weak|Gute;Guten;Guter;Gutes;Gutem|Gute|adj_nom|alles||C1
quant|Wir haben nichts ___ gefunden.|We found nothing interesting.|interessant||strong|Interessante;Interessanten;Interessanter;Interessantes;Interessantem|Interessantes|adj_nom|nichts||C1
`
});
