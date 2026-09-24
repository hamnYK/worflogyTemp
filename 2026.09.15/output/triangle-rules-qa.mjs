import assert from 'node:assert/strict';
import {TriangleTerritory,createPoints} from '../js/triangle-territory-rules.mjs';
const points=coords=>coords.map(([x,y])=>({x,y}));
let g=new TriangleTerritory({points:points([[0,0],[10,0],[0,10]])});
assert.equal(g.play(0,0).ok,false);assert(g.play(0,1).ok);assert.equal(g.turn,1);assert.equal(g.play(1,0).reason,'duplicate');assert.equal(g.turn,1);g.play(1,2);const capture=g.play(0,2);assert.equal(capture.captured,1);assert.deepEqual(g.scores,[1,0]);assert.equal(g.turn,0);assert.equal(g.phase,'finished');assert.equal(g.play(0,1).reason,'finished');
g=new TriangleTerritory({points:points([[0,0],[10,0],[10,10],[0,10]])});g.play(0,2);const before=JSON.stringify(g);assert.equal(g.play(1,3).reason,'crossing');assert.equal(JSON.stringify(g),before);
g=new TriangleTerritory({points:points([[0,0],[10,0],[10,10],[0,10]])});for(const e of [[0,1],[1,2],[2,3],[3,0]])g.play(...e);assert.equal(g.play(0,2).captured,2);assert.deepEqual(g.scores,[2,0]);assert.equal(g.phase,'finished');
g=new TriangleTerritory({points:points([[0,0],[5,0],[10,0],[0,10]])});assert.equal(g.play(0,2).reason,'through-point');assert(g.play(0,1).ok);assert(g.play(1,2).ok);
g=new TriangleTerritory({points:points([[0,0],[10,0],[0,10],[2,2]])});g.play(0,1);g.play(1,2);assert.equal(g.play(2,0).captured,0);assert.equal(g.triangles.length,0);assert.equal(g.phase,'playing');
g=new TriangleTerritory({points:points([[0,0],[10,0],[0,10],[20,20]])});g.play(0,1);g.play(1,2);assert.deepEqual(g.chooseMove(()=>0),[0,2]);g.play(0,2);assert.equal(g.turn,0);assert.equal(g.phase,'playing');
function hullCount(ps){const sorted=[...ps].sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),part=list=>{const h=[];for(const p of list){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h;};return part(sorted).length+part([...sorted].reverse()).length-2;}
let seed=42;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let board=0;board<20;board++){
 const ps=createPoints(random);assert.equal(ps.length,21);g=new TriangleTerritory({points:ps,first:board%2});let moves=0;
 while(g.phase==='playing'){
  const legal=g.legalMoves(),move=board<5?g.chooseMove(random):legal[Math.floor(random()*legal.length)];assert(move);const turn=g.turn,result=g.play(...move);assert(result.ok);assert.equal(g.turn,result.captured?turn:1-turn);assert(++moves<61);
 }
 const triangles=2*ps.length-hullCount(ps)-2;assert.equal(g.triangles.length,triangles);assert.equal(g.scores[0]+g.scores[1],triangles);assert.equal(g.claimed.size,triangles);assert.equal(g.legalMoves().length,0);
 for(const {ids} of g.triangles)assert(g.empty(...ids));
}
console.log('PASS: crossings, overlap, intermediate dots, occupied triangles, double capture, bonus turns, AI capture choice, and 20 complete boards with Euler triangle counts.');
