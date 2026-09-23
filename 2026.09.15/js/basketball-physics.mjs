import {World,Body,Vec3,Box,Plane,Cylinder,Sphere,Material,ContactMaterial} from '../lib/cannon-es.mjs';

// One rigid cylinder: the same orientation drives contacts and the rendered chip.
export function tossPhysics(position,power,random=Math.random){
 const world=new World({gravity:new Vec3(0,-9.81,0),allowSleep:true});
 world.solver.iterations=16;
 const chipMaterial=new Material('chip'),courtMaterial=new Material('court');
 world.addContactMaterial(new ContactMaterial(chipMaterial,courtMaterial,{friction:.32,restitution:.48}));
 const floorMaterial=new Material('polished-court');
 world.addContactMaterial(new ContactMaterial(chipMaterial,floorMaterial,{friction:.025,restitution:.58}));
 const floor=new Body({mass:0,material:floorMaterial,shape:new Plane()});
 floor.quaternion.setFromEuler(-Math.PI/2,0,0);world.addBody(floor);
 function box(x,y,z,hx,hy,hz){const b=new Body({mass:0,material:courtMaterial,shape:new Box(new Vec3(hx,hy,hz)),position:new Vec3(x,y,z)});world.addBody(b);}
 // Match the court, glass, padding and hoop geometry in the scene.
 for(const sign of [-1,1]){box(sign*8.13,.08,0,.065,.15,8.2);box(0,.08,sign*8.13,8.2,.15,.065);}
 box(0,3.75,-.9,1.75,1.175,.04);box(0,1.04,-1.45,.23,1.025,.2);
 const rim=new Body({mass:0,material:courtMaterial});
 for(let i=0;i<48;i++){const a=i*Math.PI/24;rim.addShape(new Sphere(.055),new Vec3(Math.cos(a)*.8,3,Math.sin(a)*.8));}world.addBody(rim);
 const body=new Body({mass:.012,material:chipMaterial,shape:new Cylinder(.3,.3,.126,32),position:new Vec3(position.x,position.y,position.z),linearDamping:.025,angularDamping:.004,allowSleep:true,sleepSpeedLimit:.12,sleepTimeLimit:.7});
 // Vary only the release state; never choose a direction at impact.
 const heading=random()*Math.PI*2,tilt=.2+random()*.35,spin=(65+power*3)*(.9+random()*.2);
 body.quaternion.setFromEuler(1.0+tilt*.2,heading,0,'YXZ');
 body.velocity.set(0,3+power*.35,0);
 // Spin around the cylinder axle so floor friction can convert spin into rolling.
 body.angularVelocity.copy(body.vectorToWorldFrame(new Vec3(0,spin,0)));
 world.addBody(body);
 // Cannon GS clamps lambda directly. Use an impulse budget (including dt for
 // resting weight), so a hard landing transfers more spin into lateral motion.
 const makeFriction=world.narrowphase.createFrictionEquationsFromContact;
 world.narrowphase.createFrictionEquationsFromContact=function(contact,out){
  const start=out.length,result=makeFriction.call(this,contact,out);
  if(contact.bi===floor||contact.bj===floor){
   const closing=Math.max(0,contact.getImpactVelocityAlongNormal());
   const arm=contact.bi===body?contact.ri:contact.rj;
   const cross=arm.cross(contact.ni);
   const invI=body.invInertiaWorld.vmult(cross);
   const inverseMass=body.invMass+cross.dot(invI);
   const impulse=(1+contact.restitution)*closing/inverseMass;
   const cap=.06*impulse/Math.SQRT2;
   for(let i=start;i<out.length;i++){out[i].maxForce=Math.max(out[i].maxForce*world.dt,cap);out[i].minForce=-out[i].maxForce;}
  }
  return result;
 };

 const state={world,body,bounces:0};
 body.addEventListener('collide',event=>{if(event.body===floor)state.bounces++;});
 return state;
}
