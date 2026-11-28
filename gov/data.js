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
book|По окончании ___ он вернулся домой.|On finishing his studies, he returned home.|учёба|G|учёба,учёбы,учёбе,учёбу,учёбой,учёбе|book_G|По окончании|Окончании is itself prepositional after по; the noun after it is genitive.
gen|Многие боятся ___.|Many people are afraid of change.|перемены|G|перемены,перемен,переменам,перемены,переменами,переменах|gen_verb|боятся|
gen|Пассажиров просят избегать ___.|Passengers are asked to avoid unnecessary journeys.|лишние поездки|G|лишние поездки,лишних поездок,лишним поездкам,лишние поездки,лишними поездками,лишних поездках|gen_verb|избегать|
gen|Учитель потребовал ___.|The teacher demanded silence.|тишина|G|тишина,тишины,тишине,тишину,тишиной,тишине|gen_verb|потребовал|
gen|Желаю вам ___!|I wish you happiness!|счастье|G|счастье,счастья,счастью,счастье,счастьем,счастье|gen_verb|Желаю|Желать кому (dative) чего (genitive).
gen|Она стесняется своего ___.|She's embarrassed about her accent.|акцент|G|акцент,акцента,акценту,акцент,акцентом,акценте|gen_verb|стесняется|
gen|Этот поступок заслуживает ___.|This act deserves respect.|уважение|G|уважение,уважения,уважению,уважение,уважением,уважении|gen_verb|заслуживает|
gen|Мы опасаемся ___ цен.|We fear a rise in prices.|рост|G|рост,роста,росту,рост,ростом,росте|gen_verb|опасаемся|
gen|Команда добилась ___.|The team achieved victory.|победа|G|победа,победы,победе,победу,победой,победе|gen_verb|добилась|
gen|Не стоит ждать от него ___.|Don't expect help from him.|помощь|G|помощь,помощи,помощи,помощь,помощью,помощи|gen_verb|ждать|Ждать чего: something abstract or uncertain takes the genitive.
gen|Компания достигла хороших ___.|The company achieved good results.|результаты|G|результаты,результатов,результатам,результаты,результатами,результатах|gen_verb|достигла|
gen|Суд лишил его ___.|The court stripped him of his licence.|лицензия|G|лицензия,лицензии,лицензии,лицензию,лицензией,лицензии|gen_verb|лишил|Лишать кого (accusative) чего (genitive).
gen|Вопрос касается ___ отпуска.|The question concerns the holiday schedule.|график|G|график,графика,графику,график,графиком,графике|gen_verb|касается|
gen|Она добивается ___ для своих детей.|She is fighting for justice for her children.|справедливость|G|справедливость,справедливости,справедливости,справедливость,справедливостью,справедливости|gen_verb|добивается|
gen|Мы ждём от вас ___.|We're waiting for your answer.|ответ|G|ответ,ответа,ответу,ответ,ответом,ответе|gen_verb|ждём|
dat|Студенты радуются ___.|The students are glad about the holidays.|каникулы|D|каникулы,каникул,каникулам,каникулы,каникулами,каникулах|dat_verb|радуются|
dat|Никто не верит ___.|Nobody believes the politicians.|политики|D|политики,политиков,политикам,политиков,политиками,политиках|dat_verb|верит|Верить кому (dative); верить во что (в + accusative).
dat|Шум мешает ___.|The noise disturbs my work.|моя работа|D|моя работа,моей работы,моей работе,мою работу,моей работой,моей работе|dat_verb|мешает|
dat|Новый закон препятствует ___.|The new law hinders development.|развитие|D|развитие,развития,развитию,развитие,развитием,развитии|dat_verb|препятствует|
dat|Я научился ___ в детстве.|I learned patience as a child.|терпение|D|терпение,терпения,терпению,терпение,терпением,терпении|dat_verb|научился|Учиться / научиться чему (dative).
dat|Мы благодарны ___ за поддержку.|We are grateful to our colleagues for their support.|коллеги|D|коллеги,коллег,коллегам,коллег,коллегами,коллегах|dat_verb|благодарны|
dat|Он всегда следует ___ врача.|He always follows the doctor's advice.|советы|D|советы,советов,советам,советы,советами,советах|dat_verb|следует|Следовать чему (dative): follow advice, rules, an example.
dat|Её поступки противоречат её ___.|Her actions contradict her words.|слова|D|слова,слов,словам,слова,словами,словах|dat_verb|противоречат|
dat|Этот план угрожает ___.|This plan threatens the environment.|природа|D|природа,природы,природе,природу,природой,природе|dat_verb|угрожает|
dat|Мы удивились его ___.|We were surprised by his calm.|спокойствие|D|спокойствие,спокойствия,спокойствию,спокойствие,спокойствием,спокойствии|dat_verb|удивились|
dat|Не стоит подражать ___.|You shouldn't imitate other people.|другие люди|D|другие люди,других людей,другим людям,других людей,другими людьми,других людях|dat_verb|подражать|
dat|Дети подарили ___ цветы.|The children gave the teacher flowers.|учительница|D|учительница,учительницы,учительнице,учительницу,учительницей,учительнице|dat_verb|подарили|The person who receives: dative.
dat|Ваше решение соответствует ___.|Your decision complies with the rules.|правила|D|правила,правил,правилам,правила,правилами,правилах|dat_verb|соответствует|
ins|Она увлекается ___.|She's into photography.|фотография|I|фотография,фотографии,фотографии,фотографию,фотографией,фотографии|ins_verb|увлекается|
ins|Он занимается ___ каждый день.|He does sport every day.|спорт|I|спорт,спорта,спорту,спорт,спортом,спорте|ins_verb|занимается|
ins|Мы любовались ___.|We were admiring the view.|вид|I|вид,вида,виду,вид,видом,виде|ins_verb|любовались|
ins|Кто управляет ___?|Who runs the company?|компания|I|компания,компании,компании,компанию,компанией,компании|ins_verb|управляет|
ins|Он интересуется ___.|He's interested in history.|история|I|история,истории,истории,историю,историей,истории|ins_verb|интересуется|
ins|Она дорожит ___.|She values her friends.|друзья|I|друзья,друзей,друзьям,друзей,друзьями,друзьях|ins_verb|дорожит|
ins|Учёные поделились ___ исследования.|The scientists shared the results of the study.|результаты|I|результаты,результатов,результатам,результаты,результатами,результатах|ins_verb|поделились|
ins|Не надо хвастаться ___.|There's no need to boast about your successes.|успехи|I|успехи,успехов,успехам,успехи,успехами,успехах|ins_verb|хвастаться|
ins|Город славится своими ___.|The city is famous for its parks.|парки|I|парки,парок,паркам,парки,парками,парках|ins_verb|славится своими|
ins|Он работает ___ в школе.|He works as a teacher at a school.|учитель|I|учитель,учителя,учителю,учителя,учителем,учителе|ins_verb|работает|Работать / быть / стать кем: instrumental.
ins|Я обладаю ___.|I have the necessary information.|нужная информация|I|нужная информация,нужной информации,нужной информации,нужную информацию,нужной информацией,нужной информации|ins_verb|обладаю|
ins|Она стала известной ___.|She became a famous writer.|писательница|I|писательница,писательницы,писательнице,писательницу,писательницей,писательнице|ins_verb|стала известной|
ins|Компания располагает ___.|The company has large resources.|большие ресурсы|I|большие ресурсы,больших ресурсов,большим ресурсам,большие ресурсы,большими ресурсами,больших ресурсах|ins_verb|располагает|
ins|Мы гордимся нашей ___.|We are proud of our team.|команда|I|команда,команды,команде,команду,командой,команде|ins_verb|гордимся нашей|
prepv|Это зависит от ___.|It depends on the circumstances.|обстоятельства|G|обстоятельства,обстоятельств,обстоятельствам,обстоятельства,обстоятельствами,обстоятельствах|pv_G|зависит от|
prepv|Она жалуется на ___.|She complains about a headache.|головная боль|A|головная боль,головной боли,головной боли,головную боль,головной болью,головной боли|pv_A|жалуется на|
prepv|Мы рассчитываем на вашу ___.|We're counting on your help.|помощь|A|помощь,помощи,помощи,помощь,помощью,помощи|pv_A|рассчитываем на вашу|
prepv|Он признался в ___.|He confessed to his mistake.|ошибка|P|ошибка,ошибки,ошибке,ошибку,ошибкой,ошибке|pv_P|признался в|
prepv|Студент не разбирается в ___.|The student doesn't understand politics.|политика|P|политика,политики,политике,политику,политикой,политике|pv_P|разбирается в|
prepv|Мы готовимся к ___.|We're preparing for the exam.|экзамен|D|экзамен,экзамена,экзамену,экзамен,экзаменом,экзамене|pv_D|готовимся к|
prepv|Она привыкла к ___.|She has got used to the climate.|климат|D|климат,климата,климату,климат,климатом,климате|pv_D|привыкла к|
prepv|Он отличается от ___.|He's different from his brother.|брат|G|брат,брата,брату,брата,братом,брате|pv_G|отличается от|
prepv|Мы надеемся на ___.|We hope for a quick answer.|быстрый ответ|A|быстрый ответ,быстрого ответа,быстрому ответу,быстрый ответ,быстрым ответом,быстром ответе|pv_A|надеемся на|
prepv|Всё дело в ___.|It's all about money.|деньги|P|деньги,денег,деньгам,деньги,деньгами,деньгах|pv_P|Всё дело в|
prepv|Она избавилась от ___.|She got rid of the bad habit.|вредная привычка|G|вредная привычка,вредной привычки,вредной привычке,вредную привычку,вредной привычкой,вредной привычке|pv_G|избавилась от|
prepv|Учёные пришли к ___.|The scientists came to a conclusion.|вывод|D|вывод,вывода,выводу,вывод,выводом,выводе|pv_D|пришли к|
prepv|Он не обратил внимания на ___.|He paid no attention to the warning.|предупреждение|A|предупреждение,предупреждения,предупреждению,предупреждение,предупреждением,предупреждении|pv_A|обратил внимания на|
prepv|Проект нуждается в ___.|The project needs funding.|финансирование|P|финансирование,финансирования,финансированию,финансирование,финансированием,финансировании|pv_P|нуждается в|
prepv|Мы отказались от ___.|We gave up the trip.|поездка|G|поездка,поездки,поездке,поездку,поездкой,поездке|pv_G|отказались от|
prepv|Цены зависят от ___ и предложения.|Prices depend on supply and demand.|спрос|G|спрос,спроса,спросу,спрос,спросом,спросе|pv_G|зависят от|
formal|В течение ___ шёл снег.|It snowed throughout the day.|день|G|день,дня,дню,день,днём,дне|formal_G|В течение|
formal|Благодаря ___ мы сэкономили время.|Thanks to the new system we saved time.|новая система|D|новая система,новой системы,новой системе,новую систему,новой системой,новой системе|formal_D|Благодаря|
formal|Согласно ___, завтра будет дождь.|According to the forecast, it will rain tomorrow.|прогноз|D|прогноз,прогноза,прогнозу,прогноз,прогнозом,прогнозе|formal_D|Согласно|
formal|В связи с ___ мы меняем расписание.|In connection with the holidays, we're changing the timetable.|праздники|I|праздники,праздников,праздникам,праздники,праздниками,праздниках|formal_I|В связи с|
formal|В отличие от ___, он говорит тихо.|Unlike his father, he speaks quietly.|отец|G|отец,отца,отцу,отца,отцом,отце|formal_G|В отличие от|
formal|Вопреки ___ погода была отличной.|Contrary to the forecast, the weather was excellent.|прогноз|D|прогноз,прогноза,прогнозу,прогноз,прогнозом,прогнозе|formal_D|Вопреки|
formal|По сравнению с ___ здесь дёшево.|Compared with Moscow, it's cheap here.|Москва|I|Москва,Москвы,Москве,Москву,Москвой,Москве|formal_I|По сравнению с|
formal|В результате ___ здание сильно пострадало.|As a result of the fire, the building was badly damaged.|пожар|G|пожар,пожара,пожару,пожар,пожаром,пожаре|formal_G|В результате|
formal|Наряду с ___ он изучает немецкий.|Along with English, he's studying German.|английский язык|I|английский язык,английского языка,английскому языку,английский язык,английским языком,английском языке|formal_I|Наряду с|
formal|В зависимости от ___ цена меняется.|The price changes depending on the season.|сезон|G|сезон,сезона,сезону,сезон,сезоном,сезоне|formal_G|В зависимости от|
formal|Вследствие ___ рейс задержали.|As a result of the storm, the flight was delayed.|буря|G|буря,бури,буре,бурю,бурей,буре|formal_G|Вследствие|
formal|Благодаря ___ всё прошло хорошо.|Thanks to the organisers, everything went well.|организаторы|D|организаторы,организаторов,организаторам,организаторов,организаторами,организаторах|formal_D|Благодаря|
formal|В целях ___ вход по пропускам.|For security reasons, entry is by pass only.|безопасность|G|безопасность,безопасности,безопасности,безопасность,безопасностью,безопасности|formal_G|В целях|
formal|Согласно ___ компании, сотрудники работают удалённо.|According to the company's rules, staff work remotely.|правила|D|правила,правил,правилам,правила,правилами,правилах|formal_D|Согласно|
book|Ввиду ___ заседание отменяется.|In view of the circumstances, the meeting is cancelled.|сложившиеся обстоятельства|G|сложившиеся обстоятельства,сложившихся обстоятельств,сложившимся обстоятельствам,сложившиеся обстоятельства,сложившимися обстоятельствами,сложившихся обстоятельствах|book_G|Ввиду|
book|Во время ___ телефоны должны быть выключены.|During the performance, phones must be switched off.|спектакль|G|спектакль,спектакля,спектаклю,спектакль,спектаклем,спектакле|book_G|Во время|
book|В ходе ___ выяснились новые факты.|In the course of the investigation, new facts emerged.|расследование|G|расследование,расследования,расследованию,расследование,расследованием,расследовании|book_G|В ходе|
book|По мере ___ мы добавляем новые функции.|As development progresses, we add new features.|развитие|G|развитие,развития,развитию,развитие,развитием,развитии|book_G|По мере|
book|Он действовал в ущерб своим ___.|He acted against his own interests.|интересы|D|интересы,интересов,интересам,интересы,интересами,интересах|book_D|в ущерб своим|
book|В отношении ___ решение ещё не принято.|With regard to the budget, no decision has been taken yet.|бюджет|G|бюджет,бюджета,бюджету,бюджет,бюджетом,бюджете|book_G|В отношении|
book|Невзирая на ___ родителей, они поженились.|Despite their parents' objections, they got married.|возражения|A|возражения,возражений,возражениям,возражения,возражениями,возражениях|book_A|Невзирая на|
book|На основании ___ суд вынес решение.|On the basis of the evidence, the court reached a decision.|доказательства|G|доказательства,доказательств,доказательствам,доказательства,доказательствами,доказательствах|book_G|На основании|
book|Взамен ___ вам выдадут новый.|In exchange for the old passport you'll be issued a new one.|старый паспорт|G|старый паспорт,старого паспорта,старому паспорту,старый паспорт,старым паспортом,старом паспорте|book_G|Взамен|
book|В пользу ___ говорят многие факты.|Many facts speak in favour of this version.|эта версия|G|эта версия,этой версии,этой версии,эту версию,этой версией,этой версии|book_G|В пользу|
book|По причине ___ занятия отменены.|Owing to illness, the classes are cancelled.|болезнь|G|болезнь,болезни,болезни,болезнь,болезнью,болезни|book_G|По причине|
book|Несмотря на ___, он не опоздал.|Despite the traffic jams, he wasn't late.|пробки|A|пробки,пробок,пробкам,пробки,пробками,пробках|book_A|Несмотря на|
book|Вопреки ___ здравого смысла он продолжал.|Against the voice of common sense, he carried on.|голос|D|голос,голоса,голосу,голос,голосом,голосе|formal_D|Вопреки|`;
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
