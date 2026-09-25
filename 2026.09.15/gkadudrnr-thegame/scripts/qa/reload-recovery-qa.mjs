import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const ready=()=>p.waitForFunction(()=>!!window.__game);
 await p.goto('http://127.0.0.1:5174/');await ready();await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-rear"]').click();
 const before=await p.evaluate(()=>__game.state);await p.reload();await ready();assert.equal(await p.locator('#lobby').isVisible(),false);assert.deepEqual(await p.evaluate(()=>__game.state),before);
 await p.locator('#end-turn').click();await p.waitForFunction(()=>__game.state.turn===2);await p.waitForTimeout(900);const next=await p.evaluate(()=>__game.state);await p.reload();await ready();assert.deepEqual(await p.evaluate(()=>__game.state),next);assert.equal(await p.locator('#lobby').isVisible(),false);
 await p.locator('#home').click();await p.reload();await ready();assert.equal(await p.locator('#lobby').isVisible(),true);
 await p.evaluate(()=>sessionStorage.setItem('null-sector-active-battle','broken'));await p.reload();await ready();assert.equal(await p.locator('#lobby').isVisible(),true);assert.equal(await p.evaluate(()=>sessionStorage.getItem('null-sector-active-battle')),null);
 assert.deepEqual(errors,[]);console.log(channel+': AP/watch state and turn preserved on reload, deliberate menu exit respected, corrupt session safely discarded');
 }finally{await b.close();}
}
