import {PEBBLE} from './pebble-physics.mjs';
export const LAND={width:1000,height:640,cols:200,rows:128,cell:5,maxDistance:PEBBLE.maxRange};
const copy=p=>({x:p.x,y:p.y});
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function insidePolygon(p,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export class PebbleTerritory{
 constructor({first=0}={}){
  this.land=new Uint8Array(LAND.cols*LAND.rows);this.turn=first;this.phase='ready';this.winner=null;this.revision=0;this.turns=0;this.turnLimit=10;this.turnsUsed=[0,0];this.finishReason=null;
  for(let i=0;i<this.land.length;i++){const p=this.center(i);if(distance(p,{x:220,y:320})<76)this.land[i]=1;else if(distance(p,{x:780,y:320})<76)this.land[i]=2;}
  this.beginTurn();
 }
 index(p){return Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&p.x>=0&&p.x<LAND.width&&p.y>=0&&p.y<LAND.height?Math.floor(p.y/5)*LAND.cols+Math.floor(p.x/5):-1;}
 center(i){return{x:(i%LAND.cols+.5)*5,y:(Math.floor(i/LAND.cols)+.5)*5};}
 owner(p){const i=this.index(p);return i<0?-1:this.land[i];}
 get areas(){const totals=[0,0];for(const owner of this.land)if(owner)totals[owner-1]+=25;return totals;}
 get shares(){const a=this.areas;return a.map(n=>n/(LAND.width*LAND.height)*100);}
 home(player=this.turn){const cells=[];let x=0,y=0;for(let i=0;i<this.land.length;i++)if(this.land[i]===player+1){cells.push(i);const p=this.center(i);x+=p.x;y+=p.y;}if(!cells.length)return null;const mean={x:x/cells.length,y:y/cells.length};return this.center(cells.reduce((a,b)=>distance(this.center(a),mean)<distance(this.center(b),mean)?a:b));}
 beginTurn(){this.shots=0;this.path=[];this.stone=this.home();if(!this.stone){this.phase='finished';this.winner=1-this.turn;return;}this.path=[copy(this.stone)];}
 place(p){if(this.phase!=='ready'||this.shots||this.owner(p)!==this.turn+1)return false;this.stone=copy(p);this.path=[copy(p)];return true;}
 endTurn(){
  this.turns++;this.turnsUsed[this.turn]++;
  if(this.phase==='finished'){this.finishReason='elimination';return;}
  if(this.turnsUsed.every(n=>n>=this.turnLimit)){
   const [you,rival]=this.areas;this.phase='finished';this.winner=you===rival?-1:you>rival?0:1;this.finishReason='turn-limit';return;
  }
  this.turn=1-this.turn;this.beginTurn();
 }
 pass(){if(this.phase!=='ready')return false;this.endTurn();return true;}
 // Close an excursion through existing home cells, never by a shortcut across rival land.
 closure(path,player=this.turn){
  const start=this.index(path[0]),end=this.index(path.at(-1));if(start<0||end<0||this.land[start]!==player+1||this.land[end]!==player+1)return null;
  const prev=new Int32Array(this.land.length).fill(-1),queue=new Int32Array(this.land.length);let head=0,tail=1;queue[0]=end;prev[end]=end;
  while(head<tail&&prev[start]<0){const i=queue[head++],x=i%LAND.cols;for(const n of [x?i-1:-1,x<LAND.cols-1?i+1:-1,i-LAND.cols,i+LAND.cols])if(n>=0&&n<this.land.length&&prev[n]<0&&this.land[n]===player+1){prev[n]=i;queue[tail++]=n;}}
  if(prev[start]<0)return null;
  const route=[];for(let i=start;i!==end;i=prev[i])route.push(this.center(i));route.push(this.center(end));route.reverse();
  return [...path,...route];
 }
 enclosed(polygon){const cells=[];if(!polygon)return cells;const xs=polygon.map(p=>p.x),ys=polygon.map(p=>p.y),x0=Math.max(0,Math.floor(Math.min(...xs)/5)),x1=Math.min(199,Math.floor(Math.max(...xs)/5)),y0=Math.max(0,Math.floor(Math.min(...ys)/5)),y1=Math.min(127,Math.floor(Math.max(...ys)/5));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*200+x;if(insidePolygon(this.center(i),polygon))cells.push(i);}return cells;
 }
 shoot(target,trace=null){
  if(this.phase!=='ready'||!Number.isFinite(target?.x)||!Number.isFinite(target?.y))return{ok:false,reason:'distance'};
  if(trace){if(trace.length<2||trace.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))||distance(trace[0],this.stone)>.01||distance(trace.at(-1),target)>.01)return{ok:false,reason:'trace'};}
  else if(distance(this.stone,target)<2||distance(this.stone,target)>LAND.maxDistance+.001)return{ok:false,reason:'distance'};
  const player=this.turn;this.shots++;this.stone=copy(target);this.path.push(...(trace?trace.slice(1).map(copy):[copy(target)]));let reason='',gained=0,stolen=0;
  const owner=this.owner(target);
  if(owner===-1)reason='outside';
  else if(owner===2-player)reason='rival';
  else if(owner===player+1){
   const polygon=this.closure(this.path),cells=this.enclosed(polygon);
   for(const i of cells)if(this.land[i]!==player+1){if(this.land[i])stolen+=25;this.land[i]=player+1;gained+=25;}
   reason=gained?'captured':'empty';if(gained)this.revision++;
   if(this.areas[1-player]===0){this.phase='finished';this.winner=player;}
  }else if(this.shots===3)reason='missed-home';
  if(reason){const trace=this.path.map(copy);this.endTurn();return{ok:true,player,reason,gained,stolen,trace,ended:true};}
  return{ok:true,player,reason:'continue',ended:false};
 }
 planAI(random=Math.random){
  const owned=[];for(let i=0;i<this.land.length;i++)if(this.land[i]===this.turn+1)owned.push(i);
  let best=null,score=-Infinity;
  for(let trial=0;trial<220;trial++){
   const start=this.center(owned[Math.min(owned.length-1,Math.floor(random()*owned.length))]);
   const local=()=>({x:Math.max(12,Math.min(988,start.x+(random()-.5)*LAND.maxDistance*1.8)),y:Math.max(12,Math.min(628,start.y+(random()-.5)*LAND.maxDistance*1.8))});
   const a=local(),b=local();
   const end=trial%3===0?this.center(owned[Math.min(owned.length-1,Math.floor(random()*owned.length))]):start;
   const targets=trial%3===0?[end]:trial%3===1?[a,end]:[a,b,end],path=[start,...targets];
   if(targets.some((p,i)=>distance(path[i],p)<2||distance(path[i],p)>LAND.maxDistance||this.owner(p)===2-this.turn||(i<targets.length-1&&this.owner(p)===this.turn+1)))continue;
   const cells=this.enclosed(this.closure(path));let value=0;for(const i of cells)if(this.land[i]!==this.turn+1)value+=this.land[i]?4:1;
   if(value>score){score=value;best={start,targets};}
  }
  return best||{start:this.home(),targets:[copy(this.home())]};
 }
}
