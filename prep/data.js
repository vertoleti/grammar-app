/* Prepositions. Line format: topic|sentence|English|noun|preposition options (;)|answer index|six forms N,G,D,A,I,P|case after it N G D A I P|rule|signal|note */
{
const CASES = ['N', 'G', 'D', 'A', 'I', 'P'];
const EN = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'];
const LABELS = ['Именительный · Nominative', 'Родительный · Genitive', 'Дательный · Dative', 'Винительный · Accusative', 'Творительный · Instrumental', 'Предложный · Prepositional'];
const OPTS = {
  'в': { name: 'в', use: 'в + prepositional for “in” (где?), в + accusative for “into, to” (куда?); also days (в пятницу) and months (в марте)' },
  'на': { name: 'на', use: 'на + prepositional for “on, at” with surfaces, events and some places (на почте, на концерте); на + accusative for where to, and for how long a result lasts (на неделю)' },
  'из': { name: 'из', use: 'из + genitive: out of, from places that take в (в школе → из школы)' },
  'с': { name: 'с', use: 'с + genitive: from, off places that take на (на работе → с работы); с + instrumental: with' },
  'от': { name: 'от', use: 'от + genitive: from a person (от мамы), away from' },
  'к': { name: 'к', use: 'к + dative: towards, to a person or their place (к врачу, к нам)' },
  'у': { name: 'у', use: 'у + genitive: at someone’s place (у бабушки), by; у меня есть = I have' },
  'до': { name: 'до', use: 'до + genitive: until, before, as far as' },
  'после': { name: 'после', use: 'после + genitive: after' },
  'через': { name: 'через', use: 'через + accusative: in (after) a period of time; across' },
  'за': { name: 'за', use: 'за + accusative: in, within (how long it took); за + instrumental: behind' },
  'без': { name: 'без', use: 'без + genitive: without' },
  'для': { name: 'для', use: 'для + genitive: for (someone, a purpose)' },
  'о': { name: 'о', use: 'о + prepositional: about (before a consonant)' },
  'об': { name: 'об', use: 'об + prepositional: about, before a vowel (об отпуске)' },
  'по': { name: 'по', use: 'по + dative: along, around, by means of (по телефону)' },
  'под': { name: 'под', use: 'под + instrumental: under (where); под + accusative: under (where to)' },
  'около': { name: 'около', use: 'около + genitive: near, about' },
  'напротив': { name: 'напротив', use: 'напротив + genitive: opposite' }
};
const RULES = {
  v_place: ['в + prepositional: inside a place', 'Most buildings, rooms, towns and countries take в. To say where something is (где?), use the prepositional.', 'в школе, в ресторане, в Испании.'],
  na_place: ['на + prepositional: on, at', 'Surfaces, open spaces, events, and a fixed list of places take на: на работе, на почте, на вокзале, на улице, на даче, на концерте, на выставке.', 'Папа на работе. Мы были на концерте.'],
  v_dir: ['в + accusative: going into', 'Where to (куда?) uses the same preposition as where (где?), but with the accusative: в школе → в школу.', 'Мы идём в театр. Мы поедем в Италию.'],
  na_dir: ['на + accusative: going to, putting on', 'Places that take на keep на for direction, now with the accusative: на работе → на работу. Putting something on a surface is на + accusative too.', 'Я иду на работу. Положи книгу на стол.'],
  k_person: ['To a person: к + dative', 'You never go “в” a person. To a person or their home, use к + dative.', 'Я иду к врачу. Приходи к нам.'],
  iz_from: ['From a в-place: из + genitive', 'Coming from a place that takes в, use из + genitive.', 'в Москве → из Москвы, в школе → из школы.'],
  s_from: ['From a на-place: с + genitive', 'Coming from a place that takes на, use с + genitive. с also means “off” a surface.', 'на работе → с работы, на концерте → с концерта, с полки.'],
  ot_person: ['From a person: от + genitive', 'From a person, or from their place, use от + genitive.', 'письмо от мамы, я иду от врача.'],
  u_person: ['At someone’s place: у + genitive', 'Being at a person’s home or office is у + genitive. It pairs with к (going there) and от (coming back).', 'Я был у бабушки. к бабушке → у бабушки → от бабушки.'],
  u_have: ['Having: у + genitive + есть', 'Russian says “at someone there is”: у + the owner in the genitive.', 'У Олега есть машина.'],
  v_time: ['Days: в + accusative', 'Days of the week take в + accusative.', 'в пятницу, в среду, в субботу.'],
  v_month: ['Months and years: в + prepositional', 'Months (and years) take в + prepositional.', 'в марте, в 2020 году.'],
  cherez: ['“In” a period of time: через + accusative', 'через + accusative says how long until something happens.', 'Я вернусь через неделю.'],
  na_time: ['How long the result lasts: на + accusative', 'на + accusative gives the planned length of a stay or a result.', 'Мы приехали на неделю.'],
  za_time: ['How long it took: за + accusative', 'за + accusative says how much time it took to complete something.', 'Он сделал это за час.'],
  posle: ['After: после + genitive', 'после + genitive means “after”.', 'после урока, после работы.'],
  do_time: ['Until, before: до + genitive', 'до + genitive means “until” or “before”.', 'до вечера, до обеда.'],
  bez: ['Without: без + genitive', 'без always takes the genitive.', 'кофе без молока.'],
  dlya: ['For: для + genitive', 'для + genitive: for someone or some purpose.', 'подарок для Анны.'],
  o_about: ['About: о / об + prepositional', 'о + prepositional means “about”; before a vowel it becomes об.', 'о политике, об отпуске.'],
  s_with: ['With: с + instrumental', 'Together with someone or something: с + instrumental.', 'с сестрой, кофе с молоком.'],
  po: ['по + dative: around, along, by', 'по + dative means moving around or along a space, or communicating by some means.', 'по парку, по телефону.'],
  pod: ['Under: под + instrumental', 'Where something is under: под + instrumental.', 'Кошка спит под столом.'],
  other_gen: ['Place prepositions with the genitive', 'около (near), напротив (opposite), у (by), возле, вокруг all take the genitive.', 'напротив школы, около дома.']
};
const TOPICS = { where: 'Где? · Where', whereto: 'Куда? · Where to', from: 'Откуда? · Where from', person: 'У, к, от · People', time: 'Когда? · Time', other: 'О, с, без, для… · Other' };
const LEVELS = { where: 'A1', whereto: 'A1', from: 'A2', person: 'A2', time: 'B1', other: 'A2' };
const DATA = `where|Мой папа работает ___.|My dad works at the post office.|почта|в;на;к|1|почта,почты,почте,почту,почтой,почте|P|na_place|работает|
where|Мы ужинали ___.|We had dinner in a restaurant.|ресторан|в;на;у|0|ресторан,ресторана,ресторану,ресторан,рестораном,ресторане|P|v_place|ужинали|
where|Вчера мы были ___.|Yesterday we were at an exhibition.|выставка|в;на;к|1|выставка,выставки,выставке,выставку,выставкой,выставке|P|na_place|были|Events take на: на выставке, на концерте, на уроке.
where|Летом я живу ___.|In summer I live at the dacha.|дача|в;на;у|1|дача,дачи,даче,дачу,дачей,даче|P|na_place|живу|
where|Мой сын учится ___.|My son goes to school.|школа|в;на;к|0|школа,школы,школе,школу,школой,школе|P|v_place|учится|
where|Дети играют ___.|The children are playing outside.|улица|в;на;по|1|улица,улицы,улице,улицу,улицей,улице|P|na_place|играют|на улице = outside, in the street.
where|Мы встретились ___.|We met at the station.|вокзал|в;на;к|1|вокзал,вокзала,вокзалу,вокзал,вокзалом,вокзале|P|na_place|встретились|
where|Мой брат живёт ___.|My brother lives in Spain.|Испания|в;на;из|0|Испания,Испании,Испании,Испанию,Испанией,Испании|P|v_place|живёт|Countries and cities take в.
whereto|Завтра мы идём ___.|Tomorrow we’re going to the theatre.|театр|в;на;к|0|театр,театра,театру,театр,театром,театре|A|v_dir|идём|
whereto|Утром я иду ___.|In the morning I go to work.|работа|в;на;к|1|работа,работы,работе,работу,работой,работе|A|na_dir|иду|
whereto|Положи книгу ___.|Put the book on the table.|стол|в;на;под|1|стол,стола,столу,стол,столом,столе|A|na_dir|Положи|
whereto|В августе они едут ___.|In August they’re going to the seaside.|море|в;на;к|1|море,моря,морю,море,морем,море|A|na_dir|едут|на море = to the seaside.
whereto|Летом мы поедем ___.|In summer we’ll go to Italy.|Италия|в;на;из|0|Италия,Италии,Италии,Италию,Италией,Италии|A|v_dir|поедем|
whereto|Вечером я пойду ___.|In the evening I’ll go over to my friend’s.|друг|к;в;у|0|друг,друга,другу,друга,другом,друге|D|k_person|пойду|To a person: к + dative, never в.
from|Я приехал ___ вчера.|I came from Moscow yesterday.|Москва|из;с;от|0|Москва,Москвы,Москве,Москву,Москвой,Москве|G|iz_from|приехал|в Москве → из Москвы.
from|Он поздно вернулся ___.|He came back from work late.|работа|из;с;от|1|работа,работы,работе,работу,работой,работе|G|s_from|вернулся|на работе → с работы.
from|Я получила письмо ___.|I got a letter from my mum.|мама|из;с;от|2|мама,мамы,маме,маму,мамой,маме|G|ot_person|письмо|From a person: от.
from|Возьми книгу ___.|Take the book off the shelf.|полка|из;с;от|1|полка,полки,полке,полку,полкой,полке|G|s_from|Возьми|с = off a surface.
from|Дети вышли ___.|The children came out of the school.|школа|из;с;от|0|школа,школы,школе,школу,школой,школе|G|iz_from|вышли|
from|Мы вернулись ___ поздно вечером.|We got back from the concert late in the evening.|концерт|из;с;от|1|концерт,концерта,концерту,концерт,концертом,концерте|G|s_from|вернулись|на концерте → с концерта.
from|Я только что ___, у меня всё хорошо.|I’ve just come from the doctor’s, I’m fine.|врач|из;с;от|2|врач,врача,врачу,врача,врачом,враче|G|ot_person|только что|From a person’s place: от + genitive.
person|Вчера я был ___.|Yesterday I was at my grandma’s.|бабушка|у;к;в|0|бабушка,бабушки,бабушке,бабушку,бабушкой,бабушке|G|u_person|был|
person|Кажется, ___ есть машина.|I think Oleg has a car.|Олег|у;к;с|0|Олег,Олега,Олегу,Олега,Олегом,Олеге|G|u_have|есть|
person|Завтра я иду ___ на приём.|Tomorrow I’m going to the doctor for an appointment.|врач|к;у;в|0|врач,врача,врачу,врача,врачом,враче|D|k_person|иду|
person|Приходи ___ в субботу!|Come over to our place on Saturday!|мы|к;у;в|0|мы,нас,нам,нас,нами,нас|D|k_person|Приходи|
person|Я пока живу ___.|For now I live with my parents.|родители|у;к;с|0|родители,родителей,родителям,родителей,родителями,родителях|G|u_person|живу|
person|Сколько лет ___ эта машина?|How long has your brother had this car?|брат|у;к;от|0|брат,брата,брату,брата,братом,брате|G|u_have|эта машина|
time|Давай встретимся ___.|Let’s meet on Friday.|пятница|в;на;через|0|пятница,пятницы,пятнице,пятницу,пятницей,пятнице|A|v_time||Days of the week: в + accusative.
time|Я вернусь ___.|I’ll be back in a week.|неделя|через;в;на|0|неделя,недели,неделе,неделю,неделей,неделе|A|cherez|вернусь|
time|Мы приехали сюда ___.|We’ve come here for a week.|неделя|на;через;в|0|неделя,недели,неделе,неделю,неделей,неделе|A|na_time|приехали|
time|Он написал статью ___.|He wrote the article in an hour.|час|за;через;на|0|час,часа,часу,час,часом,часе|A|za_time|написал|
time|Давай пойдём в кафе ___.|Let’s go to a café after the lesson.|урок|после;до;через|0|урок,урока,уроку,урок,уроком,уроке|G|posle||
time|Я работаю ___.|I work until the evening.|вечер|до;после;через|0|вечер,вечера,вечеру,вечер,вечером,вечере|G|do_time|работаю|
time|Это было ___.|That was in March.|март|в;на;через|0|март,марта,марту,март,мартом,марте|P|v_month||Months take в + prepositional: в марте.
other|Я пью кофе ___.|I drink coffee without milk.|молоко|без;с;для|0|молоко,молока,молоку,молоко,молоком,молоке|G|bez||
other|Этот подарок ___.|This present is for Anna.|Анна|для;к;у|0|Анна,Анны,Анне,Анну,Анной,Анне|G|dlya||
other|Мы часто говорим ___.|We often talk about politics.|политика|о;с;на|0|политика,политики,политике,политику,политикой,политике|P|o_about|говорим|
other|Вчера я ходил в кино ___.|Yesterday I went to the cinema with my sister.|сестра|с;без;у|0|сестра,сестры,сестре,сестру,сестрой,сестре|I|s_with||
other|Он всё время думает ___.|He’s always thinking about the holiday.|отпуск|об;о;с|0|отпуск,отпуска,отпуску,отпуск,отпуском,отпуске|P|o_about|думает|Before a vowel, о becomes об.
other|Мы долго гуляли ___.|We walked around the park for a long time.|парк|по;в;на|0|парк,парка,парку,парк,парком,парке|D|po|гуляли|
other|Кошка спит ___.|The cat is sleeping under the table.|стол|под;на;за|0|стол,стола,столу,стол,столом,столе|I|pod|спит|
other|Я говорил с ним ___.|I talked to him on the phone.|телефон|по;в;с|0|телефон,телефона,телефону,телефон,телефоном,телефоне|D|po|говорил|
other|Он живёт прямо ___.|He lives right opposite the school.|школа|напротив;около;у|0|школа,школы,школе,школу,школой,школе|G|other_gen|прямо|
where|Мама работает ___.|Mum works at a factory.|завод|в;на;у|1|завод,завода,заводу,завод,заводом,заводе|P|na_place|работает|Factories and plants take на: на заводе, на фабрике.
where|Книги лежат ___.|The books are on the shelf.|полка|в;на;под|1|полка,полки,полке,полку,полкой,полке|P|na_place|лежат|
where|Он сейчас ___.|He's at work now.|работа|в;на;к|1|работа,работы,работе,работу,работой,работе|P|na_place|сейчас|
where|Деньги лежат ___.|The money is in the bank.|банк|в;на;у|0|банк,банка,банку,банк,банком,банке|P|v_place|лежат|
where|Студенты сидят ___.|The students are sitting in the lecture.|лекция|в;на;к|1|лекция,лекции,лекции,лекцию,лекцией,лекции|P|na_place|сидят|Events and activities: на лекции, на уроке, на концерте.
where|Я видел его ___.|I saw him at the market.|рынок|в;на;у|1|рынок,рынка,рынку,рынок,рынком,рынке|P|na_place|видел|
where|Мы жили ___.|We lived in a small town.|маленький город|в;на;из|0|маленький город,маленького города,маленькому городу,маленький город,маленьким городом,маленьком городе|P|v_place|жили|
where|Ключи ___.|The keys are in my bag.|моя сумка|в;на;за|0|моя сумка,моей сумки,моей сумке,мою сумку,моей сумкой,моей сумке|P|v_place|Ключи|
where|Мы встречаемся ___.|We're meeting in the square.|площадь|в;на;у|1|площадь,площади,площади,площадь,площадью,площади|P|na_place|встречаемся|Open spaces take на: на площади, на улице, на стадионе.
whereto|Завтра мы едем ___.|Tomorrow we're going to the sea.|море|в;на;к|1|море,моря,морю,море,морем,море|A|na_dir|едем|
whereto|Я иду ___.|I'm going to the shop.|магазин|в;на;к|0|магазин,магазина,магазину,магазин,магазином,магазине|A|v_dir|иду|
whereto|Он ушёл ___.|He has gone to work.|работа|в;на;к|1|работа,работы,работе,работу,работой,работе|A|na_dir|ушёл|
whereto|Мы летим ___.|We're flying to Italy.|Италия|в;на;к|0|Италия,Италии,Италии,Италию,Италией,Италии|A|v_dir|летим|
whereto|Она пошла ___.|She went to the post office.|почта|в;на;к|1|почта,почты,почте,почту,почтой,почте|A|na_dir|пошла|
whereto|Дети побежали ___.|The children ran out into the street.|улица|в;на;к|1|улица,улицы,улице,улицу,улицей,улице|A|na_dir|побежали|
whereto|Я записался ___.|I've signed up for a course.|курсы|в;на;к|1|курсы,курсов,курсам,курсы,курсами,курсах|A|na_dir|записался|
whereto|Повесь пальто ___.|Hang the coat in the wardrobe.|шкаф|в;на;за|0|шкаф,шкафа,шкафу,шкаф,шкафом,шкафе|A|v_dir|Повесь|
whereto|Мы пригласили его ___.|We invited him to the wedding.|свадьба|в;на;к|1|свадьба,свадьбы,свадьбе,свадьбу,свадьбой,свадьбе|A|na_dir|пригласили|
whereto|Вода попала ___.|Water got into the phone.|телефон|в;на;к|0|телефон,телефона,телефону,телефон,телефоном,телефоне|A|v_dir|попала|
whereto|Они переехали ___.|They moved to the countryside.|деревня|в;на;к|0|деревня,деревни,деревне,деревню,деревней,деревне|A|v_dir|переехали|
from|Он только что вернулся ___.|He has just come back from work.|работа|из;с;от|1|работа,работы,работе,работу,работой,работе|G|s_from|вернулся|The opposite of на: с работы, с концерта, с вокзала.
from|Мы приехали ___.|We came from Moscow.|Москва|из;с;от|0|Москва,Москвы,Москве,Москву,Москвой,Москве|G|iz_from|приехали|The opposite of в: из.
from|Достань молоко ___.|Get the milk out of the fridge.|холодильник|из;с;от|0|холодильник,холодильника,холодильнику,холодильник,холодильником,холодильнике|G|iz_from|Достань|
from|Сними книгу ___.|Take the book off the shelf.|полка|из;с;от|1|полка,полки,полке,полку,полкой,полке|G|s_from|Сними|Off a surface: с.
from|Письмо пришло ___.|The letter came from the bank.|банк|из;с;от|0|банк,банка,банку,банк,банком,банке|G|iz_from|пришло|
from|Дети пришли ___.|The children came back from the park.|парк|из;с;от|0|парк,парка,парку,парк,парком,парке|G|iz_from|пришли|
from|Он вышел ___ в шесть.|He left the office at six.|офис|из;с;от|0|офис,офиса,офису,офис,офисом,офисе|G|iz_from|вышел|
from|Мы вернулись ___ поздно.|We got back from the concert late.|концерт|из;с;от|1|концерт,концерта,концерту,концерт,концертом,концерте|G|s_from|вернулись|
from|Туристы приехали ___.|The tourists came from the Urals.|Урал|из;с;от|1|Урал,Урала,Уралу,Урал,Уралом,Урале|G|s_from|приехали|На Урале → с Урала.
from|Она получила письмо ___.|She received a letter from her grandmother.|бабушка|из;с;от|2|бабушка,бабушки,бабушке,бабушку,бабушкой,бабушке|G|ot_person|получила письмо|From a person: от.
person|Я узнал это ___.|I found it out from my colleague.|коллега|к;у;от|2|коллега,коллеги,коллеге,коллегу,коллегой,коллеге|G|ot_person|узнал это|
person|Подойди ___!|Come up to the board!|доска|к;у;от|0|доска,доски,доске,доску,доской,доске|D|k_person|Подойди|К also means towards a thing: к доске.
person|Я знаю, что ___ есть машина.|I know my brother has a car.|мой брат|к;у;от|1|мой брат,моего брата,моему брату,моего брата,моим братом,моём брате|G|u_have|есть|Having something: у + genitive + есть.
person|Она вернулась ___ поздно вечером.|She came back from the dentist late in the evening.|стоматолог|к;у;от|2|стоматолог,стоматолога,стоматологу,стоматолога,стоматологом,стоматологе|G|ot_person|вернулась|
person|Мы ездили в гости ___.|We went to visit our relatives.|родственники|к;у;от|0|родственники,родственников,родственникам,родственников,родственниками,родственниках|D|k_person|в гости|
person|Ночевать будешь ___?|Will you stay the night at your aunt's?|тётя|к;у;от|1|тётя,тёти,тёте,тётю,тётей,тёте|G|u_person|Ночевать|
person|Мне надо зайти ___.|I need to drop in at the doctor's.|врач|к;у;от|0|врач,врача,врачу,врача,врачом,враче|D|k_person|зайти|
person|Сегодня ___ нет времени.|The boss has no time today.|начальник|к;у;от|1|начальник,начальника,начальнику,начальника,начальником,начальнике|G|u_have|нет времени|
person|Я получил подарок ___.|I got a present from my parents.|родители|к;у;от|2|родители,родителей,родителям,родителей,родителями,родителях|G|ot_person|получил подарок|
person|Она долго жила ___.|She lived at her friend's for a long time.|подруга|к;у;от|1|подруга,подруги,подруге,подругу,подругой,подруге|G|u_person|жила|
time|Мы уезжаем ___.|We're leaving in an hour.|час|через;в;на|0|час,часа,часу,час,часом,часе|A|cherez|уезжаем|
time|Магазин закрыт ___.|The shop is closed for lunch.|обед|на;в;через|0|обед,обеда,обеду,обед,обедом,обеде|A|na_time|закрыт|
time|Он родился ___.|He was born in May.|май|в;на;через|0|май,мая,маю,май,маем,мае|P|v_month|родился|
time|Встретимся ___.|Let's meet after work.|работа|после;до;через|0|работа,работы,работе,работу,работой,работе|G|posle|Встретимся|
time|Позвони мне ___.|Call me before lunch.|обед|до;после;через|0|обед,обеда,обеду,обед,обедом,обеде|G|do_time|Позвони мне|
time|Я прочитал книгу ___.|I read the book in a week.|неделя|за;через;на|0|неделя,недели,неделе,неделю,неделей,неделе|A|za_time|прочитал|How long it took: за + accusative.
time|Они поженились ___.|They got married on Saturday.|суббота|в;на;через|0|суббота,субботы,субботе,субботу,субботой,субботе|A|v_time|поженились|
time|Мы взяли машину ___.|We hired the car for the weekend.|выходные|на;за;через|0|выходные,выходных,выходным,выходные,выходными,выходных|A|na_time|взяли|For a planned period: на + accusative.
time|Поезд придёт ___.|The train will arrive in a minute.|минута|через;за;на|0|минута,минуты,минуте,минуту,минутой,минуте|A|cherez|придёт|
time|Все ушли ___.|Everyone left after the lecture.|лекция|после;до;через|0|лекция,лекции,лекции,лекцию,лекцией,лекции|G|posle|ушли|
other|Он вошёл ___.|He came in without knocking.|стук|без;с;для|0|стук,стука,стуку,стук,стуком,стуке|G|bez|вошёл|
other|Это лекарство ___.|This medicine is for a cough.|кашель|от;для;без|0|кашель,кашля,кашлю,кашель,кашлем,кашле|G|other_gen|лекарство|A remedy against something: от.
other|Я купил цветы ___.|I bought flowers for my mum.|мама|для;к;у|0|мама,мамы,маме,маму,мамой,маме|G|dlya|купил цветы|
other|Он смотрит фильм ___.|He's watching a film with subtitles.|субтитры|с;без;для|0|субтитры,субтитров,субтитрам,субтитры,субтитрами,субтитрах|I|s_with|смотрит фильм|
other|Мы долго спорили ___.|We argued about the plan for a long time.|план|о;с;на|0|план,плана,плану,план,планом,плане|P|o_about|спорили|
other|Отправь документы ___.|Send the documents by post.|почта|по;в;с|0|почта,почты,почте,почту,почтой,почте|D|po|Отправь|
other|Мы живём ___.|We live near the station.|вокзал|около;напротив;под|0|вокзал,вокзала,вокзалу,вокзал,вокзалом,вокзале|G|other_gen|живём|
other|Кот спрятался ___.|The cat hid under the sofa.|диван|под;на;за|0|диван,дивана,дивану,диван,диваном,диване|A|pod|спрятался|Movement under something: под + accusative.
other|Он скучает ___.|He misses his home.|дом|по;о;за|0|дом,дома,дому,дом,домом,доме|D|po|скучает|Скучать по + dative.
other|Мы поговорили ___.|We talked about the weather.|погода|о;об;с|0|погода,погоды,погоде,погоду,погодой,погоде|P|o_about|поговорили|
other|Чай ___ — мой любимый.|Tea with lemon is my favourite.|лимон|с;без;для|0|лимон,лимона,лимону,лимон,лимоном,лимоне|I|s_with|Чай|`;
window.EXERCISE = {
  id: 'prep', step1: 'Which preposition?', step1Short: 'Preposition', scoreLabel: 'Prepositions right', gapPrefix: true,
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, opts, a1, forms, c, rule, cue, note] = l.split('|');
    const o1 = opts.split(';').map(x => ({ label: x, kind: x }));
    const ci = CASES.indexOf(c);
    return { t, ru, en, hint, o1, a1: +a1, forms: forms.split(','), a2: ci, labels: LABELS, tag: '', rule, cue, note,
      fnote: `Needed: ${o1[+a1].label} + the ${EN[ci]} (${LABELS[ci].split(' · ')[0].toLowerCase()} падеж) of ${hint}.` };
  })
};
}
