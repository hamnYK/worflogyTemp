import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="ai"]').click();assert.match(await p.locator('#brief-copy').innerText(),/침투조/);assert.match(await p.locator('#failure').innerText(),/3\/3/);await p.locator('#deploy').click();
 assert.equal(await p.locator('.relay-label:visible').count(),2);assert.match(await p.locator('#objectives').innerText(),/북부 중계소/);
 const s=newGame('ai');s.units[0].x=2;s.units[0].z=2;s.defense.nodes[0].breach=2;
 await p.locator('#file').setInputFiles({name:'defense.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(s)))});await p.waitForTimeout(300);
 assert.match(await p.locator('#objectives').innerText(),/장악 임박/);await p.screenshot({path:`output/${channel}-defense-pressure.png`});
 await p.locator('[data-unit="p0"]').click({button:'right'});assert.match(await p.locator('[data-action="hack"]').innerText(),/노드 복구/);await p.locator('[data-action="hack"]').click();assert.equal(await p.evaluate(()=>__game.state.defense.nodes[0].breach),1);assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
 await p.locator('#end-turn').click();await p.waitForFunction(()=>__game.state.turn===2||__game.state.status!=='active');assert.deepEqual(errors,[]);console.log(channel+': defense briefing, objective markers, danger status, 1 AP recovery, enemy turn passed');
 }finally{await b.close();}
}
