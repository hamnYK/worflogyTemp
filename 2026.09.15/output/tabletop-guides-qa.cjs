
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>fs.readFile(path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0])),(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(req.url)?'text/javascript':/\.css$/.test(req.url)?'text/css':'text/html; charset=utf-8');res.end(b);}));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
for(const english of [false,true])for(const kind of ['book','eraser','ping']){
const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await p.evaluate(async({kind,english})=>{
const configs={book:['chip-book-flip','ChipBookFlip','mountBookFlip'],eraser:['eraser-wrestling','EraserWrestling','mountEraserWrestling'],ping:['chalkboard-ping-pong','ChalkboardPingPong','mountChalkboardPingPong']};
const [file,klass,mount]=configs[kind],rules=await import('/js/'+file+'-rules.mjs');rules[klass].prototype.step=function(){window.g=this;};
const module=await import('/js/'+file+'.mjs'),host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:30px';document.body.append(host);
window.handle=module[mount](host,{english,onWin(){},onExit(){}});
},{kind,english});await p.waitForFunction(()=>window.g);
const expect=async(ko,en)=>{await p.waitForFunction(text=>document.querySelector('.chip-status').textContent.includes(text),english?en:ko,{timeout:2500});};
if(kind==='book'){
await expect('5회 남음','5 hits left');
await p.locator('.book-strike').click();await expect('움직이고','Chips are moving');assert((await p.locator('.chip-progress').innerText()).includes(english?'pending':'판정 중'));
await p.evaluate(()=>{g.phase='ready';g.hits=2;});await expect('3회 남음','3 hits left');
await p.evaluate(()=>{g.phase='fail';g.reason='attempts';});await expect('5번의','All 5');
await p.waitForTimeout(100);await expect('다시 시작','Restarting');
}else if(kind==='eraser'){
await expect('단순히 걸친','Partial overlap');
await p.evaluate(()=>{window.originalAccessible=g.accessible;g.accessible=()=>false;});await expect('누름점이 막혔','press point is covered');
await p.evaluate(()=>{g.accessible=originalAccessible;g.turn=1;});await expect('상대 차례','Rival turn');
await p.evaluate(()=>{g.phase='moving';});await expect('움직이는','are moving');
await p.evaluate(()=>{g.phase='lost';g.winner=1;g.reason='blocked';});await expect('내 지우개의','your press points');
}else{
await expect('내 서브','Your serve');await p.locator('.ping-game canvas').press('Space');await expect('내 서브','Your serve');
await p.evaluate(()=>g.server=1);await expect('상대 서브','Rival serve');
await p.locator('.ping-game canvas').press('ArrowUp');await expect('한 번 튈 때까지','wait for one bounce');
await p.evaluate(()=>{g.receiver=0;g.bounces=1;g.ball={x:0,y:.8,z:3.3};g.paddles[0]={x:0,y:.8,z:3.3};g.swings[0]=.1;});await expect('스윙을 마치는','Finishing the swing');assert(await p.locator('.ping-smash').isDisabled());
await p.evaluate(()=>g.swings[0]=0);await expect('지금 받아','Hit now');
await p.evaluate(()=>g.ball.y=1.6);await expect('높은 공','High ball');assert(!(await p.locator('.ping-smash').isDisabled()));
await p.evaluate(()=>{g.ball.x=2;g.swings[0]=0;});await p.locator('.ping-hit').click();
await p.evaluate(()=>{g.ball.x=0;g.ball.y=.8;g.swings[0]=0;});await expect('지금 받아','Hit now');
await p.evaluate(()=>{g.receiver=1;});await expect('상대가 받을','Rival receiving');
await p.evaluate(()=>{g.phase='results';g.pointWinner=0;});await expect('3초 후','3 seconds');
}
await p.evaluate(()=>handle.dispose());assert.deepEqual(errors,[]);await p.close();
}
console.log('PASS: KO/EN book, eraser and ping guide transitions, pending verdict, blocked selection, serve ownership, swing cooldown, stale notice priority and terminal messages.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
