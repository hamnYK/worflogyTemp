const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 for(const scenario of ['win','lose','draw','exit','new']){
 const p=await browser.newPage();await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
 await p.evaluate(async scenario=>{
  const {TriangleTerritory}=await import('/js/triangle-territory-rules.mjs'),{mountTriangleTerritory}=await import('/js/triangle-territory.mjs');
  const play=TriangleTerritory.prototype.play;
  TriangleTerritory.prototype.play=function(a,b){const result=play.call(this,a,b);if(result.ok){TriangleTerritory.prototype.play=play;this.areas=scenario==='lose'?[1,2]:scenario==='draw'?[1,1]:[2,1];this.phase='finished';result.finished=true;}return result;};
  Math.random=()=>0;window.wins=0;
  const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999';document.body.append(host);
  window.handle=mountTriangleTerritory(host,{onWin(){window.wins++;window.handle.dispose();host.replaceChildren();},onExit(){window.handle.dispose();host.replaceChildren();}});
  const dots=[...host.querySelectorAll('.triangle-dot')],model=new TriangleTerritory({points:dots.map(b=>({x:+b.dataset.boardX,y:+b.dataset.boardY})),clearance:18});
  const [a,b]=model.legalMoves()[0];dots[a].click();dots[b].click();
 },scenario);
 assert.equal(await p.locator('.triangle-game').getAttribute('data-phase'),'finished');
 assert.equal(await p.locator('.chip-result').innerText(),scenario==='lose'?'TRY AGAIN':scenario==='draw'?'DRAW':'VICTORY');
 if(scenario==='exit')await p.locator('.chip-back').click();
 if(scenario==='new')await p.locator('.triangle-new').click();
 await p.waitForTimeout(3300);
 assert.equal(await p.evaluate(()=>window.wins),scenario==='win'?1:0);
 if(['lose','draw','new'].includes(scenario)){
 assert.equal(await p.locator('.triangle-game').getAttribute('data-phase'),'playing');
 assert.equal(await p.locator('.triangle-score-you').innerText(),'0.0%');
 assert.equal(await p.locator('.chip-result.show').count(),0);
 }else assert.equal(await p.locator('.triangle-game').count(),0);
 await p.close();console.log('PASS ending: '+scenario);
 }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
