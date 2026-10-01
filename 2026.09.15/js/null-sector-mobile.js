/* Loaded inside the embedded game by the homepage build adapter. */
(()=>{
 'use strict';
 function mount(){
  const app=document.querySelector('#app'),lobby=document.querySelector('#lobby'),main=app?.querySelector(':scope > main');
  if(!app||!lobby||!main||document.querySelector('.ns-mobile-tools'))return;
  const bar=document.createElement('div');bar.className='ns-mobile-tools';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','모바일 전장 조작');
  const panels=[['squad','분대','.left-panel'],['targets','표적','.right-panel'],['info','작전','#app > footer']];
  function closePanels(){delete app.dataset.mobilePanel;bar.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));}
  for(const [key,label,selector] of panels){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.panel=key;button.setAttribute('aria-expanded','false');
   const panel=document.querySelector(selector);if(panel){panel.id||='ns-mobile-'+key;button.setAttribute('aria-controls',panel.id);}
   button.onclick=()=>{const open=app.dataset.mobilePanel!==key;closePanels();if(open){app.dataset.mobilePanel=key;button.setAttribute('aria-expanded','true');}};bar.append(button);
  }
  const command=document.createElement('button');command.type='button';command.className='ns-mobile-command';command.textContent='명령';command.setAttribute('aria-label','선택한 요원 명령');
  command.onclick=()=>{
   const card=document.querySelector('#squad .unit-card.selected')||document.querySelector('#squad [data-unit]');
   if(!card)return;closePanels();const r=main.getBoundingClientRect();
   // Reuse the game's existing command handler and its turn/AP validation.
   card.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:8,clientY:r.top+8}));
  };bar.append(command);
  for(const [label,delta,title] of [['+',-240,'전장 확대'],['−',240,'전장 축소']]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-label',title);
   button.onclick=()=>{const canvas=document.querySelector('#viewport canvas');if(!canvas)return;const r=canvas.getBoundingClientRect();canvas.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:delta,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));};bar.append(button);
  }
  main.before(bar);
  const caption=document.querySelector('.map-caption > span:nth-child(2)'),desktopCaption=caption?.textContent;
  const mobile=matchMedia('(max-width:760px)');
  const describeTouch=()=>{if(caption)caption.textContent=mobile.matches?'탭: 선택·이동 / 드래그: 회전 / 두 손가락: 이동·확대':desktopCaption;};
  mobile.addEventListener('change',describeTouch);describeTouch();
  document.querySelector('#squad')?.addEventListener('click',e=>{if(e.target.closest('[data-unit]'))closePanels();});
  document.querySelector('#enemies')?.addEventListener('click',e=>{if(e.target.closest('button'))closePanels();});
  const sync=()=>{bar.hidden=!lobby.hidden;bar.inert=!lobby.hidden;if(!lobby.hidden)closePanels();};
  new MutationObserver(sync).observe(lobby,{attributes:true,attributeFilter:['hidden']});sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
