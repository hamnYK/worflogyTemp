import assert from 'node:assert/strict';
import * as C from '../lib/cannon-es.mjs';
import {createPlushSurfaces} from '../js/plush-surfaces.mjs';
import {plushShape,plushGripBalls,ClawPhysics,CLAW} from '../js/claw-physics.mjs';
const geos=new Set(),surfaces=createPlushSurfaces(geos),shape={balls:plushGripBalls('bunny')};
for(const geometry of [surfaces.torso.geometry,surfaces.patch]){
 const p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const d=Math.min(...shape.balls.map(([x,y,z,r])=>Math.hypot(p.getX(i)-x,p.getY(i)-y,p.getZ(i)-z)-r));
  assert.ok(d<=.006,'visible torso/belly must be inside collision volume: '+d);
 }
}
for(const rotation of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0]])for(const y of [.16,.35,.55,.71]){
 const world=new C.World({gravity:new C.Vec3()});world.solver.iterations=20;
 const fabric=new C.Material(),rubber=new C.Material();
 world.addContactMaterial(new C.ContactMaterial(fabric,rubber,{friction:.78,restitution:.015,contactEquationStiffness:8e4,contactEquationRelaxation:5}));
 const toy=new C.Body({mass:0,material:fabric});
 toy.quaternion.setFromEuler(...rotation);
 for(const [x,cy,z,r] of shape.balls)toy.addShape(new C.Sphere(r),new C.Vec3(x,cy,z));
 world.addBody(toy);
 const finger=new C.Body({mass:.055,material:rubber,shape:new C.Box(new C.Vec3(.043,.12,.048)),linearDamping:.2});
 const normal=toy.quaternion.vmult(new C.Vec3(0,0,1));finger.linearFactor.set(Math.round(Math.abs(normal.x)),Math.round(Math.abs(normal.y)),Math.round(Math.abs(normal.z)));finger.fixedRotation=true;finger.updateMassProperties();
 toy.quaternion.vmult(new C.Vec3(0,y,.75),finger.position);finger.quaternion.copy(toy.quaternion);world.addBody(finger);
 const push=toy.quaternion.vmult(new C.Vec3(0,0,-1));
 for(let i=0;i<240;i++){finger.applyForce(push);world.step(CLAW.step);}
 const local=toy.quaternion.conjugate().vmult(finger.position);
 assert.ok(local.z>=surfaces.torso.front(0,y)-.015,'finger crosses belly when pressed: '+local.z);
}
geos.forEach(g=>g.dispose());
console.log('PASS: continuous visible torso and belly coverage; loaded claw-sized finger contacts at four heights and three doll orientations.');


const simulation=new ClawPhysics([{type:'bunny',s:.8,kind:0}],{settleSteps:0});
const toy=simulation.toys[0].body;
assert.equal(toy.shapes.filter(s=>s.collisionFilterMask===4).length,plushGripBalls('bunny').length);
for(const finger of [simulation.palm,...simulation.fingers.map(f=>f.body)]){
 assert.ok(finger.shapes.every(s=>s.collisionFilterGroup===4),'claw shape filters must reach the detailed grip volume');
}
assert.equal(toy.mass,plushShape('bunny').mass*.8*.8*.8,'contact correction must not increase toy mass');
simulation.dispose();
