import * as THREE from '../lib/three.module.min.js';
export function createCurlingJunk(scene,finish,geos,textures){
 const groups=new Map();
 const material=(color,roughness=.5,metalness=0)=>finish.material({color,roughness,metalness});
 const pink=material('#e98f9a',.9),paper=material('#3b718c'),cream=material('#faf0d7'),blue=material('#2d8cbc',.28,.6),wood=material('#bd8549',.65),brass=material('#b5a26d',.24,.9),red=material('#b73e38',.3);
 function part(g,geo,mat,x=0,y=0,z=0){geos.add(geo);const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
 for(const kind of ['eraser','cap','block','button','nut']){
 const g=new THREE.Group();g.name='curl-junk-'+kind;scene.add(g);groups.set(kind,g);
 if(kind==='eraser'){
 part(g,new THREE.BoxGeometry(.8,.25,.5),pink,0,.14,0);
 part(g,new THREE.BoxGeometry(.48,.256,.506),paper,-.08,.14,0);
 part(g,new THREE.BoxGeometry(.3,.008,.24),cream,-.08,.274,0);
 for(let i=0;i<3;i++)part(g,new THREE.BoxGeometry(.18,.01,.015),paper,-.08,.281,-.06+i*.06);
 }else if(kind==='cap'){
 part(g,new THREE.CylinderGeometry(.35,.38,.18,48),blue,0,.11,0);
 for(let i=0;i<24;i++){const a=i*Math.PI/12;const rib=part(g,new THREE.BoxGeometry(.035,.16,.025),blue,Math.sin(a)*.365,.105,Math.cos(a)*.365);rib.rotation.y=a;}
 const ring=part(g,new THREE.TorusGeometry(.25,.017,8,48),cream,0,.207,0);ring.rotation.x=Math.PI/2;
 const bar=part(g,new THREE.BoxGeometry(.28,.01,.065),cream,0,.21,0);bar.rotation.y=-.4;
 }else if(kind==='block'){
 wood.map=finish.grain('wood');wood.bumpMap=wood.map;wood.bumpScale=.012;
 part(g,new THREE.BoxGeometry(.68,.5,.68),wood,0,.26,0);
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#d5aa73';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#774a2d';ctx.lineWidth=5;ctx.strokeRect(10,10,108,108);ctx.fillStyle='#774a2d';ctx.font='bold 80px Georgia';ctx.textAlign='center';ctx.fillText('W',64,92);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
 const face=part(g,new THREE.PlaneGeometry(.62,.62),finish.material({map:tex,roughness:.7}),0,.516,0);face.rotation.x=-Math.PI/2;
 }else if(kind==='button'){
 // Extruded face with four actual sewing holes.
 const shape=new THREE.Shape();shape.absarc(0,0,.32,0,Math.PI*2,false);
 for(const x of [-.09,.09])for(const y of [-.09,.09]){const hole=new THREE.Path();hole.absarc(x,y,.04,0,Math.PI*2,true);shape.holes.push(hole);}
 const disc=part(g,new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2,steps:1}),red,0,.11,0);disc.rotation.x=Math.PI/2;
 const ring=part(g,new THREE.TorusGeometry(.265,.018,8,48),red,0,.12,0);ring.rotation.x=Math.PI/2;
 }else{
 const shape=new THREE.Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3;i?shape.lineTo(Math.cos(a)*.35,Math.sin(a)*.35):shape.moveTo(Math.cos(a)*.35,Math.sin(a)*.35);}shape.closePath();
 const hole=new THREE.Path();hole.absarc(0,0,.16,0,Math.PI*2,true);shape.holes.push(hole);
 const nut=part(g,new THREE.ExtrudeGeometry(shape,{depth:.23,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1}),brass,0,.27,0);nut.rotation.x=Math.PI/2;
 for(let y=.055;y<.25;y+=.045){const thread=part(g,new THREE.TorusGeometry(.162,.01,6,32),brass,0,y,0);thread.rotation.x=Math.PI/2;}
 }
 }
 return items=>{groups.forEach(g=>g.visible=false);for(const item of items){const g=groups.get(item.kind);g.visible=true;g.position.set(item.x,0,item.z);g.rotation.y=item.angle;}};
}
