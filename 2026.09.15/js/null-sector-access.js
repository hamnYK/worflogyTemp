/* Hourly discovery key for a static site; not a server authentication secret. */
(()=>{
'use strict';
const HOUR=3600000;
// A decimal Feistel permutation keeps adjacent hourly keys different and
// gives every visitor the same four digits for the same clock hour.
function currentCode(now=Date.now()){
 let value=Math.floor(now/HOUR)%10000,left=Math.floor(value/100),right=value%100;
 for(let round=0;round<6;round++){
  let mix=Math.imul(right+31,0x45d9f3b)^Math.imul(round+17,0x27d4eb2d);
  mix=Math.imul(mix^(mix>>>16),0x45d9f3b);
  const next=(left+(mix>>>0)%100)%100;left=right;right=next;
 }
 return String(left*100+right).padStart(4,'0');
}
function mountEmbeddedGame(host,{onExit,english=false}){
 const arcade=host.closest('.coin-arcade');arcade.classList.add('null-sector-active');
 const shell=document.createElement('section');shell.className='null-sector-player';
 const bar=document.createElement('div');bar.className='null-sector-player-bar';
 const title=document.createElement('strong');title.textContent='NULL SECTOR : PRE-DEMO';title.lang='en';
 const back=document.createElement('button');back.type='button';back.className='wf-button';back.textContent=english?'BACK TO AFTER HOURS':'AFTER HOURS로 돌아가기';back.onclick=onExit;
 bar.append(title,back);
 const status=document.createElement('p');status.className='null-sector-load-status';status.setAttribute('role','status');status.textContent=english?'Loading NULL SECTOR…':'NULL SECTOR를 불러오는 중…';
 const frame=document.createElement('iframe');frame.className='null-sector-frame';frame.title='NULL SECTOR : PRE-DEMO';frame.allow='fullscreen';
 frame.src=new URL(location.protocol==='file:'?'./gkadudrnr-thegame/local/index.html':'./gkadudrnr-thegame/dist/index.html',document.baseURI).href;
 const failed=()=>{status.hidden=false;status.textContent=english?'Could not load NULL SECTOR. Return to AFTER HOURS and try again.':'NULL SECTOR를 불러오지 못했습니다. AFTER HOURS로 돌아가 다시 시도하세요.';};
 const ready=event=>{
  if(event.source!==frame.contentWindow)return;
  if(event.data?.type==='null-sector-ready')status.hidden=true;
  else if(event.data?.type==='null-sector-error')failed();
 };
 window.addEventListener('message',ready);frame.onerror=failed;
 shell.append(bar,status,frame);host.replaceChildren(shell);
 return{dispose(){window.removeEventListener('message',ready);frame.onload=null;frame.onerror=null;frame.remove();shell.remove();arcade.classList.remove('null-sector-active');}};
}
let mountGame=mountEmbeddedGame,timer;
window.WorflogyNullSector=Object.freeze({
 currentCode,
 accepts:value=>/^\d{4}$/.test(value)&&value===currentCode(),
 get mount(){return mountGame;},
 register(mount){if(typeof mount!=='function')throw new TypeError('Expected a game mount function');mountGame=mount;window.dispatchEvent(new Event('null-sector-registered'));}
});
const video=document.querySelector('#section-game-12 video');
if(!video)return;
const stage=document.createElement('div');stage.className='null-sector-stage';
video.replaceWith(stage);stage.append(video);
const overlay=document.createElement('div');overlay.className='null-sector-access';overlay.setAttribute('data-language-control','');
overlay.innerHTML='<span class="null-sector-code"></span><span class="null-sector-open"><span>&#9664; | &#9654;</span><span>OPEN</span></span>';
stage.append(overlay);
function refresh(){
 clearTimeout(timer);overlay.querySelector('.null-sector-code').textContent=currentCode();
 overlay.setAttribute('aria-label',document.documentElement.lang==='en'?'Game entry code. Press OPEN on the elevator at the right.':'게임 입장 코드. 오른쪽 엘리베이터의 OPEN 버튼을 누르세요.');
 timer=setTimeout(refresh,HOUR-Date.now()%HOUR+30);
}
refresh();document.addEventListener('visibilitychange',refresh);window.addEventListener('pageshow',refresh);
new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
