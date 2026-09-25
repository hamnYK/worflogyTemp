import {mkdirSync as ensureQaOutput} from 'node:fs';
ensureQaOutput('output',{recursive:true});
import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith('/nested/game/')){res.writeHead(404).end();return;}
  const file=path.resolve(root,pathname.slice('/nested/game/'.length)||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(5191,'127.0.0.1',r));
try{
 for(const channel of ['chrome','msedge']){
  const browser=await chromium.launch({channel,headless:true});
  try{
   const page=await browser.newPage({viewport:{width:1440,height:1000}});let first=true;
   await page.route('**/*01-dependence*.png*',route=>{if(first){first=false;return route.fulfill({status:404,body:'simulate temporary image failure'});}return route.continue();});
   await page.goto('http://127.0.0.1:5191/nested/game/');
   await page.locator('#retry-prologue-image').waitFor({state:'visible'});
   await page.locator('#retry-prologue-image').click();
   await page.waitForFunction(()=>{const i=document.querySelector('.prologue-image');return i&&!i.hidden&&i.naturalWidth>0;});
   assert.ok(await page.locator('#retry-prologue-image').isHidden());
   await page.screenshot({path:`output/${channel}-prologue-repaired.png`});
   const sources=[];
   for(let i=0;i<6;i++){
    if(i)await page.locator('#prologue-next').click();
    await page.locator('.prologue-image').evaluate(img=>img.decode());
    const image=await page.locator('.prologue-image').evaluate(i=>({width:i.naturalWidth,src:i.src}));
    assert.ok(image.width>0);assert.ok(image.src.includes('/nested/game/assets/'));sources.push(image.src);
   }
   assert.equal(new Set(sources).size,6);console.log(channel+': production subpath, all 6 bundled images, forced 404 and retry recovery passed.');
  }finally{await browser.close();}
 }
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
