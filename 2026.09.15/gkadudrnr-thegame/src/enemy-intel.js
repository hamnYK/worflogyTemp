import {directlyVisible,ROLES} from './rules.js';
import {unitStatus} from './unit-status.js';
export function enemyIntel(state,enemy){
 if(!directlyVisible(state,enemy))return {stage:'탐지',name:'미확인 신호',type:'병과 미확인',status:'상태 미확인',ability:'능력 미확인'};
 const status=unitStatus(enemy),specialist=state.encounterVersion===2&&Number(enemy.id.slice(1))<4;
 return {stage:enemy.observedLaser?'교전 관찰':'목격',name:enemy.name,type:specialist?ROLES[enemy.role].name:'일반 전투병',status:`${status.percent}% · ${status.label}`,ability:enemy.observedLaser?'관찰: 레이저 사격':'능력 미확인'};
}
