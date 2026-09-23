import * as THREE from '../lib/three.module.min.js';

// Drag the ground plane under the pointer without changing the viewing angle.
export function createTablePan(camera,canvas){
 const offset=new THREE.Vector3(),ray=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);
 function point(x,y){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),camera);return ray.ray.intersectPlane(ground,new THREE.Vector3());}
 return{offset,move(fromX,fromY,toX,toY){const a=point(fromX,fromY),b=point(toX,toY);if(a&&b){offset.add(a.sub(b));offset.x=THREE.MathUtils.clamp(offset.x,-12,12);offset.z=THREE.MathUtils.clamp(offset.z,-18,18);}},reset(){offset.set(0,0,0);}};
}
