// Real game actions shared by pointer, keyboard and assistive button activation.
// Pointer capture and lifecycle cleanup prevent a held direction from sticking.
export function holdButton(button,action,{enabled=()=>true,delay=260,interval=70}={}){
 let pointer=null,timer=null,disposed=false;
 const abort=new AbortController(),options={signal:abort.signal};
 function stop(){clearTimeout(timer);timer=null;const id=pointer;pointer=null;if(id!==null&&button.hasPointerCapture(id))button.releasePointerCapture(id);button.classList.remove('is-held');}
 function run(){if(disposed||button.disabled||!enabled()){stop();return false;}action();return true;}
 function repeat(){if(pointer!==null&&run())timer=setTimeout(repeat,interval);}
 button.addEventListener('pointerdown',e=>{if(e.button!==0||pointer!==null||button.disabled||!enabled())return;e.preventDefault();pointer=e.pointerId;button.setPointerCapture(pointer);button.classList.add('is-held');if(run())timer=setTimeout(repeat,delay);},options);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>{if(e.pointerId===pointer)stop();},options);
 button.addEventListener('click',e=>{if(e.detail===0)run();},options);
 button.addEventListener('contextmenu',e=>e.preventDefault(),options);
 window.addEventListener('blur',stop,options);
 document.addEventListener('visibilitychange',stop,options);
 return{stop,dispose(){disposed=true;stop();abort.abort();}};
}

export function directionPad(root,{t,label,onMove,enabled=()=>true}){
 const pad=document.createElement('div');pad.className='arcade-touch-pad';pad.setAttribute('role','group');pad.setAttribute('aria-label',label);
 const bindings=[];
 for(const [direction,glyph,ko,en] of [['up','↑','위로','Up'],['left','←','왼쪽으로','Left'],['down','↓','아래로','Down'],['right','→','오른쪽으로','Right']]){
  const button=document.createElement('button');button.type='button';button.className='wf-button';button.dataset.move=direction;button.textContent=glyph;button.setAttribute('aria-label',label+' · '+t(ko,en));pad.append(button);
  bindings.push(holdButton(button,()=>onMove(direction),{enabled}));
 }
 root.append(pad);
 return{element:pad,sync(){for(const b of pad.children)b.disabled=!enabled();if(!enabled())bindings.forEach(b=>b.stop());},dispose(){bindings.forEach(b=>b.dispose());pad.remove();}};
}

// Dense projected dots retain direct tapping and also offer exact numbered input.
export function pointPicker(root,{t,choose}){
 const row=document.createElement('div');row.className='arcade-touch-controls arcade-point-picker';
 const label=document.createElement('label');label.textContent=t('점 번호','Dot number');
 const select=document.createElement('select');select.className='wf-input';label.append(select);
 const button=document.createElement('button');button.type='button';button.className='wf-button';button.textContent=t('점 선택','Select dot');button.onclick=()=>choose(Number(select.value));
 row.append(label,button);root.querySelector('.chip-controls').before(row);
 return{sync(buttons){
  if(select.options.length!==buttons.length)select.replaceChildren(...buttons.map((b,i)=>new Option(String(i+1),String(i))));
  select.disabled=button.disabled=buttons.every(b=>b.disabled);
  const selected=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');
  button.textContent=selected<0?t('점 선택','Select dot'):t('연결 / 선택 취소','Connect / deselect');
  for(let i=0;i<buttons.length;i++)select.options[i].disabled=buttons[i].disabled||(selected>=0&&i!==selected&&!buttons[i].classList.contains('triangle-available'));
 }};
}
