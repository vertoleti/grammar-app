import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":393,"height":852},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        await pg.goto(B+"de/"); await pg.wait_for_timeout(800)
        # mix step
        await pg.locator('#sess .step').nth(1).click(); await pg.wait_for_timeout(800)
        for i in range(40):
            if await pg.locator("#again").count(): break
            if await pg.locator("#next").count()==0: await pg.locator('#card .opt:not([aria-disabled="true"])').first.click(); await pg.wait_for_timeout(120)
            else: await pg.click("#next"); await pg.wait_for_timeout(450)
        print("mix end:", (await pg.locator(".sessnext").inner_text()).replace("\n"," | "))
        await pg.screenshot(path="/tmp/sn1.png")
        await pg.click(".sessgo"); await pg.wait_for_timeout(1200)
        print("went to:", pg.url.replace(B,'/'))
        for i in range(10):
            q=await pg.evaluate("window.__gr.q()"); await pg.locator(f'.opt[data-v="{q["a"]}"]').first.click(); await pg.wait_for_timeout(100); await pg.click("#next"); await pg.wait_for_timeout(100)
        print("cloze end:", (await pg.locator(".sessnext").inner_text()).replace("\n"," | "))
        await pg.click(".sessgo"); await pg.wait_for_timeout(800)
        print("went to:", pg.url.replace(B,'/'))
        t=await pg.evaluate("window.__gr.texts().find(x=>x.id===decodeURIComponent(location.hash.slice(3)))")
        for i,q in enumerate(t['q']): await pg.locator(f'.opt[data-q="{i}"][data-k="{q["a"]}"]').click(); await pg.wait_for_timeout(80)
        await pg.wait_for_timeout(200)
        print("reading end:", (await pg.locator(".sessnext").inner_text()).replace("\n"," | "))
        await pg.screenshot(path="/tmp/sn2.png", full_page=True)
        # speaking without recognition in headless: mode?
        await pg.goto(B+"de/reading/#t=de-a1-familie"); await pg.wait_for_timeout(500)
        print("speech mode:", await pg.evaluate("GRSpeech.mode()"))
        print("errors",e); await b.close()
asyncio.run(main())
