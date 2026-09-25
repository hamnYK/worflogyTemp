import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,detection,targetName} from '../src/rules.js';
test('scan reveals a signal without identity; direct sight identifies; expired scan hides',()=>{
 const s=newGame(),e=s.units.at(-1);assert.equal(detection(s,e),'hidden');
 s.scanUntil=2;assert.equal(detection(s,e),'signal');assert.equal(targetName(s,e),'미확인 신호');
 s.turn=3;assert.equal(detection(s,e),'hidden');
 s.units[0].x=12;s.units[0].z=9;assert.equal(detection(s,e),'identified');assert.equal(targetName(s,e),e.name);
});
