const path=require('path'),assert=require('assert'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();await p.waitForTimeout(1200);await p.locator('.arcade-basketball-play').click();await p.waitForSelector('.basketball-game[data-phase="ready"]');await p.waitForTimeout(500);
await p.screenshot({path:'output/basketball-two-attempts-default.png'});
for(let i=0;i<0;i++)await p.locator('[data-camera="out"]').click();
await p.screenshot({path:'output/basketball-central-court.png'});
for(let i=1;i<=2;i++){
assert.equal(await p.locator('.basketball-game').getAttribute('data-attempt'),String(i));
await p.locator('.basket-action').click();await p.waitForSelector('.basketball-game[data-phase="spinning"]');await p.waitForTimeout(600);
assert(await p.locator('.basket-aim:not(.basket-loft)').isDisabled());
await p.locator('.basket-action').click();
if(i===1){await p.waitForSelector('.basketball-game[data-phase="attempt-end"]');await p.waitForSelector('.basketball-game[data-phase="ready"]');}
}
await p.waitForSelector('.basketball-game[data-phase="results"]');
assert.equal(await p.locator('.basket-results strong').innerText(),'0 / 12');
await p.screenshot({path:'output/basketball-two-attempts-results.png'});
await p.waitForTimeout(3000);assert.equal(await p.locator('.basket-results').count(),1);
await p.waitForSelector('.arcade-basketball-play',{timeout:4000});
await p.locator('.arcade-basketball-play').click();await p.waitForSelector('.basketball-game[data-phase="ready"]');await p.setViewportSize({width:390,height:844});
for(let i=0;i<0;i++)await p.locator('[data-camera="out"]').click();
await p.screenshot({path:'output/basketball-central-mobile.png'});
assert(await p.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await p.locator('.arcade-close').click();await p.waitForFunction(()=>!document.querySelector('.coin-arcade').open);assert.deepEqual(errors,[]);
console.log('PASS: file:// central court, 2 failures count, score summary remains for 5s then lobby, mobile, disposal and no browser errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
