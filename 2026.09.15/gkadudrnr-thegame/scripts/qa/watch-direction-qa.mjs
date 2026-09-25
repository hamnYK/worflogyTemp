import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.QA_URL||'http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const open=async()=>{await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();};
 const before=await p.evaluate(()=>__game.state);await open();assert.equal(await p.locator('[data-action^="watch-"]').count(),4);assert.deepEqual(await p.evaluate(()=>__game.state),before);
 await p.locator('[data-action="watch-left"]').hover();await p.screenshot({path:`output/${channel}-watch-direction.png`});await p.keyboard.press('Escape');assert.deepEqual(await p.evaluate(()=>__game.state),before);
 await open();await p.locator('[data-action="watch-rear"]').click();const state=await p.evaluate(()=>__game.state);assert.equal(state.units[0].ap,1);assert.equal(state.units[0].watchFacing,3);assert.match(await p.locator('[data-unit="p0"]').innerText(),/후면 경계/);
 assert.equal(state.units[0].facing,3);await p.waitForTimeout(400);await p.screenshot({path:`output/${channel}-facing-fixed.png`});
 assert.equal(await p.locator('#unit-commands').isVisible(),false);assert.deepEqual(errors,[]);console.log(channel+': direction submenu, cancel atomicity, preview, confirmed 1 AP, persistent rear-facing watch passed');
 }finally{await b.close();}
}
