const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const {DotsAndBoxes}=await import(pathToFileURL(path.join(process.cwd(),'js/dots-and-boxes-rules.mjs')).href);
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{let seed=17;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);});
  await p.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();await p.locator('.arcade-boxes-play').click();await p.waitForSelector('.dots-boxes-game');
  assert.equal(await p.locator('.triangle-dot').count(),36);
  assert(await p.locator('.triangle-board').evaluate(e=>e.classList.contains('triangle-3d')));
  assert(await p.locator('.triangle-table-canvas').isVisible());
  const first=+(await p.locator('.dots-boxes-game').getAttribute('data-first')); 
  await p.waitForSelector('.dots-boxes-game[data-turn="0"]');
  await p.locator('.triangle-dot').first().focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.triangle-dot').first().getAttribute('aria-pressed'),'true');await p.keyboard.press('End');assert.notEqual(await p.evaluate(()=>document.activeElement.getAttribute('aria-label')),'점 1');await p.keyboard.press('Escape');assert.equal(await p.locator('.triangle-dot[aria-pressed="true"]').count(),0);
  let snapshots=false,checkedDuplicate=false,steps=0;
  async function model(){
   const state=await p.evaluate(()=>({points:[...document.querySelectorAll('.triangle-dot')].map(b=>({x:+b.dataset.boardX,y:+b.dataset.boardY})),edges:[...document.querySelectorAll('.triangle-lines line')].map(e=>['x1','y1','x2','y2'].map(a=>+e.getAttribute(a))),scores:['.triangle-score-you','.triangle-score-ai'].map(s=>parseFloat(document.querySelector(s).textContent)),claims:[...document.querySelectorAll('.triangle-fills polygon')].map(e=>({points:e.getAttribute('points').split(' ').map(v=>v.split(',').map(Number)),owner:e.classList.contains('triangle-owned-you')?0:1}))}));
   const g=new DotsAndBoxes({first}),history=[];
   for(const edge of state.edges){const ids=[0,2].map(j=>state.points.findIndex(q=>Math.abs(q.x-edge[j])<.001&&Math.abs(q.y-edge[j+1])<.001));history.push({ids,player:g.turn});assert(g.play(...ids).ok);}
   assert.deepEqual(state.scores,g.scores,'Displayed scores match the full move history');
   for(const triangle of state.claims){const ids=triangle.points.map(([x,y])=>state.points.findIndex(q=>Math.abs(q.x-x)<.001&&Math.abs(q.y-y)<.001));const closing=history.filter(move=>move.ids.every(i=>ids.includes(i))).at(-1);assert.equal(triangle.owner,closing.player,'Displayed owner must be the last-edge player');}
   return g;
  }
  while((await p.locator('.dots-boxes-game').getAttribute('data-phase'))!=='finished'){
   await p.waitForFunction(()=>{const e=document.querySelector('.dots-boxes-game');return e.dataset.turn==='0'||e.dataset.phase==='finished';},{},{timeout:10000});
   const g=await model();if(g.phase==='finished')break;
   const dots=p.locator('.triangle-dot');
   if(!checkedDuplicate&&g.edges.length){const [a,b]=g.edges[0];await dots.nth(a).click();await dots.nth(b).click();assert((await p.locator('.chip-status').innerText()).includes('이미 연결'));assert.equal(await p.locator('.dots-boxes-game').getAttribute('data-edges'),String(g.edges.length));await p.locator('.triangle-cancel').click();checkedDuplicate=true;}
   const [a,b]=g.chooseMove(()=>.3),expected=g.play(a,b);await dots.nth(a).click();await dots.nth(b).hover();assert((await p.locator('.chip-status').innerText()).includes(expected.captured?'내 사각형':'완성되는 사각형 없음'));await dots.nth(b).click();
   if(expected.captured){assert.equal(parseFloat(await p.locator('.triangle-score-you').innerText()),g.scores[0],'Human closing move awards human score immediately');assert.equal(parseFloat(await p.locator('.triangle-score-ai').innerText()),g.scores[1]);assert.equal(await p.locator('.dots-boxes-game').getAttribute('data-turn'),'0','Human keeps bonus turn');}
   assert(++steps<=60);
   if(!snapshots&&g.boxes.length>3){
    await p.screenshot({path:'output/dots-boxes-desktop.png'});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'output/dots-boxes-mobile.png'});assert(await p.locator('.dots-boxes-game').evaluate(e=>e.scrollWidth<=e.clientWidth));await p.setViewportSize({width:1440,height:1000});snapshots=true;
   }
  }
  const final=await model();assert.equal(parseFloat(await p.locator('.triangle-score-you').innerText()),final.scores[0]);assert.equal(parseFloat(await p.locator('.triangle-score-ai').innerText()),final.scores[1]);assert.equal(await p.locator('.triangle-fills polygon').count(),final.boxes.length);assert(await p.locator('.triangle-dot').first().isDisabled());assert((await p.locator('.chip-status').innerText()).includes('3초 후'));
  await p.locator('.triangle-new').click();assert.equal(+await p.locator('.dots-boxes-game').getAttribute('data-turn'),1-first);assert.equal(await p.locator('.triangle-fills polygon').count(),0);
  // Exit during a pending AI move, then re-enter; stale timers must not touch the new board.
  if(first===1)await p.locator('.triangle-new').click();await p.locator('.chip-back').click();await p.waitForTimeout(700);assert.equal(await p.locator('.dots-boxes-game').count(),0);await p.locator('.arcade-boxes-play').click();await p.waitForTimeout(700);assert.equal(await p.locator('.triangle-dot').count(),36);assert.deepEqual(errors,[]);
  const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await touch.goto(pathToFileURL(path.join(process.cwd(),'en.html')).href);await touch.locator('body > .section-elevator > .arcade-open').click();await touch.locator('.arcade-boxes-play').click();await touch.waitForSelector('.dots-boxes-game[data-turn="0"]');await touch.locator('.triangle-dot').first().tap();assert.equal(await touch.locator('.triangle-dot').first().getAttribute('aria-pressed'),'true');await touch.locator('.triangle-dot').first().tap();assert.equal(await touch.locator('.triangle-dot[aria-pressed="true"]').count(),0);await touch.close();
  console.log('PASS: real menu/bundle, full human-vs-AI game, scoring/end, keyboard, touch, mobile, duplicate rejection, alternating starts and pending AI disposal.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
