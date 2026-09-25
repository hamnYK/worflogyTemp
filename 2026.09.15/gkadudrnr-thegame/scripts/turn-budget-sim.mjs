// Uses the production rules, seeded random rolls, visible contacts only.
// This is a heuristic bot benchmark, not a prediction of human win rates.
import {writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('output',{recursive:true});
import {newGame,act,enemyTurn,ROLES,dist,pathTo,lineOfSight,visible,chance} from '../src/rules.js';
import {MISSIONS,loadoutStats} from '../src/operation.js';
const samples=Number(process.env.SIM_SAMPLES||100), cap=24, results=[];
function move(s,u,goal,dash=false){
 const paths=[];
 for(const g of goal){const p=pathTo(s,u,g.x,g.z);if(p?.length)paths.push(p);}
 paths.sort((a,b)=>a.length-b.length);const p=paths[0];if(!p)return false;
 const end=p[Math.min(p.length,dash?8:4)-1];return act(s,dash?'skill':'move',end).ok;
}
function step(s,u,style){
 if(u.supplies){s.selected=u.id;if(u.hp<=u.maxHp-3&&u.supplies.kits&&act(s,'firstaid').ok)return true;if(!u.supplies.charge&&u.supplies.batteries&&act(s,'reload').ok)return true;}
 s.selected=u.id;
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
 if(ready&&skill==='snipe'&&u.ap>=1){for(const e of foes.filter(e=>dist(u,e)<=12&&lineOfSight(s,u,e)).sort((a,b)=>a.hp-b.hp))if(act(s,'skill',e).ok)return true;}
 if(ready&&skill==='jam'&&shots[0]&&!shots[0].jammed&&shots[0].hp>stats.damage&&act(s,'skill',shots[0]).ok)return true;
 if(shots.length&&act(s,'shoot',shots[0]).ok)return true;
 if(ready&&skill==='scan'&&!foes.length&&act(s,'skill').ok)return true;
 if(s.faction==='ai'&&style==='hold')return false;
 const goals=s.faction==='human'?[{x:11,z:2},{x:12,z:3},{x:12,z:1},{x:13,z:2}]:foes.flatMap(e=>[{x:e.x-2,z:e.z},{x:e.x,z:e.z-2}]);
 return move(s,u,goals,ready&&skill==='dash');
}
for(const faction of ['human','ai'])for(const budget of faction==='human'?[cap]:[6,8,10])for(const style of faction==='human'?['combat','objective']:['hold','advance']){
 const roster=style==='combat'?[2,3,4,5]:MISSIONS[faction].recommended;
 for(let i=0;i<samples;i++){
  const s=newGame(faction,roster);s.seed=(82613+Math.imul(i,2654435761))>>>0;
  // Future configurable limits are overridden for measurement only.
  s.turnLimit=budget;
  let lastTurn=1,shots=0;
  while(s.status==='active'&&s.turn<=cap){
   lastTurn=s.turn;
   for(const u of s.units.filter(u=>u.team==='player'&&u.hp>0)){
    // Ready a reaction before a normal shot when it leaves enough AP to fire.
    if(style==='hold'&&u.role!==3&&u.ap===2&&s.units.some(e=>e.team==='enemy'&&e.hp>0&&visible(s,e)&&dist(u,e)<=ROLES[u.role].range&&lineOfSight(s,u,e))){s.selected=u.id;act(s,'watch',{direction:'front'});}
    for(let j=0;j<4&&u.ap>0&&s.status==='active';j++)if(!step(s,u,style))break;
    if(s.status==='active'){s.selected=u.id;act(s,'watch',{direction:'front'});}
   }
   if(s.status==='active'){const effects=enemyTurn(s);shots+=effects.filter(e=>e.type==='shot'&&e.from.team==='player').length;}
  }
  results.push({faction,style,budget,seed:i,status:s.status,turn:lastTurn,alive:s.units.filter(u=>u.team==='player'&&u.hp>0).length,reactions:shots});
 }
 console.log('Completed',faction,style,budget,samples);
}
const summaries=[];
for(const key of [...new Set(results.map(r=>r.faction+':'+r.style+':'+r.budget))]){
 const rows=results.filter(r=>r.faction+':'+r.style+':'+r.budget===key),wins=rows.filter(r=>r.status==='won'),turns=wins.map(r=>r.turn).sort((a,b)=>a-b);
 summaries.push({policy:key,runs:rows.length,wins:wins.length,losses:rows.filter(r=>r.status==='lost').length,unfinished:rows.filter(r=>r.status==='active').length,median:turns[Math.floor((turns.length-1)*.5)]??null,p90:turns[Math.ceil(turns.length*.9)-1]??null,limits:Object.fromEntries([6,8,10,12,14,16,20,24].map(n=>[n,wins.filter(r=>r.turn<=n).length])),averageReactions:rows.reduce((n,r)=>n+r.reactions,0)/rows.length});
}
writeFileSync('output/turn-budget-simulation.json',JSON.stringify({samples,cap,limitations:['Heuristic policies, not optimal play or human win rates','Current fixed maps and level-one standard loadouts only','AI mission still uses its production survival objective'],summaries,results},null,2));
console.table(summaries.map(({limits,...r})=>r));console.log(JSON.stringify(summaries,null,2));
