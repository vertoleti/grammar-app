/* Cases. Line format: topic|sentence|English|word|case N G D A I P|six forms N,G,D,A,I,P|rule|signal|note|ending group */
{
const CASES = ['N', 'G', 'D', 'A', 'I', 'P'];
const EN = ['Nominative', 'Genitive', 'Dative', 'Accusative', 'Instrumental', 'Prepositional'];
const LABELS = ['Именительный · Nominative', 'Родительный · Genitive', 'Дательный · Dative', 'Винительный · Accusative', 'Творительный · Instrumental', 'Предложный · Prepositional'];
const ENDINGS = {
  m: 'Masculine noun ending in a consonant: стол → стола, столу, стол, столом, столе. Animate nouns (people, animals) use the genitive form in the accusative: вижу брата.',
  ms: 'Masculine noun in -ь or -й takes soft endings: словарь → словаря, словарю, словарём, словаре; музей → музея, музею, музеем, музее. Animate: accusative = genitive (учителя).',
  f: 'Feminine noun in -а: книга → книги, книге, книгу, книгой, книге. After г, к, х, ж, ш, ч, щ the genitive is -и, not -ы (книги, Маши); after ж, ш, ч, щ, ц an unstressed -ой becomes -ей (Машей).',
  fy: 'Feminine noun in -я: неделя → недели, неделе, неделю, неделей, неделе.',
  fi: 'Nouns in -ия take -ии in the genitive, dative and prepositional: станция → станции, станции, станцию, станцией, станции.',
  fs: 'Feminine noun in -ь: площадь → площади, площади, площадь, площадью, площади. The accusative is the same as the nominative.',
  n: 'Neuter noun in -о: окно → окна, окну, окно, окном, окне. The accusative is the same as the nominative.',
  ne: 'Neuter noun in -е or -ие: море → моря, морю, море, морем, море; здание → здания, зданию, здание, зданием, здании.',
  irr: 'The ten neuter nouns in -мя (время, имя, знамя…) add -ен- in every other case: времени, временем.',
  pr: 'Personal pronouns change completely from case to case. After a preposition, он, она, оно and они add н-: у него, к ней, с ними, о нём.',
  adj: 'The adjective agrees with its noun in gender, number and case. Masculine: -ый, -ого, -ому, -ый/-ого, -ым, -ом. Feminine: -ая, -ой, -ой, -ую, -ой, -ой. After г, к, х, ж, ш, ч, щ write и, not ы (русский, лучшим); after ж, ш, ч, щ, ц an unstressed о becomes е (лучшего, младшем).',
  pl: 'Plural: nominative -ы/-и/-а; dative -ам/-ям; instrumental -ами/-ями; prepositional -ах/-ях. The genitive plural varies: -ов/-ев (магазинов), -ей (друзей, соседей) or no ending at all (книг, проблем). Animate plurals of any gender use the genitive form in the accusative: люблю собак.'
};
const OPTS = {
  N: { name: 'Именительный · Nominative', use: 'the subject of the sentence (кто? что?), after это, and the thing someone has in у меня есть…' },
  G: { name: 'Родительный · Genitive', use: '“of” and possession; after нет / не было; after у, без, для, из, от, с (“from”), до, после, около, напротив; after quantities (много, стакан…)' },
  D: { name: 'Дательный · Dative', use: 'the person something is given, said or shown to; the person in impersonal phrases (мне холодно, надо, нравится, age); after к and по' },
  A: { name: 'Винительный · Accusative', use: 'the direct object of a verb; direction with в / на (куда?); time with в and через (в субботу, через неделю)' },
  I: { name: 'Творительный · Instrumental', use: '“with” (с) and the tool you use; a role after быть, стать, работать; after заниматься, интересоваться, гордиться; after над, под, перед, за, между' },
  P: { name: 'Предложный · Prepositional', use: 'location with в / на (где?) and “about” with о / об; it is only ever used after a preposition' }
};
const RULES = {
  P_loc: ['Location: в / на + prepositional', 'To say where something is or happens (где?), use в or на with the prepositional. Most places take в; open areas, events and some fixed words take на (на работе, на почте, на концерте, на площади).', 'Я живу в Берлине. Мы были на концерте.'],
  P_about: ['“About”: о / об + prepositional', 'After говорить, думать, рассказывать, мечтать, писать and similar verbs, “about” is о (об before a vowel) + prepositional.', 'Мы говорили о фильме. Он думает об отпуске.'],
  A_obj: ['The direct object takes the accusative', 'The person or thing the action is done to goes in the accusative. Feminine -а/-я → -у/-ю; masculine and neuter inanimate nouns don’t change; animate masculine nouns take the genitive form.', 'Я читаю книгу. Я вижу брата. Я вижу стол.'],
  A_dir: ['Direction: в / на + accusative', 'With verbs of motion and putting (идти, ехать, положить, поставить), в / на answer the question куда? and take the accusative. Compare location (где?) with the prepositional.', 'Я еду в Москву (куда?) vs Я живу в Москве (где?).'],
  A_time: ['Time expressions with the accusative', 'Days of the week take в + accusative (в субботу); “in / after a period of time” is через + accusative (через неделю); duration without a preposition is also accusative (всю неделю).', 'В пятницу я свободен. Он вернётся через минуту.'],
  G_neg: ['Absence: нет / не было + genitive', 'When something does not exist or is absent, it goes in the genitive after нет (now), не было (past) or не будет (future).', 'У меня нет машины. Вчера не было дождя.'],
  G_poss: ['“Of” and possession: genitive', 'The owner or the thing something belongs to follows in the genitive, after the noun it describes.', 'машина брата (my brother’s car), центр города (the city centre).'],
  G_prep: ['Prepositions that take the genitive', 'у, без, для, из, от, с (“from, off”), до, после, около, напротив, кроме, вокруг all take the genitive. у + genitive also expresses having: у меня есть.', 'из Германии, для сестры, после лекции, у Ивана.'],
  G_qty: ['Quantities and containers: genitive', 'After words of quantity (много, мало, сколько) and containers or measures (стакан, килограмм, бутылка), the noun goes in the genitive.', 'стакан воды, много книг.'],
  D_ind: ['The receiver: dative', 'The person you give, send, say, show, explain, call or help goes in the dative. Watch out: звонить and помогать take the dative even though English uses a direct object.', 'Я подарил маме цветы. Позвони брату. Помоги мне.'],
  D_imp: ['The person in impersonal phrases: dative', 'In phrases without a grammatical subject, the person who experiences something is in the dative: feelings (мне холодно), need (надо, нужно), liking (нравится), and age.', 'Анне нравится музыка. Мне двадцать лет.'],
  D_prep: ['к and по take the dative', 'к means “towards, to someone’s place”; по means “along, around, by means of” (по городу, по телефону).', 'Я иду к врачу. Мы гуляли по парку.'],
  I_with: ['“With”: с + instrumental', 'Together with someone, or food that comes with something, is с + instrumental.', 'кофе с молоком, с друзьями.'],
  I_role: ['A role or profession: instrumental', 'After работать, стать, быть (in the past and future), являться, a profession or role goes in the instrumental.', 'Он работает врачом. Она хочет стать актрисой.'],
  I_verb: ['Verbs that take the instrumental', 'заниматься, интересоваться, увлекаться, гордиться, пользоваться, руководить and a few others are followed by the instrumental without a preposition.', 'Я занимаюсь спортом. Мы гордимся сыном.'],
  I_prep: ['Location prepositions with the instrumental', 'над (above), под (under), перед (in front of), за (behind), между (between) take the instrumental when they describe where something is.', 'под столом, перед домом, между банком и почтой.'],
  I_means: ['The tool or means: instrumental', 'The thing you do something with, without a preposition, is in the instrumental.', 'писать ручкой, есть ложкой.']
};
const TOPICS = { place: 'Где? О чём? · Location and “about”', object: 'Что? Куда? · Objects and direction', gen: 'Родительный · Genitive', dat: 'Дательный · Dative', ins: 'Творительный · Instrumental', pron: 'Местоимения · Pronouns', adj: 'Прилагательные · Adjectives', plur: 'Множественное число · Plural' };
const LEVELS = { place: 'A1', object: 'A1', gen: 'A2', dat: 'A2', ins: 'A2', pron: 'A2', adj: 'B1', plur: 'B1' };
const DATA = `place|Я живу в ___.|I live in Moscow.|Москва|P|Москва,Москвы,Москве,Москву,Москвой,Москве|P_loc|живу в||f
place|Книга лежит на ___.|The book is on the table.|стол|P|стол,стола,столу,стол,столом,столе|P_loc|лежит на||m
place|Мы встретимся на ___.|We’ll meet at the station.|станция|P|станция,станции,станции,станцию,станцией,станции|P_loc|встретимся на|станция takes на: на станции, на вокзале.|fi
place|Летом они отдыхали на ___.|In summer they holidayed by the sea.|море|P|море,моря,морю,море,морем,море|P_loc|отдыхали на|на море = at the seaside.|ne
place|Мой брат учится в ___.|My brother studies at university.|университет|P|университет,университета,университету,университет,университетом,университете|P_loc|учится в|Schools and universities take в; some places take на: на работе, на почте, на концерте.|m
place|Дети играют на ___.|The children are playing in the square.|площадь|P|площадь,площади,площади,площадь,площадью,площади|P_loc|играют на||fs
place|Мы долго говорили о ___.|We talked about the trip for a long time.|поездка|P|поездка,поездки,поездке,поездку,поездкой,поездке|P_about|говорили о||f
place|Я часто думаю о ___.|I often think about my mother.|мама|P|мама,мамы,маме,маму,мамой,маме|P_about|думаю о||f
place|Она работает в ___.|She works in a museum.|музей|P|музей,музея,музею,музей,музеем,музее|P_loc|работает в||ms
place|Вы были в ___?|Have you been to the Hermitage?|Эрмитаж|P|Эрмитаж,Эрмитажа,Эрмитажу,Эрмитаж,Эрмитажем,Эрмитаже|P_loc|были в|Having been somewhere answers где?, so the prepositional, even though English says “been to”.|m
place|Мы гуляли в ___.|We went for a walk in the forest.|лес|P|лес,леса,лесу,лес,лесом,лесу|P_loc|гуляли в|A few masculine nouns take a stressed -у for location after в / на: в лесу, в саду, на мосту, в аэропорту.|m
place|Мы были на ___ вчера вечером.|We were at a concert last night.|концерт|P|концерт,концерта,концерту,концерт,концертом,концерте|P_loc|были на|Events take на: на концерте, на уроке, на выставке.|m
place|Ключи лежат в ___.|The keys are in the bag.|сумка|P|сумка,сумки,сумке,сумку,сумкой,сумке|P_loc|лежат в||f
place|Она мечтает о ___.|She dreams of having a dog.|собака|P|собака,собаки,собаке,собаку,собакой,собаке|P_about|мечтает о||f
place|Мы остановились в ___ у моря.|We stayed in a hotel by the sea.|гостиница|P|гостиница,гостиницы,гостинице,гостиницу,гостиницей,гостинице|P_loc|остановились в|After ц an unstressed instrumental ending is -ей: гостиницей.|f
place|Он рассказал нам об ___.|He told us about the accident.|авария|P|авария,аварии,аварии,аварию,аварией,аварии|P_about|рассказал нам об|об is used before a vowel: об аварии, об отпуске.|fi
place|Сейчас папа на ___.|Dad is at work right now.|работа|P|работа,работы,работе,работу,работой,работе|P_loc|папа на|работа takes на: на работе.|f
object|Я читаю ___.|I’m reading a book.|книга|A|книга,книги,книге,книгу,книгой,книге|A_obj|читаю||f
object|Ты видишь ___?|Can you see Ivan?|Иван|A|Иван,Ивана,Ивану,Ивана,Иваном,Иване|A_obj|видишь|Иван is animate, so the accusative looks like the genitive.|m
object|Я очень люблю ___.|I really love music.|музыка|A|музыка,музыки,музыке,музыку,музыкой,музыке|A_obj|люблю||f
object|Мы ждём ___.|We’re waiting for the bus.|автобус|A|автобус,автобуса,автобусу,автобус,автобусом,автобусе|A_obj|ждём|ждать takes the accusative for a specific person or thing (ждём автобус, ждём маму).|m
object|Она купила новую ___.|She bought a new shirt.|рубашка|A|рубашка,рубашки,рубашке,рубашку,рубашкой,рубашке|A_obj|купила новую|The adjective новую already shows the feminine accusative.|f
object|Мы едем в ___.|We’re going to St Petersburg.|Петербург|A|Петербург,Петербурга,Петербургу,Петербург,Петербургом,Петербурге|A_dir|едем в|Direction (куда?) → accusative; location (где?) → prepositional: еду в Петербург, живу в Петербурге.|m
object|Положи ключи на ___.|Put the keys on the shelf.|полка|A|полка,полки,полке,полку,полкой,полке|A_dir|Положи ключи на|Putting something somewhere answers куда?|f
object|Мы поедем на дачу в ___.|We’ll go to the dacha on Saturday.|суббота|A|суббота,субботы,субботе,субботу,субботой,субботе|A_time|||f
object|Он позвонил через ___.|He called a week later.|неделя|A|неделя,недели,неделе,неделю,неделей,неделе|A_time|через||fy
object|Я давно знаю ___.|I’ve known Olga for a long time.|Ольга|A|Ольга,Ольги,Ольге,Ольгу,Ольгой,Ольге|A_obj|знаю||f
object|Он смотрит ___.|He’s watching a film.|фильм|A|фильм,фильма,фильму,фильм,фильмом,фильме|A_obj|смотрит||m
object|Мама зовёт ___.|Mum is calling the dog.|собака|A|собака,собаки,собаке,собаку,собакой,собаке|A_obj|зовёт||f
object|Я встретил ___ в магазине.|I ran into my teacher in the shop.|учительница|A|учительница,учительницы,учительнице,учительницу,учительницей,учительнице|A_obj|встретил||f
object|Он каждый день пьёт ___.|He drinks juice every day.|сок|A|сок,сока,соку,сок,соком,соке|A_obj|пьёт|Inanimate masculine nouns don’t change in the accusative.|m
object|Мы идём на ___.|We’re going to the lesson.|урок|A|урок,урока,уроку,урок,уроком,уроке|A_dir|идём на||m
object|Повесь пальто на ___.|Hang your coat on the hook.|крючок|A|крючок,крючка,крючку,крючок,крючком,крючке|A_dir|Повесь пальто на|крючок loses its о in the other forms.|m
object|Мы будем в Москве через ___.|We’ll be in Moscow in an hour.|час|A|час,часа,часу,час,часом,часе|A_time|через||m
object|Ты помнишь ___?|Do you remember Natasha?|Наташа|A|Наташа,Наташи,Наташе,Наташу,Наташей,Наташе|A_obj|помнишь||f
gen|У меня нет ___.|I don’t have time.|время|G|время,времени,времени,время,временем,времени|G_neg|нет||irr
gen|Это машина ___.|This is my brother’s car.|брат|G|брат,брата,брату,брата,братом,брате|G_poss|машина||m
gen|Я пью кофе без ___.|I drink coffee without milk.|молоко|G|молоко,молока,молоку,молоко,молоком,молоке|G_prep|без||n
gen|Этот подарок для ___.|This present is for my sister.|сестра|G|сестра,сестры,сестре,сестру,сестрой,сестре|G_prep|для||f
gen|Она приехала из ___.|She came from Germany.|Германия|G|Германия,Германии,Германии,Германию,Германией,Германии|G_prep|приехала из||fi
gen|У ___ есть собака.|Ivan has a dog.|Иван|G|Иван,Ивана,Ивану,Ивана,Иваном,Иване|G_prep||у + genitive + есть is how Russian says “to have”.|m
gen|В этом году не было ___.|There was no snow this year.|снег|G|снег,снега,снегу,снег,снегом,снеге|G_neg|не было||m
gen|Мы ждали до ___.|We waited until evening.|вечер|G|вечер,вечера,вечеру,вечер,вечером,вечере|G_prep|до||m
gen|Я получил письмо от ___.|I got a letter from a friend.|друг|G|друг,друга,другу,друга,другом,друге|G_prep|от|от is used for people, из for places.|m
gen|Магазин находится напротив ___.|The shop is opposite the church.|церковь|G|церковь,церкви,церкви,церковь,церковью,церкви|G_prep|напротив|церковь loses its о in all other cases.|fs
gen|После ___ мы пошли в кафе.|After the lecture we went to a café.|лекция|G|лекция,лекции,лекции,лекцию,лекцией,лекции|G_prep|После||fi
gen|Дайте, пожалуйста, стакан ___.|A glass of water, please.|вода|G|вода,воды,воде,воду,водой,воде|G_qty|стакан||f
gen|Я вернусь до ___.|I’ll be back before dinner.|ужин|G|ужин,ужина,ужину,ужин,ужином,ужине|G_prep|до||m
gen|У ___ болит голова.|Mum has a headache.|мама|G|мама,мамы,маме,маму,мамой,маме|G_prep|болит голова|у + genitive says whose head hurts.|f
gen|На столе нет ___.|There’s no salt on the table.|соль|G|соль,соли,соли,соль,солью,соли|G_neg|нет||fs
gen|Это кабинет ___.|This is the director’s office.|директор|G|директор,директора,директору,директора,директором,директоре|G_poss|кабинет||m
gen|Мы живём около ___.|We live near the park.|парк|G|парк,парка,парку,парк,парком,парке|G_prep|около||m
gen|Я только что приехал с ___.|I’ve just come back from the dacha.|дача|G|дача,дачи,даче,дачу,дачей,даче|G_prep|приехал с|с + genitive means “from” for places that take на: на дачу → с дачи.|f
dat|Я подарил ___ цветы.|I gave my mum flowers.|мама|D|мама,мамы,маме,маму,мамой,маме|D_ind|подарил||f
dat|Позвони ___!|Call your brother!|брат|D|брат,брата,брату,брата,братом,брате|D_ind|Позвони|звонить takes the dative: позвони брату, literally “ring to your brother”.|m
dat|___ нравится эта песня.|Anna likes this song.|Анна|D|Анна,Анны,Анне,Анну,Анной,Анне|D_imp|нравится|With нравиться, the person who likes is in the dative and the thing liked is the subject.|f
dat|Сколько лет твоему ___?|How old is your father?|отец|D|отец,отца,отцу,отца,отцом,отце|D_imp|Сколько лет|отец loses its е in every other form (a fleeting vowel).|m
dat|Мы идём к ___.|We’re going to the doctor’s.|врач|D|врач,врача,врачу,врача,врачом,враче|D_prep|идём к|к + dative means “to someone’s place”.|m
dat|Он гуляет по ___.|He’s strolling around town.|город|D|город,города,городу,город,городом,городе|D_prep|гуляет по||m
dat|___ холодно, закрой окно.|Grandma is cold, close the window.|бабушка|D|бабушка,бабушки,бабушке,бабушку,бабушкой,бабушке|D_imp|холодно||f
dat|Мне нужно помочь ___.|I need to help a colleague.|коллега|D|коллега,коллеги,коллеге,коллегу,коллегой,коллеге|D_ind|помочь|помогать / помочь take the dative. коллега declines like a feminine noun in -а, even for a man.|f
dat|Учитель объяснил ___ правило.|The teacher explained the rule to the student.|студент|D|студент,студента,студенту,студента,студентом,студенте|D_ind|объяснил||m
dat|Мы готовимся к ___.|We’re preparing for the exam.|экзамен|D|экзамен,экзамена,экзамену,экзамен,экзаменом,экзамене|D_prep|готовимся к||m
dat|___ надо больше спать.|Sergey needs to sleep more.|Сергей|D|Сергей,Сергея,Сергею,Сергея,Сергеем,Сергее|D_imp|надо||ms
dat|Я написал ___ письмо.|I wrote a letter to my grandfather.|дедушка|D|дедушка,дедушки,дедушке,дедушку,дедушкой,дедушке|D_ind|написал|дедушка is masculine but declines like a feminine noun in -а.|f
dat|Покажи ___ фотографии.|Show your friend the photos.|подруга|D|подруга,подруги,подруге,подругу,подругой,подруге|D_ind|Покажи||f
dat|___ тридцать лет.|Ivan is thirty.|Иван|D|Иван,Ивана,Ивану,Ивана,Иваном,Иване|D_imp|тридцать лет||m
dat|Мы долго шли по ___.|We walked along the road for a long time.|дорога|D|дорога,дороги,дороге,дорогу,дорогой,дороге|D_prep|шли по||f
dat|На выходные я поеду к ___.|At the weekend I’ll go and see my sister.|сестра|D|сестра,сестры,сестре,сестру,сестрой,сестре|D_prep|поеду к||f
dat|___ скучно на уроке.|Petya is bored in class.|Петя|D|Петя,Пети,Пете,Петю,Петей,Пете|D_imp|скучно|Петя is masculine but declines like a feminine noun in -я.|fy
ins|Я пью чай с ___.|I drink tea with lemon.|лимон|I|лимон,лимона,лимону,лимон,лимоном,лимоне|I_with|чай с||m
ins|Мой отец работает ___.|My father works as an engineer.|инженер|I|инженер,инженера,инженеру,инженера,инженером,инженере|I_role|работает||m
ins|Она занимается ___.|She does sport.|спорт|I|спорт,спорта,спорту,спорт,спортом,спорте|I_verb|занимается||m
ins|Кошка спит под ___.|The cat is sleeping under the bed.|кровать|I|кровать,кровати,кровати,кровать,кроватью,кровати|I_prep|под||fs
ins|В детстве он хотел стать ___.|As a child he wanted to become a pilot.|пилот|I|пилот,пилота,пилоту,пилота,пилотом,пилоте|I_role|стать||m
ins|Мы ходили в кино с ___.|We went to the cinema with Masha.|Маша|I|Маша,Маши,Маше,Машу,Машей,Маше|I_with|с|After ж, ш, ч, щ, ц an unstressed instrumental ending is -ей, not -ой.|f
ins|Я интересуюсь ___.|I’m interested in history.|история|I|история,истории,истории,историю,историей,истории|I_verb|интересуюсь||fi
ins|Пиши ___, а не карандашом.|Write in pen, not in pencil.|ручка|I|ручка,ручки,ручке,ручку,ручкой,ручке|I_means|карандашом||f
ins|Машина стоит перед ___.|The car is parked in front of the house.|дом|I|дом,дома,дому,дом,домом,доме|I_prep|перед||m
ins|Между ___ и почтой есть аптека.|There’s a pharmacy between the bank and the post office.|банк|I|банк,банка,банку,банк,банком,банке|I_prep|Между||m
ins|Мы гордимся ___.|We’re proud of our son.|сын|I|сын,сына,сыну,сына,сыном,сыне|I_verb|гордимся||m
ins|В молодости он был ___.|In his youth he was a teacher.|учитель|I|учитель,учителя,учителю,учителя,учителем,учителе|I_role|был|After быть in the past or future, a profession or role usually takes the instrumental.|ms
ins|Он стал ___.|He became a doctor.|врач|I|врач,врача,врачу,врача,врачом,враче|I_role|стал|After ч, a stressed instrumental ending is -ом: врачом.|m
ins|Я режу хлеб ___.|I cut the bread with a knife.|нож|I|нож,ножа,ножу,нож,ножом,ноже|I_means|режу||m
ins|Над ___ висит лампа.|A lamp hangs above the table.|стол|I|стол,стола,столу,стол,столом,столе|I_prep|Над||m
ins|Она увлекается ___.|She’s into photography.|фотография|I|фотография,фотографии,фотографии,фотографию,фотографией,фотографии|I_verb|увлекается||fi
ins|Мы встретились с ___ у входа.|We met up with Sergey at the entrance.|Сергей|I|Сергей,Сергея,Сергею,Сергея,Сергеем,Сергее|I_with|встретились с||ms
ins|Кошка спряталась за ___.|The cat hid behind the sofa.|диван|I|диван,дивана,дивану,диван,диваном,диване|I_prep|за|за + instrumental is “behind” (where); за + accusative is “behind” (where to).|m
pron|Можно ___ спросить?|May I ask you something?|вы|A|вы,вас,вам,вас,вами,вас|A_obj|спросить||pr
pron|Позвони ___ завтра.|Call me tomorrow.|я|D|я,меня,мне,меня,мной,мне|D_ind|Позвони||pr
pron|Я иду к ___.|I’m going to his place.|он|D|он,него,нему,него,ним,нём|D_prep|иду к|After a preposition, он takes an н-: к нему, у него, с ним.|pr
pron|У ___ есть машина?|Does she have a car?|она|G|она,неё,ней,неё,ней,ней|G_prep||After a preposition it is у неё, never у её.|pr
pron|Мы часто думаем о ___.|We often think about you.|ты|P|ты,тебя,тебе,тебя,тобой,тебе|P_about|думаем о||pr
pron|Я давно ___ не видел.|I haven’t seen them for ages.|они|A|они,их,им,их,ими,них|A_obj|не видел|Without a preposition there is no н-: их.|pr
pron|Пойдёшь с ___ в кино?|Will you come to the cinema with us?|мы|I|мы,нас,нам,нас,нами,нас|I_with|с||pr
pron|Скажи ___, что я опоздаю.|Tell him I’ll be late.|он|D|он,его,ему,его,им,нём|D_ind|Скажи|No preposition, so no н-: ему.|pr
pron|Я не могу жить без ___.|I can’t live without you.|ты|G|ты,тебя,тебе,тебя,тобой,тебе|G_prep|без||pr
pron|Родители гордятся ___.|The parents are proud of them.|они|I|они,их,им,их,ими,них|I_verb|гордятся||pr
pron|Я пойду в кино без ___.|I’ll go to the cinema without him.|он|G|он,него,нему,него,ним,нём|G_prep|без||pr
pron|Это подарок для ___.|This present is for you.|вы|G|вы,вас,вам,вас,вами,вас|G_prep|для||pr
pron|Мне нравится с ___ разговаривать.|I like talking to her.|она|I|она,неё,ней,неё,ней,ней|I_with|с||pr
pron|Помоги ___, пожалуйста!|Help us, please!|мы|D|мы,нас,нам,нас,нами,нас|D_ind|Помоги||pr
pron|Я часто вспоминаю о ___.|I often think back to them.|они|P|они,них,ним,них,ними,них|P_about|вспоминаю о||pr
pron|Он посмотрел на ___ и улыбнулся.|He looked at me and smiled.|я|A|я,меня,мне,меня,мной,мне|A_dir|посмотрел на|смотреть на + accusative = to look at.|pr
adj|Мы живём в ___.|We live in a new house.|новый дом|P|новый дом,нового дома,новому дому,новый дом,новым домом,новом доме|P_loc|живём в||adj
adj|Я купил ___.|I bought a red car.|красная машина|A|красная машина,красной машины,красной машине,красную машину,красной машиной,красной машине|A_obj|купил||adj
adj|Мы говорили о ___.|We talked about the Russian language.|русский язык|P|русский язык,русского языка,русскому языку,русский язык,русским языком,русском языке|P_about|говорили о||adj
adj|У меня нет ___ для поездки.|I don’t have a big suitcase for the trip.|большой чемодан|G|большой чемодан,большого чемодана,большому чемодану,большой чемодан,большим чемоданом,большом чемодане|G_neg|нет|большой has stressed endings: -ой, -ого, -ому.|adj
adj|Я познакомился с ___.|I met an interesting woman.|интересная женщина|I|интересная женщина,интересной женщины,интересной женщине,интересную женщину,интересной женщиной,интересной женщине|I_with|познакомился с||adj
adj|Подари это ___.|Give this to your younger brother.|младший брат|D|младший брат,младшего брата,младшему брату,младшего брата,младшим братом,младшем брате|D_ind|Подари||adj
adj|Я вижу ___.|I can see the old church.|старая церковь|A|старая церковь,старой церкви,старой церкви,старую церковь,старой церковью,старой церкви|A_obj|вижу|церковь is feminine in -ь, so its accusative doesn’t change, but the adjective still does: старую.|adj
adj|Он гордится ___.|He’s proud of his new job.|новая работа|I|новая работа,новой работы,новой работе,новую работу,новой работой,новой работе|I_verb|гордится||adj
adj|Летом в ___ много туристов.|In summer there are lots of tourists in the old town.|старый город|P|старый город,старого города,старому городу,старый город,старым городом,старом городе|P_loc|||adj
adj|Я жду ___.|I’m waiting for my best friend.|лучший друг|A|лучший друг,лучшего друга,лучшему другу,лучшего друга,лучшим другом,лучшем друге|A_obj|жду|друг is animate, so the accusative looks like the genitive.|adj
adj|Мы говорили с ___.|We talked to the new teacher.|новый учитель|I|новый учитель,нового учителя,новому учителю,нового учителя,новым учителем,новом учителе|I_with|говорили с||adj
adj|Я дал ___ книгу.|I gave the little girl a book.|маленькая девочка|D|маленькая девочка,маленькой девочки,маленькой девочке,маленькую девочку,маленькой девочкой,маленькой девочке|D_ind|дал||adj
adj|Они живут в ___.|They live in a big city.|большой город|P|большой город,большого города,большому городу,большой город,большим городом,большом городе|P_loc|живут в||adj
adj|Я не люблю ___.|I don’t like cold weather.|холодная погода|A|холодная погода,холодной погоды,холодной погоде,холодную погоду,холодной погодой,холодной погоде|A_obj|не люблю||adj
adj|Окна выходят на ___.|The windows look out onto the main street.|главная улица|A|главная улица,главной улицы,главной улице,главную улицу,главной улицей,главной улице|A_dir|выходят на||adj
adj|Мы пили чай со ___.|We drank tea with fresh bread.|свежий хлеб|I|свежий хлеб,свежего хлеба,свежему хлебу,свежий хлеб,свежим хлебом,свежем хлебе|I_with|чай со|с becomes со before some consonant clusters: со свежим хлебом.|adj
plur|На полке много ___.|There are a lot of books on the shelf.|книги|G|книги,книг,книгам,книги,книгами,книгах|G_qty|много||pl
plur|Я часто пишу ___.|I often write to my friends.|друзья|D|друзья,друзей,друзьям,друзей,друзьями,друзьях|D_ind|пишу|друг has an irregular plural: друзья, друзей, друзьям.|pl
plur|Он рассказывал о ___.|He was telling us about his travels.|путешествия|P|путешествия,путешествий,путешествиям,путешествия,путешествиями,путешествиях|P_about|рассказывал о||pl
plur|В ___ много людей.|There are a lot of people in the shops.|магазины|P|магазины,магазинов,магазинам,магазины,магазинами,магазинах|P_loc|||pl
plur|Она дружит с ___.|She’s friends with the neighbours.|соседи|I|соседи,соседей,соседям,соседей,соседями,соседях|I_with|дружит с||pl
plur|Я люблю ___.|I love dogs.|собаки|A|собаки,собак,собакам,собак,собаками,собаках|A_obj|люблю|Animate plurals of any gender use the genitive form in the accusative: люблю собак.|pl
plur|У нас нет ___.|We don’t have any problems.|проблемы|G|проблемы,проблем,проблемам,проблемы,проблемами,проблемах|G_neg|нет||pl
plur|Я купил подарки для ___.|I bought presents for the children.|дети|G|дети,детей,детям,детей,детьми,детях|G_prep|для|дети is irregular: детей, детям, детьми.|pl
plur|Он часто говорит о ___.|He often talks about his parents.|родители|P|родители,родителей,родителям,родителей,родителями,родителях|P_about|говорит о||pl
plur|В парке много ___.|There are a lot of trees in the park.|деревья|G|деревья,деревьев,деревьям,деревья,деревьями,деревьях|G_qty|много||pl
plur|Мы гуляли по ___.|We walked around the streets.|улицы|D|улицы,улиц,улицам,улицы,улицами,улицах|D_prep|гуляли по||pl
plur|Я познакомился со ___ из Испании.|I met some students from Spain.|студенты|I|студенты,студентов,студентам,студентов,студентами,студентах|I_with|познакомился со|со before с + consonant: со студентами.|pl
plur|Он подарил ___ цветы.|He gave his colleagues flowers.|коллеги|D|коллеги,коллег,коллегам,коллег,коллегами,коллегах|D_ind|подарил||pl`;
window.EXERCISE = {
  id: 'cases', step1: 'Which case?', step1Short: 'Case', scoreLabel: 'Cases right', keepOrder1: true,
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, c, forms, rule, cue, note, grp] = l.split('|');
    const ci = CASES.indexOf(c);
    return { t, ru, en, hint, o1: CASES.map(k => ({ kind: k })), a1: ci, forms: forms.split(','), a2: ci, labels: LABELS, tag: '', rule, cue, note, fnote: `Needed: the ${EN[ci].toLowerCase()} (${LABELS[ci].split(' · ')[0].toLowerCase()} падеж) of ${hint}. ${ENDINGS[grp]}` };
  })
};
}
