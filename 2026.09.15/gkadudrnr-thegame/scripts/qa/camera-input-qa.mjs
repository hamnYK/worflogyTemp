import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();await p.waitForTimeout(300);
  const rect=await p.locator('#viewport').boundingBox(),x=rect.x+rect.width*.5,y=rect.y+rect.height*.5;
  const state=await p.evaluate(()=>__game.state),before=await p.evaluate(()=>__game.project(6,5));
  await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+90,y+35,{steps:12});await p.mouse.up();await p.waitForTimeout(400);
  const after=await p.evaluate(()=>__game.project(6,5));assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>20);assert.deepEqual(await p.evaluate(()=>__game.state),state);
  await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+60,y,{steps:6});await p.mouse.move(x,y,{steps:6});await p.mouse.up();assert.deepEqual(await p.evaluate(()=>__game.state),state);
  await p.mouse.move(x,y);await p.mouse.down({button:'right'});await p.mouse.move(x+70,y+20,{steps:8});await p.mouse.up({button:'right'});assert.deepEqual(await p.evaluate(()=>__game.state),state);
  await p.locator('#camera').click();await p.waitForTimeout(600);const cell=await p.evaluate(()=>__game.project(2,2));await p.mouse.click(rect.x+cell.x,rect.y+cell.y);await p.waitForFunction(()=>__game.state.units[0].x===2);assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
  assert.deepEqual(errors,[]);console.log(channel+': left pan, round-trip drag suppression, right orbit, reset and click movement passed');
 }finally{await browser.close();}
}
