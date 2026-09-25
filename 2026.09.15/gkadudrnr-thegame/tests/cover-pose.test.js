import test from 'node:test';
import assert from 'node:assert/strict';
import {coverStance} from '../src/cover-pose.js';
test('cover stance follows cardinal direction and height, ignores destroyed and diagonal cover',()=>{
 const unit={x:2,z:2,team:'player'},s={units:[unit,{x:8,z:2,team:'enemy',hp:8}],cover:[{id:'a',x:3,z:2,h:1,hp:4}]};
 assert.equal(coverStance(s,unit).kind,'crouch');assert.equal(coverStance(s,unit).yaw,Math.PI/2);
 s.cover[0].h=2;assert.equal(coverStance(s,unit).kind,'wall');assert.equal(coverStance(s,unit).yaw,Math.PI);
 s.cover[0].hp=0;assert.equal(coverStance(s,unit),null);
 s.cover[0].hp=4;s.cover[0].z=3;assert.equal(coverStance(s,unit),null);
});
