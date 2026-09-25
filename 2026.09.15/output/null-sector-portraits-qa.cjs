const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.env.NULL_SECTOR_QA_ROOT||process.cwd();
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\/preview\//,''));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html; charset=utf-8','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm','.mp4':'video/mp4','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[],bad=[];p.on('console',m=>{if(m.type()==='error'&&/CORS|Unsafe attempt|ERR_FAILED/.test(m.text()))errors.push(m.text().slice(0,300));});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('gkadudrnr-thegame'))bad.push(r.url());});
await p.goto(process.argv.includes('--file')?require('url').pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/preview/index.html');await p.locator('.arcade-open').click();await p.locator('.arcade-null-sector-play').click();
const code=await p.evaluate(()=>WorflogyNullSector.currentCode());
await p.locator('#null-sector-key').fill(code==='0000'?'0001':'0000');await p.locator('.null-sector-entry [type=submit]').click();assert.equal(await p.locator('.null-sector-frame').count(),0);
await p.locator('#null-sector-key').fill(code);await p.locator('.null-sector-entry [type=submit]').click();
const game=p.frameLocator('.null-sector-frame');await game.locator('#skip-prologue').waitFor({timeout:60000});await p.locator('.null-sector-load-status').waitFor({state:'hidden',timeout:60000});
await game.locator('#skip-prologue').click();await game.locator('[data-faction=human]').click();
async function checkPortraits(faction){
 const results=await game.locator('.agent-inspect .ink-portrait').evaluateAll(async nodes=>Promise.all(nodes.map(async e=>{
  const bg=getComputedStyle(e).backgroundImage;
  if(bg==='none')return {loaded:false};
  const img=new Image();img.src=bg.slice(5,-2);await img.decode();
  return {loaded:img.naturalWidth>0&&img.naturalHeight>0,position:getComputedStyle(e).backgroundPosition,inlineSize:e.getAttribute('style').length};
 })));
 assert.equal(results.length,7);assert(results.every(r=>r.loaded&&r.inlineSize<200));assert.equal(new Set(results.map(r=>r.position)).size,7);
 console.log('PASS portraits:',faction,process.argv.includes('--file')?'file':'HTTP',results.length);
 await p.screenshot({path:'output/portraits-'+faction+(process.argv.includes('--file')?'-file':'-http')+'.png'});
}
await checkPortraits('human');await game.locator('#prep-back').click();await game.locator('[data-faction=ai]').click();await checkPortraits('ai');
await game.locator('#deploy').click();await game.locator('#viewport canvas').waitFor({timeout:60000});
const frame=p.frames().find(f=>f.url().includes('/gkadudrnr-thegame/'));await frame.evaluate(()=>window.__sessionMarker='same-game');
await p.evaluate(()=>{const previous=Date.now();Date.now=()=>previous+3600000;document.dispatchEvent(new Event('visibilitychange'));});assert.notEqual(await p.locator('.null-sector-code').textContent(),code);assert.equal(await frame.evaluate(()=>window.__sessionMarker),'same-game');assert(await game.locator('#viewport canvas').isVisible());
await p.screenshot({path:'output/null-sector-compatible-desktop.png'});await p.locator('.null-sector-player-bar button').click();assert.equal(await p.locator('.null-sector-frame').count(),0);
await p.locator('.arcade-null-sector-play').click();await p.locator('#null-sector-key').fill(code);await p.locator('.null-sector-entry [type=submit]').click();assert.equal(await p.locator('.null-sector-frame').count(),0);
await p.locator('#null-sector-key').fill(await p.evaluate(()=>WorflogyNullSector.currentCode()));await p.locator('.null-sector-entry [type=submit]').click();await game.locator('#app header').waitFor({timeout:60000});
await p.setViewportSize({width:390,height:844});assert(await p.locator('.null-sector-player-bar button').isVisible());await p.screenshot({path:'output/null-sector-compatible-mobile.png'});await p.locator('.null-sector-player-bar button').click();assert.equal(await p.locator('.null-sector-frame').count(),0);
assert.deepEqual(bad,[]);assert.deepEqual(errors,[]);console.log('PASS: release/subpath assets, wrong/correct code, real prologue -> faction -> battle, hourly rollover retains game, exit cleanup, re-entry code, mobile return control.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
