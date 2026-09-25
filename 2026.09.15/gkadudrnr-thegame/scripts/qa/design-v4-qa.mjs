import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5173/design-system.html');
  await p.locator('#implemented').scrollIntoViewIfNeeded();
  await p.locator('[data-faction-demo]').first().click();assert.equal(await p.locator('[data-faction-demo]').first().getAttribute('aria-pressed'),'true');
  await p.locator('[data-enlist-demo]').last().click();assert.equal(await p.locator('[data-enlist-demo]').last().getAttribute('aria-pressed'),'true');
  await p.locator('[data-action-demo]').nth(1).click();assert.equal(await p.locator('[data-action-demo]').nth(1).getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.locator('.ds-hud-samples').scrollIntoViewIfNeeded();await p.screenshot({path:`output/${channel}-design-v4.png`});
  await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);
  assert.equal(await p.locator('#prologue-text p').first().evaluate(e=>getComputedStyle(e).fontSize),'15px');
  await p.screenshot({path:`output/${channel}-readable-prologue.png`});
  await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();
  assert.equal(await p.locator('.agent-inspect small').first().evaluate(e=>getComputedStyle(e).fontSize),'12px');
  await p.locator('#deploy').scrollIntoViewIfNeeded();await p.screenshot({path:`output/${channel}-readable-preparation.png`});
  await p.locator('#deploy').click();await p.waitForTimeout(400);
  assert.equal(await p.locator('#actions .action small').first().evaluate(e=>getComputedStyle(e).fontSize),'12px');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const copyright=await p.locator('.game-copyright').boundingBox(),footer=await p.locator('#app>footer').boundingBox();assert.ok(footer.y+footer.height<=copyright.y+1);
  const actions=await p.locator('#actions').boundingBox(),end=await p.locator('#end-turn').boundingBox();assert.ok(actions.x+actions.width<=end.x+1);
  await p.screenshot({path:`output/${channel}-readable-battle.png`});
  await p.locator('#home').click();await p.locator('[data-faction="ai"]').click();await p.locator('#deploy').click();await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>window.__game.state.faction),'ai');
  assert.deepEqual(errors,[]);console.log(channel+': gallery controls, typography, both factions, 1280px layout, footer clearance passed');
 }finally{await browser.close();}
}
