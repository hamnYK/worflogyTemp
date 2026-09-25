import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 assert.equal(await p.locator('.left-panel #objectives,.right-panel #log,.right-panel #save').count(),0);
 assert.equal(await p.locator('footer #objectives,footer #log,footer #save,footer #threat').count(),4);
 assert.equal(await p.locator('#unit-commands').isVisible(),false);
 await p.evaluate(()=>{window.contextChecks=[];document.addEventListener('contextmenu',e=>window.contextChecks.push(e.defaultPrevented));});
 const rect=await p.locator('#viewport').boundingBox(),pos=await p.evaluate(()=>__game.project(1,2));await p.mouse.click(rect.x+pos.x,rect.y+pos.y,{button:'right'});await p.locator('#unit-commands').waitFor({state:'visible'});
 assert.equal(await p.locator('#unit-commands [data-action]').count(),5);await p.screenshot({path:`output/${channel}-context-commands.png`});
 assert.deepEqual(await p.evaluate(()=>window.contextChecks),[true]);
 // Reproduce Windows retargeting the event onto the popup after pointerup.
 assert.equal(await p.locator('#unit-commands [data-action="move"]').evaluate(el=>el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}))),false);
 const before=await p.evaluate(()=>__game.state);await p.locator('[data-action="skill"]').click();assert.equal(await p.locator('#unit-commands').isVisible(),false);assert.equal(await p.evaluate(()=>__game.state.units[0].ap),before.units[0].ap-1);
 assert.match(await p.locator('[data-target="e7"]').innerText(),/병과 미확인/);
 await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await p.mouse.down({button:'right'});await p.mouse.move(rect.x+rect.width/2+80,rect.y+rect.height/2+30,{steps:8});await p.mouse.up({button:'right'});assert.equal(await p.locator('#unit-commands').isVisible(),false);
 await p.screenshot({path:`output/${channel}-unit-dock.png`});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);console.log(channel+': unit-only panels, bottom intel, model right-click commands, scan and right-drag distinction passed');
 }finally{await b.close();}
}
