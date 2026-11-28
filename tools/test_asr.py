import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream"])
        c=await b.new_context(viewport={"width":393,"height":852},is_mobile=True,has_touch=True,permissions=["microphone"])
        await c.add_init_script("delete window.webkitSpeechRecognition; delete window.SpeechRecognition;")
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        await pg.goto(B+"de/reading/#t=de-a1-familie"); await pg.wait_for_timeout(600)
        print("library loads:", await pg.evaluate("import(new URL('../../shared/vendor/transformers.min.js', location.href).href).then(m=>typeof m.pipeline+' '+typeof m.env)"))
        print("supported:", await pg.evaluate("GRASR.supported"), "| mode:", await pg.evaluate("GRSpeech.mode()"))
        await pg.click('[data-act="speak"]'); m=pg.locator(".mic").first
        await m.click(); await pg.wait_for_timeout(1200); await m.click(); await pg.wait_for_timeout(800)
        print("panel:", (await pg.locator(".sp-rec").first.inner_text()).replace("\n"," | "))
        await pg.click('.sp-rec [data-sp="dl"]'); await pg.wait_for_timeout(15000)
        print("after download attempt:", await pg.locator(".sp-msg").first.inner_text() if await pg.locator(".sp-msg").count() else "-", "| panel:", (await pg.locator(".sp-rec").first.inner_text()).replace("\n"," | ") if await pg.locator(".sp-rec").count() else "-")
        print("errors",e); await b.close()
asyncio.run(main())
