import assert from 'node:assert/strict';
import {TriangleTerritory,createPoints} from '../js/triangle-territory-rules.mjs';
const points=[{x:0,y:0},{x:2,y:0},{x:0,y:2},{x:20,y:0},{x:30,y:0},{x:20,y:10},{x:-20,y:0},{x:-18,y:0},{x:-20,y:2}];
const g=new TriangleTerritory({points});
assert.deepEqual(g.shares,[0,0]);assert.equal(g.winner,null);
for(const [ids,owner] of [[[0,1,2],0],[[6,7,8],0],[[3,4,5],1]]){
 const [a,b,c]=ids;assert(g.play(a,b).ok);assert(g.play(b,c).ok);g.turn=owner;
 const result=g.play(a,c);assert.equal(result.captured,1);assert.equal(g.turn,owner);
}
assert.deepEqual(g.scores,[2,1]);assert.deepEqual(g.areas,[4,50]);
g.phase='finished';assert.equal(g.winner,1);assert.deepEqual(g.shares,[7.4,92.6]);
g.areas=[50,50];assert.equal(g.winner,-1);
g.areas=[50.0001,50];assert.deepEqual(g.shares,[50,50]);assert.equal(g.winner,0);
const ai=new TriangleTerritory({points});
for(const [a,b] of [[0,1],[1,2],[3,4],[4,5]])assert(ai.play(a,b).ok);
assert.deepEqual(ai.chooseMove(()=>0),[3,5],'AI prefers larger available capture');
let seed=79;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let i=0;i<20;i++){
 const game=new TriangleTerritory({points:createPoints(random),clearance:i%2?18:0});
 while(game.phase==='playing'){const moves=game.legalMoves();assert(game.play(...moves[Math.floor(random()*moves.length)]).ok);}
 const totals=[0,0];
 for(const {ids,owner} of game.triangles){
  const [a,b,c]=ids.map(id=>game.points[id]);
  totals[owner]+=Math.abs(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y))/2;
 }
 totals.forEach((total,owner)=>assert(Math.abs(game.areas[owner]-total)<1e-7));
 assert(Math.abs(game.shares[0]+game.shares[1]-100)<1e-9);
 assert.equal(game.winner,Math.abs(totals[0]-totals[1])<1e-7?-1:totals[0]>totals[1]?0:1);
}
console.log('PASS: fewer triangles can win by area, empty scores, draws, unrounded winner, area-aware AI and independent area totals across 20 complete boards.');
