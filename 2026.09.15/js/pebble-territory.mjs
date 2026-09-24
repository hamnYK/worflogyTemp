import {PebbleTerritory,LAND,distance} from './pebble-territory-rules.mjs';
import {createPebbleTable} from './pebble-table.mjs';
import {PebbleSurface} from './pebble-physics.mjs';
export function mountPebbleTerritory(host,{onExit,onWin=onExit,english=false}={}){
 const t=(ko,en)=>english?en:ko;
 host.innerHTML=`<div class="chip-game pebble-game"><div class="chip-game-heading"><button type="button" class="wf-button chip-back">${t('게임 선택','Games')}</button><h2 lang="en">PEBBLE TERRITORY</h2><output class="chip-progress"></output></div><div class="pebble-score"><span class="pebble-you"></span><span class="pebble-turn"></span><span class="pebble-ai"></span></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('조약돌 땅따먹기. 내 돌을 뒤로 당겼다 놓으세요. 방향키 조준과 힘, Space 발사.','Pebble territory. Pull your stone back and release. Arrow keys aim and power; Space launches.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"></div></div><div class="chip-controls"><label>${t('조준','Aim')} <input class="pebble-aim" type="range" min="-180" max="180" step="1" value="0"><output class="pebble-angle"></output></label><label>${t('힘','Power')} <input class="chip-power" type="range" min="1" max="100" step="1" value="45"><output class="pebble-power"></output></label><button type="button" class="wf-button pebble-fire">${t('튕기기','Flick')}</button><button type="button" class="wf-button pebble-pass">${t('차례 넘기기','Pass turn')}</button></div><p class="chip-status" role="status" aria-live="polite" aria-atomic="true"></p></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),aim=root.querySelector('.pebble-aim'),power=root.querySelector('.chip-power'),fire=root.querySelector('.pebble-fire'),pass=root.querySelector('.pebble-pass'),result=root.querySelector('.chip-result');
 let view;
 try{view=createPebbleTable(canvas);}catch(error){root.innerHTML=`<p>${t('3D 화면을 시작할 수 없습니다. 브라우저의 하드웨어 가속 설정을 확인해 주세요.','Unable to start 3D. Check browser hardware acceleration.')}</p><button type="button" class="wf-button">${t('게임 선택','Games')}</button>`;root.querySelector('button').onclick=onExit;return{dispose(){}};}
 let game,surface,disposed=false,frame,timer=null,endTimer=null,pointer=null,motion=null,aiPlan=null,notice='',last=performance.now(),first=0;
 const mine=()=>!disposed&&game.phase==='ready'&&game.turn===0&&!motion;
 const target=()=>{const a=+aim.value*Math.PI/180,d=+power.value/100*LAND.maxDistance;return{x:game.stone.x+Math.cos(a)*d,y:game.stone.y+Math.sin(a)*d};};
 function clearStart(){
  if(game.phase!=='ready'||game.shots||surface.clearAt(game.stone))return;
  let best=null,nearest=Infinity;
  for(let i=0;i<game.land.length;i++)if(game.land[i]===game.turn+1){const p=game.center(i),d=distance(p,game.stone);if(d<nearest&&surface.clearAt(p)){best=p;nearest=d;}}
  if(best)game.place(best);
 }
 function releasePointer(){if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;}
 function refresh(){
  if(!motion)clearStart();
  root.dataset.turn=String(game.turn);root.dataset.phase=game.phase==='finished'?'finished':motion?'moving':'ready';root.dataset.shots=String(game.shots);root.dataset.turns=String(game.turns);
  const shares=game.shares;root.querySelector('.pebble-you').textContent=t('나 ','YOU ')+shares[0].toFixed(1)+'%';root.querySelector('.pebble-ai').textContent=t('컴퓨터 ','COMPUTER ')+shares[1].toFixed(1)+'%';
  root.querySelector('.pebble-score').title=t('각자 10턴 · 상대 땅을 모두 없애면 즉시 승리 · 제한 종료 시 실제 면적으로 판정','10 turns each · Capture all rival land to win early · Otherwise largest unrounded area wins');
  root.querySelector('.pebble-turn').textContent=game.turn===0?t('내 차례','YOUR TURN'):t('컴퓨터 차례','COMPUTER TURN');
  root.querySelector('.chip-progress').textContent=game.phase==='finished'?t('종료','FINISHED'):(game.turn===0?t('내 차례 ','Your turn '):t('컴퓨터 차례 ','Computer turn '))+(game.turnsUsed[game.turn]+1)+'/10 · '+t('이번 턴 ','Flicks ')+(Math.min(3,game.shots+(motion?1:0)))+'/3';
  root.querySelector('.pebble-angle').textContent=aim.value+'°';root.querySelector('.pebble-power').textContent=power.value+'%';
  aim.disabled=power.disabled=fire.disabled=pass.disabled=!mine();
  if(game.phase==='finished'){
   const verdict=game.winner===-1?t('무승부. ','Draw. '):game.winner===0?t('승리! ','You win! '):t('패배. ','You lose. ');
   const reason=game.finishReason==='turn-limit'?t('각자 10턴 종료 · 획득 면적: 나 ','10 turns each completed · Area: You ')+shares[0].toFixed(1)+'% / '+t('컴퓨터 ','Computer ')+shares[1].toFixed(1)+'%. ':game.winner===0?t('상대 땅을 모두 차지했습니다. ','All rival land captured. '):t('내 땅이 모두 사라졌습니다. ','Your land is gone. ');
   status.textContent=verdict+reason+(game.winner===0?t('3초 후 로비로 돌아갑니다.','Returning to Games in 3 seconds.'):t('3초 후 재도전합니다.','Trying again in 3 seconds.'));
   result.textContent=game.winner===0?'VICTORY':game.winner===-1?'DRAW':'TRY AGAIN';result.classList.add('show');
   if(endTimer===null)endTimer=setTimeout(()=>{if(disposed)return;if(game.winner===0)onWin?.();else newBoard();},3000);
  }else{
   const guide=motion?t('돌이 움직이고 있습니다.','Stone in motion.'):game.turn===1?t('컴퓨터가 돌을 튕길 준비를 합니다.','Computer is preparing a flick.'):game.shots?t('남은 ','Return home within ')+(3-game.shots)+t('회 안에 내 땅으로 돌아오세요. 상대 땅에 멈추면 실패합니다.',' remaining flick(s). Landing on rival land fails.'):t('내 땅을 눌러 출발 위치 선택 · 돌을 뒤로 당겼다 놓기 · ←/→ 조준, ↑/↓ 힘, Space 발사. 3회 안에 귀환해 땅을 감싸세요.','Choose a start on your land; pull the stone back and release. ←/→ aim, ↑/↓ power, Space flick. Enclose land and return within 3 flicks.');
   status.textContent=(notice?notice+' ':'')+guide;
  }
  view.sync(game,{surface,frame:motion?.frame,flight:motion?.flight,elapsed:motion?.elapsed,target:mine()?target():null});
  root.dataset.obstacles=String(surface.obstacles.length);root.dataset.trails=String(surface.trails.length);
  const p=view.project(game.stone);canvas.dataset.stoneX=p.x;canvas.dataset.stoneY=p.y;
 }
 const messages={
  rival:t('상대 땅에 멈춰 실패했습니다.','Landed on rival land. Attempt failed.'),
  outside:t('운동장 밖으로 나가 실패했습니다.','Out of bounds. Attempt failed.'),
  'missed-home':t('3회 안에 귀환하지 못했습니다.','Did not return home within 3 flicks.'),
  empty:t('귀환했지만 새로 감싼 땅이 없습니다.','Returned without enclosing new land.'),
 };
 function scheduleAI(){
  clearTimeout(timer);timer=null;if(disposed||game.phase!=='ready'||game.turn!==1||motion)return;
  timer=setTimeout(()=>{
   if(disposed||game.turn!==1||game.phase!=='ready')return;
   if(!aiPlan){aiPlan=game.planAI();if(surface.clearAt(aiPlan.start))game.place(aiPlan.start);refresh();}
   const p=aiPlan.targets.shift();if(!p||distance(game.stone,p)<2){game.pass();aiPlan=null;refresh();return;}
   launch(p);
  },750);
 }
 function launch(p){
  if(disposed||motion||game.phase!=='ready')return;
  const d=distance(game.stone,p);if(d<2)return;
  releasePointer();const start={...game.stone};
  if(game.turn===1){
   const fitted=surface.aimAt(start,p,end=>game.owner(end)<0||game.owner(end)===1?500:game.shots===2&&game.owner(end)!==2?300:0);
   aim.value=((fitted.angle*180/Math.PI+540)%360)-180;power.value=fitted.power;
  }else{aim.value=Math.atan2(p.y-start.y,p.x-start.x)*180/Math.PI;power.value=Math.min(100,d/LAND.maxDistance*100);}
  const flight=surface.simulate(start,+aim.value*Math.PI/180,+power.value);
  motion={flight,elapsed:0,index:0,frame:flight.frames[0]};notice='';refresh();
 }
 function newBoard(){clearTimeout(timer);clearTimeout(endTimer);endTimer=null;releasePointer();motion=null;aiPlan=null;notice='';surface=new PebbleSurface();game=new PebbleTerritory({first});first=1-first;aim.value=0;power.value=45;result.classList.remove('show');refresh();scheduleAI();}
 fire.onclick=()=>{if(mine())launch(target());};
 pass.onclick=()=>{if(mine()){releasePointer();game.pass();aiPlan=null;notice=t('차례를 넘겼습니다.','Turn passed.');refresh();scheduleAI();}};
 aim.oninput=power.oninput=()=>{notice='';refresh();};
 root.querySelector('.chip-back').onclick=onExit;
 for(const [action,label,title] of [['in','+',t('확대','Zoom in')],['out','−',t('축소','Zoom out')],['left','↶',t('왼쪽 회전','Rotate left')],['right','↷',t('오른쪽 회전','Rotate right')],['home',t('기본 뷰','Reset view'),t('기본 뷰','Reset view')]]){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.camera=action;b.setAttribute('aria-label',title);b.onclick=()=>{releasePointer();view.control(action);refresh();};root.querySelector('.chip-camera').append(b);
 }
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
  if(pointer||![0,2].includes(e.button))return;e.preventDefault();canvas.focus({preventScroll:true});const p=view.hit(e.clientX,e.clientY);let mode=e.button===2?'orbit':'pan';
  if(e.button===0&&!e.shiftKey&&mine()&&p){
   const projected=view.project(game.stone);
   if(Math.hypot(projected.x-e.clientX,projected.y-e.clientY)<30)mode='shot';
   else if(!game.shots&&surface.clearAt(p)&&game.place(p)){mode='place';refresh();}
  }
  pointer={id:e.pointerId,mode,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);
 };
 canvas.onpointermove=e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  if(pointer.mode==='shot'&&mine()){
   const p=view.hit(e.clientX,e.clientY);if(p){const dx=game.stone.x-p.x,dy=game.stone.y-p.y;aim.value=Math.atan2(dy,dx)*180/Math.PI;power.value=Math.max(1,Math.min(100,Math.hypot(dx,dy)*2.4/LAND.maxDistance*100));refresh();}
  }else if(pointer.mode!=='place'){view.move(pointer.mode,pointer.x,pointer.y,e.clientX,e.clientY);refresh();}
  pointer.x=e.clientX;pointer.y=e.clientY;
 };
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;const shot=pointer.mode==='shot'&&Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>4;releasePointer();if(shot&&mine())launch(target());};
 canvas.onpointercancel=()=>{releasePointer();refresh();};
 canvas.onlostpointercapture=()=>{pointer=null;};
 const wheel=e=>{e.preventDefault();if(pointer)return;view.control(e.deltaY<0?'in':'out');refresh();};canvas.addEventListener('wheel',wheel,{passive:false});
 canvas.onkeydown=e=>{
  if(e.key==='Escape'){releasePointer();refresh();return;}
  if(['+','=','-','0'].includes(e.key)){e.preventDefault();view.control(e.key==='0'?'home':e.key==='-'?'out':'in');refresh();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown',' '].includes(e.key))return;e.preventDefault();if(!mine()||pointer)return;
  if(e.key===' '){if(!e.repeat)launch(target());return;}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const next=+aim.value+(e.key==='ArrowLeft'?-3:3);aim.value=(next+540)%360-180;}
  else power.value=Math.max(1,Math.min(100,+power.value+(['ArrowUp','PageUp'].includes(e.key)?2:-2)));refresh();
 };
 const blur=()=>{releasePointer();};window.addEventListener('blur',blur);
 function animate(now){
  if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;
  if(motion){
   motion.elapsed+=dt;
   while(motion.index<motion.flight.frames.length-1&&motion.flight.frames[motion.index+1].time<=motion.elapsed)motion.index++;
   motion.frame=motion.flight.frames[motion.index];view.sync(game,{surface,frame:motion.frame,flight:motion.flight,elapsed:motion.elapsed});
   if(motion.elapsed>=motion.flight.duration){const flight=motion.flight;motion=null;surface.commit(flight);const r=game.shoot(flight.end,flight.path);
    notice=(r.ended?(r.player===0?t('나: ','You: '):t('컴퓨터: ','Computer: ')):'')+(r.reason==='captured'?t('땅을 확보했습니다','Land captured')+(r.stolen?t(' · 상대 땅을 잘라냈습니다.',' · Rival territory cut away.'):'.'):messages[r.reason]||'');
    if(r.ended)aiPlan=null;refresh();scheduleAI();
   }
  }
  frame=requestAnimationFrame(animate);
 }
 newBoard();frame=requestAnimationFrame(animate);
 return{dispose(){disposed=true;clearTimeout(timer);clearTimeout(endTimer);cancelAnimationFrame(frame);releasePointer();window.removeEventListener('blur',blur);canvas.removeEventListener('wheel',wheel);view.dispose();}};
}
