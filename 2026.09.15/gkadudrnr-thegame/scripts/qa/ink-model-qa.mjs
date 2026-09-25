import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('/favicon.ico'))errors.push(m.text()+' '+m.location().url);});
 await p.goto(process.env.QA_URL||'http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();
 for(const faction of ['human','ai']){
  await p.locator('[data-faction="'+faction+'"]').click();await p.locator('#deploy').click();await p.waitForTimeout(1500);
  await p.screenshot({path:`output/${channel}-ink-${faction}-wide.png`});
  const r=await p.locator('#viewport').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,-420);await p.waitForTimeout(900);
  await p.screenshot({path:`output/${channel}-ink-${faction}-detail.png`});
  await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="watch"]').click();await p.locator('[data-action="watch-front"]').click();
  assert.equal(await p.evaluate(()=>__game.state.units[0].ap),1);
  await p.locator('#quality').click();await p.waitForTimeout(400);await p.locator('#quality').click();
  await p.locator('#home').click();
 }
 assert.deepEqual(errors,[]);console.log(channel+': both faction scenes, zoom, watch and quality modes rendered without errors');
 }finally{await b.close();}
}
