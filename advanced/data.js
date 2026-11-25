/* Advanced. Line format: topic|sentence|English|word|options (kind or verb:kind, separated by ;)|answer index|forms (;)|answer form index|rule|signal|note|table labels n or p (optional)|CEFR level if different from the topic's (optional) */
{
const OPTS = {
  apres: { name: 'Действительное причастие наст. вр. · Active present participle', use: '“who is doing / which is doing”, from imperfective verbs: -ущий / -ющий (1st conjugation), -ащий / -ящий (2nd): читающий, говорящий' },
  apast: { name: 'Действительное причастие прош. вр. · Active past participle', use: '“who did / who was doing”: past stem + -вший (after a vowel) or -ший (after a consonant): прочитавший, принёсший' },
  ppres: { name: 'Страдательное причастие наст. вр. · Passive present participle', use: '“which is (being) done”, from imperfective verbs: -емый / -имый: читаемый, любимый. Rare in speech.' },
  ppast: { name: 'Страдательное причастие прош. вр. · Passive past participle', use: '“which has been done”, mostly from perfective verbs: -нный / -енный / -тый: прочитанный, построенный, открытый' },
  advi: { name: 'Деепричастие несов. вида · Imperfective verbal adverb', use: '“while doing”: an action at the same time as the main verb; present stem + -я (-а after ж, ш, ч, щ): читая, говоря, слыша' },
  advp: { name: 'Деепричастие сов. вида · Perfective verbal adverb', use: '“having done”: an action completed before the main verb; past stem + -в (-вшись for -ся verbs): прочитав, закончив, попрощавшись' },
  refl: { name: 'с -ся · with -ся', use: 'the verb has no direct object: the subject does it to itself, things happen on their own (дверь закрылась), or people do it to each other (встречаемся)' },
  trans: { name: 'без -ся · without -ся', use: 'the verb takes a direct object in the accusative: someone does it to someone or something else' },
  cond: { name: 'прош. вр. + бы · past form + бы', use: 'an unreal or hypothetical situation: what would happen or would have happened (если бы…, я бы…). The verb is in the past form whatever the time.' },
  real: { name: 'будущее время · future (real condition)', use: 'a real, possible condition about the future: если + future, then future' },
  chtoby_inf: { name: 'чтобы + инфинитив · infinitive', use: 'purpose when the subject of both parts is the same person: I came (so that I could) help' },
  chtoby_past: { name: 'чтобы + прош. вр. · past form', use: 'a wish, request or purpose aimed at a different person: I want you to…, she asked us to…' }
};
const RULES = {
  part_apres: ['Active present participle: “who is doing”', 'An active present participle replaces который + present tense. It is formed from imperfective verbs: take the они-form, drop -т and add -щий (читают → читающий, живут → живущий, сидят → сидящий). It declines like an adjective and agrees with its noun.', 'мальчик, который сидит → мальчик, сидящий на скамейке.'],
  part_apast: ['Active past participle: “who did”', 'An active past participle replaces который + past tense. Drop -л from the past and add -вший (написал → написавший); stems ending in a consonant add -ший (принёс → принёсший). It agrees with its noun in gender, number and case.', 'женщина, которая написала → женщина, написавшая эту книгу.'],
  part_ppres: ['Passive present participle: “being done”', 'Formed from imperfective transitive verbs: мы-form + -ый (читаем → читаемый, любим → любимый). It describes something that is regularly done to the noun.', 'читаемый автор (a widely read author), любимый фильм.'],
  part_ppast: ['Passive past participle: “which has been done”', 'Formed mostly from perfective verbs: -ать / -ять → -анный / -янный (прочитанный, потерянный), -ить → -енный, often with a consonant change (построенный, купленный), and some short verbs → -тый (открытый). The person who did it goes in the instrumental.', 'книга, прочитанная мной; дом, построенный в прошлом году.'],
  adv_impf: ['Imperfective verbal adverb: “while doing”', 'It shows an action happening at the same time as the main verb, by the same person. Take the они-form of the present, drop the ending and add -я (-а after ж, ш, ч, щ): читают → читая, говорят → говоря. идти gives идя.', 'Читая газету, он пил чай.'],
  adv_pf: ['Perfective verbal adverb: “having done”', 'It shows an action completed before the main verb, by the same person. Drop -л from the past and add -в: прочитал → прочитав. -ся verbs take -вшись (попрощавшись). Verbs in -йти take -я: выйдя, придя.', 'Прочитав книгу, он лёг спать.'],
  sya_refl: ['No direct object → -ся', 'When nothing is acted on (the shop opens, the lesson starts, the door closed), or the subject acts on itself (одеться = dress oneself), use the -ся verb.', 'Магазин открывается в девять. Я оделся.'],
  sya_trans: ['A direct object → no -ся', 'When the verb acts on someone or something else, that object is in the accusative and the verb has no -ся.', 'Учитель начинает урок. Мама одевает ребёнка.'],
  sya_recip: ['Doing it to each other → -ся', 'Many -ся verbs mean “each other”: встречаться, знакомиться, целоваться, ссориться, мириться.', 'Мы встречаемся по субботам. Мы познакомились в Москве.'],
  cond_unreal: ['Unreal condition: past form + бы', 'For something that isn’t true or didn’t happen, both parts use бы + the past form of the verb, whatever the time. If you could say “would” or “would have” in English, use бы.', 'Если бы у меня было время, я бы поехал.'],
  cond_real: ['Real condition: если + future', 'For a real possibility in the future, Russian uses the future tense after если (English uses the present), and no бы.', 'Если будет дождь, мы останемся дома.'],
  chtoby_same: ['Purpose, same subject: чтобы + infinitive', 'When the person doing the main action is also the one who will do the second, use чтобы + infinitive (“in order to”).', 'Я пришёл, чтобы помочь.'],
  chtoby_diff: ['Wish or request for someone else: чтобы + past form', 'After хотеть, просить, сказать and similar verbs, when the second action is done by someone else, use чтобы + the past form of the verb.', 'Я хочу, чтобы ты пришёл. Мама просит, чтобы мы вернулись.']
};
const TOPICS = { part: 'Причастия · Participles', adv: 'Деепричастия · Verbal adverbs', sya: 'Глаголы на -ся · -ся verbs', cond: 'Бы и чтобы · Conditional and purpose' };
const LEVELS = { part: 'B2', adv: 'B2', sya: 'B1', cond: 'B2' };
const DATA = `part|Мальчик, ___ на скамейке, — мой брат.|The boy sitting on the bench is my brother.|сидеть|apres;apast;ppast|0|сидящий;сидевший;сидящая;сидящего|0|part_apres|на скамейке|Agrees with мальчик: masculine nominative.|
part|Я видел женщину, ___ эту картину.|I saw the woman who painted this picture.|написать|apast;apres;ppast|0|написавшую;написавшая;пишущую;написанную|0|part_apast||Agrees with женщину: feminine accusative.|
part|На столе лежит ___ письмо.|There’s a letter on the table that has been read.|прочитать|ppast;apast;apres|0|прочитанное;прочитавшее;читающее;прочитанный|0|part_ppast||Agrees with письмо: neuter nominative.|
part|Студенты, ___ экзамен, могут идти домой.|Students who have passed the exam may go home.|сдать|apast;ppast;apres|0|сдавшие;сданные;сдающие;сдавших|0|part_apast||Agrees with студенты: plural nominative.|
part|Это дом, ___ в прошлом году.|This is the house built last year.|построить|ppast;apast;ppres|0|построенный;построивший;построенная;строящий|0|part_ppast|в прошлом году|The house didn’t build anything; it was built, so passive.|
part|Мы говорили с человеком, ___ в Японии.|We talked with a man who lives in Japan.|жить|apres;apast;ppast|0|живущим;живущий;жившим;живущего|0|part_apres||Agrees with человеком: masculine instrumental.|
part|Все ___ книги лежат на полке.|All the books we bought are on the shelf.|купить|ppast;apast;ppres|0|купленные;купившие;купленная;покупаемые|0|part_ppast||купить → купленный (п becomes пл).|
part|Задача, ___ учителем, была очень трудной.|The problem set by the teacher was very hard.|задать|ppast;apast;apres|0|заданная;задавшая;задающая;заданный|0|part_ppast|учителем|The doer of a passive participle goes in the instrumental: заданная учителем.|
part|Это очень ___ писатель.|He is a very widely read writer.|читать|ppres;apres;ppast|0|читаемый;читающий;прочитанный;читаемая|0|part_ppres|очень|The writer is read by many people regularly: passive present.|
part|Я нашёл ___ ключи.|I found the lost keys.|потерять|ppast;apast;apres|0|потерянные;потерявшие;теряющие;потерянный|0|part_ppast||Agrees with ключи: plural accusative (inanimate, so the same as the nominative).|
part|Человек, ___ в дверь, уже ушёл.|The man who knocked on the door has already left.|стучать|apast;apres;ppast|0|стучавший;стучащий;стучавшая;стучавшего|0|part_apast|уже ушёл|He knocked before he left, so the past participle.|
part|Девушка, ___ у окна, — моя сестра.|The girl standing by the window is my sister.|стоять|apres;apast;ppast|0|стоящая;стоявшая;стоящий;стоящую|0|part_apres|у окна|Agrees with девушка: feminine nominative.||
part|Мы купили книгу, ___ в прошлом году.|We bought a book published last year.|издать|ppast;apast;apres|0|изданную;издавшую;издающую;изданная|0|part_ppast|в прошлом году|Agrees with книгу: feminine accusative.||
part|Человек, ___ эту статью, хорошо знает тему.|The person who wrote this article knows the subject well.|написать|apast;apres;ppast|0|написавший;пишущий;написанный;написавшего|0|part_apast||Agrees with человек: masculine nominative.||
part|Я перечитываю письмо, ___ вчера.|I’m rereading the letter I got yesterday.|получить|ppast;apast;apres|0|полученное;получившее;получающее;полученный|0|part_ppast|вчера|получить → полученный (-ить → -енный).||
part|Дети, ___ в этом доме, ходят в одну школу.|The children who live in this house go to the same school.|жить|apres;apast;ppast|0|живущие;жившие;живущих;живущий|0|part_apres||Agrees with дети: plural nominative.||
part|Он показал мне ___ дверь.|He showed me the broken door.|сломать|ppast;apast;apres|0|сломанную;сломавшую;ломающую;сломанная|0|part_ppast||Agrees with дверь: feminine accusative.||
part|Это ___ всеми певец.|He is a singer loved by everyone.|любить|ppres;apres;apast|0|любимый;любящий;любивший;любимая|0|part_ppres|всеми|любить → любимый; the people who love him go in the instrumental: всеми.||C1
part|Это задача, ___ особого внимания.|This is a task requiring special attention.|требовать|apres;apast;ppres|0|требующая;требовавшая;требуемая;требующую|0|part_apres||Agrees with задача: feminine nominative. требовать takes the genitive: требует внимания.||C1
adv|___ домой, я встретил друга.|Walking home, I met a friend.|идти|advi;advp|0|идя;пойдя;идущий;шедший|0|adv_impf||идти gives the irregular идя.|
adv|___ книгу, он лёг спать.|Having read the book, he went to bed.|прочитать|advp;advi|0|прочитав;читая;прочитавший;прочитанную|0|adv_pf||
adv|Она слушала музыку, ___ ужин.|She listened to music while cooking dinner.|готовить|advi;advp|0|готовя;приготовив;готовящая;готовившая|0|adv_impf||
adv|___ из дома, он вспомнил о ключах.|Having left the house, he remembered his keys.|выйти|advp;advi|0|выйдя;выходя;вышедший;выйдет|0|adv_pf||Verbs in -йти form the perfective adverb with -я: выйдя, придя.|
adv|Он пил чай, ___ газету.|He drank tea while reading the paper.|читать|advi;advp|0|читая;прочитав;читающий;читавший|0|adv_impf||
adv|___ работу, мы пошли в кафе.|Having finished work, we went to a café.|закончить|advp;advi|0|закончив;заканчивая;закончивший;законченную|0|adv_pf||
adv|___ по-русски, он часто делает ошибки.|When speaking Russian, he often makes mistakes.|говорить|advi;advp|0|говоря;сказав;говорящий;говоривший|0|adv_impf|часто||
adv|___ письмо, она заплакала.|Having received the letter, she burst into tears.|получить|advp;advi|0|получив;получая;получившая;полученное|0|adv_pf||
adv|Он ушёл, не ___.|He left without saying goodbye.|попрощаться|advp;advi|0|попрощавшись;прощаясь;попрощавшийся;попрощался|0|adv_pf|не|не + verbal adverb = “without doing”. -ся verbs: -вшись (perfective), -ясь (imperfective).|
adv|___ в кресле, дедушка читал газету.|Sitting in an armchair, Grandpa was reading the paper.|сидеть|advi;advp|0|сидя;посидев;сидящий;сидевший|0|adv_impf||
adv|___ домой, он купил хлеб.|On his way back home he bought some bread.|возвращаться|advi;advp|0|возвращаясь;вернувшись;возвращающийся;возвращался|0|adv_impf||-ся verbs form the imperfective adverb with -ясь / -аясь.||
adv|___ все документы, она вышла из офиса.|Having signed all the documents, she left the office.|подписать|advp;advi|0|подписав;подписывая;подписавшая;подписанные|0|adv_pf||||
adv|Он слушал лекцию, ___ заметки.|He listened to the lecture, taking notes.|делать|advi;advp|0|делая;сделав;делающий;делавший|0|adv_impf||||
adv|___ в Москву, мы сразу пошли на Красную площадь.|Having arrived in Moscow, we went straight to Red Square.|приехать|advp;advi|0|приехав;приезжая;приехавший;приедет|0|adv_pf|сразу|||
adv|Не ___ ответа, он промолчал.|Not knowing the answer, he said nothing.|знать|advi;advp|0|зная;узнав;знающий;знавший|0|adv_impf|Не|||B2
adv|___ ужин, мама позвала детей.|Having cooked dinner, Mum called the children.|приготовить|advp;advi|0|приготовив;готовя;приготовивший;приготовленный|0|adv_pf||||
adv|___ с подругой, она забыла о времени.|Chatting with her friend, she lost track of time.|болтать|advi;advp|0|болтая;поболтав;болтающая;болтавшая|0|adv_impf||||
adv|___ руки, садитесь за стол.|Once you’ve washed your hands, sit down at the table.|помыть|advp;advi|0|помыв;моя;помывший;помытые|0|adv_pf||The verbal adverb shares the subject of the main verb, here “you”.||
sya|Магазин ___ в девять.|The shop opens at nine.|открывать / открываться|открывать:trans;открываться:refl|1|открываюсь;открываешься;открывается;открываемся;открываетесь;открываются|2|sya_refl|||n
sya|Мама ___ ребёнка.|Mum is dressing the child.|одевать / одеваться|одевать:trans;одеваться:refl|0|одеваю;одеваешь;одевает;одеваем;одеваете;одевают|2|sya_trans|ребёнка||n
sya|Я быстро ___ и вышел.|I quickly got dressed and went out.|одеть / одеться|одеть:trans;одеться:refl|1|оделся;оделась;оделось;оделись|0|sya_refl||вышел shows the speaker is a man.|p
sya|Урок ___ в десять.|The lesson starts at ten.|начинать / начинаться|начинать:trans;начинаться:refl|1|начинаюсь;начинаешься;начинается;начинаемся;начинаетесь;начинаются|2|sya_refl|||n
sya|Учитель ___ урок в десять.|The teacher starts the lesson at ten.|начинать / начинаться|начинать:trans;начинаться:refl|0|начинаю;начинаешь;начинает;начинаем;начинаете;начинают|2|sya_trans|урок||n
sya|Мы ___ в кафе каждую субботу.|We meet in a café every Saturday.|встречать / встречаться|встречать:trans;встречаться:refl|1|встречаюсь;встречаешься;встречается;встречаемся;встречаетесь;встречаются|3|sya_recip|||n
sya|Я ___ тебя на вокзале.|I’ll meet you at the station.|встретить / встретиться|встретить:trans;встретиться:refl|0|встречу;встретишь;встретит;встретим;встретите;встретят|0|sya_trans|тебя|встретить: т becomes ч in the я-form (встречу).|n
sya|Она ___ в университете.|She studies at university.|учить / учиться|учить:trans;учиться:refl|1|учусь;учишься;учится;учимся;учитесь;учатся|2|sya_refl||учиться = to be a student somewhere; учить + accusative = to learn something.|n
sya|Она ___ новые слова каждый день.|She learns new words every day.|учить / учиться|учить:trans;учиться:refl|0|учу;учишь;учит;учим;учите;учат|2|sya_trans|новые слова||n
sya|Дверь медленно ___.|The door slowly closed.|закрыть / закрыться|закрыть:trans;закрыться:refl|1|закрылся;закрылась;закрылось;закрылись|1|sya_refl||дверь is feminine.|p
sya|Нас ___ общие друзья.|Mutual friends introduced us.|познакомить / познакомиться|познакомить:trans;познакомиться:refl|0|познакомил;познакомила;познакомило;познакомили|3|sya_trans|Нас|нас is the object; the friends did the introducing.|p
sya|Мы ___ в Москве пять лет назад.|We met in Moscow five years ago.|познакомить / познакомиться|познакомить:trans;познакомиться:refl|1|познакомился;познакомилась;познакомилось;познакомились|3|sya_recip|||p
sya|Фильм ___ в десять.|The film ends at ten.|заканчивать / заканчиваться|заканчивать:trans;заканчиваться:refl|1|заканчиваюсь;заканчиваешься;заканчивается;заканчиваемся;заканчиваетесь;заканчиваются|2|sya_refl|||n|
sya|Я ___ работу в шесть.|I finish work at six.|заканчивать / заканчиваться|заканчивать:trans;заканчиваться:refl|0|заканчиваю;заканчиваешь;заканчивает;заканчиваем;заканчиваете;заканчивают|0|sya_trans|работу||n|
sya|Цены ___ каждый год.|Prices go up every year.|повышать / повышаться|повышать:trans;повышаться:refl|1|повышаюсь;повышаешься;повышается;повышаемся;повышаетесь;повышаются|5|sya_refl|||n|
sya|Магазины ___ цены перед праздниками.|Shops put up their prices before the holidays.|повышать / повышаться|повышать:trans;повышаться:refl|0|повышаю;повышаешь;повышает;повышаем;повышаете;повышают|5|sya_trans|цены||n|
sya|Мы часто ___ из-за денег.|We often quarrel about money.|ссорить / ссориться|ссорить:trans;ссориться:refl|1|ссорюсь;ссоришься;ссорится;ссоримся;ссоритесь;ссорятся|3|sya_recip|||n|
sya|Мальчик ___ собаку.|The boy is washing the dog.|мыть / мыться|мыть:trans;мыться:refl|0|мою;моешь;моет;моем;моете;моют|2|sya_trans|собаку||n|
sya|Я ___ каждое утро.|I have a wash every morning.|мыть / мыться|мыть:trans;мыться:refl|1|моюсь;моешься;моется;моемся;моетесь;моются|0|sya_refl|каждое утро||n|
sya|Они ___ после долгой разлуки.|They kissed after a long separation.|целовать / целоваться|целовать:trans;целоваться:refl|1|целовался;целовалась;целовалось;целовались|3|sya_recip|||p|
cond|Если бы у меня были деньги, я ___ машину.|If I had money, I’d buy a car.|купить|cond;real|0|купил бы;куплю;купил;покупал бы|0|cond_unreal|Если бы||
cond|Если завтра будет дождь, мы ___ дома.|If it rains tomorrow, we’ll stay at home.|остаться|real;cond|0|останемся;остались бы;остаёмся;остались|0|cond_real|Если завтра|Russian uses the future after если (English uses the present).|
cond|Я хочу, чтобы ты ___ со мной.|I want you to come with me.|пойти|chtoby_past;chtoby_inf|0|пошёл;пойдёшь;пойти;пошёл бы|0|chtoby_diff|хочу, чтобы||
cond|Я пришёл, чтобы ___ тебе.|I came to help you.|помочь|chtoby_inf;chtoby_past|0|помочь;помог;помогу;помогал|0|chtoby_same|||
cond|На твоём месте я бы ___ с ним.|If I were you, I’d talk to him.|поговорить|cond;real|0|поговорил;поговорю;поговорить;говорю|0|cond_unreal|На твоём месте|бы is already in the sentence, so only the past form is needed.|
cond|Если бы ты ___ раньше, ты бы успел на поезд.|If you had left earlier, you would have caught the train.|выйти|cond;real|0|вышел;выйдешь;выходишь;выйти|0|cond_unreal|ты бы успел||
cond|Мама попросила, чтобы мы ___ домой до десяти.|Mum asked us to come home before ten.|вернуться|chtoby_past;chtoby_inf|0|вернулись;вернёмся;вернуться;возвращаемся|0|chtoby_diff|попросила, чтобы||
cond|Он копит деньги, чтобы ___ квартиру.|He is saving money to buy a flat.|купить|chtoby_inf;chtoby_past|0|купить;купил;купит;покупал|0|chtoby_same|||
cond|Если ты не ___ мне, я всё сделаю сам.|If you don’t help me, I’ll do it all myself.|помочь|real;cond|0|поможешь;помог бы;помогаешь;помочь|0|cond_real|я всё сделаю||
cond|Я бы с удовольствием ___, но я занят.|I’d love to come, but I’m busy.|прийти|cond;real|0|пришёл;приду;прихожу;прийти|0|cond_unreal|но я занят|занят shows the speaker is a man.|
cond|Если бы я знал ответ, я бы ___ тебе.|If I knew the answer, I would tell you.|сказать|cond;real|0|сказал;скажу;говорю;сказать|0|cond_unreal|Если бы|бы is already in the sentence, so only the past form is needed.||
cond|Если ты ___ эту книгу, тебе понравится.|If you read this book, you’ll like it.|прочитать|real;cond|0|прочитаешь;прочитал бы;читаешь;прочитать|0|cond_real|тебе понравится|||
cond|Учитель хочет, чтобы мы ___ текст.|The teacher wants us to translate the text.|перевести|chtoby_past;chtoby_inf|0|перевели;переведём;перевести;переводим|0|chtoby_diff|хочет, чтобы|||
cond|Я записал адрес, чтобы не ___ его.|I wrote down the address so as not to forget it.|забыть|chtoby_inf;chtoby_past|0|забыть;забыл;забуду;забывал|0|chtoby_same|||
cond|Если бы не дождь, мы бы ___ в парк.|If it hadn’t been for the rain, we would have gone to the park.|пойти|cond;real|0|пошли;пойдём;идём;пойти|0|cond_unreal|Если бы не|||B2
cond|Скажи ему, чтобы он ___ мне.|Tell him to call me.|позвонить|chtoby_past;chtoby_inf|0|позвонил;позвонит;позвонить;звонит|0|chtoby_diff|чтобы он|||
cond|Если завтра будет солнце, мы ___ на пляж.|If it’s sunny tomorrow, we’ll go to the beach.|поехать|real;cond|0|поедем;поехали бы;едем;поехать|0|cond_real|Если завтра|||
cond|Мы встали рано, чтобы ___ на поезд.|We got up early so as to catch the train.|успеть|chtoby_inf;chtoby_past|0|успеть;успели;успеем;успевать|0|chtoby_same|||`;
const LAB = { n: ['я', 'ты', 'он / она', 'мы', 'вы', 'они'], p: ['он', 'она', 'оно', 'они'] };
window.EXERCISE = {
  id: 'advanced', step1: 'Which form or construction?', step1Short: 'Choice', scoreLabel: 'Choices right',
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, opts, a1, forms, a2, rule, cue, note, lab, lv] = l.split('|');
    const o1 = opts.split(';').map(s => { const [x, y] = s.split(':'); return y ? { label: x, kind: y } : { kind: x }; });
    const right = o1[+a1];
    return { t, ru, en, hint, o1, a1: +a1, forms: forms.split(';'), a2: +a2, labels: lab ? LAB[lab] : null, tag: '', rule, cue, note, lv: lv || undefined,
      fnote: `Needed: ${right.label ? right.label + ', ' : ''}${OPTS[right.kind].name.split(' · ').pop().toLowerCase()} (${OPTS[right.kind].name.split(' · ')[0]}): ${OPTS[right.kind].use}.` };
  })
};
}
