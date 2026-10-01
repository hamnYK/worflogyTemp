// Design demonstration only. No model requests: paragraphs combine source snapshots and authored examples.
const writingOriginLabels={network:'네트워크에서 구성',creative:'창작으로 확장',verify:'추가 확인 필요'};
const writingPerspectiveLabels={balanced:'상반된 의견 함께 읽기',support:'지지 의견 중심',dissent:'지지하지 않는 의견 중심'};
function composeWritingDraft(snapshot,genre,perspective){
 const paragraphs=[];
 const nodeSources=snapshot.nodes.map(node=>({key:'node-'+node.id,title:'노드 '+node.id+' · '+node.author+'의 의견',text:node.text+'\n출처: 디자인용 예시 그래픽. 외부 검증 자료 아님.'}));
 paragraphs.push({origin:'network',text:'이 글은 노드 A의 “'+snapshot.nodes[0].text+'”라는 질문과 노드 B의 “'+snapshot.nodes[1].text+'”라는 관점에서 출발한다.',sources:nodeSources});
 if(genre==='fiction'){
  paragraphs.push({origin:'creative',text:'마지막 야간 근무가 끝나던 날, 윤은 자신의 책상 위에 두 장의 카드를 놓았다. 하나에는 사라지는 일이, 다른 하나에는 아직 이름 붙이지 못한 일이 적혀 있었다. 두 카드 사이에는 손가락 하나가 들어갈 만큼의 빈틈이 있었다.',sources:nodeSources,note:'윤이라는 인물, 야간 근무, 카드 장면은 준비된 창작 예시입니다. 실제 노드의 사건이나 사용자의 경험이 아닙니다.'});
 }
 snapshot.proposals.forEach(proposal=>{
  const definitionSource={key:'relation-'+proposal.id,title:'링크 AB · '+proposal.name+' · '+proposal.author+'의 정의',text:proposal.definition};
  paragraphs.push({origin:'network',text:proposal.author+'님은 두 노드의 관계를 ‘'+proposal.name+'’으로 해석했다. 그 정의는 “'+proposal.definition+'”이다.',sources:[definitionSource]});
  const comments=proposal.comments.map((comment,index)=>({...comment,index})).filter(comment=>perspective==='balanced'||(perspective==='support'?comment.stance==='support':comment.stance==='not-support'));
  if(comments.length){
   const sources=comments.map(comment=>({key:'relation-'+proposal.id,title:'링크 AB · '+proposal.name+' · '+comment.author+' · '+stanceLabels[comment.stance],text:comment.text}));
   paragraphs.push({origin:'network',text:comments.map(comment=>comment.author+'님은 이 해석을 '+({support:'지지하며','not-support':'지지하지 않으며',undecided:'판단 유보하며'}[comment.stance])+' “'+comment.text+'”라고 의견을 남겼다.').join('\n\n'),sources});
  }else{
   paragraphs.push({origin:'network',text:proposal.comments.length?'이 관계 해석에는 현재 선택한 입장에 해당하는 의견이 없다. 이는 해당 입장이 틀렸다는 뜻은 아니다.':'이 관계 해석에는 아직 의견이 없다. 현재 자료만으로는 지지 여부를 알 수 없다.',sources:[{...definitionSource,text:proposalSummary(proposal)+'\n'+proposal.definition}]});
  }
 });
 paragraphs.push(genre==='fiction'?{origin:'creative',text:'윤은 두 카드 사이에 선을 하나 그었다가 지웠다. 선을 지운 자리에 다른 사람의 목소리가 들어왔다. 아직 이름 없는 내일은, 그 목소리들이 머무를 만큼 넓어야 했다.',sources:[],note:'이 결말과 서술은 창작 예시입니다. 네트워크 참여자의 합의나 실제 발언을 나타내지 않습니다.'}:{origin:'verify',text:'이 자료는 참여자들이 제안한 관계와 의견을 보여준다. 자동화가 실제로 어떤 역할 변화를 일으켰는지 판단하려면 사례의 원출처, 변화의 시점, 다른 요인을 확인해야 한다. 의견의 지지 수만으로 인과관계를 확정할 수는 없다.',sources:[],note:'별도 자료 검증이 필요한 검토 문장입니다. 외부 출처 조회나 사실 확인은 수행하지 않았습니다.'});
 return {genre,perspective,title:genre==='fiction'?'두 카드 사이의 내일':'자동화와 새로운 역할, 그 사이의 해석',snapshot,paragraphs};
}
let writingSelectedIds=new Set([1,2]);
let writingDraft=null;
function writingNodeSnapshot(){
 return [
 {id:'A',author:'서연',text:$('.node-a .mini-copy p').textContent},
 {id:'B',author:'지우',text:$('.node-b .mini-copy p').textContent}
 ];
}
function writingSnapshot(){
 return JSON.parse(JSON.stringify({nodes:writingNodeSnapshot(),proposals:linkAB.proposals.filter(proposal=>writingSelectedIds.has(proposal.id))}));
}
function markWritingChanged(){
 $('#writing-status').textContent=writingSelectedIds.size?'설정 또는 재료가 바뀌었습니다. 초안을 다시 구성하면 반영됩니다.':'관계 해석을 하나 이상 선택해 주세요. 기존 초안은 그대로 유지됩니다.';
 $('#build-draft').disabled=!writingSelectedIds.size;
}
function renderWritingSources(){
 const list=$('#writing-proposals');list.replaceChildren();
 linkAB.proposals.forEach(proposal=>{
  const label=makeText('label','writing-proposal','');label.dataset.source='relation-'+proposal.id;
  const input=document.createElement('input');input.type='checkbox';input.checked=writingSelectedIds.has(proposal.id);input.value=String(proposal.id);
  const content=makeText('span','','');
  content.append(makeText('strong','',proposal.name),makeText('small','writing-definition',proposal.definition),makeText('small','',proposalSummary(proposal)));
  label.append(input,content);list.append(label);
  input.addEventListener('change',()=>{input.checked?writingSelectedIds.add(proposal.id):writingSelectedIds.delete(proposal.id);markWritingChanged();});
 });
}
function inspectWritingParagraph(index){
 const paragraph=writingDraft.paragraphs[index];
 document.querySelectorAll('.draft-paragraph').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 const keys=new Set(paragraph.sources.map(source=>source.key));
 document.querySelectorAll('.writing-materials [data-source]').forEach(element=>element.classList.toggle('source-highlight',keys.has(element.dataset.source)));
 $('#evidence-title').textContent=String(index+1).padStart(2,'0')+'번 문단 · '+writingOriginLabels[paragraph.origin];
 const list=$('#paragraph-evidence');list.replaceChildren();
 paragraph.sources.forEach(source=>{
  const card=makeText('article','evidence-item','');
  card.append(makeText('strong','',source.title),makeText('p','',source.text));list.append(card);
 });
 if(paragraph.note){
  const card=makeText('article','evidence-item','');card.append(makeText('strong','',writingOriginLabels[paragraph.origin]),makeText('p','',paragraph.note));list.append(card);
 }
}
function renderWritingDraft(){
 const draft=writingDraft;
 $('.draft-paper').dataset.genre=draft.genre;
 $('#draft-genre').textContent=draft.genre==='fiction'?'LITERATURE / 문학 예시':'NONFICTION / 비문학 예시';
 $('#draft-title').textContent=draft.title;
 $('#draft-scope').textContent='노드 A·B · 관계 해석 '+draft.snapshot.proposals.length+'개 · '+writingPerspectiveLabels[draft.perspective]+' · 문단을 눌러 근거 확인';
 const list=$('#draft-paragraphs');list.replaceChildren();
 draft.paragraphs.forEach((paragraph,index)=>{
  const button=makeText('button','draft-paragraph','');button.type='button';button.setAttribute('aria-pressed','false');
  const meta=makeText('span','paragraph-meta','');
  meta.append(makeText('span','paragraph-number',String(index+1).padStart(2,'0')),makeText('span','origin-badge '+paragraph.origin+'-origin',writingOriginLabels[paragraph.origin]));
  button.append(meta,makeText('p','',paragraph.text),makeText('span','paragraph-source-count',paragraph.sources.length?'근거 '+paragraph.sources.length+'개 ↗':'확장 내용 확인 ↗'));
  button.addEventListener('click',()=>inspectWritingParagraph(index));list.append(button);
 });
 inspectWritingParagraph(0);
}
function buildWritingDraft(){
 if(!writingSelectedIds.size)return;
 const genre=document.querySelector('input[name="writing-genre"]:checked').value;
 writingDraft=composeWritingDraft(writingSnapshot(),genre,$('#writing-perspective').value);
 renderWritingDraft();$('#writing-status').textContent='현재 선택한 재료로 예시 초안을 구성했습니다. 실제 AI 생성 결과가 아닙니다.';
}
$('#build-draft').addEventListener('click',buildWritingDraft);
document.querySelectorAll('input[name="writing-genre"]').forEach(input=>input.addEventListener('change',markWritingChanged));
$('#writing-perspective').addEventListener('change',markWritingChanged);
let writingNetworkFingerprint=JSON.stringify(linkAB.proposals);
document.addEventListener('contexton:relations-changed',()=>{
 const next=JSON.stringify(linkAB.proposals);
 if(next===writingNetworkFingerprint)return;
 writingNetworkFingerprint=next;renderWritingSources();markWritingChanged();
 // The current draft and evidence remain a snapshot until the next build.
 document.querySelectorAll('.draft-paragraph').forEach((button,index)=>{if(button.getAttribute('aria-pressed')==='true')inspectWritingParagraph(index)});
});
function writingExportText(draft){
 const header=['contexton · 예시 초안',draft.title,writingPerspectiveLabels[draft.perspective],'디자인 시연: 선택한 네트워크와 준비된 문장의 조합. 실제 AI 생성 또는 외부 사실 검증을 수행하지 않음.'];
 const body=draft.paragraphs.map((paragraph,index)=>[
  (index+1)+'. ['+writingOriginLabels[paragraph.origin]+']',paragraph.text,
  ...paragraph.sources.map(source=>'근거: '+source.title+'\n'+source.text),
  ...(paragraph.note?['검토: '+paragraph.note]:[])
 ].join('\n\n'));
 return header.join('\n')+'\n\n'+body.join('\n\n———\n\n');
}
$('#download-draft').addEventListener('click',()=>{
 if(!writingDraft)return;
 const url=URL.createObjectURL(new Blob([writingExportText(writingDraft)],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='contexton-'+writingDraft.genre+'-draft.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 toast('초안과 문단별 근거를 함께 내려받습니다.');
});
renderWritingSources();buildWritingDraft();

