import {World,Body,Vec3,Box,Plane,Cylinder,Material,ContactMaterial} from '../lib/cannon-es.mjs';
export const BOOK={halfWidth:3,halfLength:4,top:.8,radius:.3,attempts:5};
export const BOOKS={
 paperback:{ko:'얇은 페이퍼백',en:'Thin paperback',lift:1.05,spread:1.7,tilt:1.3,thickness:.25,color:'#d47b54'},
 softcover:{ko:'두꺼운 소프트커버',en:'Thick softcover',lift:.85,spread:2.2,tilt:1.05,thickness:.55,color:'#498b82'},
 hardcover:{ko:'하드커버',en:'Hardcover',lift:.95,spread:3.4,tilt:.85,thickness:.65,color:'#304d7c'}
};
export class ChipBookFlip{
 constructor({random=Math.random,kind='paperback'}={}){this.random=random;this.reset(kind);}
 reset(kind=this.kind){
 if(!BOOKS[kind])kind='paperback';this.kind=kind;this.phase='ready';this.hits=0;this.reason=null;this.time=0;this.still=0;
 this.world=new World({gravity:new Vec3(0,-9.81,0)});this.world.solver.iterations=18;
 const chipMat=new Material(),bookMat=new Material();
 this.world.addContactMaterial(new ContactMaterial(chipMat,bookMat,{friction:.025,restitution:.24}));
 this.world.addContactMaterial(new ContactMaterial(chipMat,chipMat,{friction:.02,restitution:.35}));
 const book=new Body({mass:0,material:bookMat,shape:new Box(new Vec3(3,.4,4)),position:new Vec3(0,.4,0)});this.world.addBody(book);
 const floor=new Body({mass:0,material:bookMat,shape:new Plane(),position:new Vec3(0,-.7,0)});floor.quaternion.setFromEuler(-Math.PI/2,0,0);this.world.addBody(floor);
 this.chips=[[-.95,.75],[.95,.75],[0,-.95]].map(([x,z])=>{
 const b=new Body({mass:.012,material:chipMat,shape:new Cylinder(.3,.3,.126,32),position:new Vec3(x+(this.random()-.5)*.22,BOOK.top+.064,z+(this.random()-.5)*.22),linearDamping:.06,angularDamping:.08});
 b.quaternion.setFromEuler(0,this.random()*Math.PI*2,0);this.world.addBody(b);return b;
 });
 }
 get flipped(){return this.chips.filter(b=>b.quaternion.vmult(new Vec3(0,1,0)).y<-.85).length;}
 strike(x,z,power){
 if(this.phase!=='ready'||![x,z,power].every(Number.isFinite)||Math.abs(x)>3||Math.abs(z)>4)return false;
 const book=BOOKS[this.kind],strength=Math.max(1,Math.min(10,power));
 // A stylized book impulse; all subsequent flips, bounces and collisions are rigid-body motion.
 for(const b of this.chips){
 const dx=b.position.x-x,dz=b.position.z-z,d=Math.hypot(dx,dz),falloff=.3+.7*Math.exp(-d*d/(2*book.spread*book.spread));
 const lift=(1.2+strength*.34)*book.lift*falloff*(.9+this.random()*.2);
 const heading=d>.1?Math.atan2(dz,dx):this.random()*Math.PI*2;
 const lean=.08+strength*.035;
 const impulse=new Vec3(Math.cos(heading)*lift*lean*b.mass,lift*b.mass,Math.sin(heading)*lift*lean*b.mass);
 const offset=.065*book.tilt*(.75+this.random()*.5);
 b.wakeUp();b.applyImpulse(impulse,new Vec3(Math.cos(heading)*offset,0,Math.sin(heading)*offset));
 }
 this.hits++;this.phase='moving';this.time=0;this.still=0;return true;
 }
 step(dt){
 if(this.phase!=='moving')return;
 this.time+=dt;this.world.step(dt);
 if(this.chips.some(b=>(Math.abs(b.position.x)>BOOK.halfWidth||Math.abs(b.position.z)>BOOK.halfLength)&&b.position.y<BOOK.top-.1)){
 this.phase='fail';this.reason='outside';return;
 }
 const stopped=this.chips.every(b=>b.velocity.length()<.08&&b.angularVelocity.length()<.3);
 this.still=stopped?this.still+dt:0;
 if(this.still>.45){
 if(this.flipped===3){this.phase='won';this.reason='flipped';}
 else if(this.hits>=BOOK.attempts){this.phase='fail';this.reason='attempts';}
 else this.phase='ready';
 }else if(this.time>15){this.phase='fail';this.reason='unsettled';}
 }
 advance(seconds){for(let t=0;t<seconds;t+=1/240)this.step(Math.min(1/240,seconds-t));}
}
