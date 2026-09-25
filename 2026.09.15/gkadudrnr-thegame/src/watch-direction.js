export const WATCH_SIDES={left:'좌',front:'정면',right:'우',rear:'후면'};
export const facingVector=facing=>[{x:0,z:-1},{x:1,z:0},{x:0,z:1},{x:-1,z:0}][facing];
export const currentFacing=unit=>unit.watch?(unit.watchFacing??unit.facing??1):(unit.facing??1);
export const facingYaw=unit=>{const v=facingVector(currentFacing(unit));return Math.atan2(v.x,v.z);};
export const watchFacing=(unit,side)=>(currentFacing(unit)+(side==='left'?-1:side==='right'?1:side==='rear'?2:0)+4)%4;
export function facingToward(from,to){const x=to.x-from.x,z=to.z-from.z;return Math.abs(x)>=Math.abs(z)?(x>=0?1:3):(z>=0?2:0);}
export function inWatchArc(unit,target){
 const v=facingVector(unit.watchFacing??unit.facing??1),x=target.x-unit.x,z=target.z-unit.z;
 const forward=v.x*x+v.z*z,side=v.x*z-v.z*x;
 return forward>0&&Math.abs(side)<=forward;
}
