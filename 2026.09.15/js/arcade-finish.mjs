import * as THREE from '../lib/three.module.min.js';

// Locally generated studio reflections and detailed materials shared by both games.
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
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.08,.1,50);scene.environment=env.texture;scene.environmentIntensity=.55;pmrem.dispose();panelGeo.dispose();panelMats.forEach(m=>m.dispose());
 function grain(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),data=x.createImageData(256,256);let seed=73;
 for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const px=(i/4)%256,py=Math.floor(i/1024);const v=kind==='wood'?128+Math.sin(px*.45+Math.sin(py*.035)*2)*18+(seed%15):100+(seed%65)+((px+py)%2)*12;data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255;}x.putImageData(data,0,0);
 const t=texture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?4:14,kind==='wood'?2:22);return t;
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
 return{material,grain,chip,plinth,dispose(){scene.environment=null;env.dispose();}};
}
