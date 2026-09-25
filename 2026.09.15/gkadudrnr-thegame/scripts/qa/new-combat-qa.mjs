import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units[4].x=4;s.units[4].z=2;s.units[4].hp=3;
 async function load(state){await p.locator('#file').setInputFiles({name:'combat.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(state)))});await p.waitForTimeout(300);}
 await load(s);const before=await p.evaluate(()=>__game.state);await p.locator('[data-target="e0"]').click();await p.locator('#attack-preview').waitFor({state:'visible'});assert.deepEqual(await p.evaluate(()=>__game.state),before);
 assert.match(await p.locator('.attack-metrics').innerText(),/%/);await p.screenshot({path:`output/${channel}-attack-preview.png`});
 await p.locator('#cancel-attack').click();assert.deepEqual(await p.evaluate(()=>__game.state),before);await p.locator('[data-target="e0"]').click();await p.locator('#confirm-attack').click();assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
 assert.doesNotMatch(await p.locator('#target-labels').innerText(),/GHOST|TRACE|FAULT/);assert.match(await p.locator('#target-labels').innerText(),/%/);
 const plasma=newGame('human',[2,0,4,5]);plasma.units[1].hp=3;await load(plasma);await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="skill"]').click();
 const r=await p.locator('#viewport').boundingBox(),pos=await p.evaluate(()=>__game.project(1,4));await p.mouse.click(r.x+pos.x,r.y+pos.y);
 await p.locator('#attack-preview').waitFor({state:'visible'});assert.match(await p.locator('.attack-warning').innerText(),/아군/);await p.screenshot({path:`output/${channel}-plasma-preview.png`});await p.locator('#confirm-attack').click();
 assert.equal(await p.evaluate(()=>__game.state.units[1].downed.remaining),3);
 await p.waitForTimeout(200);await p.screenshot({path:`output/${channel}-data-burst.png`});
 await p.locator('[data-unit="p2"]').click({button:'right'});await p.locator('[data-action="skill"]').click();const q=await p.evaluate(()=>__game.project(1,4));await p.mouse.click(r.x+q.x,r.y+q.y);assert.equal(await p.evaluate(()=>__game.state.units[1].hp),5);
 await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,-2200);await p.waitForTimeout(500);await p.screenshot({path:`output/${channel}-extended-zoom.png`});
 await p.setViewportSize({width:1280,height:720});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log(channel+': attack preview/cancel/confirm, plasma friendly fire, revive, HP labels and extended zoom passed');
 }finally{await b.close();}
}
