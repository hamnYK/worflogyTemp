import assert from 'node:assert/strict';
import {ChipCurling,JUNK} from '../js/chip-curling-rules.mjs';
let seed=17;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const kinds=new Set();
for(let n=0;n<100;n++){const g=new ChipCurling({random});assert.equal(g.junk.length,3);assert.equal(new Set(g.junk.map(o=>o.kind)).size,3);for(const o of g.junk){kinds.add(o.kind);assert(Math.hypot(o.x,o.z+5)+o.radius<2);}for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert(Math.hypot(g.junk[i].x-g.junk[j].x,g.junk[i].z-g.junk[j].z)>g.junk[i].radius+g.junk[j].radius);}
assert.equal(kinds.size,5);
let g=new ChipCurling({random});
g.chips=[{x:0,z:-5},{x:.9,z:-5},{x:1.7,z:-5}];g.updateScore();assert.equal(g.ringScore,6);assert.equal(g.bonus,0);
const junk=g.junk[0];junk.x=2+junk.radius-.01;junk.z=-5;g.updateScore();assert.equal(g.bonus,0);
junk.x+=.02;g.updateScore();assert.equal(g.bonus,2);g.updateScore();assert.equal(g.bonus,2);
junk.x=0;g.updateScore();assert.equal(g.bonus,0);
const travel={};
for(const type of JUNK){
g=new ChipCurling({random});g.junk.forEach(o=>g.world.removeBody(o.body));g.junk=[];
const o={...type,x:0,z:5,angle:0,spin:0,vx:0,vz:0};g.addBody(o);g.junk.push(o);
g.launch(5,0,0);g.advance(20);travel[type.kind]=+(5-o.z).toFixed(2);assert(travel[type.kind]>.1,type.kind+' must move');assert.equal(g.phase,'ready');
assert(Number.isFinite(o.angle));assert(Math.abs(o.body.position.y)<1e-6);
}
assert(travel.cap>travel.block);
g=new ChipCurling({random});for(let i=0;i<3;i++){assert(g.launch(1));g.advance(21);}assert.equal(g.phase,'fail');assert.equal(g.shots,3);assert(!g.launch(1));
g.reset();assert.equal(g.phase,'ready');assert.equal(g.score,0);assert.equal(g.junk.length,3);
console.log('PASS: 100 random layouts, all five shapes, mass-dependent collisions, final-layout bonus, no duplicate bonus, three-shot completion and reset.',travel);
