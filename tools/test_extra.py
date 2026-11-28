import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        # der/die/das
        await pg.goto(B+"de/genus/"); await pg.wait_for_timeout(400)
        ok=0
        for i in range(20):
            x=await pg.evaluate("window.__gr.noun()")
            g=x['g'] if i%4 else {'m':'f','f':'n','n':'m'}[x['g']]
            await pg.click(f'.art[data-g="{g}"]'); await pg.wait_for_timeout(120)
            if i==1: await pg.screenshot(path="/tmp/g-wrong.png")
            if await pg.locator('#next').count(): await pg.click('#next')
            else: await pg.wait_for_timeout(700)
            await pg.wait_for_timeout(80)
        print("genus end:", (await pg.locator('#card .big').inner_text()), "| known:", await pg.evaluate("Object.values(JSON.parse(localStorage.getItem('de-genus-box'))).length"), "| logged today:", await pg.evaluate("JSON.stringify(Object.values(JSON.parse(localStorage.getItem('gr-log')||'{}'))[0])"))
        # weekly review, both languages
        for u in ["review/","de/review/"]:
            await pg.goto(B+u); await pg.wait_for_timeout(500)
            print(u, "| this week:", (await pg.locator('#week .nums4').inner_text()).replace("\n"," ")[:90], "| plan items:", await pg.locator('#plan li').count())
        await pg.screenshot(path="/tmp/rev.png", full_page=True)
        # dark mode
        await pg.goto(B+"profile/"); await pg.wait_for_timeout(400)
        await pg.click('.themepick button[data-th="dark"]'); await pg.wait_for_timeout(100)
        await pg.goto(B+"cases/"); await pg.wait_for_timeout(400)
        print("dark on another page:", await pg.evaluate("document.documentElement.dataset.theme"), "| bg:", await pg.evaluate("getComputedStyle(document.body).backgroundColor"))
        await pg.screenshot(path="/tmp/dark1.png")
        await pg.goto(B+"?ru"); await pg.wait_for_timeout(400); await pg.screenshot(path="/tmp/dark2.png")
        await pg.goto(B+"grammar/"); await pg.wait_for_timeout(400); await pg.screenshot(path="/tmp/dark3.png")
        await pg.goto(B+"profile/"); await pg.click('.themepick button[data-th="auto"]')
        print("errors", e); await b.close()
asyncio.run(main())
