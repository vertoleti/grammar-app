import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for name,vp in [("ip",{"width":393,"height":852}),("ipad",{"width":820,"height":1180})]:
            c=await b.new_context(viewport=vp,device_scale_factor=2,is_mobile=True,has_touch=True)
            for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
            pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
            await pg.goto(B+"de/#words"); await pg.wait_for_timeout(800)
            box=await pg.locator(".tabs").bounding_box()
            print(name,"tab bar top:",round(box["y"]),"of",vp["height"],"| anchored bottom:", abs(box["y"]+box["height"]-vp["height"])<2)
            await pg.screenshot(path=f"/tmp/u-hub-{name}.png")
            await pg.evaluate("window.scrollTo(0,400)"); await pg.wait_for_timeout(200)
            box=await pg.locator(".tabs").bounding_box(); print(name,"after scroll anchored:", abs(box["y"]+box["height"]-vp["height"])<2)
            if name=="ip":
                await pg.select_option("#langsel","ru"); await pg.wait_for_timeout(800); print("dropdown ->", pg.url.replace(B,'/'))
                await pg.goto(B+"de/vocabulary/"); await pg.wait_for_timeout(1200)
                await pg.screenshot(path="/tmp/u-voc.png")
                term=await pg.locator(".face .term").inner_text()
                await pg.locator(".face").click(); await pg.wait_for_timeout(450)
                print("single tap shows answer:", await pg.locator(".rate").count()>0)
                await pg.locator(".face").click(position={"x":40,"y":40}); await pg.wait_for_timeout(100); await pg.locator(".face").click(position={"x":40,"y":40}); await pg.wait_for_timeout(700)
                srs=await pg.evaluate("JSON.parse(localStorage.getItem('de-voc-srs')||'{}')")
                print("double tap on", term, "→", [(k, v.get('reps'), v.get('q')) for k,v in srs.items()][:2], "| next card:", await pg.locator(".face .term, .face .mean").first.inner_text())
                term2=await pg.locator(".face .term, .face .mean").first.inner_text()
                await pg.locator(".face").dblclick(position={"x":40,"y":40}); await pg.wait_for_timeout(700)
                print("double tap before turning:", len(await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('de-voc-srs')||'{}'))")), "cards rated")
            print("errors",e); await c.close()
        await b.close()
asyncio.run(main())
