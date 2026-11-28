/* Comparison, short adjectives, adjective or adverb.
   Line format: topic|sentence|English|word|options (kinds, ;)|answer index|forms (;)|answer form index|rule|signal|note */
{
const OPTS = {
  comp_simple: { name: 'Сравнительная степень · Short comparative', use: 'one word ending in -ее / -е (быстрее, лучше, больше); it never changes, and the thing compared follows in the genitive (выше меня) or after чем' },
  comp_compound: { name: 'более + прилагательное · более + adjective', use: 'более + a full adjective that agrees with its noun; needed before a noun (более тёплая куртка)' },
  sup: { name: 'Превосходная степень · Superlative', use: 'самый + adjective (самый дорогой), a bookish -ейший / -айший (крупнейший), or лучший / худший / старший / младший' },
  short: { name: 'Краткая форма · Short adjective', use: 'after the subject, often for a temporary state (занят, готов, болен); a few words exist only in the short form: рад, должен, прав' },
  long: { name: 'Полная форма · Full adjective', use: 'describes a noun and agrees with it in gender, number and case (холодная погода)' },
  adv: { name: 'Наречие · Adverb', use: 'the -о form: describes a verb (говорит хорошо) or a state with no subject (холодно, трудно)' }
};
const RULES = {
  comp_than: ['Comparing with “than”: short comparative', 'The short comparative (-ее) stays the same for every gender and number. The thing compared follows either in the genitive or after чем with a comma.', 'Сегодня теплее, чем вчера. Брат выше меня.'],
  comp_irr: ['Irregular comparatives', 'The most common adjectives have irregular comparatives: хороший → лучше, плохой → хуже, большой → больше, маленький → меньше, дешёвый → дешевле, дорогой → дороже, ранний → раньше, высокий → выше.', 'Этот телефон дешевле. Москва больше Петербурга.'],
  comp_more: ['“More …ly”: the comparative works as an adverb too', 'The short comparative also describes a verb: “more slowly, faster, better”.', 'Говорите медленнее. Он бегает быстрее меня.'],
  comp_attr: ['Before a noun: более + full adjective', 'A short comparative can’t stand before a noun. There, use более + a full adjective that agrees with the noun.', 'Мне нужна более тёплая куртка.'],
  sup_samyj: ['The most: самый + adjective', 'самый agrees with the noun just like the adjective: самый дорогой ресторан, самая трудная задача, самое глубокое озеро.', 'Байкал — самое глубокое озеро в мире.'],
  sup_irr: ['лучший, худший, старший, младший', 'These four already mean “best, worst, eldest, youngest” on their own (самый can be added in speech). For family members, older / younger is старший / младший.', 'лучшая студентка, мой старший брат.'],
  sup_eish: ['Bookish superlative: -ейший / -айший', 'Written and formal Russian often uses -ейший (-айший after г, к, х, which change to ж, ч, ш): крупнейший, важнейший, строжайший.', 'крупнейший город, важнейшая задача.'],
  short_state: ['A temporary state: short form', 'After a subject, a temporary state is usually expressed with the short form: занят, готов, болен, закрыт. It agrees in gender and number: занят, занята, заняты.', 'Директор занят. Ужин готов.'],
  short_only: ['Words that exist only in the short form', 'рад (glad), должен (must), прав (right), согласен (agree) are used only in short forms: рад, рада, рады.', 'Мы рады. Вы правы. Мы должны идти.'],
  short_size: ['“Too big / too small”: short form', 'The short forms велик, мал, широк, узок, короток, длинен mean “too big, too small…” for clothes and shoes.', 'Платье мне велико. Ботинки малы.'],
  adv_verb: ['Describing a verb: adverb in -о', 'An action is described by an adverb, which never changes: говорить хорошо, бегать быстро, говорить тихо.', 'Ты хорошо говоришь по-русски.'],
  adj_noun: ['Describing a noun: full adjective', 'A noun is described by a full adjective that agrees with it in gender, number and case.', 'хорошее произношение, холодная погода.'],
  adv_state: ['A state with no subject: -о form', 'Weather, feelings and judgements without a grammatical subject use the -о form, with the person in the dative.', 'На улице холодно. Мне трудно.']
};
const TOPICS = { comp: 'Сравнение · Comparatives', sup: 'Самый… · Superlatives', short: 'Краткие формы · Short forms', adv: 'Хороший или хорошо? · Adjective or adverb' };
const LEVELS = { comp: 'B1', sup: 'B1', short: 'B1', adv: 'A2' };
const DATA = `comp|Мой брат ___ меня.|My brother is taller than me.|высокий|comp_simple;long;sup|0|выше;высокий;более высокий;самый высокий|0|comp_irr|меня|The thing compared in the genitive: выше меня = taller than me.
comp|Сегодня ___, чем вчера.|It’s warmer today than yesterday.|тёплый|comp_simple;long;adv|0|теплее;тёплый;тепло;самый тёплый|0|comp_than|чем вчера|
comp|Говорите, пожалуйста, ___.|Please speak more slowly.|медленный|comp_simple;adv;long|0|медленнее;медленно;медленный;самый медленный|0|comp_more|пожалуйста|
comp|Этот телефон ___ того.|This phone is cheaper than that one.|дешёвый|comp_simple;long;sup|0|дешевле;дешёвый;дешёво;самый дешёвый|0|comp_irr|того|
comp|Мой новый компьютер намного ___.|My new computer is much better.|хороший|comp_simple;long;adv|0|лучше;хороший;хорошо;лучший|0|comp_irr|намного|намного / гораздо + comparative = much more.
comp|Ему сегодня ___, чем вчера.|He feels worse today than yesterday.|плохой|comp_simple;adv;long|0|хуже;плохо;плохой;худший|0|comp_irr|чем вчера|
comp|Москва ___ Петербурга.|Moscow is bigger than St Petersburg.|большой|comp_simple;long;sup|0|больше;большой;более большой;самый большой|0|comp_irr|Петербурга|“более большой” is wrong: большой → больше.
comp|Мне нужна ___ куртка.|I need a warmer jacket.|тёплый|comp_compound;comp_simple;long|0|более тёплая;теплее;тёплая;самая тёплая|0|comp_attr|куртка|
comp|Эта задача ___, чем я думал.|This problem is harder than I thought.|трудный|comp_simple;long;adv|0|труднее;трудный;трудно;самый трудный|0|comp_than|чем я думал|
comp|Он выбрал ___ вариант.|He chose the simpler option.|простой|comp_compound;comp_simple;sup|0|более простой;проще;простой;самый простой|0|comp_attr|вариант|
comp|Чем ___, тем лучше.|The sooner the better.|ранний|comp_simple;adv;long|0|раньше;рано;ранний;самый ранний|0|comp_irr|тем лучше|чем…, тем… = the …, the ….
sup|Это ___ день в моей жизни.|It’s the happiest day of my life.|счастливый|sup;comp_simple;long|0|самый счастливый;счастливее;счастливый;более счастливый|0|sup_samyj|в моей жизни|
sup|Байкал — ___ озеро в мире.|Baikal is the deepest lake in the world.|глубокий|sup;comp_simple;long|0|самое глубокое;глубже;глубокое;более глубокое|0|sup_samyj|в мире|самый agrees with озеро: самое глубокое.
sup|Это ___ ресторан в городе.|This is the most expensive restaurant in town.|дорогой|sup;comp_simple;long|0|самый дорогой;дороже;дорогой;более дорогой|0|sup_samyj|в городе|
sup|Она ___ студентка в группе.|She is the best student in the group.|хороший|sup;comp_simple;long|0|лучшая;лучше;хорошая;более хорошая|0|sup_irr|в группе|
sup|Москва — ___ город России.|Moscow is Russia’s largest city.|крупный|sup;comp_simple;long|0|крупнейший;крупнее;крупный;более крупный|0|sup_eish||
sup|Мой ___ брат живёт в Канаде.|My older brother lives in Canada.|старый|sup;comp_simple;long|0|старший;старше;старый;самый старый|0|sup_irr|брат|
sup|Это ___ задание из всех.|This is the easiest task of all.|лёгкий|sup;comp_simple;long|0|самое лёгкое;легче;лёгкое;более лёгкое|0|sup_samyj|из всех|
sup|Это одна из ___ проблем нашего времени.|It’s one of the most important problems of our time.|важный|sup;comp_simple;long|0|важнейших;важнее;важных;более важных|0|sup_eish|одна из|одна из + genitive plural: одна из важнейших проблем.
short|Мы очень ___ тебя видеть!|We’re very glad to see you!|рад|short;long|0|рады;рад;рада;радостные|0|short_only|очень|
short|Извините, директор сейчас ___.|Sorry, the director is busy right now.|занятый|short;long|0|занят;занятый;занята;заняты|0|short_state|сейчас|
short|Ужин ___!|Dinner is ready!|готовый|short;long|0|готов;готовый;готова;готовы|0|short_state||
short|Вы ___, я ошибся.|You’re right, I was wrong.|правый|short;long|0|правы;правый;прав;права|0|short_only|я ошибся|
short|Мы ___ сдать работу до пятницы.|We must hand in the work by Friday.|должный|short;long|0|должны;должные;должен;должна|0|short_only|до пятницы|
short|Платье мне ___.|The dress is too big for me.|большой|short;long|0|велико;большое;велик;велика|0|short_size|мне|
short|Сестра ___ уже неделю.|My sister has been ill for a week.|больной|short;long|0|больна;больная;болен;больны|0|short_state|уже неделю|
short|Магазин уже ___.|The shop is already closed.|закрытый|short;long|0|закрыт;закрытый;закрыта;закрыто|0|short_state|уже|
adv|Ты ___ говоришь по-русски!|You speak Russian well!|хороший|adv;long;short|0|хорошо;хороший;хороша;лучше|0|adv_verb|говоришь|
adv|У тебя ___ произношение.|You have good pronunciation.|хороший|long;adv;short|0|хорошее;хорошо;хорош;хороший|0|adj_noun|произношение|
adv|На улице ___.|It’s cold outside.|холодный|adv;long;short|0|холодно;холодный;холодная;холоднее|0|adv_state|На улице|
adv|Сегодня ___ погода.|The weather is cold today.|холодный|long;adv;short|0|холодная;холодно;холодна;холоднее|0|adj_noun|погода|
adv|Он очень ___ бегает.|He runs very fast.|быстрый|adv;long;short|0|быстро;быстрый;быстр;быстрее|0|adv_verb|бегает|
adv|Мне ___ понимать этот текст.|It’s hard for me to understand this text.|трудный|adv;long;short|0|трудно;трудный;трудная;труднее|0|adv_state|Мне|
adv|Это была ___ ночь.|It was a quiet night.|тихий|long;adv;short|0|тихая;тихо;тиха;тише|0|adj_noun|ночь|
adv|Дети, говорите ___, малыш спит!|Kids, speak quietly, the baby’s asleep!|тихий|adv;long;short|0|тихо;тихий;тихие;тихая|0|adv_verb|говорите|
comp|Эта задача ___ той.|This task is harder than that one.|трудный|comp_simple;long;sup|0|труднее;трудный;самый трудный;более трудный|0|comp_than|той|
comp|Летом дни ___.|In summer the days are longer.|длинный|comp_simple;long;adv|0|длиннее;длинные;длинно;самые длинные|0|comp_more|Летом|
comp|Мой дом ___ твоего.|My house is bigger than yours.|большой|comp_simple;long;sup|0|больше;большой;более большой;самый большой|0|comp_irr|твоего|Большой – больше (irregular).
comp|Сегодня я чувствую себя ___.|I feel better today.|хороший|comp_simple;adv;long|0|лучше;хорошо;хороший;более хороший|0|comp_irr|Сегодня|Хороший / хорошо – лучше (irregular).
comp|Нам нужна ___ квартира.|We need a bigger flat.|просторный|comp_compound;comp_simple;long|0|более просторная;просторнее;просторная;самая просторная|0|comp_attr|квартира|Before a noun: более + full adjective, which agrees: более просторная квартира.
comp|Вода в озере ___, чем в море.|The water in the lake is colder than in the sea.|холодный|comp_simple;long;adv|0|холоднее;холодная;холодно;самая холодная|0|comp_than|чем в море|
comp|Говори ___, я не слышу!|Speak louder, I can't hear!|громкий|comp_simple;adv;long|0|громче;громко;громкий;самый громкий|0|comp_more|не слышу|Громкий – громче: к changes to ч.
comp|Билеты на поезд ___ билетов на самолёт.|Train tickets are cheaper than plane tickets.|дешёвый|comp_simple;long;sup|0|дешевле;дешёвые;самые дешёвые;более дешёвые|0|comp_irr|билетов|
comp|Он ___ меня на два года.|He is two years younger than me.|молодой|comp_simple;long;sup|0|моложе;молодой;самый молодой;более молодой|0|comp_irr|меня|For age, молодой – моложе (also младше).
comp|Это ___ решение, чем я думал.|This is a simpler solution than I thought.|простой|comp_compound;comp_simple;long|0|более простое;проще;простое;самое простое|0|comp_attr|решение|
comp|Ты стал говорить по-русски гораздо ___.|You've started speaking Russian much better.|хороший|comp_simple;adv;long|0|лучше;хорошо;хороший;более хорошо|0|comp_irr|гораздо|Гораздо, намного = much (before a comparative).
sup|Это ___ книга, которую я читал.|It's the most interesting book I've read.|интересный|sup;comp_simple;long|0|самая интересная;интереснее;интересная;более интересная|0|sup_samyj|которую я читал|
sup|Эверест — ___ гора в мире.|Everest is the highest mountain in the world.|высокий|sup;comp_simple;long|0|самая высокая;выше;высокая;более высокая|0|sup_samyj|в мире|
sup|Он ___ ученик в классе.|He's the best pupil in the class.|хороший|sup;comp_simple;long|0|лучший;лучше;хороший;самый хороший|0|sup_irr|в классе|Хороший → лучший (= самый лучший).
sup|Это ___ вариант из всех.|It's the worst option of all.|плохой|sup;comp_simple;long|0|худший;хуже;плохой;самый плохой|0|sup_irr|из всех|Плохой → худший.
sup|Он рассказал ___ новость.|He told the most important news.|важный|sup;comp_simple;long|0|самую важную;важнее;важную;более важную|0|sup_samyj|новость|Самый agrees: feminine accusative самую важную.
sup|Мы живём в ___ районе города.|We live in the quietest district of the town.|тихий|sup;comp_simple;long|0|самом тихом;тише;тихом;более тихом|0|sup_samyj|районе города|
sup|Это ___ задача.|This is a very complex task.|сложный|sup;comp_simple;long|0|сложнейшая;сложнее;сложная;самая сложная|0|sup_eish||The -ейший form is bookish and often means "extremely": сложнейшая задача.
sup|Это была ___ ошибка.|That was a terrible mistake.|грубый|sup;comp_simple;long|0|грубейшая;грубее;грубая;более грубая|0|sup_eish||
sup|Подари ей ___ цветы.|Give her the most beautiful flowers.|красивый|sup;comp_simple;long|0|самые красивые;красивее;красивые;более красивые|0|sup_samyj|цветы|
sup|Это ___ время года.|This is the coldest time of the year.|холодный|sup;comp_simple;long|0|самое холодное;холоднее;холодное;более холодное|0|sup_samyj|время года|Время is neuter: самое холодное.
short|Я ___ с вами.|I agree with you.|согласный|short;long|0|согласен;согласный;согласна;согласны|0|short_only|с вами|Согласен is used only in the short form.
short|Эти туфли мне ___.|These shoes are too small for me.|маленький|short;long|0|малы;маленькие;мал;мала|0|short_size|мне|Size relative to a person: мал, мала, малы = too small.
short|Она очень ___ на маму.|She looks very like her mum.|похожий|short;long|0|похожа;похожая;похож;похожи|0|short_state|на маму|
short|Магазин ___ до восьми.|The shop is open until eight.|открытый|short;long|0|открыт;открытый;открыта;открыто|0|short_state|до восьми|
short|Ты ___ мне помочь?|Are you able to help me?|способный|short;long|0|способен;способный;способна;способны|0|short_state|мне помочь|Способен + infinitive: able to.
short|Я тебе очень ___!|I'm very grateful to you!|благодарный|short;long|0|благодарен;благодарный;благодарна;благодарны|0|short_state|очень|A man speaking: благодарен.
short|Этот пиджак тебе ___.|This jacket is too big for you.|большой|short;long|0|велик;большой;велика;велики|0|short_size|тебе|Большой → велик (too big) for clothes and shoes.
short|Все места ___.|All the seats are taken.|занятый|short;long|0|заняты;занятые;занят;занята|0|short_state|Все места|
short|Ты ___!|You're right!|правый|short;long|0|прав;правый;права;правы|0|short_only||Прав (right, correct) is only short. A woman: ты права.
short|Мы ___ к поездке.|We're ready for the trip.|готовый|short;long|0|готовы;готовые;готов;готова|0|short_state|к поездке|
short|Окно ___.|The window is open.|открытый|short;long|0|открыто;открытое;открыт;открыта|0|short_state|Окно|
short|Она ___ своей работой.|She is pleased with her work.|довольный|short;long|0|довольна;довольная;доволен;довольны|0|short_state|своей работой|
adv|Он ___ водит машину.|He drives a car badly.|плохой|adv;long;short|0|плохо;плохой;плох;хуже|0|adv_verb|водит|
adv|У неё очень ___ голос.|She has a very beautiful voice.|красивый|long;adv;short|0|красивый;красиво;красив;красивее|0|adj_noun|голос|
adv|Мне ___.|I'm bored.|скучный|adv;long;short|0|скучно;скучный;скучен;скучнее|0|adv_state|Мне|A state of a person: dative + -о word: мне скучно.
adv|Это была ___ поездка.|It was a quick trip.|быстрый|long;adv;short|0|быстрая;быстро;быстра;быстрее|0|adj_noun|поездка|
adv|Он ___ ответил на вопрос.|He answered the question quickly.|быстрый|adv;long;short|0|быстро;быстрый;быстр;быстрее|0|adv_verb|ответил|
adv|Здесь очень ___.|It's very quiet here.|тихий|adv;long;short|0|тихо;тихий;тих;тише|0|adv_state|Здесь|
adv|У нас ___ гости.|We have important guests.|важный|long;adv;short|0|важные;важно;важны;важнее|0|adj_noun|гости|
adv|Тебе не ___?|Aren't you cold?|холодный|adv;long;short|0|холодно;холодный;холоден;холоднее|0|adv_state|Тебе|
adv|Она ___ поёт.|She sings beautifully.|красивый|adv;long;short|0|красиво;красивая;красива;красивее|0|adv_verb|поёт|
adv|Это ___ упражнение.|This is an easy exercise.|лёгкий|long;adv;short|0|лёгкое;легко;лёгок;легче|0|adj_noun|упражнение|
adv|Мне ___ это понять.|It's hard for me to understand this.|трудный|adv;long;short|0|трудно;трудный;труден;труднее|0|adv_state|Мне|`;
window.EXERCISE = {
  id: 'compare', step1: 'Which form?', step1Short: 'Form type', scoreLabel: 'Form types right',
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, opts, a1, forms, a2, rule, cue, note] = l.split('|');
    const o1 = opts.split(';').map(k => ({ kind: k }));
    const right = OPTS[o1[+a1].kind];
    return { t, ru, en, hint, o1, a1: +a1, forms: forms.split(';'), a2: +a2, labels: null, tag: '', rule, cue, note,
      fnote: `Needed: ${right.name.split(' · ')[1].toLowerCase()} (${right.name.split(' · ')[0].toLowerCase()}): ${right.use}.` };
  })
};
}
