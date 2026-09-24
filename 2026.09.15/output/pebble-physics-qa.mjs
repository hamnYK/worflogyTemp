import assert from 'node:assert/strict';
import {PebbleSurface,PEBBLE} from '../js/pebble-physics.mjs';
import {PebbleTerritory,distance} from '../js/pebble-territory-rules.mjs';
let seed=17;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let n=0;n<60;n++){const surface=new PebbleSurface({random});assert(surface.obstacles.length>=3&&surface.obstacles.length<=5);surface.obstacles.forEach((b,i)=>{assert(b.x>b.radius&&b.x<1000-b.radius&&b.y>b.radius&&b.y<640-b.radius);assert([220,780].every(x=>Math.hypot(b.x-x,b.y-320)>b.radius+100));assert(surface.obstacles.slice(i+1).every(c=>distance(b,c)>b.radius+c.radius));});}
const start={x:220,y:320},surface=new PebbleSurface({random:()=>.123,obstacles:[]});
const strong=surface.simulate(start,0,100),weak=surface.simulate(start,0,25);
console.log('Free travel',distance(start,weak.end),distance(start,strong.end));
assert(distance(start,strong.end)<440&&distance(start,strong.end)>220);assert(distance(start,weak.end)<distance(start,strong.end)*.4);
assert.deepEqual(surface.simulate(start,0,100),strong,'Same surface/input gives identical fixed-step trajectory');
assert(strong.path.some(p=>Math.abs(p.y-start.y)>1),'Uneven surface produces a curved trace');
surface.commit(strong);assert(surface.trails.length);assert(surface.depth.some(n=>n>0));
const grooved=surface.simulate(start,0,100);console.log('Rut changes landing by',distance(grooved.end,strong.end));assert(distance(grooved.end,strong.end)>1,'Visible previous trail alters later physics');
const blocker=new PebbleSurface({random:()=>.123,obstacles:[{x:330,y:320,radius:30,rotation:0}]});
const soft=blocker.simulate(start,0,40),hard=blocker.simulate(start,0,100);
console.log('Obstacle displacement low/high',distance(soft.rocks[0],blocker.obstacles[0]),distance(hard.rocks[0],blocker.obstacles[0]),'hits',soft.hits.length,hard.hits.length);
assert(hard.hits.length>0);assert(distance(hard.rocks[0],blocker.obstacles[0])>2);assert(distance(hard.rocks[0],blocker.obstacles[0])>distance(soft.rocks[0],blocker.obstacles[0]));
assert(distance(hard.end,strong.end)>80,'Collision changes landing substantially');
const distant=new PebbleSurface({random:()=>.123,obstacles:[{x:450,y:320,radius:30,rotation:0}]});
const farHit=distant.simulate(start,0,100);assert(distance(farHit.rocks[0],distant.obstacles[0])<distance(hard.rocks[0],blocker.obstacles[0]),'Longer approach loses impact energy to sand');
assert(hard.frames.every(f=>Number.isFinite(f.stone.x)&&f.rocks.every(b=>Number.isFinite(b.x))));assert(hard.duration<8);
blocker.commit(hard);assert.deepEqual(blocker.obstacles,hard.rocks);assert(blocker.trails.some(t=>t.width>PEBBLE.radius));
// Ownership follows the actual bent trace, rather than a straight endpoint chord.
const game=new PebbleTerritory();game.place({x:220,y:320});
const curved=[{x:220,y:320},{x:400,y:200},{x:430,y:400},{x:220,y:320}];
const claim=game.shoot(curved.at(-1),curved);assert.equal(claim.reason,'captured');assert(claim.gained>0);
const bad=new PebbleTerritory();assert.equal(bad.shoot({x:200,y:320},[{x:0,y:0},{x:200,y:320}]).reason,'trace');
console.log('PASS: random obstacle layout, short rough rolling, deterministic simulation, persistent grooves, mass-dependent impacts, displaced blockers and curved-path ownership.');
