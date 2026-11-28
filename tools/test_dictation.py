import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        for u in ["reading/#t=ru-a1-family","de/reading/#t=de-a1-familie"]:
            await pg.goto(B+u); await pg.wait_for_timeout(600)
            await pg.click('[data-act="dict"]'); await pg.wait_for_timeout(200)
            sents=await pg.evaluate("(()=>{const t=window.__gr.texts()[0];return t.p.map(x=>x[0])})()")
            first=sents[0].split('. ')[0]+'.'
            words=first.split(); typed=' '.join(words[:-1]+['xxx'])
            await pg.fill("#dtype", typed.lower().replace('ä','ae')); await pg.click('[data-act="dcheck"]'); await pg.wait_for_timeout(150)
            print(u.split('#')[0], "typed:", typed, "→", (await pg.locator(".dres").inner_text()), "|", await pg.locator(".dict-box .note").inner_text())
            if u.startswith("de"): await pg.screenshot(path="/tmp/dict2.png")
            for i in range(20):
                if await pg.locator('[data-act="dskip"]').count()==0 and await pg.locator('[data-act="dnext"]').count()==0: break
                await pg.locator('[data-act="dnext"],[data-act="dskip"]').first.click(); await pg.wait_for_timeout(60)
            print("  end:", (await pg.locator(".dict-box").inner_text()).replace("\n"," ")[:80])
        print("errors",e); await b.close()
asyncio.run(main())
