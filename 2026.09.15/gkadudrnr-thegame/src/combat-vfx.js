import * as T from 'three';
// Visual time and randomness never affect turn rules or save state.
export function combatVfx(scene){
 const active=[];
 function own(mesh,life,update){scene.add(mesh);active.push({mesh,life,total:life,update});return mesh;}
 function beam(a,b){
  const from=new T.Vector3(a.x,1.05,a.z),to=new T.Vector3(b.x,.95,b.z),delta=to.clone().sub(from),length=delta.length();
  for(const [radius,color,opacity]of [[.065,'#47d9f2',.32],[.019,'#e9ffff',1]]){
   const m=new T.Mesh(new T.CylinderGeometry(radius,radius,length,6),new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending}));
   m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
   own(m,.34,(_,t)=>m.material.opacity=opacity*(1-t));
  }
 }
 function fragments(x,z,death=false){
  const count=death?72:38,mat=new T.MeshBasicMaterial({color:death?'#88cee4':'#c9a9ff',transparent:true,opacity:1,depthWrite:false});
  const m=new T.InstancedMesh(new T.BoxGeometry(.065,.065,.065),mat,count),dummy=new T.Object3D(),parts=[];
  for(let i=0;i<count;i++){
   const angle=Math.random()*Math.PI*2,y=death?.15+(i/count)*1.48:.3+Math.random()*.35;
   parts.push({x:(Math.random()-.5)*(y>1.3?.22:.5),y,z:(Math.random()-.5)*.32,vx:Math.cos(angle)*(death?.9:2.1),vz:Math.sin(angle)*(death?.9:2.1),vy:.5+Math.random()*1.2,size:.7+Math.random()*1.5});
  }
  m.position.set(x,0,z);m.frustumCulled=false;m.userData.effect=death?'dissolve':'plasma';
  const update=(_,t)=>{parts.forEach((p,i)=>{dummy.position.set(p.x+p.vx*t,p.y+p.vy*t,p.z+p.vz*t);dummy.rotation.set(t*(i%5),t*3,t*2);dummy.scale.setScalar(p.size*(1-t));dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.instanceMatrix.needsUpdate=true;mat.opacity=1-t;};
  update(0,0);own(m,death?1.35:.85,update);
 }
 function plasma(point){
  fragments(point.x,point.z);
  const shell=new T.Mesh(new T.IcosahedronGeometry(1,1),new T.MeshBasicMaterial({color:'#aa87f2',wireframe:true,transparent:true,opacity:.8,depthWrite:false}));shell.position.set(point.x,.45,point.z);
  own(shell,.65,(_,t)=>{shell.scale.setScalar(.2+t*1.3);shell.rotation.y=t; shell.material.opacity=.8*(1-t);});
  for(const [dx,dz]of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const m=new T.Mesh(new T.PlaneGeometry(.94,.94),new T.MeshBasicMaterial({color:'#bda1f8',transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(point.x+dx,.025,point.z+dz);own(m,.85,(_,t)=>m.material.opacity=.65*(1-t));}
 }
 return {beam,plasma,dissolve:(p)=>fragments(p.x,p.z,true),update(dt){for(let i=active.length-1;i>=0;i--){const e=active[i];e.life-=dt;e.update(dt,Math.min(1,1-e.life/e.total));if(e.life<=0){e.mesh.removeFromParent();e.mesh.geometry.dispose();e.mesh.material.dispose();e.mesh.dispose?.();active.splice(i,1);}}},get count(){return active.length;}};
}
