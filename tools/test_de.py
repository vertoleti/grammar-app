import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
LINES=['verbs','cases','prep','adj','conn','konj','adv']
async def answer_round(pg, n, tag):
    for i in range(n):
        if not await pg.locator('#card button[data-act="f"]').count():
            if await pg.locator('#card button[data-act="a"]').count():
                await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(50)
        await pg.wait_for_timeout(150)
        want=await pg.evaluate("window.__gr.answer()")
        btn=pg.locator('#card button[data-act="f"]').filter(has_text=want)
        ks=await pg.locator('#card button[data-act="f"]').evaluate_all("bs=>bs.map(b=>b.dataset.k)")
        if want not in ks: print(tag,"answer not offered:",want,ks); return False
        await pg.locator('#card button[data-act="f"]').nth(ks.index(want)).click(); await pg.wait_for_timeout(120)
        v=await pg.locator('#card .verdict').first.inner_text()
        if '✓' not in v: print(tag,"marked wrong:",want,v, await pg.locator('#card .ru').first.inner_text()); return False
        await pg.click('#next'); await pg.wait_for_timeout(150)
    return True
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for vp,mob in [({"width":390,"height":844},True),({"width":1280,"height":900},False)]:
            tag="phone" if mob else "desktop"
            ctx=await b.new_context(viewport=vp,device_scale_factor=2,is_mobile=mob,has_touch=mob)
            for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
            pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
            await pg.goto(B+"?ru"); await pg.evaluate("localStorage.setItem('gr-level',JSON.stringify('B1'))")
            # every German grammar line: a full correct round, all topics, all levels
            for l in LINES:
                await pg.goto("about:blank"); await pg.goto(B+f"de/{l}/#all"); await pg.wait_for_timeout(350)
                await pg.evaluate("localStorage.setItem('de-level',JSON.stringify('all'))")
                await pg.reload(); await pg.wait_for_timeout(350)
                ok=await answer_round(pg, 10, f"{tag} {l}")
                if l=='cases' and mob: await pg.screenshot(path="/tmp/de-cases.png")
                print(tag, l, "round ok" if ok else "round FAILED", "| title:", await pg.locator("h1").inner_text())
            # typing with ae/oe/ue/ss
            await pg.goto("about:blank"); await pg.goto(B+"de/verbs/#praes"); await pg.evaluate("localStorage.setItem('de-verbs-prefs',JSON.stringify({topic:'praes',mode:'type'}))"); await pg.reload(); await pg.wait_for_timeout(350)
            okt=0
            for i in range(5):
                want=await pg.evaluate("window.__gr.answer()")
                typed=want.replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss')
                await pg.fill('#ans',typed); await pg.press("#ans","Enter"); await pg.wait_for_timeout(200)
                if '✓' in await pg.locator('#card .verdict').first.inner_text(): okt+=1
                await pg.click('#next'); await pg.wait_for_timeout(250)
            print(tag,"typed without umlauts, right:",okt,"of 5")
            if not mob:
                # placement
                await pg.goto("about:blank"); await pg.goto(B+"de/placement/"); await pg.wait_for_timeout(500)
                n=0
                while await pg.locator('#card button[data-act="f"]').count():
                    await pg.wait_for_timeout(150)
                    want=await pg.evaluate("(()=>{try{return window.__gr.answer()}catch(e){return null}})()")
                    if want is None: break
                    lv=(await pg.locator("#card .meta span").first.inner_text()).strip()[:2]
                    ks=await pg.locator('#card button[data-act="f"]').evaluate_all("bs=>bs.map(b=>b.dataset.k)")
                    k=ks.index(want) if lv in ('A1','A2') else (ks.index(want)+1)%len(ks)
                    await pg.locator('#card button[data-act="f"]').nth(k).click(); await pg.wait_for_timeout(120); n+=1
                    await pg.click('#next'); await pg.wait_for_timeout(150)
                print("placement:",n,"questions, result",await pg.locator("#card .big").inner_text())
                await pg.click("#accept"); await pg.wait_for_timeout(600)
                print("after accept:",pg.url,"| de-level",await pg.evaluate("localStorage.getItem('de-level')"),"| ru gr-level untouched:",await pg.evaluate("localStorage.getItem('gr-level')"))
                # mix
                await pg.goto(B+"de/mix/"); await pg.wait_for_timeout(500)
                lines=set()
                for i in range(10):
                    if not await pg.locator('#card button[data-act="f"]').count() and await pg.locator('#card button[data-act="a"]').count():
                        await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(40)
                    await pg.wait_for_timeout(150); await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(120)
                    lines.add((await pg.locator("#card .meta span").first.inner_text()).split(":")[0].split(" · ",1)[-1])
                    await pg.click('#next'); await pg.wait_for_timeout(150)
                print("mix lines:",sorted(lines))
            # Sätze
            await pg.goto("about:blank"); await pg.goto(B+"de/saetze/#tr"); await pg.wait_for_timeout(400)
            ans=await pg.evaluate("window.__gr.answer()")
            await pg.fill("#ans",ans); await pg.press("#ans","Enter"); await pg.wait_for_timeout(120)
            v1=await pg.locator(".verdict").inner_text(); await pg.click("#next"); await pg.wait_for_timeout(200)
            ans=await pg.evaluate("window.__gr.answer()"); w=ans.rstrip('.?!').split(' '); w=w[1:]+w[:1]
            await pg.fill("#ans"," ".join(w)); await pg.press("#ans","Enter"); await pg.wait_for_timeout(120)
            v2=await pg.locator(".verdict").inner_text()
            print(tag,"translate exact:",v1,"| wrong order:",v2)
            await pg.goto("about:blank"); await pg.goto(B+"de/saetze/#order"); await pg.wait_for_timeout(400)
            ans=await pg.evaluate("window.__gr.answer()")
            target=[x for x in ans.replace('.','').replace(',','').replace('?','').replace('!','').split(' ') if x not in ('—','–','-')]
            for wd in target:
                tiles=pg.locator('.bank .tile:not([disabled])'); n=await tiles.count()
                for k in range(n):
                    if (await tiles.nth(k).inner_text()).strip().lower()==wd.lower(): await tiles.nth(k).click(); await pg.wait_for_timeout(30); break
            first=(await pg.locator('.build .tile').first.inner_text()).strip()
            await pg.click('[data-act="check"]'); await pg.wait_for_timeout(120)
            print(tag,"word order:",await pg.locator(".verdict").inner_text(),"| first tile:",first,"| sentence:",ans)
            if mob: await pg.screenshot(path="/tmp/de-order.png")
            await pg.goto("about:blank"); await pg.goto(B+"de/saetze/#err"); await pg.wait_for_timeout(400)
            bad=await pg.evaluate("window.__gr.answer()"); await pg.locator(".wtok").nth(bad).click(); await pg.wait_for_timeout(120)
            print(tag,"find the mistake:",(await pg.locator(".verdict").inner_text())[:60])
            # Tabellen
            await pg.goto("about:blank"); await pg.goto(B+"de/tabellen/#art"); await pg.wait_for_timeout(400)
            t=await pg.evaluate("window.__gr.table()"); bl=await pg.evaluate("window.__gr.blanks()")
            for c in bl:
                r,k=map(int,c.split(':')); await pg.fill(f'input[data-c="{c}"]',t["rows"][r]["cells"][k].split('/')[0])
            await pg.locator('#f button.btn.go').click(); await pg.wait_for_timeout(120)
            print(tag,"table",t["title"],":",await pg.locator(".verdict").inner_text())
            if mob: await pg.screenshot(path="/tmp/de-table.png")
            # Wortschatz
            await pg.goto(B+"de/vocabulary/"); await pg.wait_for_timeout(1200)
            print(tag,"flashcards:",await pg.locator("#total").inner_text(),"cards | chip:",(await pg.locator(".vtop").inner_text()).replace("\n"," ")[:90])
            if await pg.locator("#showbtn").count(): await pg.click("#showbtn"); await pg.wait_for_timeout(80); await pg.locator(".rate button.good").click(); await pg.wait_for_timeout(80)
            print(tag,"de-voc-srs keys:",await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('de-voc-srs')||'{}')).length"),"| ru voc-srs:",await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('voc-srs')||'{}')).length"))
            # hubs and language switch
            await pg.goto(B+"de/"); await pg.wait_for_timeout(500)
            await pg.click('.tabs [data-tab="grammar"]'); await pg.wait_for_timeout(200)
            print(tag,"German hub: lines",await pg.locator("#gram a.lc").count(),"| continue:",(await pg.locator("#hero .ht b").inner_text()),"| suggestions:",await pg.locator("#sugs li").count())
            await pg.screenshot(path=f"/tmp/de-hub-{tag}.png",full_page=True)
            await pg.select_option('#langsel','ru'); await pg.wait_for_timeout(600)
            print(tag,"switch to Russian ->",pg.url.replace(B,'/'))
            await pg.select_option('#langsel','de'); await pg.wait_for_timeout(600)
            await pg.goto(B); await pg.wait_for_timeout(500)
            print(tag,"opening the app root after choosing Deutsch ->",pg.url.replace(B,'/'))
            print(tag,"errors",errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
