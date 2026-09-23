const path=require('path'),assert=require('assert'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);
await page.locator('body > .section-elevator > .arcade-open').click();await page.waitForTimeout(1200);
await page.locator('.arcade-basketball-play').click();await page.waitForSelector('.basketball-game[data-phase="ready"]');
assert(await page.locator('.basket-aim').isDisabled());
await page.screenshot({path:'output/basketball-ready.png'});
const timedCatch=()=>page.evaluate(()=>new Promise((resolve,reject)=>{
 const started=performance.now();function attempt(){
 const game=document.querySelector('.basketball-game');if(!game){reject(Error('Game missing'));return;}
 if(game.dataset.catchable==='true'){game.querySelector('.basket-action').click();resolve();return;}
 if(performance.now()-started>8000){reject(Error('No catch window'));return;}
 requestAnimationFrame(attempt);
 }attempt();
}));
await page.locator('.basket-action').click();await timedCatch();
await page.waitForSelector('.basketball-game[data-phase="held"]');assert(await page.locator('.basket-aim').isEnabled());
await page.screenshot({path:'output/basketball-held.png'});
await page.locator('.chip-power').fill('7');await page.locator('.basket-action').click();
await page.waitForSelector('.basketball-game[data-phase="fail"]');await page.waitForSelector('.basketball-game[data-phase="ready"]');
await page.locator('.basket-action').click();await timedCatch();await page.locator('.chip-power').fill('10.1');await page.locator('.basket-action').click();
await page.waitForSelector('.basketball-game[data-phase="won"]');await page.waitForSelector('.arcade-basketball-play');
await page.locator('.arcade-basketball-play').click();await page.waitForSelector('.basketball-game[data-phase="ready"]');
await page.locator('.chip-viewport canvas').focus();await page.keyboard.press('Space');await timedCatch();
await page.locator('[data-camera="left"]').click();await page.locator('[data-camera="in"]').click();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/basketball-mobile.png'});
assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await page.locator('.chip-back').click();await page.locator('.arcade-play').click();await page.waitForSelector('.chip-game:not(.basketball-game)[data-phase="ready"]');
await page.locator('.arcade-close').click();await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
assert.deepEqual(errors,[]);console.log('PASS: file:// 3D basketball, spin/catch/shoot, auto retry, scored return to lobby, keyboard, mobile, camera, football regression.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
