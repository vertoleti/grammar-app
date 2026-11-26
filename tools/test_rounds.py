import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def setting(pg, sel, phone):
    if phone:
        await pg.click(".setbtn"); await pg.wait_for_timeout(450)
    await pg.click(sel); await pg.wait_for_timeout(150)
    if phone:
        await pg.click(".sheethead .done"); await pg.wait_for_timeout(450)
async def run_round(pg):
    n=0
    while not await pg.locator("#again").count():
        await pg.locator('#card button[data-act="a"], #card button[data-act="v"]').first.click(); await pg.wait_for_timeout(50)
        if await pg.locator('#ans').count(): await pg.fill('#ans','тест'); await pg.press('#ans','Enter')
        else: await pg.locator('#card button[data-act="f"]').first.click()
        await pg.wait_for_timeout(50); await pg.click('#next'); await pg.wait_for_timeout(220); n+=1
        if n>60: raise Exception('loop')
    return n
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        errs=[]
        for phone,vp in [(True,{"width":390,"height":844}),(False,{"width":1280,"height":860})]:
            ctx=await b.new_context(viewport=vp,device_scale_factor=2 if phone else 1,has_touch=phone,is_mobile=phone)
            for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
            pg=await ctx.new_page(); pg.on("pageerror",lambda e:errs.append(str(e)))
            for ex in ['cases','aspect','numbers','advanced','verbs-of-motion','prep','compare']:
                await pg.goto(B+ex+"/"); await pg.wait_for_timeout(400)
                await setting(pg,'#n-5',phone); n5=await run_round(pg)
                await setting(pg,'#m-type',phone); await pg.click('#again'); await pg.wait_for_timeout(250); nt=await run_round(pg)
                await setting(pg,'#m-pick',phone)
                await setting(pg,'#n-all',phone); total=(await pg.locator('.track .cnt').text_content()) if await pg.locator('.track .cnt').count() else f"{await pg.locator('.track .st').count()} stations"
                await setting(pg,'#n-10',phone)
                chips=(await pg.locator('.sumchips').inner_text()).replace('\n',' | ') if phone else '(sidebar)'
                print('phone' if phone else 'desktop',ex,'5-round',n5,'typed',nt,total,'|',chips)
            await ctx.close()
        print('errors',errs); await b.close()
asyncio.run(main())
