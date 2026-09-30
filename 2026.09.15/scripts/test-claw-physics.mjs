
import assert from 'node:assert/strict';
import {ClawPhysics,plushInventory,CLAW} from '../js/claw-physics.mjs';
const types=['bunny','bear','cat','bear','bunny','penguin','star','seal','octopus'];
const inventory=()=>plushInventory().map(p=>({...p,type:types[p.kind]}));
assert.equal(plushInventory().length,30,'cabinet contains thirty plushies');
const run=(sim,seconds)=>{for(let i=0;i<Math.round(seconds/CLAW.step);i++)sim.step(CLAW.step);};
const finish=sim=>{for(let i=0;i<2400&&!['ready','done','fail'].includes(sim.phase);i++)sim.step(CLAW.step);assert.ok(['ready','done','fail'].includes(sim.phase),'cycle terminates');};
for(const seed of [31,1769,888,7]){
 const s=new ClawPhysics(inventory(),{seed});run(s,1);
 assert.ok(s.toys.every(p=>Number.isFinite(p.body.position.y)&&p.body.position.y>1&&Math.abs(p.body.position.x)<3.3&&Math.abs(p.body.position.z)<2.6),'pile remains inside cabinet');
 assert.ok(s.toys.some(p=>Math.abs(p.body.quaternion.x)>.2||Math.abs(p.body.quaternion.z)>.2),'plushies settle on their sides');
 assert.ok(Math.max(...s.toys.map(p=>p.body.mass))/Math.min(...s.toys.map(p=>p.body.mass))>5,'size changes physical mass');
 s.dispose();
}
const pile=new ClawPhysics(inventory(),{seed:1769});
const originals=pile.toys.map(p=>p.body.position.clone()),ids=pile.toys.map(p=>p.body.id);
pile.setAim(1,0);run(pile,1.5);assert.ok(pile.start());finish(pile);
assert.equal(pile.score,1,'an accessible gap in the real pile yields a prize');
const prize=pile.toys.find(p=>p.caught);
assert.ok(prize.body.position.y<.97&&Math.abs(prize.body.position.x-CLAW.chute.x)<CLAW.chute.half&&Math.abs(prize.body.position.z-CLAW.chute.z)<CLAW.chute.half,'score requires crossing the physical shaft');
assert.ok(pile.toys.some((p,i)=>!p.caught&&p.body.position.distanceTo(originals[i])>.12),'grabbing rearranges neighboring toys');
assert.deepEqual(pile.toys.map(p=>p.body.id),ids,'the pile is not rebuilt between tries');
const oldScore=pile.score;pile.setAim(0,0);run(pile,1);pile.start();run(pile,.15);assert.equal(pile.phase,'down');pile.start();assert.equal(pile.phase,'grip');finish(pile);
assert.equal(pile.score,oldScore,'closing above the pile does not attach a toy');
pile.reset(7);assert.equal(pile.score,0);assert.equal(pile.tries,0);assert.ok(pile.toys.every(p=>!p.caught));pile.dispose();
const specimen=inventory();
const options={seed:1769};
const outcomes=[];
for(const fps of [30,60]){
 const s=new ClawPhysics(specimen,options);s.setAim(1,0);run(s,1.5);s.start();
 for(let i=0;i<fps*17;i++)s.update(1/fps);
 outcomes.push({score:s.score,y:s.palm.position.y});assert.equal(s.score,1);s.dispose();
}
assert.equal(outcomes[0].score,outcomes[1].score);assert.ok(Math.abs(outcomes[0].y-outcomes[1].y)<.02,'fixed-step physics is frame-rate independent');
const empty=new ClawPhysics([],{settleSteps:0});
for(let i=0;i<5;i++){empty.start();run(empty,.1);empty.start();finish(empty);}
assert.equal(empty.tries,5);assert.equal(empty.phase,'fail');assert.equal(empty.start(),false,'a sixth attempt is forbidden');empty.reset();assert.equal(empty.phase,'ready');assert.equal(empty.tries,0);empty.dispose();
for(const [tries,score,expected] of [[5,2,'fail'],[5,3,'done'],[3,3,'done'],[4,2,'ready']]){const s=new ClawPhysics([],{settleSteps:0});s.tries=tries;s.score=score;s.next('return');run(s,1.7);assert.equal(s.phase,expected);s.dispose();}
console.log('PASS: stable piled shapes, size-dependent mass, physical prize, neighbor displacement, persistence, manual close, reset, 30/60 FPS consistency, five-try limit, final-attempt win, early win and retry reset.');

