const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.env.NULL_SECTOR_QA_ROOT||process.cwd();
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\/preview\//,''));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html; charset=utf-8','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm','.mp4':'video/mp4','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[],bad=[];p.on('console',m=>{if(m.type()==='error'&&/CORS|Unsafe attempt|ERR_FAILED/.test(m.text()))errors.push(m.text().slice(0,300));});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('ns'))bad.push(r.url());});
await p.goto(process.argv.includes('--file')?require('url').pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/preview/index.html');await p.locator('.arcade-open').click();await p.locator('.arcade-null-sector-play').click();
const code=await p.evaluate(()=>WorflogyNullSector.currentCode());
await p.locator('#null-sector-key').fill(code==='0000'?'0001':'0000');await p.locator('.null-sector-entry [type=submit]').click();assert.equal(await p.locator('.null-sector-frame').count(),0);
await p.locator('#null-sector-key').fill(code);await p.locator('.null-sector-entry [type=submit]').click();
const game=p.frameLocator('.null-sector-frame');await game.locator('#skip-prologue').waitFor({timeout:60000});await p.locator('.null-sector-load-status').waitFor({state:'hidden',timeout:60000});
await game.locator('#skip-prologue').click();
const sample=e=>{const s=getComputedStyle(e),cta=getComputedStyle(e.querySelector('.faction-cta b'));return {transform:s.transform,shadow:s.boxShadow,border:s.borderBottomColor,outline:s.outlineWidth,cta:cta.backgroundColor};};
for(const faction of ['human','ai']){
 const card=game.locator('[data-faction='+faction+']');await p.mouse.move(1,1);const before=await card.evaluate(sample);await card.hover();await p.waitForTimeout(250);const after=await card.evaluate(sample);console.log(faction,JSON.stringify({before,after}));
 if(process.argv.includes('--verify')){assert.notEqual(after.border,before.border);await p.mouse.move(1,1);await card.focus();assert.equal((await card.evaluate(sample)).outline,'3px');}
}
await p.screenshot({path:'output/faction-hover'+(process.argv.includes('--file')?'-file':'-http')+'.png'});

await p.emulateMedia({reducedMotion:'no-preference'});
const visual=e=>{const s=getComputedStyle(e);return {transform:s.transform,shadow:s.boxShadow,border:s.borderBottomColor,borderWidth:s.borderBottomWidth,radius:s.borderRadius};};
const actual={};
for(const faction of ['human','ai']){const card=game.locator('[data-faction='+faction+']');await card.evaluate(e=>e.blur());await card.hover();await p.waitForTimeout(250);actual[faction]=await card.evaluate(visual);assert.equal(actual[faction].transform,'matrix(1, 0, 0, 1, 0, -4)');}
await p.goto('http://127.0.0.1:'+server.address().port+'/preview/ns/dist/design-system.html');
for(const faction of ['human','ai']){const card=p.locator('.ds-paper .faction-choice.'+faction);await card.hover();await p.waitForTimeout(250);assert.deepEqual(await card.evaluate(visual),actual[faction]);await p.mouse.move(1,1);await card.focus();assert.deepEqual(await card.evaluate(e=>({width:getComputedStyle(e).outlineWidth,offset:getComputedStyle(e).outlineOffset})),{width:'3px',offset:'5px'});}
await p.screenshot({path:'output/null-sector-design-system-hover.png'});
console.log('PASS: game and design-system gallery share 4px hover, frame, shadow and 3px/5px keyboard focus.');
assert.deepEqual(errors,[]);

}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
