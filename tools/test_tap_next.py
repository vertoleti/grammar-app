import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        for u in ["cases/","de/cases/","verbs-of-motion/","mix/"]:
            await pg.goto(B+u); await pg.wait_for_timeout(600)
            before=await pg.locator("#card .meta span").last.inner_text()
            opt=pg.locator("#card .opt").first
            # two-step pages: keep tapping the first enabled option until marked
            for _ in range(2):
                if await pg.locator("#next").count(): break
                await pg.locator('#card .opt:not([aria-disabled="true"])').first.click(); await pg.wait_for_timeout(150)
            fast=await pg.locator("#next").count()
            await pg.locator('#card .opt[aria-disabled="true"]').last.click(force=True); await pg.wait_for_timeout(100)
            same=await pg.locator("#card .meta span").last.inner_text()
            await pg.wait_for_timeout(450)
            await pg.locator('#card .opt[aria-disabled="true"]').last.click(force=True); await pg.wait_for_timeout(250)
            after=await pg.locator("#card .meta span").last.inner_text()
            print(u, before, "| marked:", bool(fast), "| quick double-tap ignored:", same==before, "| tap again →", after)
        await pg.goto(B+"de/genus/"); await pg.wait_for_timeout(500)
        n=await pg.evaluate("window.__gr.noun()"); wrong=[g for g in "mfn" if g!=n["g"]][0]
        await pg.click(f'.art[data-g="{wrong}"]'); await pg.wait_for_timeout(500)
        i1=await pg.evaluate("window.__gr.noun().w"); await pg.click(f'.art[data-g="{wrong}"]', force=True); await pg.wait_for_timeout(200)
        print("genus wrong then tap again → new noun:", (await pg.evaluate("window.__gr.noun().w"))!=n["w"])
        await pg.goto(B+"de/phrases/#s=doctor"); await pg.wait_for_timeout(400); await pg.click('[data-tab="x"]'); await pg.wait_for_timeout(200)
        await pg.locator(".pb .opt").first.click(); await pg.wait_for_timeout(500); await pg.locator(".pb .opt").first.click(force=True); await pg.wait_for_timeout(200)
        print("phrase drill question index:", await pg.evaluate("window.__gr.drill().n"))
        print("errors",e); await b.close()
asyncio.run(main())
