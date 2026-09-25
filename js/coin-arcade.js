/* Hidden elevator arcade. Local, dependency-free practice game. */
(()=>{
'use strict';
const nav=document.querySelector('.section-elevator');if(!nav)return;
const en=()=>document.documentElement.lang==='en';
const t=(ko,eng)=>en()?eng:ko;
// Classic script loading works with file:// as well as HTTP(S).
const footballScriptURL=new URL('./js/chip-football.bundle.js',document.baseURI).href;
let footballLoad;
function loadFootball(){
 if(window.WorflogyChipFootball)return Promise.resolve(window.WorflogyChipFootball);
 if(footballLoad)return footballLoad;
 footballLoad=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=footballScriptURL;script.async=true;
  script.onload=()=>{if(window.WorflogyChipFootball)resolve(window.WorflogyChipFootball);else{footballLoad=null;script.remove();reject(new Error('Football bundle did not initialize'));}};
  script.onerror=()=>{footballLoad=null;script.remove();reject(new Error('Could not load football bundle'));};
  document.head.append(script);
 });
 return footballLoad;
}
const trigger=document.createElement('button');trigger.type='button';trigger.className='arcade-open';
trigger.innerHTML='<span aria-hidden="true">◀ | ▶</span><span></span>';nav.append(trigger);
const dialog=document.createElement('dialog');dialog.className='coin-arcade';dialog.setAttribute('data-language-control','');document.body.append(dialog);
let oldOverflow='',doorTimer,closing=false;
let gameHandle=null,gameGeneration=0;
const music=new Audio(new URL('./assets/audio/A_Rain_Slicked_Table.mp3',document.baseURI).href);
music.loop=true;music.preload='none';music.volume=.55;
let inLobby=false,musicBlocked=false;
try{music.muted=localStorage.getItem('worflogy-arcade-muted')==='true';}catch{}
function musicLabel(){
 const button=dialog.querySelector('.arcade-mute');if(!button)return;
 button.hidden=!inLobby;
 button.setAttribute('aria-pressed',String(music.muted));
 button.setAttribute('aria-label',musicBlocked?t('배경 음악 재생','Play background music'):t('배경 음악 음소거','Mute background music'));
 button.title=musicBlocked?t('배경 음악 재생','Play background music'):music.muted?t('음소거 해제','Unmute'):t('음소거','Mute');
 button.querySelector('.sound-waves').style.display=music.muted||musicBlocked?'none':'';
 button.querySelector('.sound-off').style.display=music.muted||musicBlocked?'':'none';
}
function syncMusic(){
 musicLabel();
 if(!dialog.open||closing||!inLobby||document.hidden){music.pause();return;}
 music.play().then(()=>{musicBlocked=false;musicLabel();if(!dialog.open||closing||!inLobby||document.hidden)music.pause();}).catch(error=>{if(error.name==='NotAllowedError'){musicBlocked=true;musicLabel();}});
}
document.addEventListener('visibilitychange',syncMusic);
new MutationObserver(musicLabel).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function syncBackground(){
 const video=dialog.querySelector('.arcade-background-video');if(!video)return;
 if(!dialog.open||closing||document.hidden){video.pause();return;}
 video.muted=true;video.play().catch(()=>{});
}
document.addEventListener('visibilitychange',syncBackground);
function watchBackground(video){
 let recoveryTimer;
 // WebGL startup can stall a fully buffered video without setting paused.
 // Re-seek only when playback has actually stopped, preserving its position.
 function recover(){
  if(recoveryTimer)return;
  const time=video.currentTime;
  recoveryTimer=setTimeout(()=>{
   recoveryTimer=null;
   if(!video.isConnected||!dialog.open||closing||document.hidden||video.seeking||video.currentTime!==time)return;
   for(let i=0;i<video.buffered.length;i++){
    if(video.buffered.start(i)<=time&&video.buffered.end(i)>time+.1){
     video.currentTime=time;syncBackground();break;
    }
   }
  },400);
 }
 video.addEventListener('waiting',recover);
 video.addEventListener('stalled',recover);
}
function stopGame(){gameGeneration++;gameHandle?.dispose();gameHandle=null;}
function label(){trigger.lastChild.textContent='OPEN';trigger.setAttribute('aria-label',t('문 열기 · 코인 오락실','Open doors · Coin arcade'));}
label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function open(){
 closing=false;
 oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 dialog.innerHTML='<video class="arcade-background-video" src="./assets/images/hidden-bg.mp4" muted loop playsinline preload="auto" inert disablepictureinpicture></video><div class="arcade-glow"></div><div class="arcade-shell"><header class="arcade-header"><button type="button" class="arcade-mute wf-button wf-button--glass" aria-label="Mute background music" aria-pressed="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/><g class="sound-waves"><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></g><path class="sound-off" d="m16 9 5 6m0-6-5 6"/></svg></button><span class="arcade-wordmark">WORFLOGY | AFTER HOURS</span><button type="button" class="arcade-close wf-button" autofocus aria-label="Close elevator doors"><span aria-hidden="true">▶ | ◀</span><span>CLOSE</span></button></header><div class="arcade-content"></div></div>';
 watchBackground(dialog.querySelector('.arcade-background-video'));
 dialog.querySelector('.arcade-mute').onclick=()=>{
 if(musicBlocked){music.muted=false;musicBlocked=false;}else music.muted=!music.muted;
 try{localStorage.setItem('worflogy-arcade-muted',String(music.muted));}catch{}
 syncMusic();
 };
 dialog.querySelector('.arcade-close').onclick=closeDoors;lobby();dialog.showModal();dialog.querySelector('.arcade-close').focus({preventScroll:true});syncBackground();syncMusic();
 const doors=createDoors();dialog.append(doors);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!closing&&dialog.open)doors.classList.add('opened');}));
 doorTimer=setTimeout(()=>doors.remove(),1100);
}
function createDoors(){
 const doors=document.createElement('div');doors.className='arcade-doors';doors.setAttribute('aria-hidden','true');doors.inert=true;
 for(let side=0;side<2;side++){
 const panel=document.createElement('div');panel.className='arcade-door '+(side?'right':'left');
 const page=document.createElement('div');page.className='arcade-page';page.style.cssText='width:'+innerWidth+'px;top:'+(-scrollY)+'px';
 for(const child of [...document.body.children]){
 if(child===dialog||['SCRIPT','DIALOG'].includes(child.tagName))continue;
 const clone=child.cloneNode(true);clone.querySelectorAll('script,iframe').forEach(n=>n.remove());
 const originals=child.querySelectorAll('canvas'),copies=clone.querySelectorAll('canvas');
 copies.forEach((c,i)=>{try{c.getContext('2d').drawImage(originals[i],0,0);}catch{}});
 clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));page.append(clone);
 }
 panel.append(page);doors.append(panel);
 }
 return doors;
}
function closeDoors(){
 if(closing||!dialog.open)return;
 closing=true;syncBackground();syncMusic();stopGame();clearTimeout(doorTimer);
 dialog.querySelector('.arcade-shell').inert=true;
 dialog.querySelectorAll('.arcade-doors').forEach(node=>node.remove());
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){dialog.close();return;}
 const doors=createDoors();doors.classList.add('opened');dialog.append(doors);
 let finished=false;
 const finish=()=>{if(finished)return;finished=true;clearTimeout(doorTimer);dialog.close();};
 doors.addEventListener('transitionend',e=>{if(e.target.classList.contains('arcade-door')&&e.propertyName==='transform')finish();});
 doors.getBoundingClientRect();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{doors.classList.remove('opened');doorTimer=setTimeout(finish,1150);}));
}
trigger.onclick=open;
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDoors();});
dialog.addEventListener('close',()=>{syncBackground();syncMusic();stopGame();clearTimeout(doorTimer);document.body.style.overflow=oldOverflow;dialog.querySelectorAll('.arcade-doors').forEach(node=>node.remove());closing=false;trigger.focus({preventScroll:true});});
window.addEventListener('null-sector-registered',()=>{if(dialog.open&&inLobby&&!closing)lobby();});
function lobby(){
 stopGame();inLobby=true;syncMusic();
 
 dialog.querySelector('.arcade-content').innerHTML='<div class="arcade-cards"><div class="wf-card wf-card--glass wf-card--compact football-card"><h2 class="wf-card__title" lang="en">3 CHIPS FOOTBALL</h2><button type="button" class="wf-card__action arcade-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div><div class="wf-card wf-card--glass wf-card--compact wf-card--glass-slate basketball-card"><h2 class="wf-card__title" lang="en">1 CHIP BASKETBALL</h2><button type="button" class="wf-card__action arcade-basketball-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div><div class="wf-card wf-card--glass wf-card--compact curling-card"><h2 class="wf-card__title" lang="en">3 CHIPS CURLING</h2><button type="button" class="wf-card__action arcade-curling-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div></div>';
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact wf-card--glass-slate book-flip-card"><h2 class="wf-card__title" lang="en">3 CHIPS BOOK FLIP</h2><button type="button" class="wf-card__action arcade-book-flip-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-book-flip-play').onclick=()=>start('book-flip');
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact wf-card--glass-slate eraser-card"><h2 class="wf-card__title" lang="en">ERASER WRESTLING</h2><button type="button" class="wf-card__action arcade-eraser-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-eraser-play').onclick=()=>start('eraser');
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact ping-card"><h2 class="wf-card__title" lang="en">CHALKBOARD PING PONG</h2><button type="button" class="wf-card__action arcade-ping-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-ping-play').onclick=()=>start('ping');
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact wf-card--glass-slate triangle-card"><h2 class="wf-card__title" lang="en">TRIANGLE TERRITORY</h2><button type="button" class="wf-card__action arcade-triangle-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-triangle-play').onclick=()=>start('triangle');
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact dots-boxes-card"><h2 class="wf-card__title" lang="en">DOTS AND BOXES</h2><button type="button" class="wf-card__action arcade-boxes-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-boxes-play').onclick=()=>start('boxes');
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card wf-card--glass wf-card--compact pebble-card"><h2 class="wf-card__title" lang="en">PEBBLE TERRITORY</h2><button type="button" class="wf-card__action arcade-pebble-play"><span aria-hidden="true">&#9654;</span> PLAY</button></div>');
 dialog.querySelector('.arcade-pebble-play').onclick=()=>start('pebble');
 const ready=!!window.WorflogyNullSector?.mount;
 dialog.querySelector('.arcade-cards').insertAdjacentHTML('beforeend','<div class="wf-card null-sector-card"><h2 class="wf-card__title" lang="en" aria-label="NULL SECTOR : PRE-DEMO"><span>NULL SECTOR</span><span class="wf-badge wf-badge--neutral null-sector-edition">PRE-DEMO</span></h2><button type="button" class="wf-button wf-button--primary arcade-null-sector-play" '+(ready?'':'disabled')+'>'+(ready?'PLAY':t('준비 중','COMING SOON'))+'</button></div>');
 dialog.querySelector('.arcade-null-sector-play').onclick=nullSectorEntry;
 dialog.querySelector('.arcade-play').onclick=()=>start('football');
 dialog.querySelector('.arcade-basketball-play').onclick=()=>start('basketball');
 dialog.querySelector('.arcade-curling-play').onclick=()=>start('curling');
}

function nullSectorEntry(){
 if(!window.WorflogyNullSector?.mount)return;
 const host=dialog.querySelector('.arcade-content');
 host.innerHTML='<form class="null-sector-entry wf-card wf-card--glass" data-language-control aria-labelledby="null-sector-entry-title"><h2 class="wf-card__title" id="null-sector-entry-title" lang="en">NULL SECTOR : PRE-DEMO</h2><div class="wf-field"><label for="null-sector-key">'+t('캔버스 12의 4자리 코드를 입력하세요.','Enter the four-digit code from canvas 12.')+'</label><input class="wf-input" id="null-sector-key" name="code" type="text" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off" required aria-describedby="null-sector-error"></div><p class="wf-notice wf-notice--error" id="null-sector-error" role="status" hidden></p><div class="null-sector-entry-actions"><button class="wf-button wf-button--primary" type="submit">START</button><button class="wf-button null-sector-back" type="button">BACK</button></div></form>';
 host.querySelector('.null-sector-back').onclick=lobby;
 const input=host.querySelector('input');input.focus();
 input.oninput=()=>{input.removeAttribute('aria-invalid');host.querySelector('[role="status"]').hidden=true;};
 host.querySelector('form').onsubmit=event=>{
  event.preventDefault();
  if(!window.WorflogyNullSector.accepts(input.value)){
   input.setAttribute('aria-invalid','true');host.querySelector('[role="status"]').hidden=false;
   host.querySelector('[role="status"]').textContent=t('코드가 일치하지 않습니다. 캔버스 12의 현재 코드를 확인하세요.','Code does not match. Check the current code on canvas 12.');input.select();return;
  }
  // Validate only at entry. No expiry timer is attached to a game session.
  start('null-sector');
 };
}
async function start(kind='football'){
 stopGame();inLobby=false;syncMusic();const generation=gameGeneration;
 const host=dialog.querySelector('.arcade-content');
 host.innerHTML='<p class="arcade-loading" role="status">'+t('게임을 준비하고 있습니다.','Preparing the game.')+'</p>';
 try{
 if(kind==='null-sector'){
  const handle=await window.WorflogyNullSector.mount(host,{onExit:lobby,onWin:lobby,english:en()});
  if(generation!==gameGeneration||!dialog.open||closing){handle?.dispose();return;}
  gameHandle=handle;return;
 }
 const games=await loadFootball();
 if(generation!==gameGeneration||!dialog.open||closing)return;
 gameHandle=(kind==='boxes'?games.mountDotsAndBoxes:kind==='pebble'?games.mountPebbleTerritory:kind==='triangle'?games.mountTriangleTerritory:kind==='ping'?games.mountChalkboardPingPong:kind==='eraser'?games.mountEraserWrestling:kind==='book-flip'?games.mountBookFlip:kind==='curling'?games.mountCurling:kind==='basketball'?games.mountBasketball:games.mountFootball)(host,{onExit:lobby,onWin:lobby,english:en()});
 }catch(error){
 if(generation!==gameGeneration||!dialog.open||closing)return;
 host.innerHTML='<p>'+t('게임을 불러오지 못했습니다.','Could not load the game.')+'</p><button type="button" class="wf-button">BACK</button>';
 host.querySelector('button').onclick=lobby;console.error(error);
 }
}
})();
