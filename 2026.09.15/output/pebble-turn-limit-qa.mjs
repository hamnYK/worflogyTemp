import assert from 'node:assert/strict';
import {PebbleTerritory} from '../js/pebble-territory-rules.mjs';
for(const first of [0,1])for(const winner of [-1,0,1]){
 const g=new PebbleTerritory({first});
 if(winner>=0)g.land[g.land.findIndex(v=>v===0)]=winner+1;
 for(let n=0;n<19;n++){assert.equal(g.phase,'ready');assert(g.pass());}
 assert.equal(g.phase,'ready','Both players must receive all ten turns');
 assert.deepEqual(g.turnsUsed,first===0?[10,9]:[9,10]);
 assert(g.pass());assert.equal(g.phase,'finished');assert.equal(g.winner,winner);assert.equal(g.finishReason,'turn-limit');assert.deepEqual(g.turnsUsed,[10,10]);assert.equal(g.turns,20);
 assert.equal(g.pass(),false);assert.equal(g.shoot({x:500,y:320}).ok,false);
}
let g=new PebbleTerritory();g.place({x:150,y:320});assert.equal(g.shoot({x:-10,y:320}).reason,'outside');assert.deepEqual(g.turnsUsed,[1,0]);
g=new PebbleTerritory();g.shoot({x:400,y:320});g.shoot({x:450,y:420});assert.deepEqual(g.turnsUsed,[0,0]);assert.equal(g.shoot({x:500,y:420}).reason,'missed-home');assert.deepEqual(g.turnsUsed,[1,0]);
g=new PebbleTerritory();g.land.fill(0);
for(let i=0;i<g.land.length;i++){const p=g.center(i);if(Math.hypot(p.x-100,p.y-320)<40)g.land[i]=1;if(Math.hypot(p.x-300,p.y-320)<30)g.land[i]=2;}
g.beginTurn();g.place({x:100,y:320});g.shoot({x:370,y:200});g.shoot({x:370,y:440});g.shoot({x:100,y:320});assert.equal(g.winner,0);assert.equal(g.finishReason,'elimination');assert.deepEqual(g.turnsUsed,[1,0]);
console.log('PASS: equal ten turns for either starter, area win/loss/tie, failed-turn counting, three flicks per turn, early elimination and finished-state guards.');
