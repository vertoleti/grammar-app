import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x))); pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
        for lang,u in [("ru","phrases/"),("de","de/phrases/")]:
            await pg.goto(B+u); await pg.wait_for_timeout(500)
            print(lang,"situations:", await pg.locator("ul.tl li").count())
            await pg.locator("ul.tl li a").first.click(); await pg.wait_for_timeout(300)
            print(lang,"phrases:", await pg.locator(".plist li").count(), "| play buttons:", await pg.locator('.plist [data-act="say"]').count())
            await pg.locator('.plist [data-act="card"]').first.click(); await pg.wait_for_timeout(100)
            key="de-voc-custom" if lang=="de" else "voc-custom"
            print(lang,"saved card:", await pg.evaluate(f"JSON.parse(localStorage.getItem('{key}')||'[]').map(c=>c.term+' = '+c.meaning).slice(-1)"))
            if lang=="de": await pg.screenshot(path="/tmp/pb-p.png")
            await pg.click('[data-tab="d"]'); await pg.wait_for_timeout(200)
            print(lang,"dialogue lines:", await pg.locator(".dlg li").count(), "| mine:", await pg.locator(".dlg li.me").count())
            await pg.click('[data-act="role"]'); await pg.wait_for_timeout(200)
            print(lang,"hidden in role-play:", await pg.locator(".dlg .hid").count())
            await pg.locator(".dlg .hid").first.click(); await pg.wait_for_timeout(100)
            print(lang,"after reveal:", await pg.locator(".dlg .hid").count())
            if lang=="de": await pg.screenshot(path="/tmp/pb-d.png")
            await pg.click('[data-tab="x"]'); await pg.wait_for_timeout(200)
            for i in range(8):
                d=await pg.evaluate("window.__gr.drill()"); q=d["qs"][d["n"]]
                await pg.locator(f'.opt[data-k="{q["i"]}"]').click(); await pg.wait_for_timeout(60)
                await pg.click('[data-act="next"]'); await pg.wait_for_timeout(60)
            print(lang,"drill result:", (await pg.locator(".xdone").inner_text()).replace("\n"," "))
            if lang=="de": await pg.screenshot(path="/tmp/pb-x.png")
            await pg.goto(B+u); await pg.wait_for_timeout(300)
            print(lang,"list badge:", await pg.locator("ul.tl li .up").first.inner_text())
        await pg.goto(B+"de/"); await pg.wait_for_timeout(800)
        print("hub mentions Redemittel:", await pg.evaluate("document.body.innerText.includes('Redemittel')"), "Lesen:", await pg.evaluate("document.body.innerText.includes('Lesen')"))
        print("errors",e); await b.close()
asyncio.run(main())
