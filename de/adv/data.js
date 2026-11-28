/* Fortgeschritten (B2–C2). Format: see shared/lines.js. Each item lists its own choices. */
buildLine({
  id: 'de-adv', step1: 'Which rule?', step1Short: 'Rule', scoreLabel: 'Rules right',
  kinds: [],
  topics: {
    vp: 'Verben mit Präposition · Verbs with prepositions',
    nd: 'n-Deklination · Weak masculine nouns',
    gf: 'Formelle Präpositionen · Formal prepositions',
    k1: 'Konjunktiv I · Reported speech',
    pa: 'Partizipialattribute · Participles as adjectives'
  },
  levels: { vp: 'B2', nd: 'B2', gf: 'C1', k1: 'C1', pa: 'C1' },
  opts: {
    akk: { name: 'Akkusativ · Accusative', use: 'warten auf, denken an, sich interessieren für, sich freuen auf/über, sich gewöhnen an, sprechen über, sich beschweren über, es geht um' },
    dat: { name: 'Dativ · Dative', use: 'teilnehmen an, abhängen von, Angst haben vor, bestehen aus, sich fürchten vor, träumen von; gemäß, entsprechend, zufolge' },
    gen: { name: 'Genitiv · Genitive', use: 'aufgrund, angesichts, hinsichtlich, bezüglich, infolge, anlässlich, mithilfe, innerhalb, außerhalb, oberhalb' },
    ndekl: { name: 'n-Deklination · Weak noun', use: 'masculine nouns for people and animals ending in -e (der Kollege, der Junge), in -ent, -ant, -ist, -at (Student, Patient, Polizist), and der Herr, Nachbar, Mensch, Bär: -(e)n in every case except the nominative singular' },
    normal: { name: 'Normal · Regular noun', use: 'all other nouns: no ending in the singular except -(e)s in the masculine and neuter genitive, and -n in the dative plural' },
    k1: { name: 'Konjunktiv I · Reported speech', use: 'reports what someone said, without the reporter vouching for it: er sei, sie habe, er komme, sie werde. Mainly in news and formal writing' },
    k2e: { name: 'Konjunktiv II als Ersatz · Replacement', use: 'when the Konjunktiv I looks the same as the indicative (sie haben, wir kommen), use the Konjunktiv II instead: sie hätten, wir kämen' },
    ind: { name: 'Indikativ · Indicative', use: 'when the speaker states something as a fact (ich weiß, dass er krank ist), and in everyday spoken reports' },
    p1: { name: 'Partizip I · -end (active, ongoing)', use: 'infinitive + -d + adjective ending: something that is happening or doing the action (die steigenden Preise, ein lachendes Kind)' },
    p2: { name: 'Partizip II · completed or passive', use: 'the past participle + adjective ending: something that has been done to the noun (das reparierte Auto, der geschätzte Kollege)' },
    p1zu: { name: 'zu + Partizip I · must or can be done', use: 'the gerundive: zu + infinitive + -d + ending: something that must or can be done (die zu lösende Aufgabe)' }
  },
  rules: {
    vp_akk: ['Verb + preposition + accusative', 'Many verbs come with a fixed preposition, and you have to learn the pair. With auf, an and über the case is not predictable from meaning; most abstract uses take the accusative: warten auf, denken an, sich freuen auf, sich gewöhnen an, sprechen über, sich beschweren über. Für and um always take the accusative.', 'Ich warte auf den Bus.'],
    vp_dat: ['Verb + preposition + dative', 'Verbs with von, aus, mit, nach, bei, zu always take the dative (abhängen von, bestehen aus). Some with an and vor take the dative too: teilnehmen an, Angst haben vor, sich fürchten vor, zweifeln an.', 'Wir nehmen am Kurs teil.'],
    n_dekl: ['The n-declension', 'Masculine nouns for people and animals ending in -e (Kollege, Junge, Kunde), foreign words in -ent, -ant, -ist, -at, -oge (Student, Praktikant, Polizist, Soldat, Biologe), and some others (Herr, Mensch, Nachbar, Bär) add -n or -en in every case except the nominative singular. Herr: den Herrn, die Herren.', 'Ich habe den Studenten gefragt.'],
    n_normal: ['Regular masculine nouns', 'Most masculine nouns stay unchanged in the singular, except for the -(e)s of the genitive. Don’t add -n to nouns like Lehrer, Gast, Arzt.', 'Ich gebe dem Lehrer das Buch.'],
    formal_gen: ['Formal prepositions with the genitive', 'Written and official German uses many prepositions made from nouns and adjectives, and almost all take the genitive: aufgrund, angesichts, hinsichtlich, bezüglich, infolge, anlässlich, mithilfe, zugunsten, innerhalb, außerhalb.', 'Aufgrund der hohen Kosten wurde das Projekt gestoppt.'],
    formal_dat: ['gemäß, entsprechend + dative', 'A small group of formal prepositions takes the dative: gemäß, entsprechend, zufolge (placed after the noun), gegenüber, entgegen.', 'Gemäß den Regeln ist das verboten.'],
    konj1: ['Konjunktiv I in reported speech', 'Konjunktiv I is formed from the infinitive stem + e: er komme, sie habe, er werde, and the irregular sei. It marks that you’re reporting someone else’s words. The tense of the original statement stays: present → sei, past → sei gewesen / habe gemacht, future → werde machen.', 'Er sagt, er sei krank.'],
    konj1_ersatz: ['When Konjunktiv I looks like the indicative, use Konjunktiv II', 'In the plural and the ich-form, Konjunktiv I often looks identical to the indicative (sie haben, wir kommen). Then the Konjunktiv II replaces it (sie hätten, wir kämen), or würde + infinitive.', 'Sie sagen, sie hätten keine Zeit.'],
    konj1_ind: ['Facts the speaker vouches for: indicative', 'After verbs where the speaker presents something as fact (wissen, sehen, beweisen), and in everyday spoken German, the indicative is normal.', 'Ich weiß, dass er krank ist.'],
    part_attr: ['Participles as adjectives', 'A participle can stand before a noun like an adjective and takes adjective endings. Partizip I (-end) is active and ongoing: die steigenden Preise (prices that are rising). Partizip II is completed or passive: das reparierte Auto (the car that has been repaired). Extra words go before it: der von allen geschätzte Kollege.', 'die steigenden Preise, das reparierte Auto'],
    part_gerundiv: ['zu + Partizip I: what must or can be done', 'The gerundive (zu + Partizip I + ending) replaces a relative clause with müssen/können + passive: die Aufgaben, die erledigt werden müssen → die zu erledigenden Aufgaben. Typical of formal and written German.', 'die noch zu erledigenden Aufgaben']
  },
  fnote: q => `${q.hint ? q.hint + ' → ' : ''}${q.forms[q.a2]}.`,
  data: `
vp|Ich warte schon lange ___.|I've been waiting for the bus for a long time.|der Bus|akk;dat|akk|auf den Bus;auf dem Bus;für den Bus;an den Bus|auf den Bus|vp_akk|warte|
vp|Denkst du noch oft ___?|Do you still often think about the holiday?|der Urlaub|akk;dat|akk|an den Urlaub;an dem Urlaub;über den Urlaub;auf den Urlaub|an den Urlaub|vp_akk|Denkst|
vp|Sie interessiert sich sehr ___.|She's very interested in art.|die Kunst|akk;dat|akk|für die Kunst;an der Kunst;über die Kunst;in die Kunst|für die Kunst|vp_akk|interessiert sich|
vp|Wir nehmen ___ teil.|We're taking part in the course.|der Kurs|akk;dat|dat|am Kurs;an den Kurs;beim Kurs;im Kurs|am Kurs|vp_dat|teil|Teilnehmen an + dative; an dem = am.
vp|Das hängt ___ ab.|That depends on the weather.|das Wetter|akk;dat|dat|vom Wetter;auf das Wetter;am Wetter;für das Wetter|vom Wetter|vp_dat|ab|
vp|Er hat sich ___ beschwert.|He complained about the noise.|der Lärm|akk;dat|akk|über den Lärm;über dem Lärm;auf den Lärm;für den Lärm|über den Lärm|vp_akk|beschwert|
vp|Ich freue mich schon ___.|I'm already looking forward to the weekend.|das Wochenende|akk;dat|akk|auf das Wochenende;über das Wochenende;an dem Wochenende;für das Wochenende|auf das Wochenende|vp_akk|freue mich|Sich freuen auf: looking forward to something to come. Sich freuen über: being glad about something now or past.
vp|Sie hat Angst ___.|She's afraid of the dog.|der Hund|akk;dat|dat|vor dem Hund;vor den Hund;für den Hund;an dem Hund|vor dem Hund|vp_dat|Angst|
vp|Ich habe mich ___ gewöhnt.|I've got used to the new job.|die neue Arbeit|akk;dat|akk|an die neue Arbeit;an der neuen Arbeit;auf die neue Arbeit;für die neue Arbeit|an die neue Arbeit|vp_akk|gewöhnt|
vp|Es geht ___.|It's about the future.|die Zukunft|akk;dat|akk|um die Zukunft;über die Zukunft;an die Zukunft;auf die Zukunft|um die Zukunft|vp_akk|Es geht|
vp|Die Wohnung besteht ___.|The flat consists of three rooms.|drei Zimmer|akk;dat|dat|aus drei Zimmern;aus drei Zimmer;von drei Zimmern;in drei Zimmern|aus drei Zimmern|vp_dat|besteht|The dative plural adds -n: Zimmern.|C1
vp|Wir sprechen morgen ___.|We'll talk about the problem tomorrow.|das Problem|akk;dat|akk|über das Problem;über dem Problem;um das Problem;an das Problem|über das Problem|vp_akk|sprechen|
vp|Er träumt ___.|He dreams of a house by the sea.|ein Haus am Meer|akk;dat|dat|von einem Haus am Meer;von ein Haus am Meer;über ein Haus am Meer;auf ein Haus am Meer|von einem Haus am Meer|vp_dat|träumt||C1
nd|Ich habe ___ gefragt.|I asked the student.|der Student|ndekl;normal|ndekl|den Studenten;den Student;dem Student;des Students|den Studenten|n_dekl|gefragt|
nd|Kennen Sie ___?|Do you know Mr Müller?|Herr Müller|ndekl;normal|ndekl|Herrn Müller;Herr Müller;Herren Müller;Herrns Müller|Herrn Müller|n_dekl|Kennen Sie|Herr: -n in the singular (Herrn), -en in the plural (Herren).
nd|Wir sprechen oft mit ___.|We often talk to the neighbour.|der Nachbar|ndekl;normal|ndekl|dem Nachbarn;dem Nachbar;den Nachbar;des Nachbars|dem Nachbarn|n_dekl|mit|
nd|Das ist das Auto ___.|That's the colleague's car.|der Kollege|ndekl;normal|ndekl|des Kollegen;des Kolleges;dem Kollege;des Kollegens|des Kollegen|n_dekl|das Auto|N-nouns take -n in the genitive, not -s.
nd|Ich gebe ___ das Heft.|I give the teacher the exercise book.|der Lehrer|ndekl;normal|normal|dem Lehrer;dem Lehrern;den Lehrern;dem Lehreren|dem Lehrer|n_normal|gebe|
nd|Der Arzt untersucht ___.|The doctor examines the patient.|der Patient|ndekl;normal|ndekl|den Patienten;den Patient;dem Patient;der Patient|den Patienten|n_dekl|untersucht|
nd|Ich kenne den Namen ___ nicht.|I don't know the boy's name.|der Junge|ndekl;normal|ndekl|des Jungen;des Junges;dem Junge;des Jungens|des Jungen|n_dekl|den Namen|
nd|Wir warten auf ___.|We're waiting for the guest.|der Gast|ndekl;normal|normal|den Gast;den Gasten;dem Gast;den Gäste|den Gast|n_normal|warten auf|
nd|Die Polizei hat ___ befragt.|The police questioned the witness.|der Zeuge|ndekl;normal|ndekl|den Zeugen;den Zeuge;dem Zeuge;des Zeuges|den Zeugen|n_dekl|befragt||C1
nd|Das gehört ___.|That belongs to the tourist.|der Tourist|ndekl;normal|ndekl|dem Touristen;dem Tourist;den Tourist;der Tourist|dem Touristen|n_dekl|gehört|
gf|Aufgrund ___ wurde das Projekt gestoppt.|Due to the high costs the project was stopped.|die hohen Kosten|akk;dat;gen|gen|der hohen Kosten;den hohen Kosten;die hohen Kosten|der hohen Kosten|formal_gen|Aufgrund|
gf|Angesichts ___ müssen wir handeln.|In view of climate change we must act.|der Klimawandel|akk;dat;gen|gen|des Klimawandels;dem Klimawandel;den Klimawandel|des Klimawandels|formal_gen|Angesichts|
gf|Hinsichtlich ___ gibt es noch Fragen.|There are still questions regarding the contract.|der Vertrag|akk;dat;gen|gen|des Vertrags;dem Vertrag;den Vertrag|des Vertrags|formal_gen|Hinsichtlich|
gf|Infolge ___ kam es zu Verspätungen.|As a result of the accident there were delays.|der Unfall|akk;dat;gen|gen|des Unfalls;dem Unfall;den Unfall|des Unfalls|formal_gen|Infolge|
gf|Anlässlich ___ gab es ein Fest.|There was a celebration on the occasion of the anniversary.|das Jubiläum|akk;dat;gen|gen|des Jubiläums;dem Jubiläum;das Jubiläum|des Jubiläums|formal_gen|Anlässlich|
gf|Gemäß ___ ist das verboten.|According to the rules, this is forbidden.|die Regeln|akk;dat;gen|dat|den Regeln;der Regeln;die Regeln|den Regeln|formal_dat|Gemäß|
gf|Entsprechend ___ haben wir den Preis gesenkt.|In line with your wish we have lowered the price.|Ihr Wunsch|akk;dat;gen|dat|Ihrem Wunsch;Ihres Wunsches;Ihren Wunsch|Ihrem Wunsch|formal_dat|Entsprechend|
gf|Mithilfe ___ fanden wir den Weg.|With the help of a satnav we found the way.|ein Navi|akk;dat;gen|gen|eines Navis;einem Navi;ein Navi|eines Navis|formal_gen|Mithilfe|
k1|Er sagt, er ___ krank.|He says he is ill.|sein|k1;k2e;ind|k1|sei;wäre;ist;war|sei|konj1|sagt|
k1|Sie sagte, sie ___ keine Zeit.|She said she had no time.|haben|k1;k2e;ind|k1|habe;hätte;hat;hatte|habe|konj1|sagte|
k1|Die Studenten sagen, sie ___ keine Zeit.|The students say they have no time.|haben|k1;k2e;ind|k2e|haben;hätten;hatten;habe|hätten|konj1_ersatz|Die Studenten sagen|Konjunktiv I would be sie haben, the same as the indicative, so the Konjunktiv II replaces it.
k1|Der Minister erklärte, er ___ nichts davon gewusst.|The minister said he had known nothing about it.|haben|k1;k2e;ind|k1|habe;hätte;hat;hatte|habe|konj1|erklärte|Past in reported speech: habe or sei + Partizip II.
k1|Laut Polizei ___ der Täter ins Ausland geflohen.|According to the police the culprit has fled abroad.|sein|k1;k2e;ind|k1|sei;wäre;ist;war|sei|konj1|Laut Polizei|
k1|Er fragte, ob sie morgen Zeit ___.|He asked whether she had time tomorrow.|haben|k1;k2e;ind|k1|habe;hätte;hatte;haben|habe|konj1|fragte, ob|
k1|Die Firma teilte mit, man ___ die Preise erhöhen.|The company announced that it would raise prices.|werden|k1;k2e;ind|k1|werde;würde;wird;wurde|werde|konj1|teilte mit|The future in reported speech: werde + infinitive.
k1|Ich weiß, dass er krank ___.|I know that he is ill.|sein|k1;k2e;ind|ind|ist;sei;wäre;war|ist|konj1_ind|weiß|
k1|Die Zeugen behaupten, sie ___ nichts gesehen.|The witnesses claim they saw nothing.|haben|k1;k2e;ind|k2e|hätten;haben;hatten;habe|hätten|konj1_ersatz|behaupten|Sie haben would look like the indicative: hätten.|C2
k1|Der Sprecher betonte, die Regierung ___ alles getan.|The spokesman stressed that the government had done everything.|haben|k1;k2e;ind|k1|habe;hätte;hat;hatte|habe|konj1|betonte||C2
pa|Die ___ Preise machen allen Sorgen.|The rising prices worry everyone.|steigen|p1;p2;p1zu|p1|steigenden;gestiegenen;zu steigenden;steigende|steigenden|part_attr|Preise|
pa|Das ___ Auto steht vor der Tür.|The repaired car is outside the door.|reparieren|p1;p2;p1zu|p2|reparierende;reparierte;zu reparierende;reparierten|reparierte|part_attr|Auto|
pa|Die noch ___ Aufgaben liegen auf dem Tisch.|The tasks still to be done are on the table.|erledigen|p1;p2;p1zu|p1zu|erledigenden;erledigten;zu erledigenden;zu erledigende|zu erledigenden|part_gerundiv|noch||C2
pa|Der von allen ___ Kollege geht in Rente.|The colleague respected by everyone is retiring.|schätzen|p1;p2;p1zu|p2|schätzende;geschätzte;zu schätzende;geschätzten|geschätzte|part_attr|von allen|
pa|Wir sahen ein ___ Kind.|We saw a laughing child.|lachen|p1;p2;p1zu|p1|lachendes;gelachtes;zu lachendes;lachende|lachendes|part_attr|Kind|
pa|Die im letzten Jahr ___ Studie zeigt das Gegenteil.|The study published last year shows the opposite.|veröffentlichen|p1;p2;p1zu|p2|veröffentlichende;veröffentlichte;zu veröffentlichende;veröffentlichten|veröffentlichte|part_attr|im letzten Jahr||C2
pa|Das ist ein schwer ___ Problem.|That's a problem that is hard to solve.|lösen|p1;p2;p1zu|p1zu|lösendes;gelöstes;zu lösendes;zu lösende|zu lösendes|part_gerundiv|schwer||C2
pa|Leise! Weck die ___ Kinder nicht.|Quiet! Don't wake the sleeping children.|schlafen|p1;p2;p1zu|p1|schlafenden;geschlafenen;zu schlafenden;schlafende|schlafenden|part_attr|Kinder|
pa|Die ___ Briefe liegen auf dem Schreibtisch.|The letters that have arrived are on the desk.|ankommen|p1;p2;p1zu|p2|ankommenden;angekommenen;anzukommenden;angekommene|angekommenen|part_attr|liegen|Angekommen: they have already arrived.|C1
`
});
