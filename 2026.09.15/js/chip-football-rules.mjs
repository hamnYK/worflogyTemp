/* Deterministic table rules, independent of rendering. Units are metres. */
export const FIELD={halfWidth:5,halfLength:8,radius:.34,goalHalf:1.35};
export class ChipFootball {
 constructor(){this.reset();}
 reset(){this.chips=[{x:0,z:5},{x:-1.3,z:2.5},{x:1.3,z:2.5}].map(c=>({...c,passed:false}));this.selected=null;this.previous=null;this.phase='ready';this.turns=0;this.vx=0;this.vz=0;this.crossed=false;this.result=null;this.bankCount=0;}
 get canShoot(){return this.chips.every(c=>c.passed);}
 select(i){if(this.phase!=='ready'||!Number.isInteger(i)||i<0||i>2)return false;if(this.selected!==null)return this.selected===i;if(i===this.previous)return false;this.selected=i;return true;}
 launch(vx,vz){if(this.phase!=='ready'||this.selected===null||!Number.isFinite(vx)||!Number.isFinite(vz))return false;const speed=Math.hypot(vx,vz);if(speed<.6)return false;const k=Math.min(speed,22)/speed;this.vx=vx*k;this.vz=vz*k;this.gate=this.chips.filter((_,i)=>i!==this.selected).map(c=>({...c}));this.crossed=false;this.readyAtLaunch=this.canShoot;this.phase='moving';this.turns++;return true;}
 fail(reason){this.phase='fail';this.result=reason;this.vx=this.vz=0;}
 step(dt){
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
