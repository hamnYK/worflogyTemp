import {World,Body,Vec3,Box,Plane,Material,ContactMaterial} from '../lib/cannon-es.mjs';
export const RING={x:4,z:4.5,hx:.9,hy:.15,hz:.42};
export const PRESS=[[-.86,-.38],[0,-.38],[.86,-.38],[.86,0],[.86,.38],[0,.38],[-.86,.38],[-.86,0]];
const cross=(o,a,b)=>(a.x-o.x)*(b.z-o.z)-(a.z-o.z)*(b.x-o.x);
export function footprint(body){
 const h=body.shapes[0].halfExtents;
 const points=[];for(const x of [-h.x,h.x])for(const y of [-h.y,h.y])for(const z of [-h.z,h.z]){
 const p=body.pointToWorldFrame(new Vec3(x,y,z));points.push({x:p.x,z:p.z});
 }points.sort((a,b)=>a.x-b.x||a.z-b.z);
 const lower=[],upper=[];for(const p of points){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for(const p of points.slice().reverse()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
// Overhang is allowed: fully mounted means the entire upper body is off the floor.
// Contact with the opponent and settled motion are checked by judge()/step().
export function fullyOnTop(upper,lower){
 const h=upper.shapes[0].halfExtents;let bottom=Infinity;
 for(const x of [-h.x,h.x])for(const y of [-h.y,h.y])for(const z of [-h.z,h.z])bottom=Math.min(bottom,upper.pointToWorldFrame(new Vec3(x,y,z)).y);
 return upper.position.y>lower.position.y+.06&&bottom>.025;
}
export function fullyOutside(body){
 const poly=footprint(body),ring=[{x:-4,z:-4.5},{x:4,z:-4.5},{x:4,z:4.5},{x:-4,z:4.5}],axes=[{x:1,z:0},{x:0,z:1}];
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];axes.push({x:b.z-a.z,z:a.x-b.x});}
 return axes.some(a=>{const p=poly.map(v=>v.x*a.x+v.z*a.z),r=ring.map(v=>v.x*a.x+v.z*a.z);return Math.max(...p)<Math.min(...r)-1e-7||Math.min(...p)>Math.max(...r)+1e-7;});
}
export function topAt(body,x,z){
 const origin=body.pointToLocalFrame(new Vec3(x,20,z)),dir=body.vectorToLocalFrame(new Vec3(0,-1,0));let lo=0,hi=40;
 for(const axis of ['x','y','z']){const h=body.shapes[0].halfExtents[axis];
 if(Math.abs(dir[axis])<1e-9){if(Math.abs(origin[axis])>h)return null;continue;}
 let a=(-h-origin[axis])/dir[axis],b=(h-origin[axis])/dir[axis];if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return null;
 }return 20-lo;
}
export class EraserWrestling{
 constructor({random=Math.random}={}){this.random=random;this.reset();}
 reset(){
 this.world=new World({gravity:new Vec3(0,-9.81,0)});this.world.solver.iterations=20;
 const rubber=new Material(),paper=new Material();
 this.world.addContactMaterial(new ContactMaterial(rubber,paper,{friction:.035,restitution:.12}));
 this.world.addContactMaterial(new ContactMaterial(rubber,rubber,{friction:.12,restitution:.08}));
 const floor=new Body({mass:0,material:paper,shape:new Plane()});floor.quaternion.setFromEuler(-Math.PI/2,0,0);this.world.addBody(floor);
 this.bodies=[1,-1].map((sign,i)=>{const b=new Body({mass:.035,material:rubber,shape:new Box(new Vec3(RING.hx,RING.hy,RING.hz)),position:new Vec3(sign*.25,RING.hy+.001,sign*1.7),linearDamping:.16,angularDamping:.18});b.quaternion.setFromEuler(0,i?.12:-.12,0);this.world.addBody(b);return b;});
 this.turn=0;this.moves=0;this.phase='ready';this.winner=null;this.reason=null;this.time=0;this.still=0;
 }
 pressPoint(index,slot){
 const b=this.bodies[index],h=b.shapes[0].halfExtents,[px,pz]=PRESS[slot],x=px*h.x/RING.hx,z=pz*h.z/RING.hz,up=b.vectorToWorldFrame(new Vec3(0,1,0)).y>=0?1:-1;
 const p=b.pointToWorldFrame(new Vec3(x,up*h.y,z));p.y=topAt(b,p.x,p.z)??p.y;return p;
 }
 accessible(index,slot){
 const p=this.pressPoint(index,slot),own=topAt(this.bodies[index],p.x,p.z),above=topAt(this.bodies[1-index],p.x,p.z);
 return own!==null&&p.y>=own-.04&&(above===null||above<=p.y+.02);
 }
 launch(slot,power){
 if(this.phase!=='ready'||!Number.isInteger(slot)||slot<0||slot>=8||!Number.isFinite(power)||!this.accessible(this.turn,slot))return false;
 const b=this.bodies[this.turn],p=this.pressPoint(this.turn,slot),dx=p.x-b.position.x,dz=p.z-b.position.z,d=Math.hypot(dx,dz);
 if(d<.05)return false;
 const strength=Math.max(1,Math.min(10,power)),lift=2.3+strength*.3,travel=.65+strength*.36;
 const impulse=new Vec3(dx/d*travel*b.mass,lift*b.mass,dz/d*travel*b.mass);
 const r=p.vsub(b.position);r.y=0;r.scale(-.3,r);b.applyImpulse(impulse,r);
 this.moves++;this.time=0;this.still=0;this.phase='moving';return true;
 }
 finish(winner,reason){this.winner=winner;this.reason=reason;this.phase=winner===0?'won':'lost';}
 judge(){
 const out=this.bodies.map(fullyOutside);if(out[0]||out[1]){this.finish(out[0]&&out[1]?1-this.turn:out[0]?1:0,'outside');return true;}
 for(let i=0;i<2;i++){
 const upper=this.bodies[i],lower=this.bodies[1-i];
 const supported=upper.position.y>lower.position.y+.06&&this.world.contacts.some(c=>((c.bi===upper&&c.bj===lower)||(c.bi===lower&&c.bj===upper))&&Math.abs(c.ni.y)>.35);
 const touchesFloor=this.world.contacts.some(c=>((c.bi===upper&&c.bj.mass===0)||(c.bj===upper&&c.bi.mass===0))&&Math.abs(c.ni.y)>.35);
 if(supported&&!touchesFloor&&fullyOnTop(upper,lower)){this.finish(i,'ride');return true;}
 if(supported&&PRESS.every((_,slot)=>!this.accessible(1-i,slot))){this.finish(i,'blocked');return true;}
 }
 return false;
 }
 step(dt){
 if(this.phase!=='moving')return;this.time+=dt;this.world.step(dt);
 const stopped=this.bodies.every(b=>b.velocity.length()<.07&&b.angularVelocity.length()<.15);this.still=stopped?this.still+dt:0;
 if(this.still>.45||this.time>12){
 this.bodies.forEach(b=>{b.velocity.setZero();b.angularVelocity.setZero();});
 if(!this.judge()){this.turn=1-this.turn;this.phase='ready';}
 }
 }
 planAI(){
 const a=this.bodies[1],b=this.bodies[0],dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,d=Math.hypot(dx,dz);
 let best=null;
 for(let slot=0;slot<8;slot++)if(this.accessible(1,slot)){
 const p=this.pressPoint(1,slot),vx=p.x-a.position.x,vz=p.z-a.position.z,len=Math.hypot(vx,vz);
 const score=(vx*dx+vz*dz)/(len*(d||1))+(this.random()-.5)*.12;
 if(!best||score>best.score)best={slot,score};
 }
 if(!best)return null;
 // Same edge/force inputs as the player; modest aiming uncertainty.
 return {slot:best.slot,power:Math.max(1,Math.min(8,(d-1.2)*1.6+(this.random()-.5)*1.2))};
 }
 advance(seconds){for(let t=0;t<seconds;t+=1/240)this.step(Math.min(1/240,seconds-t));}
}
