import { MISSIONS } from './operation.js';
import { ROLES } from './rules.js';
import { portrait, actionIcon } from './ui-art.js';
import { symbol, apPips } from './symbols.js';

const table=(rows)=>`<div class="ds-art-table"><table><thead><tr><th>항목</th><th>구현 및 사용 규칙</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></div>`;
export const implementedGuide=`
<section id="implemented"><div class="ds-heading"><span>06 / IMPLEMENTED COMPONENTS</span><h2>실제 게임에서 추출한 구성 요소.</h2><p>준비 화면과 전투 HUD의 원본 CSS, 진영 데이터, 일러스트 초상·SVG 아이콘을 사용합니다. 예시 조작은 게임의 저장 데이터에 영향을 주지 않습니다.</p></div>
<div class="ds-paper prep-shell"><h3>진영 선택 / 동등한 정보 구조</h3><div class="faction-grid">${Object.entries(MISSIONS).map(([id,m])=>`<button class="faction-choice ${id}" data-faction-demo="${m.name}" aria-pressed="false"><div class="faction-art art-${id}" role="img" aria-label="${m.name} 작전 삽화"></div><div class="faction-copy"><span class="eyebrow">${m.english}</span><h2>${m.name}</h2><strong>${m.motto}</strong><p>${m.lore}</p><span class="faction-cta">${m.subtitle}<b>작전 확인</b></span></div></button>`).join('')}</div><p class="ds-demo-status" id="faction-demo-status" role="status">두 진영 모두 같은 크기·문구 위계·버튼 강도를 사용합니다.</p>
<h3>요원 편성 / 상세 확인과 투입 상태 분리</h3><div class="ds-roster-examples">${[0,2,4].map((i,j)=>`<div class="prep-agent ${j===0?'focused enlisted':j===1?'enlisted':''}"><button class="agent-inspect" data-inspect-demo aria-pressed="${j===0}">${portrait(i)}<span><small>LV.1 / ${ROLES[i].name}</small><b>${ROLES[i].code}</b><em>${ROLES[i].skillName}</em></span></button><button class="enlist" data-enlist-demo aria-pressed="${j<2}" aria-label="${ROLES[i].name} 투입 전환">${j<2?symbol('check')+'투입':symbol('plus')+'대기'}</button></div>`).join('')}</div><p class="ds-demo-status" id="roster-demo-status" role="status">외곽선은 상세 확인 중인 요원, 채운 배경과 투입 표기는 출전 상태입니다.</p>
<label class="gear-label" for="ds-gear">장비 선택 / 잠금은 텍스트로 표시</label><select id="ds-gear"><option>표준 소총 — 기본 장비</option>정밀 소총 — 피해 감소 · 명중 증가</option><option disabled>기억 각인 소총 (잠김) — 요구 Lv.2</option></select><p class="ds-demo-status" id="gear-demo-status" role="status">선택 가능한 장비만 적용할 수 있습니다.</p></div>
<div class="ds-game-preview ds-hud-samples"><h3>전투 HUD / 선택·비활성·자원</h3><p class="ds-note">유닛 카드와 상태 아이콘은 <a href="#tactical">05 공통 게임 컴포넌트</a>에서 실제 렌더러로 확인합니다.</p><div class="ds-button-row">${[['move','이동','1 AP'],['shoot','사격','1 AP'],['skill','정밀 관통','2턴 대기']].map(([id,label,cost],i)=>`<button class="action ${i===0?'active':''}" data-action-demo aria-pressed="${i===0}" ${i===2?'disabled':''}><span class="action-key">0${i+1}</span>${actionIcon(id,3)}<strong>${label}</strong><small>${cost}</small></button>`).join('')}</div><p id="action-demo-status" class="ds-demo-status" role="status">행동을 선택하면 테두리·배경·선택 상태가 함께 바뀝니다.</p></div>
<h3>심볼 / 단색 24 × 24 SVG</h3><div class="ds-symbol-grid">${[['check','완료'],['plus','편성 추가'],['target','표적'],['memory','메모리'],['reset','초기화'],['info','정보'],['warning','주의']].map(([id,label])=>`<div>${symbol(id)}<span>${label}</span><code>${id}</code></div>`).join('')}</div><p class="ds-note">이모지는 사용하지 않습니다. 아이콘만 있는 버튼에는 접근 가능한 이름을 제공합니다. 장식용 화살표 대신 행동을 설명하는 문구를 사용합니다.</p></section>
<section id="screen-rules"><div class="ds-heading"><span>07 / SCREEN & STATE</span><h2>화면이 바뀌어도 유지되는 규칙.</h2><p>프롤로그 · 진영 선택 · 브리핑과 편성 · 전투 · 결과와 저장의 흐름을 따릅니다.</p></div>${table([
['프롤로그','삽화와 읽을거리 1.1 : 1. 이미지 전체를 contain으로 표시하고 하단 캡션을 분리합니다. 이전·다음·건너뛰기·현재 쪽수를 제공합니다. 이미지 오류에도 본문과 재시도 버튼을 유지합니다.'],
['진영 선택','최대 폭 1440px, 기본 좌우 여백 52px, 2열 카드 사이 28px. 원본 파노라마의 좌·우를 각 진영에 배정합니다. 양 진영의 정보량과 진행 행동을 같은 위계로 표시합니다.'],
['브리핑·편성','성공·실패 조건과 전술 힌트를 먼저 읽고 7명 중 4명을 편성합니다. 상세 확인과 투입 선택을 구분하고, 장비 요구 레벨과 수치 변화를 표시합니다. 준비가 안 되면 출전 버튼에 사유를 연결합니다.'],
['전투 레이아웃','상단 66px / 좌측 234px / 중앙 가변 / 우측 218px / 행동 바 116px / 저작권 28px. 1300px 이하에서 좌우 패널 216px·196px. 상세 내용은 패널 안에서 스크롤합니다.'],
['화면 대응','Windows Chrome·Edge, 최소 검증 화면 1280×720. 준비 화면은 1100px에서 여백 축소, 760px에서 한 열. 전투의 모바일 지원을 의미하지 않습니다. 낮은 화면에서는 내용을 숨기지 않고 스크롤합니다.'],
['상태와 입력','기본 · 호버 · 키보드 포커스 · 선택 · 비활성 상태를 구별합니다. 선택은 aria-pressed, 잠금은 disabled와 사유, 알림은 role=status, 로그는 aria-live를 사용합니다.'],
['결과·저장','성공/실패 제목, 결과 설명, 분대 재편성 행동. 브라우저 자동 저장과 파일 저장/불러오기를 구분합니다. 실패는 원인과 복구 행동을 함께 제공합니다.'],
['움직임','기본 전환 140ms, 진영 카드 160ms·호버 상승 4px. reduced-motion에서는 UI 애니메이션·전환·호버 이동을 제거합니다. 3D 물리 시뮬레이션은 별도입니다.'],
['권리 표기','게임 모든 화면 하단에 28px 공간을 확보합니다. © 2025 워플로지(WORFLOGY). All rights reserved. 조작 영역을 덮지 않습니다.']
])}</section>
<section id="delivery"><div class="ds-heading"><span>08 / DELIVERY STANDARD</span><h2>제작자가 확인할 완료 기준.</h2><p>현재 구현에서 추출한 규칙과 앞으로 교체할 아트를 구분합니다.</p></div>${table([
['가독성','핵심 설명 14px 이상, 긴 프롤로그 본문 15px, 작전 본문 14–15px. 플레이 판단에 필요한 보조 정보 12px 이상. 제목 24–46px. 1280×720에서 잘림과 가로 넘침을 확인합니다.'],
['대비와 접근','일반 활성 텍스트 대비 목표 4.5:1. 색뿐 아니라 문구·모양·수치를 병용합니다. 키보드 포커스를 숨기지 않고, 버튼 40px 이상 높이를 기본으로 사용합니다. 작은 편성 토글은 카드의 보조 컨트롤입니다.'],
['단일 원본','tokens.css: 의미 토큰 / preparation.css·prologue.css: 준비 화면 / game-hud.css: 전투 변형 / symbols.js·ui-art.js: SVG. 이 갤러리는 원본 스타일을 재사용합니다.'],
['아트 교체','승인된 v3 일러스트는 적용 완료. 14명 일러스트 초상과 병과별 3D 실루엣·셀 음영은 적용했습니다. 정교한 모델·환경·모션·효과는 추가 개선 대상입니다. 미리보기 예시를 최종 전투 아트로 오인하지 않도록 표시합니다.'],
['배포 검수','Chrome·Edge에서 프롤로그, 양쪽 진영, 4인 편성, 장비 선택, 전장 진입과 저장 동선을 확인합니다. 이미지 로드, Tab 포커스, 선택·잠금, 가독성, 저작권 영역을 함께 점검합니다.']
])}</section>`;

export function bindImplementedGuide(){
 document.querySelectorAll('[data-faction-demo]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-faction-demo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  document.querySelector('#faction-demo-status').textContent=b.dataset.factionDemo+' 작전 선택 — 미리보기';
 });
 document.querySelectorAll('[data-inspect-demo]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-inspect-demo]').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.closest('.prep-agent').classList.toggle('focused',x===b);});
  document.querySelector('#roster-demo-status').textContent=b.querySelector('b').textContent+' 상세 확인 중';
 });
 document.querySelectorAll('[data-enlist-demo]').forEach(b=>b.onclick=()=>{
  const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.closest('.prep-agent').classList.toggle('enlisted',on);b.innerHTML=symbol(on?'check':'plus')+(on?'투입':'대기');
  document.querySelector('#roster-demo-status').textContent='편성 예시: '+document.querySelectorAll('[data-enlist-demo][aria-pressed="true"]').length+'명 투입';
 });
 document.querySelector('#ds-gear').onchange=e=>document.querySelector('#gear-demo-status').textContent='장비 예시: '+e.target.value;
 document.querySelectorAll('[data-action-demo]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-action-demo]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
  document.querySelector('#action-demo-status').textContent=b.querySelector('strong').textContent+' 선택됨 — 미리보기';
 });
}
