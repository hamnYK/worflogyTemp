import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,enemyTurn,validateSave,packSave} from '../src/rules.js';
import {enemyIntel} from '../src/enemy-intel.js';
test('scan hides type/status; sight reveals class; only witnessed fire reveals ability',()=>{
 const s=newGame(),enemy=s.units.at(-1);s.scanUntil=2;
 assert.equal(enemyIntel(s,enemy).type,'병과 미확인');assert.equal(enemyIntel(s,enemy).status,'상태 미확인');
 s.cover.forEach(c=>c.hp=0);s.units[0].x=12;s.units[0].z=9;
 assert.equal(enemyIntel(s,enemy).type,'일반 전투병');assert.equal(enemyIntel(s,enemy).ability,'능력 미확인');
 s.units.filter(u=>u.team==='enemy'&&u!==enemy).forEach(u=>u.jammed=1);
 enemyTurn(s);assert.equal(enemy.observedLaser,true);assert.equal(enemyIntel(s,enemy).ability,'관찰: 레이저 사격');assert.deepEqual(validateSave(packSave(s)),s);
});
