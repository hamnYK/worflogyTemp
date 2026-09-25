import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,act,enemyTurn,outcome,packSave,validateSave} from '../src/rules.js';

test('each attack or movement is one command; two shots allowed, long move rejected',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);s.units[4].x=5;s.units[4].z=2;
 assert.equal(act(s,'shoot',{id:'e0'}).ok,true);assert.equal(s.units[0].ap,1);
 assert.equal(act(s,'shoot',{id:'e0'}).ok,true);assert.equal(s.units[0].ap,0);
 const m=newGame();m.cover.forEach(c=>c.hp=0);
 assert.equal(act(m,'move',{x:6,z:2}).ok,false);assert.equal(m.units[0].ap,2);
 assert.equal(act(m,'move',{x:4,z:2}).ok,true);assert.equal(m.units[0].ap,1);
});
test('watch costs one command; skill remains usable; movement reaction is one free shot',()=>{
 const s=newGame();s.cover.forEach(c=>c.hp=0);
 s.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);
 const enemy=s.units[4];enemy.jammed=0;enemy.x=10;enemy.z=2;
 assert.equal(act(s,'watch',{direction:'front'}).ok,true);assert.equal(s.units[0].ap,1);
 assert.equal(act(s,'watch',{direction:'front'}).ok,false);assert.equal(s.units[0].ap,1);
 assert.equal(act(s,'skill').ok,true);assert.equal(s.units[0].ap,0);assert.equal(s.units[0].watch,true);
 const effects=enemyTurn(s);assert.equal(effects.filter(e=>e.type==='shot'&&e.from.id==='p0').length,1);
 assert.equal(s.units[0].watchFiredTurn,1);assert.equal(s.units[0].ap,2);assert.equal(s.units[0].watch,false);
 assert.deepEqual(validateSave(packSave(s)),s);
});
test('final allowed player turn is playable; expiry follows its enemy phase',()=>{
 const s=newGame();s.turnLimit=2;s.turn=2;s.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);
 outcome(s);assert.equal(s.status,'active');enemyTurn(s);assert.equal(s.status,'lost');
 const win=newGame();win.turnLimit=2;win.turn=2;win.carrier='p0';outcome(win);assert.equal(win.status,'won');
 const defense=newGame('ai');defense.turnLimit=8;defense.turn=8;defense.units.filter(u=>u.team==='enemy').forEach(u=>u.jammed=1);enemyTurn(defense);assert.equal(defense.status,'won');
 const broken=packSave(newGame());broken.progress.turnLimit=0;assert.throws(()=>validateSave(broken));
});
