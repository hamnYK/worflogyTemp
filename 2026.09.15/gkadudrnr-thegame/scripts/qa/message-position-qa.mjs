import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const before=await p.locator('.map-caption').boundingBox();const rect=await p.locator('#viewport').boundingBox(),pos=await p.evaluate(()=>__game.project(8,5));await p.mouse.click(rect.x+pos.x,rect.y+pos.y);
 await p.locator('#toast.show').waitFor();assert.match(await p.locator('#toast').innerText(),/이동/);
 const msg=await p.locator('#toast').boundingBox(),footer=await p.locator('footer').boundingBox(),quality=await p.locator('#quality').boundingBox();assert.ok(msg.y+msg.height<footer.y);assert.ok(msg.x+msg.width<=quality.x);assert.deepEqual(await p.locator('.map-caption').boundingBox(),before);
 await p.screenshot({path:`output/${channel}-inline-message.png`});await p.waitForTimeout(5200);assert.equal(await p.locator('#toast').innerText(),'');assert.deepEqual(errors,[]);console.log(channel+': inline notification, no footer/control overlap, stable layout and expiry passed');
 }finally{await b.close();}
}
