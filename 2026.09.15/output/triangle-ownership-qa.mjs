import assert from 'node:assert/strict';
import {TriangleTerritory,createPoints} from '../js/triangle-territory-rules.mjs';
// Determine each claimed triangle's closing move from history, independently of turn after capture.
const key=(a,b)=>[a,b].sort((x,y)=>x-y).join(':');
function verify(game,history){
 const owners=[0,0];
 for(const triangle of game.triangles){
  const [a,b,c]=triangle.ids,edges=[key(a,b),key(b,c),key(c,a)];
  const closing=history.filter(m=>edges.includes(key(...m.edge))).at(-1);
  assert(closing);assert.equal(triangle.owner,closing.player,'Owner must be the player who drew the last of the three sides');owners[closing.player]++;
 }
 assert.deepEqual(game.scores,owners);
}
for(const first of [0,1])for(const order of [[[0,1],[1,2],[2,0]],[[1,0],[2,0],[1,2]],[[2,1],[1,0],[0,2]]]){
 const game=new TriangleTerritory({first,points:[{x:0,y:0},{x:10,y:0},{x:0,y:10},{x:20,y:20}]});const history=[];
 for(const edge of order){const player=game.turn;history.push({edge,player});const move=game.play(...edge);assert(move.ok);verify(game,history);}
 assert.equal(game.triangles[0].owner,first);assert.equal(game.turn,first);
}
let seed=51;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let round=0;round<50;round++){
 const game=new TriangleTerritory({points:createPoints(random),first:round%2,clearance:round%2?18:0}),history=[];
 while(game.phase==='playing'){const moves=game.legalMoves(),edge=moves[Math.floor(random()*moves.length)],player=game.turn;history.push({edge,player});assert(game.play(...edge).ok);verify(game,history);}
}
console.log('PASS: every captured triangle belongs to its closing-edge player across both starting players, reversed endpoints and 50 complete games.');
// A long edge only two units from a dot used to look connected to it.
const nearPoints=[{x:100,y:100},{x:500,y:102},{x:900,y:100},{x:500,y:600}];
const old=new TriangleTerritory({points:nearPoints});old.play(0,2);old.play(0,3);assert.equal(old.play(1,3).captured,0);assert.equal(old.play(0,1).player,1);assert.equal(old.triangles[0].owner,1);
const visible=new TriangleTerritory({points:nearPoints,clearance:18});assert.equal(visible.play(0,2).reason,'near-point');assert.equal(visible.turn,0);visible.play(0,1);visible.play(0,3);assert.equal(visible.play(1,3).captured,1);assert.equal(visible.triangles[0].owner,0);assert.deepEqual(visible.history.at(-1).edge,[1,3]);
console.log('PASS: near-dot false connection reproduced; visible-clearance rule prevents it, and the human closing edge claims the triangle.');
