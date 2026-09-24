import assert from 'node:assert/strict';
import {PebbleTerritory,distance} from '../js/pebble-territory-rules.mjs';
function fixture(){const g=new PebbleTerritory();g.land.fill(0);for(let i=0;i<g.land.length;i++){const p=g.center(i);if(distance(p,{x:100,y:320})<40)g.land[i]=1;if(distance(p,{x:300,y:320})<40)g.land[i]=2;}g.beginTurn();g.place({x:100,y:320});return g;}
let g=fixture(),before=g.land.slice();
assert(g.shoot({x:400,y:320}).ok);assert.equal(g.turn,0);assert.deepEqual(g.land,before,'Passing through rival land does not fail or capture yet');
g.shoot({x:350,y:450});const cut=g.shoot({x:100,y:320});assert.equal(cut.reason,'captured');assert(cut.stolen>0);assert(g.areas[1]>0);assert.equal(g.turn,1);
g=fixture();before=g.land.slice();assert.equal(g.shoot({x:300,y:320}).reason,'rival');assert.equal(g.turn,1);assert.deepEqual(g.land,before);
g=fixture();before=g.land.slice();g.shoot({x:370,y:200});g.shoot({x:370,y:440});assert.deepEqual(g.land,before);const enclosed=g.shoot({x:100,y:320});assert(enclosed.stolen>0);assert.equal(g.areas[1],0);assert.equal(g.winner,0);assert.equal(g.phase,'finished');
g=fixture();before=g.land.slice();g.shoot({x:370,y:200});g.shoot({x:370,y:440});assert.equal(g.shoot({x:200,y:490}).reason,'missed-home');assert.deepEqual(g.land,before);assert.equal(g.turn,1);
g=fixture();before=g.land.slice();assert.equal(g.shoot({x:-10,y:320}).reason,'outside');assert.deepEqual(g.land,before);
g=fixture();g.shoot({x:370,y:200});assert.equal(g.place({x:100,y:320}),false);assert.equal(g.shoot({x:110,y:330}).reason,'captured','Return can use a different point inside home');
g=fixture();assert.equal(g.shoot({x:900,y:320}).ok,false);assert.equal(g.shots,0);assert.equal(g.place({x:300,y:320}),false);
g=fixture();assert.equal(g.shoot({x:110,y:325}).reason,'empty');assert.equal(g.turn,1);
let seed=41;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let match=0;match<3;match++){g=new PebbleTerritory({first:match%2});let moves=0;while(g.phase!=='finished'&&g.turns<30){const plan=g.planAI(random);assert(g.place(plan.start));for(const target of plan.targets){if(distance(g.stone,target)<2){g.pass();break;}const r=g.shoot(target);assert(r.ok);moves++;if(r.ended)break;}assert(g.areas.reduce((a,b)=>a+b,0)<=640000);}assert(g.revision>0,'AI captures territory');if(g.finishReason==='elimination')assert.equal(g.areas[1-g.winner],0);else {assert.deepEqual(g.turnsUsed,[10,10]);assert.equal(g.finishReason,'turn-limit');}console.log('AI simulation',match,'turns',g.turns,'flicks',moves);}
console.log('PASS: crossing versus landing, cut and surround, delayed capture, 3-flick return, bounds, placement, distance and AI turn simulations.');
