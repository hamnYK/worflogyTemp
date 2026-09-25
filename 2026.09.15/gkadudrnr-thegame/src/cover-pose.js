// Visual stance only; hit chance and line of sight remain in rules.js.
export function coverStance(state,unit){
 const neighbors=state.cover.filter(c=>c.hp>0&&Math.abs(c.x-unit.x)+Math.abs(c.z-unit.z)===1);
 const threats=state.units.filter(u=>u.team!==unit.team&&u.hp>0);
 const score=c=>threats.reduce((n,e)=>n+Math.max(0,(c.x-unit.x)*(e.x-unit.x)+(c.z-unit.z)*(e.z-unit.z))/(1+Math.abs(e.x-unit.x)+Math.abs(e.z-unit.z)),0);
 neighbors.sort((a,b)=>score(b)-score(a)||b.h-a.h||a.id.localeCompare(b.id));
 const c=neighbors[0];if(!c)return null;
 const toward=Math.atan2(c.x-unit.x,c.z-unit.z);
 return {id:c.id,height:c.h,kind:c.h===2?'wall':'crouch',yaw:toward+(c.h===2?Math.PI/2:0)};
}
