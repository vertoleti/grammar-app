s=open('tools/verbs-of-motion.src.html').read()
s=s.replace('href="manifest.webmanifest"','href="../manifest.webmanifest"').replace('href="icons/','href="../icons/')
s=s.replace('<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">','<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">\n<script src="../shared/progress.js"></script>')
s=s.replace('<meta name="apple-mobile-web-app-title" content="Движение">','<meta name="apple-mobile-web-app-title" content="Грамматика">')
s=s.replace("navigator.serviceWorker.register('sw.js')","navigator.serviceWorker.register('../sw.js',{scope:'../'})")
s=s.replace('<div class="brand"><div class="m" aria-hidden="true">М</div>','<div class="brand"><a class="m" href="../" aria-label="All exercises" title="All exercises">1</a>')
s=s.replace('.m{flex:none;','.m{text-decoration:none;flex:none;')
s=s.replace('<div><h1>Глаголы движения</h1>','<div><p class="home"><a href="../">← All exercises</a></p><h1>Глаголы движения</h1>')
s=s.replace('h1{font-size:clamp(28px,5vw,44px)','.home{margin:0 0 4px;font-size:15px}\n.home a{color:#fff;opacity:.9}\nh1{font-size:clamp(28px,5vw,44px)')
s=s.replace('<script src="levels.js"></script>','<script src="../shared/levels.js"></script>\n<script src="../shared/coach.js"></script>\n<script src="../shared/ui.js"></script>')
s=s.replace("$('sub').textContent=`Verbs of motion: pick the verb, then the form · ${Q.length} sentences`;","$('sub').textContent=`Verbs of motion · pick the verb, then the form · ${Q.length} sentences`;")
s=s.replace('</style>\n</head>','</style>\n<link rel="stylesheet" href="../shared/ui.css">\n</head>',1)
s=s.replace('    </aside>','      <p class="note">Progress is saved in this browser. <a href="../#progress">Back it up or sync it between devices · Сохранить прогресс</a></p>\n    </aside>',1)
assert '<p class="home"><a href="../">← All exercises</a></p><h1>' in s
for must in ['../shared/coach.js',"register('../sw.js'",'class="home"','../shared/levels.js','../shared/progress.js','../shared/ui.css','../shared/ui.js','#progress','data-sheet']:
    assert must in s, must
open('verbs-of-motion/index.html','w').write(s)
print('built vom')
