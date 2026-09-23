import {tossPhysics} from './basketball-physics.mjs';
/* Fixed-step tabletop physics. Throw inputs, contact impulses and friction determine motion. */
export const BASKET={attempts:3,maxScore:18,radius:.3,hoopRadius:.8,hoopY:3,hoopZ:0,gravity:9.81,halfCourt:8,threeRadius:4.5,backboardZ:-.9};
export class ChipBasketball{
 constructor({random=Math.random}={}){this.random=random;this.reset();}
 reset(){this.scores=[];this.total=0;this.attempt=1;this.prepare();}
 prepare(){this.physics=null;this.orientation=null;this.phase='ready';this.angle=0;this.spinTime=0;this.omega=0;this.time=0;this.p={x:0,y:.31,z:BASKET.threeRadius};this.v={x:0,y:0,z:0};this.grip={x:0,z:BASKET.threeRadius};this.result=null;this.rimHits=0;this.bounces=0;this.shotPoints=0;this.shotOrigin=null;}
 next(){if(this.phase!=='attempt-end'||this.scores.length>=BASKET.attempts)return false;this.attempt=this.scores.length+1;this.prepare();return true;}
 setGrip(x,z){if(!Number.isFinite(x)||!Number.isFinite(z))return;this.grip={x:Math.max(-7.7,Math.min(7.7,x)),z:Math.max(-7.7,Math.min(7.7,z))};}
 get catchable(){return this.phase==='spinning'&&this.bounces>0&&this.spinTime>.2&&this.omega>.8&&this.p.y<1.5&&Math.hypot(this.p.x-this.grip.x,this.p.z-this.grip.z)<.55;}
 spin(power=8){
 if(this.phase!=='ready'||!Number.isFinite(power))return false;
 const speed=Math.max(4,Math.min(14,power));this.v={x:0,y:3+speed*.35,z:0};
 this.physics=tossPhysics(this.p,speed,this.random);this.omega=this.physics.body.angularVelocity.length();this.phase='spinning';return true;
 }
 catch(){
 if(this.phase!=='spinning')return false;
 if(!this.catchable){this.finish(0,'catch');return false;}
 this.physics=null;this.orientation=null;this.phase='held';this.angle=0;this.p.y=.6;this.v={x:0,y:0,z:0};this.setGrip(this.p.x,this.p.z);
 this.shotOrigin={...this.p};this.shotPoints=this.pointsAt(this.p);return true;
 }
 pointsAt(p){return (Math.hypot(p.x,p.z)>=BASKET.threeRadius?3:2)*(p.z<BASKET.backboardZ?2:1);}
 get bearing(){return Math.atan2(-this.p.x,this.p.z);}
 launch(power,aim=0,elevation=60){
 if(this.phase!=='held'||![power,aim,elevation].every(Number.isFinite))return false;
 const speed=Math.max(4,Math.min(14,power)),e=Math.max(40,Math.min(80,elevation))*Math.PI/180,a=this.bearing;
 this.v={x:Math.sin(a)*Math.cos(e)*speed,y:Math.sin(e)*speed,z:-Math.cos(a)*Math.cos(e)*speed};
 this.phase='flying';this.time=0;return true;
 }
 finish(points,reason){if(!['spinning','flying'].includes(this.phase))return;this.physics=null;this.scores.push(points);this.total+=points;this.result=reason;this.v={x:0,y:0,z:0};this.phase=this.scores.length>=BASKET.attempts?'results':'attempt-end';}
 contacts(old){
 const p=this.p,v=this.v,r=BASKET.radius,b=BASKET.backboardZ;
 // The glass board blocks shots from either side, including behind-the-board attempts.
 if(Math.abs(p.x)<1.75+r&&p.y>2.54-r&&p.y<4.96+r){
 if(old.z>=b+r&&p.z<b+r){p.z=b+r;v.z=Math.abs(v.z)*.6;}
 else if(old.z<=b-r&&p.z>b-r){p.z=b-r;v.z=-Math.abs(v.z)*.6;}
 }
 // Padded central support has a real collision volume.
 const dx=p.x,dz=p.z+1.45,d=Math.hypot(dx,dz),clear=.28+r;
 if(p.y<2.3+r&&d<clear&&d>1e-8){const nx=dx/d,nz=dz/d,dot=v.x*nx+v.z*nz;p.x=nx*clear;p.z=-1.45+nz*clear;if(dot<0){v.x-=1.65*dot*nx;v.z-=1.65*dot*nz;}}
 const radial=Math.hypot(p.x,p.z)||.001;
 const nearest={x:p.x/radial*BASKET.hoopRadius,y:BASKET.hoopY,z:p.z/radial*BASKET.hoopRadius};
 const nx=p.x-nearest.x,ny=p.y-nearest.y,nz=p.z-nearest.z,dist=Math.hypot(nx,ny,nz),clearance=r+.055;
 if(dist<clearance&&dist>.001){const ax=nx/dist,ay=ny/dist,az=nz/dist,dot=v.x*ax+v.y*ay+v.z*az;p.x=nearest.x+ax*clearance;p.y=nearest.y+ay*clearance;p.z=nearest.z+az*clearance;if(dot<0){v.x-=1.55*dot*ax;v.y-=1.55*dot*ay;v.z-=1.55*dot*az;this.rimHits++;}}
 }
 step(dt){
 if(!['spinning','flying'].includes(this.phase))return;
 if(this.phase==='spinning'){
 this.spinTime+=dt;this.time+=dt;const physics=this.physics;physics.world.step(dt);
 const b=physics.body;this.p={x:b.position.x,y:b.position.y,z:b.position.z};this.v={x:b.velocity.x,y:b.velocity.y,z:b.velocity.z};
 this.orientation={x:b.quaternion.x,y:b.quaternion.y,z:b.quaternion.z,w:b.quaternion.w};
 this.omega=b.angularVelocity.length();this.angle+=this.omega*dt;this.bounces=physics.bounces;
 if((this.bounces>0&&this.omega<=.8)||this.spinTime>14||Math.abs(this.p.x)>8.5||Math.abs(this.p.z)>8.5)this.finish(0,'spin-timeout');
 return;
 }
 const p=this.p,v=this.v,r=BASKET.radius,old={...p};this.time+=dt;
 v.y-=BASKET.gravity*dt;p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;
 if(old.y>BASKET.hoopY&&p.y<=BASKET.hoopY&&v.y<0){const f=(old.y-BASKET.hoopY)/(old.y-p.y),x=old.x+(p.x-old.x)*f,z=old.z+(p.z-old.z)*f;if(Math.hypot(x,z)<BASKET.hoopRadius-r-.03){this.finish(this.shotPoints,'basket');return;}}
 this.contacts(old);
 if(p.y<r||Math.abs(p.x)>9||Math.abs(p.z)>9||this.time>6)this.finish(0,'miss');
 }
 advance(seconds){const n=Math.ceil(seconds*240);for(let i=0;i<n;i++)this.step(seconds/n);}
}
