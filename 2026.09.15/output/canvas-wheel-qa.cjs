
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[];fs.mkdirSync('output/canvas-11-qa',{recursive:true});
 try{

 const page=await browser.newPage({viewport:{width:1280,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
 await page.evaluate(()=>document.fonts.ready);
 for(const id of ['spatial-9','spatial-10','game-11']){
  const section=page.locator('#section-'+id);await section.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  const result=await section.evaluate(s=>{
   const host=s.querySelector('.diagram-canvas'),svg=host.querySelector('svg'),r=svg.getBoundingClientRect(),cursor=new DOMPoint(Math.floor(r.x+r.width*.68),Math.floor(r.y+r.height*.57));
   const point=()=>cursor.matrixTransform(svg.getScreenCTM().inverse());
   const wheel=(ctrlKey,deltaY)=>{const e=new WheelEvent('wheel',{ctrlKey,deltaY,clientX:cursor.x,clientY:cursor.y,bubbles:true,cancelable:true});svg.dispatchEvent(e);return e.defaultPrevented;};
   const width=()=>svg.viewBox.baseVal.width;
   const initial=width(),a=point(),ordinary=wheel(false,-120),normalUnchanged=width()===initial;
   const cancelled=wheel(true,-120),zoomed=width(),b=point();
   const zoomOut=wheel(true,120),out=width();
   const zeroBefore=width(),zeroCancelled=wheel(true,0);
   for(let i=0;i<50;i++)wheel(true,-120);
   const upper=width();wheel(true,-120);const upperStable=width()===upper;
   for(let i=0;i<60;i++)wheel(true,120);
   const lower=width();wheel(true,120);const lowerStable=width()===lower;
   return {ordinary,normalUnchanged,cancelled,zoomed,initial,zoomOut,out,anchorError:Math.hypot(a.x-b.x,a.y-b.y),zeroCancelled,zeroUnchanged:zeroBefore===out,upperStable,lowerStable};
  });
  assert(!result.ordinary&&result.normalUnchanged);assert(result.cancelled&&result.zoomed<result.initial);assert(result.zoomOut&&result.out>result.zoomed);console.log(JSON.stringify(result));assert(result.anchorError<.01);assert(!result.zeroCancelled);assert(result.upperStable&&result.lowerStable);
  await section.locator('[data-ui="reset"]').click();
  const initial=await section.locator('.diagram-canvas>svg').getAttribute('viewBox');
  const box=await section.locator('.diagram-canvas>svg').boundingBox();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5);
  await page.keyboard.down('Control');await page.mouse.wheel(0,-120);await page.keyboard.up('Control');await page.waitForTimeout(100);
  assert.notEqual(await section.locator('.diagram-canvas>svg').getAttribute('viewBox'),initial,'actual Ctrl+wheel zooms');
  await section.locator('[data-ui="reset"]').click();assert.equal(await section.locator('.diagram-canvas>svg').getAttribute('viewBox'),initial);
  console.log(id+': Ctrl+wheel in/out, cursor anchor, ordinary wheel, limits and reset passed.');
 }
 await page.setViewportSize({width:390,height:914});await page.waitForTimeout(150);
 for(const id of ['spatial-9','spatial-10','game-11']){
  const mobile=await page.locator('#section-'+id+' .diagram-canvas').evaluate(host=>{const svg=host.querySelector('svg'),before=svg.getAttribute('viewBox'),e=new WheelEvent('wheel',{ctrlKey:true,deltaY:-100,bubbles:true,cancelable:true});svg.dispatchEvent(e);return {same:before===svg.getAttribute('viewBox'),cancelled:e.defaultPrevented};});
  assert(mobile.same&&!mobile.cancelled);
 }
 await page.close();
 console.log('Mobile scroll behavior preserved.');
 assert.deepEqual(errors,[]);console.log('No page errors. Preview pause, reset, zoom, translations and responsive layouts passed.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
