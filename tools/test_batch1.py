import asyncio, json
from playwright.async_api import async_playwright
B="http://localhost:8765/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx.route(h,lambda r:r.fulfill(status=200,body=""))
        # fake Supabase
        db={}
        async def sb(route):
            r=route.request; u=r.url
            if "/auth/v1/otp" in u: return await route.fulfill(status=200,body="{}",content_type="application/json")
            if "/auth/v1/verify" in u:
                body=json.loads(r.post_data)
                if body["token"]!="123456": return await route.fulfill(status=403,content_type="application/json",body=json.dumps({"msg":"Token has expired or is invalid"}))
                return await route.fulfill(status=200,content_type="application/json",body=json.dumps({"access_token":"A","refresh_token":"R","expires_in":3600,"user":{"id":"u1","email":body["email"]}}))
            if "/rest/v1/progress" in u and r.method=="GET":
                return await route.fulfill(status=200,content_type="application/json",body=json.dumps([{"data":db["u1"]}] if "u1" in db else []))
            if "/rest/v1/progress" in u and r.method=="POST":
                db["u1"]=json.loads(r.post_data)["data"]; return await route.fulfill(status=201,body="")
            await route.fulfill(status=404,body="{}")
        await ctx.route("https://demo.supabase.co/**",sb)
        await ctx.route("**/shared/config.js",lambda r:r.fulfill(status=200,content_type="application/javascript",body="window.GR_CONFIG={supabaseUrl:'https://demo.supabase.co',supabaseKey:'anon'};"))
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        # answer a few questions -> log, streak, review
        await pg.goto(B+"cases/"); await pg.wait_for_timeout(400)
        for i in range(4):
            await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(60)
            await pg.click("#next"); await pg.wait_for_timeout(230)
        print("log:", await pg.evaluate("localStorage.getItem('gr-log')"))
        print("mistakes scheduled:", await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('cases-rev')||'{}')).length"))
        # listening mode
        await pg.evaluate("localStorage.setItem('cases-prefs',JSON.stringify({topic:'smart',mode:'listen'}))"); await pg.reload(); await pg.wait_for_timeout(400)
        print("listen mode hides text:", await pg.locator('#card .listen').count(), "| sentence shown:", await pg.locator('#card .ru').count())
        await pg.locator('#card button[data-act="f"]').first.click(); await pg.wait_for_timeout(150)
        print("after answer sentence shown:", await pg.locator('#card .ru').count())
        await pg.goto(B); await pg.wait_for_timeout(400)
        print("home pill:", (await pg.locator('#me').inner_text()).replace("\n"," "))
        await pg.screenshot(path="/tmp/b1-home.png")
        # profile + login
        await pg.goto(B+"profile/"); await pg.wait_for_timeout(500)
        await pg.fill("#p-name","Alex"); await pg.press("#p-name","Tab"); await pg.wait_for_timeout(100)
        await pg.click('#p-goal button[data-g="10"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path="/tmp/b1-prof.png", full_page=True)
        await pg.fill("#a-email","me@example.com"); await pg.click("#a-send"); await pg.wait_for_timeout(300)
        await pg.fill("#a-code","000000"); await pg.click("#a-verify"); await pg.wait_for_timeout(300)
        print("wrong code:", await pg.locator("#a-msg").inner_text())
        await pg.fill("#a-code","123456"); await pg.click("#a-verify"); await pg.wait_for_timeout(1500)
        print("signed in:", (await pg.locator("#acct").inner_text())[:80].replace("\n"," "))
        print("server has progress keys:", sorted(db.get("u1",{}).get("data",{}).keys())[:12])
        # second device signs in and receives progress
        ctx2=await b.new_context(viewport={"width":1280,"height":900})
        for h in ["https://fonts.googleapis.com/**","https://fonts.gstatic.com/**"]: await ctx2.route(h,lambda r:r.fulfill(status=200,body=""))
        await ctx2.route("https://demo.supabase.co/**",sb)
        await ctx2.route("**/shared/config.js",lambda r:r.fulfill(status=200,content_type="application/javascript",body="window.GR_CONFIG={supabaseUrl:'https://demo.supabase.co',supabaseKey:'anon'};"))
        p2=await ctx2.new_page(); p2.on("pageerror",lambda e:errs.append(str(e)))
        await p2.goto(B+"profile/"); await p2.wait_for_timeout(300)
        await p2.fill("#a-email","me@example.com"); await p2.click("#a-send"); await p2.wait_for_timeout(200)
        await p2.fill("#a-code","123456"); await p2.click("#a-verify"); await p2.wait_for_timeout(1500)
        print("device 2 name:", await p2.evaluate("JSON.parse(localStorage.getItem('gr-profile')||'{}').name"), "| answers today:", await p2.evaluate("Object.values(JSON.parse(localStorage.getItem('gr-log')||'{}'))[0]"))
        print("auth kept out of sync data:", "gr-auth" not in db["u1"]["data"])
        await p2.screenshot(path="/tmp/b1-prof-dt.png", full_page=True)
        print("errors", errs); await b.close()
asyncio.run(main())
