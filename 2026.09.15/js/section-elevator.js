/* Destination-aware section jumps with native scrolling and bilingual labels. */
(()=>{
 'use strict';
 const sections=[...document.querySelectorAll('#diagram-sections > section, #overview-summary-title, main > section.simple-section')];
 if(sections.length<2)return;
 const nav=document.createElement('nav');nav.className='section-elevator';nav.setAttribute('data-language-control','');
 const up=document.createElement('button'),down=document.createElement('button'),position=document.createElement('output');
 for(const [button,symbol] of [[up,'▲'],[down,'▼']]){button.type='button';const icon=document.createElement('span');icon.textContent=symbol;icon.setAttribute('aria-hidden','true');button.append(icon,document.createElement('span'));}
 nav.append(up,position,down);document.body.append(nav);
 let current=0,destination=null,frame=0,settle;
 const heading=i=>(sections[i]?.matches('h1,h2')?sections[i]:sections[i]?.querySelector('h1,h2'))?.textContent.replace(/\s+/g,' ').trim()||'';
 function render(){
  const en=document.documentElement.lang==='en',index=destination??current;
  nav.setAttribute('aria-label',en?'Section elevator':'섹션 엘리베이터');
  up.lastChild.textContent=en?'Up':'위층';down.lastChild.textContent=en?'Down':'아래층';
  up.disabled=index===0;down.disabled=index===sections.length-1;
  for(const [button,offset] of [[up,-1],[down,1]]){
   const label=button.disabled?(en?(offset<0?'First section':'Last section'):(offset<0?'첫 섹션':'마지막 섹션')):(en?(offset<0?'Previous section: ':'Next section: '):(offset<0?'이전 섹션: ':'다음 섹션: '))+heading(index+offset);
   button.setAttribute('aria-label',label);if(!button.disabled)button.setAttribute('aria-controls',sections[index+offset].id);else button.removeAttribute('aria-controls');
  }
  position.textContent=String(index+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0');
  position.setAttribute('aria-label',(en?'Current section: ':'현재 섹션: ')+heading(index));
 }
 function measure(){
  current=0;sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=88)current=i;});
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-3)current=sections.length-1;
  render();
 }
 function requestMeasure(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;measure();});}
 function finish(){destination=null;measure();}
 function jump(offset){
  destination=Math.max(0,Math.min(sections.length-1,(destination??current)+offset));render();
  const top=destination===0?0:destination===sections.length-1?document.documentElement.scrollHeight-innerHeight:sections[destination].getBoundingClientRect().top+scrollY-24;
  window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  clearTimeout(settle);settle=setTimeout(finish,1200);
 }
 up.addEventListener('click',()=>jump(-1));down.addEventListener('click',()=>jump(1));
 window.addEventListener('scroll',()=>{requestMeasure();clearTimeout(settle);settle=setTimeout(finish,180);},{passive:true});
 window.addEventListener('wheel',finish,{passive:true});window.addEventListener('touchstart',finish,{passive:true});
 window.addEventListener('keydown',e=>{if(['PageDown','PageUp','Home','End','ArrowUp','ArrowDown',' '].includes(e.key)&&!nav.contains(e.target))finish();});
 window.addEventListener('resize',requestMeasure);
 new MutationObserver(requestMeasure).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 measure();
})();
