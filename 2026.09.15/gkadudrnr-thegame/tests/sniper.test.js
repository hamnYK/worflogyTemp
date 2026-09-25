import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,packSave,validateSave} from '../src/rules.js';
import {movementRange} from '../src/operation.js';
import {attackPreview} from '../src/attack-preview.js';
import {skillInfo} from '../src/skill-info.js';
const setup=()=>{const s=newGame('human',[3,0,2,4]);s.cover.forEach(c=>c.hp=0);return s;};
test('sniper equipment halves movement; removed weapon restores mobility and locks skill',()=>{
 const s=setup();assert.equal(movementRange(s.agents[3]),2);
 assert.equal(act(s,'move',{x:4,z:2}).ok,false);assert.equal(s.units[0].ap,2);
 assert.equal(act(s,'move',{x:3,z:2}).ok,true);assert.equal(s.units[0].ap,1);
 s.agents[3].weapon='standard';assert.equal(movementRange(s.agents[3]),4);
 assert.equal(act(s,'skill',{id:'e0'}).ok,false);assert.equal(skillInfo(3,s.agents[3]).ready,false);
 const invalid=packSave(setup());invalid.agents[0].weapon='sniper';assert.throws(()=>validateSave(invalid));
});
test('long range snipe needs shared direct vision and shooter line of sight, not scan alone',()=>{
 const s=setup(),e=s.units[4];e.x=13;e.z=2;s.scanUntil=2;
 assert.equal(act(s,'skill',{id:e.id}).ok,false);
 s.units[1].x=8;s.units[1].z=3;
 assert.equal(act(s,'shoot',{id:e.id}).ok,false);
 const copy=structuredClone(s),p=attackPreview(s,'skill',e);assert.equal(p.valid,true);assert.equal(p.cost,1);assert.equal(p.criticalChance,25);assert.deepEqual(s,copy);
 s.cover.push({x:6,z:2,h:2,hp:8});assert.equal(act(s,'skill',e).ok,false);s.cover.pop();
 assert.equal(act(s,'skill',e).ok,true);assert.equal(s.units[0].ap,1);
});
test('lethal critical dissolves immediately; normal lethal shot waits for recovery',()=>{
 let critical=false,normal=false,miss=false;
 for(let seed=0;seed<2000&&!(critical&&normal&&miss);seed++){
  const s=setup(),e=s.units[4];e.hp=6;s.seed=seed;
  const r=act(s,'skill',{id:e.id}),shot=r.effects.find(e=>e.type==='shot');
  if(shot.critical){critical=true;assert.equal(e.hp,0);assert.equal(e.downed,undefined);assert.ok(r.effects.some(e=>e.type==='dissolve'));assert.ok(!r.effects.some(e=>e.type==='downed'));assert.deepEqual(validateSave(packSave(s)),s);}
  else if(shot.hit){normal=true;assert.equal(e.downed.remaining,3);assert.ok(!r.effects.some(e=>e.type==='dissolve'));}
  else {miss=true;assert.equal(e.hp,6);assert.equal(e.downed,undefined);}
 }
 assert.ok(critical&&normal&&miss);
});
test('every class has explicit conditions benefits drawbacks and one-command cost',()=>{
 const s=setup();for(let role=0;role<7;role++){const g=skillInfo(role,s.agents[role]);for(const key of ['condition','benefit','drawback'])assert.ok(g[key].length>10);assert.equal(g.cost,1);}
});
