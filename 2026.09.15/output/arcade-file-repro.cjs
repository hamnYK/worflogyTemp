const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('CONSOLE',m.text().slice(0,1200));});
page.on('pageerror',e=>console.log('PAGEERROR',e.message));
const cdp=await page.context().newCDPSession(page);await cdp.send('Log.enable');cdp.on('Log.entryAdded',({entry})=>console.log('LOG',entry.text.slice(0,1500)));
await page.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);await page.waitForTimeout(1500);console.log('STAGE initial');
await page.locator('body > .section-elevator > .arcade-open').click();await page.waitForTimeout(1500);console.log('STAGE open');
await page.locator('.arcade-play').click();await page.waitForTimeout(1500);console.log('STAGE play');
await page.locator('.arcade-close').click();await page.waitForTimeout(1500);console.log('STAGE close');
}finally{await browser.close();}})();