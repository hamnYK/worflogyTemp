import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/design-system.html#art-direction');
 await page.locator('#art-direction').scrollIntoViewIfNeeded();
 await page.locator('.ds-art-pair img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert.equal(await page.locator('.ds-art-pair img').count(),2);
 assert.match(await page.locator('#art-direction').innerText(),/3D 요원·전장/);assert.match(await page.locator('.ds-art-status').innerText(),/후속 전환/);
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'output/design-system-art-v3.png'});
 await page.setViewportSize({width:1280,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('Design gallery: approved artwork, cross-medium standards, implementation status and desktop layout passed.');
}finally{await browser.close();}
