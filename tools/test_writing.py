import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        for u,txt in [("writing/","Привет, Маша! В субботу я была на даче. Погода была отличная, мы гуляли в лесу. А как ты?"),("de/writing/","Hallo Lena! Am Samstag war ich am See. Das Wetter war super und wir sind geschwommen. Und wie war dein Wochenende?")]:
            await pg.goto(B+u); await pg.wait_for_timeout(500)
            print(u,"tasks:", await pg.locator("ul.tl li").count())
            await pg.locator("ul.tl li a").first.click(); await pg.wait_for_timeout(300)
            await pg.fill("#wt", txt); await pg.wait_for_timeout(700)
            print("  count:", await pg.locator("#wc").inner_text())
            await pg.reload(); await pg.wait_for_timeout(400)
            print("  draft kept:", (await pg.locator("#wt").input_value())[:20])
            await pg.click('[data-act="check"]'); await pg.wait_for_timeout(200)
            print("  result:", await pg.locator(".wres .verdict").inner_text(), "| hits:", await pg.locator(".wpts li.hit").count())
            if u.startswith("de"): await pg.screenshot(path="/tmp/wr.png", full_page=True)
            await pg.click('[data-act="done"]'); await pg.wait_for_timeout(150)
            await pg.goto(B+u); await pg.wait_for_timeout(300)
            print("  list badge:", await pg.locator("ul.tl li .up").first.inner_text())
        await pg.goto(B+"de/#reading"); await pg.wait_for_timeout(600)
        print("hub reading cards:", await pg.locator("#reading a.lc").all_inner_texts())
        print("errors",e); await b.close()
asyncio.run(main())
