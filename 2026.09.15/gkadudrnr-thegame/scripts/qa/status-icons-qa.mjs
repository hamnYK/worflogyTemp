import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {statusIcon} from '../../src/status-icon.js';
for(const [hp,downed,kind]of [[10,null,'normal'],[7,null,'wounded'],[2,null,'critical'],[0,{remaining:2},'downed']]){
 const u={hp,maxHp:10,downed};assert.equal(statusIcon(u).kind,kind);assert.equal(statusIcon(u,'signal').label,'미확인 신호');
}
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5174/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const markers=p.locator('.unit-status-icon:visible');assert.ok(await markers.count()>=4);
 for(const icon of await markers.all()){assert.equal(await icon.textContent(),'');assert.equal(await icon.locator('svg').count(),1);assert.equal(await icon.getAttribute('aria-label'),'정상');const r=await icon.boundingBox();assert.ok(r.width<=34&&r.height<=34);}
 assert.match(await p.locator('[data-unit="p0"]').innerText(),/9 \/ 9 HP/);
 await p.screenshot({path:`output/${channel}-status-icons.png`});assert.deepEqual(errors,[]);console.log(channel+': icon-only world markers, accessible names, detailed sidebar HP verified');
 }finally{await b.close();}
}
