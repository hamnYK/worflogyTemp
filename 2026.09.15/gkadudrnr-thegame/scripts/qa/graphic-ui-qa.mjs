import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
﻿import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});try{
 const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();
 await p.screenshot({path:`output/${channel}-graphic-landing.png`});await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 await p.screenshot({path:`output/${channel}-graphic-battle.png`});await p.locator('[data-unit="p0"]').click({button:'right'});await p.screenshot({path:`output/${channel}-graphic-command.png`});
 assert.equal(await p.locator('[data-action]').count(),6);await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-front"]').click();assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="equipment"]').click();assert.equal(await p.locator('[data-action="reload"]').isDisabled(),true);await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(const id of ['save','load','end-turn']){const r=await p.locator('#'+id).boundingBox();assert.ok(r.y+r.height<=692,id);}
 await p.setViewportSize({width:1600,height:1000});await p.locator('#home').click();await p.locator('[data-faction="ai"]').click();await p.locator('#recommended').click();await p.screenshot({path:`output/${channel}-graphic-preparation.png`});await p.locator('#deploy').click();assert.equal(await p.locator('#app').getAttribute('data-hud-faction'),'ai');await p.screenshot({path:`output/${channel}-graphic-defense.png`});assert.deepEqual(errors,[]);
 console.log(channel+': light HUD, six commands, watch confirmation, equipment, footer bounds, two faction layouts passed');
 }finally{await browser.close();}
}

