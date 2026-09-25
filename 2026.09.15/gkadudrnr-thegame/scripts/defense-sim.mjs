// Uses the production rules, seeded random rolls, visible contacts only.
// This is a heuristic bot benchmark, not a prediction of human win rates.
import {writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('output',{recursive:true});
import {newGame,act,enemyTurn,ROLES,dist,pathTo,lineOfSight,visible,chance} from '../src/rules.js';
import {movementRange,MISSIONS,loadoutStats} from '../src/operation.js';
const samples=Number(process.env.SIM_SAMPLES||100), cap=24, results=[];
function move(s,u,goal,dash=false){
 const paths=[];
 for(const g of goal){const p=pathTo(s,u,g.x,g.z);if(p?.length)paths.push(p);}
 paths.sort((a,b)=>a.length-b.length);const p=paths[0];if(!p)return false;
 const end=p[Math.min(p.length,movementRange(s.agents[u.role],dash?8:4))-1];return act(s,dash?'skill':'move',end).ok;
}
function step(s,u,style){
 if(u.supplies){s.selected=u.id;if(u.hp<=u.maxHp-3&&u.supplies.kits&&act(s,'firstaid').ok)return true;if(!u.supplies.charge&&u.supplies.batteries&&act(s,'reload').ok)return true;}
 s.selected=u.id;if(style==='repair'&&s.defense?.nodes.some(n=>n.breach>0&&n.lastPurge!==s.turn&&dist(u,n)<=1)&&act(s,'hack').ok)return true;
 const foes=s.units.filter(e=>e.team==='enemy'&&e.hp>0&&visible(s,e));
 const allies=s.units.filter(e=>e.team==='player'&&(e.hp>0||e.downed));
 const skill=ROLES[u.role].skill,stats=loadoutStats(s.agents[u.role]);
 const ready=u.cooldown===0;
 if(ready&&skill==='heal'){
  const hurt=allies.filter(a=>dist(u,a)<=4&&(a.downed||a.maxHp-a.hp>=5)).sort((a,b)=>a.hp-b.hp)[0];
  if(hurt&&act(s,'skill',hurt).ok)return true;
 }
 if(s.faction==='human'){
  if(!s.carrier&&dist(u,s.terminal)<=1&&act(s,'hack').ok)return true;
  if(s.carrier===u.id)return move(s,u,Array.from({length:12},(_,z)=>({x:1,z})),ready&&skill==='dash');
  if(style==='objective'&&u.role===1&&!s.carrier){
   if(move(s,u,[{x:11,z:2},{x:12,z:3},{x:12,z:1},{x:13,z:2}],ready))return true;
  }
 }
 if(ready&&['blast','drone'].includes(skill)){
  const candidates=[];
  for(const e of foes)for(const [dx,dz]of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
   const t={x:e.x+dx,z:e.z+dz};
   const score=foes.reduce((n,f)=>n+(dist(t,f)<=1?Math.min(f.hp,4):0),0)-allies.reduce((n,a)=>n+(dist(t,a)<=1?12:0),0);
   if(score>=4)candidates.push({...t,score});
  }
  candidates.sort((a,b)=>b.score-a.score);for(const t of candidates)if(act(s,'skill',t).ok)return true;
 }
 const shots=foes.filter(e=>dist(u,e)<=ROLES[u.role].range+stats.range&&lineOfSight(s,u,e)).sort((a,b)=>(chance(s,u,b)+(b.hp<=stats.damage?35:0))-(chance(s,u,a)+(a.hp<=stats.damage?35:0)));
 if(ready&&skill==='snipe'&&u.ap>=1){for(const e of foes.filter(e=>dist(u,e)<=14&&lineOfSight(s,u,e)).sort((a,b)=>a.hp-b.hp))if(act(s,'skill',e).ok)return true;}
 if(ready&&skill==='jam'&&shots[0]&&!shots[0].jammed&&shots[0].hp>stats.damage&&act(s,'skill',shots[0]).ok)return true;
 if(shots.length&&act(s,'shoot',shots[0]).ok)return true;
 if(ready&&skill==='scan'&&!foes.length&&act(s,'skill').ok)return true;
 if(s.defense&&style==='repair'){
  const threatened=s.defense.nodes.filter(n=>n.breach>0&&n.lastPurge!==s.turn).sort((a,b)=>b.breach-a.breach);
  if(threatened.length)return move(s,u,threatened.flatMap(n=>[{x:n.x,z:n.z},{x:n.x-1,z:n.z},{x:n.x,z:n.z-1}]),ready&&skill==='dash');
 }
 if(s.faction==='ai'&&['hold','repair'].includes(style))return false;
 const goals=s.faction==='human'?[{x:11,z:2},{x:12,z:3},{x:12,z:1},{x:13,z:2}]:foes.flatMap(e=>[{x:e.x-2,z:e.z},{x:e.x,z:e.z-2}]);
 return move(s,u,goals,ready&&skill==='dash');
}

for(const variant of ['legacy-hold','new-hold','new-repair','new-idle']){
 for(let i=0;i<100;i++){
  const s=newGame('ai',MISSIONS.ai.recommended);if(variant.startsWith('legacy'))delete s.defense;
  s.seed=(82613+Math.imul(i,2654435761))>>>0;let last=1;
  while(s.status==='active'&&s.turn<=8){last=s.turn;
   if(variant!=='new-idle')for(const u of s.units.filter(u=>u.team==='player'&&u.hp>0)){
    for(let j=0;j<3&&u.ap>0&&s.status==='active';j++)if(!step(s,u,variant==='new-repair'?'repair':'hold'))break;
    if(s.status==='active'){s.selected=u.id;act(s,'watch',{direction:'front'});}
   }
   if(s.status==='active')enemyTurn(s);
  }
  results.push({variant,seed:i,won:s.status==='won',turn:last,breached:s.defense?.nodes.some(n=>n.breach>=3)??false});
 }
 console.log(variant,'finished');
}
const summary=[...new Set(results.map(r=>r.variant))].map(variant=>{const rows=results.filter(r=>r.variant===variant);return {variant,runs:rows.length,wins:rows.filter(r=>r.won).length,breachLosses:rows.filter(r=>r.breached).length,meanTurns:rows.reduce((v,r)=>v+r.turn,0)/rows.length};});
writeFileSync('output/defense-simulation.json',JSON.stringify({summary,results,limits:'Heuristic bots; same 100 seeds, current sniper equipment, fixed map and recommended roster; not player win rates'},null,2));
console.table(summary);
