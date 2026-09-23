import assert from 'node:assert/strict';
import {ChipFootball} from '../js/chip-football-rules.mjs';
function opened(){const g=new ChipFootball();g.select(0);g.launch(0,-8);g.advance(12);g.chips=[{x:0,z:5},{x:-1.3,z:2.5},{x:1.3,z:2.5}].map(c=>({...c,passed:false}));return g;}
const settle=g=>{for(let i=0;i<3000&&g.phase==='moving';i++)g.step(1/240);};
let g=opened();
assert(g.select(0));assert(!g.select(1));assert.equal(g.selected,0);
assert(g.launch(0,-6.4));settle(g);assert.equal(g.phase,'ready');assert(g.chips[0].passed);assert(!g.select(0));assert(g.select(1));
g=opened();g.select(0);g.launch(0,-22);settle(g);assert.equal(g.phase,'fail');assert.equal(g.result,'early-goal');
g=opened();g.chips[0].passed=true;g.chips[1].passed=true;g.chips[2]={x:0,z:5,passed:false};g.chips[0].x=-1.3;g.chips[0].z=2.5;g.chips[1].x=1.3;g.chips[1].z=2.5;g.select(2);g.launch(0,-22);settle(g);assert.equal(g.result,'early-goal');
g=opened();g.select(0);g.launch(10,0);g.advance(1);assert(g.bankCount>0);assert.equal(g.phase,'moving');
g=opened();g.select(0);g.launch(0,2);settle(g);assert.equal(g.phase,'fail');assert.equal(g.result,'missed-gate');
g=opened();g.select(0);g.launch(-5.2,-10);settle(g);assert.equal(g.result,'collision');
g=opened();g.chips.forEach(c=>c.passed=true);g.select(0);g.launch(0,-22);settle(g);assert.equal(g.phase,'won');
g.reset();assert.equal(g.selected,null);assert.equal(g.previous,null);assert(!g.canShoot);assert.equal(g.phase,'ready');
// Banked pass remains valid; consecutive selection lock lifts only after another pass.
g=opened();g.select(0);g.launch(0,-6.4);settle(g);
assert(!g.select(0));assert(g.select(1));
let a=g.chips[0],b=g.chips[2],c=g.chips[1],dx=(a.x+b.x)/2-c.x,dz=(a.z+b.z)/2-c.z,d=Math.hypot(dx,dz),speed=(d+1)*1.25;
g.launch(dx/d*speed,dz/d*speed);settle(g);assert.equal(g.phase,'ready');assert(g.chips[1].passed);assert(g.select(0));assert(!g.select(2));
console.log('PASS: locked selection, consecutive chip ban, first-shot FAIL, third-pass shot FAIL, legal banks, missed pass, collisions, unlocked goal, reset.');

for(let i=0;i<3;i++){const g=new ChipFootball();assert(g.opening);g.select(i);g.launch(0,-8);assert.equal(g.phase,'breaking');g.advance(12);assert.equal(g.turns,0);assert(!g.opening);assert(!g.canShoot);assert(g.chips.every(c=>!c.passed));}
console.log('PASS: opening for each chip is uncounted and grants no passes');

const layouts=[];for(let n=0;n<8;n++){const g=new ChipFootball();g.select(0);g.launch((n-4)*.1,-6-n*.3);g.advance(12);assert.equal(g.phase,'ready');assert.equal(g.turns,0);assert(g.chips.every(c=>!c.passed));layouts.push(JSON.stringify(g.chips));}
assert(new Set(layouts).size>1);console.log('PASS: physical opening collisions allowed; input-dependent layouts; opening is uncounted.');
