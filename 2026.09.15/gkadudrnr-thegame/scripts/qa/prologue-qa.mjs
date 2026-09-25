import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>!!window.__game);await page.evaluate(()=>document.fonts.ready);
  assert.ok(await page.locator('#prologue').isVisible());assert.ok(await page.locator('#landing').isHidden());assert.ok(await page.locator('#prologue-prev').isDisabled());
  await page.locator('.prologue-image').evaluate(img=>img.decode());
  const initial=await page.evaluate(()=>__game.state);
  await page.screenshot({path:`output/${channel}-prologue-01.png`});
  await page.locator('#prologue-next').click();assert.equal(await page.locator('#prologue-progress').textContent(),'2 / 6');
  await page.locator('#prologue-prev').click();assert.equal(await page.locator('#prologue-progress').textContent(),'1 / 6');
  await page.locator('#skip-prologue').click();assert.ok(await page.locator('#landing').isVisible());
  await page.locator('#replay-prologue').click();assert.equal(await page.locator('#prologue-progress').textContent(),'1 / 6');
  for(let i=0;i<5;i++){await page.locator('#prologue-next').click();await page.locator('.prologue-image').evaluate(img=>img.decode());await page.screenshot({path:`output/${channel}-story-${i+2}.png`});}
  assert.equal(await page.locator('#prologue-next').textContent(),'진영 선택하기');await page.screenshot({path:`output/${channel}-prologue-06.png`});
  await page.locator('#prologue-next').click();assert.ok(await page.locator('#prologue').isHidden());assert.ok(await page.locator('#landing').isVisible());
  assert.deepEqual(await page.evaluate(()=>__game.state),initial);
  await page.locator('[data-faction="human"]').click();assert.ok(await page.locator('#preparation').isVisible());await page.locator('#deploy').click();assert.ok(await page.locator('#lobby').isHidden());
  await page.locator('#home').click();assert.ok(await page.locator('#landing').isVisible());
  await page.setViewportSize({width:1280,height:720});await page.locator('#replay-prologue').click();
  await page.locator('#prologue-next').scrollIntoViewIfNeeded();await page.screenshot({path:`output/${channel}-prologue-720.png`});
  assert.equal(await page.locator('#lobby').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  await page.locator('#skip-prologue').click();await page.locator('[data-faction="ai"]').click();await page.locator('#deploy').click();assert.equal(await page.evaluate(()=>__game.state.faction),'ai');
  assert.deepEqual(errors,[]);console.log(channel+': prologue reading, previous, skip, replay, neutral exit, unchanged save, both factions and 1280 layout passed.');
 }finally{await browser.close();}
}
