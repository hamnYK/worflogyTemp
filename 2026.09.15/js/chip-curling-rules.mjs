import {World,Body,Vec3,Box,Cylinder,Material,ContactMaterial} from '../lib/cannon-es.mjs';
export const CURL={radius:.34,halfWidth:3.4,halfLength:9,targetZ:-5};
export const JUNK=[
 {kind:'eraser',radius:.5,width:.8,depth:.5,mass:1.6,drag:1.0},
 {kind:'cap',radius:.38,mass:.55,drag:.55},
 {kind:'block',radius:.48,width:.68,depth:.68,mass:2.4,drag:.9},
 {kind:'button',radius:.32,mass:.4,drag:.65},
 {kind:'nut',radius:.35,mass:2,drag:.6}
];
export class ChipCurling{
 constructor({random=Math.random}={}){this.random=random;this.reset();}
 reset(){
 this.chips=[];this.phase='ready';this.shots=0;this.score=0;this.ringScore=0;this.bonus=0;
 this.world=new World({gravity:new Vec3(0,0,0)});this.world.solver.iterations=12;
 this.material=new Material();this.world.addContactMaterial(new ContactMaterial(this.material,this.material,{friction:0,restitution:.72}));
 const types=[...JUNK];for(let i=types.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
 const offset=this.random()*Math.PI*2;
 this.junk=types.slice(0,3).map((type,i)=>{
 const a=offset+i*Math.PI*2/3+(this.random()-.5)*.25,r=1.05+this.random()*.35;
 const item={...type,x:Math.sin(a)*r,z:CURL.targetZ+Math.cos(a)*r,vx:0,vz:0,angle:this.random()*Math.PI*2,spin:0};
 this.addBody(item);return item;
 });
 }
 addBody(item){
 const shape=item.width?new Box(new Vec3(item.width/2,.12,item.depth/2)):new Cylinder(item.radius,item.radius,.24,32);
 const body=new Body({mass:item.mass,material:this.material,shape,position:new Vec3(item.x,0,item.z),linearDamping:0,angularDamping:0,linearFactor:new Vec3(1,0,1),angularFactor:new Vec3(0,1,0)});
 body.quaternion.setFromEuler(0,item.angle,0);item.body=body;this.world.addBody(body);
 }
 launch(power,aim=0,spin=0){
 if(this.phase!=='ready'||![power,aim,spin].every(Number.isFinite))return false;
 const p=Math.max(1,Math.min(7,power)),a=Math.max(-.35,Math.min(.35,aim));
 const chip={x:0,z:7,vx:Math.sin(a)*p,vz:-Math.cos(a)*p,spin:Math.max(-1,Math.min(1,spin)),angle:0,radius:CURL.radius,mass:1,drag:.8};
 this.addBody(chip);chip.body.velocity.set(chip.vx,0,chip.vz);chip.body.angularVelocity.y=chip.spin*2;this.chips.push(chip);
 this.shots++;this.phase='moving';this.elapsed=0;return true;
 }
 updateScore(){
 this.ringScore=this.chips.reduce((sum,c)=>{const d=Math.hypot(c.x,c.z-CURL.targetZ);return sum+(d<=.65?3:d<=1.3?2:d<=2?1:0);},0);
 // Bonus follows the final layout, so an object pushed back inside no longer scores.
 this.bonus=this.junk.filter(c=>Math.hypot(c.x,c.z-CURL.targetZ)>2+c.radius).length*2;
 this.score=this.ringScore+this.bonus;
 }
 step(dt){
 if(this.phase!=='moving')return;
 this.elapsed+=dt;const pieces=[...this.chips,...this.junk];
 for(const c of pieces){
 const v=c.body.velocity,speed=Math.hypot(v.x,v.z);
 if(speed>.012){
 const turn=c.spin*.07*dt,co=Math.cos(turn),si=Math.sin(turn),vx=v.x*co-v.z*si,vz=v.x*si+v.z*co;
 const factor=Math.max(0,speed-c.drag*dt)/speed;v.x=vx*factor;v.z=vz*factor;
 }else v.x=v.z=0;
 if(c.kind)c.body.angularVelocity.y*=Math.exp(-2*dt);
 }
 this.world.step(dt);
 for(const c of pieces){
 const b=c.body,r=c.radius;
 for(const [axis,limit] of [['x',CURL.halfWidth-r],['z',CURL.halfLength-r]]){
 if(Math.abs(b.position[axis])>limit){b.position[axis]=Math.sign(b.position[axis])*limit;b.velocity[axis]*=-.55;b.aabbNeedsUpdate=true;}
 }
 c.x=b.position.x;c.z=b.position.z;c.vx=b.velocity.x;c.vz=b.velocity.z;c.angle+=b.angularVelocity.y*dt;
 }
 if(this.elapsed>20||pieces.every(c=>Math.hypot(c.vx,c.vz)<.012&&(!c.kind||Math.abs(c.body.angularVelocity.y)<.05))){
 pieces.forEach(c=>{c.vx=c.vz=0;c.body.velocity.setZero();c.body.angularVelocity.setZero();});
 this.updateScore();this.phase=this.shots<3?'ready':this.score>=6?'won':'fail';
 }
 }
 advance(seconds){for(let t=0;t<seconds;t+=1/240)this.step(Math.min(1/240,seconds-t));}
}
