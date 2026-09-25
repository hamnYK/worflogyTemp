import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import {newGame,packSave} from '../../src/rules.js';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const s=newGame();s.units[0].x=2;s.units[0].z=2;s.units[1].x=2;s.units[1].z=5;
 await p.locator('#file').setInputFiles({name:'cover.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(s)))});
 await p.waitForFunction(()=>__game.state.units[1].x===2);await p.waitForTimeout(1000);await p.screenshot({path:`output/${channel}-cover-poses.png`});
 await p.locator('[data-action="move"]').click();const r=await p.locator('#viewport').boundingBox(),pt=await p.evaluate(()=>__game.project(1,2));await p.mouse.click(r.x+pt.x,r.y+pt.y);await p.waitForTimeout(800);assert.equal(await p.evaluate(()=>__game.state.units[0].x),1);
 assert.deepEqual(errors,[]);console.log(channel+': low/high cover scene, pose exit on movement and no render errors');
 }finally{await b.close();}
}
