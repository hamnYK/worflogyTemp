import * as THREE from '../lib/three.module.min.js';

// Reuse shared meshes without duplicating vertices or changing their materials.
export function batchPlushParts(root){
 root.updateMatrixWorld(true);
 const batches=new Map(),inverse=root.matrixWorld.clone().invert();
 root.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.transparent)return;
  const key=o.geometry.id+'/'+o.material.id+'/'+o.castShadow+'/'+o.receiveShadow;
  if(!batches.has(key))batches.set(key,[]);
  batches.get(key).push({mesh:o,matrix:inverse.clone().multiply(o.matrixWorld)});
 });
 for(const entries of batches.values()){
  if(entries.length<2)continue;
  const first=entries[0].mesh,batch=new THREE.InstancedMesh(first.geometry,first.material,entries.length);
  batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
  entries.forEach(({mesh,matrix},i)=>{
   batch.setMatrixAt(i,matrix);
   for(const child of [...mesh.children])root.attach(child);
   mesh.removeFromParent();
  });
  batch.instanceMatrix.needsUpdate=true;
  root.add(batch);
 }
}

