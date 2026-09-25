import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,validateSave,packSave,outcome,ROLES} from '../src/rules.js';
test('both missions field four players against eight enemies including opposing agents',()=>{
 for(const faction of ['human','ai']){
  const s=newGame(faction),enemies=s.units.filter(u=>u.team==='enemy');
  assert.equal(s.units.filter(u=>u.team==='player').length,4);assert.equal(enemies.length,8);
  assert.deepEqual(enemies.slice(0,4).map(u=>u.name),ROLES.slice(0,4).map(r=>faction==='human'?r.ai:r.code));
  assert.deepEqual(validateSave(packSave(s)),s);
 }
});
test('old four-enemy saves resume unchanged; truncated new saves are rejected',()=>{
 const old=newGame('human',undefined,undefined,1);delete old.encounterVersion;
 assert.deepEqual(validateSave({format:'null-sector-save',version:1,state:old}),old);
 assert.deepEqual(validateSave(packSave(old)),{...old,encounterVersion:1});
 const bad=newGame();bad.units.length=8;assert.throws(()=>validateSave(packSave(bad)));
});
test('eliminating only four of eight attackers does not win defense',()=>{
 const s=newGame('ai'),enemies=s.units.filter(u=>u.team==='enemy');
 enemies.slice(0,4).forEach(u=>u.hp=0);outcome(s);assert.equal(s.status,'active');
 enemies.forEach(u=>u.hp=0);outcome(s);assert.equal(s.status,'won');
});
