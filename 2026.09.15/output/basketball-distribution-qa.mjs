import fs from 'node:fs';
import assert from 'node:assert/strict';
const reports=[];
const src=fs.readFileSync('js/basketball-physics.mjs','utf8').replace("'../lib/cannon-es.mjs'",JSON.stringify(new URL('../lib/cannon-es.mjs',import.meta.url).href));
const heading=src.replace("Math.PI/2-tilt,heading,(random()-.5)*.2","Math.PI/2-tilt,heading,0,'YXZ'");
const variants={current:src};
for(const [name,code] of Object.entries(variants)){
const {tossPhysics}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
for(const power of [4,8,14]){
let distances=[],spins=[],rear=0,bins=Array(8).fill(0),escaped=0;
for(let run=0;run<96;run++){
let seed=Math.imul(run+1,2654435761)>>>0;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const s=tossPhysics({x:0,y:.31,z:4.5},power,random);let impact=-1,maxdist=0,back=false;
for(let i=0;i<240*8;i++){
s.world.step(1/240);const p=s.body.position;
if(s.bounces&&impact<0)impact=i;
if(impact>=0){
maxdist=Math.max(maxdist,Math.hypot(p.x,p.z-4.5));
if(i-impact===120)bins[Math.floor((Math.atan2(p.z-4.5,p.x)+Math.PI)/(2*Math.PI)*8)%8]++;
if(p.z<-.9&&p.y<1.5)back=true;
if(i-impact===720){spins.push(s.body.angularVelocity.length());break;}
}
if(Math.abs(p.x)>8.5||Math.abs(p.z)>8.5){escaped++;break;}
}
distances.push(maxdist);if(back)rear++;
}
const avg=a=>+(a.reduce((a,b)=>a+b,0)/a.length).toFixed(2);
const report={name,power,distance:avg(distances),spin3:avg(spins),rear,bins,escaped};
reports.push(report);console.log(JSON.stringify(report));
assert(bins.every(n=>n>0),'Release directions must cover all eight sectors');
assert(report.spin3>15,'Spin must persist three seconds after landing');
}
}
assert(reports[1].distance>reports[0].distance*1.1);
assert(reports[2].distance>reports[1].distance*1.1);
assert(reports[2].rear>=20,'Strong toss must reach the rear of the hoop');
console.log('PASS: 288 seeded tosses, directional coverage, retained spin and height-dependent travel.');
