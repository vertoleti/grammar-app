import os
T='''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{color}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Грамматика">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="../manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="../icons/favicon-32.png">
<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">
<script src="../shared/progress.js"></script>
<script src="../shared/config.js"></script>
<script src="../shared/account.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../shared/engine.css">
<link rel="stylesheet" href="../shared/ui.css">
<style>:root{{--red:{color}}}.m{{color:{color}}}</style>
</head>
<body>
<header class="top band">
  <div class="wrap">
    <div class="head">
      <div class="brand"><a class="m" href="../" aria-label="All exercises" title="All exercises">{num}</a><div><p class="home"><a href="../">← All exercises</a></p><h1>{title}</h1><p class="sub">{en} · {sub} · <span id="count"></span> sentences</p></div></div>
      <div class="score" id="score"></div>
    </div>
    <div class="track" id="track" aria-hidden="true"></div>
  </div>
</header>

<main class="band">
  <div class="wrap layout">
    <div class="maincol">
      <section class="card" id="card" aria-live="polite"></section>
      <p class="keys">Keyboard: <kbd>1</kbd>–<kbd>6</kbd> to choose, <kbd>Enter</kbd> for the next station</p>
    </div>
    <aside class="ctrls" data-sheet>
      <section class="grp" data-all="All levels" data-fmt="Level {{v}}"><h3>Level · Уровень</h3><div class="seg segctl" id="lvls" role="group" aria-label="Level"></div></section>
      <section class="grp" data-all="All topics"><h3>Topic · Тема</h3><div class="seg list" id="topics" role="group" aria-label="Topic"></div></section>
      <section class="grp" data-fmt="{{v}} the form"><h3>Answer by · Как отвечать</h3><div class="seg segctl" id="modes" role="group" aria-label="Answer mode"><button id="m-pick" data-m="pick">Choose</button><button id="m-type" data-m="type">Type</button><button id="m-listen" data-m="listen">Listen</button></div></section>
      <section class="grp" data-fmt="{{v}}"><h3>Steps · Шаги</h3><div class="seg segctl" id="steps" role="group" aria-label="Steps"><button id="s-one" data-s="one">One step</button><button id="s-two" data-s="two">Two steps</button></div></section>
      <section class="grp" data-fmt="{{v}} per round" data-all="Every question"><h3>Questions per round · Вопросов в раунде</h3><div class="seg segctl" id="sizes" role="group" aria-label="Questions per round"></div></section>
      <p class="note">Progress is saved in this browser. <a href="../#progress">Back it up or sync it between devices · Сохранить прогресс</a></p>
    </aside>
  </div>
</main>

<section class="band ref">
  <div class="wrap">
    <h2>Cheat sheet</h2>
{cheat}
  </div>
</section>
<script src="../shared/levels.js"></script>
<script src="data.js"></script>
<script src="../shared/coach.js"></script>
<script src="../shared/ui.js"></script>
<script src="../shared/engine.js"></script>
</body>
</html>
'''
def tbl(head,rows):
    h=''.join(f'<th>{x}</th>' for x in head)
    r=''.join('<tr>'+''.join(f'<td>{c}</td>' for c in row)+'</tr>' for row in rows)
    return f'<div class="tbl"><table><thead><tr>{h}</tr></thead><tbody>{r}</tbody></table></div>'
pages={
'cases':dict(num='2',color='#1f8a3b',title='Падежи',en='Cases',sub='pick the case, then the form',desc='Practise the six Russian cases: pick the case, then the right form.',
 cheat='<div class="cols"><div><h3>The six cases</h3>'+tbl(['Case','Asks','Main uses'],[
 ['Nominative','кто? что?','subject; у меня есть…'],
 ['Genitive','кого? чего?','of; нет; quantities; у, без, для, из, от, с, до, после'],
 ['Dative','кому? чему?','to whom; мне холодно, надо, нравится, age; к, по'],
 ['Accusative','кого? что? куда?','direct object; в / на + direction; в субботу, через'],
 ['Instrumental','кем? чем?','with (с); tool; работать, стать, заниматься; над, под, перед, за, между'],
 ['Prepositional','о ком? о чём? где?','location with в / на; about with о']])+'</div><div><h3>Singular endings</h3>'+tbl(['','стол','книга','окно','площадь'],[
 ['Nom','стол','книга','окно','площадь'],['Gen','стола','книги','окна','площади'],['Dat','столу','книге','окну','площади'],['Acc','стол','книгу','окно','площадь'],['Ins','столом','книгой','окном','площадью'],['Prep','столе','книге','окне','площади']])+'<p class="note">Animate masculine nouns and all animate plurals use the genitive form in the accusative: вижу брата, люблю собак.</p></div></div>'),
'aspect':dict(num='3',color='#0a68b0',title='Вид глагола',en='Verb aspect',sub='pick the verb, then the form',desc='Practise Russian verb aspect and conjugation: imperfective or perfective, then the right form.',
 cheat='<div class="cols"><div><h3>When to use which aspect</h3>'+tbl(['Imperfective','Perfective'],[
 ['process, duration: долго, весь день','one completed action, result: уже, наконец'],
 ['repetition: часто, всегда, каждый день','a chain of actions: открыл и вышел'],
 ['general fact: Ты читал эту книгу?','за + time: за час'],
 ['background: Когда я шёл…','the event that interrupts: …пошёл дождь'],
 ['present tense','no present: прочитаю = will read'],
 ['future: буду читать','future: прочитаю'],
 ['не + imperative; invitations: Садитесь!','single request: Закрой окно']])+'</div><div><h3>How pairs are formed</h3>'+tbl(['Type','Imperfective','Perfective'],[
 ['prefix','писать, делать, читать','написать, сделать, прочитать'],
 ['suffix','решать, открывать, давать','решить, открыть, дать'],
 ['different root','брать, говорить, ложиться','взять, сказать, лечь']])+'<h3 style="margin-top:20px">Irregular verbs to know</h3><p>есть: ем, ешь, ест, едим, едите, едят. дать: дам, дашь, даст, дадим, дадите, дадут. хотеть: хочу, хочешь, хочет, хотим, хотите, хотят. мочь: могу, можешь, могут.</p></div></div>'),
'numbers':dict(num='4',color='#c25e00',title='Числа',en='Numbers',sub='pick the form type, then the word',desc='Practise Russian numbers with nouns: 1, 2–4, 5+, age, time, money and quantities.',
 cheat='<div class="cols"><div><h3>The counting rule</h3>'+tbl(['Number ends in','Noun','Example'],[
 ['1 (not 11)','nominative singular','21 год, один рубль'],
 ['2, 3, 4 (not 12–14)','genitive singular','22 года, три рубля'],
 ['5–9, 0, and 11–14','genitive plural','25 лет, двенадцать рублей']])+'<p class="note">Only the last word of the number counts: сто двадцать один рубль, сто двенадцать рублей.</p></div><div><h3>Words to know</h3>'+tbl(['Word','1','2–4','5+'],[
 ['год','год','года','лет'],['час','час','часа','часов'],['минута','минута','минуты','минут'],['рубль','рубль','рубля','рублей'],['человек','человек','человека','человек'],['день','день','дня','дней']])+'<p class="note">много, мало, сколько, несколько: genitive plural for things you count (много книг), genitive singular for things you can’t (много воды).</p></div></div>'),
'advanced':dict(num='5',color='#7a2a8c',title='Продвинутый уровень',en='Advanced grammar',sub='participles, verbal adverbs, -ся, бы',desc='Practise advanced Russian grammar: participles, verbal adverbs, -ся verbs, бы and чтобы.',
 cheat='<div class="cols"><div><h3>Participles and verbal adverbs</h3>'+tbl(['Form','Built from','Example'],[
 ['active present','они-form − т + щий','читающий, сидящий'],
 ['active past','past − л + вший / ший','прочитавший, принёсший'],
 ['passive present','мы-form + ый','читаемый, любимый'],
 ['passive past','-анный / -енный / -тый','прочитанный, построенный, открытый'],
 ['verbal adverb, impf','они-form − ending + я','читая, говоря, идя'],
 ['verbal adverb, pf','past − л + в / вшись','прочитав, попрощавшись']])+'</div><div><h3>-ся, бы and чтобы</h3>'+tbl(['Pattern','Use','Example'],[
 ['verb + -ся','no object; to oneself; each other','урок начинается, мы встречаемся'],
 ['verb without -ся','takes an object','учитель начинает урок'],
 ['если бы + past, бы + past','unreal: would / would have','Если бы я знал, я бы пришёл'],
 ['если + future','real future condition','Если будет дождь, мы останемся'],
 ['чтобы + infinitive','purpose, same person','Я пришёл, чтобы помочь'],
 ['чтобы + past','wish for someone else','Я хочу, чтобы ты пришёл']])+'</div></div>')
}
pages['prep']=dict(num='7',color='#8d5b2d',title='Предлоги',en='Prepositions',sub='pick the preposition, then the case form',desc='Practise Russian prepositions and the cases they take.',
 cheat='<div class="cols"><div><h3>Where, where to, where from</h3>'+tbl(['Где? (P)','Куда? (A)','Откуда? (G)'],[
 ['в школе','в школу','из школы'],['на работе','на работу','с работы'],['у врача (G)','к врачу (D)','от врача (G)']])+'<p class="note">Places with на: работа, почта, вокзал, улица, дача, концерт, выставка, урок, море, рынок.</p></div><div><h3>Which case after which preposition</h3>'+tbl(['Case','Prepositions'],[
 ['Genitive','из, с (from), от, у, до, после, без, для, около, напротив'],['Dative','к, по'],['Accusative','в / на (where to), через, за (how long), на (for how long), в + day'],['Instrumental','с (with), под, над, за, перед, между'],['Prepositional','в / на (where), о / об, в + month']])+'</div></div>')
pages['compare']=dict(num='8',color='#c2185b',title='Сравнение и краткие формы',en='Comparison and short forms',sub='pick the form type, then the word',desc='Practise Russian comparatives, superlatives, short adjectives and adverbs.',
 cheat='<div class="cols"><div><h3>Comparatives and superlatives</h3>'+tbl(['Adjective','Comparative','Superlative'],[
 ['хороший','лучше','лучший, самый лучший'],['плохой','хуже','худший'],['большой','больше','самый большой'],['маленький','меньше','самый маленький'],['дешёвый','дешевле','самый дешёвый'],['высокий','выше','самый высокий'],['тёплый','теплее','самый тёплый']])+'</div><div><h3>Which form when</h3>'+tbl(['Form','Use','Example'],[
 ['short comparative','after the noun, with чем or genitive','Он выше меня'],['более + adjective','before a noun','более тёплая куртка'],['short adjective','temporary state; рад, должен, прав','Я занят'],['full adjective','describes a noun','холодная погода'],['adverb in -о','describes a verb, or a state','говорит хорошо, холодно']])+'</div></div>')
for k,v in pages.items():
    os.makedirs(k,exist_ok=True)
    open(f'{k}/index.html','w').write(T.format(**v))
print('ok')
