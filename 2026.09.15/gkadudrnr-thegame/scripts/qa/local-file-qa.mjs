import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {newGame,packSave} from '../../src/rules.js';
mkdirSync('output',{recursive:true});
for(const channel of ['chrome','msedge']){
 const browser=await chromium.launch({channel,headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900},offline:true});
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('request',request=>{if(/^(https?:)/.test(request.url()))external.push(request.url());});
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await page.waitForURL(pathToFileURL(resolve('local/index.html')).href);
  await page.waitForFunction(()=>!!window.__game);
  await page.locator('#skip-prologue').click();
  await page.locator('[data-faction="ai"]').click();
  await page.locator('#deploy').click();
  assert.equal(await page.locator('.relay-label:visible').count(),2);
  await page.waitForFunction(()=>[...document.querySelectorAll('.relay-label')].every((label,index)=>{
   const r=label.getBoundingClientRect(),v=document.querySelector('#viewport').getBoundingClientRect();
   const node=__game.state.defense.nodes[index],p=__game.project(node.x,node.z);
   return getComputedStyle(label).visibility==='visible'&&Math.abs(r.left+r.width/2-v.left-p.x)<1&&r.bottom<v.top+p.y-60;
  }));
  assert.equal(await page.locator('.unit-card .ink-portrait').first().evaluate(async element=>{
   const background=getComputedStyle(element).backgroundImage;
   if(!background.startsWith('url('))return false;
   const image=new Image();image.src=background.slice(5,-2);await image.decode();return image.naturalWidth>0;
  }),true);
  const save=newGame('ai');save.defense.nodes[0].breach=2;
  await page.locator('#file').setInputFiles({name:'local-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(packSave(save)))});
  await page.waitForFunction(()=>__game.state.defense.nodes[0].breach===2);
  await page.reload();await page.waitForFunction(()=>window.__game?.state.defense?.nodes[0].breach===2);
  await page.locator('#end-turn').click();
  await page.waitForFunction(()=>__game.state.turn===2||__game.state.status!=='active');
  await page.screenshot({path:`output/${channel}-local-file.png`});
  assert.equal(await page.locator('link[rel="stylesheet"],script[src]').count(),0);
  assert.equal(await page.evaluate(()=>document.fonts.check('12px "Noto Sans KR Variable"')),true);
  await page.goto(pathToFileURL(resolve('local/design-system.html')).href);
  await page.locator('#art-direction').waitFor();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log(`${channel}: offline file launch, deploy, import, reload recovery, turn, and design system passed`);
 }finally{await browser.close();}
}
