const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=process.env.NULL_SECTOR_QA_ROOT||process.cwd();
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\/preview\//,''));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html; charset=utf-8','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm','.mp4':'video/mp4','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[],bad=[];p.on('console',m=>{if(m.type()==='error'&&/CORS|Unsafe attempt|ERR_FAILED/.test(m.text()))errors.push(m.text().slice(0,300));});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('gkadudrnr-thegame'))bad.push(r.url());});
await p.goto(process.argv.includes('--file')?require('url').pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/preview/index.html');await p.locator('.arcade-open').click();await p.locator('.arcade-null-sector-play').click();
await p.evaluate(()=>document.fonts.ready);
await p.locator('#null-sector-key').fill('1234');await p.locator('.null-sector-entry').screenshot({path:'output/null-sector-entry-desktop.png'});
await p.setViewportSize({width:390,height:844});await p.locator('.null-sector-entry').screenshot({path:'output/null-sector-entry-mobile.png'});
const code=await p.evaluate(()=>WorflogyNullSector.currentCode());await p.locator('#null-sector-key').fill(code==='0000'?'0001':'0000');await p.locator('.null-sector-entry [type=submit]').click();assert.equal(await p.locator('#null-sector-key').getAttribute('aria-invalid'),'true');assert(await p.locator('#null-sector-error').isVisible());await p.locator('.null-sector-entry').screenshot({path:'output/null-sector-entry-error.png'});await p.locator('#null-sector-key').fill(code);assert(await p.locator('#null-sector-error').isHidden());console.log('PASS: homepage form components, mobile layout, error state/reset');
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
