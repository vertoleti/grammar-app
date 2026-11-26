import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for vp,mob in [({"width":390,"height":844},True),({"width":1280,"height":900},False)]:
            ctx=await b.new_context(viewport=vp,device_scale_factor=2,is_mobile=mob,has_touch=mob)
            for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
            pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
            tag="phone" if mob else "desktop"
            # --- translate: exact, reordered, wrong + override
            await pg.goto("about:blank"); await pg.goto(B+"sentences/#tr"); await pg.wait_for_timeout(400)
            ans=await pg.evaluate("window.__gr.answer()")
            await pg.fill("#ans",ans); await pg.press("#ans","Enter"); await pg.wait_for_timeout(150)
            v1=await pg.locator(".verdict").inner_text()
            await pg.click("#next"); await pg.wait_for_timeout(250)
            ans=await pg.evaluate("window.__gr.answer()"); w=ans.rstrip('.?!').split(' '); w=w[1:]+w[:1]
            await pg.fill("#ans"," ".join(w)); await pg.press("#ans","Enter"); await pg.wait_for_timeout(150)
            v2=await pg.locator(".verdict").inner_text()
            await pg.click("#next"); await pg.wait_for_timeout(250)
            await pg.fill("#ans","Я хочу кофе"); await pg.press("#ans","Enter"); await pg.wait_for_timeout(150)
            v3=await pg.locator(".verdict").inner_text(); diff=await pg.locator(".diff").inner_html()
            if not mob: await pg.screenshot(path="/tmp/b3-tr.png")
            await pg.click('[data-act="self"]'); await pg.wait_for_timeout(100)
            v4=await pg.locator(".verdict").inner_text()
            print(tag,"translate:",v1,"|",v2,"|",v3,"|",v4,"| diff has del/ins:", "<del>" in diff or "<ins>" in diff)
            # --- word order
            await pg.goto("about:blank"); await pg.goto(B+"sentences/#order"); await pg.wait_for_timeout(400)
            ans=await pg.evaluate("window.__gr.answer()")
            target=[x for x in ans.replace('.','').replace(',','').replace('?','').replace('!','').split(' ') if x not in ('—','–','-')]
            for i,wd in enumerate(target):
                tiles=pg.locator('.bank .tile:not([disabled])')
                n=await tiles.count(); done=False
                for k in range(n):
                    t=(await tiles.nth(k).inner_text()).strip()
                    if t.lower()==wd.lower(): await tiles.nth(k).click(); await pg.wait_for_timeout(40); done=True; break
                if not done: print("tile missing",wd)
            if mob: await pg.screenshot(path="/tmp/b3-order.png")
            await pg.click('[data-act="check"]'); await pg.wait_for_timeout(150)
            print(tag,"order:",await pg.locator(".verdict").inner_text())
            # --- find the mistake
            await pg.goto("about:blank"); await pg.goto(B+"sentences/#err"); await pg.wait_for_timeout(400)
            bad=await pg.evaluate("window.__gr.answer()")
            await pg.locator(".wtok").nth(bad).click(); await pg.wait_for_timeout(150)
            print(tag,"mistake:",await pg.locator(".verdict").inner_text())
            if mob: await pg.screenshot(path="/tmp/b3-err.png")
            # --- tables
            await pg.goto("about:blank"); await pg.goto(B+"tables/#noun"); await pg.wait_for_timeout(400)
            t=await pg.evaluate("window.__gr.table()"); bl=await pg.evaluate("window.__gr.blanks()")
            for i,c in enumerate(bl):
                r,k=map(int,c.split(':')); v=t["rows"][r]["cells"][k].split('/')[0]
                if i==0: v=v+"ы"
                await pg.fill(f'input[data-c="{c}"]',v)
            await pg.locator('#f button.btn.go').click(); await pg.wait_for_timeout(150)
            print(tag,"table:",await pg.locator(".verdict").inner_text(), "| ok cells", await pg.locator("td.c-ok").count(), "bad", await pg.locator("td.c-bad").count())
            await pg.screenshot(path=f"/tmp/b3-tab-{tag}.png")
            await pg.goto("about:blank"); await pg.goto(B+"tables/#pron"); await pg.wait_for_timeout(400)
            print(tag,"pronoun inputs:", await pg.locator("#card input").count())
            await pg.goto(B); await pg.wait_for_timeout(400)
            print(tag,"home skills cards:", await pg.locator('a.ex[href="sentences/"], a.ex[href="tables/"]').count())
            print(tag,"errors",errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
