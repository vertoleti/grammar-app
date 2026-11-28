import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
WIK={"de":[{"partOfSpeech":"Noun","language":"German","definitions":[{"definition":"<a>house</a>, building"},{"definition":"home"}]}]}
WIKFORM={"de":[{"partOfSpeech":"Noun","language":"German","definitions":[{"definition":"dative plural of <a>Haus</a>"}]}]}
MM={"responseData":{"translatedText":"family"},"matches":[{"translation":"family","quality":"80"},{"translation":"the family","quality":"70"}]}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":393,"height":852},device_scale_factor=2,is_mobile=True,has_touch=True)
        async def wik(route):
            u=route.request.url
            body=WIKFORM if 'H%C3%A4usern' in u or 'Häusern' in u else WIK
            await route.fulfill(status=200,content_type="application/json",body=json.dumps(body),headers={"Access-Control-Allow-Origin":"*"})
        async def mm(route): await route.fulfill(status=200,content_type="application/json",body=json.dumps(MM),headers={"Access-Control-Allow-Origin":"*"})
        await c.route("https://en.wiktionary.org/**",wik); await c.route("https://api.mymemory.translated.net/**",mm)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x)))
        await pg.goto(B+"de/reading/#t=de-a1-familie"); await pg.wait_for_timeout(700)
        box=await pg.evaluate("""(()=>{const s=document.querySelector('.rtext .sent');const w=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const i=n.textContent.indexOf('heiße');if(i>=0){const r=document.createRange();r.setStart(n,i+1);r.setEnd(n,i+2);const b=r.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}}}})()""")
        await pg.mouse.click(box["x"],box["y"]); await pg.wait_for_timeout(1200)
        print("word:", await pg.locator(".lk h3").inner_text(), "| chips:", await pg.locator(".lk .lk-chip").all_inner_texts())
        await pg.click('.lk [data-ext="next"]'); await pg.wait_for_timeout(1000)
        print("phrase:", await pg.locator(".lk h3").inner_text(), "| marked:", await pg.locator("mark.lk-sel").count())
        await pg.locator(".lk .lk-chip").first.click(); print("meaning filled:", await pg.locator("#lkm").input_value())
        await pg.screenshot(path="/tmp/lk.png")
        await pg.click(".lk .go"); await pg.wait_for_timeout(200)
        cards=await pg.evaluate("JSON.parse(localStorage.getItem('de-voc-custom')||'[]')")
        print("card:", [(x['term'],x['meaning'],x['kind'],x['ex'][:30]) for x in cards])
        # tap-to-extend
        await pg.mouse.click(box["x"],box["y"]); await pg.wait_for_timeout(500)
        await pg.click('.lk [data-ext="tap"]')
        box2=await pg.evaluate("""(()=>{const s=document.querySelector('.rtext .sent');const w=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const i=n.textContent.indexOf('Jonas');if(i>=0){const r=document.createRange();r.setStart(n,i+1);r.setEnd(n,i+2);const b=r.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}}}})()""")
        await pg.mouse.click(box2["x"],box2["y"]); await pg.wait_for_timeout(600)
        print("tap-extended:", await pg.locator(".lk h3").inner_text())
        await pg.click(".lk .x")
        # mark as read
        await pg.click('[data-act="markread"]'); await pg.wait_for_timeout(200)
        print("read:", (await pg.locator(".rdone").inner_text()).replace("\n"," | "))
        await pg.goto(B+"de/reading/"); await pg.wait_for_timeout(400)
        print("badge:", await pg.locator(".eps li.done, ul.tl li .up").first.inner_text() if await pg.locator("ul.tl li .up").count() else "-")
        # dictionary add suggestions with a form-of lemma
        await pg.goto(B+"de/dictionary/"); await pg.wait_for_timeout(800)
        await pg.click("#dadd summary"); await pg.fill("#dat","Häusern"); await pg.wait_for_timeout(1500)
        print("dict sugs:", (await pg.locator("#dsug").inner_text()).replace("\n"," | "))
        # flashcards add suggestions
        await pg.goto(B+"de/vocabulary/#settings"); await pg.wait_for_timeout(1200)
        await pg.fill("#at","Familie"); await pg.wait_for_timeout(1500)
        print("flash sugs:", (await pg.locator("#asug").inner_text()).replace("\n"," | "))
        print("errors",e); await b.close()
asyncio.run(main())
