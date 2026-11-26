/* Government. Line format: topic|sentence|English|word|case N G D A I P|six forms N,G,D,A,I,P|rule|signal|note */
{
const CASES = ['N', 'G', 'D', 'A', 'I', 'P'];
const EN = ['Nominative', 'Genitive', 'Dative', 'Accusative', 'Instrumental', 'Prepositional'];
const LABELS = ['Именительный · Nominative', 'Родительный · Genitive', 'Дательный · Dative', 'Винительный · Accusative', 'Творительный · Instrumental', 'Предложный · Prepositional'];
const OPTS = {
  N: { name: 'Именительный · Nominative', use: 'the subject of the sentence; no verb or preposition governs it' },
  G: { name: 'Родительный · Genitive', use: 'after verbs of fearing, avoiding, achieving, demanding (бояться, избегать, достигать, требовать) and after most formal prepositions (в течение, вследствие, в отличие от, во избежание)' },
  D: { name: 'Дательный · Dative', use: 'after verbs of feeling or acting towards someone (завидовать, мешать, способствовать, соответствовать) and after благодаря, согласно, вопреки, в ущерб' },
  A: { name: 'Винительный · Accusative', use: 'a direct object, and after на / в with a sense of direction: влиять на, ссылаться на, невзирая на' },
  I: { name: 'Творительный · Instrumental', use: 'after verbs of control, use and attitude (руководить, пользоваться, гордиться, владеть) and after с in в связи с, по сравнению с, наряду с' },
  P: { name: 'Предложный · Prepositional', use: 'only after a preposition: в or на without a sense of direction (участвовать в, сомневаться в, настаивать на), о' }
};
const RULES = {
  gen_verb: ['Verbs that take the genitive', 'A group of verbs takes the genitive with no preposition: fearing and avoiding (бояться, опасаться, избегать, стесняться), reaching and achieving (достигать, добиваться), demanding and wanting something abstract (требовать, желать, заслуживать), depriving (лишать кого чего), concerning (касаться). Learn them as phrases: бояться темноты, достичь цели, требовать внимания.', 'Он добился успеха.'],
  dat_verb: ['Verbs that take the dative', 'The dative marks the person or thing an attitude or action is directed at: завидовать, сочувствовать, удивляться, радоваться (to feel towards); мешать, препятствовать, способствовать (to hinder or help); соответствовать (to match); учить кого чему (to teach someone something), учиться чему.', 'Шум мешает соседям.'],
  ins_verb: ['Verbs that take the instrumental', 'Verbs of control and possession (руководить, управлять, владеть, командовать), use (пользоваться, злоупотреблять), attitude (гордиться, восхищаться, интересоваться, увлекаться) and risk or sacrifice (рисковать, жертвовать, пренебрегать) take the instrumental with no preposition.', 'Она руководит отделом.'],
  pv_G: ['Verb + от / из / у + genitive', 'Some verbs always come with a preposition, and the preposition decides the case: зависеть от, отказаться от, отличаться от, состоять из all take the genitive.', 'Всё зависит от погоды.'],
  pv_A: ['Verb + на / в + accusative', 'Verbs where на or в suggests direction towards something take the accusative: влиять на, ссылаться на, надеяться на, жаловаться на, рассчитывать на, верить в.', 'Это повлияло на решение.'],
  pv_P: ['Verb + в / на + prepositional', 'Verbs where в or на means “in” or “on” with no movement take the prepositional: участвовать в, сомневаться в, нуждаться в, убедиться в, настаивать на, жениться на.', 'Я сомневаюсь в его честности.'],
  pv_D: ['Verb + к + dative', 'К always takes the dative: обращаться к, привыкать к, относиться к, готовиться к.', 'Он обратился к юристу.'],
  formal_D: ['Formal prepositions with the dative', 'Благодаря (thanks to), согласно (according to) and вопреки (contrary to) take the dative. In careful writing согласно + genitive is a mistake: согласно договору, not договора.', 'Согласно договору, оплата ежемесячная.'],
  formal_G: ['Formal prepositions with the genitive', 'Most prepositions made from nouns take the genitive: в течение, в отличие от, вследствие, в результате, в случае, в целях, путём, по мере, в ходе.', 'В течение недели.'],
  formal_I: ['Formal prepositions with с + instrumental', 'When a formal preposition ends in с, the case is the instrumental: в связи с, по сравнению с, наряду с, в соответствии с.', 'В связи с ремонтом.'],
  book_G: ['Bookish prepositions with the genitive', 'Official and bookish prepositions built from a noun in -ии or -е take the genitive: во избежание, по истечении, по окончании, в преддверии, в силу.', 'Во избежание недоразумений.'],
  book_D: ['Bookish prepositions with the dative', 'В ущерб (to the detriment of) and в угоду (to please) take the dative, like the nouns ущерб and угода would: в ущерб качеству, в угоду публике.', 'В ущерб качеству.'],
  book_A: ['Невзирая на / несмотря на + accusative', 'Несмотря на and its bookish twin невзирая на take the accusative: невзирая на трудности.', 'Невзирая на трудности, они продолжали.']
};
const TOPICS = {
  gen: 'Глаголы + Р. п. · Verbs with the genitive',
  dat: 'Глаголы + Д. п. · Verbs with the dative',
  ins: 'Глаголы + Т. п. · Verbs with the instrumental',
  prepv: 'Глаголы с предлогами · Verbs with prepositions',
  formal: 'Отымённые предлоги · Formal prepositions',
  book: 'Книжные предлоги · Bookish prepositions'
};
const LEVELS = { gen: 'B2', dat: 'B2', ins: 'B2', prepv: 'C1', formal: 'C1', book: 'C2' };
const DATA = `gen|Ребёнок боится ___.|The child is afraid of the dark.|темнота|G|темнота,темноты,темноте,темноту,темнотой,темноте|gen_verb|боится|
gen|Мы наконец достигли ___.|We finally reached our goal.|цель|G|цель,цели,цели,цель,целью,цели|gen_verb|достигли|
gen|Она старается избегать ___.|She tries to avoid conflicts.|конфликты|G|конфликты,конфликтов,конфликтам,конфликты,конфликтами,конфликтах|gen_verb|избегать|Plural: избегать конфликтов.
gen|Это не касается ___.|This doesn't concern your work.|ваша работа|G|ваша работа,вашей работы,вашей работе,вашу работу,вашей работой,вашей работе|gen_verb|касается|The adjective changes too: вашей работы.
gen|Его лишили ___ голоса.|He was deprived of the right to vote.|право|G|право,права,праву,право,правом,праве|gen_verb|лишили|Лишать кого (accusative) чего (genitive).
gen|Новый проект требует ___.|The new project demands attention.|внимание|G|внимание,внимания,вниманию,внимание,вниманием,внимании|gen_verb|требует|
gen|За два года она добилась ___.|In two years she achieved success.|успех|G|успех,успеха,успеху,успех,успехом,успехе|gen_verb|добилась|
dat|Я немного завидую ___.|I envy my brother a little.|брат|D|брат,брата,брату,брата,братом,брате|dat_verb|завидую|
dat|Все удивились ___.|Everyone was surprised at the news.|известие|D|известие,известия,известию,известие,известием,известии|dat_verb|удивились|
dat|Громкая музыка мешает ___.|Loud music disturbs the neighbours.|соседи|D|соседи,соседей,соседям,соседей,соседями,соседях|dat_verb|мешает|
dat|Низкие налоги способствуют ___ бизнеса.|Low taxes promote business growth.|рост|D|рост,роста,росту,рост,ростом,росте|dat_verb|способствуют|
dat|Мы глубоко сочувствуем ___.|We deeply sympathise with the victims.|пострадавшие|D|пострадавшие,пострадавших,пострадавшим,пострадавших,пострадавшими,пострадавших|dat_verb|сочувствуем|An adjective used as a noun keeps adjective endings: пострадавшим.
dat|Результаты не соответствуют ___.|The results do not match the expectations.|ожидания|D|ожидания,ожиданий,ожиданиям,ожидания,ожиданиями,ожиданиях|dat_verb|соответствуют|
dat|Она учит детей ___.|She teaches children music.|музыка|D|музыка,музыки,музыке,музыку,музыкой,музыке|dat_verb|учит детей|Учить кого (accusative) чему (dative).
ins|Он уже пять лет руководит ___.|He has headed the department for five years.|отдел|I|отдел,отдела,отделу,отдел,отделом,отделе|ins_verb|руководит|
ins|Родители гордятся ___.|The parents are proud of their son.|сын|I|сын,сына,сыну,сына,сыном,сыне|ins_verb|гордятся|
ins|Вы часто пользуетесь общественным ___?|Do you often use public transport?|транспорт|I|транспорт,транспорта,транспорту,транспорт,транспортом,транспорте|ins_verb|пользуетесь|
ins|Она свободно владеет тремя ___.|She speaks three languages fluently.|языки|I|языки,языков,языкам,языки,языками,языках|ins_verb|владеет|After тремя the noun is instrumental plural.
ins|Не стоит злоупотреблять ___ друзей.|You shouldn't abuse your friends' trust.|доверие|I|доверие,доверия,доверию,доверие,доверием,доверии|ins_verb|злоупотреблять|
ins|Все восхищались её ___.|Everyone admired her talent.|талант|I|талант,таланта,таланту,талант,талантом,таланте|ins_verb|восхищались|
ins|Спасатель рисковал своей ___.|The rescuer risked his life.|жизнь|I|жизнь,жизни,жизни,жизнь,жизнью,жизни|ins_verb|рисковал|
prepv|Всё зависит от ___.|Everything depends on the weather.|погода|G|погода,погоды,погоде,погоду,погодой,погоде|pv_G|зависит от|
prepv|Это повлияло на ___ суда.|This influenced the court's decision.|решение|A|решение,решения,решению,решение,решением,решении|pv_A|повлияло на|
prepv|Он вежливо отказался от ___.|He politely turned down the offer.|предложение|G|предложение,предложения,предложению,предложение,предложением,предложении|pv_G|отказался от|
prepv|Наша компания участвовала в ___.|Our company took part in the conference.|конференция|P|конференция,конференции,конференции,конференцию,конференцией,конференции|pv_P|участвовала в|
prepv|Она настаивает на ___ с директором.|She insists on a meeting with the director.|встреча|P|встреча,встречи,встрече,встречу,встречей,встрече|pv_P|настаивает на|
prepv|Я сомневаюсь в его ___.|I doubt his honesty.|честность|P|честность,честности,честности,честность,честностью,честности|pv_P|сомневаюсь в|
prepv|Автор ссылается на ___.|The author refers to the sources.|источники|A|источники,источников,источникам,источники,источниками,источниках|pv_A|ссылается на|
prepv|Он обратился к ___.|He turned to a lawyer.|юрист|D|юрист,юриста,юристу,юриста,юристом,юристе|pv_D|обратился к|
formal|Благодаря вашей ___ мы всё успели.|Thanks to your help we managed everything.|помощь|D|помощь,помощи,помощи,помощь,помощью,помощи|formal_D|Благодаря|
formal|Согласно ___, оплата производится ежемесячно.|According to the contract, payment is monthly.|договор|D|договор,договора,договору,договор,договором,договоре|formal_D|Согласно|Not согласно договора: that is a common mistake.
formal|Ответ придёт в течение ___.|The answer will come within a week.|неделя|G|неделя,недели,неделе,неделю,неделей,неделе|formal_G|в течение|
formal|Вопреки ___ врачей, он поехал в горы.|Against the doctors' advice, he went to the mountains.|советы|D|советы,советов,советам,советы,советами,советах|formal_D|Вопреки|
formal|По сравнению с прошлым ___, цены выросли.|Compared with last year, prices have risen.|год|I|год,года,году,год,годом,годе|formal_I|По сравнению с|
formal|В связи с ___ музей закрыт.|The museum is closed because of the repairs.|ремонт|I|ремонт,ремонта,ремонту,ремонт,ремонтом,ремонте|formal_I|В связи с|
formal|В отличие от своей ___, она любит шум.|Unlike her sister, she likes noise.|сестра|G|сестра,сестры,сестре,сестру,сестрой,сестре|formal_G|В отличие от|
formal|Вследствие ___ движение было перекрыто.|As a result of the accident, traffic was blocked.|авария|G|авария,аварии,аварии,аварию,аварией,аварии|formal_G|Вследствие|
formal|Наряду с другими ___ это важно.|Along with other factors, this matters.|факторы|I|факторы,факторов,факторам,факторы,факторами,факторах|formal_I|Наряду с|
book|Во избежание ___ уточните адрес.|To avoid misunderstandings, check the address.|недоразумения|G|недоразумения,недоразумений,недоразумениям,недоразумения,недоразумениями,недоразумениях|book_G|Во избежание|
book|По истечении ___ договор прекращается.|When the term expires, the contract ends.|срок|G|срок,срока,сроку,срок,сроком,сроке|book_G|По истечении|
book|В силу ___ встреча переносится.|Owing to circumstances, the meeting is postponed.|обстоятельства|G|обстоятельства,обстоятельств,обстоятельствам,обстоятельства,обстоятельствами,обстоятельствах|book_G|В силу|
book|Нельзя работать быстро в ущерб ___.|You can't work fast at the expense of quality.|качество|D|качество,качества,качеству,качество,качеством,качестве|book_D|в ущерб|
book|Режиссёр изменил финал в угоду ___.|The director changed the ending to please the public.|публика|D|публика,публики,публике,публику,публикой,публике|book_D|в угоду|
book|В преддверии ___ магазины работают дольше.|In the run-up to the holidays, shops stay open longer.|праздники|G|праздники,праздников,праздникам,праздники,праздниками,праздниках|book_G|В преддверии|
book|Невзирая на ___, они продолжали работу.|Regardless of the difficulties, they kept working.|трудности|A|трудности,трудностей,трудностям,трудности,трудностями,трудностях|book_A|Невзирая на|
book|По окончании ___ он вернулся домой.|On finishing his studies, he returned home.|учёба|G|учёба,учёбы,учёбе,учёбу,учёбой,учёбе|book_G|По окончании|Окончании is itself prepositional after по; the noun after it is genitive.`;
window.EXERCISE = {
  id: 'gov', step1: 'Which case?', step1Short: 'Case', scoreLabel: 'Cases right', keepOrder1: true,
  topics: TOPICS, levels: LEVELS, opts: OPTS, rules: RULES,
  items: DATA.split('\n').map(l => {
    const [t, ru, en, hint, c, forms, rule, cue, note] = l.split('|');
    const ci = CASES.indexOf(c);
    return { t, ru, en, hint, o1: CASES.map(k => ({ kind: k })), a1: ci, forms: forms.split(','), a2: ci, labels: LABELS, tag: '', rule, cue, note, fnote: `Needed: the ${EN[ci].toLowerCase()} (${LABELS[ci].split(' · ')[0].toLowerCase()} падеж) of ${hint}.` };
  })
};
}
