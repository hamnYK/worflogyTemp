const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.cwd();
const scriptServer=http.createServer((req,res)=>{
 const file=req.url.includes('before')?'output/arcade-before-loading-fix.js':'js/coin-arcade.js';
 res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(file));
});
await new Promise(r=>scriptServer.listen(0,'127.0.0.1',r));
const secondary='http://127.0.0.1:'+scriptServer.address().port;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/fixture.html'){
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end('<!doctype html><html lang="en"><head><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/section-elevator.css"><link rel="stylesheet" href="/css/coin-arcade.css"><script defer src="/js/section-elevator.js"></script><script defer src="'+secondary+'/'+(url.search.includes('before')?'before':'after')+'.js"></script></head><body><main><section class="simple-section"><h2>First</h2></section><section class="simple-section"><h2>Second</h2></section></main></body></html>');return;
 }
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.mp4':'video/mp4','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(b);});
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const primary='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const messages=[],pageErrors=[],logs=[];
 page.on('console',m=>messages.push(m.text()));page.on('pageerror',e=>pageErrors.push(e.message));
 const cdp=await page.context().newCDPSession(page);await cdp.send('Log.enable');cdp.on('Log.entryAdded',({entry})=>logs.push(entry.text));
 await page.goto(primary+'/fixture.html?before');await page.locator('body > .section-elevator > .arcade-open').click();await page.locator('.arcade-play').click();
 await page.waitForFunction(()=>document.querySelector('.arcade-content').innerText.includes('Could not load'));
 assert(messages.some(m=>m.includes('about:blank')&&m.includes('module specifier')));
 console.log('REPRODUCED: cross-origin classic script fails relative dynamic import with about:blank.');
 messages.length=0;logs.length=0;
 await page.goto(primary+'/fixture.html');await page.locator('body > .section-elevator > .arcade-open').click();
 assert(await page.locator('.arcade-close').evaluate(e=>e===document.activeElement));
 assert(await page.locator('video').evaluate(v=>{v.focus();return v.inert&&v!==document.activeElement&&!v.hasAttribute('aria-hidden')&&!v.hasAttribute('tabindex');}));
 for(let i=0;i<4;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.tagName!=='VIDEO'));}
 await page.locator('.arcade-play').click();await page.waitForSelector('.chip-game[data-phase="ready"]');await page.waitForTimeout(300);
 assert(!messages.some(m=>/module specifier|about:blank/.test(m)));assert(!logs.some(m=>m.includes('Blocked aria-hidden')));
 await page.locator('.arcade-close').click();await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
 await page.goto(primary+'/index.html');await page.locator('body > .section-elevator > .arcade-open').click();await page.locator('.arcade-play').click();await page.waitForSelector('.chip-game[data-phase="ready"]');
 assert.deepEqual(pageErrors,[]);
 console.log('PASS: cross-origin and normal page module loading; video cannot take focus; CLOSE initial focus; Tab navigation; no blocked aria-hidden warning.');
}finally{await browser.close();server.close();scriptServer.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});