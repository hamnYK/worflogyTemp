const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('../tmp/claw-check/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg'};
const games=['play','basketball-play','curling-play','book-flip-play','eraser-play','ping-play','triangle-play','boxes-play','pebble-play','claw-play'];
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];const out=path.join(__dirname,'mobile-arcade');fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:412,height:914},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const metrics=()=>p.evaluate(()=>{
   const scope=document.querySelector('.coin-arcade[open]')||document.body;
   const outside=[...scope.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&(r.right>innerWidth+1||r.left<-1)&&!e.closest('.arcade-doors');}).slice(0,15).map(e=>({tag:e.tagName,cls:e.className,width:Math.round(e.getBoundingClientRect().width)}));
   const small=[...scope.querySelectorAll('button,input,select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<43||r.height<43);}).map(e=>({label:e.getAttribute('aria-label')||e.textContent,cls:e.className,w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}));
   return{width:innerWidth,scroll:document.documentElement.scrollWidth,dialogScroll:scope.scrollWidth,outside,small,status:scope.querySelector('.chip-status')?.textContent};
  });
  for(const lang of ['index','en']){
   await p.goto(`http://127.0.0.1:${server.address().port}/${lang}.html`);await p.waitForTimeout(1200);
   results.push({page:lang,...await metrics()});await p.screenshot({path:path.join(out,lang+'.png'),fullPage:true});
   await p.locator('body > .section-elevator > .arcade-open').tap();await p.waitForTimeout(300);
   results.push({page:lang+' lobby',...await metrics()});await p.screenshot({path:path.join(out,lang+'-lobby.png')});
   for(const kind of games){
    const b=p.locator('.arcade-'+kind);if(!await b.count()){console.log('MISSING',kind);continue;}
    await b.tap();await p.waitForSelector('.chip-game');await p.waitForTimeout(kind==='claw-play'?1600:500);
    await p.locator('.chip-game').evaluate(e=>e.scrollIntoView({block:'start'}));
    results.push({page:lang+' '+kind,...await metrics()});
    await p.screenshot({path:path.join(out,lang+'-'+kind+'.png')});
    for(const width of [320,390,1280]){await p.setViewportSize({width,height:914});await p.waitForTimeout(100);const m=await metrics();results.push({page:lang+' '+kind+' '+width,...m});if(m.dialogScroll>width+1)throw Error('Overflow: '+lang+' '+kind+' '+width);}
    await p.setViewportSize({width:412,height:914});
    await p.locator('.chip-back,.claw-back').tap();await p.waitForSelector('.arcade-cards');
   }
   await p.locator('.arcade-close').tap();await p.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
  }
  fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results:results.map(r=>({page:r.page,width:r.dialogScroll,small:r.small.length,outside:r.outside.length})),errors},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
