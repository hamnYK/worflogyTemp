
import * as C from '../lib/cannon-es.mjs';

export const CLAW={step:1/120,bed:1.52,home:5.13,chute:{x:-1.85,z:1.15,half:.85,mouth:.95},target:3,attempts:5};

export function chuteLayout(){
 const {x,z,half:h,mouth:m}=CLAW.chute,left=x-m,right=x+m,back=z-m,front=z+m;
 const beds=[
  [(left-2.9)/2,1.38,0,left+2.9,.28,4.4],
  [(right+2.9)/2,1.38,0,2.9-right,.28,4.4],
  [x,1.38,(-2.2+back)/2,2*m,.28,back+2.2],
  [x,1.38,(front+2.2)/2,2*m,.28,2.2-front]
 ];
 const shaft=[];
 for(const a of [-1,1]){
  shaft.push([x+a*(h+.025),.55,z,.05,1.5,2*h+.1]);
  shaft.push([x,.55,z+a*(h+.025),2*h,.05+1.45,.05]);
 }
 const rise=.35,run=m-h,len=Math.hypot(rise,run),angle=Math.atan2(rise,run),ramps=[];
 for(const a of [-1,1]){
  ramps.push({box:[x+a*(m+h)/2,1.475,z,len,.045,2*m],rotation:[0,0,a*angle]});
  ramps.push({box:[x,1.475,z+a*(m+h)/2,2*m,.045,len],rotation:[-a*angle,0,0]});
 }
 const guards=[[right+.025,2.05,z,.05,1.1,2*m],[x,2.05,back-.025,2*m,1.1,.05]];
 return{beds,shaft,ramps,guards};
}

const V=(x=0,y=0,z=0)=>new C.Vec3(x,y,z);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
export function plushShape(type){
 const ordinary={center:.63,mass:.19,balls:[[0,.4,0,.30],[0,.95,0,.355],[-.32,.4,0,.135],[.32,.4,0,.135],[-.2,.12,.12,.14],[.2,.12,.12,.14]]};
 if(type==='bunny')return{...ordinary,mass:.17,balls:[...ordinary.balls,[-.23,1.43,0,.12],[.23,1.43,0,.12]]};
 if(type==='seal')return{center:.36,mass:.23,balls:[[-.34,.32,0,.29],[0,.34,0,.33],[.36,.39,0,.32],[.62,.38,0,.24],[-.67,.23,0,.16]]};
 if(type==='star')return{center:.58,mass:.12,balls:[[0,.58,0,.255],...[0,1,2,3,4].map(i=>{const a=i*Math.PI*2/5;return[Math.sin(a)*.34,.58+Math.cos(a)*.34,0,.16];})]};
 if(type==='octopus')return{center:.39,mass:.2,balls:[[0,.49,0,.34],...[0,1,2,3,4,5,6,7].map(i=>[Math.sin(i*Math.PI/4)*.35,.13,Math.cos(i*Math.PI/4)*.35,.12])]};
 return ordinary;
}
// Claw contacts cover the continuous sewn belly, independently of the lightweight pile shapes.
export function plushGripBalls(type){
 const shape=plushShape(type);
 if(!['bunny','bear','cat'].includes(type))return shape.balls;
 return [...[[0,.12,0,.28],[0,.30,0,.36],[0,.48,0,.325],[0,.64,0,.25],[0,.72,0,.295],[-.085,.98,0,.365],[.085,.98,0,.365],[-.32,.4,0,.135],[.32,.4,0,.135],[-.2,.12,.12,.14],[.2,.12,.12,.14]],...(type==='bunny'?shape.balls.slice(-2):[])];
}
export function plushInventory(){
 return Array.from({length:30},(_,i)=>({kind:i%9,s:Math.min([0,4,7].includes(i%9)?.86:1,[.62,.78,.92,1.08,1.28,.7,1.4,.86,1.02][(i*5+Math.floor(i/9)*2)%9]*.8)}));
}

// All toys remain free dynamic bodies. There is deliberately no toy/claw lock,
// nearest-toy attachment, scripted drop, or random success roll.
export class ClawPhysics{
 constructor(specs,{seed=1769,placements=null,settleSteps=420}={}){
  this.specs=specs;this.seed=seed;this.placements=placements;this.settleSteps=settleSteps;this.reset(seed);
 }
 reset(seed=this.seed+1){
  this.seed=seed;let rng=seed>>>0;const rnd=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
  this.world=new C.World({gravity:V(0,-9.82,0),allowSleep:true});
  this.world.broadphase=new C.SAPBroadphase(this.world);this.world.solver.iterations=20;this.world.solver.tolerance=1e-7;
  this.fabric=new C.Material('plush');this.rubber=new C.Material('rubber');this.cabinet=new C.Material('cabinet');
  const contact=(a,b,friction,restitution=.015)=>this.world.addContactMaterial(new C.ContactMaterial(a,b,{friction,restitution,contactEquationStiffness:8e4,contactEquationRelaxation:5,frictionEquationStiffness:8e4,frictionEquationRelaxation:5}));
  contact(this.fabric,this.fabric,.48);contact(this.fabric,this.cabinet,.48);contact(this.fabric,this.rubber,.78);contact(this.rubber,this.cabinet,.35);
  this.world.defaultContactMaterial.friction=.4;
  const fixed=(x,y,z,w,h,d)=>{const body=new C.Body({mass:0,material:this.cabinet,shape:new C.Box(V(w/2,h/2,d/2)),position:V(x,y,z),collisionFilterGroup:1});this.world.addBody(body);return body;};
  // The bed really has a hole. Nothing teleports from its surface into the prize bay.
  const layout=chuteLayout();layout.beds.forEach(args=>fixed(...args));
  const wall=(...args)=>{const b=fixed(...args);b.collisionFilterGroup=8;b.shapes.forEach(s=>s.collisionFilterGroup=8);};
  for(const x of [-3,3])wall(x,4.25,0,.2,6.5,4.65);
  for(const z of [-2.3,2.3])wall(0,4.25,z,6,6.5,.2);
  layout.guards.forEach(args=>wall(...args));
  layout.shaft.forEach(args=>fixed(...args));
  layout.ramps.forEach(r=>{const body=fixed(...r.box);body.quaternion.setFromEuler(...r.rotation);});
  this.toys=this.specs.map((spec,i)=>{
   const shape=plushShape(spec.type),s=spec.s;
   const body=new C.Body({mass:shape.mass*s*s*s,material:this.fabric,linearDamping:.24,angularDamping:.34,sleepSpeedLimit:.08,sleepTimeLimit:.6,collisionFilterGroup:2});
   for(const [x,y,z,r] of shape.balls)body.addShape(new C.Sphere(r*s),V(x*s,(y-shape.center)*s,z*s));
   if(['bunny','bear','cat'].includes(spec.type)){
   const inertiaBeforeGrip=body.inertia.clone(),inverseBeforeGrip=body.invInertia.clone();
   body.shapes.forEach(s=>s.collisionFilterMask&=~4);
   for(const [x,y,z,r] of plushGripBalls(spec.type)){
    const grip=new C.Sphere(r*s);grip.collisionFilterMask=4;
    body.addShape(grip,V(x*s,(y-shape.center)*s,z*s));
   }
   body.inertia.copy(inertiaBeforeGrip);body.invInertia.copy(inverseBeforeGrip);body.updateInertiaWorld(true);
   }
   // Detailed envelopes only contact cabinet walls; the rounded grasp/stack shapes stay unchanged.
   if(spec.wallBounds?.length){
    const inertia=body.inertia.clone(),invInertia=body.invInertia.clone();
    body.shapes.forEach(s=>s.collisionFilterMask&=~8);
    for(const bounds of spec.wallBounds){
     const hull=new C.Box(V(...bounds.half.map(v=>v*s)));hull.collisionFilterMask=8;
     body.addShape(hull,V(bounds.center[0]*s,(bounds.center[1]-shape.center)*s,bounds.center[2]*s));
    }
    body.inertia.copy(inertia);body.invInertia.copy(invInertia);body.updateInertiaWorld(true);
   }
   const placement=this.placements?.[i];
   if(placement){body.position.set(...placement.position);body.quaternion.setFromEuler(...(placement.rotation||[0,0,0]),'XYZ');}
   else{
    // Layered, jittered drops into the center make a pile, not an upright display.
    const lane=i%8,layer=Math.floor(i/8);
    body.position.set((lane%4-1.5)*1.12+(rnd()-.5)*.15,2.65+layer*1.05+spec.s*.2,Math.floor(lane/4)*1.6-.95+(rnd()-.5)*.12);
    if(body.position.x<-.4&&body.position.z>-.35)body.position.z=-1.25;
    body.quaternion.setFromEuler((rnd()-.5)*2.7,rnd()*Math.PI*2,(rnd()-.5)*2.5,'XYZ');
   }
   this.world.addBody(body);return{...spec,body,center:shape.center,caught:false,contact:0,pressure:0,compressionAxis:V(0,1,0),peak:0,startY:0};
  });
  this.toyByBody=new Map(this.toys.map(p=>[p.body,p]));
  // Reserve the entire receiving bay during filling, then remove the loading barrier.
  const lid=fixed(CLAW.chute.x,4.5,CLAW.chute.z,CLAW.chute.mouth*2,6,CLAW.chute.mouth*2);
  for(let i=0;i<this.settleSteps;i++)this.world.step(CLAW.step);
  this.world.removeBody(lid);
  this.heading=0;this.aim={x:0,z:0};this.command={x:0,y:CLAW.home,z:0};
  this.anchor=new C.Body({mass:0,type:C.Body.KINEMATIC,position:V(0,CLAW.home+.24,0),collisionFilterMask:0,allowSleep:false});this.world.addBody(this.anchor);
  this.palm=new C.Body({mass:.26,material:this.rubber,position:V(0,CLAW.home,0),shape:new C.Sphere(.235),linearDamping:.2,angularDamping:.55,collisionFilterGroup:4,collisionFilterMask:11,allowSleep:false});this.world.addBody(this.palm);
  this.palm.shapes.forEach(s=>s.collisionFilterGroup=4);
  this.suspension=new C.Spring(this.anchor,this.palm,{localAnchorB:V(0,.24,0),restLength:0,stiffness:190,damping:9});
  this.fingers=[];
  for(let i=0;i<3;i++){
   const yaw=i*Math.PI*2/3,base=new C.Quaternion();base.setFromAxisAngle(V(0,1,0),yaw);
   const pivot=base.vmult(V(.18,-.07,0)),body=new C.Body({mass:.055,material:this.rubber,linearDamping:.15,angularDamping:.25,collisionFilterGroup:4,collisionFilterMask:11,allowSleep:false});
   // Rounded segments follow the visible hooked finger, including its inward toe.
   const points=[[0,0,0],[.25,-.31,0],[.30,-.65,0],[.11,-.82,0]];
   for(let j=0;j<3;j++){
    const a=V(...points[j]),b=V(...points[j+1]),delta=b.vsub(a),q=new C.Quaternion();
    q.setFromVectors(V(0,1,0),delta.unit());
    body.addShape(new C.Box(V(.043,delta.length()/2,.048)),a.vadd(b).scale(.5),q);
   }
   body.addShape(new C.Sphere(.073),V(.11,-.82,0));
   body.shapes.forEach(s=>s.collisionFilterGroup=4);
   const open=new C.Quaternion();open.setFromAxisAngle(V(0,0,1),.5);base.mult(open,body.quaternion);
   body.position.copy(this.palm.position.vadd(pivot));this.world.addBody(body);
   const hinge=new C.HingeConstraint(this.palm,body,{pivotA:pivot,pivotB:V(),axisA:base.vmult(V(0,0,1)),axisB:V(0,0,1),maxForce:150,collideConnected:false});
   hinge.enableMotor();this.world.addConstraint(hinge);this.fingers.push({body,hinge,base,angle:.5});
  }
  this.phase='ready';this.elapsed=0;this.time=0;this.tries=0;this.score=0;this.result='';this.everLifted=false;this.touched=false;this.acc=0;this.collected=[];this.obstructed=0;
 }
 twist(delta){if(this.phase==='ready')this.heading+=delta;}
 setAim(x,z){if(this.phase!=='ready')return;this.aim.x=clamp(x,-2.45,2.45);this.aim.z=clamp(z,-1.65,1.75);}
 start(){
  if(this.phase==='down'){this.next('grip');return true;}
  if(this.phase!=='ready'||this.tries>=CLAW.attempts)return false;
  this.tries++;this.result='';this.everLifted=false;this.touched=false;this.obstructed=0;
  this.toys.forEach(p=>{p.startY=p.body.position.y;p.peak=p.startY;});
  this.next('down');return true;
 }
 next(phase){
  this.phase=phase;this.elapsed=0;this.from={...this.command};
  if(phase==='return'&&!this.result)this.result=this.everLifted?'slipped':this.touched?'blocked':'missed';
 }
 get holding(){return this.toys.some(p=>!p.caught&&p.body.position.y-p.startY>.25&&p.body.position.distanceTo(this.palm.position)<1.35);}
 surface(x,z){
  const hit=new C.RaycastResult();this.world.raycastClosest(V(x,5.2,z),V(x,1.52,z),{collisionFilterMask:2,skipBackfaces:true},hit);
  return hit.hasHit?hit.hitPointWorld.y:CLAW.bed;
 }
 update(dt){
  this.acc+=Math.min(dt,.05);let steps=0;
  while(this.acc>=CLAW.step&&steps++<7){this.step(CLAW.step);this.acc-=CLAW.step;}
 }
 step(dt){
  this.elapsed+=dt;this.time+=dt;
  const c=this.command;
  if(this.phase==='ready'){const amount=1-Math.exp(-dt*7);c.x+=(this.aim.x-c.x)*amount;c.z+=(this.aim.z-c.z)*amount;c.y=CLAW.home;}
  else if(this.phase==='down'){
   c.y=Math.max(2.39,c.y-dt*.84);
   const palmTouch=this.world.contacts.some(k=>(k.bi===this.palm&&k.bj.collisionFilterGroup===2)||(k.bj===this.palm&&k.bi.collisionFilterGroup===2));
   this.obstructed=palmTouch||(this.touched&&c.y<4&&this.palm.position.y-c.y>.28)?this.obstructed+dt:0;
   if(c.y<=2.39||this.obstructed>.13||this.elapsed>4.2)this.next('grip');
  }else if(this.phase==='grip'){if(this.elapsed>1.05)this.next('lift');}
  else if(this.phase==='lift'){c.y=this.from.y+(4.98-this.from.y)*smooth(this.elapsed/2.4);if(this.elapsed>=2.4)this.next('carry');}
  else if(this.phase==='carry'){
   const f=smooth(this.elapsed/2.25);c.x=this.from.x+(CLAW.chute.x-this.from.x)*f;c.z=this.from.z+(CLAW.chute.z-this.from.z)*f;
   if(this.elapsed>=2.9)this.next('release');
  }else if(this.phase==='release'){if(this.elapsed>2.4)this.next('return');}
  else if(this.phase==='return'){
   const f=smooth(this.elapsed/1.6);c.x=this.from.x*(1-f);c.z=this.from.z*(1-f);c.y=this.from.y+(CLAW.home-this.from.y)*f;
   if(this.elapsed>=1.6){this.aim.x=this.aim.z=0;this.next(this.score>=CLAW.target?'done':this.tries>=CLAW.attempts?'fail':'ready');}
  }
  this.anchor.velocity.set((c.x-this.anchor.position.x)/dt,(c.y+.24-this.anchor.position.y)/dt,(c.z-this.anchor.position.z)/dt);
  const closing=['grip','lift','carry'].includes(this.phase),target=closing?-.3:.52;
  for(const finger of this.fingers){
   const q=this.palm.quaternion.inverse().mult(finger.body.quaternion),relative=finger.base.inverse().mult(q);
   finger.angle=Math.atan2(2*(relative.w*relative.z+relative.x*relative.y),1-2*(relative.y*relative.y+relative.z*relative.z));
   // Torque, not a prescribed jaw angle: a wedged plush can hold a finger open.
   finger.hinge.setMotorMaxForce(closing?(this.phase==='grip'?.62:.44):.85);
   finger.hinge.setMotorSpeed(-clamp((target-finger.angle)*7,closing?-2.8:-1.6,closing?2.8:1.6));
  }
  this.suspension.applyForce();
  // A lightly damped swivel retains real tilt and inertia without endless spinning.
  const up=this.palm.quaternion.vmult(V(0,1,0)),restoring=up.cross(V(0,1,0));
  this.palm.torque.x+=restoring.x*.9-this.palm.angularVelocity.x*.12;
  this.palm.torque.z+=restoring.z*.9-this.palm.angularVelocity.z*.12;
  const forward=this.palm.quaternion.vmult(V(0,0,1)),yaw=Math.atan2(forward.x,forward.z),yawError=Math.atan2(Math.sin(this.heading-yaw),Math.cos(this.heading-yaw));
  this.palm.torque.y+=clamp(yawError*.5,-.4,.4)-this.palm.angularVelocity.y*.09;
  this.world.step(dt);
  const toyByBody=this.toyByBody;this.toys.forEach(p=>{p.contact=0;p.pressure=0;});
  for(const contact of this.world.contacts){
   const toy=toyByBody.get(contact.bi)||toyByBody.get(contact.bj),other=toy===toyByBody.get(contact.bi)?contact.bj:contact.bi;
   if(toy&&other.collisionFilterGroup===4){toy.contact++;if(this.phase!=='ready')this.touched=true;}
   if(toy&&[2,4].includes(other.collisionFilterGroup)){
    const force=Math.max(0,contact.multiplier||0);
    if(force>toy.pressure){toy.pressure=force;toy.body.quaternion.conjugate().vmult(contact.ni,toy.compressionAxis);}
   }
  }
  for(const toy of this.toys){
   if(toy.caught)continue;
   toy.peak=Math.max(toy.peak,toy.body.position.y);
   if(['lift','carry','release'].includes(this.phase)&&toy.body.position.y-toy.startY>.32&&toy.body.position.distanceTo(this.palm.position)<1.4)this.everLifted=true;
   // Only a physical crossing through the shaft awards a prize.
   if(toy.body.aabbNeedsUpdate)toy.body.updateAABB();
   if(this.tries>0&&toy.body.aabb.upperBound.y<1.28&&Math.abs(toy.body.position.x-CLAW.chute.x)<CLAW.chute.half&&Math.abs(toy.body.position.z-CLAW.chute.z)<CLAW.chute.half){
    toy.caught=true;this.score++;this.result='caught';this.collected.push(toy);this.world.removeBody(toy.body);
   }
  }
 }
 dispose(){this.world.constraints.slice().forEach(c=>this.world.removeConstraint(c));this.world.bodies.slice().forEach(b=>this.world.removeBody(b));}
}

