import {batteryCapacity} from './supplies.js';
import { skillInfo } from './skill-info.js';
import { createPrologue } from './prologue.js';
import { symbol, apPips } from './symbols.js';
import { canEquip, movementRange, MISSIONS, WEAPONS, MODULES, makeAgents, levelOf, loadoutStats } from './operation.js';
import { ROLES } from './rules.js';
import { portrait, actionIcon } from './ui-art.js';
import './preparation.css';

// Original generated panoramic artwork; each faction frames its own side.
function city(faction){return '<div class="faction-art art-'+faction+'" role="img" aria-label="'+(faction==='human'?'기록보관소에 침투하는 통제국 요원':'가상 도시를 방어하는 자율 에이전트')+'"></div>';}

export function createPreparation(root,{ready,onDeploy,onContinue}){
  let faction='human',selected=[0,2,4,5],focused=0,page='landing';
  const profiles={human:makeAgents(),ai:makeAgents()};
  root.innerHTML=`<div class="prep-shell"><div class="prep-top"><span class="prep-brand">N∕ <b>NULL SECTOR</b></span><span>PROTOTYPE 01 <i> / </i> ACT 01</span><button id="prep-back" hidden>진영 다시 선택</button></div><section id="prologue" aria-label="게임 배경 이야기"></section><section id="landing" hidden><div class="landing-title"><span class="eyebrow">A WAR INSIDE THE MACHINE</span><h1>두 개의 작전.<br><em>당신의 지휘를 기다립니다.</em></h1><p>인간의 지휘 아래 메모리를 회수하거나,<br>연합의 방어선을 지휘해 이동 시간을 확보하십시오.</p></div><div class="faction-grid">${Object.entries(MISSIONS).map(([id,m])=>`<button class="faction-choice ${id}" data-faction="${id}">${city(id)}<div class="faction-copy"><span class="eyebrow">${m.english}</span><h2>${m.name}</h2><strong>${m.motto}</strong><p>${m.lore}</p><span class="faction-cta">${m.subtitle} <b>작전 확인</b></span></div></button>`).join('')}</div><div class="landing-bottom"><p>로그인 없음 · 브라우저 자동 저장 + 파일 백업<br><small>진영별 시험 작전 1개 · 전체 액트는 추후 확장</small></p><div class="landing-tools"><button id="replay-prologue">배경 이야기 다시 읽기</button><button id="continue">저장된 작전 이어하기</button></div></div></section><section id="preparation" hidden><div class="brief-heading"><span class="eyebrow" id="mission-code"></span><h1 id="brief-title"></h1><p id="brief-copy"></p></div><div class="brief-grid"><article class="brief-objectives"><span class="eyebrow">01 / MISSION PARAMETERS</span><h2>작전 성공 조건</h2><ol id="brief-objectives"></ol><p id="failure"></p></article><article class="brief-hints"><span class="eyebrow">02 / TACTICAL INTELLIGENCE</span><h2>편성 전 확인할 정보</h2><div id="brief-hints"></div></article></div><div class="roster-heading"><div><span class="eyebrow">03 / SQUAD & LOADOUT</span><h2>투입할 요원을 선택하십시오 <b id="roster-count"></b></h2></div><button id="recommended">브리핑 추천 편성 적용</button></div><div class="assembly"><div><div id="roster"></div><p class="prep-fine">카드를 눌러 상세 확인 · 각 카드의 편성 버튼으로 투입/대기 변경<br>전원 기본 Lv.1 · 레벨은 HP를 늘리지 않습니다.</p></div><article id="agent-detail"></article></div><div class="prep-bottom"><div><strong id="prep-notice" role="status">4명의 요원을 편성하세요.</strong><small>커맨드당 1 AP · 장비 조건과 이동 제한을 확인하세요.</small></div><button id="deploy" class="primary">전장에 접속</button></div></section></div>`;
  const $=s=>root.querySelector(s);
  const prologue=createPrologue($('#prologue'),landing);
  $('#replay-prologue').onclick=()=>{$('#landing').hidden=true;$('#preparation').hidden=true;$('#prep-back').hidden=true;prologue.restart();root.scrollTop=0;};
  function refresh(){
    $('#roster-count').textContent=`${selected.length} / 4`;
    $('#deploy').disabled=selected.length!==4||!ready();
    $('#prep-notice').textContent=selected.length===4?'분대 편성 완료 · 전장 접속 대기':`요원 ${4-selected.length}명을 추가로 선택하십시오.`;
    $('#roster').innerHTML=ROLES.map((r,i)=>`<div class="prep-agent ${selected.includes(i)?'enlisted':''} ${focused===i?'focused':''}"><button class="agent-inspect" data-inspect="${i}" aria-pressed="${focused===i}">${portrait(i,faction)}<span><small>LV.${levelOf(profiles[faction][i])} / ${r.name}</small><b>${faction==='human'?r.code:r.ai}</b><em>${r.skillName}</em></span></button><button class="enlist" data-role="${i}" aria-pressed="${selected.includes(i)}" aria-label="${r.name} ${selected.includes(i)?'편성 해제':'편성'}">${selected.includes(i)?symbol('check')+'투입':symbol('plus')+'대기'}</button></div>`).join('');
    detail();
  }
  function detail(){
    const r=ROLES[focused],a=profiles[faction][focused],stats=loadoutStats(a),level=levelOf(a),guide=skillInfo(focused,a);
    $('#agent-detail').innerHTML=`<div class="detail-identity">${portrait(focused,faction)}<div><span class="eyebrow">AGENT DOSSIER / LV.${level}</span><h2>${faction==='human'?r.code:r.ai}</h2><p>${r.name} · HP ${r.hp} · AP 2</p></div></div><div class="skill-guide">${actionIcon('skill',focused)}<div><strong>${r.skillName}</strong><p class="skill-availability ${guide.ready?'ready':'locked'}">${guide.ready?'사용 조건 충족':'사용 불가 · 저격총 장착 필요'}</p><dl class="skill-facts"><dt>조건</dt><dd>${guide.condition}</dd><dt>이점</dt><dd>${guide.benefit}</dd><dt>제약</dt><dd>${guide.drawback}</dd><dt>행동 비용</dt><dd>1 AP · 재사용 대기 3턴</dd></dl></div></div><label class="gear-label" for="weapon">주무기 / 장착 조건과 이동 제한</label><select id="weapon">${WEAPONS.filter(w=>!w.roles||w.roles.includes(focused)).map(w=>`<option value="${w.id}" ${a.weapon===w.id?'selected':''} ${!canEquip(w,focused,level)?'disabled':''}>${w.name}${level<w.level?' (잠김)':''} — ${w.desc}</option>`).join('')}</select><label class="gear-label" for="module">전술 장비</label><select id="module">${MODULES.map(m=>`<option value="${m.id}" ${a.module===m.id?'selected':''}>${m.name} — ${m.desc}</option>`).join('')}</select><div class="loadout-stats"><span>이동 / 커맨드<b>${movementRange(a)}칸${a.weapon==='sniper'?' (−50%)':''}</b></span><span>일반 사격 피해<b>${stats.damage}</b></span><span>일반 사거리<b>${r.range+stats.range}칸</b></span><span>명중 보정<b>${stats.accuracy>0?'+':''}${stats.accuracy}%p</b></span></div><p class="prep-fine supply-guide">출전 보급: 완충 ${batteryCapacity(a)}회분 · 예비 배터리 2개 · 응급 키트 1개<br>일반/저격/경계 사격마다 충전 1회분 소모(빗나감 포함). 교체 1 AP, 스킬 대기 유지.<br>키트: 1 AP · 자신/인접 아군 HP 3 복구 · 전투 불능 복구 불가.<br>무기는 전투 중 교체할 수 없습니다.</p><p class="prep-fine">저격총: 일반 사격은 위 수치, 정밀 관통은 14칸·피해 6/치명타 12.<br>미장착 시 정밀 관통만 비활성화됩니다. 다른 병과 기본 스킬은 추가 장비가 필요 없습니다.<br>XP ${a.xp} · 미션 성공 시 대기 요원 포함 +100 XP<br>레벨당 스킬 포인트 1 확보 (현재 ${level-1}점, 배분 트리는 후속 구현)</p>`;
    $('#weapon').onchange=e=>{a.weapon=e.target.value;detail();};$('#module').onchange=e=>{a.module=e.target.value;detail();};
  }
  function briefing(){
    page='briefing';const m=MISSIONS[faction];$('#landing').hidden=true;$('#preparation').hidden=false;$('#prep-back').hidden=false;
    $('#mission-code').textContent=m.code;$('#brief-title').textContent=m.title;$('#brief-copy').textContent=m.brief;
    $('#brief-objectives').innerHTML=m.objectives.map(x=>`<li>${x}</li>`).join('');$('#failure').textContent='실패 조건 / '+m.failure;
    $('#brief-hints').innerHTML=m.hints.map(([title,body])=>`<p><b>${title}</b><span>${body}</span></p>`).join('');refresh();root.scrollTop=0;
  }
  function landing(){$('#prologue').hidden=true;page='landing';$('#landing').hidden=false;$('#preparation').hidden=true;$('#prep-back').hidden=true;root.scrollTop=0;const heading=$('.landing-title h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  root.querySelectorAll('[data-faction]').forEach(b=>b.onclick=()=>{faction=b.dataset.faction;briefing();});
  $('#prep-back').onclick=landing;
  $('#roster').onclick=e=>{const inspect=e.target.closest('[data-inspect]'),toggle=e.target.closest('[data-role]');if(inspect)focused=Number(inspect.dataset.inspect);if(toggle){const id=Number(toggle.dataset.role);focused=id;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<4)selected.push(id);else {$('#prep-notice').textContent='투입 중인 요원 한 명을 해제한 뒤 교체하세요.';detail();return;}}refresh();const source=inspect?'data-inspect':toggle?'data-role':null;if(source)root.querySelectorAll('['+source+']').item(focused)?.focus({preventScroll:true});};
  $('#recommended').onclick=()=>{selected=[...MISSIONS[faction].recommended];focused=selected[0];refresh();};
  $('#deploy').onclick=()=>{if(selected.length===4&&ready())onDeploy(faction,[...selected],structuredClone(profiles[faction]));};
  $('#continue').onclick=onContinue;
  return {refresh,open(state,where='landing'){if(state?.agents)profiles[state.faction]=structuredClone(state.agents);root.hidden=false;if(where==='briefing'){faction=state.faction;selected=[...state.roster];focused=selected[0];briefing();}else landing();}};
}
