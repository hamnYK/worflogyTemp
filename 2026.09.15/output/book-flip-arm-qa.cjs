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
T.PerspectiveCamera.prototype.updateMatrixWorld=function(...args){window.cam=this;return update.apply(this,args);};window.T=T;const add=T.Object3D.prototype.add;T.Object3D.prototype.add=function(...items){for(const item of items)if(item.name==='book-flip-hand')window.hand=item;return add.apply(this,items);};
const {ChipBookFlip}=await import('/js/chip-book-flip-rules.mjs'),old=ChipBookFlip.prototype.step;ChipBookFlip.prototype.step=function(dt){window.g=this;return old.call(this,dt);};
const {mountBookFlip}=await import('/js/chip-book-flip.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.wins=0;window.handle=mountBookFlip(host,{onExit(){},onWin(){wins++;},english:true});
});await p.waitForFunction(()=>window.g&&window.cam);

for(let angle=0;angle<4;angle++){
if(angle)for(let i=0;i<8;i++)await p.locator('[data-camera="right"]').click();
const pos=await p.evaluate(()=>{const r=document.querySelector('.book-flip-game canvas').getBoundingClientRect(),v=new T.Vector3(0,.8,1.5).project(cam);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});
await p.mouse.move(pos.x,pos.y);await p.mouse.down();await p.waitForTimeout(150);
const dot=await p.evaluate(()=>{const arm=new T.Vector3(0,0,1).applyQuaternion(hand.quaternion);arm.y=0;arm.normalize();const toward=cam.position.clone().sub(new T.Vector3(0,0,1.5));toward.y=0;toward.normalize();return arm.dot(toward);});
assert(dot>.999,'Arm must point toward the camera at every orbit angle: '+dot);
await p.screenshot({path:'output/book-flip-camera-arm-'+angle+'.png'});
await p.locator('.book-flip-game canvas').dispatchEvent('pointercancel');await p.mouse.up();
}
await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);console.log('PASS: arm faces the viewer at four camera headings around the full book.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});