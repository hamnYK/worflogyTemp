import assert from 'node:assert/strict';
import {ChipBookFlip,BOOKS} from '../js/chip-book-flip-rules.mjs';
for(const kind of Object.keys(BOOKS)){
const g=new ChipBookFlip({kind,random:()=>.4});assert.equal(g.flipped,0);assert(!g.strike(NaN,0,5));assert(!g.strike(4,0,5));assert.equal(g.hits,0);assert(g.strike(0,1.5,6));assert(!g.strike(0,0,5));g.advance(16);assert.notEqual(g.phase,'moving');assert.equal(g.hits,1);assert(g.chips.every(b=>Number.isFinite(b.position.y)));console.log(kind,g.phase,g.flipped);
}
let g=new ChipBookFlip({random:()=>.4});
for(let i=0;i<5;i++){assert(g.strike(0,0,1));g.advance(16);}
assert.equal(g.phase,'fail');assert.equal(g.reason,'attempts');assert.equal(g.hits,5);assert(!g.strike(0,0,1));
g.reset();g.hits=4;g.strike(0,0,1);
g.chips.forEach(b=>{b.quaternion.setFromEuler(Math.PI,0,0);b.velocity.setZero();b.angularVelocity.setZero();});
g.advance(2);assert.equal(g.phase,'won');assert.equal(g.flipped,3);
g.reset();g.strike(0,0,1);g.chips[0].position.set(3.5,.65,0);g.step(1/240);assert.equal(g.phase,'fail');assert.equal(g.reason,'outside');
g.reset();g.strike(0,0,6);g.chips.forEach(b=>{b.position.y=3;b.quaternion.setFromEuler(Math.PI,0,0);});g.step(1/240);assert.equal(g.phase,'moving');
g.reset('hardcover');assert.equal(g.phase,'ready');assert.equal(g.hits,0);assert.equal(g.flipped,0);
let seed=73;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);let wins=0,outside=0;
for(let run=0;run<60;run++){g=new ChipBookFlip({kind:Object.keys(BOOKS)[run%3],random});for(let n=0;n<5&&g.phase==='ready';n++){g.strike((random()-.5)*3,(random()-.5)*4,4+random()*6);g.advance(16);}if(g.phase==='won')wins++;if(g.reason==='outside')outside++;assert(['won','fail'].includes(g.phase));}
assert(wins>0,'Winning must be reachable');assert(outside>0,'Strong repeated hits can fall off');
console.log('PASS: three books, five-hit limit, settled-only win including final hit, immediate fall failure, reset; random rounds', {wins,outside});
