import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene} from 'three';
import {combatVfx} from '../src/combat-vfx.js';
import {unitStatus} from '../src/unit-status.js';
test('laser layers span the same distance; data effects release scene objects',()=>{
 const scene=new Scene(),fx=combatVfx(scene);fx.beam({x:0,z:0},{x:5,z:0});assert.equal(scene.children[0].geometry.parameters.height,scene.children[1].geometry.parameters.height);
 fx.plasma({x:4,z:4});fx.dissolve({x:5,z:5});assert.ok(fx.count>2);fx.update(2);assert.equal(fx.count,0);assert.equal(scene.children.length,0);
});
test('health percentage and injury boundaries, including recovery',()=>{
 assert.equal(unitStatus({hp:8,maxHp:10}).label,'정상');assert.equal(unitStatus({hp:7,maxHp:10}).label,'부상');assert.equal(unitStatus({hp:3,maxHp:10}).label,'부상');assert.equal(unitStatus({hp:2,maxHp:10}).label,'치명상');assert.equal(unitStatus({hp:0,maxHp:10,downed:{remaining:2}}).label,'치명상 · 복구 2턴');
});
