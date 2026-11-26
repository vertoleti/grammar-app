import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True,accept_downloads=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.evaluate("1"); await pg.goto(B+"vocabulary/"); await pg.evaluate("localStorage.setItem('voc-settings',JSON.stringify({levels:['A1']}))")
        # gov line
        await pg.goto(B+"gov/"); await pg.wait_for_timeout(400)
        print("gov count:", await pg.locator("#count").inner_text())
        # tap a word in the sentence: find a text word in .ru
        async def tapword(word_pred):
            box=await pg.evaluate("""(pred)=>{const p=document.querySelector('#card .ru');const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let n;
              while(n=w.nextNode()){const m=n.textContent.match(/[А-Яа-яЁё]{3,}/);if(m&&!n.parentElement.closest('.gap')){const r=document.createRange();r.setStart(n,m.index+1);r.setEnd(n,m.index+2);const b=r.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,w:m[0]}}}return null}""", None)
            await pg.mouse.click(box["x"],box["y"]); await pg.wait_for_timeout(700); return box["w"]
        w=await tapword(None)
        txt=await pg.locator(".lk").inner_text()
        print("tapped:",w,"| popover:",txt.replace("\n"," | ")[:200])
        await pg.screenshot(path="/tmp/b4-lookup.png")
        if await pg.locator(".lk .add[data-id]:not(.done)").count():
            await pg.locator(".lk .add[data-id]:not(.done)").first.click(); await pg.wait_for_timeout(100)
            print("pinned:", await pg.evaluate("Object.entries(JSON.parse(localStorage.getItem('voc-srs')||'{}')).filter(([k,v])=>v.pin).map(([k])=>k)"))
        elif await pg.locator(".lk form").count():
            await pg.fill(".lk input","test meaning"); await pg.locator(".lk form button").click(); await pg.wait_for_timeout(100)
            print("custom:", await pg.evaluate("localStorage.getItem('voc-custom')"))
        # custom word path: inflected word not in deck — use sentences find mistake? just call on a nonsense-ish word via a real page word
        await pg.goto("about:blank"); await pg.goto(B+"cases/"); await pg.wait_for_timeout(400)
        await pg.evaluate("""()=>{const p=document.querySelector('#card .ru');p.insertAdjacentHTML('beforeend',' <span>фыва</span>')}""")
        bb=await pg.evaluate("""()=>{const s=[...document.querySelectorAll('#card .ru span')].pop();const r=s.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}""")
        await pg.mouse.click(bb["x"],bb["y"]); await pg.wait_for_timeout(500)
        await pg.fill(".lk input","asdf"); await pg.locator(".lk form button").click(); await pg.wait_for_timeout(100)
        print("custom card:", await pg.evaluate("JSON.parse(localStorage.getItem('voc-custom')||'[]').map(c=>c.term+'='+c.meaning)"))
        # tap outside closes
        await pg.mouse.click(5,400); await pg.wait_for_timeout(100); print("closed:", await pg.locator(".lk").is_hidden())
        # vocabulary: pinned + custom cards appear although level filter is A1
        await pg.goto(B+"vocabulary/"); await pg.wait_for_timeout(1200)
        seen=set()
        for i in range(6):
            t=await pg.locator(".face .term, .face .mean").first.inner_text(); seen.add(t)
            if await pg.locator("#showbtn").count(): await pg.click("#showbtn"); await pg.wait_for_timeout(80)
            if i==0: print("example listen button:", await pg.locator('[data-act="sayex"]').count())
            await pg.locator(".rate button.good").click(); await pg.wait_for_timeout(80)
        print("cards seen:", seen)
        # export
        await pg.click("#exportbox summary")
        async with pg.expect_download() as d: await pg.click("#xall")
        dl=await d.value; path=await dl.path(); body=open(path,encoding='utf8').read().split('\n')
        print("export file:", dl.suggested_filename, "| lines:", len([l for l in body if l and not l.startswith('#')]), "| cols ok:", all(len(l.split('\t'))==25 for l in body if l and not l.startswith('#')))
        print("sample:", [l.split('\t')[0]+' / '+l.split('\t')[24] for l in body if l and not l.startswith('#')][:3])
        await pg.click("#xhard"); await pg.wait_for_timeout(100); print("hard msg:", await pg.locator("#xmsg").inner_text()[:60] if False else (await pg.locator("#xmsg").inner_text())[:70])
        print("errors",errs); await b.close()
asyncio.run(main())
