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
await page.locator('[data-chip="0"]').click();await page.locator('.chip-fire').click();await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.opening==='false');assert.equal(await page.locator('.chip-game').getAttribute('data-turns'),'0');

assert.equal(await page.locator('.chip-game').getAttribute('data-opening'),'false');
await page.locator('[data-camera="left"]').click();await page.locator('[data-camera="in"]').click();
await page.locator('.chip-viewport canvas').hover();await page.mouse.wheel(0,150);
const box=await page.locator('.chip-viewport canvas').boundingBox();await page.mouse.move(box.x+50,box.y+50);await page.mouse.down({button:'right'});await page.mouse.move(box.x+120,box.y+70);await page.mouse.up({button:'right'});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'output/chips-3d-mobile.png'});
assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await page.locator('.chip-back').click();assert(await page.locator('.arcade-play').isVisible());
await page.locator('.arcade-play').click();await page.waitForSelector('.chip-viewport canvas');await page.locator('.arcade-close').click();await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
assert.deepEqual(errors,[]);console.log('PASS: real WebGL, physical opening, zero opening turns, desktop/mobile, zoom/orbit, dispose/reopen/close.');

await page.evaluate(async()=>{
 const {ChipFootball}=await import('/js/chip-football-rules.mjs');
 const {mountFootball}=await import('/js/chip-football.mjs');
 const original=ChipFootball.prototype.step;
 ChipFootball.prototype.step=function(dt){window.qaFootball=this;return original.call(this,dt);};
 const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;background:white';document.body.append(host);
 window.qaHost=host;window.qaWins=0;window.qaHandle=mountFootball(host,{onWin:()=>window.qaWins++,onExit:()=>{}});
});
await page.waitForFunction(()=>window.qaFootball);
const runGoal=extra=>page.evaluate(extra=>{
 const g=window.qaFootball;g.reset();g.select(0);g.launch(0,-8);g.advance(12);g.chips=[{x:0,z:5},{x:-1.3,z:2.5},{x:1.3,z:2.5}].map(c=>({...c,passed:false}));
 const route=[[0,1.338177577083251,-9.452685215463452],[1,8.083997977040642,-8.12049328990324],[2,3.7255679231161736,-13.684227189045984],[1,-15.080641780301912,-16.017935057123076]];
 for(const [i,vx,vz] of route){g.select(i);g.launch(vx,vz);g.advance(10);}
 if(g.phase!=='won'||g.turns!==4)throw Error('Four shot route failed');
 g.turns+=extra;
},extra);
await runGoal(1);await page.waitForFunction(()=>window.qaHost.querySelector('.chip-result').textContent==='GOAL · 5');
await page.waitForFunction(()=>window.qaFootball.opening&&window.qaFootball.phase==='ready');
assert.equal(await page.evaluate(()=>window.qaWins),0);
await runGoal(0);await page.waitForFunction(()=>window.qaHost.querySelector('.chip-result').textContent==='CONGRATULATIONS');
await page.waitForFunction(()=>window.qaWins===1);
await page.evaluate(()=>{window.qaHandle.dispose();window.qaHost.remove();});
console.log('PASS: reachable 4-shot goal, 5-shot retry stays in game, congratulations exits only at 4.');

}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});