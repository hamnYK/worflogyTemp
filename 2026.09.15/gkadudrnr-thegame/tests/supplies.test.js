import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,packSave,validateSave} from '../src/rules.js';
import {makeAgents} from '../src/operation.js';
import {attackPreview} from '../src/attack-preview.js';
test('loadout capacities, reload cost and cooldown persist through save',()=>{
 const agents=makeAgents();agents[0].weapon='impact';const s=newGame('human',[0,3,4,5],agents);
 assert.equal(s.units[0].supplies.charge,4);assert.equal(s.units[1].supplies.charge,4);assert.equal(s.units[2].supplies.charge,6);
 const u=s.units[0];u.supplies.charge=1;u.cooldown=2;assert.equal(act(s,'reload').ok,true);
 assert.deepEqual(u.supplies,{charge:4,batteries:1,kits:1});assert.equal(u.ap,1);assert.equal(u.cooldown,2);
 assert.equal(act(s,'reload').ok,false);assert.equal(u.ap,1);assert.deepEqual(validateSave(packSave(s)),s);
});
test('miss spends charge, empty shot cannot change AP or RNG, previews are read only',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.seed=1900;const before=structuredClone(s);
 attackPreview(s,'shoot',{id:'e0'});assert.deepEqual(s,before);
 const r=act(s,'shoot',{id:'e0'});assert.equal(r.ok,true);assert.equal(r.effects.find(e=>e.type==='shot').hit,false);assert.equal(s.units[0].supplies.charge,5);
 s.units[0].supplies.charge=0;const empty=structuredClone(s);assert.equal(act(s,'shoot',{id:'e0'}).ok,false);assert.deepEqual(s,empty);assert.equal(act(s,'watch',{direction:'front'}).ok,false);
});
test('first aid supports self and adjacent allies but not full HP, distant or downed units',()=>{
 const s=newGame(),u=s.units[0];assert.equal(act(s,'firstaid').ok,false);u.hp=5;
 assert.equal(act(s,'firstaid').ok,true);assert.equal(u.hp,8);assert.equal(u.supplies.kits,0);assert.equal(u.ap,1);assert.equal(act(s,'firstaid').ok,false);
 const t=newGame();t.units[1].hp=4;assert.equal(act(t,'firstaid',{id:'p1'}).ok,false);
 t.units[1].z=3;assert.equal(act(t,'firstaid',{id:'p1'}).ok,true);assert.equal(t.units[1].hp,7);
 const d=newGame();d.units[1].z=3;d.units[1].hp=0;d.units[1].ap=0;d.units[1].downed={remaining:3,at:1};assert.equal(act(d,'firstaid',{id:'p1'}).ok,false);assert.equal(d.units[0].supplies.kits,1);
});
test('overwatch uses its last charge once, enemy reloads instead of firing empty',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);
 const e=s.units[4];e.x=10;e.z=2;e.jammed=0;const u=s.units[0];u.supplies.charge=1;act(s,'watch',{direction:'front'});
 const effects=enemyTurn(s);assert.equal(effects.filter(f=>f.type==='shot'&&f.from.id==='p0').length,1);assert.equal(u.supplies.charge,0);
 const t=newGame();t.cover.forEach(c=>c.hp=0);t.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);t.units[4].jammed=0;t.units[4].supplies.charge=0;
 const f=enemyTurn(t);assert.equal(f.filter(f=>f.type==='shot'&&f.from.id==='e0').length,0);assert.equal(t.units[4].supplies.charge,6);assert.equal(t.units[4].supplies.batteries,1);
});
test('legacy save gets initial supplies once; current save rejects missing or invalid supplies',()=>{
 const old={format:'null-sector-save',version:1,state:newGame()};delete old.state.suppliesVersion;old.state.units.forEach(u=>delete u.supplies);
 const restored=validateSave(old);assert.equal(restored.units[0].supplies.batteries,2);restored.units[0].supplies.batteries=0;
 assert.equal(validateSave(packSave(restored)).units[0].supplies.batteries,0);
 for(const change of [s=>delete s.units[0].supplies,s=>s.units[0].supplies.charge=7,s=>s.units[0].supplies.kits=-1]){const data={format:'null-sector-save',version:1,state:newGame()};change(data.state);assert.throws(()=>validateSave(data));}
});
