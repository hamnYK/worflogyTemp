
import * as THREE from '../lib/three.module.min.js';

// Continuous stuffed panels. Profiles stay within the existing collision shapes.
export function createPlushSurfaces(geos){
 function profile(points,{horizontal=false}={}){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),samples=[];
  for(let i=0;i<=64;i++)samples.push(curve.getPoint(i/64));
  const positions=[],uv=[],indices=[],segments=48;
  for(let j=0;j<samples.length;j++){
   const v=samples[j],rx=Math.max(.001,v.x),rz=Math.max(.001,v.z);
   for(let i=0;i<=segments;i++){
    const angle=i/segments*Math.PI*2;
    // A shallow side seam and uneven stuffing replace a mathematically perfect globe.
    const seam=1-.017*Math.exp(-Math.pow(Math.sin(angle)*22,2));
    const wrinkle=1+.008*Math.sin(angle*3+v.y*12)*Math.sin(j/64*Math.PI);
    const x=Math.cos(angle)*rx*seam*wrinkle,z=Math.sin(angle)*rz*seam*wrinkle;
    if(horizontal)positions.push(v.y,.36-x,z);else positions.push(x,v.y,z);
    uv.push(i/segments,j/64);
    if(j<64&&i<segments){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geos.add(geometry);
  function front(x,y){
   let a=samples[0],b=a;
   for(let i=1;i<samples.length;i++){b=samples[i];if(b.y>=y)break;a=b;}
   const f=THREE.MathUtils.clamp((y-a.y)/Math.max(.0001,b.y-a.y),0,1),rx=THREE.MathUtils.lerp(a.x,b.x,f),rz=THREE.MathUtils.lerp(a.z,b.z,f);
   return Math.max(.001,rz)*Math.sqrt(Math.max(0,1-x*x/Math.max(.000001,rx*rx)));
  }
  return{geometry,front};
 }
 const torso=profile([[.001,-.025,.001],[.23,.04,.20],[.32,.18,.285],[.35,.37,.305],[.30,.53,.275],[.225,.65,.225],[.29,.71,.255],[.405,.83,.318],[.442,.98,.344],[.37,1.17,.287],[.21,1.29,.16],[.001,1.335,.001]]);
 const penguin=profile([[.001,0,.001],[.25,.07,.23],[.36,.23,.3],[.395,.46,.325],[.37,.66,.31],[.38,.85,.32],[.425,1,.338],[.34,1.18,.27],[.17,1.29,.14],[.001,1.325,.001]]);
 const seal=profile([[.001,-.78,.001],[.12,-.7,.12],[.235,-.49,.245],[.305,-.15,.315],[.30,.17,.31],[.32,.43,.31],[.27,.63,.255],[.12,.76,.12],[.001,.8,.001]],{horizontal:true});
 const starGeo=new THREE.SphereGeometry(1,64,40),p=starGeo.attributes.position,u=starGeo.attributes.uv;
 for(let i=0;i<p.count;i++){
  const theta=u.getX(i)*Math.PI*2,phi=u.getY(i)*Math.PI,r=.405+.125*Math.cos(theta*5);
  p.setXYZ(i,Math.sin(theta)*r*Math.sin(phi),.58+Math.cos(theta)*r*Math.sin(phi),Math.cos(phi)*.19);
 }
 starGeo.computeVertexNormals();geos.add(starGeo);
 function patch(front){
  const positions=[],uv=[],indices=[],rings=18,segments=64;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI*2,r=j/rings,x=Math.sin(a)*.242*r,y=.35+Math.cos(a)*.273*r;
   positions.push(x,y,front(x,y)+.004+.003*(1-r*r));uv.push(.5+x/.5,.5+(y-.35)/.57);
   if(j<rings&&i<segments){const k=j*(segments+1)+i,n=k+segments+1;indices.push(k,k+1,n,k+1,n+1,n);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geos.add(geometry);return geometry;
 }
 return{torso,penguin,seal,star:{geometry:starGeo},patch:patch(torso.front),penguinPatch:patch(penguin.front)};
}

