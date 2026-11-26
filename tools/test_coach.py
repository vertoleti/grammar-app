import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":1280,"height":900})
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto(B); await pg.wait_for_timeout(400)
        print("FRESH level:", (await pg.locator(".big").inner_text()).replace("\n"," "))
        print("FRESH sugs:", [t.split("\n")[1] for t in await pg.locator(".sug").all_inner_texts()])
        await pg.screenshot(path="/tmp/c-fresh.png", full_page=True)
        # first visit to cases: default topic is Recommended; topic hidden before answering
        await pg.goto(B+"cases/"); await pg.wait_for_timeout(400)
        print("default topic pressed:", await pg.get_attribute("#t-smart","aria-pressed"))
        print("meta before answer:", await pg.locator("#card .meta span").first.inner_text())
        await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(80)
        await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(200)
        print("meta after answer:", await pg.locator("#card .meta span").first.inner_text())
        # simulate: all A1 topics mastered, genitive weak
        await pg.evaluate("""()=>{const s={place:{n:12,ok:12,r:'111111111111',t:Date.now()},object:{n:12,ok:11,r:'111111111110',t:Date.now()},gen:{n:8,ok:3,r:'01001001',t:Date.now()}};localStorage.setItem('cases-stats',JSON.stringify(s));localStorage.setItem('gr-level',JSON.stringify('A1'));localStorage.setItem('cases-prefs',JSON.stringify({topic:'smart',mode:'pick'}))}""")
        await pg.goto(B); await pg.wait_for_timeout(200); await pg.goto(B+"cases/#smart"); await pg.wait_for_timeout(400)
        await pg.click("#n-20"); await pg.wait_for_timeout(300)
        info=await pg.evaluate("""()=>{const r=window.GRCoach.smartPick('cases',window.EXERCISE.items,20,new Set(),'A1');const c={};r.picks.forEach(k=>{const q=window.EXERCISE.items[k];c[q.t+' '+q.lv]=(c[q.t+' '+q.lv]||0)+1});return {frontier:r.frontier,counts:c}}""")
        print("smart A1 with A1 mastered ->", json.dumps(info, ensure_ascii=False))
        print("coach line:", await pg.locator(".coachline").first.inner_text() if await pg.locator(".coachline").count() else "(none)")
        print("topic list states:", await pg.evaluate("[...document.querySelectorAll('#topics button[data-st]')].map(b=>b.dataset.t+':'+b.dataset.st).join(' ')"))
        # play the round to the end and read the report
        await pg.click("#n-5"); await pg.wait_for_timeout(300)
        for i in range(5):
            await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(50)
            await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(50)
            await pg.click("#next"); await pg.wait_for_timeout(230)
        print("REPORT:", (await pg.locator(".mlist").inner_text()).replace("\n"," | "))
        print("NEXT:", await pg.locator("#card .coachline").last.inner_text(), "| buttons:", await pg.locator("#card .btn").all_inner_texts())
        await pg.screenshot(path="/tmp/c-report.png", full_page=False)
        # home page with progress
        await pg.goto(B); await pg.wait_for_timeout(400)
        print("HOME level:", (await pg.locator(".big").inner_text()).replace("\n"," "), "|", await pg.locator(".lvlcard p").last.inner_text())
        print("HOME sugs:", [t.replace("\n"," / ") for t in await pg.locator(".sug").all_inner_texts()])
        await pg.screenshot(path="/tmp/c-home.png", full_page=True)
        # new exercises
        for ex in ["prep","compare"]:
            await pg.goto(B+ex+"/"); await pg.wait_for_timeout(400)
            await pg.click("#t-all"); await pg.wait_for_timeout(200)
            await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(80)
            await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(200)
            print(ex, "gap after answer:", await pg.locator(".gap").inner_text(), "| verdict:", await pg.locator(".sum .verdict").first.inner_text())
        print("errors", errs)
        await b.close()
asyncio.run(main())
