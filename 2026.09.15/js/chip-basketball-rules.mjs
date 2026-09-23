/* Spin -> catch upright -> launch. Deterministic 3D projectile state. */
export const BASKET={radius:.3,hoopRadius:.8,hoopY:3,hoopZ:-4,gravity:9.81};
export class ChipBasketball{
 constructor(){this.reset();}
 reset(){this.phase='ready';this.angle=0;this.spinTime=0;this.omega=12;this.time=0;this.p={x:0,y:.31,z:3.6};this.v={x:0,y:0,z:0};this.result=null;this.rimHits=0;}
 get catchable(){return this.phase==='spinning'&&this.spinTime>.25&&Math.abs(Math.sin(this.angle))<.6;}
 spin(){if(this.phase!=='ready')return false;this.phase='spinning';return true;}
 catch(){if(this.phase!=='spinning')return false;if(!this.catchable){this.phase='fail';this.result='catch';return false;}this.phase='held';this.angle=0;this.p.y=.6;return true;}
 launch(power,aim=0){if(this.phase!=='held'||!Number.isFinite(power)||!Number.isFinite(aim))return false;
 const speed=Math.max(7,Math.min(14,power)),e=55*Math.PI/180,a=Math.max(-.4,Math.min(.4,aim));this.v={x:Math.sin(a)*Math.cos(e)*speed,y:Math.sin(e)*speed,z:-Math.cos(a)*Math.cos(e)*speed};this.phase='flying';this.time=0;return true;}
 step(dt){
 if(this.phase==='spinning'){this.spinTime+=dt;this.omega=12*Math.exp(-.15*this.spinTime);this.angle+=this.omega*dt;if(this.spinTime>9){this.phase='fail';this.result='spin-timeout';}return;}
 if(this.phase!=='flying')return;
 this.time+=dt;const old={...this.p},p=this.p,v=this.v,r=BASKET.radius;
 v.y-=BASKET.gravity*dt;p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;
 if(old.y>BASKET.hoopY&&p.y<=BASKET.hoopY&&v.y<0){
 const f=(old.y-BASKET.hoopY)/(old.y-p.y),x=old.x+(p.x-old.x)*f,z=old.z+(p.z-old.z)*f;
 if(Math.hypot(x,z-BASKET.hoopZ)<BASKET.hoopRadius-r-.03){this.phase='won';this.result='basket';return;}
 }
 // Backboard reflection (front face at -4.85).
 if(old.z>-4.85+r&&p.z<=-4.85+r&&Math.abs(p.x)<1.75&&p.y>2.5&&p.y<5.1){p.z=-4.85+r;v.z=Math.abs(v.z)*.6;}
 const dx=p.x,dz=p.z-BASKET.hoopZ,radial=Math.hypot(dx,dz)||.001;
 const nearest={x:dx/radial*BASKET.hoopRadius,y:BASKET.hoopY,z:BASKET.hoopZ+dz/radial*BASKET.hoopRadius};
 const nx=p.x-nearest.x,ny=p.y-nearest.y,nz=p.z-nearest.z,d=Math.hypot(nx,ny,nz),clearance=r+.055;
 if(d<clearance&&d>.001){
 const ax=nx/d,ay=ny/d,az=nz/d,dot=v.x*ax+v.y*ay+v.z*az;
 p.x=nearest.x+ax*clearance;p.y=nearest.y+ay*clearance;p.z=nearest.z+az*clearance;
 if(dot<0){v.x-=1.55*dot*ax;v.y-=1.55*dot*ay;v.z-=1.55*dot*az;this.rimHits++;}
 }
 if(p.y<r||Math.abs(p.x)>7||Math.abs(p.z)>9||this.time>5){this.phase='fail';this.result='miss';}
 }
 advance(seconds){const n=Math.ceil(seconds*240);for(let i=0;i<n;i++)this.step(seconds/n);}
}
