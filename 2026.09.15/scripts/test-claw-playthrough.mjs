import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ClawPhysics,plushInventory,CLAW} from '../js/claw-physics.mjs';
// Production wall envelopes, pile and detailed claw contacts; never inject score or attach a prize.
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/plush-wall-specs.json',import.meta.url)));
const specs=plushInventory().map((p,i)=>({...fixtures[i],...p}));
const s=new ClawPhysics(specs,{seed:31});
const moves=[[-.075,-.6,0],[.525,-.975,.2],[1.5,-1.425,.4]];
try{
 for(const [i,[x,z,heading]] of moves.entries()){
  assert.equal(s.phase,'ready');
  // These are exactly reachable with arrows (.075) and Q/E (.2).
  assert.ok(Math.abs(x/.075-Math.round(x/.075))<1e-8);
  assert.ok(Math.abs(z/.075-Math.round(z/.075))<1e-8);
  s.setAim(x,z);s.twist(heading-s.heading);
  for(let n=0;n<180;n++)s.step(CLAW.step);
  assert.equal(s.start(),true);
  let carried=false;
  for(let n=0;n<2400&&!['ready','done','fail'].includes(s.phase);n++){
   s.step(CLAW.step);
   if(s.phase==='carry'&&s.toys.some(t=>!t.caught&&t.contact&&t.body.position.y>3.2))carried=true;
  }
  assert.ok(carried,'a real claw contact must carry the toy above the pile');
  assert.equal(s.score,i+1,'each keyboard-reachable aim physically delivers a prize');
  assert.ok(s.toys.filter(t=>t.caught).every(t=>t.body.aabb.upperBound.y<1.28),'the whole toy must cross the chute');
  assert.ok(s.world.constraints.every(c=>!s.toys.some(t=>c.bodyA===t.body||c.bodyB===t.body)),'no attachment constraint may hold a toy');
 }
 assert.equal(s.tries,3);assert.equal(s.phase,'done');
 console.log('PASS: production 30-plush pile; seal, bunny and cat physically collected in three keyboard-reachable attempts; no toy attachment or injected score.');
}finally{s.dispose();}

