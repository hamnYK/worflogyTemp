import {encodeProgress,decodeProgress} from './save-codec.js';
import {WATCH_SIDES,watchFacing,facingToward,inWatchArc} from './watch-direction.js';
import {initialSupplies,unitCapacity} from './supplies.js';
import {createDefense,defenseDecision} from './defense.js';
import { canEquip, movementRange, DEFENSE_TURNS, MISSIONS, STANDARD_ENEMY_COUNT, WEAPONS, MODULES, makeAgents, levelOf, loadoutStats } from './operation.js';
export const SIZE = { w: 14, h: 12 };
export const ROLES = [
  { name: '잠행 정찰병', code: 'GHOST', ai: 'TRACE', hp: 9, skill: 'scan', skillName: '위치 스크래핑', desc: '전장의 적을 2턴 동안 탐지', weapon: '레이저 카빈', range: 7 },
  { name: '기동 돌격병', code: 'BREACH', ai: 'SHIFT', hp: 12, skill: 'dash', skillName: '기동 돌파', desc: '1 AP로 최대 8칸 이동', weapon: '산개 광선총', range: 5 },
  { name: '중화기 파괴병', code: 'FAULT', ai: 'BULWARK', hp: 12, skill: 'blast', skillName: '지향성 폭파', desc: '반경 1칸 피해 4 · 엄폐 파괴', weapon: '중형 펄스포', range: 7 },
  { name: '정밀 저격병', code: 'VECTOR', ai: 'SIGHT', hp: 8, skill: 'snipe', skillName: '정밀 관통', desc: '저격총 필요 · 14칸 · 피해 6 / 치명타 12 · 이동 −50%', weapon: '광선 소총 / 선택 장비', range: 7 },
  { name: '전장 기술병', code: 'PATCH', ai: 'RESTORE', hp: 10, skill: 'heal', skillName: '무결성 복구', desc: '4칸 내 아군 HP 5 복구', weapon: '레이저 소총', range: 7 },
  { name: '드론 공작병', code: 'RELAY', ai: 'MESH', hp: 9, skill: 'drone', skillName: '침투 폭발 드론', desc: '8칸 원격 폭파 · 시전자 AP 사용', weapon: '공작 광선총', range: 7 },
  { name: '인지 교란병', code: 'ECHO', ai: 'MIRROR', hp: 9, skill: 'jam', skillName: '명령 간섭', desc: '보이는 적의 다음 행동 봉쇄', weapon: '전자전 광선총', range: 7 },
];
export const dist = (a,b) => Math.abs(a.x-b.x)+Math.abs(a.z-b.z);
export const inside = (x,z) => x>=0 && z>=0 && x<SIZE.w && z<SIZE.h;
export function newGame(faction='human', roster=[0,2,4,5], agents=makeAgents(), encounterVersion=2) {
  const cover = [];
  for(const [x,z,h] of (faction==='ai'?[[3,1,1],[3,3,1],[3,5,1],[3,7,1],[3,9,1],[5,2,2],[5,3,2],[5,8,2],[5,9,2],[7,5,1],[7,6,1],[9,1,2],[9,2,2],[9,8,2],[9,9,2],[10,4,1],[10,6,1],[11,10,1],[12,5,1],[12,7,1]]:[[3,2,1],[3,3,1],[3,5,2],[3,6,2],[3,8,1],[5,4,1],[6,4,1],[7,4,1],[6,7,1],[7,7,1],[8,7,1],[9,2,2],[9,3,2],[9,5,1],[10,5,1],[10,8,2],[10,9,2],[5,9,1],[7,1,1],[12,7,1]])) cover.push({id:`c${x}-${z}`,x,z,h,hp:h*4});
  const units=roster.map((role,i)=>({id:`p${i}`,role,name:faction==='human'?ROLES[role].code:ROLES[role].ai,x:1,z:2+i*2,hp:ROLES[role].hp,maxHp:ROLES[role].hp,ap:2,team:'player',cooldown:0,watch:false,jammed:0}));
  if(encounterVersion===1){for(let i=0;i<4;i++) units.push({id:`e${i}`,role:i,name:faction==='human'?['WARDEN','SENTRY','HUNTER','ARCHON'][i]:['NEEDLE','SABLE','LOCK','ZERO'][i],x:[7,11,11,12][i],z:[2,4,8,2][i],hp:i===3?12:8,maxHp:i===3?12:8,ap:2,team:'enemy',cooldown:0,watch:false,jammed:0});}
  else for(let i=0;i<STANDARD_ENEMY_COUNT;i++){
    const role=i%7,name=i<4?(faction==='human'?ROLES[role].ai:ROLES[role].code):(faction==='human'?['WARDEN','SENTRY','HUNTER','ARCHON']:['NEEDLE','SABLE','LOCK','ZERO'])[i-4];
    units.push({id:`e${i}`,role,name,x:[7,11,11,12,11,12,11,12][i],z:[2,4,8,2,1,4,6,10][i],hp:i===3?12:8,maxHp:i===3?12:8,ap:2,team:'enemy',cooldown:0,watch:false,jammed:0});
  }
  for(const u of units){u.supplies=initialSupplies(u,agents);u.facing=u.team==='player'?1:3;}
  return {suppliesVersion:1,version:1,mapVersion:2,encounterVersion,faction,...(faction==='ai'&&encounterVersion===2?{defense:createDefense()}:{}),agents:structuredClone(agents),roster:[...roster],turnLimit:MISSIONS[faction].turnLimit,turn:1,phase:'player',units,cover,selected:'p0',scanUntil:0,carrier:null,terminal:{x:12,z:2},status:'active',seed:82613,log:['접속 완료. 허가되지 않은 기억이 이곳에 남아 있습니다.'],xp:0};
}
export function note(s,t){s.log.push(t);s.log=s.log.slice(-30);}
export function pathTo(s,u,x,z){
  if(!inside(x,z)) return null;
  const blocked=new Set([...s.cover.filter(c=>c.hp>0),...s.units.filter(a=>(a.hp>0||a.downed)&&a.id!==u.id)].map(a=>`${a.x},${a.z}`));
  const q=[{x:u.x,z:u.z,path:[]}], seen=new Set([`${u.x},${u.z}`]);
  for(let i=0;i<q.length;i++){const p=q[i];if(p.x===x&&p.z===z)return p.path;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=p.x+dx,nz=p.z+dz,k=`${nx},${nz}`;if(inside(nx,nz)&&!blocked.has(k)&&!seen.has(k)){seen.add(k);q.push({x:nx,z:nz,path:[...p.path,{x:nx,z:nz}]});}}}return null;
}
export function lineOfSight(s,a,b){
  const steps=Math.max(Math.abs(a.x-b.x),Math.abs(a.z-b.z))*5;
  for(let i=1;i<steps;i++){const x=Math.round(a.x+(b.x-a.x)*i/steps),z=Math.round(a.z+(b.z-a.z)*i/steps);if((x===a.x&&z===a.z)||(x===b.x&&z===b.z))continue;if(s.cover.some(c=>c.hp>0&&c.h===2&&c.x===x&&c.z===z))return false;}return true;
}
export function directlyVisible(s,e){return e.team==='player'||s.units.some(u=>u.team==='player'&&u.hp>0&&dist(u,e)<=8&&lineOfSight(s,u,e));}
export function detection(s,e){return directlyVisible(s,e)?'identified':s.scanUntil>=s.turn?'signal':'hidden';}
export function visible(s,e){return detection(s,e)!=='hidden';}
export function targetName(s,e){return directlyVisible(s,e)?e.name:'미확인 신호';}
export function chance(s,a,b,gear=true){
  let penalty=0;
  for(const c of s.cover.filter(c=>c.hp>0&&dist(c,b)===1)){if((c.x-b.x)*(a.x-b.x)+(c.z-b.z)*(a.z-b.z)>0)penalty=Math.max(penalty,c.h===2?40:20);}
  return Math.max(25,Math.min(95,88+(a.team==='player'&&gear?loadoutStats(s.agents?.[a.role]).accuracy:0)-Math.max(0,dist(a,b)-4)*4-penalty));
}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function hurt(s,u,n){u.hp=Math.max(0,u.hp-n);if(!u.hp){u.ap=0;u.watch=false;u.downed={remaining:3,at:s.turn};note(s,`${targetName(s,u)} 전투 불능 · 복구 기회 3턴`);}}
export function outcome(s){
  if(s.status!=='active')return;
  const alive=s.units.filter(u=>u.team==='player'&&u.hp>0), foes=s.units.filter(u=>u.team==='enemy'&&(u.hp>0||u.downed));
  if(s.defense?.nodes.some(n=>n.breach>=3)){s.status='lost';note(s,'피난 중계소 장악 · 전송 경로 소실');}
  else if(!alive.length||(s.carrier&&!s.units.some(u=>u.id===s.carrier&&(u.hp>0||u.downed))))s.status='lost';
  else if(s.faction==='human'&&s.carrier&&alive.some(u=>u.id===s.carrier&&u.x<=1))s.status='won';
  else if(s.faction==='ai'&&(!foes.length||s.turn>(s.turnLimit??DEFENSE_TURNS)))s.status='won';
  if(s.status==='active'&&s.turn>(s.turnLimit??MISSIONS[s.faction].turnLimit)){s.status='lost';note(s,'작전 시간 초과 · 연결 차단');}
  if(s.status==='won'){s.xp=100;for(const a of s.agents||[])a.xp+=100;note(s,'작전 완료 · 대기 요원 포함 동일 경험치 100 지급 기록');}
  if(s.status==='lost')note(s,'작전 실패 · 이전 체크포인트를 불러오거나 다시 도전하세요.');
}
export function act(s,kind,target){
  const u=s.units.find(x=>x.id===s.selected), effects=[],aliveBefore=s.units.filter(a=>a.hp>0).map(a=>a.id);
  const fail=error=>({ok:false,error,effects:[]});
  if(s.phase!=='player'||s.status!=='active'||!u||u.hp<=0)return fail('행동할 수 없는 상태입니다.');
  if(!['move','shoot','skill','watch','hack','reload','firstaid'].includes(kind))return fail('허용되지 않은 커맨드입니다.');
  if(u.ap<1)return fail('행동력이 부족합니다.');
  const skill=ROLES[u.role].skill, special=kind==='skill';
  if(special&&u.cooldown>0)return fail('스킬이 재사용 대기 중입니다.');
  const op=special?skill:kind;
  if(op==='move'||op==='dash'){
    const p=pathTo(s,u,target?.x,target?.z);if(!p?.length)return fail('이동할 수 없는 칸입니다.');
    const cost=1;if(cost>u.ap||p.length>movementRange(s.agents?.[u.role],op==='dash'?8:4))return fail('이동 범위를 벗어났습니다.');
    const from={x:u.x,z:u.z};u.facing=facingToward(p.length>1?p.at(-2):u,p.at(-1));Object.assign(u,p.at(-1));u.ap-=cost;u.watch=false;effects.push({type:'move',id:u.id,from,path:p});note(s,`${targetName(s,u)} 이동 · ${cost} AP`);
  }else if(op==='shoot'||op==='snipe'){
    const e=s.units.find(a=>a.id===target?.id&&a.team==='enemy'&&a.hp>0);
    if(!e||!visible(s,e))return fail('탐지된 적을 선택하세요.');
    if(op==='snipe'&&s.agents?.[u.role]?.weapon!=='sniper')return fail('장거리 광선 저격총을 장착해야 합니다.');
    if(op==='snipe'&&!directlyVisible(s,e))return fail('분대의 직접 시야가 필요합니다. 스캔 신호만으로는 저격할 수 없습니다.');
    const stats=loadoutStats(s.agents?.[u.role]);const range=op==='snipe'?14:ROLES[u.role].range+stats.range;
    if(dist(u,e)>range||!lineOfSight(s,u,e))return fail('사거리 또는 사선이 확보되지 않았습니다.');
    if(u.supplies.charge<1)return fail('배터리가 비었습니다. 장비 사용에서 교체하세요.');
    u.facing=facingToward(u,e);u.supplies.charge--;if(!u.supplies.charge)u.watch=false;
    const hit=random(s)*100<Math.min(100,chance(s,u,e,op!=='snipe')+(op==='snipe'?15:0));u.ap--;
    const critical=hit&&op==='snipe'&&random(s)<.25;
    if(hit)hurt(s,e,op==='snipe'?(critical?12:6):stats.damage);
    if(critical&&e.hp===0){delete e.downed;effects.push({type:'dissolve',id:e.id,x:e.x,z:e.z});note(s,`${targetName(s,e)} 치명타 · 데이터 즉시 소멸`);}
    effects.push({type:'shot',from:{...u},to:{...e},hit,critical});note(s,`${targetName(s,u)} → ${targetName(s,e)} ${critical?'치명타 12':hit?'명중':'빗나감'}`);
  }else if(op==='blast'||op==='drone'){
    if(!target||!inside(target.x,target.z)||dist(u,target)>(op==='drone'?8:6))return fail('폭파 범위를 벗어났습니다.');
    if(op==='blast'&&!lineOfSight(s,u,target))return fail('폭파 지점까지 사선이 필요합니다.');
    u.ap--;for(const c of s.cover.filter(c=>c.hp>0&&dist(c,target)<=1)){c.hp=0;effects.push({type:'break',...c});}
    for(const a of s.units.filter(a=>a.hp>0&&dist(a,target)<=1))hurt(s,a,4);
    effects.push({type:op==='drone'?'drone':'blast',from:{...u},to:{...target}});note(s,'폭파 완료 · 반경 1칸 피아 구분 없이 피해 4');
  }else if(op==='scan'){u.ap--;s.scanUntil=s.turn+1;note(s,'위치 스크래핑 · 2턴 동안 적 신호 확보');effects.push({type:'scan',from:{...u}});
  }else if(op==='heal'){
    const ally=s.units.find(a=>a.id===target?.id&&a.team==='player'&&(a.hp>0||a.downed));if(!ally||dist(u,ally)>4)return fail('4칸 내 살아 있는 아군을 선택하세요.');if(ally.hp===ally.maxHp)return fail('이미 무결성이 최대입니다.');const restored=!!ally.downed;ally.hp=Math.min(ally.maxHp,ally.hp+5);delete ally.downed;if(restored){ally.ap=0;note(s,`${ally.name} 재구성 완료 · 다음 턴부터 행동 가능`);}u.ap--;note(s,`${ally.name} 무결성 복구`);
  }else if(op==='jam'){
    const e=s.units.find(a=>a.id===target?.id&&a.team==='enemy'&&a.hp>0);if(!e||!visible(s,e)||dist(u,e)>7||!lineOfSight(s,u,e))return fail('사선이 확보된 7칸 내 적을 선택하세요.');e.jammed=1;u.ap--;note(s,`${targetName(s,e)} 다음 행동 봉쇄`);
  }else if(op==='reload'){
    if(u.supplies.batteries<1)return fail('예비 배터리가 없습니다.');
    if(u.supplies.charge===unitCapacity(s,u))return fail('배터리가 이미 완충 상태입니다.');
    u.supplies.batteries--;u.supplies.charge=unitCapacity(s,u);u.ap--;note(s,`${u.name} 배터리 교체 · 1 AP · 남은 충전은 폐기`);
  }else if(op==='firstaid'){
    const a=s.units.find(a=>a.id===(target?.id??u.id)&&a.team==='player'&&a.hp>0);
    if(!a||dist(u,a)>1)return fail('자신 또는 인접한 의식 있는 아군을 선택하세요.');
    if(!u.supplies.kits)return fail('응급 복구 키트가 없습니다.');
    if(a.hp===a.maxHp)return fail('이미 무결성이 최대입니다.');
    u.supplies.kits--;u.ap--;a.hp=Math.min(a.maxHp,a.hp+3);note(s,`${u.name} 응급 키트 사용 · ${a.name} HP 3 복구`);
  }else if(op==='watch'){if(!Object.hasOwn(WATCH_SIDES,target?.direction))return fail('좌·정면·우·후면 중 경계 방향을 선택하세요.');if(!u.supplies.charge)return fail('경계 사격에 필요한 충전이 없습니다.');if(u.watch||u.watchFiredTurn===s.turn)return fail('이번 턴의 경계는 이미 준비했거나 사격을 마쳤습니다.');u.watchFacing=watchFacing(u,target.direction);u.facing=u.watchFacing;u.watchSide=target.direction;u.watch=true;u.ap--;note(s,`${targetName(s,u)} ${WATCH_SIDES[target.direction]} 경계 준비 · 1 AP · 자동 사격 1회`);
  }else if(op==='hack'){
    if(s.faction==='ai'){
      const n=s.defense?.nodes.filter(n=>dist(u,n)<=1&&n.breach>0&&n.lastPurge!==s.turn).sort((a,b)=>b.breach-a.breach)[0];
      if(!n)return fail('침투가 진행된 중계소에 인접하세요. 중계소마다 턴당 1회 복구 가능합니다.');
      n.breach--;n.lastPurge=s.turn;u.ap--;note(s,`${n.name} 침투 제거 · ${n.breach}/3`);return {ok:true,effects};
    }if(s.carrier)return fail('메모리를 이미 확보했습니다.');if(dist(u,s.terminal)>1)return fail('메모리 노드에 인접해야 합니다.');u.ap--;s.carrier=u.id;note(s,`${targetName(s,u)} 메모리 확보 · 서쪽 진입 구역으로 복귀하세요.`);
  }else return fail('알 수 없는 명령입니다.');
  if(special)u.cooldown=3;for(const id of aliveBefore){const a=s.units.find(a=>a.id===id);if(a.hp===0&&a.downed)effects.push({type:'downed',id,x:a.x,z:a.z});}outcome(s);return {ok:true,effects};
}
function moveEnemy(s,e,route,effects){
   const from={x:e.x,z:e.z},path=[];
   for(const cell of route){
    e.facing=facingToward(e,cell);Object.assign(e,cell);path.push(cell);
    for(const guard of s.units.filter(u=>u.team==='player'&&u.hp>0&&u.watch&&u.supplies.charge>0)){
     if(!inWatchArc(guard,e)||dist(guard,e)>ROLES[guard.role].range+loadoutStats(s.agents?.[guard.role]).range||!lineOfSight(s,guard,e))continue;
     guard.facing=facingToward(guard,e);guard.supplies.charge--;guard.watch=false;guard.watchFiredTurn=s.turn;const hit=random(s)*100<chance(s,guard,e)-10;
     if(hit)hurt(s,e,loadoutStats(s.agents?.[guard.role]).damage);
     effects.push({type:'shot',from:{...guard},to:{...e},hit});note(s,`${guard.name} 경계 사격 ${hit?'명중':'빗나감'}`);if(e.hp<=0)break;
    }
    if(e.hp<=0)break;
   }
   const previous=effects.findLast(f=>f.type==='move'&&f.id===e.id);
   if(previous)previous.path.push(...path);else effects.push({type:'move',id:e.id,from,path});
}
function defenseEnemy(s,e,effects){
 e.ap=2;
 for(let action=0;action<2&&e.hp>0&&s.status==='active';action++){
  const choice=defenseDecision(s,e,{dist,pathTo,lineOfSight,chance});if(!choice)break;e.ap--;
  if(choice.kind==='breach'){
   const n=choice.node;n.breach++;n.lastBreach=s.turn;note(s,`${n.name} 침투 진행 ${n.breach}/3 · 인접 후 노드 복구로 차단`);outcome(s);
  }else if(choice.kind==='shoot'){
   if(!e.supplies.charge){if(e.supplies.batteries){e.supplies.batteries--;e.supplies.charge=6;note(s,`${targetName(s,e)} 배터리 교체`);}continue;}
   e.supplies.charge--;
   const target=choice.target;e.facing=facingToward(e,target);const revealed=directlyVisible(s,e);if(revealed)e.observedLaser=true;
   const hit=random(s)*100<chance(s,e,target);if(hit)hurt(s,target,3);
   effects.push({type:'shot',from:{...e},to:{...target},hit,visibleToPlayer:revealed});note(s,`${targetName(s,e)} → ${target.name} ${hit?'피해 3':'빗나감'}`);outcome(s);
  }else{
   moveEnemy(s,e,choice.path,effects);
  }
 }
}
export function enemyTurn(s){
  if(s.phase!=='player'||s.status!=='active')return [];
  s.phase='enemy';const round=s.turn,effects=[],aliveBefore=s.units.filter(a=>a.hp>0).map(a=>a.id);
  for(const e of s.units.filter(u=>u.team==='enemy'&&u.hp>0)){
    if(e.jammed){e.jammed--;note(s,`${targetName(s,e)} 명령 실행 실패`);continue;}
    if(s.defense){defenseEnemy(s,e,effects);outcome(s);if(s.status!=='active')break;continue;}
    let targets=s.units.filter(u=>u.team==='player'&&u.hp>0).sort((a,b)=>dist(e,a)-dist(e,b));if(!targets.length)break;
    let target=targets.find(a=>dist(e,a)<=7&&lineOfSight(s,e,a));
    if(!target){
      const choices=[];for(let z=0;z<SIZE.h;z++)for(let x=0;x<SIZE.w;x++){const p=pathTo(s,e,x,z);if(p?.length&&p.length<=4)choices.push({x,z,p,score:dist({x,z},targets[0])});}
      choices.sort((a,b)=>a.score-b.score);if(choices[0])moveEnemy(s,e,choices[0].p,effects);
      target=targets.find(a=>a.hp>0&&dist(e,a)<=7&&lineOfSight(s,e,a));
    }
    if(target&&e.hp>0&&!e.supplies.charge){if(e.supplies.batteries){e.supplies.batteries--;e.supplies.charge=6;note(s,`${targetName(s,e)} 배터리 교체`);}continue;}
    if(target&&e.hp>0){e.facing=facingToward(e,target);e.supplies.charge--;const revealed=directlyVisible(s,e);if(revealed)e.observedLaser=true;const hit=random(s)*100<chance(s,e,target);if(hit)hurt(s,target,3);effects.push({type:'shot',from:{...e},to:{...target},hit,visibleToPlayer:revealed});note(s,`${targetName(s,e)} → ${target.name} ${hit?'피해 3':'빗나감'}`);}
    outcome(s);if(s.status!=='active')break;
  }
  if(s.status==='active'){s.turn++;for(const u of s.units.filter(a=>a.team==='player'&&a.hp>0)){u.ap=2;u.cooldown=Math.max(0,u.cooldown-1);if(u.watch)u.facing=u.watchFacing??u.facing;u.watch=false;}note(s,`턴 ${s.turn} · 분대 행동 시작`);}
  for(const id of aliveBefore){const a=s.units.find(a=>a.id===id);if(a.hp===0)effects.push({type:'downed',id,x:a.x,z:a.z});}for(const a of s.units){if(a.downed&&a.downed.at<round){a.downed.remaining--;if(a.downed.remaining===0){delete a.downed;effects.push({type:'dissolve',id:a.id,x:a.x,z:a.z});note(s,`${targetName(s,a)} 복구 기한 초과 · 데이터 소멸`);}}}s.phase='player';outcome(s);return effects;
}
function validateLegacySave(data){
  if(!data||data.format!=='null-sector-save'||data.version!==1)throw Error('지원하지 않는 세이브 형식입니다.');
  const s=structuredClone(data.state);
  const num=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  if(!s||!['human','ai'].includes(s.faction)||!['active','won','lost'].includes(s.status)||s.phase!=='player'||!num(s.turn,1,10000)||!num(s.seed,0,4294967295)||!num(s.scanUntil,0,10001)||!num(s.xp,0,100000))throw Error('손상된 전투 상태입니다.');
  if(!Array.isArray(s.roster)||s.roster.length!==4||new Set(s.roster).size!==4||s.roster.some(r=>!num(r,0,6)))throw Error('편성 정보가 올바르지 않습니다.');
  if(!Array.isArray(s.units)||![8,12].includes(s.units.length)||!Array.isArray(s.cover)||s.cover.length>50)throw Error('유닛 정보가 올바르지 않습니다.');
  if(!s.agents)s.agents=makeAgents();
  if(!Array.isArray(s.agents)||s.agents.length!==7||s.agents.some((a,role)=>!a||!num(a.xp,0,100000)||!WEAPONS.some(w=>w.id===a.weapon&&canEquip(w,role,levelOf(a)))||!MODULES.some(m=>m.id===a.module)))throw Error('요원 레벨 또는 장비 정보가 올바르지 않습니다.');
  if(s.mapVersion===undefined)s.mapVersion=1;
  if(![1,2].includes(s.mapVersion))throw Error('지원하지 않는 전장 버전입니다.');
  const encounterVersion=s.encounterVersion??1;
  if(![1,2].includes(encounterVersion)||s.units.length!==(encounterVersion===1?8:12))throw Error('교전 병력 정보가 올바르지 않습니다.');
  const base=newGame(s.faction,s.roster,s.agents,encounterVersion);
  if(s.mapVersion===1&&s.faction==='ai')base.cover=newGame('human',s.roster).cover;
  for(let i=0;i<s.units.length;i++){const u=s.units[i],b=base.units[i];if(!u||u.id!==b.id||u.team!==b.team||u.role!==b.role||u.name!==b.name||u.maxHp!==b.maxHp||!num(u.hp,0,b.maxHp)||!num(u.ap,0,2)||!num(u.cooldown,0,3)||!num(u.jammed,0,1)||typeof u.watch!=='boolean'||!num(u.x,0,13)||!num(u.z,0,11))throw Error('유닛 상태가 손상되었습니다.');}
  if(s.cover.length!==base.cover.length||s.cover.some((c,i)=>{const b=base.cover[i];return !c||c.id!==b.id||c.x!==b.x||c.z!==b.z||c.h!==b.h||!num(c.hp,0,b.hp);}))throw Error('전장 정보가 손상되었습니다.');
  for(const u of s.units)if(u.downed&&(u.hp!==0||u.ap!==0||!num(u.downed.remaining,1,3)||!num(u.downed.at,1,s.turn)))throw Error('복구 대기 정보가 손상되었습니다.');
  for(const u of s.units)if(u.observedLaser!==undefined&&(u.team!=='enemy'||typeof u.observedLaser!=='boolean'))throw Error('관찰 기록이 손상되었습니다.');
  for(const u of s.units)if(u.watchFiredTurn!==undefined&&(u.team!=='player'||!num(u.watchFiredTurn,1,s.turn)))throw Error('경계 기록이 손상되었습니다.');
  if(s.turnLimit!==undefined&&!num(s.turnLimit,1,40))throw Error('턴 제한이 손상되었습니다.');
  if(s.defense){const base=createDefense();if(s.faction!=='ai'||s.defense.version!==1||!Array.isArray(s.defense.nodes)||s.defense.nodes.length!==2||s.defense.nodes.some((n,i)=>!n||['id','name','x','z'].some(k=>n[k]!==base.nodes[i][k])||!num(n.breach,0,3)||!num(n.lastBreach,0,s.turn)||!num(n.lastPurge,0,s.turn)))throw Error('방어 목표 정보가 손상되었습니다.');}
  if(s.suppliesVersion===undefined){s.suppliesVersion=1;for(const u of s.units)u.supplies=initialSupplies(u,s.agents);}
  if(s.suppliesVersion!==1||s.units.some(u=>!u.supplies||!num(u.supplies.charge,0,unitCapacity(s,u))||!num(u.supplies.batteries,0,2)||!num(u.supplies.kits,0,u.team==='player'?1:0)))throw Error('소모품 정보가 손상되었습니다.');
  for(const u of s.units){
   if(u.facing===undefined)u.facing=u.team==='player'?1:3;
   if(!num(u.facing,0,3)||u.watchFacing!==undefined&&!num(u.watchFacing,0,3)||u.watchSide!==undefined&&!Object.hasOwn(WATCH_SIDES,u.watchSide))throw Error('경계 방향이 손상되었습니다.');
  }
  const occupied=new Set();for(const u of s.units.filter(u=>u.hp>0||u.downed)){const k=`${u.x},${u.z}`;if(occupied.has(k)||s.cover.some(c=>c.hp>0&&c.x===u.x&&c.z===u.z))throw Error('유닛 위치가 겹칩니다.');occupied.add(k);}
  if(!s.units.some(u=>u.id===s.selected&&u.team==='player')||(s.carrier!==null&&!s.units.some(u=>u.id===s.carrier&&u.team==='player'))||s.terminal?.x!==12||s.terminal?.z!==2)throw Error('목표 정보가 손상되었습니다.');
  if(!Array.isArray(s.log)||s.log.length>30||s.log.some(l=>typeof l!=='string'||l.length>300))throw Error('기록이 손상되었습니다.');
  return structuredClone(s);
}
export function validateSave(data){
 if(data?.format!=='null-sector-save')throw Error('지원하지 않는 세이브 형식입니다.');
 if(data.version===1)return validateLegacySave(data);
 if(data.version!==2)throw Error('지원하지 않는 세이브 버전입니다.');
 return validateLegacySave({format:'null-sector-save',version:1,state:decodeProgress(data,newGame)});
}
export function packSave(state){
 const normalized=validateLegacySave({format:'null-sector-save',version:1,state});
 return encodeProgress(normalized,newGame);
}
