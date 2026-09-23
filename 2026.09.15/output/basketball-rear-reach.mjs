import fs from 'node:fs';
const source=fs.readFileSync('js/basketball-physics.mjs','utf8').replace("'../lib/cannon-es.mjs'","'"+new URL('../lib/cannon-es.mjs',import.meta.url).href+"'");
for(const [name,axis,friction] of [['current',false,.08],['axle',true,.08],['axle-grip',true,.16],['axle-slide',true,.04]]){
let code=source.replace('friction:.08','friction:'+friction);
if(axis)code=code.replace('body.angularVelocity.set(Math.cos(heading)*3.5,spin,Math.sin(heading)*3.5);','body.angularVelocity.copy(body.vectorToWorldFrame(new Vec3(0,spin,0)));');
const {tossPhysics}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
let rear=0,escaped=0,minZ=99;
for(let run=0;run<64;run++){
 let seed=Math.imul(run+1,2654435761)>>>0;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const s=tossPhysics({x:0,y:.31,z:4.5},8,random);let reached=false;
 for(let step=0;step<3360;step++){s.world.step(1/240);const p=s.body.position,w=s.body.angularVelocity.length();minZ=Math.min(minZ,p.z);if(Math.abs(p.x)>8.5||Math.abs(p.z)>8.5){escaped++;break;}if(s.bounces&&w<.8)break;if(p.z<-.9&&p.y<1.5&&w>.8)reached=true;}
 if(reached)rear++;
}console.log({name,rear,escaped,minZ});
}
