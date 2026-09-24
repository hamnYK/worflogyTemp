import * as THREE from '../lib/three.module.min.js';

// Locally generated studio reflections and detailed materials shared by every AFTER HOURS game.
export function createArcadeFinish(renderer,scene,geometries,materials,textures){
 const material=options=>{const m=new THREE.MeshPhysicalMaterial(options);materials.add(m);return m;};
 function mesh(g,m,parent,x=0,y=0,z=0){geometries.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function texture(c){const t=new THREE.CanvasTexture(c);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(t);return t;}
 const studio=new THREE.Scene();studio.background=new THREE.Color('#667580');
 const panelGeo=new THREE.PlaneGeometry(1,1),panelMats=[];
 for(const [x,y,z,w,h,color,intensity] of [[-6,9,2,8,5,0xffe6c4,5],[7,5,-4,5,8,0xbce5ff,4],[0,10,-7,9,3,0xffffff,6]]){
 const m=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});m.color.multiplyScalar(intensity);panelMats.push(m);
 const p=new THREE.Mesh(panelGeo,m);p.position.set(x,y,z);p.scale.set(w,h,1);p.lookAt(0,0,0);studio.add(p);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.08,.1,50);scene.environment=env.texture;scene.environmentIntensity=.42;renderer.toneMappingExposure*=.94;pmrem.dispose();panelGeo.dispose();panelMats.forEach(m=>m.dispose());

 const grainCache=new Map(),boxCache=new Map();
 function grain(kind){
  if(grainCache.has(kind))return grainCache.get(kind);
  const c=document.createElement('canvas');c.width=c.height=512;
  const x=c.getContext('2d'),data=x.createImageData(512,512);let seed=73;
  for(let py=0;py<512;py++)for(let px=0;px<512;px++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   const noise=(seed>>>16)/65535-.5;
   let v;
   if(kind==='wood'||kind==='oak'){
    const bend=Math.sin(py*.023)*3+Math.sin(py*.007)*9;
    v=145+Math.sin(px*.23+bend)*17+Math.sin(px*.91+bend*2)*5+noise*12;
   }else if(kind==='ice'){
    v=172+noise*17+Math.sin(px*.11+py*.018)*3;
   }else if(kind==='leather'){
    v=144+noise*26+Math.sin(px*.65)*Math.sin(py*.7)*8;
   }else if(kind==='paper'){
    v=176+noise*18+Math.sin(px*.08+py*.7)*3;
   }else if(kind==='stone'){
    v=145+noise*40+Math.sin(px*.057+Math.sin(py*.033)*3)*12;
   }else{
    // Fine woven fibres replace the former coarse checker pattern.
    v=148+noise*24+Math.sin(px*Math.PI/3)*9+Math.sin(py*Math.PI/3)*7;
   }
   const i=(py*512+px)*4;
   if(kind==='oak'){data.data[i]=v+35;data.data[i+1]=v+2;data.data[i+2]=v-38;}
   else data.data[i]=data.data[i+1]=data.data[i+2]=v;
   data.data[i+3]=255;
  }
  x.putImageData(data,0,0);
  if(kind==='ice'){
   x.strokeStyle='#ffffff38';x.lineWidth=.6;
   for(let i=0;i<210;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const px=seed%512,py=(seed>>>10)%512;x.beginPath();x.moveTo(px,py);x.lineTo(px+(i%7)-3,py+8+i%40);x.stroke();}
  }
  const t=texture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(kind==='wood'||kind==='oak'?4:kind==='ice'?2:8,kind==='wood'||kind==='oak'?2:kind==='ice'?4:12);
  if(kind==='oak')t.colorSpace=THREE.SRGBColorSpace;
  grainCache.set(kind,t);return t;
 }
 function beveledBox(w,h,d){
  const id=[w,h,d].join(':');if(boxCache.has(id))return boxCache.get(id);
  let g;
  const radius=Math.min(.065,w*.12,h*.22,d*.12);
  if(radius<.008)g=new THREE.BoxGeometry(w,h,d);
  else{
   const shape=new THREE.Shape(),r=radius,x=-w/2+r,y=-d/2+r,W=w-2*r,D=d-2*r,c=Math.min(r,W/4,D/4);
   shape.moveTo(x+c,y);shape.lineTo(x+W-c,y);shape.quadraticCurveTo(x+W,y,x+W,y+c);shape.lineTo(x+W,y+D-c);shape.quadraticCurveTo(x+W,y+D,x+W-c,y+D);shape.lineTo(x+c,y+D);shape.quadraticCurveTo(x,y+D,x,y+D-c);shape.lineTo(x,y+c);shape.quadraticCurveTo(x,y,x+c,y);
   g=new THREE.ExtrudeGeometry(shape,{depth:h-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:3,steps:1});
   g.rotateX(-Math.PI/2);g.translate(0,-(h-2*r)/2,0);
  }
  const pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++){
   const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));
   if(ny>=nx&&ny>=nz)uv.setXY(i,pos.getX(i)/w+.5,pos.getZ(i)/d+.5);
   else if(nx>nz)uv.setXY(i,pos.getZ(i)/d+.5,pos.getY(i)/h+.5);
   else uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);
  }
  uv.needsUpdate=true;geometries.add(g);boxCache.set(id,g);return g;
 }
 function chip(parent,radius,number,color,centerY=0){
 const body=material({color,roughness:.32,metalness:.12,clearcoat:.4,clearcoatRoughness:.3}),ivory=material({color:'#eee8d5',roughness:.42}),metal=material({color:'#cbb780',metalness:.88,roughness:.24}),height=radius*.42;
 mesh(new THREE.CylinderGeometry(radius,radius,height,96),body,parent,0,centerY,0);
 for(let j=0;j<16;j++){const a=j*Math.PI/8,s=mesh(new THREE.BoxGeometry(radius*.22,height*.94,radius*.09),ivory,parent,Math.sin(a)*radius*.981,centerY,Math.cos(a)*radius*.981);s.rotation.y=a;}
 for(const y of [-height*.34,height*.34]){const ring=mesh(new THREE.TorusGeometry(radius*.998,radius*.009,6,96),metal,parent,0,centerY+y,0);ring.rotation.x=Math.PI/2;}
 const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#f0ead7';x.fillRect(0,0,512,512);x.strokeStyle=color;
 for(const [r,w] of [[238,9],[218,2],[172,2]]){x.lineWidth=w;x.beginPath();x.arc(256,256,r,0,Math.PI*2);x.stroke();}
 x.save();x.translate(256,256);for(let j=0;j<64;j++){x.rotate(Math.PI/32);x.fillStyle=color;x.fillRect(-1,183,2,j%4===0?23:12);}x.restore();
 x.fillStyle='#21343d';x.textAlign='center';x.font='700 152px Arial';x.fillText(String(number),256,295);x.font='bold 25px Arial';x.fillText('WORFLOGY',256,345);x.font='16px Arial';x.fillText('AFTER HOURS',256,155);
 const faceTex=texture(c);faceTex.colorSpace=THREE.SRGBColorSpace;
 const face=material({map:faceTex,roughness:.4,clearcoat:.3,clearcoatRoughness:.35});
 for(const sign of [-1,1]){
 const ring=mesh(new THREE.TorusGeometry(radius*.83,radius*.018,8,96),metal,parent,0,centerY+sign*(height/2+.003),0);ring.rotation.x=Math.PI/2;
 const disc=mesh(new THREE.CircleGeometry(radius*.8,96),face,parent,0,centerY+sign*(height/2+.006),0);disc.rotation.x=-sign*Math.PI/2;
 }
 }
 function plinth(width,depth,y,color){
 const group=new THREE.Group();scene.add(group);
 const dark=material({color:'#111e29',metalness:.65,roughness:.3}),led=material({color,emissive:color,emissiveIntensity:1.8,roughness:.35});
 mesh(new THREE.BoxGeometry(width+.35,.16,depth+.35),dark,group,0,y,0);
 for(const sign of [-1,1]){
 mesh(new THREE.BoxGeometry(.022,.025,depth-.4),led,group,sign*(width/2+.08),y+.09,0);
 mesh(new THREE.BoxGeometry(width-.4,.025,.022),led,group,0,y+.09,sign*(depth/2+.08));
 }
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gradient=x.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(.65,'rgba(0,0,0,.4)');gradient.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gradient;x.fillRect(0,0,128,128);
 const m=new THREE.MeshBasicMaterial({map:texture(c),transparent:true,depthWrite:false});materials.add(m);
 const shadow=mesh(new THREE.PlaneGeometry(width*1.65,depth*1.5),m,group,0,y-.19,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 }
 return{material,grain,beveledBox,chip,plinth,dispose(){scene.environment=null;env.dispose();}};
}
