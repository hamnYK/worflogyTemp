import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,outcome,packSave,validateSave} from '../src/rules.js';
import {defenseDecision} from '../src/defense.js';
import {dist,pathTo,lineOfSight,chance} from '../src/rules.js';
const setup=()=>{const s=newGame('ai');s.cover.forEach(c=>c.hp=0);s.units.filter(u=>u.team==='enemy').forEach(e=>e.jammed=1);return s;};
test('only new defense missions receive objectives; legacy saves preserve old behavior',()=>{
 assert.equal(newGame().defense,undefined);assert.equal(newGame('ai',undefined,undefined,1).defense,undefined);
 const old=newGame('ai');delete old.defense;assert.equal(validateSave(packSave(old)).defense,undefined);
 assert.deepEqual(validateSave(packSave(newGame('ai'))).defense,newGame('ai').defense);
 const bad=packSave(newGame('ai'));bad.defense.nodes[0].breach=4;assert.throws(()=>validateSave(bad));
});
test('infiltration capped at one per node per round; jam stops it; third breach loses before survival victory',()=>{
 const s=setup();s.units[4].x=2;s.units[4].z=2;enemyTurn(s);assert.equal(s.defense.nodes[0].breach,0);
 for(let n=1;n<=3;n++){
  s.units.filter(u=>u.team==='enemy').forEach(e=>e.jammed=1);s.units[4].jammed=0;s.units[4].x=2;s.units[4].z=2;
  if(n===3)s.turn=s.turnLimit;
  enemyTurn(s);assert.equal(s.defense.nodes[0].breach,n);
 }
 assert.equal(s.status,'lost');
});
test('adjacent purge costs one AP and cannot be spammed; safe node consumes no AP',()=>{
 const s=setup(),n=s.defense.nodes[0];s.units[0].x=2;s.units[0].z=2;n.breach=2;
 assert.equal(act(s,'hack').ok,true);assert.equal(n.breach,1);assert.equal(s.units[0].ap,1);
 assert.equal(act(s,'hack').ok,false);assert.equal(s.units[0].ap,1);
 assert.deepEqual(validateSave(packSave(s)),s);
});
test('objective rush continues without line of sight and does not shoot unseen units',()=>{
 const s=newGame('ai'),e=s.units[4],d=defenseDecision(s,e,{dist,pathTo,lineOfSight,chance});
 assert.equal(d.kind,'move');assert.ok(d.path.length<=4);
});
test('overwatch interrupts a defense rush at the hit cell before infiltration',()=>{
 const s=setup(),e=s.units[4],guard=s.units[0];guard.x=1;guard.z=3;guard.watch=true;
 e.x=6;e.z=3;e.hp=1;e.jammed=0;s.seed=1;
 const effects=enemyTurn(s);assert.equal(e.hp,0);assert.equal(e.x,5);
 assert.equal(s.defense.nodes[0].breach,0);assert.equal(effects.filter(f=>f.type==='shot'&&f.from.id===guard.id).length,1);
});
