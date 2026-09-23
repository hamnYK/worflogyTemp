import fs from 'node:fs';
const src=fs.readFileSync('js/basketball-physics.mjs','utf8').replace("'../lib/cannon-es.mjs'","'"+new URL('../lib/cannon-es.mjs',import.meta.url).href+"'");
for(const friction of [.32,.08,.025]){
 const code=src.replace('friction:.32','friction:'+friction).replace('16+power*.6','48+power*1.5').replace('angularDamping:.018','angularDamping:.004');
 const {tossPhysics}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const rows=[];for(const seed of [.1,.3,.5,.7,.9]){
 const s=tossPhysics({x:0,y:.31,z:4.5},8,()=>seed);let first=null,stopped=null;
 for(let n=0;n<1440;n++){s.world.step(1/240);const w=s.body.angularVelocity.length();if(s.bounces&&first===null)first={t:n/240,w};if(s.bounces&&w<.8){stopped=n/240;break;}}
 rows.push({seed,first:+first.w.toFixed(1),stop:stopped===null?'>6':+stopped.toFixed(2),end:+s.body.angularVelocity.length().toFixed(1)});
 }console.log(JSON.stringify({friction,rows}));
}
