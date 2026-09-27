const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=process.cwd(),missing=new Set();
 const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){missing.add(pathname);res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(data);});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 page.on('pageerror',e=>errors.push(e.message));
 for(const entry of ['index.html','en.html']){
 await page.goto(base+'/'+entry);await page.waitForTimeout(700);
 console.log(JSON.stringify({width,entry,errors,overflow:await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})),brokenHashes:await page.locator('a[href^="#"]').evaluateAll(a=>a.filter(e=>e.hash&&!document.getElementById(decodeURIComponent(e.hash.slice(1)))).map(e=>e.hash))}));
 await page.locator('#open-contact-modal').click();
 await page.locator('#contact-name').fill('QA test');await page.locator('#contact-company').fill('QA');await page.locator('#contact-email').fill('test@example.invalid');await page.locator('#contact-message').fill('테스트 draft');
 await page.keyboard.press('Escape');assert(await page.locator('#open-contact-modal').evaluate(e=>e===document.activeElement));
 await page.locator('#language-toggle').click();await page.locator('#open-contact-modal').click();assert.equal(await page.locator('#contact-message').inputValue(),'테스트 draft');await page.keyboard.press('Escape');
 await page.locator('#open-press').click();await page.keyboard.press('Escape');assert(await page.locator('#open-press').evaluate(e=>e===document.activeElement));
 await page.locator('#language-toggle').click();
 console.log('PASS dialogs/language/draft',width,entry);
 await page.locator('#open-contact-modal').click();
 await page.evaluate(()=>{window.fetch=async()=>{throw new TypeError('QA simulated offline');};});
 await page.locator('#contact-form [type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#contact-status').textContent.length>0);
 assert(await page.locator('#contact-dialog').evaluate(e=>e.open));
 assert.equal(await page.locator('#contact-message').inputValue(),'테스트 draft');
 assert(await page.locator('#contact-form [type=submit]').isEnabled());
 await page.evaluate(()=>{window.fetch=async()=>({type:'opaque'});});
 await page.locator('#contact-form [type=submit]').click();
 await page.waitForFunction(()=>!document.querySelector('#contact-dialog').open);
 assert.equal(await page.locator('#contact-message').inputValue(),'테스트 draft');
 assert(await page.locator('#contact-result').isVisible());
 console.log('PASS mocked inquiry failure/retry/opaque response',width,entry);
 const workshop=await page.evaluate(()=>{
 const original=window.open,calls=[],opened={closed:false,opener:null,focus(){}};
 window.open=(...args)=>{calls.push(args);return opened;};
 try{
 const link=document.querySelector('.workshop-floating');
 const modified=[{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}].map(options=>{
 const e=new MouseEvent('click',{bubbles:true,cancelable:true,...options});
 // Inspect app cancellation, then prevent navigation for this test.
 let canceled;const capture=event=>{canceled=event.defaultPrevented;event.preventDefault();};
 document.addEventListener('click',capture,{once:true});link.dispatchEvent(e);return canceled;
 });
 const modifiedOpens=calls.length;
 const normal=new MouseEvent('click',{bubbles:true,cancelable:true});link.dispatchEvent(normal);
 link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
 opened.closed=true;link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
 return {modified,modifiedOpens,normalCanceled:normal.defaultPrevented,totalOpens:calls.length};
 }finally{window.open=original;}
 });
 assert.deepEqual(workshop,{modified:[false,false,false,false,false],modifiedOpens:0,normalCanceled:true,totalOpens:2},'Workshop must preserve native modifier clicks and reuse its window only for ordinary clicks');
 console.log('PASS workshop modified clicks and normal window reuse',width,entry);
 }
 for(const id of ['overview','game-11']){
 const section=page.locator('#section-'+id);
 await section.locator('[data-ui="play-story"]').click();
 await page.waitForTimeout(200);
 assert(await section.locator('[data-ui="next-stage"]').isEnabled());
 await section.locator('[data-ui="next-stage"]').click();
 await section.locator('[data-ui="reset"]').click();
 assert(await section.locator('[data-ui="next-stage"]').isDisabled());
 }
 assert.deepEqual(errors,[]);
 console.log('PASS overview/football playback, next step and reset',width);
 await page.close();
 }
 assert.deepEqual([...missing],[]);console.log('PASS no missing local resources');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

