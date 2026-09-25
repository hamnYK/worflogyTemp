import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
for(const channel of ['chrome','msedge']){
 const b=await chromium.launch({channel,headless:true});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.showSaveFilePicker=undefined;});
 await p.goto('http://127.0.0.1:5174/');await p.waitForFunction(()=>!!window.__game);await p.locator('#skip-prologue').click();await p.locator('[data-faction="human"]').click();await p.locator('#deploy').click();
 const original=await p.evaluate(()=>__game.state);original.units[0].hp=5;original.units[0].supplies.batteries=1;original.cover[0].hp=0;
 await p.locator('#file').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'null-sector-save',version:1,state:original}))});
 await p.waitForFunction(()=>__game.state.units[0].hp===5);
 const downloaded=p.waitForEvent('download');await p.locator('#save').click();const file=await downloaded,raw=await fs.readFile(await file.path(),'utf8'),d=JSON.parse(raw);
 assert.equal(d.version,2);assert.equal(d.state,undefined);assert.equal(d.units[0].name,undefined);assert.equal(d.units[0].maxHp,undefined);assert.equal(d.units[4].x,undefined);assert.equal(d.cover[0].x,undefined);
 await p.locator('#file').setInputFiles({name:'compact.json',mimeType:'application/json',buffer:Buffer.from(raw)});await p.waitForTimeout(300);assert.deepEqual(await p.evaluate(()=>__game.state),original);
 await p.reload();await p.waitForFunction(()=>!!window.__game);assert.equal(await p.locator('#lobby').isVisible(),false);assert.deepEqual(await p.evaluate(()=>__game.state),original);
 await p.locator('#home').click();await p.locator('#continue').click();await p.waitForFunction(()=>document.querySelector('#lobby').hidden);assert.deepEqual(await p.evaluate(()=>__game.state),original);
 assert.deepEqual(errors,[]);console.log(channel+': legacy import, real v2 file download/import, tab recovery and IndexedDB continuation passed; bytes='+raw.length);
 }finally{await b.close();}
}
