import assert from 'node:assert/strict';
import {EraserWrestling,fullyOutside,fullyOnTop,PRESS} from '../js/eraser-wrestling-rules.mjs';
const make=()=>new EraserWrestling({random:()=>.5});
function stack(offset=0){const g=make();g.bodies[0].position.set(offset,.451,0);g.bodies[1].position.set(0,.15,0);g.bodies.forEach(b=>b.quaternion.setFromEuler(0,0,0));g.phase='moving';return g;}
function resize(b,x,y,z){b.shapes[0].halfExtents.set(x,y,z);b.shapes[0].updateConvexPolyhedronRepresentation();b.updateMassProperties();b.updateBoundingRadius();b.aabbNeedsUpdate=true;}
let g=stack();g.advance(3);assert.equal(g.phase,'won');assert.equal(g.reason,'ride');
g=stack(.45);g.advance(3);assert.equal(g.phase,'won','Overhang fully clear of the floor is mounted');
for(const yaw of [.35,Math.PI/2]){g=stack();g.bodies[0].quaternion.setFromEuler(0,yaw,0);g.advance(3);assert.equal(g.phase,'won','Crosswise mount wins');assert.equal(g.reason,'ride');}
g=stack(1.2);g.bodies[0].position.y=.42;g.bodies[0].quaternion.setFromEuler(0,0,-.32);g.advance(4);assert.equal(g.phase,'ready','Leaning on rival and floor continues');assert.equal(g.turn,1);assert(PRESS.some((_,i)=>g.accessible(1,i)));
g=stack();resize(g.bodies[0],1.1,.15,.6);g.advance(3);assert.equal(g.phase,'won');assert.equal(g.reason,'ride','Larger upper eraser fully off the floor wins');
g=stack(.1);resize(g.bodies[1],1.2,.15,.6);g.advance(3);assert.equal(g.reason,'ride','Smaller upper eraser fully fits on the larger lower one');
g=stack();g.bodies[0].position.y=2;assert(!g.judge(),'Coverage in midair is not supported');
g=stack(1.2);resize(g.bodies[0],2.2,.15,.6);g.bodies[0].position.y=.41;g.bodies[0].quaternion.setFromEuler(0,0,-.12);g.advance(4);assert.equal(g.phase,'won');assert.equal(g.reason,'blocked','Large leaning body can block all press zones');
g=make();let b=g.bodies[0];b.quaternion.setFromEuler(0,0,0);b.position.x=4.8;assert(!fullyOutside(b));b.position.x=4.9;assert(!fullyOutside(b));b.position.x=4.901;assert(fullyOutside(b));b.position.set(4.85,.15,5.35);b.quaternion.setFromEuler(0,Math.PI/4,0);assert(fullyOutside(b));
for(const angle of [0,.7,2.1])for(let slot=0;slot<8;slot++){
g=make();b=g.bodies[0];b.quaternion.setFromEuler(0,angle,0);const p=g.pressPoint(0,slot),dx=p.x-b.position.x,dz=p.z-b.position.z;
assert(g.launch(slot,4));assert(b.velocity.x*dx+b.velocity.z*dz>0,'Initial motion must follow the pressed side');
const x=b.position.x,z=b.position.z;g.advance(.08);assert((b.position.x-x)*dx+(b.position.z-z)*dz>0,'Actual flight must follow the pressed side');
}
g=make();g.turn=1;const plan=g.planAI();const origin=g.bodies[1].position,target=g.bodies[0].position;g.launch(plan.slot,plan.power);const v=g.bodies[1].velocity;assert(v.x*(target.x-origin.x)+v.z*(target.z-origin.z)>0,'AI presses toward opponent');
assert(!g.launch(plan.slot,plan.power));
console.log('PASS: full support, crosswise and overhanging mounts win, floor-supported leaning continues, large-object edge blockade, smaller-object full mount, airborne rejection, ring boundaries, 24 press-direction cases and AI direction.');
