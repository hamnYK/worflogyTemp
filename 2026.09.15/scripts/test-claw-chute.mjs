import assert from 'node:assert/strict';
import {ClawPhysics,CLAW,plushInventory} from '../js/claw-physics.mjs';
import fs from 'node:fs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/plush-wall-specs.json',import.meta.url)));
let count=0;
for(const type of ['bunny','bear','cat','penguin','star','seal','octopus'])for(const rotation of [[0,0,0],[Math.PI/2,0,0],[0,0,Math.PI/2],[.8,.7,.6]]){
 const spec={...fixtures.find(p=>p.type===type),s:['bunny','seal'].includes(type)?.86:1};
 const sim=new ClawPhysics([spec],{settleSteps:0,placements:[{position:[CLAW.chute.x,3.4,CLAW.chute.z],rotation}]});
 const body=sim.toys[0].body;body.updateAABB();body.position.x+=CLAW.chute.x-(body.aabb.lowerBound.x+body.aabb.upperBound.x)/2;body.position.z+=CLAW.chute.z-(body.aabb.lowerBound.z+body.aabb.upperBound.z)/2;body.aabbNeedsUpdate=true;
 sim.tries=1;
 for(let i=0;i<1200&&!sim.score;i++)sim.step(CLAW.step);
 assert.equal(sim.score,1,type+' must pass at '+rotation);
 assert.ok(sim.toys[0].body.aabb.upperBound.y<1.28,'entire toy must enter shaft before score');
 sim.dispose();count++;
}
console.log('PASS: '+count+' maximum-size plush/type/orientation drops physically enter the enlarged chute.');


const inventory=plushInventory().map((p,i)=>({...fixtures[i],...p}));
for(const seed of [31,1769,888,7]){
 const sim=new ClawPhysics(inventory,{seed});
 for(let i=0;i<360;i++)sim.step(CLAW.step);
 assert.ok(sim.toys.every(t=>t.body.position.y>1),'no toy escapes into the shaft during initial settling');
 assert.ok(sim.toys.every(t=>Math.abs(t.body.position.x-CLAW.chute.x)>=CLAW.chute.mouth||Math.abs(t.body.position.z-CLAW.chute.z)>=CLAW.chute.mouth),'receiving bay stays clear');
 sim.dispose();
}
console.log('PASS: four thirty-plush fills leave the receiving bay clear.');
