import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x))); pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
        for lang,u,q in [("ru","dictionary/","искать"),("de","de/dictionary/","bahnhof")]:
            await pg.goto(B+u); await pg.wait_for_timeout(1200)
            print(lang,"cards:", await pg.evaluate("window.__gr.cards().length"), "| rows:", await pg.locator(".dw").count(), "|", await pg.locator("#dcount").inner_text())
            await pg.fill("#dq",q); await pg.wait_for_timeout(400)
            print(lang,"search",q,"→", await pg.locator(".dw").count(), (await pg.locator(".dw").first.inner_text()).replace("\n"," | "))
            await pg.locator(".dw").first.click(); await pg.wait_for_timeout(150)
            await pg.click('[data-act="learn"]'); await pg.wait_for_timeout(150)
            print(lang,"after learn:", await pg.locator(".okline").inner_text())
            await pg.fill("#dq",""); await pg.wait_for_timeout(300)
            await pg.click('#dstat [data-st="learning"]'); await pg.wait_for_timeout(200)
            print(lang,"learning filter:", await pg.locator(".dw").count())
            await pg.click('#dstat [data-st="all"]'); await pg.click('#dlv [data-lv="B2"]'); await pg.wait_for_timeout(200)
            print(lang,"B2:", await pg.locator("#dcount").inner_text())
            await pg.click("#dadd summary"); await pg.fill("#dat","Testwort" if lang=="de" else "тестово"); await pg.fill("#dam","test word"); await pg.click("#daf button"); await pg.wait_for_timeout(800)
            print(lang,"mine:", await pg.locator(".dw").count(), (await pg.locator(".dw").first.inner_text()).replace("\n"," | "))
            await pg.click('#dlv [data-lv="all"]'); await pg.click('#dstat [data-st="all"]'); await pg.wait_for_timeout(200)
            if lang=="de":
                await pg.locator(".dw").nth(2).click(); await pg.wait_for_timeout(200); await pg.screenshot(path="/tmp/dict.png")
        print("errors",e); await b.close()
asyncio.run(main())
