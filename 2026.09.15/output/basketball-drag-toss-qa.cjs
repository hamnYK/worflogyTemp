const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async()=>{
const THREE=await import('/lib/three.module.min.js');window.qaThree=THREE;
const {ChipBasketball}=await import('/js/chip-basketball-rules.mjs'),oldStep=ChipBasketball.prototype.step;
ChipBasketball.prototype.step=function(dt){window.qaGame=this;return oldStep.call(this,dt);};
const update=THREE.PerspectiveCamera.prototype.updateMatrixWorld;THREE.PerspectiveCamera.prototype.updateMatrixWorld=function(...args){window.qaCamera=this;return update.apply(this,args);};
const {mountBasketball}=await import('/js/chip-basketball.mjs');const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.qaHost=host;window.qaWins=0;window.qaHandle=mountBasketball(host,{onWin:()=>window.qaWins++,onExit:()=>{}});
});await p.waitForFunction(()=>window.qaGame&&window.qaCamera);
await p.evaluate(()=>{
const g=window.qaGame,c=window.qaHost.querySelector('canvas'),r=c.getBoundingClientRect();
function input(x,z,type){const v=new window.qaThree.Vector3(x,g.p.y,z).project(window.qaCamera);c.dispatchEvent(new PointerEvent(type,{clientX:r.left+(v.x+1)*r.width/2,clientY:r.top+(1-v.y)*r.height/2,button:0,pointerId:1,pointerType:'mouse',bubbles:true}));}
input(g.p.x,g.p.z,'pointerdown');input(g.p.x,g.p.z,'pointerup');if(g.phase!=='ready')throw Error('Click must not launch');
input(g.p.x,g.p.z,'pointerdown');input(g.p.x-2,g.p.z,'pointermove');input(g.p.x-2,g.p.z,'pointerup');
if(g.phase!=='spinning'||g.v.x<2||Math.abs(g.v.z)>.6)throw Error('Pull must launch sideways, not at hoop');
});
assert.equal(await p.locator('.basketball-game').getAttribute('data-grippers'),'false');

await p.evaluate(()=>new Promise((resolve,reject)=>{const start=performance.now();function track(){
const g=window.qaGame,c=window.qaHost.querySelector('canvas'),r=c.getBoundingClientRect();
if(g.phase!=='spinning'){reject(Error('Lost spin'));return;}
const point=new window.qaThree.Vector3(g.p.x,Math.min(1.5,Math.max(.6,g.p.y)),g.p.z).project(window.qaCamera);
const init={clientX:r.left+(point.x+1)*r.width/2,clientY:r.top+(1-point.y)*r.height/2,pointerId:1,pointerType:'mouse',button:0,bubbles:true};
c.dispatchEvent(new PointerEvent('pointermove',init));
if(g.catchable){c.dispatchEvent(new PointerEvent('pointerdown',init));resolve();return;}
if(performance.now()-start>12000){reject(Error('Catch timeout'));return;}requestAnimationFrame(track);
}track();}));
await p.waitForSelector('.basketball-game[data-phase="held"]');assert(await p.locator('.basket-aim:not(.basket-loft)').isHidden());
await p.screenshot({path:'output/basketball-manual-catch.png'});
for(let i=0;i<2;i++){
// Place a held chip in a reproducible rear 6-point shooting fixture.
await p.evaluate(()=>{const g=window.qaGame;g.phase='held';g.p={x:5,y:.6,z:-3};g.shotOrigin={...g.p};g.shotPoints=g.pointsAt(g.p);g.setGrip(5,-3);});
await p.waitForSelector('.basketball-game[data-phase="held"]');await p.locator('.chip-power').fill('10.4');await p.locator('.basket-loft').fill('68');await p.locator('.basket-action').click();
if(i===0){await p.waitForSelector('.basketball-game[data-phase="attempt-end"]');assert.equal(await p.locator('.basketball-game').getAttribute('data-total'),'6');await p.waitForSelector('.basketball-game[data-phase="ready"]');}
}
await p.waitForSelector('.basketball-game[data-phase="results"]');assert.equal(await p.locator('.basket-results strong').innerText(),'12 / 12');assert.equal(await p.evaluate(()=>localStorage.getItem('worflogy-basketball-best')),'12');
await p.screenshot({path:'output/basketball-12-points.png'});await p.waitForTimeout(3000);assert.equal(await p.evaluate(()=>window.qaWins),0);await p.waitForFunction(()=>window.qaWins===1,{},{timeout:4000});await p.evaluate(()=>window.qaHandle.dispose());assert.deepEqual(errors,[]);
console.log('PASS: pointer-controlled physical catch, automatic bearing, two rear six-point baskets, best score persistence and 5-second exit.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
