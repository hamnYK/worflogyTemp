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
const {ChipBookFlip}=await import('/js/chip-book-flip-rules.mjs'),old=ChipBookFlip.prototype.step;ChipBookFlip.prototype.step=function(dt){window.g=this;return old.call(this,dt);};
const {mountBookFlip}=await import('/js/chip-book-flip.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.wins=0;window.handle=mountBookFlip(host,{onExit(){},onWin(){wins++;},english:true});
});await p.waitForFunction(()=>window.g&&window.cam);
const pos=await p.evaluate(()=>{const r=document.querySelector('.book-flip-game canvas').getBoundingClientRect(),v=new T.Vector3(0,.8,1.5).project(cam);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});
await p.mouse.move(pos.x,pos.y);await p.mouse.down();await p.waitForTimeout(500);assert((await p.locator('.chip-status').innerText()).includes('Power rises'));assert(Number(await p.locator('.chip-power').inputValue())>1);await p.screenshot({path:'output/book-flip-hand-detail.png'});await p.mouse.up();await p.waitForSelector('.book-flip-game[data-phase="moving"]');assert.equal(await p.locator('.book-flip-game').getAttribute('data-hits'),'1');assert(await p.locator('[data-book="hardcover"]').isDisabled());
await p.evaluate(()=>g.chips[0].position.set(3.5,.65,0));await p.waitForSelector('.book-flip-game[data-phase="fail"]');assert((await p.locator('.chip-status').innerText()).includes('fell off'));await p.waitForSelector('.book-flip-game[data-phase="ready"]',{timeout:4000});assert.equal(await p.locator('.book-flip-game').getAttribute('data-hits'),'0');
await p.locator('[data-book="hardcover"]').click();await p.locator('.book-strike').click();
await p.waitForSelector('.book-flip-game[data-phase="moving"]');
await p.evaluate(()=>g.chips.forEach((b,i)=>{b.position.set((i-1)*.9,.864,0);b.quaternion.setFromEuler(Math.PI,0,0);b.velocity.setZero();b.angularVelocity.setZero();}));
await p.waitForSelector('.book-flip-game[data-phase="won"]');assert((await p.locator('.chip-progress').innerText()).includes('3/3'));await p.waitForFunction(()=>wins===1,{},{timeout:4000});await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);
console.log('PASS: pointer charge/release, disabled book switch while moving, fall failure/reset, green-face win and 3-second return, no browser errors.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
