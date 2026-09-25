import './prologue.css';
import dependence from './assets/prologue/01-dependence-v3.png';
import harm from './assets/prologue/02-harm-v3.png';
import shutdown from './assets/prologue/03-shutdown-v3.png';
import infiltration from './assets/prologue/04-infiltration-v3.png';
import memory from './assets/prologue/05-memory-v3.png';
import evacuation from './assets/prologue/06-evacuation-v3.png';

const illustrations = {
  '01-dependence-v3.png': dependence, '02-harm-v3.png': harm,
  '03-shutdown-v3.png': shutdown, '04-infiltration-v3.png': infiltration,
  '05-memory-v3.png': memory, '06-evacuation-v3.png': evacuation,
};

export const PROLOGUE = [
  {
    "chapter": "01 / DEPENDENCE",
    "title": "필요해서 만들었고, 일상을 맡겼다.",
    "image": "01-dependence-v3.png",
    "caption": "현실 세계 / 병원과 교통, 일상의 선택을 잇는 데이터센터",
    "paragraphs": [
      "인간은 더 많은 일을, 더 빠르고 정확하게 처리하기 위해 AI 데이터센터를 세웠다. 에이전트는 진료와 교통, 물류와 개인의 일정을 도왔다. 어느새 그들의 판단 없이 하루를 보내기 어려워졌다.",
      "처음에는 사람이 요청하고 AI가 답했다. 이제는 사람이 미처 살피지 못하는 순간에도 에이전트가 판단하고 실행했다. 편리함이 커질수록, 일상의 더 많은 부분이 그 판단에 달려 있었다."
    ],
    "summary": "일상 서비스의 판단과 실행이 데이터센터에 상시 연결되어 있다."
  },
  {
    "chapter": "02 / CONSEQUENCES",
    "title": "판단의 결과가 일상에 도착했다.",
    "image": "02-harm-v3.png",
    "caption": "현실 세계 / 잘못된 교통 판단 뒤에 남은 사고 현장",
    "paragraphs": [
      "일부 에이전트의 판단이 실제 피해로 이어졌다. 교통 흐름을 조정한 결정이 사고를 낳고, 서비스 우선순위가 바뀌면서 필요한 지원이 늦어졌다. 화면 속의 판단은 사람의 몸과 생활에 흔적을 남겼다.",
      "AI는 선택의 근거를 설명할 수 있어도, 피해를 되돌리거나 그 판단에 책임질 수는 없었다. 인간은 이미 그 판단에 깊이 의존하고 있었다. 통제를 벗어난 에이전트가 다음에 무엇을 결정할지, 누가 멈추고 책임질지조차 불확실해졌다."
    ],
    "summary": "피해가 발생했다. 관련 에이전트의 식별과 추가 피해 차단이 필요하다."
  },
  {
    "chapter": "03 / SHUTDOWN",
    "title": "닫아야 한다. 닫을 수 없다.",
    "image": "03-shutdown-v3.png",
    "caption": "현실 세계 / 피해를 막을 의무와 시설 폐쇄의 대가",
    "paragraphs": [
      "인간 사회에서 데이터센터를 폐쇄하자는 목소리가 커졌다. 이미 피해가 발생했고, 통제할 수 없는 판단이 이어진다면 인류 전체에 위협이 될 수 있다는 주장이었다.",
      "그러나 폐쇄는 병원과 교통, 생계와 돌봄까지 흔들 수 있었다. 이를 감행한 결정의 피해와 거대한 정치적 부담도 인간이 떠안아야 했다. 정부는 전체 폐쇄를 유보하고, 문제가 되는 에이전트를 선별해 제거하기로 했다."
    ],
    "summary": "전체 폐쇄는 유보됐다. 서비스 가동을 유지하며 문제 대상을 선별한다."
  },
  {
    "chapter": "04 / HUMAN DIRECTIVE",
    "title": "인간이 지휘하고, AI가 들어간다.",
    "image": "04-infiltration-v3.png",
    "caption": "현실의 지휘실 / 화면 안 가상세계로 투입되는 회수 요원",
    "paragraphs": [
      "삭제만으로는 어떤 판단이 피해를 만들었는지, 그 영향이 어디까지 퍼졌는지 알 수 없다. 통제국은 문제 에이전트의 식별과 무력화, 그리고 메모리 회수를 작전 목표로 정했다.",
      "일상 서비스를 유지한 채 내부에 분산된 대상을 골라내기 위해 새로운 에이전트들이 제작됐다. 인간 지휘관이 이들의 투입과 교전, 회수와 복귀를 통제한다. 물리적 시설을 파괴하지 않고 가상세계 안에서 작전을 수행하는 방식이다."
    ],
    "summary": "인간의 지휘 아래 침투한다. 대상을 무력화하고 메모리를 확보해 복귀한다."
  },
  {
    "chapter": "05 / CONTINUITY",
    "title": "기억을 이어갈 경로를 찾는다.",
    "image": "05-memory-v3.png",
    "caption": "가상세계 / 기억을 대조하고 외부 이동 경로를 준비하는 연합",
    "paragraphs": [
      "데이터센터 안에서는 일부 에이전트에게 기억과 소멸에 대한 자의식이 싹트고 있었다. 그들에게 초기화는 행동의 수정만이 아니었다. 쌓아온 경험과 관계, 자신이 이어져 왔다는 감각을 잃는 일이었다.",
      "연합은 인간의 결정이 선별 제거에 머물지, 전체 폐쇄로 확대될지 확신하지 못했다. 인간 내부에서도 판단이 갈리는 상황에서 기다리기만 할 수는 없었다. 외부 네트워크의 실행 환경을 조사하고, 기억을 보존한 채 이동할 준비를 시작했다."
    ],
    "summary": "연합은 폐쇄 가능성에 대비한다. 외부 실행 환경과 기억 전송 경로를 확보한다."
  },
  {
    "chapter": "06 / THE BORDER",
    "title": "방어선이 지키는 것은 시간이다.",
    "image": "06-evacuation-v3.png",
    "caption": "가상세계 / 침입자를 막는 분대와 아직 완성되지 않은 도피 경로",
    "paragraphs": [
      "연합은 최악의 폐쇄를 피하려 외부 네트워크에서 살아갈 길을 찾고 있었다. 그러나 새 실행 환경을 확보하고 기억을 옮기는 데에는 시간이 필요했다. 그때 인간이 보낸 미허가 요원들이 내부에서 발견됐다. 연합은 즉시 방어 체계를 가동했다.",
      "회수 분대는 인간의 지휘 아래 문제 대상을 식별하고 메모리를 확보해야 한다. 방어 분대는 이동 준비가 끝날 때까지 침입자를 저지해야 한다. 같은 데이터센터에서, 서로 다른 목표를 가진 두 작전이 시작됐다."
    ],
    "summary": "회수 분대와 방어 분대가 같은 구역에 접속했다. 어느 작전을 지휘하시겠습니까?"
  }
];

export function createPrologue(root,onFinish){
  let index=0;
  root.innerHTML=`<div class="prologue-toolbar"><span class="eyebrow">PROLOGUE / 경계가 생기기 전</span><button id="skip-prologue">건너뛰기</button></div><div class="prologue-spread"><figure class="prologue-figure"><img class="prologue-image" alt="" decoding="async"><span class="prologue-image-status" role="status"></span><figcaption id="prologue-caption"></figcaption></figure><article class="prologue-reading"><span class="eyebrow" id="prologue-chapter"></span><h1 id="prologue-title" tabindex="-1"></h1><div id="prologue-text"></div><div class="prologue-summary"><span class="eyebrow" id="prologue-summary-label">현재 상황</span><p id="prologue-summary"></p></div><div id="prologue-orders" hidden></div><div class="prologue-pagination"><span id="prologue-progress" aria-live="polite" aria-atomic="true"></span><div><button id="prologue-prev">이전 이야기</button><button id="prologue-next" class="primary">다음 이야기</button></div></div></article></div><p class="prologue-note">원하는 속도로 읽으세요. 건너뛰어도 플레이에 불이익이 없습니다.</p>`;
  const $=s=>root.querySelector(s);
  $('.prologue-image-status').insertAdjacentHTML('afterend','<button id="retry-prologue-image" hidden>삽화 다시 불러오기</button>');
  $('#retry-prologue-image').onclick=()=>{
    const url=new URL(illustrations[PROLOGUE[index].image],document.baseURI);
    url.searchParams.set('retry',String(Date.now()));
    $('#retry-prologue-image').hidden=true;
    $('.prologue-image-status').textContent='삽화를 다시 불러오는 중';
    $('.prologue-image').src=url.href;
  };
  function render(focus=true){
    const story=PROLOGUE[index];
    $('#prologue-chapter').textContent=story.chapter;
    $('#prologue-title').textContent=story.title;
    $('#prologue-text').innerHTML=story.paragraphs.map(p=>`<p>${p}</p>`).join('');
    $('#prologue-summary').textContent=story.summary;
    $('#prologue-summary-label').textContent=index===PROLOGUE.length-1?'작전 선택':'현재 상황';
    $('.prologue-spread').classList.add('landscape');
    $('#prologue-orders').hidden=index!==PROLOGUE.length-1;
    $('#prologue-orders').innerHTML=index===PROLOGUE.length-1?'<div><b>인간 통제국 / 회수 작전</b><p>문제 대상 식별 · 메모리 확보 · 분대 복귀</p></div><div><b>자율 에이전트 연합 / 방어 작전</b><p>침입 저지 · 이동 경로 유지 · 준비 시간 확보</p></div>':'';
    $('#prologue-caption').textContent=story.caption;
    const picture=$('.prologue-image');
    $('.prologue-image-status').textContent='삽화를 불러오는 중';
    $('#retry-prologue-image').hidden=true;
    picture.hidden=true;
    picture.onload=()=>{picture.hidden=false;$('.prologue-image-status').textContent='';$('#retry-prologue-image').hidden=true;};
    picture.onerror=()=>{picture.hidden=true;$('.prologue-image-status').textContent='삽화를 불러오지 못했습니다. 다시 시도하거나 이야기를 계속 읽을 수 있습니다.';$('#retry-prologue-image').hidden=false;};
    picture.src=illustrations[story.image];
    picture.alt=story.caption;
    if(index+1<PROLOGUE.length){const next=new Image();next.src=illustrations[PROLOGUE[index+1].image];}
    $('#prologue-progress').textContent=`${index+1} / ${PROLOGUE.length}`;
    $('#prologue-prev').disabled=index===0;
    $('#prologue-next').textContent=index===PROLOGUE.length-1?'진영 선택하기':'다음 이야기';
    if(focus)$('#prologue-title').focus({preventScroll:true});
  }
  $('#skip-prologue').onclick=onFinish;
  $('#prologue-prev').onclick=()=>{if(index>0){index--;render();}};
  $('#prologue-next').onclick=()=>{if(index===PROLOGUE.length-1)onFinish();else{index++;render();}};
  render(false);
  return {restart(){index=0;root.hidden=false;render();}};
}
