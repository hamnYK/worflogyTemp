import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
  await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-front"]').click();
  assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
  await p.locator('[data-unit="p0"]').click({button:'right'});assert.equal(await p.locator('[data-action="watch"]').isDisabled(),true);await p.locator('[data-action="skill"]').click();
  assert.equal(await p.evaluate(()=>__game.state.units[0].ap),0);assert.equal(await p.evaluate(()=>__game.state.units[0].watch),true);
  const s=newGame();s.cover.forEach(c=>c.hp=0);s.units[4].x=5;s.units[4].z=2;
  async function load(state){await p.locator('#file').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(state)))});await p.waitForTimeout(250);}
  await load(s);await p.locator('[data-target="e0"]').click();assert.match(await p.locator('.attack-metrics').innerText(),/1 AP/);await p.locator('#confirm-attack').click();assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
  await p.locator('[data-target="e0"]').click();await p.locator('#confirm-attack').click();assert.equal(await p.evaluate(()=>__game.state.units[0].ap),0);
  const expired=newGame();expired.turn=expired.turnLimit;expired.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);await load(expired);await p.locator('#end-turn').click();await p.waitForFunction(()=>__game.state.status==='lost');
  assert.deepEqual(errors,[]);console.log(channel+': watch then skill, two attacks, 1 AP preview, last-turn expiry passed');
 }finally{await b.close();}
}
