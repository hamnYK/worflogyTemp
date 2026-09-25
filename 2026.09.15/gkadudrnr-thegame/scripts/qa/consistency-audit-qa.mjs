import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 async function load(s){await p.locator('#file').setInputFiles({name:'audit.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(s)))});await p.waitForTimeout(300);}
 assert.equal(await p.locator('#target-labels .world-label:not(.relay-label)').count(),12);
 await load(newGame('human',undefined,undefined,1));assert.equal(await p.locator('#target-labels .world-label:not(.relay-label)').count(),8);
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units[0].supplies.charge=1;await load(s);
 assert.equal(await p.locator('#target-labels .world-label:not(.relay-label)').count(),12);
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-front"]').click();await p.locator('[data-target="e0"]').click();
 assert.equal(await p.evaluate(()=>__game.state.units[0].supplies.charge),1);await p.locator('#cancel-attack').click();
 assert.equal(await p.evaluate(()=>__game.state.units[0].watch),true);await p.locator('[data-target="e0"]').click();await p.locator('#confirm-attack').click();
 assert.equal(await p.evaluate(()=>__game.state.units[0].watch),false);assert.equal(await p.evaluate(()=>__game.state.units[0].supplies.charge),0);assert.doesNotMatch(await p.locator('[data-unit="p0"]').innerText(),/경계 중/);
 await p.locator('#home').click();await p.locator('#continue').click();await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>__game.state.units[0].supplies.charge),0);
 const repair=newGame('human',[4,0,2,5]);repair.units[1].hp=0;repair.units[1].ap=0;repair.units[1].downed={remaining:3,at:1};await load(repair);
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="skill"]').click();const box=await p.locator('#viewport').boundingBox(),pos=await p.evaluate(()=>__game.project(1,4));await p.mouse.click(box.x+pos.x,box.y+pos.y);
 assert.equal(await p.evaluate(()=>__game.state.units[1].hp),5);assert.equal(await p.evaluate(()=>__game.state.units[1].ap),0);
 assert.deepEqual(errors,[]);console.log(channel+': 12/8 unit save reload, preview cancellation, last-charge watch state, autosave persistence, downed recovery passed');
 }finally{await b.close();}
}
