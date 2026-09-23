import assert from 'node:assert/strict';
import {ChipBasketball} from '../js/chip-basketball-rules.mjs';
const hold=g=>{g.spin();for(let i=0;i<2160&&!g.catchable;i++)g.step(1/240);assert(g.catch());};
const settle=g=>{for(let i=0;i<2400&&g.phase==='flying';i++)g.step(1/240);};
let g=new ChipBasketball();assert(!g.launch(10));assert(!g.catch());assert(g.spin());assert(!g.spin());assert(!g.catch());assert.equal(g.phase,'fail');
g.reset();g.spin();g.advance(9.1);assert.equal(g.result,'spin-timeout');
g.reset();hold(g);assert.equal(g.phase,'held');assert(g.launch(10.1));settle(g);assert.equal(g.phase,'won');
for(const [power,aim] of [[7,0],[14,0],[10.1,.4]]){g.reset();hold(g);g.launch(power,aim);settle(g);assert.equal(g.phase,'fail');assert.equal(g.result,'miss');}
g.reset();hold(g);assert(!g.launch(NaN));assert.equal(g.phase,'held');
let hit=false;for(let power=9.4;power<10.8;power+=.1){g.reset();hold(g);g.launch(power);settle(g);if(g.rimHits>0)hit=true;}assert(hit);
console.log('PASS: spin before catch, bad catch, timeout, upright catch, shot lock, score, miss, rim collision, reset.');
