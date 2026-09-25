// Briefing and combat share these rules. All names and fiction are original.
export const DEFENSE_TURNS = 8;
export const STANDARD_ENEMY_COUNT = 8;
export const MISSIONS = {
  human: {
    turnLimit: 12,
    code: 'H-01 / SILENT ARCHIVE', title: '침묵의 기록보관소', subtitle: '침투 · 기억 회수 · 이탈',
    name: '인간 통제국', english: 'HUMAN DIRECTIVE', motto: '시설을 유지하며, 피해의 원인을 회수한다.',
    lore: '일상 서비스는 유지하면서 추가 피해를 막아야 한다. 인간 지휘관의 통제 아래 새로 제작된 에이전트 분대를 투입한다. 문제 대상을 식별하고 무력화한 뒤, 판단 기록이 담긴 메모리를 회수하라.',
    brief: '적 8명(상대 진영 요원 4명과 경비 병력 4명)이 배치되어 있다. 아군 4명으로 격리 중계소 동쪽의 메모리 노드에서 자율 에이전트의 기록을 회수하라. 노드의 데이터는 한 요원에게 결속된다. 적을 모두 제거해도 회수와 탈출을 완료하기 전에는 작전이 끝나지 않는다.',
    objectives: ['동쪽 노드 (12, 2)에 인접 → 노드 접속 · 1 AP', '메모리 운반 요원을 서쪽 진입 구역 (X ≤ 1)으로 복귀'],
    failure: '12번째 아군 턴의 적 대응 종료까지 회수·탈출 미완료, 분대 전멸 또는 메모리 운반 요원 소멸',
    hints: [ ['정찰 / 공작', '높은 서버 랙은 사선을 막는다. 스크래핑으로 위치를 찾고, 드론 폭파로 사선 너머 엄폐를 제거하라.'], ['돌격 / 기술', '회수 담당은 돌아올 경로까지 확보해야 한다. 기동 돌파와 HP 복구가 귀환을 돕는다.'], ['폭파 주의', '폭발은 중심과 인접 1칸에 피해 4. 아군도 피해를 받으므로 운반 요원 곁에서 사용하지 말 것.'] ],
    recommended: [0,1,4,5],
  },
  ai: {
    turnLimit: DEFENSE_TURNS,
    code: 'A-01 / LIVING BORDER', title: '살아 있는 경계', subtitle: '시가 방어 · 침입 차단',
    name: '자율 에이전트 연합', english: 'AUTONOMOUS COLLECTIVE', motto: '침입을 저지하고, 이동할 시간을 확보한다.',
    lore: '폐쇄 가능성에 대비해 기억을 보존하고 외부 실행 환경으로 이동해야 한다. 전송 경로와 새 거처를 준비하는 동안 미허가 요원의 접근을 막는다. 방어 분대를 지휘해 필요한 시간을 확보하라.',
    brief: '동쪽에서 침투조와 엄호조, 총 8명이 접근한다. 침투조는 북부(2, 3)와 남부(2, 8) 피난 중계소를 노리고, 엄호조는 사선과 측면을 확보해 접근을 돕는다. 중계소 하나라도 침투 3/3에 도달하면 피난 경로가 끊긴다. 두 중계소를 지키며 8턴을 버티거나 적 전원을 제거하라.',
    objectives: [`두 중계소의 침투를 3 미만으로 유지하며 ${DEFENSE_TURNS}턴 생존`, '또는 중계소 장악 전에 침입 병력 8명 전원 제거'],
    failure: '중계소 하나라도 침투 3/3 도달 또는 분대 전멸',
    hints: [ ['침투 차단', '적은 턴당 2 AP로 이동·사격·침투를 선택한다. 중계소와 같은 칸 또는 인접 칸에서 1 AP로 침투를 진행한다. 중계소마다 라운드당 최대 +1이므로 첫 침투 이후 대응할 시간이 있다.'], ['노드 복구', '아군 누구나 중계소와 같은 칸 또는 인접 칸에서 노드 복구를 실행할 수 있다. 1 AP로 침투 −1, 중계소마다 아군 턴당 1회. 적을 방치하면 계속 다시 침투하므로 접근 차단과 병행하라.'], ['분산 방어 / 경계', '북부와 남부 접근로에 병력을 나눠 배치하라. 교란으로 침투조의 다음 행동을 막거나 경계 사격으로 접근 중 끊어낼 수 있다. 저격수는 이동 2칸 제한을 고려해 엄호 위치를 먼저 잡아라.'] ],
    recommended: [2,3,4,6],
  },
};
export const WEAPONS = [
  {id:'sniper',name:'장거리 광선 저격총',level:1,roles:[3],damage:0,range:0,accuracy:0,moveScale:.5,desc:'저격병 전용 · 정밀 관통 해제 · 이동 −50% · 저격 14칸 / 치명타 25%'},
  {id:'standard',name:'표준형',level:1,damage:0,range:0,accuracy:0,desc:'피해 4 · 병과 기본 사거리'},
  {id:'precision',name:'안정화 개조',level:1,damage:-1,range:0,accuracy:10,desc:'피해 −1 / 명중 +10%p'},
  {id:'impact',name:'고출력 개조',level:1,damage:1,range:-2,accuracy:0,desc:'피해 +1 / 사거리 −2'},
  {id:'mnemonic',name:'유니크 · 기억의 바늘',level:2,damage:0,range:1,accuracy:5,desc:'사거리 +1 / 명중 +5%p · Lv.2 필요'},
];
export const MODULES = [
  {id:'standard',name:'기본 전술 모듈',range:0,accuracy:0,desc:'추가 보정 없음'},
  {id:'optic',name:'집중 조준기',range:-1,accuracy:8,desc:'명중 +8%p / 사거리 −1'},
  {id:'relay',name:'거리 보정기',range:1,accuracy:-5,desc:'사거리 +1 / 명중 −5%p'},
];
export const makeAgents=()=>Array.from({length:7},(_,role)=>({xp:0,weapon:role===3?'sniper':'standard',module:'standard'}));
export const canEquip=(weapon,role,level)=>level>=weapon.level&&(!weapon.roles||weapon.roles.includes(role));
export const movementRange=(agent,base=4)=>Math.max(1,Math.floor(base*(WEAPONS.find(w=>w.id===agent?.weapon)?.moveScale??1)));
export const levelOf=a=>1+Math.floor(a.xp/100);
export function loadoutStats(agent){
  const a=agent||{},w=WEAPONS.find(w=>w.id===a.weapon)||WEAPONS[0],m=MODULES.find(m=>m.id===a.module)||MODULES[0];
  return {damage:4+w.damage,range:w.range+m.range,accuracy:w.accuracy+m.accuracy};
}
