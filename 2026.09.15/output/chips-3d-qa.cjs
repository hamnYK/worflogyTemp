const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');

await page.locator('body > .section-elevator > .arcade-open').click();await page.waitForTimeout(1200);await page.locator('.arcade-play').click();
await page.waitForSelector('.chip-viewport canvas');
await page.waitForFunction(()=>document.querySelector('.chip-game')?.dataset.phase==='ready');
await page.waitForTimeout(1200);
assert(await page.locator('.chip-game').count()===1);assert(await page.locator('.chip-picks button').count()===3);
await page.screenshot({path:'output/chips-3d-desktop.png'});
await page.locator('[data-chip="0"]').click();assert(await page.locator('[data-chip="1"]').isDisabled());
await page.locator('.chip-viewport canvas').focus();await page.keyboard.press('2');assert.equal(await page.locator('[data-chip="0"]').getAttribute('aria-pressed'),'true');
await page.locator('.chip-power').fill('22');await page.locator('.chip-fire').click();
await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.phase==='fail');
assert.equal(await page.locator('.chip-result').innerText(),'FAIL');
await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.phase==='ready');
assert.equal(await page.locator('[data-chip="0"]').getAttribute('aria-pressed'),'false');
await page.locator('[data-chip="0"]').click();await page.locator('.chip-power').fill('6.5');await page.locator('.chip-fire').click();
await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.phase==='ready');
assert(await page.locator('[data-chip="0"]').isDisabled());
await page.locator('[data-camera="left"]').click();await page.locator('[data-camera="in"]').click();
await page.locator('.chip-viewport canvas').hover();await page.mouse.wheel(0,150);
const box=await page.locator('.chip-viewport canvas').boundingBox();await page.mouse.move(box.x+50,box.y+50);await page.mouse.down({button:'right'});await page.mouse.move(box.x+120,box.y+70);await page.mouse.up({button:'right'});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'output/chips-3d-mobile.png'});
assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await page.locator('.chip-back').click();assert(await page.locator('.arcade-play').isVisible());
await page.locator('.arcade-play').click();await page.waitForSelector('.chip-viewport canvas');await page.locator('.arcade-close').click();await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
assert.deepEqual(errors,[]);console.log('PASS: real WebGL, desktop/mobile, locked choice, auto restart, valid pass and cooldown, zoom/orbit, dispose/reopen/close.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});