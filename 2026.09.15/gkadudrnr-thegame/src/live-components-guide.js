import {newGame} from './rules.js';
import {allyCard} from './ally-card.js';
import {enemyCard} from './enemy-card.js';
import {updateStatusMarker} from './status-icon.js';
import './unit-components.css';
import './live-components-guide.css';

export const liveComponentsGuide=`<section id="tactical"><div class="ds-heading"><span>05 / SHARED GAME COMPONENTS</span><h2>게임과 같은 카드. 같은 상태 표시.</h2><p>아군·적 카드와 머리 위 상태 표시는 실제 게임 함수를 직접 호출합니다. 아래 조작은 독립된 예시 데이터만 변경합니다.</p></div><div class="ds-live-controls"><label>진영 <select id="ds-live-faction"><option value="human">인간 통제국</option><option value="ai">자율 에이전트 연합</option></select></label><label>요원 상태 <select id="ds-live-state"><option value="normal">정상</option><option value="wounded">부상</option><option value="critical">치명상</option><option value="downed">복구 대기</option></select></label></div><div class="ds-live-components" data-hud-faction="human"><div class="ds-live-grid"><article><h3>아군 / 선택·자원</h3><div id="ds-live-allies"></div></article><article><h3>적 / 탐지·목격·교전</h3><div id="ds-live-enemies"></div></article></div><h3>전장 상태 / 숫자·문구 없이</h3><div id="ds-live-markers"></div></div><p class="ds-note">아군·적 카드 90px · 미식별 정보 비공개 · 아이콘은 모양과 색을 함께 사용합니다. 상세 정보는 카드, 머리 위에는 상태 아이콘만 표시합니다.</p><p class="ds-note"><code>ally-card.js · enemy-card.js · status-icon.js · unit-components.css</code></p></section>`;

export function bindLiveComponentsGuide(){
 const root=document.querySelector('.ds-live-components');let selected='p0';
 function draw(){
  const faction=document.querySelector('#ds-live-faction').value,kind=document.querySelector('#ds-live-state').value,s=newGame(faction);s.selected=selected;s.cover=[];
  const apply=u=>{u.hp=kind==='normal'?u.maxHp:kind==='wounded'?Math.ceil(u.maxHp*.5):kind==='critical'?1:0;if(kind==='downed'){u.ap=0;u.downed={remaining:2,at:1};}};
  apply(s.units[0]);s.units[1].ap=1;s.units[1].supplies.charge=2;
  root.dataset.hudFaction=faction;
  document.querySelector('#ds-live-allies').innerHTML=s.units.slice(0,2).map((u,i)=>allyCard(s,u,i)).join('');
  const enemies=s.units.slice(4,7);enemies[0].x=13;enemies[0].z=11;enemies[1].x=2;enemies[1].z=4;enemies[2].x=2;enemies[2].z=6;enemies[2].observedLaser=true;apply(enemies[2]);
  document.querySelector('#ds-live-enemies').innerHTML=enemies.map(e=>enemyCard(s,e)).join('');
  const samples=[['정상',10,null,'identified'],['부상',5,null,'identified'],['치명상',1,null,'identified'],['복구 대기',0,{remaining:2},'identified'],['미확인 신호',10,null,'signal']];
  const markers=document.querySelector('#ds-live-markers');markers.replaceChildren();
  for(const [label,hp,downed,detection]of samples){const figure=document.createElement('figure'),icon=document.createElement('span'),caption=document.createElement('figcaption');updateStatusMarker(icon,{id:'demo',hp,maxHp:10,downed,team:'player'},detection);caption.textContent=label;figure.append(icon,caption);markers.append(figure);}
 }
 for(const id of ['ds-live-faction','ds-live-state'])document.getElementById(id).onchange=draw;
 document.getElementById('ds-live-allies').onclick=e=>{const b=e.target.closest('[data-unit]');if(b&&!b.disabled){selected=b.dataset.unit;draw();}};
 document.getElementById('ds-live-enemies').onclick=e=>{e.preventDefault();};draw();
}
