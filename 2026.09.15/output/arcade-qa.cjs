const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.locator('.arcade-open').click();
await page.waitForTimeout(1200);
await page.screenshot({path:'output/arcade-lobby.png'});
assert(await page.locator('.holo-card').count()===2);
await page.locator('.football-card').click();
await page.locator('.coin-pitch').focus();await page.keyboard.press('Space');
await page.waitForFunction(()=>document.querySelector('.game-score').textContent.includes('1 /'));
await page.screenshot({path:'output/arcade-football.png'});
await page.locator('.game-reset').click();await page.locator('.coin-pitch').focus();await page.keyboard.press('2');await page.keyboard.press('Space');
await page.waitForFunction(()=>/패스 실패|Miss!/.test(document.querySelector('.game-status').textContent));
await page.locator('.game-reset').click();
const box=await page.locator('.coin-pitch').boundingBox();
await page.mouse.move(box.x+box.width*.5,box.y+box.height*445/560);await page.mouse.down();await page.mouse.move(box.x+box.width*.5,box.y+box.height*535/560);await page.mouse.up();
await page.waitForFunction(()=>document.querySelector('.game-score').textContent.includes('2 /'));
await page.keyboard.press('Escape');
assert(await page.locator('.arcade-open').evaluate(e=>e===document.activeElement));
assert(await page.evaluate(()=>document.body.style.overflow===''));
await page.setViewportSize({width:390,height:844});await page.locator('.arcade-open').click();await page.waitForTimeout(1200);
await page.screenshot({path:'output/arcade-mobile.png'});
assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await page.locator('.football-card').click();await page.screenshot({path:'output/arcade-mobile-game.png'});
await page.keyboard.press('Escape');
await page.goto('http://127.0.0.1:'+server.address().port+'/en.html');await page.locator('.arcade-open').click();await page.locator('.football-card').click();assert((await page.locator('.game-help').innerText()).includes('Pull a coin'));
assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile, keyboard/pointer goals, invalid pass, reset, close/focus, English, no page errors.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});