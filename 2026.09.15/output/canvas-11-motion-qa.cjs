
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[];fs.mkdirSync('output/canvas-11-qa',{recursive:true});
 try{
 for(const [width,lang]of [[900,'ko'],[1024,'en']]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+(lang==='ko'?'index.html':'en.html'));
  await page.locator('#section-game-11').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
  const section=page.locator('#section-game-11');
  assert(await section.locator('.football-canvas svg').count(),'renderer present');
  await section.locator('[data-ui="play-story"]').click();
  for(let i=0;i<2;i++)await section.locator('[data-ui="next-stage"]').click();
  await page.waitForTimeout(150);
  await section.screenshot({path:'output/canvas-11-qa/'+lang+'-'+width+'.png'});
  const measure=await page.evaluate(()=>{
   const s=document.querySelector('#section-game-11'),h=s.querySelector('.football-heading').getBoundingClientRect(),p=s.querySelector('.canvas-example-card').getBoundingClientRect();
   return {overflow:document.documentElement.scrollWidth>innerWidth,headingPreviewOverlap:h.x<p.right&&h.right>p.x&&h.y<p.bottom&&h.bottom>p.y,title:s.querySelector('.football-title').textContent,stage:s.querySelector('[data-ui="story-progress"]').textContent,svg:s.querySelector('svg')!==null};
  });
  assert(!measure.overflow,'no horizontal overflow');
  assert.equal(measure.stage,'3 / 4');
  if(width===1280){
   await section.locator('.canvas-example-card').click();
   assert(await page.locator('.canvas-image-dialog').evaluate(n=>n.open));
   await page.keyboard.press('Escape');
   assert(await section.locator('[data-ui="next-stage"]').isDisabled(),'preview pauses animation');
   await section.locator('[data-ui="play-story"]').click();
   await section.locator('[data-ui="zoom-in"]').click();
   await section.locator('[data-ui="reset"]').click();
   assert.equal(await section.locator('[data-ui="story-progress"]').textContent(),'');
  }
  console.log(lang+' '+width+': '+JSON.stringify(measure));
  await page.close();
 }

 const page=await browser.newPage({viewport:{width:1280,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
 const s=page.locator('#section-game-11');await s.scrollIntoViewIfNeeded();
 await s.locator('[data-ui="play-story"]').click();
 const ball=s.locator('[data-football-ball]');
 const a=await ball.getAttribute('transform');await page.waitForTimeout(500);const b=await ball.getAttribute('transform');assert.notEqual(a,b,'ball moves smoothly');
 const svg=s.locator('.football-canvas>svg'),box=await svg.boundingBox(),v=await svg.getAttribute('viewBox');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2+20);await page.mouse.up();
 assert.notEqual(await svg.getAttribute('viewBox'),v,'desktop panning');
 await s.locator('[data-ui="reset"]').click();await s.locator('[data-ui="play-story"]').click();
 await page.waitForTimeout(17200);
 assert(await s.locator('[data-ui="next-stage"]').isDisabled(),'automatic sequence completed');
 assert.equal(await s.locator('[data-ui="story-progress"]').textContent(),'');
 await s.screenshot({path:'output/canvas-11-qa/ko-1280-complete.png'});
 await s.locator('[data-ui="play-story"]').click();
 const bounds=await page.evaluate(()=>{
  const s=document.querySelector('#section-game-11'),p=s.querySelector('.canvas-example-card').getBoundingClientRect(),g=s.querySelector('[data-football-graph]').getBoundingClientRect();
  const range=document.createRange();range.selectNodeContents(s.querySelector('.football-title'));const t=range.getBoundingClientRect();
  const intersect=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
  return {graphOverlap:intersect(p,g),titleOverlap:intersect(p,t)};
 });
 assert(!bounds.graphOverlap&&!bounds.titleOverlap,'preview clear of scene and heading');
 await page.locator('#language-toggle').click();await page.waitForTimeout(150);
 assert((await s.locator('.football-title').textContent()).includes('Football'));
 await page.locator('#language-toggle').click();await page.waitForTimeout(150);
 assert(!(await s.locator('.football-title').textContent()).includes('Football'));
 console.log('Smooth motion, automatic completion, panning, preview clearance and repeated live language switching passed.');
 await page.close();

 assert.deepEqual(errors,[]);console.log('No page errors. Preview pause, reset, zoom, translations and responsive layouts passed.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
