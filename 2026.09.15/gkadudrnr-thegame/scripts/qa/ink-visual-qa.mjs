import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();
 for(const faction of ['human','ai']){
  await p.locator(`[data-faction="${faction}"]`).click();
  assert.equal(await p.locator('#roster .ink-portrait').count(),7);
  await p.locator('#agent-detail').scrollIntoViewIfNeeded();await p.screenshot({path:`output/ink-${faction}-dossier.png`});
  const position=await p.locator('#agent-detail .ink-portrait').evaluate(e=>getComputedStyle(e).backgroundPositionY);assert.equal(position,faction==='human'?'0%':'66.6667%');
  await p.locator('#deploy').click();await p.waitForTimeout(500);await p.screenshot({path:`output/ink-${faction}-battle.png`});
  await p.locator('#home').click();
 }
 await p.setViewportSize({width:1280,height:720});await p.locator('[data-faction="human"]').click();await p.locator('#agent-detail').scrollIntoViewIfNeeded();
 assert.equal(await p.locator('#lobby').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
 await p.screenshot({path:'output/ink-dossier-720.png'});assert.deepEqual(errors,[]);console.log('14 faction portraits, correct atlas mapping, faction switching, 720p dossier and screenshots passed');
}finally{await b.close();}
