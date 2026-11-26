const h=require("fs").readFileSync("tools/verbs-of-motion.src.html","utf8");
const full=h.slice(h.indexOf("<script>\n{")+10,h.lastIndexOf("}\n</script>"));
const s=full.slice(0,full.indexOf("const TOP="));
const R=new Function(s+";return {Q,info,RULES,FAM}")();
let bad=0;const verbs=new Set(),cnt={},seen=new Set();
for(const q of R.Q){cnt[q.t]=(cnt[q.t]||0)+1;
 if(seen.has(q.ru)){console.log("dupe",q.ru);bad++}seen.add(q.ru);
 try{[q.v,...q.d].forEach(v=>{R.info(v);verbs.add(v)})}catch(e){console.log(e.message);bad++;continue}
 if(q.d.length!==3||q.d.includes(q.v)||new Set(q.d).size!==3){console.log("dist",q.ru);bad++}
 if(!R.RULES[q.rule]){console.log("rule",q.rule);bad++}
 if(q.cue&&!q.ru.includes(q.cue)){console.log("cue",q.cue,"|",q.ru);bad++}
 if((q.ru.match(/___/g)||[]).length!==1){console.log("gap",q.ru);bad++}
 const f=R.info(q.v)[q.tn];if(!f||!f[q.i]){console.log("idx",q.ru);bad++}
}
console.log(R.Q.length,cnt,"problems",bad);
for(const v of [...verbs].sort()){const x=R.info(v);console.log(v.padEnd(11),x.k,x.cp||"-",x.n.join(" "),"|",x.p.join(" "))}
new Function(full);console.log("syntax ok");
