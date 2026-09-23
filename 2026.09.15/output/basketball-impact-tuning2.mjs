import fs from 'node:fs';
const source=fs.readFileSync('js/basketball-physics.mjs','utf8').replace("'../lib/cannon-es.mjs'","'"+new URL('../lib/cannon-es.mjs',import.meta.url).href+"'");
for(const tilt of [.2,.4,.6,1])for(const friction of [.1,.4]){
 const text=source.replace('friction:.32','friction:'+friction).replace('Math.PI/2,0,.12','Math.PI/2-'+tilt+',0,.12').replace('1.5,10+power,2','1.5,2+power*.15,2').replace('angularDamping:.045','angularDamping:.018');
 const {tossPhysics}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
 const rows=[];
 for(const power of [4,8,14]){const s=tossPhysics({x:0,y:.31,z:4.5},power);let pre;for(let i=0;i<1500&&!s.bounces;i++){pre=s.body.angularVelocity.length();s.world.step(1/240);}rows.push([+pre.toFixed(1),+s.body.angularVelocity.length().toFixed(1)]);}
 console.log(JSON.stringify({tilt,friction,rows}));
}
