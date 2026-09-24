
const key=(a,b)=>a<b?a+':'+b:b+':'+a;

// A regular lattice: only adjacent horizontal or vertical dots may connect.
export class DotsAndBoxes{
 constructor({columns=6,rows=6,first=0}={}){
  if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<2||rows<2||columns>10||rows>10)throw new RangeError('Board dimensions must be between 2 and 10');
  this.columns=columns;this.rows=rows;this.turn=first===1?1:0;
  const step=Math.min(800/(columns-1),500/(rows-1)),left=(1000-step*(columns-1))/2,top=(640-step*(rows-1))/2;
  this.points=Array.from({length:columns*rows},(_,i)=>({x:left+(i%columns)*step,y:top+Math.floor(i/columns)*step}));
  this.edges=[];this.edgeKeys=new Set();this.boxes=[];this.claimed=new Set();this.scores=[0,0];this.history=[];this.phase='playing';
  this.cells=[];
  for(let r=0;r<rows-1;r++)for(let c=0;c<columns-1;c++){const a=r*columns+c;this.cells.push([a,a+1,a+columns+1,a+columns]);}
 }
 get winner(){return this.phase!=='finished'?null:this.scores[0]===this.scores[1]?-1:this.scores[0]>this.scores[1]?0:1;}
 has(a,b){return this.edgeKeys.has(key(a,b));}
 invalid(a,b){
  if(this.phase!=='playing')return 'finished';
  if(!Number.isInteger(a)||!Number.isInteger(b)||!this.points[a]||!this.points[b]||a===b)return 'point';
  if(this.has(a,b))return 'duplicate';
  const dx=Math.abs(a%this.columns-b%this.columns),dy=Math.abs(Math.floor(a/this.columns)-Math.floor(b/this.columns));
  return dx+dy===1?null:'not-adjacent';
 }
 sides(ids){return ids.map((a,i)=>[a,ids[(i+1)%4]]);}
 completed(a,b){
  const candidate=key(a,b);
  return this.cells.filter(ids=>!this.claimed.has(ids[0])&&this.sides(ids).every(([c,d])=>this.has(c,d)||key(c,d)===candidate));
 }
 legalMoves(){
  if(this.phase!=='playing')return [];
  const moves=[];
  for(let a=0;a<this.points.length;a++){
   if(a%this.columns<this.columns-1&&!this.has(a,a+1))moves.push([a,a+1]);
   if(a+this.columns<this.points.length&&!this.has(a,a+this.columns))moves.push([a,a+this.columns]);
  }
  return moves;
 }
 play(a,b){
  const reason=this.invalid(a,b);if(reason)return {ok:false,reason};
  const player=this.turn,captured=this.completed(a,b);
  this.edges.push([a,b]);this.edgeKeys.add(key(a,b));
  for(const ids of captured){this.claimed.add(ids[0]);this.boxes.push({ids:[...ids],owner:player});this.scores[player]++;}
  this.history.push({edge:[a,b],player,boxes:captured.map(ids=>[...ids])});
  if(!captured.length)this.turn=1-player;
  if(this.boxes.length===this.cells.length)this.phase='finished';
  return {ok:true,player,captured:captured.length,finished:this.phase==='finished'};
 }
 chooseMove(random=Math.random){
  const moves=this.legalMoves();let best=-Infinity,choices=[];
  for(const [a,b] of moves){
   const gain=this.completed(a,b).length;
   // When forced to offer a box, prefer the smallest immediate capture chain.
   let gifts=0;
   if(!gain){
    const trial=new DotsAndBoxes({columns:this.columns,rows:this.rows});
    for(const edge of this.edges)trial.play(...edge);
    trial.play(a,b);
    while(trial.phase==='playing'){
     const captures=trial.legalMoves().map(edge=>({edge,n:trial.completed(...edge).length})).filter(m=>m.n).sort((x,y)=>y.n-x.n);
     if(!captures.length)break;
     gifts+=trial.play(...captures[0].edge).captured;
    }
   }
   const score=gain?100+gain:-gifts;
   if(score>best){best=score;choices=[[a,b]];}else if(score===best)choices.push([a,b]);
  }
  return choices.length?choices[Math.max(0,Math.min(choices.length-1,Math.floor(random()*choices.length)))]:null;
 }
}
