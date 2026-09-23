import assert from 'node:assert/strict';
import {ChipBasketball} from '../js/chip-basketball-rules.mjs';
const hold=(g,x,z)=>{g.phase='held';g.p={x,y:.6,z};g.shotOrigin={...g.p};g.shotPoints=g.pointsAt(g.p);};
let g=new ChipBasketball({random:()=>.4});assert.equal(g.launch(9),false);g.spin(8,-.5);g.advance(2);assert(g.bounces>0);assert(Math.hypot(g.p.x,g.p.z-4.5)>.01);
g.setGrip(-7,-7);assert.equal(g.catch(),false);assert.equal(g.scores[0],0);assert(g.next());g.spin();g.advance(15);assert.equal(g.phase,'attempt-end');assert(g.next());assert.equal(g.attempt,3);g.spin();g.advance(15);assert.equal(g.phase,'results');assert.deepEqual(g.scores,[0,0,0]);assert(!g.next());
const a=new ChipBasketball({random:()=>.4}),b=new ChipBasketball({random:()=>.4});a.spin(8,.3);b.spin(8,.3);a.advance(2);b.advance(2);assert.deepEqual(a.p,b.p);
g=new ChipBasketball({random:()=>.4});g.spin();for(let i=0;i<3000&&g.phase==='spinning';i++){g.step(1/240);g.setGrip(g.p.x,g.p.z);if(g.catchable)assert(g.catch());}assert.equal(g.phase,'held');
const shots=[];
for(const [x,z,points] of [[3,2,2],[5,2,3],[3,-2,4],[5,-3,6]]){
 let found=null;
 for(let el=45;el<=80&&!found;el++)for(let power=6;power<=14;power+=.05){
 const h=new ChipBasketball({random:()=>.4});hold(h,x,z);assert.equal(h.shotPoints,points);h.launch(power,0,el);h.advance(6);
 if(h.total===points){found={x,z,points,power:+power.toFixed(2),el};break;}
 }
 assert(found,'Scoring route for '+points);shots.push(found);
}
g=new ChipBasketball({random:()=>.4});const six=shots[3];for(let i=0;i<3;i++){hold(g,six.x,six.z);g.launch(six.power,0,six.el);g.advance(6);if(i<2){assert.equal(g.phase,'attempt-end');g.next();}}assert.equal(g.total,18);assert.equal(g.phase,'results');assert.deepEqual(g.scores,[6,6,6]);
const auto=new ChipBasketball({random:()=>.4});hold(auto,4,3);auto.launch(9,2,65);assert(Math.abs(auto.v.x/auto.v.z-4/3)<1e-9);
console.log('PASS: deterministic bouncing, manual catch, timeout, 3 attempts, 2/3/4/6 zones, automatic bearing and 18-point round.');console.log(JSON.stringify(shots));
