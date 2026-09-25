import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,packSave,validateSave} from '../src/rules.js';
import {watchFacing,inWatchArc,facingYaw,facingVector} from '../src/watch-direction.js';
import {Vector3} from 'three';
test('watch requires explicit direction and one AP only after confirmation',()=>{
 const s=newGame(),before=structuredClone(s);assert.equal(act(s,'watch').ok,false);assert.deepEqual(s,before);
 assert.equal(act(s,'watch',{direction:'left'}).ok,true);assert.equal(s.units[0].ap,1);assert.equal(s.units[0].watchFacing,0);
 assert.deepEqual(validateSave(packSave(s)),s);const bad=packSave(s);bad.units[0].watchFacing=4;assert.throws(()=>validateSave(bad));
});
test('model forward and its left/right agree with tactical sectors for every heading',()=>{
 for(let facing=0;facing<4;facing++){
  const yaw=facingYaw({facing});
  for(const [side,vector]of [['rear',new Vector3(0,0,-1)],['front',new Vector3(0,0,1)],['left',new Vector3(1,0,0)],['right',new Vector3(-1,0,0)]]){
   vector.applyAxisAngle(new Vector3(0,1,0),yaw);
   const expected=facingVector(watchFacing({facing},side));
   assert.ok(Math.abs(vector.x-expected.x)<1e-9&&Math.abs(vector.z-expected.z)<1e-9);
  }
 }
});
test('confirmed watch becomes the persistent front after an uneventful enemy turn',()=>{
 for(const direction of ['left','front','right','rear']){
  const s=newGame(),u=s.units[0];s.units.filter(e=>e.team==='enemy').forEach(e=>e.jammed=1);
  const expected=watchFacing(u,direction);assert.ok(act(s,'watch',{direction}).ok);
  assert.equal(u.facing,expected);assert.equal(watchFacing(u,'front'),expected);
  enemyTurn(s);assert.equal(u.watch,false);assert.equal(u.facing,expected);
 }
});
test('both enemy mission types retain the direction of their last shot',()=>{
 for(const faction of ['human','ai']){
  const s=newGame(faction);s.cover.forEach(c=>c.hp=0);
  s.units.filter(e=>e.team==='enemy').forEach(e=>e.jammed=1);
  const e=s.units[6],u=s.units[0];e.x=u.x;e.z=u.z-1;e.jammed=0;e.facing=1;
  const shots=enemyTurn(s).filter(f=>f.type==='shot'&&f.from.id===e.id);assert.ok(shots.length);
  const last=shots.at(-1),dx=last.to.x-last.from.x,dz=last.to.z-last.from.z;
  assert.equal(e.facing,Math.abs(dx)>=Math.abs(dz)?(dx>=0?1:3):(dz>=0?2:0));
 }
});
test('relative sectors rotate with unit facing and include boundaries but exclude rear',()=>{
 for(let facing=0;facing<4;facing++){assert.equal(watchFacing({facing},'left'),(facing+3)%4);assert.equal(watchFacing({facing},'right'),(facing+1)%4);}
 const u={x:0,z:0,watchFacing:1};assert.equal(inWatchArc(u,{x:2,z:2}),true);assert.equal(inWatchArc(u,{x:1,z:2}),false);assert.equal(inWatchArc(u,{x:-1,z:0}),false);
});
test('rear watch saves and guards the opposite sector only',()=>{
 const s=newGame(),u=s.units[0];assert.ok(act(s,'watch',{direction:'rear'}).ok);
 assert.equal(u.ap,1);assert.equal(u.watchFacing,3);
 assert.equal(inWatchArc(u,{x:u.x-1,z:u.z}),true);
 assert.equal(inWatchArc(u,{x:u.x+1,z:u.z}),false);
 assert.deepEqual(validateSave(packSave(s)),s);
});
test('an enemy moving outside the selected arc cannot consume the reaction or battery',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units.filter(u=>u.team==='enemy').forEach(e=>e.jammed=1);
 s.units[4].x=10;s.units[4].z=2;s.units[4].jammed=0;act(s,'watch',{direction:'left'});
 const charge=s.units[0].supplies.charge,effects=enemyTurn(s);assert.equal(effects.filter(e=>e.type==='shot'&&e.from.id==='p0').length,0);assert.equal(s.units[0].supplies.charge,charge);
});
