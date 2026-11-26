const fs=require('fs');let total=0,bad=0;
for(const ex of ['cases','numbers','aspect','advanced','prep','compare']){
  const window={};new Function('window',fs.readFileSync(`${ex}/data.js`,'utf8'))(window);
  const E=window.EXERCISE,seen=new Set();const cnt={};
  for(const q of E.items){cnt[q.t]=(cnt[q.t]||0)+1;
    const err=m=>{bad++;console.log(ex,'|',m,'|',q.ru)};
    if(seen.has(q.ru))err('dupe');seen.add(q.ru);
    if((q.ru.match(/___/g)||[]).length!==1)err('gap');
    if(q.cue&&!q.ru.includes(q.cue))err('cue '+q.cue);
    if(!E.rules[q.rule])err('rule '+q.rule);
    if(!E.topics[q.t])err('topic '+q.t);
    q.o1.forEach(o=>{if(!E.opts[o.kind])err('kind '+o.kind)});
    if(!q.o1[q.a1])err('a1');
    if(!q.forms[q.a2])err('a2');
    if(q.labels&&q.labels.length<q.forms.length)err('labels');
    if(q.forms.some(f=>!f||f!==f.trim()))err('blank form');
    if(new Set(q.forms).size<2)err('one option');
    if(q.note&&!/[.!?)]$/.test(q.note))err('note punct');
  }
  total+=E.items.length;console.log(ex,E.items.length,JSON.stringify(cnt));
}
console.log('total',total,'problems',bad);
new Function(fs.readFileSync('shared/engine.js','utf8'));console.log('engine syntax ok');
