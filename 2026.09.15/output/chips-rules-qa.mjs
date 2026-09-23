import assert from 'node:assert/strict';
import {ChipFootball} from '../js/chip-football-rules.mjs';
const settle=g=>{for(let i=0;i<3000&&g.phase==='moving';i++)g.step(1/240);};
let g=new ChipFootball();
assert(g.select(0));assert(!g.select(1));assert.equal(g.selected,0);
assert(g.launch(0,-6.4));settle(g);assert.equal(g.phase,'ready');assert(g.chips[0].passed);assert(!g.select(0));assert(g.select(1));
g=new ChipFootball();g.select(0);g.launch(0,-22);settle(g);assert.equal(g.phase,'fail');assert.equal(g.result,'early-goal');
g=new ChipFootball();g.chips[0].passed=true;g.chips[1].passed=true;g.chips[2]={x:0,z:5,passed:false};g.chips[0].x=-1.3;g.chips[0].z=2.5;g.chips[1].x=1.3;g.chips[1].z=2.5;g.select(2);g.launch(0,-22);settle(g);assert.equal(g.result,'early-goal');
g=new ChipFootball();g.select(0);g.launch(10,0);g.advance(1);assert(g.bankCount>0);assert.equal(g.phase,'moving');
g=new ChipFootball();g.select(0);g.launch(0,2);settle(g);assert.equal(g.phase,'fail');assert.equal(g.result,'missed-gate');
g=new ChipFootball();g.select(0);g.launch(-5.2,-10);settle(g);assert.equal(g.result,'collision');
g=new ChipFootball();g.chips.forEach(c=>c.passed=true);g.select(0);g.launch(0,-22);settle(g);assert.equal(g.phase,'won');
g.reset();assert.equal(g.selected,null);assert.equal(g.previous,null);assert(!g.canShoot);assert.equal(g.phase,'ready');
// Banked pass remains valid; consecutive selection lock lifts only after another pass.
g=new ChipFootball();g.select(0);g.launch(0,-6.4);settle(g);
assert(!g.select(0));assert(g.select(1));
let a=g.chips[0],b=g.chips[2],c=g.chips[1],dx=(a.x+b.x)/2-c.x,dz=(a.z+b.z)/2-c.z,d=Math.hypot(dx,dz),speed=(d+1)*1.25;
g.launch(dx/d*speed,dz/d*speed);settle(g);assert.equal(g.phase,'ready');assert(g.chips[1].passed);assert(g.select(0));assert(!g.select(2));
console.log('PASS: locked selection, consecutive chip ban, first-shot FAIL, third-pass shot FAIL, legal banks, missed pass, collisions, unlocked goal, reset.');
