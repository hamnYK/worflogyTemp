const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await browser.newPage({viewport:{width:1440,height:1100}});await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();
for(const game of process.argv[2]?[process.argv[2]]:['football','basketball','curling','book-flip','eraser','ping','triangle']){
await p.locator(game==='football'?'.arcade-play':'.arcade-'+game+'-play').click();await p.waitForSelector('.chip-game canvas');await p.waitForTimeout(1000);
console.log(game,await p.locator('.chip-game').evaluate(e=>({details:e.querySelectorAll('details').length,help:e.querySelectorAll('.chip-help,.triangle-help').length,status:e.querySelector('.chip-status')?.textContent,canvas:[e.querySelector('canvas').width,e.querySelector('canvas').height]})));
if(await p.locator('.chip-game details,.triangle-help').count())throw Error('Extra footer content: '+game);
await p.locator('.chip-game').screenshot({path:'output/review-'+game+'.png'});
if(game==='triangle'){await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.locator('.chip-game').screenshot({path:'output/review-triangle-mobile.png'});if(await p.locator('.chip-game').evaluate(e=>e.scrollWidth>e.clientWidth))throw Error('Mobile overflow');await p.setViewportSize({width:1440,height:1100});}
await p.locator('.chip-back').click();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
