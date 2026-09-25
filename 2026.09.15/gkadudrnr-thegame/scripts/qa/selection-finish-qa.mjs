import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{const p=await browser.newPage({viewport:{width:1280,height:720}});await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();
 const card=p.locator('.prep-agent').first();await card.locator('.agent-inspect').click();
 assert.equal(await card.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
 assert.equal(await card.locator('.agent-inspect').evaluate(e=>getComputedStyle(e).boxShadow),'none');
 assert.equal(await card.locator('.agent-portrait').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
 await p.keyboard.press('Tab');assert.equal(await card.locator('.enlist').evaluate(e=>e.matches(':focus-visible')),true);
 assert.match(await card.evaluate(e=>getComputedStyle(e).boxShadow),/inset/);
 await p.keyboard.press('Space');await p.locator('#recommended').click();await p.locator('#deploy').click();
 const a=await p.locator('#actions').boundingBox(),end=await p.locator('#end-turn').boundingBox();assert.ok(a.x+a.width<=end.x);
 console.log(channel+': single selection emphasis, visible keyboard focus, keyboard toggle and battle layout passed');
 }finally{await browser.close();}
}
