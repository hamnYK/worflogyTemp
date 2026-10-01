const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require('../tmp/claw-check/node_modules/playwright');const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.mp3':'audio/mpeg','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(b);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const out=path.join(__dirname,'mobile-arcade');
 try{
  const page=await browser.newPage({viewport:{width:412,height:914},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv.includes('--file')?require('url').pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/index.html');
  if(process.argv.includes('--null-sector')){
   await page.locator('body > .section-elevator > .arcade-open').tap();await page.locator('.arcade-null-sector-play').tap();await page.locator('#null-sector-key').fill(await page.evaluate(()=>WorflogyNullSector.currentCode()));await page.locator('.null-sector-entry [type=submit]').tap();
   const game=page.frameLocator('.null-sector-frame');await game.locator('#skip-prologue').waitFor({timeout:60000});await page.locator('.null-sector-load-status').waitFor({state:'hidden',timeout:60000});
   await page.screenshot({path:path.join(out,'null-sector-prologue.png')});await game.locator('#skip-prologue').tap();await page.screenshot({path:path.join(out,'null-sector-factions.png')});
   await game.locator('[data-faction=human]').tap();await page.screenshot({path:path.join(out,'null-sector-prep.png')});console.log('NS briefing buttons',await game.locator('#mission-briefing button').allTextContents());await game.locator('#begin-assembly').tap();
   await game.locator('#deploy').tap();await game.locator('#viewport canvas').waitFor({timeout:60000});
   await game.locator('.ns-mobile-tools').waitFor();assert(await game.locator('.left-panel').isHidden());assert(await game.locator('.right-panel').isHidden());
   await game.locator('[data-panel="squad"]').tap();assert(await game.locator('.left-panel').isVisible());await game.locator('#squad [data-unit]').nth(1).tap();assert(await game.locator('.left-panel').isHidden());
   await game.locator('.ns-mobile-command').tap();assert(await game.locator('#unit-commands').isVisible());await page.screenshot({path:path.join(out,'null-sector-commands.png')});await game.locator('#close-commands').tap();
   await game.locator('[data-panel="targets"]').tap();assert(await game.locator('.right-panel').isVisible());await game.locator('[data-panel="targets"]').tap();
   await game.locator('[data-panel="info"]').tap();assert(await game.locator('.dock-mission').isVisible());await game.locator('[data-panel="info"]').tap();
   await game.getByRole('button',{name:'전장 확대',exact:true}).tap();await page.waitForTimeout(150);await game.getByRole('button',{name:'전장 축소',exact:true}).tap();
   await page.screenshot({path:path.join(out,'null-sector-battle.png')});
   for(const width of [320,390,412,1280]){await page.setViewportSize({width,height:914});await page.waitForTimeout(120);assert(await game.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width<=760){assert(await game.locator('.left-panel').isHidden());assert(await game.locator('.ns-mobile-tools').isVisible());}else{assert(await game.locator('.ns-mobile-tools').isHidden());assert(await game.locator('.left-panel').isVisible());}}
   await page.setViewportSize({width:412,height:914});
   console.log('NS dimensions',await game.locator('body').evaluate(e=>({width:innerWidth,scroll:document.documentElement.scrollWidth,text:e.innerText.slice(-2000)})));
   await page.locator('.null-sector-player-bar button').tap();assert.equal(await page.locator('.null-sector-frame').count(),0);assert.deepEqual(errors,[]);console.log('PASS NULL SECTOR mobile entry, faction, deploy, return');return;
  }
  // Isolate gameplay, keep the real renderer and input; freeze time for deterministic assertions.
  await page.evaluate(()=>{document.body.innerHTML='<main class="coin-arcade" style="padding:12px"></main>';});
  const configs=[['chip-football','ChipFootball','mountFootball','step'],['chip-book-flip','ChipBookFlip','mountBookFlip','step'],['chalkboard-ping-pong','ChalkboardPingPong','mountChalkboardPingPong','step'],['claw-machine','ClawPhysics','mountClawMachine','update']];
  const cdp=await page.context().newCDPSession(page);
  async function touch(selector,type='touchStart'){
   const b=page.locator(selector);await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchStart'?[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]:[]});
  }
  for(const [file,klass,mount,tick] of (process.argv.includes('--points')?[]:configs)){
   await page.evaluate(async({file,klass,mount,tick})=>{
    const rule=file==='claw-machine'?'claw-physics':file+'-rules';const C=(await import('/js/'+rule+'.mjs'))[klass];C.prototype[tick]=function(){window.g=this;};
    window.handle=(await import('/js/'+file+'.mjs'))[mount](document.querySelector('main'),{onExit(){},onWin(){}});
   },{file,klass,mount,tick});await page.waitForFunction(()=>window.g);await page.waitForTimeout(120);
   if(file==='chip-football'){
    await page.locator('[data-chip="0"]').tap();await touch('[data-aim="right"]');await page.waitForTimeout(400);await touch('[data-aim="right"]','touchEnd');await page.locator('.chip-fire').tap();assert.equal(await page.evaluate(()=>g.phase),'breaking');assert(await page.evaluate(()=>g.breakVel[0].x)>0);console.log('PASS football touch select, hold aim and launch');
   }else if(file==='chip-book-flip'){
    await page.evaluate(()=>{const original=g.strike;g.strike=function(...a){window.strikeArgs=a;return original.apply(this,a);};});
    await page.locator('[data-move="right"]').tap();await page.locator('.book-strike').tap();await page.waitForFunction(()=>window.strikeArgs);assert((await page.evaluate(()=>strikeArgs))[0]>0);console.log('PASS book touch position and strike');
   }else if(file==='chalkboard-ping-pong'){
    await page.locator('.ping-serve').tap();assert.equal(await page.evaluate(()=>g.phase),'rally');const x=await page.evaluate(()=>g.paddles[0].x);await touch('[data-move="right"]');await page.waitForTimeout(400);await touch('[data-move="right"]','touchCancel');const moved=await page.evaluate(()=>g.paddles[0].x);assert(moved>x);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>g.paddles[0].x),moved);
    await page.evaluate(()=>{g.receiver=0;g.lastHitter=1;g.bounces=1;g.ball={x:g.paddles[0].x,y:1.65,z:g.paddles[0].z};g.v={x:0,y:0,z:0};g.swings[0]=0;});await page.waitForSelector('.ping-game[data-smash="true"]');await page.locator('.ping-smash').tap();assert.equal(await page.evaluate(()=>g.lastHitter),0);console.log('PASS ping touch serve, held movement, cancel and smash');
   }else{
    const initial=await page.evaluate(()=>g.aim.x);await touch('[data-move="right"]');await page.waitForTimeout(400);await touch('[data-move="right"]','touchEnd');const moved=await page.evaluate(()=>g.aim.x);assert(moved>initial+.12);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>g.aim.x),moved);
    await touch('[data-move="left"]');await page.waitForTimeout(100);await touch('[data-move="left"]','touchCancel');const canceled=await page.evaluate(()=>g.aim.x);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>g.aim.x),canceled);
    const heading=await page.evaluate(()=>g.heading);await page.locator('[data-turn="right"]').tap();assert((await page.evaluate(()=>g.heading))>heading);
    await page.locator('.claw-grab').tap();assert.equal(await page.evaluate(()=>g.phase),'down');await page.locator('.claw-grab').tap();assert.equal(await page.evaluate(()=>g.phase),'grip');assert(await page.locator('.claw-grab').isDisabled());
    await page.evaluate(()=>{g.phase='ready';});await page.waitForFunction(()=>document.querySelector('.claw-game').dataset.phase==='ready');
    await touch('[data-move="left"]');await page.waitForTimeout(100);await page.evaluate(()=>handle.dispose());const disposed=await page.evaluate(()=>g.aim.x);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>g.aim.x),disposed);console.log('PASS claw touch hold/release/cancel, turn, lower/close, disabled state and cleanup');
   }
   for(const width of [320,390,412,760,1280]){
    await page.setViewportSize({width,height:914});await page.waitForTimeout(100);const sizes=await page.locator('main').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));assert(sizes.scroll<=sizes.client+1,file+' overflows at '+width);
   }
   await page.setViewportSize({width:412,height:914});await page.evaluate(()=>{handle.dispose();delete window.g;});
  }
  for(const file of ['dots-and-boxes','triangle-territory']){
   await page.evaluate(async file=>{const m=await import('/js/'+file+'.mjs');window.handle=m[file==='dots-and-boxes'?'mountDotsAndBoxes':'mountTriangleTerritory'](document.querySelector('main'),{onExit(){},onWin(){}});},file);
   if(await page.locator('.arcade-point-picker select').isDisabled())await page.locator('.triangle-new').tap();
   await page.locator('.arcade-point-picker select').selectOption({value:'0'});await page.locator('.arcade-point-picker button').tap();assert.equal(await page.locator('.triangle-dot').nth(0).getAttribute('aria-pressed'),'true');const next=await page.locator('.triangle-dot').evaluateAll(bs=>bs.findIndex(b=>b.classList.contains('triangle-available')));assert(next>=0);await page.locator('.arcade-point-picker select').selectOption({value:String(next)});await page.locator('.arcade-point-picker button').tap();console.log(file,next,await page.locator('.arcade-point-picker select').inputValue(),await page.locator('.chip-status').innerText(),await page.locator('.triangle-game').getAttribute('data-edges'));assert(Number(await page.locator('.triangle-game').getAttribute('data-edges'))>=1);await page.evaluate(()=>handle.dispose());console.log('PASS '+file+' numbered touch selection');
  }
  assert.deepEqual(errors,[]);console.log('PASS responsive widths 320/390/412/760/1280; no browser errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
