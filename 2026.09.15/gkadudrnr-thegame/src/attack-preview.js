import {act,ROLES,chance,dist,inside,visible,targetName} from './rules.js';
import {loadoutStats} from './operation.js';
export function attackPreview(state,kind,target){
 const u=state.units.find(x=>x.id===state.selected),op=kind==='skill'?ROLES[u.role].skill:kind;
 if(!['shoot','snipe','blast','drone','jam'].includes(op))return null;
 const trial=act(structuredClone(state),kind,target); // Reuse exact action validation, never consume live RNG or AP.
 const area=['blast','drone'].includes(op),enemy=state.units.find(e=>e.id===target?.id);
 const cells=area?Array.from({length:5},(_,i)=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]][i]).map(([dx,dz])=>({x:target.x+dx,z:target.z+dz})).filter(c=>inside(c.x,c.z)):[];
 return {valid:trial.ok,error:trial.error,op,area,cells,
  name:area?'데이터 폭발 지점':enemy?targetName(state,enemy):'표적 없음',
  probability:!trial.ok?null:area||op==='jam'?100:Math.min(100,chance(state,u,enemy,op!=='snipe')+(op==='snipe'?15:0)),
  damage:area?4:op==='snipe'?6:op==='jam'?0:loadoutStats(state.agents?.[u.role]).damage,
  criticalChance:op==='snipe'?25:0,criticalDamage:op==='snipe'?12:0,
  batteryCost:['shoot','snipe'].includes(op)?1:0,
  cost:1,
  allies:area?state.units.filter(e=>e.team==='player'&&e.hp>0&&dist(e,target)<=1).map(e=>e.name):[],
  contacts:area?state.units.filter(e=>e.team==='enemy'&&e.hp>0&&visible(state,e)&&dist(e,target)<=1).length:0,
 };
}
