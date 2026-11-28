import asyncio
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def tap_word(pg, sel, word):
    box=await pg.evaluate("""([sel,word])=>{const root=document.querySelector(sel);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
      while(n=w.nextNode()){const i=n.textContent.indexOf(word);if(i>=0){const r=document.createRange();r.setStart(n,i+1);r.setEnd(n,i+2);const b=r.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}}}return null}""",[sel,word])
    await pg.mouse.click(box["x"],box["y"]); await pg.wait_for_timeout(700)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        c=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await c.route(h,lambda r:r.fulfill(status=200,body=""))
        pg=await c.new_page(); e=[]; pg.on("pageerror",lambda x:e.append(str(x))); pg.on("dialog",lambda d:asyncio.ensure_future(d.accept()))
        for lang,u in [("ru","reading/"),("de","de/reading/")]:
            await pg.goto(B+u); await pg.wait_for_timeout(500)
            print(lang,"library items:", await pg.locator("ul.tl li").count())
            await pg.locator("ul.tl li a").first.click(); await pg.wait_for_timeout(400)
            texts=await pg.evaluate("window.__gr.texts()"); t=texts[0]
            print(lang,"reader:", await pg.locator(".rtitle").inner_text(), "| sentences:", await pg.locator(".rtext .sent").count())
            for i,q in enumerate(t["q"]):
                await pg.locator(f'.opt[data-q="{i}"][data-k="{q["a"]}"]').click(); await pg.wait_for_timeout(80)
            print(lang,"questions:", await pg.locator("#qres").inner_text())
            await pg.click('[data-act="tr"]'); await pg.wait_for_timeout(150); print(lang,"translation paragraphs:", await pg.locator(".paraen").count())
            await pg.click('[data-act="speak"]'); await pg.wait_for_timeout(150); print(lang,"mic buttons:", await pg.locator(".mic").count())
            if lang=="de": await pg.screenshot(path="/tmp/read-de.png")
        # import a German text and add a word from it
        await pg.goto(B+"de/reading/"); await pg.wait_for_timeout(400)
        await pg.click("#imp summary"); await pg.fill("#it","Mein Artikel"); await pg.fill("#ix","Der Bürgermeister eröffnete gestern die neue Stadtbibliothek.\n\nSie hat sieben Stockwerke.")
        await pg.click("#impf button.go"); await pg.wait_for_timeout(500)
        print("imported reader:", await pg.locator(".rtitle").inner_text(), "| paragraphs:", await pg.locator(".rtext .para").count())
        await tap_word(pg, ".rtext", "Stadtbibliothek")
        print("popover:", (await pg.locator(".lk").inner_text()).replace("\n"," | ")[:120])
        await pg.select_option(".lk select","die"); await pg.fill(".lk input","city library"); await pg.locator(".lk form button").click(); await pg.wait_for_timeout(200)
        print("German custom cards:", await pg.evaluate("JSON.parse(localStorage.getItem('de-voc-custom')||'[]').map(c=>c.term+' = '+c.meaning)"))
        await tap_word(pg, ".rtext", "gestern")
        print("deck word:", (await pg.locator(".lk").inner_text()).replace("\n"," | ")[:100])
        await pg.goto(B+"de/vocabulary/"); await pg.wait_for_timeout(1200)
        print("in German flashcards:", await pg.evaluate("document.body.innerText.includes('die Stadtbibliothek')") or await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('de-voc-srs')||'{}')).some(k=>k.startsWith('de-my-'))"))
        # German exercise lookup
        await pg.goto(B+"de/cases/"); await pg.wait_for_timeout(500)
        txt=await pg.evaluate("(()=>{const p=document.querySelector('#card .ru').cloneNode(true);p.querySelectorAll('.gap').forEach(g=>g.remove());return p.textContent})()"); w=[x for x in txt.replace('.',' ').replace(',',' ').split() if len(x)>3 and x.isalpha()][0]
        await tap_word(pg, "#card .ru", w)
        print("exercise lookup on", w, ":", await pg.locator(".lk:not([hidden])").count())
        print("errors", e); await b.close()
asyncio.run(main())
