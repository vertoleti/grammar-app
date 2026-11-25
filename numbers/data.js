/* Numbers and quantity. Line format: topic|sentence|English|word|form 0 nom sg, 1 gen sg, 2 gen pl|forms nom sg,gen sg,gen pl|rule|signal|note */
{
const LABELS = ['Nominative singular', 'Genitive singular', 'Genitive plural'];
const OPTS = {
  ns: { name: 'Nominative singular', use: 'after 1 and numbers ending in 1 (21, 31, 101…), but not 11' },
  gs: { name: 'Genitive singular', use: 'after 2, 3, 4 and numbers ending in them (22, 33, 104…), but not 12–14; also amounts of uncountable things (много воды, мало времени)' },
  gp: { name: 'Genitive plural', use: 'after 5–20, numbers ending in 5–9 or 0, and 11–14; after много, мало, сколько, несколько with things you can count' }
};
const RULES = {
  one: ['1, 21, 31…: nominative singular', 'When a number ends in один / одна / одно (but is not 11), the noun stays in the nominative singular. один, одна, одно agree with the gender of the noun.', 'один брат, двадцать одна книга, сто одно окно.'],
  few: ['2, 3, 4, 22, 23, 24…: genitive singular', 'When a number ends in два / две, три or четыре (but is not 12, 13 or 14), the noun goes in the genitive singular. два is used with masculine and neuter nouns, две with feminine ones.', 'два брата, две сестры, тридцать три окна.'],
  many: ['5 and up, and 11–14: genitive plural', 'For 5–20, round numbers (сто, тысяча) and every number ending in 5, 6, 7, 8, 9 or 0, the noun goes in the genitive plural. 11–14 always take the genitive plural, even though they end in 1–4. Only the last word of a compound number counts.', 'пять книг, двенадцать этажей, сто рублей.'],
  age: ['Age: год, года, лет', 'Age uses the dative of the person and the counting rule for год: 1 → год, 2–4 → года, 5+ and 11–14 → лет. лет is the irregular genitive plural, also used after сколько and несколько.', 'Мне двадцать один год, ей двадцать два года, ему двадцать пять лет.'],
  qty: ['много, мало, сколько, несколько + genitive plural', 'Quantity words take the genitive. With things you can count, use the genitive plural.', 'много книг, сколько братьев, несколько ресторанов.'],
  qty_mass: ['Uncountable amounts: genitive singular', 'With things you cannot count (water, time, sugar, juice), много, мало, сколько and containers (стакан, пакет) take the genitive singular.', 'много воды, мало времени, пакет сока.']
};
const TOPICS = { count: 'Counting things', age: 'Age', time: 'Time', money: 'Money', qty: 'много, мало, сколько' };
const DATA = `count|У меня один ___.|I have one brother.|брат|0|брат,брата,братьев|one|один|
count|У нас две ___.|We have two cars.|машина|1|машина,машины,машин|few|две|
count|В классе двадцать ___.|There are twenty students in the class.|студент|2|студент,студента,студентов|many|двадцать|
count|На столе три ___.|There are three apples on the table.|яблоко|1|яблоко,яблока,яблок|few|три|
count|Я прочитал пять ___.|I’ve read five books.|книга|2|книга,книги,книг|many|пять|
count|В комнате двадцать один ___.|There are twenty-one chairs in the room.|стул|0|стул,стула,стульев|one|двадцать один|The last word decides: 21 behaves like 1.
count|В этом доме двенадцать ___.|This building has twelve floors.|этаж|2|этаж,этажа,этажей|many|двенадцать|11–14 always take the genitive plural, even though they end in 1–4.
count|У неё четыре ___.|She has four sisters.|сестра|1|сестра,сестры,сестёр|few|четыре|
count|Мы купили тридцать два ___.|We bought thirty-two pencils.|карандаш|1|карандаш,карандаша,карандашей|few|тридцать два|
count|В нашем городе сто ___.|There are a hundred schools in our town.|школа|2|школа,школы,школ|many|сто|Round numbers such as сто and тысяча take the genitive plural.
count|У меня в саду одно ___.|There is one tree in my garden.|дерево|0|дерево,дерева,деревьев|one|одно|одно is the neuter form of один.
count|Мы провели там три ___.|We spent three days there.|день|1|день,дня,дней|few|три|день loses its е in every other form: дня, дней.
count|Отпуск длился одиннадцать ___.|The holiday lasted eleven days.|день|2|день,дня,дней|many|одиннадцать|
count|Через две ___ начнутся каникулы.|The holidays start in two weeks.|неделя|1|неделя,недели,недель|few|две|
count|У него сорок пять ___ в соцсетях.|He has 45 friends on social media.|друг|2|друг,друга,друзей|many|сорок пять|друг has an irregular plural: друзья, друзей.
count|В группе двадцать три ___.|There are 23 people in the group.|человек|1|человек,человека,человек|few|двадцать три|After numbers, человек has the genitive plural человек (not людей).
age|Мне двадцать ___.|I’m twenty.|год|2|год,года,лет|age|двадцать|
age|Моей дочке двадцать один ___.|My daughter is twenty-one.|год|0|год,года,лет|age|двадцать один|
age|Бабушке восемьдесят три ___.|Grandma is 83.|год|1|год,года,лет|age|восемьдесят три|
age|Сколько ___ твоему брату?|How old is your brother?|год|2|год,года,лет|age|Сколько|
age|Ему уже тридцать четыре ___.|He’s already 34.|год|1|год,года,лет|age|тридцать четыре|
age|Нашему дому сто пятнадцать ___.|Our house is 115 years old.|год|2|год,года,лет|age|сто пятнадцать|Only the last two digits matter: 115 ends in 15, so лет.
time|Сейчас три ___.|It’s three o’clock.|час|1|час,часа,часов|few|три|
time|Фильм начинается в восемь ___.|The film starts at eight.|час|2|час,часа,часов|many|восемь|
time|Подожди пять ___!|Wait five minutes!|минута|2|минута,минуты,минут|many|пять|
time|Урок длится сорок ___.|The lesson lasts forty minutes.|минута|2|минута,минуты,минут|many|сорок|
time|Я ждал тебя двадцать две ___.|I waited 22 minutes for you.|минута|1|минута,минуты,минут|few|двадцать две|
time|Мы встаём в шесть ___ утра.|We get up at six in the morning.|час|2|час,часа,часов|many|шесть|
time|Сейчас двадцать один ___.|It’s 9 pm (21:00).|час|0|час,часа,часов|one|двадцать один|
time|Я учу русский уже три ___.|I’ve been learning Russian for three years.|год|1|год,года,лет|few|три|
money|Это стоит сто ___.|That costs 100 roubles.|рубль|2|рубль,рубля,рублей|many|сто|
money|Билет стоит двадцать два ___.|The ticket costs 22 roubles.|рубль|1|рубль,рубля,рублей|few|двадцать два|
money|У меня остался один ___.|I have one rouble left.|рубль|0|рубль,рубля,рублей|one|один|
money|Мороженое стоит пятьдесят один ___.|The ice cream costs 51 roubles.|рубль|0|рубль,рубля,рублей|one|пятьдесят один|51 ends in 1, so the singular: пятьдесят один рубль.
money|Ваша сдача — три ___.|Your change is three kopecks.|копейка|1|копейка,копейки,копеек|few|три|
money|Эта книга стоит пятьсот ___.|This book costs 500 roubles.|рубль|2|рубль,рубля,рублей|many|пятьсот|
money|Он заплатил тысячу ___.|He paid a thousand dollars.|доллар|2|доллар,доллара,долларов|many|тысячу|
qty|В городе много ___.|There are a lot of museums in the city.|музей|2|музей,музея,музеев|qty|много|
qty|Сколько у тебя ___?|How many brothers do you have?|брат|2|брат,брата,братьев|qty|Сколько|брат has an irregular plural: братья, братьев.
qty|Я выпил много ___.|I drank a lot of water.|вода|1|вода,воды,вод|qty_mass|много|
qty|У меня мало ___.|I have little time.|время|1|время,времени,времён|qty_mass|мало|
qty|Здесь несколько ___.|There are a few restaurants here.|ресторан|2|ресторан,ресторана,ресторанов|qty|несколько|
qty|Сколько стоит килограмм ___?|How much is a kilo of tomatoes?|помидор|2|помидор,помидора,помидоров|qty|килограмм|Tomatoes are counted, so the genitive plural.
qty|Купи, пожалуйста, пакет ___.|Please buy a carton of juice.|сок|1|сок,сока,соков|qty_mass|пакет|
qty|У нас было мало ___.|We had few guests.|гость|2|гость,гостя,гостей|qty|мало|
qty|В этом тексте много ___.|There are a lot of mistakes in this text.|ошибка|2|ошибка,ошибки,ошибок|qty|много|
qty|Сколько ___ нужно добавить?|How much sugar should I add?|сахар|1|сахар,сахара,сахаров|qty_mass|Сколько|
qty|Сколько ___ в неделе?|How many days are there in a week?|день|2|день,дня,дней|qty|Сколько|`;
const KINDS = ['ns', 'gs', 'gp'];
const GP = 'Genitive plural endings: -ов / -ев (студентов, музеев), -ей after soft consonants and ж, ш, ч, щ (рублей, этажей, гостей), and no ending for most nouns in -а / -о (книг, минут, яблок), sometimes with an inserted vowel (ошибок, копеек). A few are irregular: лет, человек, друзей, братьев, сестёр.';
window.EXERCISE = {
  id: 'numbers', step1: 'Which form does the noun take?', step1Short: 'Form type', scoreLabel: 'Rules right', keepOrder1: true,
  topics: TOPICS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, k, forms, rule, cue, note] = l.split('|');
    return { t, ru, en, hint, o1: KINDS.map(x => ({ kind: x })), a1: +k, forms: forms.split(','), a2: +k, labels: LABELS, tag: '', rule, cue, note, fnote: `Needed: the ${LABELS[+k].toLowerCase()} of ${hint}. ${+k === 2 ? GP : +k === 1 ? 'Genitive singular: -а / -я for masculine and neuter (брата, рубля, окна), -ы / -и for feminine (машины, недели); after г, к, х, ж, ш, ч, щ write -и (книги, копейки).' : 'The nominative singular is the dictionary form.'}` };
  })
};
}
