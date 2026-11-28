/* Konjunktiv II & Passiv. Format: see shared/lines.js. Each item lists its own choices. */
buildLine({
  id: 'de-konj', step1: 'Which construction?', step1Short: 'Construction', scoreLabel: 'Constructions right',
  kinds: [],
  topics: {
    k2: 'Konjunktiv II · Would, could, if',
    pas: 'Passiv · Passive',
    k2p: 'Konjunktiv II der Vergangenheit · Would have'
  },
  levels: { k2: 'B1', pas: 'B1', k2p: 'B2' },
  opts: {
    k2hs: { name: 'hätte / wäre · Konjunktiv II of haben, sein', use: 'the special forms hätte and wäre: unreal conditions, wishes and polite requests (ich hätte gern); with a participle they form the past: hätte gemacht, wäre gekommen' },
    k2w: { name: 'würde + Infinitiv · would + infinitive', use: 'würde + infinitive at the end: the usual Konjunktiv II for almost all other verbs (ich würde fahren, ich würde helfen)' },
    k2m: { name: 'Modalverb / wüsste · Modal verbs and wissen', use: 'modals and a few common verbs have their own forms: könnte, müsste, dürfte, sollte, wollte, wüsste, käme, ginge' },
    ind: { name: 'Indikativ · Real (indicative)', use: 'for facts and real possibilities: wenn ich Zeit habe (and I might), als ich jung war' },
    pp: { name: 'Passiv Präsens · wird + Partizip', use: 'something is being done (now, or in general): wird gebaut' },
    ppt: { name: 'Passiv Präteritum · wurde + Partizip', use: 'something was done: wurde gebaut, wurden verschickt' },
    pperf: { name: 'Passiv Perfekt · ist … worden', use: 'something has been done: ist gebaut worden. Worden, not geworden' },
    zust: { name: 'Zustandspassiv · ist + Partizip', use: 'the resulting state, not the action: die Tür ist geöffnet (it is open now)' },
    pmod: { name: 'Passiv mit Modalverb · muss … werden', use: 'modal + participle + werden at the end: muss repariert werden, darf nicht geraucht werden' }
  },
  rules: {
    k2_unreal: ['Unreal conditions: Konjunktiv II in both parts', 'For something that isn’t true or isn’t likely, both the wenn-part and the main part use Konjunktiv II: wäre, hätte, könnte, or würde + infinitive. The wenn-part usually uses wäre/hätte or a modal; würde is more common in the main part.', 'Wenn ich Zeit hätte, würde ich dich besuchen.'],
    k2_real: ['Real conditions and facts: indicative', 'If something is a real possibility or a fact, use the normal indicative: Wenn ich Zeit habe, komme ich (I might well have time). Als + past fact: indicative too.', 'Wenn ich Zeit habe, komme ich vorbei.'],
    k2_polite: ['Polite requests', 'Konjunktiv II makes requests polite: Ich hätte gern …, Könnten Sie …?, Würden Sie …?, Wäre es möglich, …?', 'Ich hätte gern ein Glas Wasser.'],
    k2_advice: ['Advice: sollte, würde an deiner Stelle', 'Du solltest … (you should) and An deiner Stelle würde ich … (if I were you I would) are the standard ways to give advice.', 'Du solltest mehr schlafen.'],
    k2_wish: ['Wishes', 'Ich wünschte, … and Wenn … doch nur … take Konjunktiv II: Ich wünschte, ich hätte mehr Zeit. Wenn ich nur reich wäre!', 'Ich wünschte, ich hätte mehr Geld.'],
    k2_als_ob: ['als ob + Konjunktiv II', 'Als ob (as if) is followed by Konjunktiv II, because the comparison isn’t real: Er tut so, als ob er alles wüsste.', 'Er tut so, als ob er alles wüsste.'],
    k2_past: ['Past unreal: hätte / wäre + participle', 'For something that didn’t happen in the past: hätte or wäre + Partizip II. Use wäre with the verbs that take sein in the Perfekt (gehen, fahren, kommen, bleiben).', 'Wenn ich das gewusst hätte, wäre ich gekommen.'],
    k2_fast: ['fast / beinahe + Konjunktiv II past', 'Fast and beinahe (almost) with the Konjunktiv II past describe something that nearly happened but didn’t.', 'Ich hätte fast den Bus verpasst.'],
    k2_modal_past: ['Modal verbs in the past unreal', 'hätte + infinitive + modal infinitive at the end (a “double infinitive”): Das hättest du nicht sagen sollen.', 'Das hättest du nicht sagen sollen.'],
    pass: ['The passive with werden', 'The passive puts the action in focus, not the person doing it: werden (conjugated) + Partizip II at the end. Present: wird gebaut. Simple past: wurde gebaut. The doer, if mentioned, comes with von + dative.', 'Die Brücke wurde 1890 gebaut.'],
    pass_perf: ['Passive perfect: ist … worden', 'The passive perfect uses sein + participle + worden. In the passive the participle of werden is worden, without ge-.', 'Der Dieb ist gestern verhaftet worden.'],
    pass_state: ['Zustandspassiv: sein + participle', 'Sein + participle describes the state that results from an action: Die Tür ist geöffnet (it is open). Werden + participle describes the action itself: Die Tür wird um acht geöffnet (someone opens it at eight).', 'Die Tür ist geöffnet.'],
    pass_modal: ['Passive with a modal verb', 'The modal verb is conjugated, the participle and werden go to the end: muss repariert werden, darf nicht geraucht werden, kann gelöst werden.', 'Das Auto muss repariert werden.']
  },
  fnote: q => `${q.hint ? q.hint + ' → ' : ''}${q.forms[q.a2]}.`,
  data: `
k2|Wenn ich Zeit ___, würde ich dich besuchen.|If I had time, I'd visit you.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;würde|hätte|k2_unreal|würde|
k2|Wenn ich du ___, würde ich das nicht machen.|If I were you, I wouldn't do that.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;war;bin;sei|wäre|k2_unreal|würde|
k2|___ Sie mir bitte helfen?|Could you help me, please?|können|k2hs;k2w;k2m;ind|k2m|Könnten;Konnten;Können;Kannten|Könnten|k2_polite|bitte|
k2|Ich ___ gern ein Glas Wasser.|I'd like a glass of water.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;hat|hätte|k2_polite|gern|
k2|An deiner Stelle ___ ich zum Arzt gehen.|If I were you I'd go to the doctor.|werden|k2hs;k2w;k2m;ind|k2w|würde;wurde;werde;wird|würde|k2_advice|An deiner Stelle|
k2|Du ___ mehr schlafen.|You should sleep more.|sollen|k2hs;k2w;k2m;ind|k2m|solltest;sollst;sollest;solltet|solltest|k2_advice|mehr|
k2|Ich wünschte, ich ___ mehr Geld.|I wish I had more money.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;hätten|hätte|k2_wish|wünschte|
k2|Es ___ schön, wenn du mitkommst.|It would be nice if you came along.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;war;ist;sei|wäre|k2_unreal|schön|
k2|Wenn ich reich wäre, ___ ich um die Welt reisen.|If I were rich, I'd travel around the world.|werden|k2hs;k2w;k2m;ind|k2w|würde;wurde;werde;wäre|würde|k2_unreal|wäre|
k2|Er tut so, als ob er alles ___.|He acts as if he knew everything.|wissen|k2hs;k2w;k2m;ind|k2m|wüsste;wusste;weiß;wisse|wüsste|k2_als_ob|als ob||B2
k2|Wenn ich morgen Zeit ___, komme ich vorbei.|If I have time tomorrow, I'll drop by.|haben|k2hs;k2w;k2m;ind|ind|habe;hätte;hatte;würde|habe|k2_real|komme|A real possibility, and the main clause is indicative too (komme).
k2|Als ich jung ___, hatte ich lange Haare.|When I was young, I had long hair.|sein|k2hs;k2w;k2m;ind|ind|war;wäre;bin;sei|war|k2_real|Als|
k2|Wenn er mehr üben ___, könnte er besser spielen.|If he practised more, he could play better.|werden|k2hs;k2w;k2m;ind|k2w|würde;wurde;wird;werde|würde|k2_unreal|könnte||B2
k2|Wenn ich fliegen ___, wäre ich jetzt bei dir.|If I could fly, I'd be with you now.|können|k2hs;k2w;k2m;ind|k2m|könnte;konnte;kann;könne|könnte|k2_unreal|wäre|
pas|Das Haus ___ gerade renoviert.|The house is being renovated right now.|werden|pp;ppt;pperf;zust|pp|wird;wurde;ist;worden|wird|pass|gerade|
pas|Die Brücke ___ 1890 gebaut.|The bridge was built in 1890.|werden|pp;ppt;pperf;zust|ppt|wird;wurde;ist;war|wurde|pass|1890|
pas|Der Dieb ist gestern verhaftet ___.|The thief was arrested yesterday.|werden|pp;ppt;pperf;zust|pperf|geworden;worden;wurde;gewesen|worden|pass_perf|verhaftet||B2
pas|In Österreich ___ Deutsch gesprochen.|German is spoken in Austria.|werden|pp;ppt;pperf;zust|pp|wird;wurde;ist;werden|wird|pass|gesprochen|
pas|Die Tür ___ schon geöffnet. Wir können hineingehen.|The door is already open. We can go in.|sein|pp;ppt;pperf;zust|zust|ist;wird;wurde;war|ist|pass_state|schon|The state now, not the action: Zustandspassiv.|B2
pas|Die Tür ___ um acht geöffnet. Bis dahin ist sie zu.|The door is opened at eight. Until then it's closed.|werden|pp;ppt;pperf;zust|pp|ist;wird;wurde;war|wird|pass_state|um acht|The action at a time: Vorgangspassiv with werden.|B2
pas|Das Auto muss repariert ___.|The car must be repaired.|werden|pp;ppt;pmod;zust|pmod|werden;worden;wird;sein|werden|pass_modal|muss|
pas|Die Briefe ___ gestern verschickt.|The letters were sent yesterday.|werden|pp;ppt;pperf;zust|ppt|wurden;wurde;werden;sind|wurden|pass|gestern|
pas|Hier darf nicht geraucht ___.|Smoking isn't allowed here.|werden|pp;ppt;pmod;zust|pmod|werden;worden;wird;sein|werden|pass_modal|darf|
pas|Das Museum ___ 1990 eröffnet worden.|The museum was opened in 1990.|sein|pp;ppt;pperf;zust|pperf|ist;hat;wird;wurde|ist|pass_perf|worden|The passive perfect is formed with sein.|B2
pas|Das Problem kann leicht gelöst ___.|The problem can be solved easily.|werden|pp;ppt;pmod;zust|pmod|werden;worden;wird;sein|werden|pass_modal|kann||B2
pas|Der Brief ___ von meiner Oma geschrieben.|The letter was written by my grandma.|werden|pp;ppt;pperf;zust|ppt|wurde;wird;war;ist|wurde|pass|von meiner Oma|The doer comes with von + dative.
k2p|Wenn ich das gewusst ___, wäre ich gekommen.|If I'd known that, I would have come.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_past|gewusst|
k2p|Wenn du früher losgefahren ___, hättest du den Zug erreicht.|If you'd left earlier, you'd have caught the train.|sein|k2hs;k2w;k2m;ind|k2hs|wärst;hättest;warst;bist|wärst|k2_past|losgefahren|Losfahren takes sein in the Perfekt, so: wärst.
k2p|Ich ___ fast den Bus verpasst.|I almost missed the bus.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_fast|fast||C1
k2p|Das ___ du nicht sagen sollen.|You shouldn't have said that.|haben|k2hs;k2w;k2m;ind|k2hs|hättest;hattest;hast;wärst|hättest|k2_modal_past|sollen||C1
k2p|Wenn es nicht geregnet hätte, ___ wir gewandert.|If it hadn't rained, we would have gone hiking.|sein|k2hs;k2w;k2m;ind|k2hs|wären;hätten;waren;würden|wären|k2_past|gewandert|Wandern takes sein.
k2p|Ohne deine Hilfe ___ ich das nie geschafft.|Without your help I'd never have managed it.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;wäre;hatte;würde|hätte|k2_past|Ohne deine Hilfe|
k2p|Wir ___ gern länger geblieben.|We would have liked to stay longer.|sein|k2hs;k2w;k2m;ind|k2hs|wären;hätten;waren;würden|wären|k2_past|geblieben|Bleiben takes sein.
k2|Wenn ich reich ___, würde ich ein Haus am Meer kaufen.|If I were rich, I'd buy a house by the sea.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;war;bin;würde|wäre|k2_unreal|würde|
k2|An deiner Stelle ___ ich mehr schlafen.|In your place I'd sleep more.|schlafen|k2hs;k2w;k2m;ind|k2w|würde;wurde;werde;wäre|würde|k2_advice|An deiner Stelle|
k2|Du ___ öfter Sport machen.|You should do sport more often.|sollen|k2hs;k2w;k2m;ind|k2m|solltest;sollst;würdest;hättest|solltest|k2_advice|öfter|Advice: solltest (Konjunktiv II of sollen).
k2|Wenn ich Zeit habe, ___ ich morgen vorbei.|If I have time, I'll drop by tomorrow.|kommen|k2hs;k2w;k2m;ind|ind|komme;käme;würde;kam|komme|k2_real|Wenn ich Zeit habe|A real possibility: indicative in both parts.
k2|Wenn ich doch nur mehr Zeit ___!|If only I had more time!|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_wish|doch nur|
k2|___ du mir bitte das Fenster aufmachen?|Would you open the window for me, please?|aufmachen|k2hs;k2w;k2m;ind|k2w|Würdest;Wirst;Wurdest;Hättest|Würdest|k2_polite|bitte|
k2|Wenn wir ein Auto ___, könnten wir ans Meer fahren.|If we had a car, we could drive to the sea.|haben|k2hs;k2w;k2m;ind|k2hs|hätten;hatten;haben;würden|hätten|k2_unreal|könnten|
k2|Es ___ schön, wenn du kommen könntest.|It would be lovely if you could come.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;war;ist;würde|wäre|k2_unreal|könntest|
pas|Hier ___ Deutsch gesprochen.|German is spoken here.|werden|pp;ppt;pperf;zust|pp|wird;wurde;ist;worden|wird|pass|Hier|
pas|Das Paket ___ gestern geliefert.|The parcel was delivered yesterday.|werden|pp;ppt;pperf;zust|ppt|wird;wurde;ist;war|wurde|pass|gestern|
pas|Die Fenster ___ jeden Freitag geputzt.|The windows are cleaned every Friday.|werden|pp;ppt;pperf;zust|pp|werden;wird;wurden;sind|werden|pass|jeden Freitag|Plural subject: werden.
pas|Das Geschäft ist heute ___.|The shop is closed today.|schließen|pp;ppt;pperf;zust|zust|geschlossen;geschließt;schließt;schloss|geschlossen|pass_state|ist heute|A state (it is closed): sein + participle.
pas|Der Brief muss noch ___ werden.|The letter still has to be written.|schreiben|pp;ppt;pperf;pmod|pmod|geschrieben;schreiben;schrieb;geschreibt|geschrieben|pass_modal|muss noch|
pas|Das Auto ist schon ___ worden.|The car has already been repaired.|reparieren|pp;ppt;pperf;zust|pperf|repariert;gerepariert;reparieren;reparierte|repariert|pass_perf|worden|
pas|In diesem Raum darf nicht geraucht ___.|Smoking is not allowed in this room.|werden|pp;ppt;pperf;pmod|pmod|werden;wird;worden;geworden|werden|pass_modal|darf|With a modal, werden stays in the infinitive at the end.
pas|Die Stadt ___ im Krieg zerstört.|The city was destroyed in the war.|werden|pp;ppt;pperf;zust|ppt|wurde;wird;ist;war|wurde|pass|im Krieg|
pas|Die Tür ___ geöffnet. Wir können reingehen.|The door is open. We can go in.|sein|pp;ppt;pperf;zust|zust|ist;wird;wurde;worden|ist|pass_state|Wir können reingehen|The door is (already) open: Zustandspassiv with sein.
pas|Die Gäste sind schon ___ worden.|The guests have already been informed.|informieren|pp;ppt;pperf;zust|pperf|informiert;geinformiert;informieren;informierte|informiert|pass_perf|worden|
pas|Von wem ___ das Bild gemalt?|Who was the picture painted by?|werden|pp;ppt;pperf;zust|ppt|wurde;wird;war;ist|wurde|pass|Von wem|The person who does it: von + dative.
k2p|Wenn du angerufen ___, hätte ich dich abgeholt.|If you'd called, I'd have picked you up.|haben|k2hs;k2w;k2m;ind|k2hs|hättest;hattest;wärst;hast|hättest|k2_past|angerufen|
k2p|Ich ___ gern mitgekommen, aber ich war krank.|I'd have liked to come along, but I was ill.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;hätte;war;würde|wäre|k2_past|mitgekommen|Mitkommen takes sein: wäre mitgekommen.
k2p|Das ___ ich nie gedacht!|I'd never have thought that!|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_past|gedacht|
k2p|Wenn es nicht geregnet ___, wären wir gewandert.|If it hadn't rained, we'd have gone hiking.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;wäre;hat|hätte|k2_past|geregnet|
k2p|Du ___ mich fragen sollen.|You should have asked me.|haben|k2hs;k2w;k2m;ind|k2hs|hättest;hattest;wärst;solltest|hättest|k2_modal_past|sollen|Modal in the past: hätte + infinitive + modal infinitive: hättest fragen sollen.
k2p|Wenn ich früher aufgestanden ___, hätte ich den Bus bekommen.|If I'd got up earlier, I'd have caught the bus.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;hätte;war;würde|wäre|k2_past|aufgestanden|Aufstehen takes sein.
k2p|Fast ___ ich den Termin vergessen.|I almost forgot the appointment.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_fast|Fast||C1
k2p|Er sah aus, als ob er die ganze Nacht nicht geschlafen ___.|He looked as if he hadn't slept all night.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_als_ob|als ob|
k2p|Ohne deine Hilfe ___ ich das nicht geschafft.|Without your help I wouldn't have managed it.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;habe;wäre|hätte|k2_past|Ohne deine Hilfe|
k2p|Wir ___ früher losfahren müssen.|We should have left earlier.|haben|k2hs;k2w;k2m;ind|k2hs|hätten;hatten;wären;mussten|hätten|k2_modal_past|müssen|
k2p|Wenn sie mehr gelernt ___, hätte sie die Prüfung bestanden.|If she had studied more, she would have passed the exam.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;wäre;hat|hätte|k2_past|gelernt|
k2p|Beinahe ___ wir den Zug verpasst.|We nearly missed the train.|haben|k2hs;k2w;k2m;ind|k2hs|hätten;hatten;haben;wären|hätten|k2_fast|Beinahe||C1
k2p|Ich ___ das an deiner Stelle nicht gesagt.|I wouldn't have said that in your place.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;hatte;wäre;würde|hätte|k2_past|an deiner Stelle|
k2p|Wenn er gekommen ___, hätten wir gefeiert.|If he had come, we'd have celebrated.|sein|k2hs;k2w;k2m;ind|k2hs|wäre;hätte;war;ist|wäre|k2_past|gekommen|
k2p|Das ___ nicht passieren dürfen.|That shouldn't have happened.|haben|k2hs;k2w;k2m;ind|k2hs|hätte;wäre;hatte;durfte|hätte|k2_modal_past|dürfen|
`
});
