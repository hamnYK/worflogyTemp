import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();await p.locator('[data-action="skill"]').click();
  assert.equal(await p.locator('.enemy-card').count(),8);
  const distant=p.locator('.enemy-card[data-target="e7"]');assert.match(await distant.innerText(),/미확인 신호/);assert.doesNotMatch(await distant.innerText(),/HP|ARCHON/);
  assert.ok(await p.locator('.world-label.unidentified').count()>0);
  await p.screenshot({path:`output/${channel}-scan-signals.png`});assert.deepEqual(errors,[]);console.log(channel+': scan-only contacts hide identity/HP, direct contacts retained, scene rendered');
 }finally{await b.close();}
}
