/* Deterministic table physics and rules. Opening collisions are resolved, not penalized. */
export const FIELD={halfWidth:5,halfLength:8,radius:.34,goalHalf:1.35};
export class ChipFootball {
 constructor(){this.reset();}
 reset(){this.opening=true;this.breakTime=0;this.chips=[{x:0,z:5},{x:-.35,z:4.4},{x:.35,z:4.4}].map(c=>({...c,passed:false}));this.selected=null;this.previous=null;this.phase='ready';this.turns=0;this.vx=0;this.vz=0;this.crossed=false;this.result=null;this.bankCount=0;}
 get canShoot(){return !this.opening&&this.chips.every(c=>c.passed);}
 select(i){if(this.phase!=='ready'||!Number.isInteger(i)||i<0||i>2)return false;if(this.selected!==null)return this.selected===i;if(i===this.previous)return false;this.selected=i;return true;}
 launch(vx,vz){if(this.phase!=='ready'||this.selected===null||!Number.isFinite(vx)||!Number.isFinite(vz))return false;if(this.opening){
 const speed=Math.hypot(vx,vz);if(speed<.6)return false;const k=Math.min(speed,22)/speed;
 this.breakVel=this.chips.map((_,i)=>i===this.selected?{x:vx*k,z:vz*k}:{x:0,z:0});
 this.breakTime=0;this.phase='breaking';return true;
 }const speed=Math.hypot(vx,vz);if(speed<.6)return false;const k=Math.min(speed,22)/speed;this.vx=vx*k;this.vz=vz*k;this.gate=this.chips.filter((_,i)=>i!==this.selected).map(c=>({...c}));this.crossed=false;this.readyAtLaunch=this.canShoot;this.phase='moving';this.turns++;return true;}
 fail(reason){this.phase='fail';this.result=reason;this.vx=this.vz=0;}
 step(dt){
 if(this.phase==='breaking'){
 this.breakTime+=dt;
 this.chips.forEach((c,i)=>{const v=this.breakVel[i];c.x+=v.x*dt;c.z+=v.z*dt;v.x*=Math.exp(-1.25*dt);v.z*=Math.exp(-1.25*dt);
 const bx=FIELD.halfWidth-FIELD.radius,bz=FIELD.halfLength-FIELD.radius;
 if(Math.abs(c.x)>bx){c.x=Math.sign(c.x)*bx;v.x*=-.8;}
 if(Math.abs(c.z)>bz){c.z=Math.sign(c.z)*bz;v.z*=-.8;}
 });
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
 const a=this.chips[i],b=this.chips[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),r=FIELD.radius*2;
 if(d<r){const nx=d>1e-9?dx/d:1,nz=d>1e-9?dz/d:0,overlap=r-d;
 a.x-=nx*overlap/2;a.z-=nz*overlap/2;b.x+=nx*overlap/2;b.z+=nz*overlap/2;
 const va=this.breakVel[i],vb=this.breakVel[j],rel=(vb.x-va.x)*nx+(vb.z-va.z)*nz;
 if(rel<0){const impulse=-rel*.97;va.x-=impulse*nx;va.z-=impulse*nz;vb.x+=impulse*nx;vb.z+=impulse*nz;}
 }
 }
 if(this.breakTime>12||this.breakVel.every(v=>Math.hypot(v.x,v.z)<.08)){
 this.opening=false;this.selected=null;this.phase='ready';this.result='opened';
 }
 return;
 }
 if(this.phase!=='moving')return;
 const c=this.chips[this.selected],old={x:c.x,z:c.z},r=FIELD.radius;
 c.x+=this.vx*dt;c.z+=this.vz*dt;
 const [a,b]=this.gate,dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
 const side=p=>dx*(p.z-a.z)-dz*(p.x-a.x),sa=side(old),sb=side(c);
 if(sa*sb<0){
 const f=sa/(sa-sb),ix=old.x+(c.x-old.x)*f,iz=old.z+(c.z-old.z)*f,u=((ix-a.x)*dx+(iz-a.z)*dz)/(len*len);
 if(u>2*r/len&&u<1-2*r/len)this.crossed=true;
 }
 if(this.gate.some(o=>Math.hypot(c.x-o.x,c.z-o.z)<2*r)){this.fail('collision');return;}
 const inGoal=Math.abs(c.x)<FIELD.goalHalf-r;
 if(c.z< -FIELD.halfLength-r&&inGoal){
 if(!this.readyAtLaunch){this.fail('early-goal');return;}
 if(!this.crossed){this.fail('missed-gate');return;}
 this.phase='won';this.result='goal';this.vx=this.vz=0;return;
 }
 const bound=FIELD.halfWidth-r;
 if(c.x< -bound||c.x>bound){c.x=Math.max(-bound,Math.min(bound,c.x));this.vx*=-.82;this.bankCount++;}
 const end=FIELD.halfLength-r;
 if(c.z>end){c.z=end;this.vz=-Math.abs(this.vz)*.82;this.bankCount++;}
 if(c.z< -end&&!inGoal){c.z=-end;this.vz=Math.abs(this.vz)*.82;this.bankCount++;}
 const friction=Math.exp(-1.25*dt);this.vx*=friction;this.vz*=friction;
 if(Math.hypot(this.vx,this.vz)<.08){
 this.vx=this.vz=0;
 if(!this.crossed){this.fail('missed-gate');return;}
 c.passed=true;this.previous=this.selected;this.selected=null;this.phase='ready';this.result='pass';
 }
 }
 advance(seconds){const n=Math.ceil(seconds*240),dt=seconds/n;for(let i=0;i<n;i++)this.step(dt);}
}
