/* Satzbau & Konnektoren. The gap is the connector; the word order after it decides its type. Format: see shared/lines.js. */
buildLine({
  id: 'de-conn', step1: 'Which word order?', step1Short: 'Type', scoreLabel: 'Types right', keepOrder1: true,
  kinds: ['coord', 'sub', 'adv', 'inf'],
  topics: {
    cause: 'Grund und Folge · Cause and result',
    contrast: 'Gegensatz · Contrast',
    time: 'Zeit · Time',
    purpose: 'Zweck, dass, ob · Purpose and reported questions'
  },
  levels: { cause: 'A2', contrast: 'B1', time: 'B1', purpose: 'B1' },
  opts: {
    coord: { name: 'Konjunktion · Joins two main clauses', use: 'und, aber, oder, denn, sondern: they stand in position 0 and the word order after them is normal (subject, verb)' },
    sub: { name: 'Subjunktion · Verb to the end', use: 'weil, dass, ob, obwohl, wenn, als, wann, damit, während, bevor, nachdem, da, falls: they start a subordinate clause and send the conjugated verb to the end' },
    adv: { name: 'Adverb · Verb comes next', use: 'deshalb, trotzdem, dann, danach, außerdem, sonst, desto: they take position 1 themselves, so the verb follows immediately and the subject comes after it' },
    inf: { name: 'Infinitivsatz · … zu + infinitive', use: 'um … zu, ohne … zu, statt … zu: no subject of their own, the infinitive with zu at the end' }
  },
  rules: {
    conn_coord: ['und, aber, oder, denn, sondern: normal order', 'These connectors don’t count as a position. After them comes a normal main clause: subject, verb, rest. Denn means “because” like weil, but keeps the verb in second place.', 'Ich bleibe zu Hause, denn ich bin krank.'],
    conn_sub: ['Subordinating conjunctions send the verb to the end', 'weil, dass, ob, obwohl, wenn, als, damit, während, bevor, nachdem, da, falls start a subordinate clause: the conjugated verb goes to the very end. If the subordinate clause comes first, the main clause starts with its verb: Weil es regnet, nehmen wir das Auto.', 'Ich bleibe zu Hause, weil ich krank bin.'],
    conn_adv: ['Connecting adverbs take position 1', 'deshalb, darum, trotzdem, dann, danach, außerdem, sonst are adverbs. They fill position 1, so the verb comes straight after them and the subject follows the verb.', 'Ich bin krank, deshalb bleibe ich zu Hause.'],
    conn_sondern: ['sondern after a negation', 'After nicht or kein, “but rather” (correcting what was denied) is sondern, not aber.', 'Das ist nicht mein Auto, sondern das meines Bruders.'],
    conn_als: ['als for one event in the past', 'Als (when) is for a single event or a single period in the past: als ich ein Kind war, als wir ankamen.', 'Als ich ein Kind war, lebte ich in Graz.'],
    conn_wenn: ['wenn for repeated events, the present and the future', 'Wenn means “when” for anything that repeats (immer wenn, jedes Mal wenn), for the present and the future, and also means “if”.', 'Immer wenn ich in Berlin bin, besuche ich meine Tante.'],
    conn_wann: ['wann asks a question', 'Wann is the question word “when?”, also inside an indirect question (Weißt du, wann …?). It never introduces a statement about time.', 'Weißt du, wann der Zug kommt?'],
    conn_nachdem: ['nachdem + one tense further back', 'Nachdem (after) shows which action came first. That earlier action goes one tense back: Plusquamperfekt with a past main clause, Perfekt with a present one.', 'Nachdem wir gegessen hatten, gingen wir spazieren.'],
    conn_damit: ['damit: so that (different subjects possible)', 'Damit introduces a purpose with its own subject and the verb at the end. If both clauses have the same subject, um … zu is usually better: Ich lerne, um in Berlin arbeiten zu können.', 'Ich spreche langsam, damit du mich verstehst.'],
    conn_um: ['um … zu: in order to', 'Um … zu + infinitive at the end expresses a purpose when the subject is the same as in the main clause.', 'Ich spare Geld, um ein Auto zu kaufen.'],
    conn_inf: ['ohne … zu, statt … zu', 'Ohne … zu (without doing) and statt … zu (instead of doing) work like um … zu: no subject, zu + infinitive at the end.', 'Statt zu arbeiten, schläft er.'],
    conn_dass: ['dass: that', 'Dass introduces what someone says, thinks, hopes or knows. Don’t confuse it with das (the, which).', 'Ich hoffe, dass du bald kommst.'],
    conn_ob: ['ob: whether, for yes/no questions', 'Ob turns a yes/no question into a subordinate clause: Kommt er? → Ich weiß nicht, ob er kommt. Wenn would mean “if, in case”, which is different.', 'Ich weiß nicht, ob er heute kommt.'],
    conn_two: ['Two-part connectors', 'entweder … oder (either … or), sowohl … als auch (both … and), weder … noch (neither … nor), je … desto/umso (the more … the more). In je … desto, the je-part has the verb at the end, the desto-part has the verb right after the comparative.', 'Je mehr ich lerne, desto besser verstehe ich.']
  },
  fnote: q => `${q.forms[q.a2]}: ${['joins two main clauses', 'sends the verb to the end', 'is followed directly by the verb', 'takes zu + infinitive'][q.a1]}.`,
  data: `
cause|Ich bleibe heute zu Hause, ___ ich krank bin.|I'm staying home today because I'm ill.|||sub|weil;denn;deshalb|weil|conn_sub|bin|The verb is at the end: krank bin.
cause|Ich bleibe heute zu Hause, ___ ich bin krank.|I'm staying home today, because I'm ill.|||coord|weil;denn;deshalb|denn|conn_coord|ich bin|Normal order after the gap: ich bin.
cause|Ich bin krank, ___ bleibe ich heute zu Hause.|I'm ill, so I'm staying home today.|||adv|weil;denn;deshalb|deshalb|conn_adv|bleibe ich|The verb comes straight after the gap.
cause|___ es regnet, nehmen wir das Auto.|As it's raining, we'll take the car.|||sub|Da;Denn;Deshalb|Da|conn_sub|regnet|Da (as, since) is like weil and often starts the sentence.|B2
cause|Es hat geregnet, ___ sind wir zu Hause geblieben.|It rained, so we stayed at home.|||adv|weil;denn;darum|darum|conn_adv|sind wir|Darum and deshalb mean the same.
cause|Er lernt viel, ___ er die Prüfung bestehen will.|He studies a lot because he wants to pass the exam.|||sub|weil;denn;deshalb|weil|conn_sub|will|
contrast|___ es kalt ist, gehen wir schwimmen.|Although it's cold, we're going swimming.|||sub|Obwohl;Aber;Trotzdem|Obwohl|conn_sub|ist|
contrast|Es ist kalt, ___ gehen wir schwimmen.|It's cold; we're going swimming anyway.|||adv|obwohl;aber;trotzdem|trotzdem|conn_adv|gehen wir|
contrast|Es ist kalt, ___ wir gehen schwimmen.|It's cold, but we're going swimming.|||coord|obwohl;aber;trotzdem|aber|conn_coord|wir gehen|
contrast|Das ist nicht mein Auto, ___ das meines Bruders.|That's not my car but my brother's.|||coord|aber;sondern;trotzdem|sondern|conn_sondern|nicht|
contrast|Er ist reich, ___ sein Bruder arm ist.|He's rich, whereas his brother is poor.|||sub|während;aber;sondern|während|conn_sub|arm ist|Während can mean “whereas” as well as “while”.|B2
contrast|Sie hat nicht angerufen, ___ eine Nachricht geschrieben.|She didn't call but wrote a message.|||coord|aber;sondern;obwohl|sondern|conn_sondern|nicht|
time|___ ich ein Kind war, lebte ich in Graz.|When I was a child, I lived in Graz.|||sub|Als;Wenn;Wann|Als|conn_als|war|
time|Immer ___ ich in Berlin bin, besuche ich meine Tante.|Whenever I'm in Berlin, I visit my aunt.|||sub|als;wenn;wann|wenn|conn_wenn|Immer|
time|Weißt du, ___ der Zug kommt?|Do you know when the train is coming?|||sub|als;wenn;wann|wann|conn_wann|Weißt du|
time|___ wir gegessen hatten, gingen wir spazieren.|After we had eaten, we went for a walk.|||sub|Nachdem;Bevor;Während|Nachdem|conn_nachdem|gegessen hatten||B2
time|Wasch dir die Hände, ___ du isst!|Wash your hands before you eat!|||sub|nachdem;bevor;seit|bevor|conn_sub|isst|
time|Ich habe zuerst gegessen, ___ habe ich gelesen.|First I ate, then I read.|||adv|als;dann;wenn|dann|conn_adv|habe ich|
time|___ ich gestern nach Hause kam, war niemand da.|When I came home yesterday, nobody was there.|||sub|Als;Wenn;Wann|Als|conn_als|gestern|
time|___ du nach Hause kommst, ruf mich an!|When you get home, call me!|||sub|Als;Wenn;Wann|Wenn|conn_wenn|kommst|A future event: wenn.
purpose|Ich lerne Deutsch, ___ ich in Berlin arbeiten kann.|I'm learning German so that I can work in Berlin.|||sub|damit;um;deshalb|damit|conn_damit|kann|
purpose|Ich spare Geld, ___ ein Auto zu kaufen.|I'm saving money to buy a car.|||inf|damit;um;dass|um|conn_um|zu kaufen|
purpose|Ich hoffe, ___ du bald kommst.|I hope that you'll come soon.|||sub|dass;ob;das|dass|conn_dass|kommst|
purpose|Ich weiß nicht, ___ er heute kommt.|I don't know whether he's coming today.|||sub|dass;ob;wenn|ob|conn_ob|weiß nicht|
purpose|Er ging, ___ sich zu verabschieden.|He left without saying goodbye.|||inf|ohne;um;statt|ohne|conn_inf|zu verabschieden||B2
purpose|___ zu arbeiten, schläft er den ganzen Tag.|Instead of working, he sleeps all day.|||inf|Statt;Um;Ohne|Statt|conn_inf|zu arbeiten||B2
purpose|Sprich bitte langsam, ___ alle dich verstehen.|Please speak slowly so that everyone understands you.|||sub|damit;um;dass|damit|conn_damit|verstehen|The subjects differ (du / alle), so um … zu is impossible.|B2
purpose|___ du Hilfe brauchst, ruf mich an.|In case you need help, call me.|||sub|Falls;Ob;Damit|Falls|conn_sub|brauchst|Falls = in case, if.|B2
purpose|Entweder kommst du mit, ___ du bleibst hier.|Either you come along or you stay here.|||coord|oder;aber;sondern|oder|conn_two|Entweder||B1
purpose|Sie spricht sowohl Deutsch ___ Englisch.|She speaks both German and English.|||coord|als auch;und auch;wie auch|als auch|conn_two|sowohl||B2
purpose|Je mehr ich lerne, ___ besser verstehe ich.|The more I learn, the better I understand.|||adv|desto;als;wie|desto|conn_two|Je|Umso is also correct here.|C1
cause|Wir nehmen ein Taxi, ___ es regnet.|We're taking a taxi because it's raining.|||sub|weil;denn;deshalb|weil|conn_sub|regnet|The verb goes to the end: es regnet.
cause|Es regnet, ___ nehmen wir ein Taxi.|It's raining, so we're taking a taxi.|||adv|weil;denn;deshalb|deshalb|conn_adv|nehmen wir|
cause|Wir nehmen ein Taxi, ___ es regnet stark.|We're taking a taxi, because it's raining hard.|||coord|weil;denn;deshalb|denn|conn_coord|es regnet|
cause|Ich habe keinen Hunger, ___ ich schon gegessen habe.|I'm not hungry because I've already eaten.|||sub|weil;denn;deshalb|weil|conn_sub|habe|
cause|Der Zug hatte Verspätung, ___ kam ich zu spät.|The train was late, so I was late.|||adv|weil;denn;deshalb|deshalb|conn_adv|kam ich|
cause|Sie lernt viel, ___ sie bald eine Prüfung hat.|She's studying a lot because she has an exam soon.|||sub|weil;denn;darum|weil|conn_sub|hat|
cause|Er ist müde, ___ er hat schlecht geschlafen.|He's tired, because he slept badly.|||coord|weil;denn;darum|denn|conn_coord|er hat|
cause|Das Museum ist montags zu, ___ gehen wir am Dienstag.|The museum is closed on Mondays, so we'll go on Tuesday.|||adv|weil;denn;darum|darum|conn_adv|gehen wir|Darum, deshalb, deswegen, daher: the verb comes straight after.
cause|___ ich kein Auto habe, fahre ich mit dem Rad.|As I don't have a car, I cycle.|||sub|Da;Denn;Deshalb|Da|conn_sub|habe|Da = since, as: a known reason, often at the start.
cause|Es war sehr heiß, ___ sind wir zu Hause geblieben.|It was very hot, so we stayed at home.|||adv|weil;denn;deswegen|deswegen|conn_adv|sind wir|
cause|Ich rufe dich an, ___ ich eine Frage habe.|I'm calling you because I have a question.|||sub|weil;denn;deshalb|weil|conn_sub|habe|
cause|Wir müssen uns beeilen, ___ der Film beginnt gleich.|We have to hurry, because the film is starting soon.|||coord|weil;denn;deshalb|denn|conn_coord|der Film beginnt|
cause|Die Straße war gesperrt, ___ mussten wir einen Umweg fahren.|The road was closed, so we had to take a detour.|||adv|weil;denn;daher|daher|conn_adv|mussten wir|
cause|Er hat die Stelle bekommen, ___ er sehr gut Englisch spricht.|He got the job because he speaks very good English.|||sub|weil;denn;deshalb|weil|conn_sub|spricht|
contrast|___ er viel arbeitet, verdient er wenig.|Although he works a lot, he earns little.|||sub|Obwohl;Aber;Trotzdem|Obwohl|conn_sub|arbeitet|
contrast|Er arbeitet viel, ___ verdient er wenig.|He works a lot, yet he earns little.|||adv|obwohl;aber;trotzdem|trotzdem|conn_adv|verdient er|
contrast|Er arbeitet viel, ___ er verdient wenig.|He works a lot, but he earns little.|||coord|obwohl;aber;trotzdem|aber|conn_coord|er verdient|
contrast|Das ist nicht mein Auto, ___ das meiner Schwester.|That's not my car but my sister's.|||coord|aber;sondern;obwohl|sondern|conn_sondern|nicht|After nicht or kein, "but rather": sondern.
contrast|Sie ist nicht müde, ___ hungrig.|She isn't tired but hungry.|||coord|aber;sondern;trotzdem|sondern|conn_sondern|nicht|
contrast|Ich bin müde, ___ ich gehe noch ins Kino.|I'm tired, but I'm still going to the cinema.|||coord|aber;sondern;obwohl|aber|conn_coord|ich gehe|
contrast|___ das Wetter schlecht war, haben wir gegrillt.|Although the weather was bad, we had a barbecue.|||sub|Obwohl;Trotzdem;Aber|Obwohl|conn_sub|war|
contrast|Das Wetter war schlecht, ___ haben wir gegrillt.|The weather was bad; we had a barbecue anyway.|||adv|obwohl;trotzdem;aber|trotzdem|conn_adv|haben wir|
contrast|Er hat kein Geld, ___ er fährt jedes Jahr in Urlaub.|He has no money, but he goes on holiday every year.|||coord|aber;sondern;obwohl|aber|conn_coord|er fährt|Here kein belongs to the first idea; the second adds a contrast: aber.
contrast|Wir fahren nicht mit dem Zug, ___ mit dem Auto.|We're not going by train but by car.|||coord|aber;sondern;obwohl|sondern|conn_sondern|nicht|
contrast|Sie kam zur Party, ___ sie krank war.|She came to the party although she was ill.|||sub|obwohl;trotzdem;aber|obwohl|conn_sub|war|
contrast|___ ich Kaffee mag, trinke ich abends Tee.|Although I like coffee, I drink tea in the evening.|||sub|Obwohl;Aber;Sondern|Obwohl|conn_sub|mag|
contrast|Die Prüfung war schwer, ___ hat er sie bestanden.|The exam was hard; nevertheless he passed it.|||adv|obwohl;trotzdem;sondern|trotzdem|conn_adv|hat er|
contrast|Ich wollte anrufen, ___ ich hatte keine Zeit.|I wanted to call, but I had no time.|||coord|aber;sondern;trotzdem|aber|conn_coord|ich hatte|
time|___ wir in Rom waren, hat es geregnet.|When we were in Rome, it rained.|||sub|Als;Wenn;Wann|Als|conn_als|waren|One event or period in the past: als.
time|___ ich nach Hause komme, koche ich.|When I get home, I cook.|||sub|Als;Wenn;Wann|Wenn|conn_wenn|komme|Present or future, or "whenever": wenn.
time|Ich weiß nicht, ___ der Kurs anfängt.|I don't know when the course starts.|||sub|als;wenn;wann|wann|conn_wann|weiß nicht|A question about a time, even inside a sentence: wann.
time|___ ich gegessen hatte, ging ich spazieren.|After I had eaten, I went for a walk.|||sub|Nachdem;Bevor;Während|Nachdem|conn_nachdem|hatte|Nachdem + a tense one step further back: hatte gegessen, ging.
time|___ du gehst, mach bitte das Licht aus.|Before you go, please turn off the light.|||sub|Bevor;Nachdem;Seit|Bevor|conn_sub|gehst|
time|___ ich in Berlin wohne, fahre ich nur Rad.|Since I've lived in Berlin, I only cycle.|||sub|Seit;Als;Bevor|Seit|conn_sub|wohne|Seit(dem) + present: something still going on.
time|___ er telefonierte, kochte sie.|While he was on the phone, she cooked.|||sub|Während;Nachdem;Bis|Während|conn_sub|telefonierte|
time|Warte hier, ___ ich zurückkomme.|Wait here until I come back.|||sub|bis;bevor;seit|bis|conn_sub|zurückkomme|
time|Jedes Mal, ___ ich ihn sehe, lacht er.|Every time I see him, he laughs.|||sub|als;wenn;wann|wenn|conn_wenn|Jedes Mal|Repeated events, even in the past: wenn.
time|___ ich das Ergebnis hörte, war ich froh.|When I heard the result, I was happy.|||sub|Als;Wenn;Wann|Als|conn_als|hörte|
time|Kannst du mir sagen, ___ das Spiel beginnt?|Can you tell me when the match starts?|||sub|als;wenn;wann|wann|conn_wann|sagen|
purpose|Ich weiß nicht, ___ er morgen kommt.|I don't know whether he's coming tomorrow.|||sub|dass;ob;wann|ob|conn_ob|weiß nicht|A yes/no question inside a sentence: ob.
purpose|Er fährt nach Berlin, ___ seine Oma zu besuchen.|He's going to Berlin to visit his grandmother.|||inf|um;damit;dass|um|conn_um|zu besuchen|Same subject in both parts: um … zu.
purpose|Ich erkläre es noch einmal, ___ alle es verstehen.|I'll explain it again so that everyone understands.|||sub|damit;um;dass|damit|conn_damit|verstehen|Different subjects (ich – alle): damit.
purpose|Es ist wichtig, ___ du pünktlich bist.|It's important that you're on time.|||sub|dass;ob;damit|dass|conn_dass|bist|
purpose|Sie fragt, ___ wir Zeit haben.|She's asking whether we have time.|||sub|dass;ob;wenn|ob|conn_ob|fragt|
purpose|Ich habe vergessen, die Tür ___ schließen.|I forgot to close the door.|||inf|zu;um;dass|zu|conn_inf|vergessen|After vergessen, versuchen, anfangen, Lust haben: zu + infinitive.
purpose|Wir sparen, ___ wir im Sommer reisen können.|We're saving so that we can travel in summer.|||sub|damit;um;ob|damit|conn_damit|können|
purpose|Er hat keine Lust, heute ___ kochen.|He doesn't feel like cooking today.|||inf|zu;um;dass|zu|conn_inf|keine Lust|
purpose|Glaubst du, ___ es morgen regnet?|Do you think it will rain tomorrow?|||sub|dass;ob;das|dass|conn_dass|Glaubst du|Glauben, denken, hoffen, wissen + dass. Das (with one s) is an article or pronoun.
purpose|Ich gehe in die Bibliothek, ___ in Ruhe zu lernen.|I'm going to the library to study in peace.|||inf|um;damit;ob|um|conn_um|zu lernen|
purpose|Kannst du nachsehen, ___ noch Milch da ist?|Can you check whether there's any milk left?|||sub|ob;dass;wenn|ob|conn_ob|nachsehen|
`
});
