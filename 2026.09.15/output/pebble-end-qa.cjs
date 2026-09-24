const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const scenario of ['win','lose','draw','exit','moving-exit']){
const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async scenario=>{
 const {PebbleTerritory}=await import('/js/pebble-territory-rules.mjs'),{mountPebbleTerritory}=await import('/js/pebble-territory.mjs'),shoot=PebbleTerritory.prototype.shoot;
 PebbleTerritory.prototype.shoot=function(target,trace){const r=shoot.call(this,target,trace);if(r.ok){PebbleTerritory.prototype.shoot=shoot;this.phase='finished';this.winner=scenario==='draw'?-1:scenario==='lose'?1:0;this.finishReason='turn-limit';this.turnsUsed=[10,10];this.turns=20;if(this.winner>=0)this.land.fill(this.winner+1);r.ended=true;}return r;};
 const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(host);window.wins=0;
 window.handle=mountPebbleTerritory(host,{onWin(){window.wins++;window.handle.dispose();host.replaceChildren();},onExit(){window.handle.dispose();host.replaceChildren();}});
},scenario);
await p.locator('.pebble-fire').click();
if(scenario==='moving-exit')await p.locator('.pebble-game .chip-back').click();
else{await p.waitForSelector('.pebble-game[data-phase="finished"]');assert.equal(await p.locator('.chip-result').innerText(),scenario==='draw'?'DRAW':scenario==='lose'?'TRY AGAIN':'VICTORY');if(scenario==='exit')await p.locator('.pebble-game .chip-back').click();}
await p.waitForTimeout(3300);assert.equal(await p.evaluate(()=>window.wins),scenario==='win'?1:0);
if(scenario==='lose'||scenario==='draw'){assert.equal(await p.locator('.chip-result.show').count(),0);assert.notEqual(await p.locator('.pebble-game').getAttribute('data-phase'),'finished');}else assert.equal(await p.locator('.pebble-game').count(),0);
assert.deepEqual(errors,[]);await p.close();console.log('PASS pebble ending: '+scenario);
}}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
