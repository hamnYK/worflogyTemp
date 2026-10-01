/* Model review tools. Local-only; no credentials, document uploads or network calls. */

/* Add mobile field labels to dynamically rendered editors. */
document.addEventListener('DOMContentLoaded',()=>{
 const fieldNames={label:'이름 (label)',name:'이름 (name)',comment:'설명 (comment)',type:'유형 (type)',domain:'주체 유형 (domain)',range:'대상 유형 (range)',subClassOf:'상위 클래스 (subClassOf)',domain_class:'도메인 클래스',upper_class:'상위 클래스',description:'설명',equivalent_to:'동치 클래스',disjoint_with:'배타 클래스',id:'식별자 (ID)'};
 const annotate=()=>{
  document.querySelectorAll('[id^="s4gui-"] table, #upper-gui table, #abox-tbody, #query-tbody').forEach(node=>{
   const table=node.tagName==='TABLE'?node:node.closest('table');if(!table)return;
   table.classList.add('wf-mobile-table');
   const labels=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
   table.querySelectorAll('tbody tr').forEach((tr,index)=>{
    [...tr.cells].forEach((td,i)=>{
     const label=fieldNames[labels[i]]||labels[i]||(td.querySelector('button')?'조작':'항목');
     if(td.dataset.mobileLabel!==label)td.dataset.mobileLabel=label;
     td.querySelectorAll('input,select,textarea').forEach(el=>{
      if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',(index+1)+'행 '+label);
     });
     td.querySelectorAll('button').forEach(el=>{
      if(!el.textContent.trim()&&!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.title||'행 삭제');
     });
    });
   });
  });
 };
 let queued=false;
 const observer=new MutationObserver(()=>{
  if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;annotate();});
 });
 ['s4','s5','s6','s7'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true});});
 annotate();
 function revealTab(button){
  if(!button||!matchMedia('(max-width:768px)').matches)return;
  for(let bar=button.parentElement;bar;bar=bar.parentElement){
   const style=getComputedStyle(bar);
   if(!['auto','scroll'].includes(style.overflowX)||bar.scrollWidth<=bar.clientWidth)continue;
   const a=button.getBoundingClientRect(),b=bar.getBoundingClientRect();
   if(a.left<b.left||a.right>b.right)bar.scrollTo({left:bar.scrollLeft+a.left-b.left-(bar.clientWidth-a.width)/2,behavior:'auto'});
   break;
  }
 }
 for(const [name,id] of [
  ['switchInnerTab',(scenario,tab)=>'s4it-'+tab+'-'+scenario],
  ['switchS4Tab',scenario=>'s4btn-'+scenario],
  ['switchUpperTab',tab=>'utab-'+tab],
  ['switchInfTab',tab=>'inf-tab-'+tab],
  ['switchIntTab',tab=>'itab-'+tab],
  ['switchA10Tab',tab=>'a10-t'+tab],
  ['switchS7Tab',tab=>'s7tab-'+tab]
 ]){
  const original=window[name];if(typeof original!=='function')continue;
  window[name]=function(...args){const result=original.apply(this,args);revealTab(document.getElementById(id(...args)));return result;};
 }
 document.addEventListener('focusin',event=>{const button=event.target.closest?.('button');if(button)revealTab(button);});
});

(function () {
'use strict';
const clone = x => JSON.parse(JSON.stringify(x));
const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='ont_model_review_v1', fields=['schemas','upperOntology','infRules','infInstances'];
let history=[], baseline, timer, muted=false, originalPersist, storageNote='';
let returnFocus=null;
const snapshot=()=>Object.fromEntries(fields.map(k=>[k,clone(S[k] ?? (k==='schemas'?{}:k==='infInstances'?[]:null))]));
const stringify=x=>JSON.stringify(x);
function diffs(a,b,path='',out=[]){
 if(stringify(a)===stringify(b))return out;
 if(a && b && typeof a==='object' && typeof b==='object'){
  for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diffs(a[k],b[k],path?path+'.'+k:k,out);
 }else out.push({path,before:a,after:b});
 return out;
}
function persistHistory(){
 try{
  let data={version:1,baseline,history};
  while(history.length>1 && stringify(data).length>900000){history.shift();data={version:1,baseline,history};}
  if(stringify(data).length>1800000){localStorage.removeItem(KEY);storageNote='모델이 커서 변경 이력은 현재 탭에서만 유지됩니다.';return;}
  localStorage.setItem(KEY,stringify(data));storageNote='';
 }catch{storageNote='저장 공간이 부족하여 변경 이력은 현재 탭에서만 유지됩니다.';}
}
function flush(label='모델 편집'){
 clearTimeout(timer); if(muted)return;
 const now=snapshot();if(!baseline){baseline=now;return;}
 const changes=diffs(baseline,now);
 if(changes.length){
  history.push({time:new Date().toISOString(),label,before:baseline,after:now,changes});
  history=history.slice(-20);baseline=now;persistHistory();
 }
}
function refresh(){
 S.combined=buildCombined(); originalPersist();
 for(const id of Object.keys(S.schemas||{})){
  if(document.getElementById('s4gui-'+id))renderGuiEditor(Number(id));
  const raw=document.getElementById('s4raw-'+id);if(raw)raw.value=JSON.stringify(S.schemas[id],null,2);
 }
 if(document.getElementById('upper-gui'))renderUpperGuiEditor();
 for(const [id,key] of [['upper-ed','upperOntology'],['inf-ed','infRules']]){
  const el=document.getElementById(id);if(el)el.value=JSON.stringify(S[key],null,2);
 }
 if(typeof renderABoxTable==='function')renderABoxTable();
 if(typeof renderGraph==='function' && document.getElementById('graph-container')){try{renderGraph();}catch{}}
}
function transact(label,fn){
 flush();const before=snapshot();
 try {muted=true;fn();refresh();}catch(e){Object.assign(S,before);refresh();throw e;}
 finally{muted=false;}
 flush(label);
}
function restore(index){
 flush();const item=history[index];if(!item)throw Error('복원할 이력이 없습니다.');
 transact('복원: '+item.label,()=>Object.assign(S,clone(item.before)));
}
const atomFields=new Set(['condition','action','then','conditions','triple']);
const refFields=new Set(['subClassOf','domain','range','inverseOf','equivalent_to','disjoint_with','domain_class','upper_class','domain_instances','subject','predicate','object','target_class','path','s','t','p','o','class','type','source_rules','cascade_rules','rule_refs','next']);
function tokens(value,name){
 const escaped=String(name).replace(/[.*+?^$()|[\]\\]/g,'\\$&');
 return value===name || value==='ont:'+name || new RegExp('(^|[\\s(,∧])'+escaped+'(?=$|[\\s(),∧])').test(value);
}
function references(name,exclude=''){
 const out=[];
 function walk(v,p,key){
  if(typeof v==='string' && (refFields.has(key)||atomFields.has(key)) && tokens(v,name) && !(exclude && (p===exclude || p.startsWith(exclude+'.'))))out.push({path:p,value:v});
  else if(Array.isArray(v))v.forEach((x,i)=>walk(x,p+'.'+i,key));
  else if(v && typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,p? p+'.'+k:k,k));
 }
 walk(snapshot(),'','');return out;
}
function replaceRefs(oldName,newName){
 const escapeRE=x=>x.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
 const re=new RegExp('(^|[\\s(,∧])'+escapeRE(oldName)+'(?=$|[\\s(),∧])','g');
 function walk(v,key){
  if(typeof v==='string'){
   if(refFields.has(key))return v===oldName?newName:v==='ont:'+oldName?'ont:'+newName:v;
   if(atomFields.has(key))return v.replace(re,(_,prefix)=>prefix+newName);
   return v;
  }
  if(Array.isArray(v))return v.map(x=>walk(x,key));
  if(v && typeof v==='object')Object.keys(v).forEach(k=>v[k]=walk(v[k],k));
  return v;
 }
 fields.forEach(k=>S[k]=walk(S[k],k));
}
function modal(title){
 if(!document.getElementById('wf-review-dialog'))returnFocus=document.activeElement;
 document.getElementById('wf-review-dialog')?.remove();
 const d=document.createElement('dialog');d.id='wf-review-dialog';d.className='n-modal-box wf-review-dialog';d.setAttribute('aria-labelledby','wf-review-title');
 d.innerHTML='<header class="n-modal-header"><h3 id="wf-review-title" class="n-modal-htitle">'+esc(title)+'</h3><button type="button" class="btn btn-s btn-sm" data-close>닫기</button></header><div class="wf-review-body"></div>';
 document.body.append(d);d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;});d.showModal();
 return d.querySelector('.wf-review-body');
}
function button(text,fn,parent){
 const primary=new Set(['검토 내용 적용','이름과 참조 변경','재분류 적용','매핑 검토 저장','근거 저장','복원 적용']);
 const b=document.createElement('button');b.type='button';b.className='btn btn-sm '+(primary.has(text)?'btn-p':'btn-s');b.textContent=text;b.onclick=()=>{try{fn();}catch(e){toast(e.message,'error');}};
 let group=parent;
 if(!parent.classList.contains('wf-review-actions')){group=parent.lastElementChild;if(!group?.classList.contains('wf-review-actions')){group=document.createElement('div');group.className='wf-review-actions';parent.append(group);}}
 group.append(b);return b;
}
function input(parent,label,value='',multiline=false){
 const l=document.createElement('label');l.className='fg wf-review-field';l.textContent=label;
 const el=document.createElement(multiline?'textarea':'input');el.setAttribute('aria-label',label);el.value=value ?? '';el.className='inp wf-review-input';l.append(el);parent.append(l);return el;
}
function select(parent,label,options,value){
 const l=document.createElement('label');l.className='fg wf-review-field';l.textContent=label;const el=document.createElement('select');el.setAttribute('aria-label',label);el.className='inp wf-review-input';
 options.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;el.append(o);});el.value=value;l.append(el);parent.append(l);return el;
}
function provenance(parent,obj){
 const p=obj.provenance||{};
 const origin=select(parent,'작성 경로',[['unknown','미기록'],['document','문서에서 추출'],['ai','AI 제안'],['user','사용자 추가']],p.origin||'unknown');
 const doc=input(parent,'원문 문서명',p.document||'');
 const location=input(parent,'원문 위치 (쪽·절·행 등)',p.location||'');
 const quote=input(parent,'원문 인용',p.quote||obj.evidence_quote||'',true);
 const sourceView=document.createElement('details'),sourceTitle=document.createElement('summary'),sourceText=document.createElement('pre');sourceTitle.textContent='불러온 원문 대조';sourceView.append(sourceTitle,sourceText);parent.append(sourceView);
 sourceView.addEventListener('toggle',()=>{
  if(!sourceView.open)return;
  const source=(S.docs||[]).find(d=>d.name===doc.value.trim());
  if(!source){sourceText.textContent='이 문서를 현재 작업에서 찾을 수 없습니다. 문서 로드 단계에서 불러온 뒤 문서명을 정확히 입력하세요.';return;}
  const content=String(source.content??source.text??''),q=quote.value.trim(),at=q?content.indexOf(q):-1;
  if(q&&at<0){sourceText.textContent='입력한 인용문을 원문에서 찾지 못했습니다.\n\n'+content.slice(0,10000);return;}
  const start=at>=0?Math.max(0,at-500):0,end=Math.min(content.length,at>=0?at+q.length+500:10000);
  sourceText.textContent=(start?'…\n':'')+content.slice(start,end)+(end<content.length?'\n…':'');
 });
 const status=select(parent,'근거 상태',[['unverified','미확인'],['documented','문서 근거 제시'],['reviewed','사용자 원문 대조 완료']],p.status||obj.evidence_status||'unverified');
 const note=input(parent,'검토 메모',p.note||'',true);
 return ()=>({origin:origin.value,document:doc.value,location:location.value,quote:quote.value,status:status.value,note:note.value,modified_by:'user',modified_at:new Date().toISOString()});
}
function rows(id){
 const sc=S.schemas[id]||{},all=[];
 for(const [kind,label] of [['classes','클래스'],['individuals','개체'],['properties','속성'],['triples','트리플'],['exception_rules','예외 규칙'],['constraints','제약'],['procedures','업무 절차']]){
  (sc[kind]||[]).forEach((obj,i)=>all.push({kind,i,obj,label:label+' · '+(obj.label||obj.name||obj.rule_name||obj.shape_id||obj.title||[obj.subject,obj.predicate,obj.object].filter(x=>x!=null).join(' ')||i+1)}));
 }return all;
}
function renderPanel(id){
 const body=modal('모델 검토 · 근거 · 변경 관리'),sc=S.schemas[id];if(!sc){body.textContent='도메인 스키마를 먼저 생성하세요.';return;}
 body.innerHTML='<p>기존 모델의 의미를 확인하고, 원문 근거와 모델링 결정을 기록합니다. 적용 시 변경 이력이 남습니다.</p>';
 const actions=document.createElement('div');actions.className='wf-review-actions';body.append(actions);
 button('변경 이력',showHistory,actions);button('관계 중복 검토',()=>duplicates(id),actions);
 button('업무 절차 추가',()=>{transact('업무 절차 추가',()=>{(sc.procedures ||= []).push({id:'PROC_'+Date.now(),title:'새 업무 절차',actor:'',trigger:'',action:'',next:[],rule_refs:[],provenance:{origin:'user',status:'unverified'}});});renderPanel(id);},actions);
 button('개체 추가',()=>{transact('개체 추가',()=>{(sc.individuals ||= []).push({id:'ont:개체_'+Date.now(),label:'새 개체',class:'',provenance:{origin:'user',status:'unverified'}});});renderPanel(id);},actions);
 const list=rows(id);if(!list.length){body.append('편집할 요소가 없습니다.');return;}
 const pick=select(body,'검토할 요소',list.map((x,i)=>[String(i),x.label]),'0'),form=document.createElement('div');form.className='wf-review-form';body.append(form);
 function editor(){
  form.replaceChildren();const item=list[Number(pick.value)],obj=item.obj;
  let inverse,klass,title,actor,trigger,action,next,ruleRefs;
  if(item.kind==='properties')inverse=input(form,'역관계 (inverseOf) · 선언된 ObjectProperty 이름',obj.inverseOf||'');
  if(item.kind==='individuals'){title=input(form,'개체 이름',obj.label||'');klass=select(form,'소속 클래스',[['','선택하세요'],...(sc.classes||[]).map(c=>[c.label,c.label])],obj.class||'');}
  if(item.kind==='procedures'){
   title=input(form,'절차 이름',obj.title);actor=input(form,'담당 역할',obj.actor);trigger=input(form,'시작 조건',obj.trigger,true);action=input(form,'처리 내용',obj.action,true);
   next=input(form,'다음 절차 ID (세미콜론 구분)',(obj.next||[]).join('; '));ruleRefs=input(form,'참고 규칙 ID (세미콜론 구분)',(obj.rule_refs||[]).join('; '));
   const p=document.createElement('p');p.textContent='업무 절차는 담당자의 실행 순서입니다. OWL 추론이나 SHACL 제약으로 자동 실행되지 않습니다.';form.append(p);
  }
  const getProv=provenance(form,obj),actions=document.createElement('div');actions.className='wf-review-actions';form.append(actions);
  button('검토 내용 적용',()=>{
   if(inverse?.value){
    const target=(sc.properties||[]).find(p=>p.name===inverse.value);
    if(obj.type!=='owl:ObjectProperty'||target?.type!=='owl:ObjectProperty')throw Error('역관계는 선언된 두 ObjectProperty 사이에 지정하세요.');
   }
   if(klass && !klass.value)throw Error('개체의 소속 클래스를 선택하세요.');
   if(klass && title.value.trim()!==obj.label && references(obj.label).length)throw Error('참조가 있는 개체는 이름·참조 함께 변경을 사용하세요.');
   const split=v=>v.split(';').map(x=>x.trim()).filter(Boolean);
   if(next){
    const valid=new Set((sc.procedures||[]).map(p=>p.id));
    if(split(next.value).some(x=>!valid.has(x)))throw Error('다음 절차 ID가 이 도메인에 존재하지 않습니다.');
    const ruleIds=new Set([...(sc.exception_rules||[]).map(r=>r.rule_id),...(S.infRules?.inferred_rules||[]).map(r=>r.inference_id)]);
    if(split(ruleRefs.value).some(x=>!ruleIds.has(x)))throw Error('참고 규칙 ID를 확인하세요.');
   }
   transact('요소 검토: '+item.label,()=>{
    obj.provenance=getProv();
    if(inverse)obj.inverseOf=inverse.value.trim()||null;
    if(klass){obj.label=title.value.trim();obj.class=klass.value;}
    if(next)Object.assign(obj,{title:title.value,actor:actor.value,trigger:trigger.value,action:action.value,next:split(next.value),rule_refs:split(ruleRefs.value)});
   });toast('검토 내용을 저장했습니다.','success');
  },actions);
  if(item.kind==='classes')button('클래스 → 개체로 재분류',()=>conversion(id,item.i),actions);
  if(item.kind==='individuals')button('개체 → 클래스로 재분류',()=>conversion(id,item.i,true),actions);
  if(['classes','properties','individuals'].includes(item.kind))button('이름·참조 함께 변경',()=>rename(id,item.kind,item.i),actions);
  if(['individuals','procedures'].includes(item.kind))button('요소 삭제',()=>{const refs=item.kind==='procedures'?(sc.procedures||[]).filter(p=>(p.next||[]).includes(obj.id)):references(obj.label);if(refs.length)throw Error('이 요소를 참조하는 관계를 먼저 수정하세요.');transact('요소 삭제',()=>sc[item.kind].splice(item.i,1));renderPanel(id);},actions);
 }
 pick.onchange=editor;editor();
}
function impactList(body,refs){
 const p=document.createElement('p');p.textContent='관련 참조 '+refs.length+'곳';body.append(p);
 const pre=document.createElement('pre');pre.textContent=refs.slice(0,100).map(x=>x.path+' = '+x.value).join('\n')||'관련 참조 없음';body.append(pre);
}
function rename(id,kind,index,suggested){
 const obj=S.schemas[id][kind][index],key=kind==='properties'?'name':'label',old=obj[key];
 const body=modal('이름 변경 영향 확인');impactList(body,references(old));
 body.append('동일 이름의 참조를 현재 작업 전체에서 변경합니다. 다른 도메인의 동명이의어는 먼저 분리하세요.');
 const name=input(body,'새 이름',suggested||old);
 button('이름과 참조 변경',()=>{
  const n=name.value.trim();if(!n||n===old)return;
  const definitions=Object.values(S.schemas).flatMap(sc=>sc[kind]||[]);
  if(definitions.filter(x=>x[key]===old).length>1)throw Error('같은 이름의 정의가 여러 도메인에 있어 자동 변경할 수 없습니다. 도메인별로 검토하세요.');
  if(definitions.some(x=>x!==obj&&x[key]===n))throw Error('새 이름의 정의가 이미 있습니다.');
  transact('이름 변경: '+old+' → '+n,()=>{replaceRefs(old,n);obj[key]=n;if(obj.id==='ont:'+old)obj.id='ont:'+n;});
  renderPanel(id);
 },body);
}
function conversion(id,index,toClass=false){
 const sc=S.schemas[id],obj=sc[toClass?'individuals':'classes'][index],name=obj.label;
 const body=modal(toClass?'개체를 클래스로 재분류':'클래스를 개체로 재분류'),refs=references(name,'schemas.'+id+'.'+(toClass?'individuals':'classes')+'.'+index);
 impactList(body,refs);
 body.append('유형·계층·규칙의 의미가 바뀌므로 참조가 남아 있으면 재분류하지 않습니다. 참조를 수정한 후 적용하세요.');
 const target=toClass?null:select(body,'새 개체의 소속 클래스',[['','선택하세요'],...(sc.classes||[]).filter(c=>c!==obj).map(c=>[c.label,c.label])],'');
 button('재분류 적용',()=>{
  if(references(name,'schemas.'+id+'.'+(toClass?'individuals':'classes')+'.'+index).length)throw Error('표시된 참조를 먼저 수정하세요.');
  if(!toClass && !target.value)throw Error('소속 클래스를 선택하세요.');
  transact('재분류: '+name,()=>{
   if(toClass){(sc.classes ||= []).push({id:obj.id,label:name,type:'owl:Class',subClassOf:null,comment:obj.comment||'',provenance:obj.provenance});sc.individuals.splice(index,1);}
   else{(sc.individuals ||= []).push({id:obj.id,label:name,class:target.value,comment:obj.comment||'',provenance:obj.provenance});sc.classes.splice(index,1);}
  });renderPanel(id);
 },body);
}
function duplicates(id){
 const body=modal('관계 중복 검토'),props=S.schemas[id].properties||[];
 const normalize=s=>String(s||'').normalize('NFKC').replace(/[\s_\-]/g,'').toLowerCase();
 let n=0;
 for(let i=0;i<props.length;i++)for(let j=i+1;j<props.length;j++){
  const a=props[i],b=props[j];
  if(normalize(a.name)===normalize(b.name)||(a.domain===b.domain&&a.range===b.range&&a.type===b.type)){
   const p=document.createElement('p');p.textContent=a.name+' ↔ '+b.name+' · '+(normalize(a.name)===normalize(b.name)?'표기가 유사함':'유형·domain·range가 같음')+' — 의미가 같은지는 설명을 대조하세요.';body.append(p);n++;
  }
 }if(!n)body.textContent='표기·유형·domain·range 기준의 중복 후보가 없습니다. 의미적 동일성을 판정하는 검사는 아닙니다.';
}
function mappingPanel(){
 const body=modal('상위 개념 매핑 근거'),groups=S.upperOntology?.ontology_groups||[],items=[];
 groups.forEach((g,gi)=>{
  (g.subclass_mappings||[]).forEach((m,mi)=>items.push({gi,mi,m,label:g.group_name+' · '+m.domain_class+' → '+m.upper_class}));
  (g.upper_classes||[]).forEach((m,mi)=>items.push({gi,mi,m,isClass:true,label:g.group_name+' · 상위 클래스 '+m.name}));
 });
 if(!items.length){body.textContent='먼저 상위 개념 매핑을 생성하세요.';return;}
 const pick=select(body,'검토할 매핑',items.map((x,i)=>[String(i),x.label]),'0'),form=document.createElement('div');body.append(form);
 const render=()=>{form.replaceChildren();const {m}=items[Number(pick.value)],reason=input(form,'공통화한 이유',m.rationale||'',true),difference=input(form,'유지해야 할 도메인 차이',m.preserved_differences||'',true),getProv=provenance(form,m);
 button('매핑 검토 저장',()=>{transact('상위 매핑 근거 수정',()=>Object.assign(m,{rationale:reason.value,preserved_differences:difference.value,provenance:getProv()}));toast('매핑 근거를 저장했습니다.','success');},form);};
 pick.onchange=render;render();
}
function inferencePanel(){
 const body=modal('추론 규칙 근거'),rules=S.infRules?.inferred_rules||[];
 if(!rules.length){body.textContent='추론 규칙을 먼저 생성하세요.';return;}
 const pick=select(body,'규칙',rules.map((r,i)=>[String(i),(r.inference_id||'')+' · '+(r.inference_name||'')]),'0'),form=document.createElement('div');body.append(form);
 const render=()=>{form.replaceChildren();const r=rules[Number(pick.value)],getProv=provenance(form,r);
 button('근거 저장',()=>{transact('추론 규칙 근거 수정',()=>r.provenance=getProv());toast('근거를 저장했습니다.','success');},form);};
 pick.onchange=render;render();
}
function showHistory(){
 flush();const body=modal('모델 변경 이력');
 body.append('최근 20개 변경 묶음을 이 브라우저에 보관합니다. 문서 원본·API 키는 이력에 포함하지 않습니다. '+storageNote);
 button('현재 모델 기준점 기록',()=>{flush();const now=snapshot();history.push({time:new Date().toISOString(),label:'사용자 기준점',before:now,after:now,changes:[]});history=history.slice(-20);baseline=now;persistHistory();showHistory();},body);
 button('이력 파일 저장',()=>{const blob=new Blob([JSON.stringify({version:1,baseline,history},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ontology_model_history.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},body);
 button('이력 지우기',()=>{history=[];baseline=snapshot();persistHistory();showHistory();},body);
 [...history].reverse().forEach((entry,j)=>{
  const i=history.length-1-j,d=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent=new Date(entry.time).toLocaleString()+' · '+entry.label+' · '+entry.changes.length+'개 필드';d.append(summary);
  const pre=document.createElement('pre');pre.textContent=entry.changes.map(c=>c.path+'\n이전: '+JSON.stringify(c.before)+'\n이후: '+JSON.stringify(c.after)).join('\n\n');d.append(pre);
  button('이 변경 직전 모델로 복원',()=>{const confirmBody=modal('모델 복원 확인');confirmBody.append('현재 모델 전체를 선택한 변경 직전 상태로 복원합니다. 현재 상태도 새 이력으로 남아 되돌릴 수 있습니다.');button('복원 적용',()=>{restore(i);showHistory();},confirmBody);},d);body.append(d);
 });
 if(!history.length)body.append('아직 기록된 모델 변경이 없습니다.');
}
function install(){
 if(typeof S==='undefined')return;
 originalPersist=_persistState;
 baseline=snapshot();
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&Array.isArray(saved.history)){history=saved.history.slice(-20);if(saved.baseline&&stringify(saved.baseline.schemas)===stringify(baseline.schemas)){S.infInstances=saved.baseline.infInstances||S.infInstances;baseline=snapshot();}}}catch{}
 const persist=_persistState;window._persistState=function(){const result=persist.apply(this,arguments);if(!muted){clearTimeout(timer);timer=setTimeout(()=>flush(),700);}return result;};
 const gui=renderGuiEditor;window.renderGuiEditor=function(id){gui(id);const host=document.getElementById('s4gui-'+id);if(host&&!host.querySelector('[data-wf-review]')){const bar=document.createElement('div');bar.dataset.wfReview='';bar.className='wf-review-actions';button('모델 검토 · 근거 · 재분류',()=>renderPanel(id),bar);button('변경 이력',showHistory,bar);host.prepend(bar);}};
 const upper=renderUpperGuiEditor;window.renderUpperGuiEditor=function(){upper();const host=document.getElementById('upper-gui');if(host&&!host.querySelector('[data-wf-review]')){const bar=document.createElement('div');bar.dataset.wfReview='';bar.className='wf-review-actions';button('매핑 이유·차이 기록',mappingPanel,bar);button('변경 이력',showHistory,bar);host.prepend(bar);}};
 for(const [fn,kind,key] of [['updateClass','classes','label'],['updateProperty','properties','name']]){
  const original=window[fn];window[fn]=function(id,index,field,value){
   const obj=S.schemas[id]?.[kind]?.[index];
   if(obj&&field===key&&obj[key]&&obj[key]!==value&&references(obj[key],'schemas.'+id+'.'+kind+'.'+index).length){
    rename(id,kind,index,value);renderGuiEditor(Number(id));return;
   }
   return original.apply(this,arguments);
  };
 }
 for(const [fn,kind] of [['addClass','classes'],['addProperty','properties'],['addTriple','triples']]){
  const original=window[fn];window[fn]=function(id){flush();const result=original.apply(this,arguments);const obj=S.schemas[id]?.[kind]?.at(-1);if(obj)obj.provenance={origin:'user',status:'unverified',created_at:new Date().toISOString()};flush('사용자 요소 추가');return result;};
 }
 for(const fn of ['syncUpper','syncInf','addInstanceRow','clearInstances']){
  const original=window[fn];if(!original)continue;
  window[fn]=function(){flush();const result=original.apply(this,arguments);S.combined=buildCombined();originalPersist();flush('모델 수정');return result;};
 }
 for(const [fn,get] of [
  ['extractSchemaForScenario',id=>S.schemas[id]],
  ['genUpperOntology',()=>S.upperOntology],
  ['genInf',()=>S.infRules]
 ]){
  const original=window[fn];
  window[fn]=async function(){flush();const previous=get(arguments[0]);const result=await original.apply(this,arguments),now=get(arguments[0]);
   if(now&&now!==previous){
    const tag=obj=>{if(!obj||typeof obj!=='object')return;for(const [k,v] of Object.entries(obj)){if(k==='provenance')continue;if(Array.isArray(v))v.forEach(x=>{if(x&&typeof x==='object'){if(['classes','properties','triples','exception_rules','constraints','upper_classes','subclass_mappings','inferred_rules'].includes(k))x.provenance ||= {origin:'ai',status:'unverified',created_at:new Date().toISOString()};tag(x);}});else if(v&&typeof v==='object')tag(v);}};
    tag(now);originalPersist();flush('AI 초안 생성');
   }return result;
  };
 }
 const infHost=document.getElementById('inf-ed')?.parentElement;
 if(infHost){const bar=document.createElement('div');bar.className='wf-review-actions';button('추론 규칙 근거 기록',inferencePanel,bar);button('변경 이력',showHistory,bar);infHost.prepend(bar);}
 const removeUpper=removeUpperClass;window.removeUpperClass=function(gi,ci){
  const obj=S.upperOntology?.ontology_groups?.[gi]?.upper_classes?.[ci];if(!obj)return;
  const refs=references(obj.name,'upperOntology.ontology_groups.'+gi+'.upper_classes.'+ci);
  if(refs.length){const b=modal('상위 클래스 삭제 영향');impactList(b,refs);b.append('참조가 남아 있어 삭제를 보류했습니다. 매핑과 관계를 먼저 수정하세요.');return;}
  transact('상위 클래스 삭제',()=>removeUpper(gi,ci));
 };
 const updateUpper=updateUpperClass;window.updateUpperClass=function(gi,ci,field,value){
  const obj=S.upperOntology?.ontology_groups?.[gi]?.upper_classes?.[ci];
  if(!obj||field!=='name'||!obj.name||obj.name===value)return updateUpper.apply(this,arguments);
  const old=obj.name,refs=references(old,'upperOntology.ontology_groups.'+gi+'.upper_classes.'+ci);
  if(!refs.length)return updateUpper.apply(this,arguments);
  const b=modal('상위 클래스 이름 변경 영향');impactList(b,refs);const n=input(b,'새 이름',value);
  button('이름과 참조 변경',()=>{
   const v=n.value.trim();if(!v)throw Error('새 이름을 입력하세요.');
   const all=(S.upperOntology.ontology_groups||[]).flatMap(g=>g.upper_classes||[]);
   if(all.filter(c=>c.name===old).length>1||all.some(c=>c!==obj&&c.name===v))throw Error('상위 클래스 이름이 중복됩니다. 그룹별 의미를 먼저 확인하세요.');
   transact('상위 클래스 이름 변경',()=>{replaceRefs(old,v);obj.name=v;if(obj.id==='ont:'+old)obj.id='ont:'+v;});
   b.closest('dialog').close();
  },b);renderUpperGuiEditor();
 };
 for(const [fn,kind] of [['updateClass','classes'],['updateProperty','properties'],['updateTriple','triples'],['updateRule','exception_rules'],['updateConstraint','constraints']]){
  const original=window[fn];if(!original)continue;
  window[fn]=function(id,index){
   const obj=S.schemas[id]?.[kind]?.[index],before=obj?stringify(obj):null,result=original.apply(this,arguments);
   if(obj&&stringify(obj)!==before){obj.provenance={...(obj.provenance||{origin:'unknown',status:'unverified'}),modified_by:'user',modified_at:new Date().toISOString()};originalPersist();}
   return result;
  };
 }
 for(const [fn,kind,key] of [['removeClass','classes','label'],['removeProperty','properties','name'],['removeRule','exception_rules','rule_id']]){
  const original=window[fn];window[fn]=function(id,index){
   const obj=S.schemas[id]?.[kind]?.[index];if(!obj)return;
   const refs=references(obj[key],'schemas.'+id+'.'+kind+'.'+index);
   if(refs.length){const body=modal('삭제 영향 확인');impactList(body,refs);body.append('참조가 남아 있어 삭제를 보류했습니다. 해당 참조를 수정하거나 이름·참조 함께 변경을 사용하세요.');return;}
   transact('삭제: '+obj[key],()=>original(id,index));
  };
 }
 document.addEventListener('change',e=>{if(e.target.closest('#wf-review-dialog'))return;const handler=e.target.getAttribute('oninput')||e.target.getAttribute('onchange')||'';if(/update(Class|Property|Triple|Rule|Constraint|Upper)|S\.infInstances/.test(handler)){originalPersist();flush('편집 필드 변경');}});
 window.addEventListener('pagehide',()=>flush());
 for(const id of Object.keys(S.schemas||{}))if(document.getElementById('s4gui-'+id))renderGuiEditor(Number(id));
 if(S.upperOntology)renderUpperGuiEditor();
}
window.WorkshopReview={snapshot,diffs,flush,references,replaceRefs,transact,restore,open:renderPanel,history:()=>history,showHistory,mappingPanel};
document.addEventListener('DOMContentLoaded',install);
})();

/* Add explicit semantics and a visible export report to the existing JSON-LD export. */
(function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iri=s=>/^(https?:|urn:|ont:|owl:|rdf:|rdfs:|xsd:|sh:|swrl:|swrlb:)/.test(String(s))?String(s):'ont:'+String(s).trim().replace(/\s+/g,'_');
const ref=s=>({'@id':iri(s)});
const splitAtoms=value=>{
 if(Array.isArray(value))return value.flatMap(splitAtoms);
 const s=String(value||'').trim(),result=[];let depth=0,quote='',escaped=false,start=0;
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}if(c==='(')depth++;if(c===')')depth--;
  if(depth<0)throw Error('규칙 괄호가 맞지 않습니다.');
  if(depth===0&&(c==='∧'||c===';'||s.slice(i,i+5).toLowerCase()===' and ')){result.push(s.slice(start,i).trim());if(c===' ')i+=4;start=i+1;}
 }
 if(depth||quote)throw Error('규칙 괄호 또는 따옴표가 닫히지 않았습니다.');
 result.push(s.slice(start).trim());return result.filter(Boolean);
};
function args(text){
 const out=[];let quote='',escaped=false,start=0;
 for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c===','){out.push(text.slice(start,i).trim());start=i+1;}}
 if(quote)throw Error('인수 따옴표를 확인하세요.');out.push(text.slice(start).trim());if(out.some(x=>!x))throw Error('빈 규칙 인수입니다.');return out;
}
function ruleAtoms(text,classes,props,vars){
 function value(s,literal=false){
  if(/^\?[\p{L}\p{N}_]+$/u.test(s)){const id='urn:worflogy:variable:'+encodeURIComponent(s.slice(1));vars.add(id);return {'@id':id};}
  if(s.startsWith('"')){let v;try{v=JSON.parse(s);}catch{throw Error('리터럴은 JSON 문자열 형식으로 작성하세요.');}return {'@value':v};}
  if(s.startsWith("'")&&s.endsWith("'"))return {'@value':s.slice(1,-1)};
  if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return {'@value':Number(s)};
  if(s==='true'||s==='false')return {'@value':s==='true'};
  if(literal)return {'@value':s};
  return ref(s.replace(/^:/,'ont:'));
 }
 return splitAtoms(text).map(atom=>{
  const m=atom.match(/^([^()\s]+)\s*\((.*)\)$/s);if(!m)throw Error('지원하는 원자 표기가 아닙니다: '+atom);
  const predicate=m[1],a=args(m[2]);
  if(predicate.startsWith('swrlb:')){
   if(!/^swrlb:(greaterThan|greaterThanOrEqual|lessThan|lessThanOrEqual|equal|notEqual|contains|startsWith|endsWith|add|subtract|multiply|divide)$/.test(predicate))throw Error('내보내기를 지원하지 않는 내장함수: '+predicate);
   const arity=/:(add|subtract|multiply|divide)$/.test(predicate)?3:2;
   if(a.length!==arity)throw Error('지원 내장함수 인수는 '+arity+'개여야 합니다.');
   return {'@type':'swrl:BuiltinAtom','swrl:builtin':ref(predicate),'swrl:arguments':{'@list':a.map(x=>value(x,true))}};
  }
  if(['sameAs','owl:sameAs','differentFrom','owl:differentFrom'].includes(predicate)){
   if(a.length!==2)throw Error('동일·상이 개체 원자는 두 인수가 필요합니다.');
   if(a.some(x=>'@value' in value(x)))throw Error('동일·상이 개체 원자에 리터럴을 사용할 수 없습니다.');
   return {'@type':predicate.includes('sameAs')?'swrl:SameIndividualAtom':'swrl:DifferentIndividualsAtom','swrl:argument1':value(a[0]),'swrl:argument2':value(a[1])};
  }
  const name=predicate.replace(/^ont:/,'');
  const individual=s=>{const v=value(s);if('@value' in v)throw Error('개체 인수 위치에 리터럴이 있습니다.');return v;};
  if(classes.has(name)&&a.length===1)return {'@type':'swrl:ClassAtom','swrl:classPredicate':ref(predicate),'swrl:argument1':individual(a[0])};
  const p=props.get(name);
  if(p&&a.length===2)return {'@type':p.type==='owl:DatatypeProperty'?'swrl:DatavaluedPropertyAtom':'swrl:IndividualPropertyAtom','swrl:propertyPredicate':ref(predicate),'swrl:argument1':individual(a[0]),'swrl:argument2':p.type==='owl:DatatypeProperty'?value(a[1],true):individual(a[1])};
  throw Error('클래스·속성 선언 또는 원자 인수 수를 확인하세요: '+predicate);
 });
}
function enrich(base){
 const graph=base['@graph'],warnings=[],vars=new Set(),ctx=base['@context'];
 Object.assign(ctx,{swrl:'http://www.w3.org/2003/11/swrl#',swrlb:'http://www.w3.org/2003/11/swrlb#',prov:'http://www.w3.org/ns/prov#'});
 const schemas=(S.combined||{}).domain_schemas||{},props=new Map(),classes=new Set(),owners=new Map();
 const definitions=new Map();
 for(const [domain,sc] of Object.entries(schemas)){
  (sc.classes||[]).forEach(c=>{classes.add(c.label);const key='class:'+c.label;if(definitions.has(key))warnings.push('도메인 간 같은 클래스 이름을 하나의 IRI로 내보냅니다: '+c.label+' ('+definitions.get(key)+', '+domain+'). 동명이의어 여부를 검토하세요.');else definitions.set(key,domain);});
  (sc.properties||[]).forEach(p=>{props.set(p.name,p);const key='property:'+p.name;if(definitions.has(key))warnings.push('도메인 간 같은 속성 이름을 하나의 IRI로 내보냅니다: '+p.name+' — 정의 차이를 검토하세요.');else definitions.set(key,domain);});
 }
 (S.upperOntology?.ontology_groups||[]).forEach(g=>(g.upper_classes||[]).forEach(c=>classes.add(c.name)));
 const annotate=(node,obj)=>{
  if(obj.provenance)node['ont:provenanceRecord']=JSON.stringify(obj.provenance);
 };
 const add=(id,obj)=>{const n={'@id':iri(id),...obj};graph.push(n);return n;};
 const exportRule=(r,condition,action,domain)=>{
  const id=r.rule_id||r.inference_id||'RULE';
  if(owners.has(id))warnings.push('규칙 ID가 중복됩니다: '+id+' — 원본 규칙 문자열을 포함하며 도메인별 구조화 규칙 IRI를 사용합니다.');
  owners.set(id,domain);
  const node=add('urn:worflogy:rule:'+encodeURIComponent(domain)+':'+encodeURIComponent(id),{'@type':'ont:RuleDraft','rdfs:label':r.rule_name||r.inference_name||id,'ont:sourceRuleId':id,'ont:domain':domain,'ont:conditionText':Array.isArray(condition)?condition.join(' ∧ '):String(condition||''),'ont:actionText':String(action||'')});
  annotate(node,r);
  node['ont:sourceRules']=(r.source_rules||[]).map(x=>({'@value':x}));
  try{
   const localVars=new Set(),body=ruleAtoms(condition,classes,props,localVars),head=ruleAtoms(action,classes,props,localVars);
   if(!body.length||!head.length)throw Error('조건 또는 결론이 비어 있습니다.');
   const bodyVars=new Set([...JSON.stringify(body).matchAll(/urn:worflogy:variable:[^"]+/g)].map(m=>m[0]));
   for(const m of JSON.stringify(head).matchAll(/urn:worflogy:variable:[^"]+/g))if(!bodyVars.has(m[0]))throw Error('결론에만 있는 변수가 있습니다.');
   if(head.some(a=>a['@type']==='swrl:BuiltinAtom'))throw Error('결론부 내장함수는 이 내보내기에서 지원하지 않습니다.');
   node['@type']='swrl:Imp';node['swrl:body']={'@list':body};node['swrl:head']={'@list':head};localVars.forEach(v=>vars.add(v));
  }catch(e){warnings.push(id+': SWRL 구조화 변환 생략 — '+e.message+' 원문 규칙은 보존됩니다.');}
 };
 for(const [domain,sc] of Object.entries(schemas)){
  for(const c of sc.classes||[]){
   const n=add(c.label,{});annotate(n,c);
   if(c.equivalent_to)n['owl:equivalentClass']=ref(c.equivalent_to);
   if(c.disjoint_with?.length)n['owl:disjointWith']=c.disjoint_with.map(ref);
   if(c.id&&c.id!==iri(c.label))warnings.push('클래스 '+c.label+': 내보내기 IRI는 이름에서 생성됩니다. 원본 id '+c.id+'는 별도 보존합니다.');
   if(c.id)n['ont:sourceIdentifier']=c.id;
  }
  for(const p of sc.properties||[]){
   const n=add(p.name,{});if(p.comment)n['rdfs:comment']=p.comment;annotate(n,p);
   if(p.inverseOf){if(p.type==='owl:ObjectProperty'&&props.get(p.inverseOf)?.type==='owl:ObjectProperty')n['owl:inverseOf']=ref(p.inverseOf);else{n['ont:unresolvedInverse']=p.inverseOf;warnings.push(p.name+': 역관계 대상의 ObjectProperty 선언을 확인하세요.');}}
  }
  for(const i of sc.individuals||[]){
   const n=add(i.label||i.id,{'@type':['owl:NamedIndividual',...(i.class?[iri(i.class)]:[])],'rdfs:label':i.label||i.id});annotate(n,i);if(i.id)n['ont:sourceIdentifier']=i.id;
  }
  (sc.triples||[]).forEach((t,index)=>{
   if(!t.provenance)return;
   const p=props.get(t.predicate),literal=p?.type==='owl:DatatypeProperty'||typeof t.object==='number'||typeof t.object==='boolean';
   const value=literal?{'@value':t.object}:ref(t.object);if(literal&&p?.range?.startsWith('xsd:'))value['@type']=p.range;
   const n=add('urn:worflogy:evidence:'+encodeURIComponent(domain)+':'+index,{'@type':'rdf:Statement','rdf:subject':ref(t.subject),'rdf:predicate':ref(t.predicate),'rdf:object':value});annotate(n,t);
  });
  (sc.exception_rules||[]).forEach(r=>exportRule(r,r.if?.conditions,r.then,domain));
  for(const c of sc.constraints||[]){
   const n=add(c.shape_id||c.target_class+'Shape',{});annotate(n,c);
   const unsupported=Object.keys(c).filter(k=>!['shape_id','w3c_standard','target_class','path','min_count','max_count','severity','exception_message','provenance'].includes(k));
   if(unsupported.length){n['ont:sourceConstraint']=JSON.stringify(c);warnings.push((c.shape_id||'제약')+': 추가 필드는 원본으로 보존하며 SHACL 의미 변환은 지원하지 않습니다 — '+unsupported.join(', '));}
  }
  for(const p of sc.procedures||[]){
   const n=add('urn:worflogy:procedure:'+encodeURIComponent(domain)+':'+encodeURIComponent(p.id),{'@type':'ont:WorkflowStep','rdfs:label':p.title||p.id,'ont:actor':p.actor||'','ont:trigger':p.trigger||'','ont:action':p.action||'','ont:nextStep':(p.next||[]).map(id=>({'@id':'urn:worflogy:procedure:'+encodeURIComponent(domain)+':'+encodeURIComponent(id)})),'ont:ruleReferences':(p.rule_refs||[]).join('; ')});annotate(n,p);
  }
 }
 for(const g of S.upperOntology?.ontology_groups||[]){
  for(const c of g.upper_classes||[]){
   const n=add(c.name,{});annotate(n,c);
   if(c.rationale)n['ont:rationale']=c.rationale;
   if(c.preserved_differences)n['ont:preservedDifferences']=c.preserved_differences;
   if(c.equivalent_to)n['owl:equivalentClass']=ref(c.equivalent_to);
   if(c.disjoint_with?.length)n['owl:disjointWith']=c.disjoint_with.map(ref);
  }
  for(const [i,m] of (g.subclass_mappings||[]).entries()){
   const n=add('urn:worflogy:mapping:'+encodeURIComponent(g.group_name||'group')+':'+i,{'@type':'owl:Axiom','owl:annotatedSource':ref(m.domain_class),'owl:annotatedProperty':ref('rdfs:subClassOf'),'owl:annotatedTarget':ref(m.upper_class),'ont:rationale':m.rationale||'','ont:preservedDifferences':m.preserved_differences||''});annotate(n,m);
  }
 }
 (S.infRules?.inferred_rules||[]).forEach(r=>exportRule(r,r.condition,r.action,'inference'));
 (S.infInstances||[]).forEach((i,index)=>{
  if(!i.s)return;const n=add(i.s,{'@type':['owl:NamedIndividual',...(i.t?[iri(i.t)]:[])]});
  if(i.p && i.o!=='' && i.o!=null){
   const p=props.get(i.p);if(!p&&i.p!=='rdf:type')warnings.push('A-Box '+(index+1)+': 속성 선언 없이 객체를 IRI로 처리합니다 — '+i.p);
   n[iri(i.p)]=p?.type==='owl:DatatypeProperty'?{'@value':i.o,...(p.range?.startsWith('xsd:')?{'@type':p.range}:{})}:ref(i.o);
  }
 });
 vars.forEach(id=>graph.push({'@id':id,'@type':'swrl:Variable'}));
 const report={warnings:[...new Set(warnings)],structuredRules:graph.filter(n=>n['@type']==='swrl:Imp').length,note:'업무 절차와 근거 기록은 도구 확장 어휘로 보존합니다. SWRL 구조화 변환은 실행·일관성 증명을 뜻하지 않습니다.'};
 window.WorkshopReview.lastExportReport=report;
 const reportNode=add('urn:worflogy:export-report',{'@type':'ont:ExportReport','ont:warning':report.warnings,'rdfs:comment':report.note});
 reportNode['ont:structuredRuleCount']=report.structuredRules;
 return base;
}
document.addEventListener('DOMContentLoaded',()=>{
 const original=toJsonLD;
 window.toJsonLD=function(){S.combined=buildCombined();return enrich(original());};
 const exp=exportJsonLD;
 window.exportJsonLD=async function(){
  toJsonLD();const report=WorkshopReview.lastExportReport;
  document.getElementById('wf-export-report')?.remove();
  const host=document.createElement('div');host.id='wf-export-report';host.className='al al-i';
  host.innerHTML='<strong>내보내기 의미 보존 검사</strong><p>구조화 SWRL 규칙 '+report.structuredRules+'개. '+esc(report.note)+'</p>'+(report.warnings.length?'<ul>'+report.warnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'<p>지원 범위 내 변환 경고가 없습니다.</p>');
  const btn=document.querySelector('[data-action="exportJsonLD"],[onclick*="exportJsonLD"]');(btn?.parentElement||document.body).append(host);
  return exp.apply(this,arguments);
 };
 WorkshopReview.ruleAtoms=ruleAtoms;
});
})();
