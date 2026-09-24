
import assert from 'node:assert/strict';
import {DotsAndBoxes} from '../js/dots-and-boxes-rules.mjs';
const g=new DotsAndBoxes();
assert.equal(g.points.length,36);assert.equal(g.cells.length,25);assert.equal(g.legalMoves().length,60);
for(const [a,b] of [[0,0],[0,2],[0,7],[5,6],[-1,0],[.5,1],[0,36]])assert.equal(g.play(a,b).ok,false);
assert.equal(g.edges.length,0);assert.equal(g.turn,0);
assert(g.play(0,1).ok);assert.equal(g.turn,1);assert.equal(g.play(1,0).reason,'duplicate');assert.equal(g.turn,1);
const pair=new DotsAndBoxes({columns:3,rows:2});
for(const edge of [[0,1],[1,2],[2,5],[5,4],[4,3],[3,0]])assert.equal(pair.play(...edge).captured,0);
const closer=pair.turn;
assert.deepEqual(pair.chooseMove(()=>0),[1,4]);
assert.equal(pair.play(1,4).captured,2);assert.equal(pair.turn,closer);
assert.equal(pair.scores[closer],2);assert.equal(pair.winner,closer);assert.equal(pair.play(0,1).reason,'finished');
assert(pair.boxes.every(b=>b.owner===closer));
const safe=new DotsAndBoxes({columns:3,rows:2});safe.play(0,1);safe.play(0,3);
const move=safe.chooseMove(()=>0);safe.play(...move);
assert(safe.legalMoves().every(e=>safe.completed(...e).length===0),'AI avoids gifting a third side while safe moves exist');
const draw=new DotsAndBoxes({columns:3,rows:2});
for(const edge of [[0,1],[0,3],[3,4],[1,2],[1,4],[2,5],[4,5]])draw.play(...edge);
assert.deepEqual(draw.scores,[1,1]);assert.equal(draw.winner,-1);
let seed=123;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let round=0;round<12;round++){
 const board=new DotsAndBoxes({first:round%2});
 while(board.phase==='playing'){
  const before=board.turn,previous=board.scores.reduce((a,b)=>a+b,0),m=round<4?board.chooseMove(random):board.legalMoves()[Math.floor(random()*board.legalMoves().length)];
  const result=board.play(...m);assert(result.ok);assert.equal(board.turn,result.captured?before:1-before);
  assert.equal(board.scores.reduce((a,b)=>a+b,0),previous+result.captured);
  assert(board.edges.length<=60);
 }
 assert.equal(board.edges.length,60);assert.equal(board.boxes.length,25);assert.equal(new Set(board.boxes.map(b=>b.ids[0])).size,25);
 for(const box of board.boxes){
  const sides=box.ids.map((a,i)=>[a,box.ids[(i+1)%4]]);
  const closing=board.history.filter(h=>sides.some(([a,b])=>h.edge.includes(a)&&h.edge.includes(b))).at(-1);
  assert.equal(box.owner,closing.player,'Last edge owner gets box regardless of earlier edges');
 }
 assert.equal(board.chooseMove(),null);assert.notEqual(board.winner,-1,'25 boxes cannot tie');
}
console.log('PASS: legal grid, duplicate/diagonal/skip rejection, double capture, bonus turns, safe AI, tie, 12 complete games and last-edge ownership.');
