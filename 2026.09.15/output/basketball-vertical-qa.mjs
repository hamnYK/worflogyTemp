import assert from 'node:assert/strict';
import {ChipBasketball} from '../js/chip-basketball-rules.mjs';
const a=new ChipBasketball({random:()=>.4}),b=new ChipBasketball({random:()=>.4}),strong=new ChipBasketball({random:()=>.4});a.spin(8);b.spin(8);strong.spin(14);
a.advance(.3);b.advance(.3);strong.advance(.3);assert.equal(a.p.x,0);assert.equal(a.p.z,4.5);assert(strong.p.y>a.p.y);assert.equal(a.bounces,0);
a.advance(3);b.advance(3);assert.deepEqual(a.p,b.p);assert.deepEqual(a.orientation,b.orientation);assert(a.bounces>0);assert(Math.hypot(a.p.x,a.p.z-4.5)>.01);
const different=new ChipBasketball({random:()=>.4});different.spin(10);different.advance(3.3);assert.notDeepEqual(a.p,different.p);
assert(Math.abs(Math.hypot(a.orientation.x,a.orientation.y,a.orientation.z,a.orientation.w)-1)<1e-6);
console.log('PASS: upward toss, height from force, deterministic rigid-body contact and rotation, input-dependent bounce, normalized rendered pose.');
