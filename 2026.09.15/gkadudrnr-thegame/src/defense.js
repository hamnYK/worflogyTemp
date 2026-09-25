// Defense-only objective and decision policy. Rules inject visibility/path helpers.
export const createDefense=()=>({version:1,nodes:[{id:'north',name:'북부 중계소',x:2,z:3,breach:0,lastBreach:0,lastPurge:0},{id:'south',name:'남부 중계소',x:2,z:8,breach:0,lastBreach:0,lastPurge:0}]});
export function defenseDecision(s,e,{dist,pathTo,lineOfSight,chance}){
 const contacts=s.units.filter(u=>u.team==='player'&&u.hp>0&&dist(e,u)<=8&&lineOfSight(s,e,u));
 const targets=contacts.filter(u=>(e.supplies.charge>0||e.supplies.batteries>0)&&dist(e,u)<=7).sort((a,b)=>(chance(s,e,b)+(b.hp<=3?35:0))-(chance(s,e,a)+(a.hp<=3?35:0)));
 const preferred=Number(e.id.slice(1))%2,ordered=[s.defense.nodes[preferred],s.defense.nodes[1-preferred]];
 const at=ordered.find(n=>dist(e,n)<=1&&n.lastBreach!==s.turn);
 if(at)return {kind:'breach',node:at};
 const rusher=[0,1,4,7].includes(Number(e.id.slice(1)));
 if(!rusher&&targets[0]&&chance(s,e,targets[0])>=65)return {kind:'shoot',target:targets[0]};
 const choices=[];
 for(const n of ordered)for(const [dx,dz]of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
  const p=pathTo(s,e,n.x+dx,n.z+dz);if(!p?.length)continue;
  const path=p.slice(0,4),end=path.at(-1),threats=contacts.filter(t=>dist(end,t)<=7&&lineOfSight(s,t,end));
  const exposure=threats.reduce((v,t)=>v+chance(s,t,end)/100,0);
  const shot=contacts.filter(t=>dist(end,t)<=7&&lineOfSight(s,end,t)).reduce((v,t)=>Math.max(v,chance(s,end,t)),0);
  choices.push({kind:'move',path,score:p.length+(n===ordered[0]?0:3)+exposure*(rusher?.5:2)-shot*(rusher?0:.04)});
 }
 choices.sort((a,b)=>a.score-b.score);
 if(targets[0]&&(!choices.length||e.ap===1&&!rusher))return {kind:'shoot',target:targets[0]};
 return choices[0]??(targets[0]?{kind:'shoot',target:targets[0]}:null);
}
