import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ClawPhysics,CLAW,plushInventory} from '../js/claw-physics.mjs';
import {Vec3} from '../lib/cannon-es.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/plush-wall-specs.json',import.meta.url)));
const specs=plushInventory().map((p,i)=>({...fixtures[i],...p}));
let worst=0;
for(const seed of [31,1769,888,7]){
 const sim=new ClawPhysics(specs,{seed});
 for(let frame=0;frame<720;frame++){
  if(frame===120){for(const t of sim.toys){t.body.wakeUp();t.body.velocity.set((t.body.position.x>0?1:-1)*2,0,(t.body.position.z>0?1:-1)*2);}}
  sim.step(CLAW.step);
  if(frame%12)continue;
  for(const toy of sim.toys)for(const bounds of toy.wallBounds)for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
   const v=new Vec3((bounds.center[0]+x*bounds.half[0])*toy.s,(bounds.center[1]+y*bounds.half[1]-toy.center)*toy.s,(bounds.center[2]+z*bounds.half[2])*toy.s);
   const q=toy.body.quaternion.vmult(v);q.vadd(toy.body.position,q);
   worst=Math.max(worst,Math.abs(q.x)-2.9,Math.abs(q.z)-2.2);
  }
 }
 sim.dispose();
}
console.log({worstEnvelopePenetration:worst});assert.ok(worst<.03,'wall envelope stays inside cabinet including pressure and rotation');
console.log('PASS: thirty rendered plush envelopes, four fill seeds, outward pressure at all walls.');

