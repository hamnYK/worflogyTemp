const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':/\.mp4$/.test(file)?'video/mp4':'text/html; charset=utf-8');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 for(const pageName of ['index.html','en.html']){
 const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2026-09-25T04:59:58Z')});
 await p.goto('http://127.0.0.1:'+server.address().port+'/'+pageName);
 await p.locator('.null-sector-code').waitFor();
 await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('.null-sector-open span').first().textContent(),'\u25c0 | \u25b6');
 const styles=await p.locator('.null-sector-code').evaluate(e=>({size:getComputedStyle(e).fontSize,shadow:getComputedStyle(e).textShadow,token:getComputedStyle(e).getPropertyValue('--shadow-media-text')}));
 assert.equal(styles.size,'32px');
 const code=await p.locator('.null-sector-code').textContent();assert.match(code,/^\d{4}$/);
 assert.match(await p.locator('#title-game-12').textContent(),/NULL SECTOR/);
 await p.locator('#section-game-12').scrollIntoViewIfNeeded();
 await p.screenshot({path:'output/null-sector-'+pageName+'.png'});
 await p.locator('.arcade-open').click();await p.clock.runFor(1200);
 assert(await p.locator('.arcade-null-sector-play').isEnabled());
 await p.evaluate(()=>{window.starts=0;window.disposals=0;WorflogyNullSector.register((host,{onExit})=>{starts++;host.innerHTML='<div id="qa-game">Running<button id="qa-exit">Exit</button></div>';host.querySelector('button').onclick=onExit;return{dispose(){disposals++;}};});});
 await p.locator('.arcade-null-sector-play').click();
 await p.locator('#null-sector-key').fill(code==='0000'?'0001':'0000');await p.locator('.null-sector-entry button[type=submit]').click();assert.equal(await p.evaluate(()=>starts),0);
 await p.locator('#null-sector-key').fill(await p.evaluate(()=>WorflogyNullSector.currentCode()));await p.locator('.null-sector-entry button[type=submit]').click();assert.equal(await p.evaluate(()=>starts),1);
 await p.clock.fastForward(3600000);
 assert.notEqual(await p.locator('.null-sector-code').textContent(),code);assert(await p.locator('#qa-game').isVisible());assert.equal(await p.evaluate(()=>disposals),0);
 await p.locator('#qa-exit').click();await p.locator('.arcade-null-sector-play').click();await p.locator('#null-sector-key').fill(code);await p.locator('.null-sector-entry button[type=submit]').click();assert.equal(await p.evaluate(()=>starts),1);
 await p.locator('#null-sector-key').fill(await p.evaluate(()=>WorflogyNullSector.currentCode()));await p.locator('.null-sector-entry button[type=submit]').click();assert.equal(await p.evaluate(()=>starts),2);
 assert.equal(await p.evaluate(()=>new Set(Array.from({length:10000},(_,i)=>WorflogyNullSector.currentCode(i*3600000))).size),10000);
 assert.deepEqual(errors,[]);
 await p.setViewportSize({width:390,height:844});await p.locator('.arcade-close').click();await p.locator('#section-game-12').scrollIntoViewIfNeeded();await p.screenshot({path:'output/null-sector-mobile-'+pageName+'.png'});
 assert(await p.locator('.null-sector-code').isVisible());
 console.log(pageName+': title, 4-digit display, hourly rotation, wrong/correct entry, uninterrupted session, re-entry, mobile PASS');await p.close();
 }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
