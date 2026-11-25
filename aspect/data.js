/* Aspect and conjugation. Line format: topic|sentence|English|imperfective/perfective|answer i or p|tense n=present f=future p=past imp=imperative|forms of the answer verb|index|rule|signal|note */
{
const OPTS = {
  i: { name: 'Несовершенный вид · Imperfective', use: 'the process, duration or repetition of an action; general facts (“have you ever…”); a background action; two actions at the same time; the future with буду; negative commands and polite invitations' },
  p: { name: 'Совершенный вид · Perfective', use: 'one action completed with a result; a chain of actions one after another; one future action that will be done (no present tense); a single request' }
};
const RULES = {
  process: ['Process and duration → imperfective', 'When the sentence focuses on the action going on, or on how long it lasted (весь вечер, два часа, целый час, долго), use the imperfective. The perfective can’t combine with a plain length of time.', 'Мы делали задание три часа. Он долго читал.'],
  repeat: ['Repeated actions → imperfective', 'Habits and repeated actions are imperfective. Look for всегда, часто, обычно, каждый день, иногда, раньше.', 'Каждое утро она пьёт кофе. Раньше он часто звонил.'],
  result: ['One completed action with a result → perfective', 'When an action was finished once and its result matters (уже, наконец, за пять минут, the result is still visible), use the perfective. за + time says how long it took to complete.', 'Он наконец написал письмо. Дети съели торт за пять минут.'],
  sequence: ['A chain of actions → perfective', 'When actions follow one another (did X, then Y), each is finished before the next starts, so they are perfective.', 'Она открыла дверь и вышла.'],
  background: ['Background interrupted by an event', 'The ongoing background action is imperfective; the event that interrupts it is perfective. когда… often introduces the background.', 'Когда мама готовила ужин, позвонил папа.'],
  simult: ['Two actions at the same time → imperfective', 'When two actions happen in parallel (пока, в то время как), both are imperfective.', 'Пока я мыла посуду, муж смотрел телевизор.'],
  fact: ['General fact or experience → imperfective', 'Asking or saying whether an action ever happened, without focusing on its result, uses the imperfective.', 'Ты читал «Войну и мир»? Я уже видел этот фильм.'],
  present: ['Present tense → imperfective only', 'Only imperfective verbs have a present tense. A perfective verb with present-tense endings always means the future.', 'Я читаю (I am reading) vs Я прочитаю (I will read).'],
  fut_process: ['Future process or habit → буду + imperfective', 'For a future action seen as a process or a repeated action, use буду, будешь… + imperfective infinitive.', 'Завтра я буду работать весь день. Я буду звонить каждый день.'],
  fut_result: ['One future result → perfective future', 'For one action that will be completed, use the perfective with present-tense endings. After когда and если about the future, Russian also uses the future.', 'Я позвоню тебе завтра. Когда ты сделаешь уроки, мы пойдём гулять.'],
  imp_request: ['A single request → perfective imperative', 'Asking someone to do something once, with a result, uses the perfective imperative.', 'Закрой окно, пожалуйста. Позвоните мне завтра.'],
  imp_invite: ['Invitations and urging → imperfective imperative', 'Polite invitations (come in, sit down, help yourself) and urging someone to start right away use the imperfective imperative.', 'Проходите, садитесь! Берите ещё.'],
  imp_neg: ['Don’t…: imperfective imperative', 'Negative commands and advice not to do something normally use the imperfective imperative.', 'Не открывай окно! Не ешь так много сладкого.']
};
const TOPICS = { past: 'Прошедшее время · Past', fut: 'Будущее время · Future', imp: 'Повелительное наклонение · Imperative', irr: 'Неправильные глаголы · Irregular verbs' };
const LEVELS = { past: 'B1', fut: 'B1', imp: 'A2', irr: 'A2' };
const DATA = `past|Вчера Олег весь вечер ___ письма.|Yesterday Oleg spent all evening writing letters.|писать/написать|i|p|писал,писала,писало,писали|0|process|весь вечер|
past|Олег наконец ___ письмо и отправил его.|Oleg finally wrote the letter and sent it.|писать/написать|p|p|написал,написала,написало,написали|0|result|наконец|
past|Мы часто ___ в этом ресторане.|We often had dinner in this restaurant.|ужинать/поужинать|i|p|ужинал,ужинала,ужинало,ужинали|3|repeat|часто|
past|Когда мама ___ ужин, позвонил папа.|While Mum was cooking dinner, Dad called.|готовить/приготовить|i|p|готовил,готовила,готовило,готовили|1|background|Когда|
past|Она ___ дверь и вышла.|She opened the door and went out.|открывать/открыть|p|p|открыл,открыла,открыло,открыли|1|sequence|и вышла|
past|Твой брат когда-нибудь ___ «Войну и мир»?|Has your brother ever read War and Peace?|читать/прочитать|i|p|читал,читала,читало,читали|0|fact|когда-нибудь|
past|Дети ___ всё мороженое за пять минут.|The children ate all the ice cream in five minutes.|есть/съесть|p|p|съел,съела,съело,съели|3|result|за пять минут|есть / съесть: past ел, съел.
past|Мы ___ домашнее задание три часа.|We spent three hours doing our homework.|делать/сделать|i|p|делал,делала,делало,делали|3|process|три часа|
past|Антон ___ домашнее задание и пошёл гулять.|Anton finished his homework and went out.|делать/сделать|p|p|сделал,сделала,сделало,сделали|0|sequence|и пошёл|
past|Раньше бабушка всегда ___ пироги по воскресеньям.|Grandma always used to bake pies on Sundays.|печь/испечь|i|p|пёк,пекла,пекло,пекли|1|repeat|всегда|печь has an unusual past: пёк, пекла, пекли.
past|Кто ___ окно? Холодно!|Who opened the window? It’s cold!|открывать/открыть|p|p|открыл,открыла,открыло,открыли|0|result|Холодно|The window is still open: the result matters, so perfective. кто takes a masculine verb.
past|Пока я ___ посуду, муж смотрел телевизор.|While I was washing the dishes, my husband watched TV.|мыть/помыть|i|p|мыл,мыла,мыло,мыли|1|simult|Пока|муж tells you the speaker is a woman, so feminine.
past|Вчера я ___ ключи и не мог попасть домой.|Yesterday I lost my keys and couldn’t get into the house.|терять/потерять|p|p|потерял,потеряла,потеряло,потеряли|0|result|не мог|не мог shows the speaker is a man.
past|Студенты ___ на вопросы преподавателя целый час.|The students answered the teacher’s questions for a whole hour.|отвечать/ответить|i|p|отвечал,отвечала,отвечало,отвечали|3|process|целый час|
fut|Завтра я ___ тебе.|I’ll call you tomorrow.|звонить/позвонить|p|f|позвоню,позвонишь,позвонит,позвоним,позвоните,позвонят|0|fut_result|Завтра|
fut|В отпуске я ___ каждый день.|On holiday I’ll read every day.|читать/прочитать|i|f|буду читать,будешь читать,будет читать,будем читать,будете читать,будут читать|0|fut_process|каждый день|
fut|Я ___ эту книгу до пятницы.|I’ll finish reading this book by Friday.|читать/прочитать|p|f|прочитаю,прочитаешь,прочитает,прочитаем,прочитаете,прочитают|0|fut_result|до пятницы|
fut|Что вы ___ завтра вечером?|What will you be doing tomorrow evening?|делать/сделать|i|f|буду делать,будешь делать,будет делать,будем делать,будете делать,будут делать|4|fut_process|завтра вечером|
fut|Когда ты ___ уроки, мы пойдём гулять.|When you’ve done your homework, we’ll go for a walk.|делать/сделать|p|f|сделаю,сделаешь,сделает,сделаем,сделаете,сделают|1|fut_result|Когда|English uses the present perfect here; Russian uses the perfective future.
fut|Не волнуйся, я ___ тебе с переездом.|Don’t worry, I’ll help you with the move.|помогать/помочь|p|f|помогу,поможешь,поможет,поможем,поможете,помогут|0|fut_result|Не волнуйся|помочь: помогу, поможешь… помогут (г alternates with ж).
fut|Весь вечер мы ___ к экзамену.|We’ll spend the whole evening preparing for the exam.|готовиться/подготовиться|i|f|буду готовиться,будешь готовиться,будет готовиться,будем готовиться,будете готовиться,будут готовиться|3|fut_process|Весь вечер|
fut|Я обязательно ___ тебе письмо.|I’ll definitely write you a letter.|писать/написать|p|f|напишу,напишешь,напишет,напишем,напишете,напишут|0|fut_result|обязательно|
fut|Через неделю они ___ новую квартиру.|In a week they’ll buy a new flat.|покупать/купить|p|f|куплю,купишь,купит,купим,купите,купят|5|fut_result|Через неделю|купить: п becomes пл in the я-form only (куплю).
fut|Мы ___ вам каждую неделю.|We’ll write to you every week.|писать/написать|i|f|буду писать,будешь писать,будет писать,будем писать,будете писать,будут писать|3|fut_process|каждую неделю|
fut|Сегодня я ___ спать пораньше.|Tonight I’ll go to bed early.|ложиться/лечь|p|f|лягу,ляжешь,ляжет,ляжем,ляжете,лягут|0|fut_result|Сегодня|лечь is irregular: лягу, ляжешь… лягут.
fut|Ты ___ мне свой номер?|Will you give me your number?|давать/дать|p|f|дам,дашь,даст,дадим,дадите,дадут|1|fut_result||дать is irregular: дам, дашь, даст, дадим, дадите, дадут.
imp|Миша, ___ окно, пожалуйста.|Misha, close the window, please.|закрывать/закрыть|p|imp|закрой,закройте|0|imp_request|пожалуйста|Talking to one friend → ты-form.
imp|Дети, не ___ окно, на улице холодно!|Kids, don’t open the window, it’s cold outside!|открывать/открыть|i|imp|открывай,открывайте|1|imp_neg|не|Talking to several people → вы-form with -те.
imp|Проходите, ___, пожалуйста!|Come in, sit down, please!|садиться/сесть|i|imp|садись,садитесь|1|imp_invite|Проходите|
imp|Анна Петровна, ___ мне, пожалуйста, этот документ.|Anna Petrovna, please give me this document.|давать/дать|p|imp|дай,дайте|1|imp_request|Анна Петровна|A name and patronymic means formal вы.
imp|Саша, не ___ так много сладкого!|Sasha, don’t eat so many sweets!|есть/съесть|i|imp|ешь,ешьте|0|imp_neg|не|есть: imperative ешь, ешьте.
imp|Ребята, ___ тексты к завтрашнему дню.|Guys, read the texts by tomorrow.|читать/прочитать|p|imp|прочитай,прочитайте|1|imp_request|к завтрашнему дню|
imp|Маша, ___ мне завтра!|Masha, call me tomorrow!|звонить/позвонить|p|imp|позвони,позвоните|0|imp_request|завтра|
imp|Игорь, не ___ мне так поздно!|Igor, don’t call me so late!|звонить/позвонить|i|imp|звони,звоните|0|imp_neg|не|
imp|Дима, ___ мне, пожалуйста, соль.|Dima, pass me the salt, please.|передавать/передать|p|imp|передай,передайте|0|imp_request|пожалуйста|
imp|Ну что же вы стоите? ___!|Why are you standing there? Come in!|входить/войти|i|imp|входи,входите|1|imp_invite|Ну что же вы стоите|Urging someone to do what they are already expected to do → imperfective.
imp|Не ___ эту книгу, Лена, она скучная.|Don’t read this book, Lena, it’s boring.|читать/прочитать|i|imp|читай,читайте|0|imp_neg|Не|
irr|Что ты обычно ___ на завтрак?|What do you usually eat for breakfast?|есть/съесть|i|n|ем,ешь,ест,едим,едите,едят|1|repeat|обычно|есть is irregular: ем, ешь, ест, едим, едите, едят.
irr|Мы ___ поехать на море.|We want to go to the seaside.|хотеть/захотеть|i|n|хочу,хочешь,хочет,хотим,хотите,хотят|3|present||хотеть is mixed: хочу, хочешь, хочет, but хотим, хотите, хотят.
irr|Они ___ на втором этаже.|They live on the second floor.|жить/пожить|i|n|живу,живёшь,живёт,живём,живёте,живут|5|present||жить: stem жив- (живу, живёшь… живут).
irr|Вы ___ мне помочь?|Can you help me?|мочь/смочь|i|n|могу,можешь,может,можем,можете,могут|4|present||мочь: могу, можешь… могут (г alternates with ж).
irr|Я ___ тебе свою книгу, если хочешь.|I’ll give you my book if you like.|давать/дать|p|f|дам,дашь,даст,дадим,дадите,дадут|0|fut_result|если хочешь|
irr|Кто ___ мой шоколад?!|Who ate my chocolate?!|есть/съесть|p|p|съел,съела,съело,съели|0|result||кто takes a masculine verb.
irr|Каждое утро она ___ кофе.|Every morning she drinks coffee.|пить/выпить|i|n|пью,пьёшь,пьёт,пьём,пьёте,пьют|2|repeat|Каждое утро|пить: пью, пьёшь… пьют.
irr|Он ___ это слово и не может вспомнить.|He has forgotten the word and can’t remember it.|забывать/забыть|p|p|забыл,забыла,забыло,забыли|0|result|не может вспомнить|
irr|Мама ___ нам каждый вечер сказки.|Mum read us fairy tales every evening.|читать/прочитать|i|p|читал,читала,читало,читали|1|repeat|каждый вечер|
irr|Почему ты не ___ суп?|Why aren’t you eating your soup?|есть/съесть|i|n|ем,ешь,ест,едим,едите,едят|1|present||
irr|Завтра я ___ в шесть утра.|Tomorrow I’ll get up at six.|вставать/встать|p|f|встану,встанешь,встанет,встанем,встанете,встанут|0|fut_result|Завтра|встать: встану, встанешь… встанут.
irr|Я обычно ___ в семь.|I usually get up at seven.|вставать/встать|i|n|встаю,встаёшь,встаёт,встаём,встаёте,встают|0|repeat|обычно|Verbs in -вать after да-, зна-, ста- drop -ва- in the present: встаю, даю, узнаю.`;
const LAB = { n: ['я', 'ты', 'он / она', 'мы', 'вы', 'они'], f: ['я', 'ты', 'он / она', 'мы', 'вы', 'они'], p: ['он', 'она', 'оно', 'они'], imp: ['ты', 'вы'] };
const PERS = { n: ['я-form', 'ты-form', 'он/она-form', 'мы-form', 'вы-form', 'они-form'], f: ['я-form', 'ты-form', 'он/она-form', 'мы-form', 'вы-form', 'они-form'], p: ['masculine', 'feminine', 'neuter', 'plural'], imp: ['ты-form', 'вы-form'] };
window.EXERCISE = {
  id: 'aspect', step1: 'Which verb?', step1Short: 'Verb', scoreLabel: 'Aspects right',
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, pair, a, tn, forms, idx, rule, cue, note] = l.split('|');
    const [iv, pv] = pair.split('/'); const verb = a === 'i' ? iv : pv;
    const tag = tn === 'p' ? 'past tense' : tn === 'imp' ? 'imperative' : tn === 'n' ? 'present' : a === 'p' ? 'future (perfective)' : 'future (буду + infinitive)';
    const how = tn === 'p' ? 'The past agrees in gender and number: -л, -ла, -ло, -ли. я, ты and вы take the gender or number of the real person.'
      : tn === 'imp' ? 'The imperative is built on the present or future stem: -й after a vowel (читай, открой), -и or -ь after a consonant (позвони, ешь). The вы-form adds -те.'
      : tn === 'f' && a === 'i' ? 'The imperfective future is буду, будешь, будет, будем, будете, будут + the infinitive.'
      : tn === 'f' ? 'A perfective verb takes present-tense endings, but the meaning is future.'
      : 'Present tense: only imperfective verbs have one.';
    return { t, ru, en, hint: pair.replace('/', ' / '), o1: [{ label: iv, kind: 'i' }, { label: pv, kind: 'p' }], a1: a === 'i' ? 0 : 1, forms: forms.split(','), a2: +idx, labels: LAB[tn], tag, rule, cue, note, fnote: `Needed: the ${PERS[tn][+idx]} of ${verb}, ${tag}. ${how}` };
  })
};
}
