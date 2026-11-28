import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        for u,qs in [("?ru",["genitive","вокзал","aspect","кофе"]),("de/",["Dativ","Bahnhof","weil","Arzt"])]:
            await pg.goto(B+u); await pg.wait_for_timeout(700)
            await pg.click("#sbtn"); await pg.wait_for_timeout(200)
            for q in qs:
                await pg.fill("#sq",q); await pg.wait_for_timeout(1200)
                groups=await pg.locator("#sres h3").all_inner_texts()
                first=await pg.locator("#sres .nx").first.inner_text() if await pg.locator("#sres .nx").count() else "-"
                print(u,q,"→",[g.replace("\n"," ") for g in groups],"| first:",first.split("\n")[0])
            if u=="de/": await pg.fill("#sq","Dativ"); await pg.wait_for_timeout(500); await pg.screenshot(path="/tmp/srch.png")
            await pg.click("#sclose")
        print("errors",e); await b.close()
asyncio.run(main())
