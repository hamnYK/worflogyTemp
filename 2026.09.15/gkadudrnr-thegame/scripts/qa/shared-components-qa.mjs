import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const context=await b.newContext({viewport:{width:1280,height:900}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5174/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const snapshot=await p.evaluate(()=>__game.state);
 const style=el=>{const s=getComputedStyle(el);return {height:s.height,padding:s.padding,borderRadius:s.borderRadius,fontSize:s.fontSize,background:s.backgroundColor};};
 const ally=await p.locator('#squad .shared-unit-card').first().evaluate(style),enemy=await p.locator('#enemies .shared-enemy-card').first().evaluate(style);
 const ds=await context.newPage();ds.on('pageerror',e=>errors.push(e.message));await ds.goto('http://127.0.0.1:5174/design-system.html');await ds.locator('#ds-live-allies .shared-unit-card').first().waitFor();
 assert.equal(await ds.locator('.unit-card:not(.shared-unit-card),.enemy-card:not(.shared-enemy-card)').count(),0);
 assert.deepEqual(await ds.locator('#ds-live-allies .shared-unit-card').first().evaluate(style),ally);
 assert.deepEqual(await ds.locator('#ds-live-enemies .identified').first().evaluate(style),enemy);
 assert.equal(await ds.locator('#ds-live-markers .unit-status-icon').count(),5);
 for(const marker of await ds.locator('#ds-live-markers .unit-status-icon').all()){assert.equal(await marker.textContent(),'');assert.ok(await marker.getAttribute('aria-label'));}
 await ds.locator('#ds-live-state').selectOption('downed');assert.equal(await ds.locator('#ds-live-allies .unit-card').first().isDisabled(),true);assert.match(await ds.locator('#ds-live-enemies .observed').innerText(),/복구 2턴/);
 await ds.locator('#ds-live-faction').selectOption('ai');assert.match(await ds.locator('#ds-live-allies').innerText(),/TRACE/);assert.equal(await ds.locator('#ds-live-enemies .unidentified .ink-portrait').count(),0);
 await ds.locator('#tactical').scrollIntoViewIfNeeded();await ds.screenshot({path:`output/${channel}-shared-components.png`});assert.deepEqual(await p.evaluate(()=>__game.state),snapshot);
 await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-rear"]').click();assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
 assert.deepEqual(errors,[]);console.log(channel+': shared markup/computed styles, 90px cards, live state/faction previews, isolated save state and game actions passed');
 }finally{await b.close();}
}
