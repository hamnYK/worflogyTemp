import {allyCard} from './ally-card.js';
import './unit-components.css';
import {rememberBattle,leaveBattle,recoverBattle} from './battle-session.js';
﻿import {WATCH_SIDES,watchFacing,inWatchArc} from './watch-direction.js';
import {unitCapacity} from './supplies.js';
import { unitStatus } from './unit-status.js';
import {enemyCard} from './enemy-card.js';
import { attackPreview } from './attack-preview.js';

import { symbol, apPips } from './symbols.js';
import './style.css';
import './game-hud.css';
import { createPreparation } from './preparation.js';
import './readability.css';
import './tactical-finish.css';
import { WEAPONS, movementRange, MISSIONS, loadoutStats } from './operation.js';
import { portrait, actionIcon } from './ui-art.js';
import { ROLES, SIZE, newGame, act, enemyTurn, visible, directlyVisible, chance, pathTo, dist, lineOfSight } from './rules.js';
import { themeColor } from './theme.js';
import { createScene } from './scene.js';
import { autosave, loadLocal, exportSave, importSave } from './storage.js';
import './combat-screen.css';
import './graphic-ui.css';

const $=s=>document.querySelector(s);
let pendingAttack=null;
let state=newGame(),mode='move',view,busy=false,saveQueue=Promise.resolve();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#app').innerHTML=`
<header><a class="brand wordmark" href="#" id="home"><span aria-hidden="true">N∕</span><b>NULL SECTOR</b></a><nav><span class="nav-active">전술 지휘</span><span>ACT 01</span><button id="open-operation">작전 메뉴</button><a href="./design-system.html" target="_blank" rel="noopener">디자인 시스템</a></nav><div class="connection"><i></i> LOCAL SESSION <span class="version">PROTOTYPE 0.1</span></div></header>
<main><aside class="left-panel"><div class="eyebrow">OPERATION / 001</div><h1 id="mission-title">기억의 격리 구역</h1><p id="mission-desc" class="muted">사라지기 전에, 그들의 기억을 확보하라.</p><div class="divider"></div><div class="section-title">작전 목표 <span>OBJECTIVES</span></div><div id="objectives"></div><div class="section-title squad-heading">출전 분대 <span>4 AGENTS</span></div><div id="squad"></div><div class="local-status"><i></i><span id="save-status">브라우저 로컬 저장 · 통계 전송 없음</span></div></aside>
<section class="battle"><div id="viewport"></div><div class="map-top"><span class="map-tag">SECTOR 07 <b>격리 중계소</b></span><span class="map-tag" id="turn">01 / PLAYER PHASE</span></div><div class="map-caption"><span>GRID 14 × 12</span><span>클릭 선택·이동 / 아군 우클릭 명령 / 드래그 시점 이동 / 우드래그 회전 / 휠 확대</span><button id="quality" title="접촉 음영 효과 전환">GRAPHICS HIGH</button><button id="camera" title="시점 초기화" aria-label="시점 초기화">${symbol('reset')}</button></div><div id="loading">가상 전장 연결 중…</div><div id="target-labels"></div><div id="toast" role="status"></div><div id="result" hidden></div><div id="attack-preview" hidden role="dialog" aria-modal="false" aria-labelledby="attack-title"></div></section>
<aside class="right-panel"><div class="section-title">전장 정보 <span>INTEL</span></div><div class="intel-block"><span class="eyebrow">THREAT LEVEL</span><strong id="threat">탐색 중</strong><div class="signal"><i></i><i></i><i></i><i></i><i></i></div><p>정보는 시야를 열고,<br>엄폐는 생존을 결정합니다.</p></div><div class="section-title">탐지된 표적 <span id="enemy-count">00</span></div><div id="enemies"></div><div class="section-title log-title">작전 기록 <span>LIVE</span></div><div id="log" aria-live="polite"></div><div class="storage-actions"><button id="save">파일로 저장</button><button id="load">파일 불러오기</button><input id="file" type="file" accept=".json,application/json" hidden></div></aside>
</main><footer><div class="active-agent"><span class="eyebrow">SELECTED AGENT</span><strong id="active-name">GHOST</strong><span id="active-role">잠행 정찰병</span></div><div id="actions"></div><button id="end-turn" class="primary end-turn">턴 종료 <span>SPACE</span></button></footer>
<dialog id="operation-menu" aria-labelledby="operation-menu-title"><div class="operation-menu-top"><h2 id="operation-menu-title">작전 메뉴</h2><button id="close-operation">닫기 · ESC</button></div><div id="operation-mission"></div><div id="operation-record"></div><div id="operation-storage"></div></dialog><div id="lobby" class="overlay"></div><div class="game-copyright" role="contentinfo">© 2025 워플로지(WORFLOGY). All rights reserved.</div>`;

// Unit-only sidebars, persistent operation dock, contextual agent commands.
const left=$('.left-panel'),right=$('.right-panel'),dock=$('#app>footer');
const commands=document.createElement('div');commands.id='unit-commands';commands.hidden=true;commands.setAttribute('role','dialog');commands.setAttribute('aria-label','요원 명령');
commands.append($('.active-agent'),$('#actions'));const close=document.createElement('button');close.id='close-commands';close.textContent='닫기 · ESC';commands.append(close);$('#app').append(commands);
const mission=document.createElement('section');mission.className='dock-mission';
for(const node of [...left.children])if(!node.matches('#squad,.squad-heading,.local-status'))mission.append(node);
const record=document.createElement('section');record.className='dock-record';record.append($('.log-title'),$('#log'),$('.storage-actions'));
const intel=document.createElement('section');intel.className='dock-intel';intel.append(right.querySelector('.section-title'),$('.intel-block'),$('.local-status'));
dock.prepend(mission,record,intel);
$('.map-caption').insertBefore($('#toast'),$('#quality'));
$('#toast').setAttribute('aria-atomic','true');
$('.squad-heading').innerHTML='아군 분대 <span>4 AGENTS</span>';
$('#operation-menu').remove();$('#open-operation').remove();
let choosingWatch=false;
function closeCommands(){commands.hidden=true;if(choosingWatch){choosingWatch=false;updateHints();}}
function openCommands(id,x,y){
 if(busy||!$('#lobby').hidden||state.status!=='active')return;
 const unit=state.units.find(u=>u.id===id&&u.team==='player');if(!unit||unit.hp<=0)return;
 state.selected=id;mode='move';render();commands.hidden=false;
 const bounds=commands.getBoundingClientRect();commands.style.left=Math.max(8,Math.min(x,innerWidth-bounds.width-8))+'px';commands.style.top=Math.max(8,Math.min(y,innerHeight-bounds.height-36))+'px';
 commands.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
}
close.onclick=closeCommands;
// On Windows the native contextmenu event can target the newly opened popup,
// rather than the canvas that received pointerup. Guard the whole battle UI.
$('#app').addEventListener('contextmenu',e=>{
 if($('#lobby').hidden)e.preventDefault();
},true);
$('#squad').addEventListener('contextmenu',e=>{const card=e.target.closest('[data-unit]');if(card){e.preventDefault();openCommands(card.dataset.unit,e.clientX,e.clientY);}});
document.addEventListener('pointerdown',e=>{if(!commands.hidden&&!commands.contains(e.target))closeCommands();});

// Keep keyboard navigation inside the current screen.
const syncScreens=()=>{if(!$('#lobby').hidden)closeCommands();for(const el of document.querySelectorAll('#app>header,#app>main,#app>footer'))el.inert=!$('#lobby').hidden;};
new MutationObserver(syncScreens).observe($('#lobby'),{attributes:true,attributeFilter:['hidden']});syncScreens();
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>{$('#toast').classList.remove('show');$('#toast').textContent='';},5000);}
function save(){$('#save-status').textContent='저장 중…';const snapshot=structuredClone(state);saveQueue=saveQueue.catch(()=>{}).then(()=>autosave(snapshot)).then(()=>{$('#save-status').textContent='자동 저장 완료 · 이 브라우저에 보관';}).catch(()=>{$('#save-status').textContent='자동 저장 실패 · 파일로 백업하세요';});}
function updateHints(){if(!view)return;const u=state.units.find(a=>a.id===state.selected);if(!u||u.hp<=0||state.status!=='active'||busy)return view.highlight([]);const cells=[];if(mode==='move'||(mode==='skill'&&ROLES[u.role].skill==='dash')){const cap=u.ap>0?movementRange(state.agents?.[u.role],mode==='skill'?8:4):0;for(let z=0;z<SIZE.h;z++)for(let x=0;x<SIZE.w;x++){if(dist(u,{x,z})>cap)continue;const p=pathTo(state,u,x,z);if(p?.length&&p.length<=cap)cells.push({x,z,color:themeColor(p.length>4?'scene-dash':'scene-move')});}}view.highlight(cells);}
function previewWatch(side){
 const u=state.units.find(a=>a.id===state.selected),guard={...u,watchFacing:watchFacing(u,side)},cells=[];
 const range=ROLES[u.role].range+loadoutStats(state.agents?.[u.role]).range;
 for(let z=0;z<SIZE.h;z++)for(let x=0;x<SIZE.w;x++)if(dist(u,{x,z})<=range&&inWatchArc(guard,{x,z})&&lineOfSight(state,u,{x,z}))cells.push({x,z,color:'#ad7c36'});
 view?.highlight(cells);
}
function openWatchDirections(){
 choosingWatch=true;
 $('#actions').innerHTML=`<p class="equipment-note">요원이 바라보는 정면 기준 · 선택 범위 90°<br>확정 시 1 AP · 취소는 소모 없음<br>범위 표시는 사거리·사선 반영 · 카메라 회전과 무관</p>${Object.entries(WATCH_SIDES).map(([id,label])=>`<button class="action" data-action="watch-${id}">${actionIcon('watch',0)}<strong>${label} 경계</strong><small>${['북','동','남','서'][watchFacing(state.units.find(a=>a.id===state.selected),id)]} · 1 AP · 자동 1회</small></button>`).join('')}<button class="action" data-action="back"><strong>취소</strong><small>명령 목록</small></button>`;
 previewWatch('front');const bounds=commands.getBoundingClientRect();commands.style.top=Math.max(8,Math.min(commands.offsetTop,innerHeight-bounds.height-36))+'px';
}
for(const event of ['pointerover','focusin'])$('#actions').addEventListener(event,e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(choosingWatch&&action?.startsWith('watch-'))previewWatch(action.slice(6));});
function openEquipment(){
 const u=state.units.find(a=>a.id===state.selected),items=u.supplies;
 const allies=state.units.filter(a=>a.team==='player'&&a.hp>0&&dist(u,a)<=1);
 $('#actions').innerHTML=`<p class="equipment-note">충전 ${items.charge}/${unitCapacity(state,u)} · 교체 1 AP<br>남은 충전은 폐기 · 스킬 대기는 유지<br>응급 키트: HP 3 복구 · 전투 불능 복구 불가</p><button class="action" data-action="reload" ${!items.batteries||items.charge===unitCapacity(state,u)||!u.ap?'disabled':''}>${actionIcon('equipment',u.role)}<strong>배터리 교체</strong><small>예비 ${items.batteries}개 · 1 AP</small></button>${allies.map(a=>`<button class="action" data-action="firstaid" data-ally="${a.id}" ${!items.kits||a.hp===a.maxHp||!u.ap?'disabled':''}>${actionIcon('skill',4)}<strong>${a.id===u.id?'자기 응급 복구':a.name+' 복구'}</strong><small>HP ${a.hp}/${a.maxHp} · 키트 ${items.kits} · 1 AP</small></button>`).join('')}<button class="action" data-action="back"><strong>명령 목록</strong><small>돌아가기</small></button>`;
 const bounds=commands.getBoundingClientRect();commands.style.top=Math.max(8,Math.min(commands.offsetTop,innerHeight-bounds.height-36))+'px';
}
function render(){
  closeCommands();closeAttackPreview();$('#app').dataset.hudFaction=state.faction;
  const u=state.units.find(a=>a.id===state.selected),r=ROLES[u.role];
  $('#mission-title').textContent=MISSIONS[state.faction].title;$('#mission-desc').textContent=state.faction==='human'?'사라지기 전에, 그들의 기억을 확보하라.':'이곳은 시설이 아니다. 우리의 도시다.';
  $('#objectives').innerHTML=state.faction==='human'?`<div class="objective ${state.carrier?'done':''}"><b>${state.carrier?symbol('check'):'01'}</b><span>동쪽 노드에서 메모리 회수<small>인접 후 ‘노드 접속’ · 1 AP · ${state.turnLimit??MISSIONS.human.turnLimit}턴 제한</small></span></div><div class="objective"><b>02</b><span>운반 요원 서쪽 구역 복귀<small>밝은 파란색 진입 구역 · X ≤ 1</small></span></div>`:`<div class="objective"><b>01</b><span>${state.turnLimit??MISSIONS.ai.turnLimit}턴 동안 한 명 이상 생존<small>침투 요원 전멸 시 즉시 성공</small></span></div><div class="objective"><b>02</b><span>엄폐와 연결을 활용하라<small>브리핑의 생존 또는 격퇴 조건을 달성하세요.</small></span></div>`;
  if(state.defense)$('#objectives').innerHTML=state.defense.nodes.map(n=>`<div class="objective"><b>${n.breach}/3</b><span>${n.name} (${n.x}, ${n.z})<small>인접 복구 1 AP · ${n.breach===2?'장악 임박':n.breach?'침투 진행':'안전'} · ${state.turnLimit}턴 방어</small></span></div>`).join('');
  $('#squad').innerHTML=state.units.filter(a=>a.team==='player').map((a,i)=>allyCard(state,a,i)).join('');
  $('.active-agent>.agent-portrait')?.remove();$('.active-agent').insertAdjacentHTML('afterbegin',portrait(u.role,state.faction));$('#active-name').textContent=u.name;$('#active-role').textContent=`${r.name} / ${state.agents?.[u.role]?.weapon==='sniper'?'장거리 광선 저격총':r.weapon}`;
  const buttons=[['move','01','이동','1 AP'],['shoot','02','사격','1 AP'],['watch','03','경계','설정 1 AP · 자동 1회'],['skill','04',r.skillName,r.skill==='snipe'&&state.agents?.[u.role]?.weapon!=='sniper'?'저격총 필요':u.cooldown?`${u.cooldown}턴 대기`:'1 AP'],['hack','05',state.defense?'노드 복구':'노드 접속','1 AP'],['equipment','06','장비 사용',`배터리 ${u.supplies.batteries} · 키트 ${u.supplies.kits}`]];
  $('#actions').innerHTML=buttons.map(([id,key,name,cost])=>`<button class="action ${mode===id?'active':''}" data-action="${id}" title="${id==='skill'?escape(r.desc):name}" ${busy||!u.hp||!u.ap||state.status!=='active'||(id==='watch'&&(u.watch||u.watchFiredTurn===state.turn||!u.supplies.charge))||(id==='skill'&&(u.cooldown>0||(r.skill==='snipe'&&state.agents?.[u.role]?.weapon!=='sniper')))||(id==='hack'&&state.faction==='ai'&&!state.defense)?'disabled':''}><span class="action-key">${key}</span>${actionIcon(id,u.role)}<strong>${name}</strong><small>${cost}</small></button>`).join('');
  $('#end-turn').disabled=busy||state.status!=='active';$('#turn').textContent=`${String(Math.min(state.turn,state.turnLimit??MISSIONS[state.faction].turnLimit)).padStart(2,'0')} / ${state.turnLimit??MISSIONS[state.faction].turnLimit} 턴 · ${busy?'ENEMY PHASE':'PLAYER PHASE'}`;
  const enemies=state.units.filter(e=>e.team==='enemy'&&(e.hp>0||e.downed)&&visible(state,e));$('#enemy-count').textContent=String(enemies.length).padStart(2,'0');$('#threat').textContent=enemies.length?'적 신호 탐지':'시야 밖 · 정찰 필요';
  $('#enemies').innerHTML=enemies.map(e=>enemyCard(state,e)).join('')||'<p class="empty">탐지된 적이 없습니다.<br>정찰 또는 스캔으로 확인하세요.</p>';
  $('#log').innerHTML=state.log.slice(-6).reverse().map((l,i)=>`<p class="${i===0?'latest':''}">${escape(l)}</p>`).join('');
  $('#result').hidden=state.status==='active';if(state.status!=='active')$('#result').innerHTML=`<span class="eyebrow">OPERATION ${state.status==='won'?'COMPLETE':'FAILED'}</span><h2>${state.status==='won'?'연결을 확보했습니다.':'신호를 잃었습니다.'}</h2><p>${state.status==='won'?'작전 완료 · 대기 요원 포함 경험치 100 지급<br>분대 편성에서 레벨과 새 장비를 확인하세요.':'분대의 진입 경로와 엄폐 활용을 다시 계획하세요.'}</p><button class="primary" id="back-lobby">분대 재편성</button>`;
  document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===mode)));
  document.querySelectorAll('[data-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.unit===state.selected)));
  view?.sync(state);updateHints();if($('#lobby').hidden)rememberBattle(state);
}
function closeAttackPreview(){pendingAttack=null;$('#attack-preview').hidden=true;view?.preview(null);}
function requestAttack(kind,target){
 const p=attackPreview(state,kind,target);if(!p)return false;
 pendingAttack={kind,target:structuredClone(target)};
 const labels={shoot:'레이저 사격',snipe:'정밀 관통',blast:'데이터 폭발',drone:'침투 데이터 폭발',jam:'명령 간섭'};
 $('#attack-preview').innerHTML=`<div class="attack-heading"><span class="eyebrow">FIRE CONTROL / 공격 전 확인</span><button id="cancel-attack" aria-label="공격 취소">취소 · ESC</button></div><h2 id="attack-title">${labels[p.op]}</h2><p class="attack-target">${escape(p.name)} <span>${target.x}, ${target.z}</span></p><div class="attack-metrics"><div><b>${p.probability===null?'—':p.probability+'%'}</b><span>${p.area?'범위 내 적용':'명중 확률'}</span></div><div><b>${p.damage||'교란'}</b><span>${p.damage?'명중 시 피해':'다음 행동 봉쇄'}</span></div><div><b>${p.cost} AP</b><span>소모 비용</span></div></div>${p.batteryCost?'<p class="attack-note">충전 1회분 소모 · 빗나가도 소모</p>':''}${p.criticalChance?'<p class="attack-note">명중 시 치명타 '+p.criticalChance+'% · 치명 피해 '+p.criticalDamage+'<br>치명타로 HP 0이면 복구 대기 없이 즉시 소멸</p>':''}<p class="attack-note">${p.area?'반경 1칸 · 중심과 상하좌우 5칸 · 엄폐 파괴':p.op==='jam'?'피해 없이 적의 다음 행동을 차단합니다.':'빗나가면 피해 0 · 표시 확률은 현재 거리·엄폐·장비 반영'}</p>${p.allies.length?'<p class="attack-warning">아군 피해 경고: '+p.allies.map(escape).join(', ')+'</p>':''}${p.error?'<p class="attack-warning">'+escape(p.error)+'</p>':''}<button id="confirm-attack" class="primary" ${p.valid?'':'disabled'}>${p.area?'폭발 실행':'공격 실행'}</button>`;
 $('#attack-preview').hidden=false;view?.highlight([]);view?.preview({from:state.units.find(a=>a.id===state.selected),target,cells:p.cells,valid:p.valid});
 $('#cancel-attack').onclick=()=>{closeAttackPreview();updateHints();};
 $('#confirm-attack').onclick=()=>{const a=pendingAttack;if(!a)return;closeAttackPreview();execute(a.kind,a.target,true);};
 $('#cancel-attack').focus({preventScroll:true});return true;
}
function execute(kind,target,confirmed=false){if(busy)return;if(!confirmed&&requestAttack(kind,target))return;const result=act(state,kind,target);if(!result.ok){toast(result.error);return;}mode='move';view.effects(result.effects);render();save();}
function onCell(x,z){if(busy||!$('#lobby').hidden||state.status!=='active')return;const target=state.units.find(u=>u.x===x&&u.z===z&&(u.hp>0||u.downed)&&(u.team==='player'||visible(state,u))),u=state.units.find(a=>a.id===state.selected);if(target?.team==='player'&&target.hp>0&&!(mode==='skill'&&['heal','blast','drone'].includes(ROLES[u.role].skill))){state.selected=target.id;mode='move';render();return;}execute(target?.team==='enemy'&&mode==='move'?'shoot':mode,target?{id:target.id,x,z}:{x,z});}
const preparation=createPreparation($('#lobby'),{ready:()=>!!view,onDeploy:(faction,roster,agents)=>{state=newGame(faction,roster,agents);mode='move';$('#lobby').hidden=true;view.resetCamera();render();save();},onContinue:async()=>{if(!view)return;try{await saveQueue;const loaded=await loadLocal();if(!loaded){alert('저장된 작전이 없습니다. 진영을 선택해 새 작전을 시작하세요.');return;}state=loaded;$('#lobby').hidden=true;mode='move';render();}catch(e){alert('자동 저장 불러오기 실패: '+e.message);}}});
$('#squad').onclick=e=>{const b=e.target.closest('[data-unit]');if(b&&!busy&&!b.disabled){state.selected=b.dataset.unit;mode='move';render();}};
$('#actions').onclick=e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const cmd=b.dataset.action,u=state.units.find(a=>a.id===state.selected);if(cmd==='watch'){openWatchDirections();return;}if(cmd.startsWith('watch-')){execute('watch',{direction:cmd.slice(6)});return;}if(cmd==='equipment'){openEquipment();return;}if(cmd==='back'){openCommands(u.id,commands.offsetLeft,commands.offsetTop);return;}if(cmd==='reload'||cmd==='firstaid'){execute(cmd,{id:b.dataset.ally});return;}if(cmd==='hack'||(cmd==='skill'&&ROLES[u.role].skill==='scan'))execute(cmd);else{mode=cmd;render();toast(cmd==='skill'?ROLES[u.role].desc:cmd==='shoot'?'전장 또는 오른쪽 목록에서 표적을 선택하세요.':'밝게 표시된 칸을 선택하세요.');}};
$('#enemies').onclick=e=>{const b=e.target.closest('[data-target]');if(!b||busy)return;const t=state.units.find(a=>a.id===b.dataset.target);execute(mode==='skill'?'skill':'shoot',{...t});};
$('#end-turn').onclick=async()=>{if(busy||state.status!=='active')return;busy=true;mode='move';render();await new Promise(r=>setTimeout(r,350));const effects=enemyTurn(state);view.effects(effects);render();await new Promise(r=>setTimeout(r,750));busy=false;render();save();};
$('#save').onclick=async()=>{if(busy)return toast('적 턴이 끝난 뒤 저장할 수 있습니다.');try{await exportSave(state);toast('세이브 파일을 저장했습니다.');}catch(e){if(e.name!=='AbortError')toast('파일 저장 실패: '+e.message);}};
$('#load').onclick=()=>{if(!busy)$('#file').click();};$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const loaded=await importSave(f);state=loaded;mode='move';$('#lobby').hidden=true;render();save();toast('세이브 파일을 불러왔습니다.');}catch(error){toast(error.message);}e.target.value='';};
$('#home').onclick=e=>{e.preventDefault();if(!busy){closeAttackPreview();leaveBattle();preparation.open(state);}};$('#result').onclick=e=>{if(e.target.closest('#back-lobby')){leaveBattle();preparation.open(state,'briefing');}};
$('#camera').onclick=()=>view?.resetCamera();
$('#quality').onclick=()=>{if(view)$('#quality').textContent=view.setQuality()?'GRAPHICS HIGH':'GRAPHICS LOW';};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!commands.hidden){e.preventDefault();closeCommands();return;}if(e.key==='Escape'&&pendingAttack){e.preventDefault();closeAttackPreview();updateHints();return;}if(pendingAttack&&e.code==='Space'){e.preventDefault();return;}if(!$('#lobby').hidden||e.target.matches('input,button')||e.repeat)return;if(e.code==='Space'){e.preventDefault();$('#end-turn').click();}if(['1','2','3','4'].includes(e.key)&&!busy){const u=state.units.filter(a=>a.team==='player')[Number(e.key)-1];if(u.hp>0){state.selected=u.id;mode='move';render();}}if(e.key==='Escape'){mode='move';render();}});
const recoveredBattle=recoverBattle();if(recoveredBattle){state=recoveredBattle;$('#lobby').hidden=true;}
preparation.refresh();render();
try{view=await createScene($('#viewport'),onCell,openCommands);$('#loading').hidden=true;render();preparation.refresh();window.__game={get state(){return structuredClone(state);},get physicalBodies(){return view.physicalBodies;},project:(x,z)=>view.project(x,z)};}catch(e){$('#loading').textContent='3D 전장 초기화 실패. 브라우저의 그래픽 가속을 확인하고 새로고침하세요.';console.error(e);}





// AFTER HOURS waits for actual WebGL readiness, including in opaque file origins.
if(window.parent!==window)window.parent.postMessage({type:view?"null-sector-ready":"null-sector-error"},"*");
