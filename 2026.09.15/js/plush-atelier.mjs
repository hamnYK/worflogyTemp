
import * as THREE from '../lib/three.module.min.js';
import {createPlushSurfaces} from './plush-surfaces.mjs';

// Sewn shapes share geometry and fabric maps; fibres and stitches are batched.
export function createPlushAtelier({finish,geos,mats,textures}){
 let seed=4081;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const material=options=>finish.material(options);
 const cloth=document.createElement('canvas');cloth.width=cloth.height=512;
 const cx=cloth.getContext('2d');cx.fillStyle='#929292';cx.fillRect(0,0,512,512);
 for(let i=0;i<32000;i++){
  const x=random()*512,y=random()*512,v=Math.floor(110+random()*65);
  cx.strokeStyle='rgb('+v+','+v+','+v+')';cx.lineWidth=.5+random()*.7;
  cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+(random()-.35)*2,y+1+random()*3);cx.stroke();
 }
 const nap=new THREE.CanvasTexture(cloth);nap.wrapS=nap.wrapT=THREE.RepeatWrapping;nap.repeat.set(2,2);textures.add(nap);
 function fabric(color){return material({color,roughness:.93,bumpMap:nap,bumpScale:.018,sheen:1,sheenColor:new THREE.Color(color).lerp(new THREE.Color('#fff3df'),.3),sheenRoughness:.85});}
 const ivory=fabric('#f5e7d0'),rose=fabric('#e6a1a3'),ochre=fabric('#e2ad64'),ribbon=fabric('#6d9185');
 const thread=material({color:'#d5bba1',roughness:1}),ink=material({color:'#473e43',roughness:.87});
 const bead=material({color:'#252f36',roughness:.19,clearcoat:1,clearcoatRoughness:.12});
 const shine=material({color:'#fff7e4',roughness:.2});
 function shape(kind){
  const g=new THREE.SphereGeometry(1,kind==='head'?40:kind==='body'?32:24,kind==='head'?28:kind==='body'?24:16),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   if(kind==='body'){const width=1-.2*y;x*=width;z*=width;y+=.055*(1-y*y)*Math.cos(x*3);}
   if(kind==='head'){const cheek=1+.12*Math.exp(-Math.pow((y+.28)*3,2));x*=cheek;z*=1+.045*Math.cos(y*4);}
   if(kind==='ear'){x*=.82+.18*(1-y);z*=.82+.18*(1-y);x+=.14*y*y;}
   p.setXYZ(i,x,y,z);
  }
  g.computeVertexNormals();geos.add(g);return g;
 }
 const sewn=createPlushSurfaces(geos);
 const shapes={body:shape('body'),head:shape('head'),round:shape('round'),ear:shape('ear'),torso:sewn.torso.geometry,penguin:sewn.penguin.geometry,seal:sewn.seal.geometry,star:sewn.star.geometry};
 const cylinder=new THREE.CylinderGeometry(1,1,1,5);geos.add(cylinder);
 const furGeos=new Map();
 function furGeometry(kind){
  if(furGeos.has(kind))return furGeos.get(kind);
  const base=shapes[kind],p=base.attributes.position,n=base.attributes.normal,index=base.index,points=[];
  for(let j=0;j<(['torso','penguin'].includes(kind)?3000:1800);j++){
   const face=Math.floor(random()*index.count/3)*3,ia=index.getX(face),ib=index.getX(face+1),ic=index.getX(face+2);
   const u=Math.sqrt(random()),v=random(),a=1-u,b=u*(1-v),c=u*v;
   const x=p.getX(ia)*a+p.getX(ib)*b+p.getX(ic)*c,y=p.getY(ia)*a+p.getY(ib)*b+p.getY(ic)*c,z=p.getZ(ia)*a+p.getZ(ib)*b+p.getZ(ic)*c;
   const normal=new THREE.Vector3(n.getX(ia)*a+n.getX(ib)*b+n.getX(ic)*c,n.getY(ia)*a+n.getY(ib)*b+n.getY(ic)*c,n.getZ(ia)*a+n.getZ(ib)*b+n.getZ(ic)*c).normalize();
   const length=(.012+random()*.031)*(['torso','penguin','seal','star'].includes(kind)?.35:1);
   points.push(x+normal.x*.004,y+normal.y*.004,z+normal.z*.004,x+normal.x*length,y+normal.y*length,z+normal.z*length);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geos.add(g);furGeos.set(kind,g);return g;
 }
 const fabrics=new Map();
 function make(type,color,variant=0){
  if(!fabrics.has(color))fabrics.set(color,fabric(color));
  const felt=fabrics.get(color),group=new THREE.Group(),threadSegments=[],limbs=[],ears=[];
  function wallBounds(){
   group.updateMatrixWorld(true);const bounds=[];
   group.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh)return;
    o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld),size=b.getSize(new THREE.Vector3());
    if(Math.max(size.x,size.y,size.z)<.09)return;
    // Cover cloth give, animated ears/arms and fibres as well as the rest mesh.
    b.expandByScalar(.10);const center=b.getCenter(new THREE.Vector3());b.getSize(size);
    bounds.push({center:center.toArray(),half:size.multiplyScalar(.5).toArray()});
   });return bounds;
  }
  const fuzzMat=new THREE.LineBasicMaterial({color:new THREE.Color(color).lerp(new THREE.Color('#fff7e7'),.45),transparent:true,opacity:.31,depthWrite:false});mats.add(fuzzMat);
  function part(kind,m,x,y,z,sx,sy,sz,parent=group,fuzzy=false){
   const o=new THREE.Mesh(shapes[kind],m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);
   if(fuzzy){const f=new THREE.LineSegments(furGeometry(kind),fuzzMat);o.add(f);}
   return o;
  }
  function path(points,r,m=ink,parent=group){
   const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
   const g=new THREE.TubeGeometry(curve,Math.max(12,points.length*5),r,5,false);geos.add(g);
   const o=new THREE.Mesh(g,m);o.castShadow=true;parent.add(o);return o;
  }
  function stitchPath(points,count=28,width=.018){
   const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
   for(let j=0;j<count;j++){const u=(j+.5)/count,p=curve.getPoint(u),tangent=curve.getTangent(u),across=new THREE.Vector3(tangent.y,-tangent.x,0).normalize().multiplyScalar(width/2);threadSegments.push([p.clone().sub(across),p.clone().add(across)]);}
  }

  if(['star','seal','octopus'].includes(type)){
   const headRig=new THREE.Group();group.add(headRig);
   if(type==='star'){
    part('star',felt,0,0,0,1,1,1,group,true);
    const perimeter=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,r=.405+.125*Math.cos(a*5);perimeter.push([Math.sin(a)*r*.986,.58+Math.cos(a)*r*.986,.034]);}path(perimeter,.006,thread);
    for(const sign of [-1,1]){part('round',bead,sign*.11,.61,.181,.034,.045,.022);part('round',rose,sign*.2,.52,.16,.05,.026,.015);}
    path([[-.045,.51,.196],[0,.485,.203],[.045,.51,.196]],.007,ink);
    for(let i=0;i<8;i++)path([[-.03,.31+i*.045,.19],[.015,.315+i*.045,.19]],.003,thread);
   }else if(type==='seal'){
    part('seal',felt,0,0,0,1,1,1,group,true);
    path([[-.6,.36,-.187],[-.3,.36,-.296],[.1,.36,-.312],[.45,.36,-.31],[.7,.36,-.2]],.004,thread);
    for(const sign of [-1,1]){
     const flipper=part('ear',felt,-.18,.15,sign*.31,.13,.24,.09);flipper.rotation.x=sign*.85;
     const tail=part('ear',felt,-.7,.2,sign*.13,.14,.21,.1);tail.rotation.z=-1.05;tail.rotation.x=sign*.5;
     part('round',bead,.47+sign*.13,.46,.295,.035,.043,.026);
     part('round',rose,.47+sign*.21,.35,.275,.05,.027,.016);
     path([[.47+sign*.12,.325,.312],[.47+sign*.26,.3,.31]],.005,ink);
    }
    part('round',ivory,.47,.34,.298,.12,.085,.04);part('round',ink,.47,.36,.343,.034,.025,.02);
   }else{
    part('head',felt,0,.49,0,.36,.39,.34,group,true);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const foot=part('body',felt,Math.sin(a)*.34,.13,Math.cos(a)*.34,.13,.13,.23);foot.rotation.y=a;part('round',ivory,Math.sin(a)*.4,.064,Math.cos(a)*.4,.065,.035,.065);}
    for(const sign of [-1,1]){part('round',bead,sign*.135,.51,.322,.04,.05,.026);part('round',rose,sign*.225,.4,.27,.06,.028,.014);}
    part('round',ivory,0,.365,.328,.075,.045,.025);path([[-.04,.372,.354],[0,.35,.358],[.04,.372,.354]],.006,ink);
   }
   return{group,headRig,headRest:0,limbs,ears,wallBounds:wallBounds()};
  }
  const penguin=type==='penguin';
  const body=part(penguin?'penguin':'torso',felt,0,0,0,1,1,1,group,true);
  const headRig=new THREE.Group();headRig.position.set(0,penguin?.98:.96,.012);group.add(headRig);
  headRig.rotation.z=variant%2?.045:-.035;
  const patch=new THREE.Mesh(penguin?sewn.penguinPatch:sewn.patch,ivory);patch.receiveShadow=true;group.add(patch);
  if(penguin){
   // A heart-shaped cream face and soft orange bill distinguish the penguin.
   for(const sign of [-1,1])part('round',ivory,sign*.115,-.025,.284,.19,.235,.058,headRig);
  }
  for(const sign of [-1,1]){
   const shoulder=new THREE.Group();shoulder.position.set(sign*.29,.56,0);group.add(shoulder);
   const arm=part('body',felt,sign*.065,-.145,.025,penguin?.115:.135,penguin?.29:.215,.15,shoulder,true);
   shoulder.rotation.z=sign*(penguin?.35:.48);limbs.push({group:shoulder,rest:shoulder.rotation.z,sign});
   const foot=part('round',penguin?ochre:felt,sign*.205,.095,.145,penguin?.2:.18,.13,.225);
   if(!penguin){
    part('round',ivory,sign*.205,.14,.323,.105,.068,.023);
    for(let j=-1;j<=1;j++)path([[sign*.205+j*.038,.117,.34],[sign*.205+j*.038,.158,.34]],.004,thread);
   }
   const earRig=new THREE.Group();headRig.add(earRig);earRig.position.set(sign*.235,.25,-.015);
   if(type==='bunny'){
    earRig.rotation.z=sign*(sign>0?.3:.12);
    part('ear',felt,0,.31,0,.125,.39,.108,earRig,true);
    part('ear',rose,0,.325,.085,.068,.27,.028,earRig);
    ears.push({group:earRig,rest:earRig.rotation.z,sign});
   }else if(type==='bear'){
    earRig.position.x=sign*.335;
    part('round',felt,0,.025,-.01,.163,.172,.112,earRig,true);
    part('round',ivory,0,.025,.08,.089,.099,.026,earRig);
   }else if(type==='cat'){
    // Soft triangular ears, bevelled instead of a faceted cone.
    const sh=new THREE.Shape();sh.moveTo(-.145,-.08);sh.quadraticCurveTo(-.13,.05,-.04,.235);sh.quadraticCurveTo(0,.29,.045,.225);sh.quadraticCurveTo(.13,.06,.15,-.08);sh.quadraticCurveTo(0,-.14,-.145,-.08);
    const geo=new THREE.ExtrudeGeometry(sh,{depth:.055,bevelEnabled:true,bevelSize:.035,bevelThickness:.04,bevelSegments:4,curveSegments:8});geos.add(geo);
    const o=new THREE.Mesh(geo,felt);o.castShadow=true;earRig.add(o);earRig.rotation.z=-sign*.17;
    part('ear',rose,0,.065,.1,.065,.11,.025,earRig);
   }
   part('round',bead,sign*.153,.025,.326,.046,.055,.032,headRig);
   part('round',shine,sign*.145,.045,.35,.011,.013,.007,headRig);
   part('round',rose,sign*.272,-.075,.291,.063,.03,.014,headRig);
   // Tiny thread eyebrows and cat whiskers are sewn into the face.
   path([[sign*.19,.113,.308],[sign*.145,.127,.323],[sign*.113,.116,.32]],.005,thread,headRig);
   if(type==='cat')for(const y of [-.075,-.115])path([[sign*.235,y,.303],[sign*.33,y-.013,.266]],.005,ink,headRig);
  }
  if(!penguin){
   part('round',ivory,0,-.115,.319,.172,.079,.054,headRig);
  }
  part('round',penguin?ochre:ink,0,-.085,.373,penguin?.08:.037,penguin?.038:.026,penguin?.067:.024,headRig);
  path([[0,-.105,.379],[0,-.155,.372],[-.042,-.165,.363]],.006,ink,headRig);
  path([[0,-.155,.372],[.025,-.17,.368],[.046,-.16,.358]],.006,ink,headRig);
  // The stitched belly patch and back seam follow curved cloth surfaces.
  const front=(penguin?sewn.penguin:sewn.torso).front;
  const border=[];for(let j=0;j<=64;j++){const a=j/64*Math.PI*2,x=Math.sin(a)*.238,y=.35+Math.cos(a)*.269;border.push([x,y,front(x,y)+.009]);}
  stitchPath(border,44,.017);
  const back=[];for(let i=0;i<=32;i++){const y=.08+i/32*1.2;back.push([0,y,-front(0,y)-.004]);}stitchPath(back,64,.018);
  // Small curved darts at the limb roots read as sewn joins at close range.
  for(const sign of [-1,1])path([[sign*.27,.59,.10],[sign*.30,.56,.15],[sign*.32,.50,.17]],.004,thread);
  // Folded ribbon with drooping tails.
  for(const sign of [-1,1]){
   const bow=part('round',ribbon,sign*.087,.655,.282,.097,.05,.036);bow.rotation.z=sign*.25;
   const tail=part('ear',ribbon,sign*.06,.583,.293,.037,.078,.02);tail.rotation.z=sign*.3;
  }
  part('round',ivory,0,.652,.315,.035,.036,.026);
  const tagGeo=finish.beveledBox(.088,.135,.012),tag=new THREE.Mesh(tagGeo,ivory);geos.add(tagGeo);tag.position.set(.345,.26,.025);tag.rotation.z=-.18;group.add(tag);
  path([[.325,.24,.036],[.364,.24,.036]],.006,ribbon);
  path([[.325,.28,.036],[.354,.28,.036]],.005,ribbon);
  if(type==='cat')path([[.16,.24,-.22],[.42,.23,-.32],[.44,.37,-.24],[.35,.4,-.2]],.073,felt);
  else if(type==='bunny')part('round',ivory,0,.23,-.31,.14,.14,.14,group,true);
  if(threadSegments.length){
   const batch=new THREE.InstancedMesh(cylinder,thread,threadSegments.length),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
   threadSegments.forEach(([a,b],i)=>{const v=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(.0035,v.length(),.0035);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});
   batch.castShadow=false;group.add(batch);
  }
  return{group,headRig,headRest:headRig.rotation.z,limbs,ears,wallBounds:wallBounds()};
 }
 return{make};
}

