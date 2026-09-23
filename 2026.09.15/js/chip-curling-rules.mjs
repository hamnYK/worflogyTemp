export const CURL={radius:.34,halfWidth:3.4,halfLength:9,targetZ:-5};
export class ChipCurling{
 constructor(){this.reset();}
 reset(){this.chips=[];this.phase='ready';this.shots=0;this.score=0;}
 launch(power,aim=0,spin=0){
 if(this.phase!=='ready'||![power,aim,spin].every(Number.isFinite))return false;
 const p=Math.max(1,Math.min(7,power)),a=Math.max(-.35,Math.min(.35,aim));
 this.chips.push({x:0,z:7,vx:Math.sin(a)*p,vz:-Math.cos(a)*p,spin:Math.max(-1,Math.min(1,spin)),angle:0});
 this.shots++;this.phase='moving';this.elapsed=0;return true;
 }
 step(dt){
 if(this.phase!=='moving')return;
 this.elapsed+=dt;
 for(const c of this.chips){
 const speed=Math.hypot(c.vx,c.vz);
 if(speed>.012){
 const turn=c.spin*.07*dt,co=Math.cos(turn),si=Math.sin(turn),vx=c.vx*co-c.vz*si,vz=c.vx*si+c.vz*co;
 const factor=Math.max(0,speed-.8*dt)/speed;c.vx=vx*factor;c.vz=vz*factor;
 c.x+=c.vx*dt;c.z+=c.vz*dt;c.angle+=c.spin*dt*2;
 }else c.vx=c.vz=0;
 if(Math.abs(c.x)>CURL.halfWidth-CURL.radius){c.x=Math.sign(c.x)*(CURL.halfWidth-CURL.radius);c.vx*=-.55;}
 if(Math.abs(c.z)>CURL.halfLength-CURL.radius){c.z=Math.sign(c.z)*(CURL.halfLength-CURL.radius);c.vz*=-.55;}
 }
 for(let i=0;i<this.chips.length;i++)for(let j=i+1;j<this.chips.length;j++){
 const a=this.chips[i],b=this.chips[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
 if(d<CURL.radius*2){const nx=d>1e-8?dx/d:1,nz=d>1e-8?dz/d:0,overlap=CURL.radius*2-d;
 a.x-=nx*overlap/2;a.z-=nz*overlap/2;b.x+=nx*overlap/2;b.z+=nz*overlap/2;
 const rel=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;
 if(rel<0){const impulse=-rel*.92;a.vx-=impulse*nx;a.vz-=impulse*nz;b.vx+=impulse*nx;b.vz+=impulse*nz;}
 }
 }
 if(this.elapsed>20||this.chips.every(c=>Math.hypot(c.vx,c.vz)<.012)){
 this.chips.forEach(c=>{c.vx=c.vz=0;});
 this.score=this.chips.reduce((sum,c)=>{const d=Math.hypot(c.x,c.z-CURL.targetZ);return sum+(d<=.65?3:d<=1.3?2:d<=2?1:0);},0);
 this.phase=this.shots<3?'ready':this.score>=6?'won':'fail';
 }
 }
 advance(seconds){for(let t=0;t<seconds;t+=1/240)this.step(Math.min(1/240,seconds-t));}
}
