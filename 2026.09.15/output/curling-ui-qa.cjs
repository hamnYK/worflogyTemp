const path=require('path'),assert=require('assert'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);
await page.locator('body > .section-elevator > .arcade-open').click();await page.waitForTimeout(1200);
assert.equal(await page.locator('.arcade-cards .wf-card').count(),3);
await page.locator('.arcade-curling-play').click();await page.waitForSelector('.curling-game[data-phase="ready"]');
await page.waitForTimeout(1000);await page.screenshot({path:'output/curling-desktop.png'});
async function shot(p,a){await page.locator('.chip-power').fill(p);await page.locator('.curl-aim').fill(a);await page.locator('.chip-fire').click();assert(await page.locator('.chip-fire').isDisabled());await page.waitForFunction(()=>document.querySelector('.curling-game').dataset.phase!=='moving',{},{timeout:25000});}
await shot('4.38','0');assert.equal(await page.locator('.curling-game').getAttribute('data-score'),'3');
await shot('4.3','0.055');await shot('4.3','-0.055');
await page.waitForSelector('.arcade-curling-play');await page.locator('.arcade-curling-play').click();
for(let i=0;i<3;i++)await shot('1','0');
await page.waitForSelector('.curling-game[data-phase="ready"]');assert.equal(await page.locator('.curling-game').getAttribute('data-score'),'0');
await page.locator('[data-camera="left"]').click();await page.locator('[data-camera="in"]').click();
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'output/curling-mobile.png'});
assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));
await page.locator('.chip-back').click();await page.locator('.arcade-curling-play').click();await page.locator('.arcade-close').click();
await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
assert.deepEqual(errors,[]);console.log('PASS: file:// curling, score/win/lobby, fail/retry, camera, mobile, disposal');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
