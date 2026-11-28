import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        for lang,u in [("ru","cloze/"),("de","de/cloze/")]:
            await pg.goto(B+u); await pg.wait_for_timeout(1200)
            bad=0
            for i in range(10):
                q=await pg.evaluate("window.__gr.q()")
                if len(set(q['o']))<2 or q['a'] not in q['o']: bad+=1
                if i==0: print(lang, q['s'], q['o'], '→', q['a'])
                await pg.locator(f'.opt[data-v="{q["a"]}"]').first.click(); await pg.wait_for_timeout(120)
                if i==0 and lang=="de": await pg.screenshot(path="/tmp/cz.png")
                await pg.click("#next"); await pg.wait_for_timeout(100)
            print(lang,"bad items:",bad,"| result:",(await pg.locator(".xdone").inner_text()).replace("\n"," ")[:60])
        await pg.goto(B+"de/#words"); await pg.wait_for_timeout(700)
        print("hub words cards:", await pg.locator("#words a.lc").count())
        print("errors",e); await b.close()
asyncio.run(main())
