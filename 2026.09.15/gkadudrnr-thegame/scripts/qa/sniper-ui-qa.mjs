import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();
 for(let role=0;role<7;role++){await p.locator(`[data-inspect="${role}"]`).click();assert.equal(await p.locator('.skill-facts dt').count(),4);}
 await p.locator('[data-inspect="3"]').click();assert.equal(await p.locator('#weapon').inputValue(),'sniper');assert.match(await p.locator('.loadout-stats').innerText(),/2칸/);
 await p.locator('#weapon').selectOption('standard');assert.match(await p.locator('.skill-availability').innerText(),/사용 불가/);assert.match(await p.locator('.loadout-stats').innerText(),/4칸/);
 await p.locator('#weapon').selectOption('sniper');await p.locator('#agent-detail').scrollIntoViewIfNeeded();await p.screenshot({path:`output/${channel}-sniper-guide.png`});
 await p.locator('#deploy').click();
 const s=newGame('human',[3,0,2,4]);s.cover.forEach(c=>c.hp=0);
 const load=async()=>{await p.locator('#file').setInputFiles({name:'sniper.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(s)))});await p.waitForTimeout(250);};
 await load();await p.locator('[data-unit="p0"]').click({button:'right'});await p.locator('[data-action="skill"]').click();await p.locator('[data-target="e0"]').click();assert.match(await p.locator('#attack-preview').innerText(),/치명타 25%/);await p.locator('#cancel-attack').click();
 s.agents[3].weapon='standard';await load();await p.locator('[data-unit="p0"]').click({button:'right'});assert.equal(await p.locator('[data-action="skill"]').isDisabled(),true);assert.match(await p.locator('[data-action="skill"]').innerText(),/저격총 필요/);
 assert.deepEqual(errors,[]);console.log(channel+': all skill guides, equipment eligibility, movement penalty, critical preview, unequipped skill lock passed');
 }finally{await b.close();}
}
