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
other|Он живёт прямо ___.|He lives right opposite the school.|школа|напротив;около;у|0|школа,школы,школе,школу,школой,школе|G|other_gen|прямо|`;
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
