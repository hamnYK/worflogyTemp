import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,validateSave,packSave,chance} from '../src/rules.js';
import {attackPreview} from '../src/attack-preview.js';
test('attack preview preserves state and matches actual damage/chance/AP',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);const copy=structuredClone(s),p=attackPreview(s,'shoot',{id:'e0',x:7,z:2});
 assert.deepEqual(s,copy);assert.equal(p.probability,chance(s,s.units[0],s.units[4]));assert.equal(p.damage,4);assert.equal(p.cost,1);assert.equal(p.valid,true);
 const no=attackPreview(s,'shoot',{id:'e7',x:12,z:10});assert.equal(no.valid,false);assert.equal(no.probability,null);
});
test('data blast preview matches affected grid and warns about friendly damage',()=>{
 const s=newGame('human',[2,0,4,5]);const p=attackPreview(s,'skill',{x:1,z:2});assert.equal(p.cells.length,5);assert.equal(p.damage,4);assert.ok(p.allies.includes('FAULT'));assert.equal(p.probability,100);
});
test('lethal damage incapacitates; three subsequent rounds to recover then dissolves',()=>{
 const s=newGame('human',[2,0,4,5]);s.units[1].hp=3;const r=act(s,'skill',{x:1,z:4});assert.equal(r.ok,true);
 const down=s.units[1];assert.equal(down.hp,0);assert.equal(down.downed.remaining,3);assert.ok(r.effects.some(e=>e.type==='downed'));assert.ok(!r.effects.some(e=>e.type==='dissolve'));
 assert.deepEqual(validateSave(packSave(s)),s);
 for(let n=0;n<3;n++){s.units.filter(u=>u.team==='enemy').forEach(e=>e.jammed=1);enemyTurn(s);assert.equal(down.downed.remaining,3-n);}
 s.units.filter(u=>u.team==='enemy').forEach(e=>e.jammed=1);const effects=enemyTurn(s);assert.equal(down.downed,undefined);assert.ok(effects.some(e=>e.type==='dissolve'&&e.id===down.id));
});
test('repair revives downed ally with 5 HP and next-turn action; invalid timer rejected',()=>{
 const s=newGame('human',[2,0,4,5]);s.units[1].hp=3;act(s,'skill',{x:1,z:4});s.selected='p2';assert.equal(act(s,'skill',{id:'p1'}).ok,true);assert.equal(s.units[1].hp,5);assert.equal(s.units[1].ap,0);assert.equal(s.units[1].downed,undefined);
 const bad=packSave(s);bad.units[1].downed={remaining:9,at:1};assert.throws(()=>validateSave(bad));
});

