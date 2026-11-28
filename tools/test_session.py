import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        await pg.goto(B+"de/"); await pg.wait_for_timeout(800)
        print("session:", await pg.locator("#sess .shead span").inner_text(), [t.split("\n")[1] for t in await pg.locator("#sess .step").all_inner_texts()])
        await pg.screenshot(path="/tmp/sess.png", full_page=True)
        # do the mix via the session link
        await pg.click("#sess .hbtn"); await pg.wait_for_timeout(700)
        print("opened:", pg.url.replace(B,'/'), "| study screen:", await pg.locator("#fcard").count()>0)
        await pg.goto(B+"de/mix/?s=1"); await pg.wait_for_timeout(700)
        for i in range(30):
            if await pg.locator("#again").count(): break
            if await pg.locator("#next").count()==0:
                await pg.locator('#card .opt:not([aria-disabled="true"])').first.click(); await pg.wait_for_timeout(120)
            else:
                await pg.click("#next"); await pg.wait_for_timeout(450)
        print("mix finished:", await pg.locator("#again").count()>0, "| done key:", await pg.evaluate("localStorage.getItem('de-done-de-mix')"))
        await pg.click(".home a"); await pg.wait_for_timeout(800)
        print("back at:", pg.url.replace(B,'/'), "| session:", await pg.locator("#sess .shead span").inner_text(), "| tab today visible:", await pg.locator("#t-today").is_visible())
        print("errors",e); await b.close()
asyncio.run(main())
