import assert from 'node:assert/strict';
import {ChalkboardPingPong,SCRATCHES} from '../js/chalkboard-ping-pong-rules.mjs';
const make=()=>new ChalkboardPingPong({random:()=>.5});
let g=make();assert(g.serve());assert(!g.serve());g.advance(2);console.log('Serve sequence',g.phase,g.rally,g.receiver,g.ball,g.reason);assert(g.rally>=1,'AI can return a normal serve');
g=make();g.phase='rally';g.receiver=0;g.lastHitter=1;g.bounces=1;g.ball={x:0,y:1.5,z:3.3};assert(g.smashReady);assert(g.swing(0,true));assert(g.v.z<0);assert.equal(g.rally,1);assert(!g.swing(0));
g=make();g.phase='rally';g.receiver=0;g.lastHitter=1;g.bounces=1;g.ball={x:0,y:.5,z:3.3};assert(!g.smashReady);assert(!g.swing(0,true));
g=make();g.phase='rally';g.receiver=0;g.lastHitter=1;g.bounces=0;g.ball={x:0,y:1.5,z:3.3};assert(!g.swing(0));
g=make();g.serve();g.ball={x:0,y:.3,z:.2};g.v={x:0,y:0,z:-100};g.step(.01);assert.equal(g.reason,'net');assert.deepEqual(g.scores,[0,1]);
g=make();g.serve();g.ball={x:3,y:.2,z:-2};g.v={x:0,y:-5,z:0};g.advance(.1);assert.equal(g.reason,'out');assert.deepEqual(g.scores,[0,1]);
g=make();g.serve();g.ball={x:0,y:.11,z:-2};g.v={x:0,y:-3,z:-2};g.bounce();assert.equal(g.bounces,1);g.bounce();assert.equal(g.reason,'double');assert.deepEqual(g.scores,[1,0]);
for(const p of SCRATCHES){g=make();g.phase='rally';g.receiver=p.z>0?0:1;g.lastHitter=1-g.receiver;g.ball={x:p.x,y:.11,z:p.z};g.v={x:0,y:-3,z:1};g.bounce();assert.equal(g.v.x,p.kick);assert.equal(g.scratch,p);}
g=make();g.phase='rally';g.receiver=0;g.lastHitter=1;g.ball={x:0,y:.11,z:1};g.v={x:0,y:-3,z:1};g.bounce();assert.equal(g.v.x,0);
g=make();for(let i=0;i<5;i++){g.serve();g.point(0,'double');if(i<4){assert.equal(g.phase,'point');g.prepare();}}assert.equal(g.phase,'results');assert.equal(g.scores[0],5);
g=make();g.serve();for(let i=0;i<240*15&&g.phase==='rally';i++){if(g.receiver===0){const p=g.paddles[0],b=g.ball;g.setPaddle(b.x,3.3);if(g.canHit(0))g.swing();}g.step(1/240);}assert(g.bestRally>=4,'Several return rallies are possible');console.log('PASS: AI serve return, hit timing, smash height, swept net contact, out/double-bounce scoring, all four scratch patches, first-to-five and rallies.',g.bestRally);
