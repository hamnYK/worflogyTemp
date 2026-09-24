const EPS=1e-7;
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const key=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
function onSegment(a,b,p){return Math.abs(cross(a,b,p))<EPS&&p.x>=Math.min(a.x,b.x)-EPS&&p.x<=Math.max(a.x,b.x)+EPS&&p.y>=Math.min(a.y,b.y)-EPS&&p.y<=Math.max(a.y,b.y)+EPS;}
function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return (x*y<0&&z*w<0)||onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);}
function inside(a,b,c,p){const signs=[cross(a,b,p),cross(b,c,p),cross(c,a,p)];return signs.every(v=>v>EPS)||signs.every(v=>v<-EPS);}
function distanceToSegment(a,b,p){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}

export function createPoints(random=Math.random){
 const points=[];
 for(let n=0;n<21;n++){
  let best=null,bestDistance=-1;
  // Random candidates spread dots across the paper without a fixed grid.
  // Offsets also keep deterministic random sources from repeating one point.
  for(let tries=0;tries<64;tries++){
   const p={x:80+840*((random()+tries*.61803398875)%1),y:65+510*((random()+tries*.41421356237)%1)};
   if(points.some((a,i)=>points.slice(i+1).some(b=>Math.abs(cross(a,b,p))<1)))continue;
   const distance=points.reduce((min,a)=>Math.min(min,Math.hypot(p.x-a.x,p.y-a.y)),Infinity);
   if(distance>bestDistance){best=p;bestDistance=distance;}
  }
  points.push(best);
 }
 return points;
}

export class TriangleTerritory{
 constructor({points=createPoints(),first=0,clearance=0}={}){
  this.clearance=clearance;this.history=[];this.areas=[0,0];
  this.points=points.map(p=>({...p}));this.turn=first;this.edges=[];this.edgeKeys=new Set();this.triangles=[];this.claimed=new Set();this.scores=[0,0];this.phase='playing';
 }
 area(ids){return Math.abs(cross(...ids.map(i=>this.points[i])))/2;}
 get shares(){const total=this.areas[0]+this.areas[1];if(!total)return [0,0];const you=Math.round(this.areas[0]/total*1000)/10;return [you,Math.round((100-you)*10)/10];}
 get winner(){if(this.phase!=='finished')return null;const delta=this.areas[0]-this.areas[1];return Math.abs(delta)<=EPS?-1:delta>0?0:1;}
 has(a,b){return this.edgeKeys.has(key(a,b));}
 invalid(a,b){
  if(this.phase!=='playing')return 'finished';
  if(!Number.isInteger(a)||!Number.isInteger(b)||!this.points[a]||!this.points[b]||a===b)return 'point';
  if(this.has(a,b))return 'duplicate';
  const p=this.points[a],q=this.points[b];
  if(this.points.some((r,i)=>i!==a&&i!==b&&onSegment(p,q,r)))return 'through-point';
  if(this.clearance>0&&this.points.some((r,i)=>i!==a&&i!==b&&distanceToSegment(p,q,r)<this.clearance))return 'near-point';
  for(const [c,d] of this.edges){
   if([c,d].includes(a)||[c,d].includes(b))continue;
   if(intersects(p,q,this.points[c],this.points[d]))return 'crossing';
  }
  return null;
 }
 empty(a,b,c){const p=this.points[a],q=this.points[b],r=this.points[c];return Math.abs(cross(p,q,r))>EPS&&!this.points.some((s,i)=>i!==a&&i!==b&&i!==c&&(inside(p,q,r,s)||onSegment(p,q,s)||onSegment(q,r,s)||onSegment(r,p,s)));}
 completed(a,b){return this.points.flatMap((_,c)=>c!==a&&c!==b&&this.has(a,c)&&this.has(b,c)&&this.empty(a,b,c)?[[a,b,c].sort((x,y)=>x-y)]:[]).filter(ids=>!this.claimed.has(ids.join(':')));}
 legalMoves(){const moves=[];for(let a=0;a<this.points.length;a++)for(let b=a+1;b<this.points.length;b++)if(!this.invalid(a,b))moves.push([a,b]);return moves;}
 play(a,b){
  const reason=this.invalid(a,b);if(reason)return {ok:false,reason};
  const player=this.turn;this.edges.push([a,b]);this.edgeKeys.add(key(a,b));const captured=this.completed(a,b);
  for(const ids of captured){this.claimed.add(ids.join(':'));this.triangles.push({ids,owner:player});this.scores[player]++;this.areas[player]+=this.area(ids);}
  this.history.push({edge:[a,b],player,triangles:captured.map(ids=>[...ids])});
  if(!captured.length)this.turn=1-player;
  if(!this.legalMoves().length)this.phase='finished';
  return {ok:true,player,captured:captured.length,finished:this.phase==='finished'};
 }
 chooseMove(random=Math.random){
  const moves=this.legalMoves();let best=-Infinity,choices=[];
  for(const [a,b] of moves){
   const gain=this.completed(a,b).reduce((sum,ids)=>sum+this.area(ids),0);let gifts=0;
   for(let c=0;c<this.points.length;c++)if(c!==a&&c!==b&&this.has(a,c)!==this.has(b,c)&&this.empty(a,b,c)){
    if(!this.invalid(this.has(a,c)?b:a,c))gifts+=this.area([a,b,c]);
   }
   const score=gain>0?gain:-gifts;
   if(score>best){best=score;choices=[[a,b]];}else if(score===best)choices.push([a,b]);
  }
  return choices.length?choices[Math.min(choices.length-1,Math.floor(random()*choices.length))]:null;
 }
}
