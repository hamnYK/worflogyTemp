const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const configs={football:['chip-football','ChipFootball','mountFootball',['launch']],curling:['chip-curling','ChipCurling','mountCurling',['launch']],basketball:['chip-basketball','ChipBasketball','mountBasketball',['spin','launch']],book:['chip-book-flip','ChipBookFlip','mountBookFlip',['strike']],eraser:['eraser-wrestling','EraserWrestling','mountEraserWrestling',['launch']],ping:['chalkboard-ping-pong','ChalkboardPingPong','mountChalkboardPingPong',['swing']]};
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try{for(const [kind,config] of Object.entries(configs)){
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
   await p.evaluate(async([file,klass,mount,methods])=>{
    const T=await import('/lib/three.module.min.js');window.T=T;
    const update=T.PerspectiveCamera.prototype.updateMatrixWorld;T.PerspectiveCamera.prototype.updateMatrixWorld=function(...a){window.cam=this;return update.apply(this,a);};
    const C=(await import('/js/'+file+'-rules.mjs'))[klass];C.prototype.step=function(){window.g=this;};window.calls=[];
    for(const method of methods)C.prototype[method]=function(...args){calls.push({method,args,power:Number(document.querySelector('.chip-power')?.value)});return false;};
    const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);
    window.handle=(await import('/js/'+file+'.mjs'))[mount](host,{onExit(){},onWin(){},english:true});
   },config);
   await p.waitForFunction(()=>window.g&&window.cam);
   const canvas=p.locator('.chip-game canvas'),power=p.locator('.chip-power');
   const val=async(selector='.chip-power')=>Number(await p.locator(selector).inputValue());
   const last=()=>p.evaluate(()=>calls.at(-1));
   const count=()=>p.evaluate(()=>calls.length);
   const coord=point=>p.evaluate(([x,y,z])=>{const r=document.querySelector('.chip-game canvas').getBoundingClientRect(),v=new T.Vector3(x,y,z).project(cam);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},point);
   async function drag(start,end){const a=await coord(start),b=await coord(end);await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y);return b;}
   async function finalRelease(point){const q=await coord(point);await canvas.dispatchEvent('pointerup',{clientX:q.x,clientY:q.y,pointerId:1,pointerType:'mouse',button:0});await p.mouse.up();}
   async function nativeRange(selector){const range=p.locator(selector),bounds=await range.evaluate(e=>({min:+e.min,max:+e.max,step:+e.step}));await range.focus();await p.keyboard.press('Home');assert.equal(await val(selector),bounds.min);await p.keyboard.press('ArrowRight');assert(Math.abs(await val(selector)-bounds.min-bounds.step)<1e-8);await p.keyboard.press('End');assert.equal(await val(selector),bounds.max);const r=await range.boundingBox();await p.mouse.click(r.x+r.width*.55,r.y+r.height/2);assert(await val(selector)>bounds.min&&await val(selector)<bounds.max);}
   if(kind!=='ping'){
    await nativeRange('.chip-power');await power.fill(kind==='curling'?'4':'8');await canvas.focus();const before=await val();await p.keyboard.press('PageUp');assert(await val()>before);await p.keyboard.press('PageDown');assert.equal(await val(),before);
    const max=await power.getAttribute('max'),min=await power.getAttribute('min');await power.fill(max);await canvas.focus();await p.keyboard.press('PageUp');assert.equal(await val(),+max);await power.fill(String(+min));await canvas.focus();await p.keyboard.press('PageDown');assert.equal(await val(),+min);await power.fill(kind==='curling'?'4':'8');
   }
   if(kind==='football'){
    await canvas.focus();await p.keyboard.press('1');await p.keyboard.press('ArrowUp');assert.equal(await val(),8.5);await p.keyboard.press('ArrowRight');await p.keyboard.press('Space');assert(Math.abs(Math.hypot(...(await last()).args)-8.5)<1e-8);
    await drag([0,.16,5],[1,.16,6]);const v=await val();assert(v>6&&v<8);await finalRelease([2,.16,7]);assert(await val()>v);assert(Math.abs(Math.hypot(...(await last()).args)-await val())<1e-8);
   }else if(kind==='curling'){
    await nativeRange('.curl-aim');await nativeRange('.curl-spin');await p.locator('.curl-aim').fill('0');await p.locator('.curl-spin').fill('0');await canvas.focus();await p.keyboard.press('ArrowRight');assert.equal(await val('.curl-aim'),.01);await p.keyboard.press('Shift+ArrowLeft');assert.equal(await val('.curl-spin'),-.1);await p.keyboard.press('ArrowUp');assert.equal(await val(),4.1);await p.keyboard.press('Space');assert.deepEqual((await last()).args,[4.1,.01,-.1]);
    await drag([0,.15,7],[.2,.15,8]);const v=await val();await p.keyboard.press('ArrowRight');assert.equal(await val('.curl-spin'),0);const n=await count();await p.keyboard.press('Space');assert.equal(await count(),n,'drag must not launch on Space');await finalRelease([.3,.15,9]);assert(await val()>v);assert.deepEqual((await last()).args,[await val(),await val('.curl-aim'),await val('.curl-spin')]);
   }else if(kind==='basketball'){
    assert(await p.locator('.basket-aim:not(.basket-loft)').isHidden());assert(await p.locator('.basket-loft').isDisabled());
    await drag([0,.6,4.5],[2,.31,4.5]);const v=await val();await finalRelease([3,.31,4.5]);assert(await val()>v);assert.equal((await last()).method,'spin');assert.equal((await last()).args[0],await val());
    await p.evaluate(()=>{g.phase='held';g.p={x:0,y:.6,z:4.5};g.shotOrigin={...g.p};g.shotPoints=3;});await p.waitForSelector('.basketball-game[data-phase="held"]');
    await nativeRange('.basket-loft');await p.locator('.basket-loft').fill('65');await canvas.focus();await p.keyboard.press('ArrowUp');assert.equal(await val('.basket-loft'),67);await p.keyboard.press('ArrowDown');assert.equal(await val('.basket-loft'),65);await p.keyboard.press('PageDown');const shotPower=await val();await p.keyboard.press('Space');assert.deepEqual((await last()).args,[shotPower,0,65]);
    await drag([0,.6,4.5],[2,.6,4.5]);await finalRelease([3,.6,4.5]);assert.deepEqual((await last()).args,[await val(),0,65]);
    await p.evaluate(()=>{g.phase='spinning';g.bounces=1;g.spinTime=1;g.omega=5;g.p={x:0,y:.6,z:4.5};g.grip={x:3,z:3};});await p.waitForSelector('.basketball-game[data-phase="spinning"]');const q=await coord([0,.6,4.5]);await p.mouse.move(q.x,q.y);await p.waitForSelector('.basketball-game[data-catchable="true"]');assert(await p.locator('.basket-catch-meter').isVisible());assert(await p.locator('.basket-action').evaluate(e=>e.classList.contains('basket-catch-ready')));
    await canvas.focus();await p.keyboard.down('ArrowLeft');await p.waitForTimeout(250);await p.keyboard.up('ArrowLeft');await p.waitForSelector('.basketball-game[data-catchable="false"]');assert(await p.locator('.basket-catch-meter').isHidden());
   }else if(kind==='book'||kind==='eraser'){
    if(kind==='book'){
     for(const button of await p.locator('button[data-book]').all()){await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');assert.equal(await val(),1);}await p.locator('button[data-book]').first().click();
     await power.fill('6');await canvas.focus();await p.keyboard.press('ArrowRight');await p.keyboard.press('Space');await p.waitForFunction(()=>calls.length>0);assert.equal((await last()).args[2],6);assert((await last()).args[0]>0);assert.equal(await val(),1);
    }else{
     await p.locator('.eraser-edge').selectOption('5');await canvas.focus();await p.keyboard.press('7');assert.equal(await val('.eraser-edge'),6);await power.fill('6');await canvas.focus();await p.keyboard.press('Space');assert.deepEqual((await last()).args,[6,6]);
    }
    const pos=kind==='book'?[0,.8,1.5]:await p.evaluate(()=>{const w=g.pressPoint(0,1);return[w.x,w.y,w.z];});const q=await coord(pos);await p.mouse.move(q.x,q.y);await p.mouse.down();const n=await count();await p.waitForTimeout(450);assert(await val()>1.5);await p.keyboard.press('Space');assert.equal(await count(),n,'Space must not interrupt pointer charge');
    if(kind==='eraser'){await p.keyboard.press('7');assert.equal(await val('.eraser-edge'),1,'pointer-selected edge remains stable');}
    const charged=await val();await p.mouse.up();await p.waitForFunction(n=>calls.length>n,n);const applied=(await last()).args.at(-1);assert(applied>=charged-.2&&applied<=charged+1);assert.equal(await val(),kind==='book'?1:applied);
    await p.mouse.move(q.x,q.y);await p.mouse.down();await p.waitForTimeout(120);const canceled=await count();await canvas.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await p.mouse.up();await p.waitForTimeout(250);assert.equal(await count(),canceled);
   }else{
    assert.equal(await p.locator('.chip-controls input[type="range"]').count(),0);assert(await p.locator('.ping-hit').isDisabled());await canvas.focus();await p.keyboard.press('ArrowUp');await p.waitForSelector('.ping-game[data-phase="rally"]');
    await p.evaluate(()=>{g.receiver=0;g.lastHitter=1;g.bounces=1;g.ball={x:0,y:1.65,z:3.3};g.v={x:0,y:0,z:0};g.setPaddle(0,3.3);g.swings[0]=0;});await p.waitForSelector('.ping-game[data-smash="true"]');assert(await p.locator('.ping-smash').isEnabled());
    const q=await coord([0,.9,3.3]);await p.mouse.click(q.x,q.y);assert.deepEqual((await last()).args,[0,false]);await canvas.focus();await p.keyboard.press('Shift+Space');assert.deepEqual((await last()).args,[0,true]);await p.locator('.ping-hit').click();assert.deepEqual((await last()).args,[0,false]);await p.locator('.ping-smash').click();assert.deepEqual((await last()).args,[0,true]);
    await p.evaluate(()=>g.ball.y=.7);await p.waitForSelector('.ping-game[data-smash="false"]');assert(await p.locator('.ping-smash').isDisabled());
   }
   if(['football','curling','basketball'].includes(kind)){
    if(kind==='basketball'){await p.evaluate(()=>{g.phase='held';g.p={x:0,y:.6,z:4.5};});await p.waitForSelector('.basketball-game[data-phase="held"]');}
    const start=kind==='football'?[0,.16,5]:kind==='curling'?[0,.15,7]:[0,.6,4.5];
    await drag(start,[start[0]+1,start[1],start[2]+1]);const n=await count();await p.keyboard.press('PageUp');await canvas.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await p.mouse.up();assert.equal(await count(),n,'cancel must not launch');
   }
   if(kind!=='ping'){
    await p.evaluate(kind=>{g.phase=kind==='basketball'?'flying':'moving';},kind);await p.waitForFunction(()=>document.querySelector('.chip-power').disabled);const value=await val();await canvas.focus();await p.keyboard.press('PageUp');assert.equal(await val(),value,'locked power');
   }
   await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);results.push({kind,pass:true});console.log('PASS',kind);
  }catch(error){results.push({kind,pass:false,error:error.stack});console.error('FAIL',kind,error);}finally{await p.close();}
 }
 assert(results.every(r=>r.pass),JSON.stringify(results,null,2));
 const live=await browser.newPage({viewport:{width:1440,height:1000}}),liveErrors=[];live.on('pageerror',e=>liveErrors.push(e.message));
 await live.goto('http://127.0.0.1:'+server.address().port+'/index.html');await live.locator('body > .section-elevator > .arcade-open').click();
 for(const selector of ['.arcade-play','.arcade-basketball-play','.arcade-curling-play','.arcade-book-flip-play','.arcade-eraser-play','.arcade-ping-play']){
  await live.locator(selector).click();await live.waitForSelector('.chip-game canvas');
  const input=live.locator('.chip-power');if(await input.count()){
   const initial=Number(await input.inputValue());await live.locator('.chip-game canvas').focus();await live.keyboard.press('PageUp');assert(Number(await input.inputValue())>initial);await live.keyboard.press('PageDown');assert.equal(Number(await input.inputValue()),initial);
  }else assert.equal(await live.locator('.chip-controls input[type="range"]').count(),0);
  await live.locator('.chip-back').click();
 }
 assert.deepEqual(liveErrors,[]);await live.close();
 console.log('PASS: published bundle entry points for all six registered games.');
 console.log('PASS: all six games; native sliders, canvas keys, pointer sync, applied values, cancellation, state locks and status indicators.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
