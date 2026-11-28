import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream"])
        c=await b.new_context(viewport={"width":393,"height":852},device_scale_factor=2,is_mobile=True,has_touch=True,permissions=["microphone"])
        await c.add_init_script("delete window.webkitSpeechRecognition; delete window.SpeechRecognition;")
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x))); pg.on("dialog",lambda d:(e.append("DIALOG "+d.message), asyncio.ensure_future(d.dismiss())))
        await pg.goto(B+"de/reading/#t=de-c1-stille"); await pg.wait_for_timeout(600)
        print("mode:", await pg.evaluate("GRSpeech.mode()"))
        await pg.click('[data-act="speak"]'); await pg.wait_for_timeout(200)
        print("note:", await pg.locator(".reader > p.note").first.inner_text())
        m=pg.locator(".mic").first
        await m.click(); await pg.wait_for_timeout(1500)
        print("recording:", await m.inner_text(), "|", await pg.locator(".sp-msg").first.inner_text())
        await m.click(); await pg.wait_for_timeout(800)
        print("panel:", await pg.locator(".sp-rec").first.inner_text())
        await pg.screenshot(path="/tmp/rec.png")
        await pg.click('.sp-rec [data-sp="ok"]'); await pg.wait_for_timeout(200)
        print("after ok:", await m.inner_text(), "| speaking stats:", await pg.evaluate("JSON.stringify(GRCoach.stats('de-read').speaking||null)"))
        await pg.goto(B+"de/phrases/#s=doctor"); await pg.wait_for_timeout(500)
        m=pg.locator('.plist [data-act="mic"]').first
        await m.click(); await pg.wait_for_timeout(1200); await m.click(); await pg.wait_for_timeout(800)
        print("phrase panel:", await pg.locator(".plist .sp-rec").first.inner_text())
        print("errors",e); await b.close()
asyncio.run(main())
