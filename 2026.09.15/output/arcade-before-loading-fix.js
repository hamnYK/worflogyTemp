/* Hidden elevator arcade. Local, dependency-free practice game. */
(()=>{
'use strict';
const nav=document.querySelector('.section-elevator');if(!nav)return;
const en=()=>document.documentElement.lang==='en';
const t=(ko,eng)=>en()?eng:ko;
const trigger=document.createElement('button');trigger.type='button';trigger.className='arcade-open';
trigger.innerHTML='<span aria-hidden="true">◀ | ▶</span><span></span>';nav.append(trigger);
const dialog=document.createElement('dialog');dialog.className='coin-arcade';dialog.setAttribute('data-language-control','');document.body.append(dialog);
let oldOverflow='',doorTimer,closing=false;
let gameHandle=null,gameGeneration=0;
const backgroundMotion=matchMedia('(prefers-reduced-motion: reduce)');
function syncBackground(){
 const video=dialog.querySelector('.arcade-background-video');if(!video)return;
 if(!dialog.open||closing||document.hidden||backgroundMotion.matches){video.pause();return;}
 video.muted=true;video.play().catch(()=>{});
}
document.addEventListener('visibilitychange',syncBackground);
backgroundMotion.addEventListener('change',syncBackground);
function stopGame(){gameGeneration++;gameHandle?.dispose();gameHandle=null;}
function label(){trigger.lastChild.textContent='OPEN';trigger.setAttribute('aria-label',t('문 열기 · 코인 오락실','Open doors · Coin arcade'));}
label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function open(){
 closing=false;
 oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 dialog.innerHTML='<video class="arcade-background-video" src="./assets/images/hidden-bg.mp4" muted loop playsinline preload="auto" aria-hidden="true" tabindex="-1" disablepictureinpicture></video><div class="arcade-glow"></div><div class="arcade-shell"><header class="arcade-header"><span class="arcade-wordmark">WORFLOGY / AFTER HOURS</span><button type="button" class="arcade-close wf-button" aria-label="Close elevator doors"><span aria-hidden="true">▶ | ◀</span><span>CLOSE</span></button></header><div class="arcade-content"></div></div>';
 dialog.querySelector('.arcade-close').onclick=closeDoors;lobby();dialog.showModal();syncBackground();
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
 closing=true;syncBackground();stopGame();clearTimeout(doorTimer);
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
dialog.addEventListener('close',()=>{syncBackground();stopGame();clearTimeout(doorTimer);document.body.style.overflow=oldOverflow;dialog.querySelectorAll('.arcade-doors').forEach(node=>node.remove());closing=false;trigger.focus({preventScroll:true});});
function lobby(){
 stopGame();
 
 dialog.querySelector('.arcade-content').innerHTML='<div class="arcade-cards"><div class="holo-card football-card"><h2 class="card-title">3 CHIPS FOOTBALL</h2><button type="button" class="arcade-play"><span aria-hidden="true">▶</span> PLAY</button></div><div class="holo-card basketball-card"><h2 class="card-title">1 CHIP BASKETBALL</h2><span class="arcade-coming-soon">'+t('준비 중','Coming soon')+'</span></div></div>';
 dialog.querySelector('.arcade-play').onclick=start;
}

async function start(){
 stopGame();const generation=gameGeneration;
 const host=dialog.querySelector('.arcade-content');
 host.innerHTML='<p class="arcade-loading" role="status">'+t('3D 경기장을 준비하고 있습니다.','Preparing the 3D table.')+'</p>';
 try{
 const {mountFootball}=await import('./chip-football.mjs');
 if(generation!==gameGeneration||!dialog.open||closing)return;
 gameHandle=mountFootball(host,{onExit:lobby,onWin:lobby,english:en()});
 }catch(error){
 if(generation!==gameGeneration||!dialog.open||closing)return;
 host.innerHTML='<p>'+t('3D 경기장을 불러오지 못했습니다.','Could not load the 3D table.')+'</p><button type="button" class="wf-button">BACK</button>';
 host.querySelector('button').onclick=lobby;console.error(error);
 }
}
})();
