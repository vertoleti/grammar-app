import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        # placement: answer all correctly up to B1, wrong at B2
        await pg.goto(B+"placement/"); await pg.wait_for_timeout(500)
        n=0
        while await pg.locator("#next").count() or await pg.locator('#card button[data-act="f"]').count():
            if not await pg.locator('#card button[data-act="f"]').count(): break
            lv=(await pg.locator("#card .meta span").first.inner_text()).strip()[:2]
            right=await pg.evaluate("(()=>{const t=document.querySelector('#card .ru, #card .gap');return null})()")
            # find correct form via engine data: choose button whose text equals full answer
            ans=await pg.evaluate("""(()=>{const k=[...document.querySelectorAll('#card button[data-act="f"]')].map(b=>b.textContent.trim().replace(/^\\d/,''));return k})()""")
            want=await pg.evaluate("window.__gr.answer()")
            btns=pg.locator('#card button[data-act="f"]')
            if lv in ("A1","A2","B1"):
                await btns.nth(ans.index(want)).click()
            else:
                await btns.nth((ans.index(want)+1)%len(ans)).click()
            await pg.wait_for_timeout(60); n+=1
            if n==8: await pg.screenshot(path="/tmp/b2-place.png")
            await pg.click("#next"); await pg.wait_for_timeout(200)
        print("placement questions:", n)
        print("result:", (await pg.locator("#card .big").inner_text()))
        await pg.screenshot(path="/tmp/b2-place-end.png", full_page=True)
        await pg.click("#accept"); await pg.wait_for_timeout(600)
        print("now at:", pg.url, "| gr-level:", await pg.evaluate("localStorage.getItem('gr-level')"),
              "| cases topics marked known:", await pg.evaluate("Object.values(JSON.parse(localStorage.getItem('cases-stats')||'{}')).filter(x=>x.placed).length"))
        # mix
        await pg.goto(B+"mix/"); await pg.wait_for_timeout(500)
        lines=set(); 
        await pg.screenshot(path="/tmp/b2-mix.png")
        for i in range(10):
            if await pg.locator('#card button[data-act="a"]').count():
                await pg.locator('#card button[data-act="a"]').first.click(); await pg.wait_for_timeout(60)
            await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(60)
            lines.add((await pg.locator("#card .meta span").first.inner_text()).split(":")[0])
            await pg.click("#next"); await pg.wait_for_timeout(200)
        print("mix lines seen:", lines)
        print("end screen has report:", await pg.locator(".mlist li").count())
        await pg.screenshot(path="/tmp/b2-mix-end.png", full_page=True)
        print("log:", await pg.evaluate("localStorage.getItem('gr-log')"))
        print("errors", errs); await b.close()
asyncio.run(main())
