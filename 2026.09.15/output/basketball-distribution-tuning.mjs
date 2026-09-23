import fs from 'node:fs';
const src=fs.readFileSync('js/basketball-physics.mjs','utf8').replace("'../lib/cannon-es.mjs'",JSON.stringify(new URL('../lib/cannon-es.mjs',import.meta.url).href));
const heading=src.replace("Math.PI/2-tilt,heading,(random()-.5)*.2","Math.PI/2-tilt,heading,0,'YXZ'");
const hook=" // Coulomb friction at impact uses the normal collision impulse, not only weight.\n const makeFriction=world.narrowphase.createFrictionEquationsFromContact;\n world.narrowphase.createFrictionEquationsFromContact=function(contact,out){\n  const start=out.length,result=makeFriction.call(this,contact,out);\n  if(contact.bi===floor||contact.bj===floor){\n   const closing=Math.max(0,contact.getImpactVelocityAlongNormal());\n   const arm=contact.bi===body?contact.ri:contact.rj;\n   const cross=arm.cross(contact.ni);\n   const invI=body.invInertiaWorld.vmult(cross);\n   const inverseMass=body.invMass+cross.dot(invI);\n   const impulse=(1+contact.restitution)*closing/inverseMass;\n   const cap=IMPACT_MU*impulse/Math.SQRT2;\n   for(let i=start;i<out.length;i++){out[i].maxForce=Math.max(out[i].maxForce*world.dt,cap);out[i].minForce=-out[i].maxForce;}\n  }\n  return result;\n };\n";const variants={};
for(const mu of [.06,.12,.2]){
variants['impact-'+mu]=heading.replace('Math.PI/2-tilt,heading','1.0+tilt*.2,heading').replace('friction:.08,restitution:.48','friction:.025,restitution:.58').replace('48+power*1.5','65+power*3').replace('world.addBody(body);','world.addBody(body);'+hook.replace('IMPACT_MU',mu));
}

for(const [name,code] of Object.entries(variants)){
const {tossPhysics}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
for(const power of [4,8,14]){
let distances=[],spins=[],rear=0,bins=Array(8).fill(0),escaped=0;
for(let run=0;run<32;run++){
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
console.log(JSON.stringify({name,power,distance:avg(distances),spin3:avg(spins),rear,bins,escaped}));
}
}