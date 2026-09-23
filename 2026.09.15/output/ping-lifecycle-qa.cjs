const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{fs.readFile(path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0])),(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(req.url)?'text/javascript':/\.css$/.test(req.url)?'text/css':'text/html; charset=utf-8');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{

const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async()=>{
const T=await import('/lib/three.module.min.js'),update=T.PerspectiveCamera.prototype.updateMatrixWorld;
T.PerspectiveCamera.prototype.updateMatrixWorld=function(...args){window.cam=this;return update.apply(this,args);};window.T=T;
const {ChalkboardPingPong}=await import('/js/chalkboard-ping-pong-rules.mjs'),old=ChalkboardPingPong.prototype.step;ChalkboardPingPong.prototype.step=function(dt){window.g=this;return old.call(this,dt);};
const {mountChalkboardPingPong}=await import('/js/chalkboard-ping-pong.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.wins=0;window.handle=mountChalkboardPingPong(host,{onExit(){},onWin(){wins++;},english:true});
});await p.waitForFunction(()=>window.g&&window.cam);


const canvas=p.locator('.ping-game canvas'),bounds=await canvas.boundingBox();
const before=await p.evaluate(()=>({camera:cam.position.toArray(),paddle:{...g.paddles[0]}}));
await canvas.press('Space');assert.equal(await p.evaluate(()=>g.phase),'ready');
await p.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.6);await p.mouse.down();await p.mouse.move(bounds.x+bounds.width*.5+70,bounds.y+bounds.height*.6-40,{steps:5});await p.mouse.up();
assert.equal(await p.evaluate(()=>g.phase),'ready');assert.notDeepEqual(await p.evaluate(()=>cam.position.toArray()),before.camera);assert.deepEqual(await p.evaluate(()=>({...g.paddles[0]})),before.paddle);
await p.locator('[data-camera="home"]').click();assert.deepEqual(await p.evaluate(()=>cam.position.toArray()),before.camera);
await p.locator('.ping-game canvas').press('ArrowUp');await p.waitForSelector('.ping-game[data-phase="rally"]');
await p.evaluate(()=>new Promise((resolve,reject)=>{const start=performance.now(),c=document.querySelector('.ping-game canvas');function track(){
if(performance.now()-start>14000){reject(Error('Rally timeout '+g.phase+' '+g.rally));return;}
if(g.rally>=4){resolve();return;}
if(g.receiver===0&&g.phase==='rally'){
const r=c.getBoundingClientRect(),v=new T.Vector3(g.ball.x,g.paddles[0].y,3.3).project(cam);
c.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+(v.x+1)*r.width/2,clientY:r.top+(1-v.y)*r.height/2,pointerId:1,pointerType:'mouse',bubbles:true}));
if(g.canHit(0))c.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));
}
requestAnimationFrame(track);
}track();}));
await p.screenshot({path:'output/ping-rally.png'});
await p.evaluate(()=>{g.phase='rally';g.receiver=0;g.lastHitter=1;g.bounces=1;g.ball={x:0,y:1.65,z:3.3};g.v={x:0,y:0,z:0};g.setPaddle(0,3.3);g.swings[0]=0;});
await p.waitForSelector('.ping-game[data-smash="true"]');assert(!(await p.locator('.ping-smash').isDisabled()));await p.locator('.ping-smash').click();assert(await p.evaluate(()=>g.lastHitter===0&&g.v.z<-7));
await p.evaluate(()=>g.point(0,'out'));await p.waitForSelector('.ping-game[data-phase="point"]');assert(await p.locator('.ping-hit').isDisabled());await p.waitForSelector('.ping-game[data-phase="ready"]',{timeout:2500});assert((await p.locator('.chip-status').innerText()).includes('serve'));
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'output/ping-mobile.png'});assert(await p.locator('.ping-game').evaluate(el=>el.scrollWidth<=el.clientWidth));
await p.evaluate(()=>{g.scores=[4,2];g.phase='rally';g.point(0,'double');});
await p.waitForSelector('.ping-game[data-phase="results"]');assert((await p.locator('.chip-progress').innerText()).includes('5 : 2'));await p.waitForFunction(()=>wins===1,{},{timeout:4000});await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);
console.log('PASS: real mouse/keyboard rally, high-ball smash button, point pause, alternating serve, first-to-five return, mobile and no browser errors.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});