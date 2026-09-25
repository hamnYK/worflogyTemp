import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();assert.match(await p.locator('.supply-guide').innerText(),/예비 배터리 2개/);await p.locator('#deploy').click();
 const s=newGame();s.units[0].supplies.charge=0;s.units[0].hp=4;s.units[0].cooldown=2;
 await p.locator('#file').setInputFiles({name:'supplies.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(s)))});await p.waitForTimeout(250);
 const open=async()=>{await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="equipment"]').click();};
 await open();await p.screenshot({path:`output/${channel}-supplies.png`});await p.locator('[data-action="reload"]').click();
 let u=await p.evaluate(()=>__game.state.units[0]);assert.equal(u.ap,1);assert.equal(u.cooldown,2);assert.equal(u.supplies.charge,6);assert.equal(u.supplies.batteries,1);
 await open();assert.equal(await p.locator('[data-action="reload"]').isDisabled(),true);await p.locator('[data-action="firstaid"][data-ally="p0"]').click();
 u=await p.evaluate(()=>__game.state.units[0]);assert.equal(u.ap,0);assert.equal(u.hp,7);assert.equal(u.supplies.kits,0);
 assert.match(await p.locator('[data-unit="p0"]').innerText(),/충전 6\/6/);assert.deepEqual(errors,[]);console.log(channel+': equipment submenu, reload, cooldown persistence, self aid, supply counters passed');
 }finally{await b.close();}
}
