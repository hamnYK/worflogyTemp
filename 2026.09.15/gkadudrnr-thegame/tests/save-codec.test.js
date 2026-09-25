import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,packSave,validateSave} from '../src/rules.js';
test('v2 omits immutable definitions and unchanged positions, retains exact progression',()=>{
 for(const faction of ['human','ai']){
  const s=newGame(faction),d=packSave(s);assert.equal(d.version,2);assert.equal(d.state,undefined);
  assert.deepEqual(d.units,s.units.map(u=>({id:u.id})));assert.deepEqual(d.cover,[]);
  assert.ok(JSON.stringify(d).length<JSON.stringify({state:s}).length*.55);
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(d))),s);
  act(s,'move',{x:2,z:2});act(s,'watch',{direction:'rear'});enemyTurn(s);
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(packSave(s)))),s);
 }
});
test('legacy JSON migrates to v2 without losing damage, supplies, objectives or recovery',()=>{
 const s=newGame('ai');s.cover[0].hp=0;s.units[0].hp=0;s.units[0].ap=0;s.units[0].downed={remaining:2,at:1};s.units[1].supplies.batteries=1;s.defense.nodes[0].breach=2;
 const old={format:'null-sector-save',version:1,state:s};const d=packSave(validateSave(old));
 assert.equal(d.cover.length,1);assert.deepEqual(Object.keys(d.cover[0]),['id','hp']);assert.equal(d.units[0].name,undefined);
 assert.deepEqual(validateSave(d),s);
});
test('v2 rejects injected definitions, invalid references and malformed progress',()=>{
 for(const corrupt of [
  d=>d.contentVersion=9,d=>d.mission='unknown',d=>d.units[0].name='injected',d=>d.units[0].maxHp=999,
  d=>d.units[0].hp=999,d=>d.units[0].id='e0',d=>d.units.pop(),d=>d.units[0].supplies={charge:99,batteries:1,kits:1},
  d=>d.cover=[{id:'unknown',hp:0}],d=>d.cover=[{id:'c3-2',hp:0},{id:'c3-2',hp:0}],
  d=>d.agents[0].weapon='sniper',d=>delete d.progress.turn,d=>d.progress.log=['x'.repeat(301)],
  d=>d.units[0].downed={remaining:9,at:1},d=>d.roster=[0,0,1,2]
 ]){const d=packSave(newGame());corrupt(d);assert.throws(()=>validateSave(d));}
});
test('packing strips unrelated developer fields and returns an independent snapshot',()=>{
 const s=newGame();s.debugSecret='internal';s.units[0].debug='internal';const d=packSave(s);
 assert.ok(!JSON.stringify(d).includes('internal'));d.agents[0].xp=100;assert.equal(s.agents[0].xp,0);
});
