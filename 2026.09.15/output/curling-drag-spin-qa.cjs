const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async()=>{
const THREE=await import('/lib/three.module.min.js');window.qaThree=THREE;
const {ChipCurling}=await import('/js/chip-curling-rules.mjs'),oldStep=ChipCurling.prototype.step;
ChipCurling.prototype.step=function(dt){window.qaGame=this;return oldStep.call(this,dt);};
const update=THREE.PerspectiveCamera.prototype.updateMatrixWorld;THREE.PerspectiveCamera.prototype.updateMatrixWorld=function(...args){window.qaCamera=this;return update.apply(this,args);};
const {mountCurling}=await import('/js/chip-curling.mjs');const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.qaHost=host;window.qaWins=0;window.qaHandle=mountCurling(host,{onWin:()=>window.qaWins++,onExit:()=>{}});
});await p.waitForFunction(()=>window.qaGame&&window.qaCamera);

const canvas=p.locator('.curling-game canvas');
await canvas.focus();await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.curl-aim').inputValue(),'-.01'.replace('-.','-0.'));
await p.locator('.curl-aim').fill('0');
const coords=await p.evaluate(()=>{const r=window.qaHost.querySelector('canvas').getBoundingClientRect();return [7,8].map(z=>{const v=new window.qaThree.Vector3(0,.15,z).project(window.qaCamera);return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});});
await p.mouse.move(coords[0].x,coords[0].y);await p.mouse.down();await p.mouse.move(coords[1].x,coords[1].y);
const aim=await p.locator('.curl-aim').inputValue();
await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.curl-spin').inputValue(),'-0.1');assert.equal(await p.locator('.curl-aim').inputValue(),aim);
for(let i=0;i<25;i++)await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.curl-spin').inputValue(),'1');
for(let i=0;i<25;i++)await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.curl-spin').inputValue(),'-1');
await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.curl-spin').inputValue(),'-0.9');
await p.mouse.up();await p.waitForFunction(()=>window.qaGame.shots===1);assert.equal(await p.evaluate(()=>window.qaGame.chips[0].spin),-.9);
await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.curl-spin').inputValue(),'-0.9');
await p.evaluate(()=>window.qaHandle.dispose());assert.deepEqual(errors,[]);
console.log('PASS: drag plus arrow keys changes curl, clamps at both ends, preserves aim, and applies spin on release.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
