const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{fs.readFile(path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0])),(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(req.url)?'text/javascript':/\.css$/.test(req.url)?'text/css':'text/html; charset=utf-8');res.end(b);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
for(const english of [false,true])for(const kind of ['football','basketball','curling']){
const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async({kind,english})=>{
const cap=kind[0].toUpperCase()+kind.slice(1),rules=await import('/js/chip-'+kind+'-rules.mjs'),K=rules['Chip'+cap],step=K.prototype.step;
K.prototype.step=function(dt){window.g=this;if(!window.freeze)return step.call(this,dt);};window.freeze=true;
const module=await import('/js/chip-'+kind+'.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);
window.handle=module['mount'+cap](host,{english,onWin(){window.exited=true;},onExit(){}});
},{kind,english});
await p.waitForFunction(()=>window.g);
const expect=async(ko,en)=>{const text=english?en:ko;await p.waitForFunction(text=>document.querySelector('.chip-status').textContent.includes(text),text,{timeout:2500});};
if(kind==='football'){
await expect('시작 동작','opening');
await p.locator('[data-chip="0"]').click();await p.locator('.chip-fire').click();await expect('펼치는 중','Spreading');
await p.evaluate(()=>{g.opening=false;g.selected=null;g.phase='ready';g.result='opened';});
await expect('세 칩 모두','All three');
await p.locator('[data-chip="0"]').click();await p.locator('.chip-fire').click();await expect('패스 중','Pass in motion');
await p.evaluate(()=>g.crossed=true);await expect('아직 이동 중','still moving');
await p.evaluate(()=>{g.phase='ready';g.result='pass';g.previous=0;g.selected=null;g.chips.forEach(c=>c.passed=true);});
await expect('모두 통과 완료','All three chips have passed');
await p.locator('[data-chip="1"]').click();await p.locator('.chip-fire').click();await expect('슈팅 중','Shot in motion');
await p.evaluate(()=>g.fail('early-goal'));await expect('골을 넣었습니다','Scored before');
}else if(kind==='basketball'){
await expect('1/3','1/3');await p.locator('.basket-action').click();await expect('첫 바운드','first bounce');
assert(await p.locator('.basket-catch-meter').isHidden());
await p.evaluate(()=>{g.bounces=1;g.spinTime=2;g.p.y=.7;g.omega=10;});await expect('바운드했습니다','has bounced');
await p.evaluate(()=>{g.phase='held';g.shotPoints=6;});await expect('6점 슛','6-point shot');
await p.locator('.basketball-game canvas').focus();await p.keyboard.press('ArrowUp');await expect('67°','67°');await expect('놓으면 슛','release');
await p.locator('.basket-action').click();await expect('슈팅 중','Shot in flight');
await p.evaluate(()=>g.finish(0,'miss'));await expect('슛이 들어가지','Shot missed');await expect('2번째','attempt 2');
await p.waitForFunction(()=>g.phase==='ready');await expect('2/3','2/3');
await p.evaluate(()=>{g.phase='spinning';g.finish(0,'catch');});await expect('잡기에 실패','Catch missed');await expect('3번째','attempt 3');
await p.waitForFunction(()=>g.phase==='ready');await expect('3/3','3/3');
await p.evaluate(()=>{g.phase='spinning';g.spinTime=15;g.finish(0,'spin-timeout');});await expect('세 번','Three attempts');await expect('3초','3 seconds');
await p.waitForFunction(()=>window.exited,{},{timeout:4000});
}else{
await expect('1/3','1/3');await p.locator('.chip-fire').click();await expect('모두 멈춘 뒤','everything stops');
await p.evaluate(()=>{g.phase='ready';g.shots=1;});await expect('2/3','2/3');
await p.locator('.chip-fire').click();await expect('움직이는 중','are moving');
await p.evaluate(()=>{g.phase='ready';g.shots=2;});await expect('3/3','3/3');
await p.evaluate(()=>{g.phase='won';g.ringScore=4;g.bonus=2;g.score=6;});await expect('원 점수 4 + 보너스 2','RINGS 4 + BONUS 2');await expect('돌아갑니다','Returning');
}
assert.deepEqual(errors,[]);await p.evaluate(()=>handle.dispose());await p.close();console.log('PASS guidance transitions: '+kind+' '+(english?'EN':'KO'));
}
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
