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
const {EraserWrestling}=await import('/js/eraser-wrestling-rules.mjs'),old=EraserWrestling.prototype.step;EraserWrestling.prototype.step=function(dt){window.g=this;return old.call(this,dt);};
const launch=EraserWrestling.prototype.launch;EraserWrestling.prototype.launch=function(...args){if(this.turn===1)window.aiLaunched=true;return launch.apply(this,args);};
const {mountEraserWrestling}=await import('/js/eraser-wrestling.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.wins=0;window.handle=mountEraserWrestling(host,{onExit(){},onWin(){wins++;},english:true});
});await p.waitForFunction(()=>window.g&&window.cam);

const canvas=p.locator('.eraser-game canvas');
await p.locator('.eraser-edge').selectOption('5');await canvas.focus();await p.keyboard.press('7');assert.equal(await p.locator('.eraser-edge').inputValue(),'6');
const pos=await p.evaluate(()=>{const r=document.querySelector('.eraser-game canvas').getBoundingClientRect(),w=g.pressPoint(0,1),v=new T.Vector3(w.x,w.y,w.z).project(cam);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});
await p.mouse.move(pos.x,pos.y);await p.mouse.down();await p.waitForTimeout(350);assert((await p.locator('.chip-status').innerText()).includes('Power rises'));await p.mouse.up();await p.waitForSelector('.eraser-game[data-phase="moving"]');assert(await p.locator('.eraser-flip').isDisabled());
await p.waitForFunction(()=>window.aiLaunched,{},{timeout:16000});
await p.evaluate(()=>{g.bodies[0].position.set(6,.151,0);g.bodies[1].position.set(0,.151,0);g.bodies.forEach(b=>{b.quaternion.setFromEuler(0,0,0);b.velocity.setZero();b.angularVelocity.setZero();});g.phase='moving';g.still=0;});
await p.waitForSelector('.eraser-game[data-phase="lost"]');assert((await p.locator('.chip-status').innerText()).includes('outside'));
await p.waitForSelector('.eraser-game[data-phase="ready"]',{timeout:4000});assert.equal(await p.locator('.eraser-game').getAttribute('data-moves'),'0');
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'output/eraser-mobile.png'});assert(await p.locator('.eraser-game').evaluate(el=>el.scrollWidth<=el.clientWidth));await p.setViewportSize({width:1440,height:1000});
await p.evaluate(()=>{g.bodies[0].position.set(0,.451,0);g.bodies[1].position.set(0,.151,0);g.bodies.forEach(b=>{b.quaternion.setFromEuler(0,0,0);b.velocity.setZero();b.angularVelocity.setZero();});g.phase='moving';g.still=0;});
await p.waitForSelector('.eraser-game[data-phase="won"]');await p.screenshot({path:'output/eraser-win.png'});await p.waitForFunction(()=>wins===1,{},{timeout:4000});await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);
console.log('PASS: keyboard edge selection, real pointer charge and flip, input locking, AI turn, ring-out reset, stacked win/return, mobile layout and no browser errors.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});