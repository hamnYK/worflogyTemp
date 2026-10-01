// A link contains independent proposals; every opinion belongs to one proposal.
const linkAB = {
 id:'AB', source:'A', target:'B',
 proposals:[
 {id:1,name:'원인',type:'logic',definition:'A의 자동화가 B의 새로운 역할 형성을 일으킨다는 해석입니다.',author:'서연',comments:[
 {author:'지우',stance:'support',text:'반복 업무가 줄어들면 새로운 역할을 맡을 여지가 생긴다는 점에서 이 해석을 지지합니다.'},
 {author:'민준',stance:'not-support',text:'역할의 변화에는 교육과 조직의 결정도 작용합니다. 자동화만을 원인으로 보기 어렵습니다.'},
 {author:'하린',stance:'undecided',text:'실제 변화 사례를 더 살펴본 뒤 판단하고 싶습니다.'}]},
 {id:2,name:'전제',type:'logic',definition:'A의 자동화가 B의 새로운 역할을 가능하게 하는 전제라는 해석입니다.',author:'지우',comments:[
 {author:'서연',stance:'support',text:'시간과 자원이 확보되어야 새로운 역할을 시도할 수 있다는 점에서 전제에 가깝다고 봅니다.'}]},
 {id:3,name:'지지',type:'perspective',definition:'A에 제시된 관점이 B에서 제안하는 역할 전환을 지지한다는 해석입니다.',author:'민준',comments:[]}
]};
let selectedProposalId = 1;
const stanceLabels = {support:'지지함','not-support':'지지하지 않음',undecided:'판단 유보'};
function proposalCounts(proposal){
 return proposal.comments.reduce((counts,comment)=>{counts[comment.stance]++;return counts;},{support:0,'not-support':0,undecided:0});
}
function proposalSummary(proposal){
 const count=proposalCounts(proposal);
 return '지지함 '+count.support+' · 지지하지 않음 '+count['not-support']+' · 판단 유보 '+count.undecided;
}
function currentProposal(){return linkAB.proposals.find(proposal=>proposal.id===selectedProposalId);}
function addProposalOpinion(proposal,author,stance,text){
 const trimmed=text.trim();
 if(!Object.hasOwn(stanceLabels,stance)||!trimmed||text.length>200)return false;
 proposal.comments.push({author,stance,text:trimmed});return true;
}
function makeText(tag,className,text){
 const element=document.createElement(tag);element.className=className;element.textContent=text;return element;
}
function renderProposals(){
 $("#canvas-relation-count").textContent="관계 "+linkAB.proposals.length+"개";
 $('#link-count').textContent=linkAB.proposals.length+'개 관계 해석 · '+linkAB.proposals.reduce((sum,p)=>sum+p.comments.length,0)+'개 의견';
 const list=$('#proposal-list');list.replaceChildren();
 linkAB.proposals.forEach(proposal=>{
  const button=makeText('button','proposal-card'+(proposal.id===selectedProposalId?' active':''),'');
  button.type='button';button.dataset.proposalId=String(proposal.id);
  button.setAttribute('aria-pressed',String(proposal.id===selectedProposalId));
  button.append(makeText('span','pill'+(proposal.type==='perspective'?' political':''),proposal.type==='logic'?'논리적 관계':'정치적·입장 관계'),makeText('strong','', 'A → B · '+proposal.name),makeText('span','proposal-excerpt',proposal.definition),makeText('span','proposal-counts',proposalSummary(proposal)));
  button.addEventListener('click',()=>{selectedProposalId=proposal.id;resetOpinionForm();renderProposals();});
  list.append(button);
 });
 const proposal=currentProposal(),political=proposal.type==='perspective';
 $('#relation-detail').classList.toggle('is-political',political);
 $('#relation-family').classList.toggle('political',political);
 $('#relation-family').textContent=political?'정치적·입장 관계':'논리적 관계';
 $('#relation-sentence').textContent='A → B · '+proposal.name;
 $('#relation-definition').textContent=proposal.definition;
 $('#proposal-author').textContent=proposal.author+'님이 제안한 관계 해석';
 $('#opinion-summary').textContent=proposalSummary(proposal);
 const comments=$('#relation-comments');comments.replaceChildren();
 if(!proposal.comments.length)comments.append(makeText('p','empty-discussion','아직 의견이 없습니다. 지지 여부는 아직 알 수 없습니다.'));
 proposal.comments.forEach(comment=>{
  const article=makeText('article','discussion-comment','');
  article.append(makeText('span','comment-meta',comment.author+' · '+stanceLabels[comment.stance]),makeText('p','',comment.text));comments.append(article);
 });
 document.dispatchEvent(new CustomEvent('contexton:relations-changed'));
}
function updateOpinionForm(){
 const text=$('#relation-comment').value;
 $('#relation-comment-count').textContent=text.length+' / 200';
 $('#submit-relation-comment').disabled=!text.trim()||text.length>200||!document.querySelector('input[name="stance"]:checked');
}
function resetOpinionForm(){
 $('#relation-comment-form').reset();updateOpinionForm();
 $('#relation-status').textContent='예시 참여자 ‘나’로 추가됩니다. 새로고침하면 초기화됩니다.';
}
$('#relation-comment-form').addEventListener('input',updateOpinionForm);
$('#relation-comment-form').addEventListener('change',updateOpinionForm);
$('#relation-comment-form').addEventListener('submit',event=>{
 event.preventDefault();
 const stance=document.querySelector('input[name="stance"]:checked');
 if(!stance||!addProposalOpinion(currentProposal(),'나',stance.value,$('#relation-comment').value))return;
 resetOpinionForm();renderProposals();
 $('#relation-status').textContent='선택한 관계 해석에 의견을 추가했습니다.';
 toast('의견과 입장이 해당 관계 해석에 반영되었습니다.');
});
$('#new-proposal').addEventListener('submit',event=>{
 event.preventDefault();
 const name=$('#proposal-name').value.trim(),definition=$('#proposal-definition').value.trim(),type=$('#proposal-type').value;
 if(!name||name.length>24||!definition||definition.length>200||!['logic','perspective'].includes(type))return;
 const proposal={id:Math.max(...linkAB.proposals.map(p=>p.id))+1,name,type,definition,author:'나',comments:[]};
 linkAB.proposals.push(proposal);selectedProposalId=proposal.id;
 $('#new-proposal').reset();resetOpinionForm();renderProposals();
 $('#relation-sentence').setAttribute('tabindex','-1');$('#relation-sentence').focus();
 toast('링크 AB에 새 관계 해석을 추가했습니다.');
});
renderProposals();



