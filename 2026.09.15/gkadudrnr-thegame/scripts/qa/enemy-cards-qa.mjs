import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5174/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 assert.equal(await p.locator('[data-target="e0"] .ink-portrait').count(),1);
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="skill"]').click();
 assert.ok(await p.locator('.contact-card.unidentified').count()>0);
 for(const card of await p.locator('.contact-card.unidentified').all()){
  assert.equal(await card.locator('.ink-portrait').count(),0);assert.equal(await card.locator('.contact-portrait.unknown').count(),1);assert.equal(await card.locator('.contact-health i').count(),0);assert.match(await card.innerText(),/병과 미확인/);
 }
 const state=await p.evaluate(()=>__game.state);const e=state.units.find(u=>u.id==='e0');e.observedLaser=true;e.hp=0;e.ap=0;e.downed={remaining:3,at:state.turn};
 await p.locator('#file').setInputFiles({name:'intel-qa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'null-sector-save',version:1,state}))});
 await p.locator('[data-target="e0"].observed').waitFor();assert.match(await p.locator('[data-target="e0"]').innerText(),/복구 3턴/);assert.equal(await p.locator('[data-target="e0"] .contact-ability.confirmed').count(),1);
 const ally=await p.locator('[data-unit="p0"]').boundingBox();
 for(const card of await p.locator('.contact-card').all()){const bounds=await card.boundingBox();assert.equal(bounds.height,ally.height);assert.equal(await card.evaluate(el=>el.scrollHeight<=el.clientHeight),true);}
 await p.screenshot({path:`output/${channel}-enemy-cards.png`});assert.deepEqual(errors,[]);console.log(channel+': equal roster card heights, portraits, unidentified silhouette privacy, observed weapon, downed status and save import verified');
 }finally{await b.close();}
}
