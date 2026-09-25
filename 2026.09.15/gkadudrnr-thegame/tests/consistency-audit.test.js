import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,validateSave,packSave,dist,pathTo,lineOfSight,chance} from '../src/rules.js';
import {defenseDecision} from '../src/defense.js';
test('internal skill names cannot bypass role, cooldown or command rules',()=>{
 for(const name of ['snipe','heal','blast','drone','scan','dash','jam']){
  const s=newGame();s.units[0].cooldown=3;const before=structuredClone(s);
  assert.equal(act(s,name,{id:'e0',x:2,z:2}).ok,false,name);assert.deepEqual(s,before);
 }
});
test('legacy mission overwatch stops movement at the actual hit cell',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);
 const e=s.units[4];e.x=10;e.z=2;e.hp=1;e.jammed=0;s.units[0].watch=true;s.seed=1;
 const effects=enemyTurn(s),shot=effects.find(f=>f.type==='shot'&&f.from.id==='p0');
 assert.equal(e.hp,0);assert.equal(e.x,shot.to.x);assert.equal(e.z,shot.to.z);
 const move=effects.find(f=>f.type==='move'&&f.id===e.id);assert.deepEqual(move.path.at(-1),{x:e.x,z:e.z});
});
test('empty support weapon with no reserve pursues objective instead of futile shooting',()=>{
 const s=newGame('ai');s.cover.forEach(c=>c.hp=0);const e=s.units[6];e.x=6;e.z=4;e.supplies={charge:0,batteries:0,kits:0};
 assert.notEqual(defenseDecision(s,e,{dist,pathTo,lineOfSight,chance})?.kind,'shoot');
});
test('spending the last charge clears armed overwatch',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units[0].supplies.charge=1;
 act(s,'watch',{direction:'front'});assert.equal(act(s,'shoot',{id:'e0'}).ok,true);assert.equal(s.units[0].watch,false);
});
test('game-generated action sequences remain saveable, failed commands are atomic',()=>{
 for(const faction of ['human','ai'])for(let run=0;run<6;run++){
  const s=newGame(faction,[run%7,(run+1)%7,(run+2)%7,(run+3)%7]);
  for(let turn=0;turn<9&&s.status==='active';turn++){
   for(const u of s.units.filter(u=>u.team==='player'&&u.hp>0)){
    s.selected=u.id;
    for(const [kind,target]of [['skill',{x:4,z:4,id:'e0'}],['reload'],['firstaid'],['shoot',{id:'e0'}],['move',{x:2,z:u.z}],['watch'],['hack']]){
     const before=structuredClone(s),result=act(s,kind,target);if(!result.ok)assert.deepEqual(s,before);
     assert.deepEqual(validateSave(packSave(s)),s);
    }
   }
   enemyTurn(s);assert.deepEqual(validateSave(packSave(s)),s);
  }
 }
});
