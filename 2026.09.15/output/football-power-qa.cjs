const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>fs.readFile(path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0])),(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(req.url)?'text/javascript':/\.css$/.test(req.url)?'text/css':'text/html; charset=utf-8');res.end(b);}));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
  await p.evaluate(async()=>{
   const T=await import('/lib/three.module.min.js');window.T=T;
   const update=T.PerspectiveCamera.prototype.updateMatrixWorld;T.PerspectiveCamera.prototype.updateMatrixWorld=function(...args){window.camera=this;return update.apply(this,args);};
   const {ChipFootball}=await import('/js/chip-football-rules.mjs');
   const step=ChipFootball.prototype.step;ChipFootball.prototype.step=function(dt){window.game=this;return step.call(this,dt);};
   window.shots=[];const launch=ChipFootball.prototype.launch;ChipFootball.prototype.launch=function(x,z){shots.push({x,z});return window.realLaunch?launch.call(this,x,z):false;};
   const {mountFootball}=await import('/js/chip-football.mjs');const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);window.handle=mountFootball(host,{onExit(){},onWin(){}});
  });
  await p.waitForFunction(()=>window.game&&window.camera);
  const canvas=p.locator('.chip-game canvas'),power=p.locator('.chip-power');
  await canvas.focus();await p.keyboard.press('1');await p.keyboard.press('ArrowUp');assert.equal(await power.inputValue(),'8.5');await p.keyboard.press('ArrowDown');assert.equal(await power.inputValue(),'8');
  await power.fill('22');await canvas.focus();await p.keyboard.press('ArrowUp');assert.equal(await power.inputValue(),'22');
  await power.fill('0.6');await canvas.focus();await p.keyboard.press('ArrowDown');assert.equal(await power.inputValue(),'0.6');
  const coords=await p.evaluate(()=>{const r=document.querySelector('.chip-game canvas').getBoundingClientRect();return [[0,5],[1,6],[2,7]].map(([x,z])=>{const v=new T.Vector3(x,.16,z).project(camera);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});});
  await p.mouse.move(coords[0].x,coords[0].y);await p.mouse.down();await p.mouse.up();assert.equal(await p.evaluate(()=>shots.length),0,'click must not launch');
  await p.mouse.down();await p.mouse.move(coords[1].x,coords[1].y);const weak=+await power.inputValue();assert(weak>6&&weak<8);
  await p.mouse.move(coords[2].x,coords[2].y);const strong=+await power.inputValue();assert(strong>weak);
  await p.mouse.up();let shot=await p.evaluate(()=>shots.at(-1));assert(Math.abs(Math.hypot(shot.x,shot.z)-strong)<1e-8);assert(shot.x<0&&shot.z<0);
  await canvas.focus();await p.keyboard.press('ArrowUp');const keyed=+await power.inputValue();assert.equal(keyed,strong+.5);await p.keyboard.press('Space');shot=await p.evaluate(()=>shots.at(-1));assert(Math.abs(Math.hypot(shot.x,shot.z)-keyed)<1e-8);
  await power.fill('10');await p.evaluate(()=>window.realLaunch=true);await p.locator('.chip-fire').click();assert(await power.isDisabled());shot=await p.evaluate(()=>shots.at(-1));assert(Math.abs(Math.hypot(shot.x,shot.z)-10)<1e-8);
  await canvas.focus();await p.keyboard.press('ArrowDown');assert.equal(await power.inputValue(),'10');
  await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);
  await p.reload();await p.locator('body > .section-elevator > .arcade-open').click();await p.locator('.arcade-play').click();await p.waitForSelector('.chip-picks');
  await p.locator('.chip-game canvas').focus();await p.keyboard.press('1');await p.keyboard.press('ArrowUp');assert.equal(await p.locator('.chip-power').inputValue(),'8.5');await p.keyboard.press('Space');assert(await p.locator('.chip-power').isDisabled());assert.deepEqual(errors,[]);
  console.log('PASS: pointer power updates live, launch matches gauge, keyboard and button share power/direction, bounds and moving-state locks hold.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
