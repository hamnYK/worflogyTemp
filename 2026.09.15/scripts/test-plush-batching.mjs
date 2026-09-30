import assert from 'node:assert/strict';
import * as THREE from '../lib/three.module.min.js';
import {batchPlushParts} from '../js/plush-batching.mjs';
const root=new THREE.Group(),parent=new THREE.Group();parent.position.set(.2,.5,.3);parent.rotation.z=.3;root.add(parent);
const geometry=new THREE.SphereGeometry(.2,12,8),material=new THREE.MeshStandardMaterial({color:'#eebbaa'}),original=[];
for(let i=0;i<3;i++){const m=new THREE.Mesh(geometry,material);m.position.set(i*.45,.2,0);m.scale.set(1,.8,1.2);m.castShadow=true;m.receiveShadow=true;parent.add(m);original.push(m);}
const fur=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,.3,0)]),new THREE.LineBasicMaterial({transparent:true}));original[0].add(fur);
root.updateMatrixWorld(true);const matrices=original.map(o=>o.matrixWorld.clone()),furMatrix=fur.matrixWorld.clone();
const ray=new THREE.Raycaster(new THREE.Vector3(.2,.7,3),new THREE.Vector3(0,0,-1));
const before=ray.intersectObject(root,true).filter(h=>h.object.isMesh);
batchPlushParts(root);root.updateMatrixWorld(true);
const batches=[];root.traverse(o=>{if(o.isInstancedMesh)batches.push(o)});assert.equal(batches.length,1);const batch=batches[0];assert.equal(batch.geometry,geometry);assert.equal(batch.material,material);assert.equal(batch.count,3);assert.ok(batch.castShadow&&batch.receiveShadow);
for(let i=0;i<3;i++){const m=new THREE.Matrix4();batch.getMatrixAt(i,m);m.premultiply(batch.matrixWorld);m.elements.forEach((v,k)=>assert.ok(Math.abs(v-matrices[i].elements[k])<1e-6));}
fur.matrixWorld.elements.forEach((v,k)=>assert.ok(Math.abs(v-furMatrix.elements[k])<1e-10));
const after=ray.intersectObject(root,true).filter(h=>h.object.isMesh);assert.equal(after.length,before.length);assert.ok(Math.abs(after[0].distance-before[0].distance)<1e-6);
console.log('PASS: identical part transforms, shared geometry/material, shadows, fur placement and raycast hit.');

