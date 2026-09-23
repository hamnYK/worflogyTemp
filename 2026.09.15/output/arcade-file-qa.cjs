const path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const cdp=await page.context().newCDPSession(page);await cdp.send('Log.enable');cdp.on('Log.entryAdded',({entry})=>{if(entry.level==='error')errors.push(entry.text);});
const requested=[];page.on('request',r=>requested.push(r.url()));
for(const file of ['index.html','en.html']){
 await page.goto('file:///'+path.join(process.cwd(),file).replaceAll('\\','/'));
 await page.locator('#language-toggle').click();await page.locator('#language-toggle').click();
 await page.locator('body > .section-elevator > .arcade-open').click();
 await page.waitForFunction(()=>document.querySelector('video.arcade-background-video').currentTime>.1);
 await page.locator('.arcade-play').click();await page.waitForSelector('.chip-game[data-phase="ready"]');
 assert(await page.evaluate(()=>typeof window.WorflogyChipFootball.mountFootball==='function'));
 await page.locator('[data-chip="0"]').click();await page.locator('.chip-power').fill('22');await page.locator('.chip-fire').click();
 await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.phase==='fail');
 await page.waitForFunction(()=>document.querySelector('.chip-game').dataset.phase==='ready');
 await page.locator('.arcade-close').click();await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
}
assert(!requested.some(url=>/\.mjs(?:$|\?)/.test(url)));
assert.deepEqual(errors,[]);
console.log('PASS: real file:// Korean/English pages, language toggles, video playback, WebGL game, auto reset, close; no module fetches or security errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});