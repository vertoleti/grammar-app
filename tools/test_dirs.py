import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":393,"height":852},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        await pg.goto(B+"de/vocabulary/"); await pg.wait_for_timeout(1000)
        q=await pg.evaluate("(()=>{const s=window.__fc;return 0})()")
        await pg.goto(B+"de/vocabulary/#study"); await pg.wait_for_timeout(800)
        print("first card:", await pg.locator(".fc-meta").inner_text())
        await pg.click(".fc-show"); await pg.wait_for_timeout(200)
        print("recognise intervals:", [t.replace("\n"," ") for t in await pg.locator(".fc-rate").all_inner_texts()])
        # make der Tisch recognisable (due in 4 days) -> its recall card unlocks
        await pg.evaluate("localStorage.setItem('de-voc-srs', JSON.stringify({'de-wrd-0001|r':{q:'review',s:0,ease:2.5,ivl:4,lap:0,reps:3,due:Date.now()+4*864e5,m:Date.now()-864e5}})); localStorage.setItem('de-voc-settings', JSON.stringify({type:true}))")
        await pg.goto(B+"de/vocabulary/"); await pg.wait_for_timeout(900)
        print("home note:", await pg.locator(".fc-main > .fc-note").first.inner_text())
        await pg.goto(B+"de/vocabulary/#study"); await pg.wait_for_timeout(800)
        seen=None
        for i in range(6):
            meta=await pg.locator(".fc-meta").inner_text(); print("  iter",i,meta.replace("\n"," "), await pg.evaluate("window.__fc.state().cur"))
            if "recall" in meta: seen=meta; break
            await pg.click(".fc-show"); await pg.wait_for_timeout(100); await pg.click(".fc-rate.good"); await pg.wait_for_timeout(150)
        print("recall card appears:", seen and seen.replace("\n"," "), "| front:", (await pg.locator(".fc-front").inner_text()).replace("\n"," "))
        await pg.fill("#fans","Tisch"); await pg.click("#ftype button"); await pg.wait_for_timeout(300)
        print("typed:", await pg.locator(".fc-typed").inner_text(), "| suggested:", await pg.locator(".fc-rate.sug b").inner_text())
        print("recall intervals:", [t.replace("\n"," ") for t in await pg.locator(".fc-rate").all_inner_texts()])
        await pg.screenshot(path="/tmp/recall.png")
        await pg.click(".fc-rate.good"); await pg.wait_for_timeout(200)
        await pg.goto(B+"de/vocabulary/#stats"); await pg.wait_for_timeout(500)
        print("stats:", (await pg.locator(".fc-dir").inner_text()).replace("\n"," | ")[:200])
        await pg.goto(B+"de/vocabulary/#card=de-wrd-0001"); await pg.wait_for_timeout(800)
        print("card rows:", (await pg.locator("table.plain").inner_text()).replace("\n"," | "))
        print("errors",e); await b.close()
asyncio.run(main())
