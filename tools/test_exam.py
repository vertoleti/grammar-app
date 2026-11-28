import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x))); pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
        for lang,u,lv in [("ru","exam/","B1"),("de","de/exam/","A2"),("de","de/exam/","C1"),("ru","exam/","A1")]:
            await pg.goto(B+u); await pg.wait_for_timeout(500)
            await pg.click(f'#xl [data-l="{lv}"]'); await pg.click("#xs"); await pg.wait_for_timeout(1500)
            ex=await pg.evaluate("window.__gr.exam()")
            sizes={k:(len(v) if k!='read' else sum(len(r['qs']) for r in v)) for k,v in ex['parts'].items()}
            print(lang,lv,"parts:",sizes,"| clock:",await pg.locator("#clock").inner_text())
            bad=[q for q in ex['parts']['gram'] if q['a'] not in q['o'] or len(set(q['o']))<2]
            print("  grammar items with <2 options or missing answer:",len(bad), "| sample:", ex['parts']['gram'][0]['stem'], ex['parts']['gram'][0]['o'])
            if ex['parts']['voc']: print("  vocab sample:", ex['parts']['voc'][0]['stem'], "→", ex['parts']['voc'][0]['o'])
            # answer: all right except first grammar question
            tabs=await pg.locator("#xp button").count()
            for t in range(tabs):
                await pg.click(f'#xp [data-p="{t}"]'); await pg.wait_for_timeout(150)
                ex=await pg.evaluate("window.__gr.exam()")
                btns=pg.locator('.opt[data-act="pick"]'); n=await btns.count()
                for i in range(n):
                    bt=btns.nth(i); key=await bt.get_attribute("data-q"); v=await bt.get_attribute("data-v")
                    k=''.join(ch for ch in key if ch.isalpha()); 
                    if k=='read':
                        ti,qi=map(int,key[4:].split('-')); a=ex['parts']['read'][ti]['qs'][qi]['a']
                    else: a=ex['parts'][k][int(key[len(k):])]['a']
                    if (v==a)!=(key=='gram0'): await bt.click()
                if lang=="de" and lv=="A2" and t==2: await pg.screenshot(path="/tmp/ex-read.png")
            await pg.locator('[data-act="submit"]').click(); await pg.wait_for_timeout(400)
            print("  result:", (await pg.locator(".xres").inner_text()).replace("\n"," ")[:160])
            if lang=="de" and lv=="A2": await pg.screenshot(path="/tmp/ex-res.png")
            await pg.click('[data-act="home"]') if await pg.locator('[data-act="home"]').count() else None
        print("history de:", await pg.evaluate("JSON.parse(localStorage.getItem('de-exams')).map(h=>h.level+' '+h.pct+' '+h.pass)"))
        print("errors",e); await b.close()
asyncio.run(main())
