import * as THREE from '../lib/three.module.min.js';
export function createBookDetails({scene,finish,geos,textures,BOOK,BOOKS,renderer}){
 const mesh=(geo,mat,parent,x=0,y=0,z=0)=>{geos.add(geo);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const material=options=>finish.material(options);
 function tex(canvas,color=true){const t=new THREE.CanvasTexture(canvas);if(color)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(t);return t;}
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 let seed=54;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function rounded(w,h,d,r=.12){
 const s=new THREE.Shape(),x=-w/2,y=-d/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(s,{depth:h-.014,bevelEnabled:true,bevelSize:.008,bevelThickness:.007,bevelSegments:3,steps:1,curveSegments:8});g.rotateX(-Math.PI/2);g.translate(0,-(h-.014)/2,0);return g;
 }
 const grainCanvas=canvas(256,256),gx=grainCanvas.getContext('2d');gx.fillStyle='#888';gx.fillRect(0,0,256,256);
 for(let i=0;i<14000;i++){const v=85+rand()*85;gx.fillStyle='rgb('+v+','+v+','+v+')';gx.fillRect(rand()*256,rand()*256,1,rand()*3+1);}
 const cloth=tex(grainCanvas,false);cloth.wrapS=cloth.wrapT=THREE.RepeatWrapping;cloth.repeat.set(5,7);
 const woodCanvas=canvas(1024,1024),wx=woodCanvas.getContext('2d');wx.fillStyle='#917053';wx.fillRect(0,0,1024,1024);
 for(let i=0;i<1300;i++){const y=rand()*1024;wx.strokeStyle=rand()>.5?'rgba(40,24,15,.13)':'rgba(240,200,145,.12)';wx.lineWidth=.4+rand()*1.5;wx.beginPath();wx.moveTo(0,y);for(let x=0;x<=1024;x+=16)wx.lineTo(x,y+Math.sin(x*.008+y*.017)*5+Math.sin(x*.03)*1.5);wx.stroke();}
 const woodTex=tex(woodCanvas),deskMat=material({map:woodTex,roughness:.5,clearcoat:.25,clearcoatRoughness:.45});
 const desk=mesh(rounded(15,.35,14,.25),deskMat,scene);
 const uv=desk.geometry.attributes.uv,position=desk.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/15+.5,position.getZ(i)/14+.5);uv.needsUpdate=true;deskMat.color.set('#b09a86');
 const group=new THREE.Group();scene.add(group);
 const coverMat=material({color:'#b86c49',roughness:.65,bumpMap:cloth,bumpScale:.009});
 const top=mesh(rounded(6,.055,8),coverMat,group,0,BOOK.top-.0275,0);
 const bottom=mesh(rounded(6,.055,8),coverMat,group);
 const pagesCanvas=canvas(512,512),px=pagesCanvas.getContext('2d');px.fillStyle='#e8dfc8';px.fillRect(0,0,512,512);
 for(let y=0;y<512;y+=3){px.fillStyle='rgba(92,75,50,'+(.06+rand()*.15)+')';px.fillRect(0,y,512,.5+rand());}
 const pageTexture=tex(pagesCanvas),pageMat=material({map:pageTexture,roughness:.95});
 const pages=mesh(new THREE.BoxGeometry(5.84,1,7.82),pageMat,group);
 const spine=mesh(rounded(.18,1,7.99,.06),coverMat,group,-2.93,0,0);
 const creaseMat=material({color:'#38291d',transparent:true,opacity:.24,roughness:.9});
 const creases=[-.0,.065].map(dx=>mesh(new THREE.BoxGeometry(.018,.003,7.6),creaseMat,group,-2.72+dx,BOOK.top+.003,0));
 const ribbonMat=material({color:'#af5440',roughness:.75,bumpMap:cloth,bumpScale:.005,side:THREE.DoubleSide});
 const ribbon=mesh(new THREE.BoxGeometry(.17,.018,.62),ribbonMat,group,1.95,0,4.17);
 const headbandMat=material({color:'#c6ad7c',roughness:.75});
 const headbands=[-1,1].map(sign=>mesh(new THREE.CylinderGeometry(.038,.038,.34,12),headbandMat,group,-2.69,0,sign*3.87));headbands.forEach(m=>m.rotation.z=Math.PI/2);
 const artCanvas=canvas(1024,1536),ax=artCanvas.getContext('2d'),art=tex(artCanvas);
 const inkMat=material({map:art,transparent:true,color:'#ead7a6',metalness:.72,roughness:.31,depthWrite:false});
 const artwork=mesh(new THREE.PlaneGeometry(5.78,7.74),inkMat,group,0,BOOK.top+.006,0);artwork.rotation.x=-Math.PI/2;artwork.castShadow=false;
 const shadowCanvas=canvas(256,256),sx=shadowCanvas.getContext('2d'),gradient=sx.createRadialGradient(128,128,50,128,128,128);gradient.addColorStop(0,'rgba(0,0,0,.55)');gradient.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=gradient;sx.fillRect(0,0,256,256);
 const shadow=mesh(new THREE.PlaneGeometry(8.4,10.4),material({map:tex(shadowCanvas),transparent:true,depthWrite:false,roughness:1}),scene);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 function update(kind){
 const b=BOOKS[kind],th=b.thickness,hard=kind==='hardcover';
 desk.position.y=BOOK.top-th-.23;shadow.position.y=desk.position.y+.178;
 coverMat.color.set(b.color).multiplyScalar(.78);coverMat.roughness=hard?.75:kind==='softcover'?.4:.63;coverMat.bumpScale=hard?.018:.005;coverMat.clearcoat=hard?.08:.3;
 pages.scale.y=th-.07;pages.position.y=BOOK.top-th/2-.0275;bottom.position.y=BOOK.top-th;
 spine.scale.y=th;spine.position.y=BOOK.top-th/2;creases.forEach(m=>m.visible=hard);ribbon.visible=hard;ribbon.position.y=BOOK.top-th*.6;headbands.forEach(m=>{m.visible=hard;m.position.y=BOOK.top-th*.5;});
 ax.clearRect(0,0,1024,1536);ax.strokeStyle='#fff';ax.fillStyle='#fff';ax.lineWidth=2;ax.strokeRect(56,56,912,1424);ax.lineWidth=1;ax.strokeRect(70,70,884,1396);
 ax.textAlign='center';ax.font='22px Georgia';ax.fillText('THE WORFLOGY COLLECTION',512,162);
 ax.font='bold 94px Georgia';ax.fillText('AFTER',512,284);ax.fillText('HOURS',512,372);
 ax.font='23px Georgia';ax.fillText('A STUDY IN CHANCE & SMALL WONDERS',512,426);
 ax.save();ax.translate(512,780);ax.lineWidth=1;
 for(let i=0;i<3;i++){ax.beginPath();ax.arc(0,0,150+i*17,0,Math.PI*2);ax.stroke();}
 for(let i=0;i<24;i++){ax.rotate(Math.PI/12);ax.beginPath();ax.moveTo(0,148);ax.lineTo(0,i%3===0?182:166);ax.stroke();}
 ax.font='italic 86px Georgia';ax.fillText('W',0,29);ax.restore();
 ax.font='22px Georgia';ax.fillText(b.en.toUpperCase(),512,1250);ax.font='18px Georgia';ax.fillText('VOLUME 01   /   PLAY EDITION',512,1312);ax.font='bold 25px Arial';ax.fillText('WORFLOGY',512,1400);art.needsUpdate=true;
 inkMat.color.set(hard?'#ead7a6':'#fff1cc');inkMat.metalness=hard?.78:.05;inkMat.roughness=hard?.28:.58;
 }
 const hand=new THREE.Group();hand.name="book-flip-hand";scene.add(hand);
 const skin=material({color:'#cba183',roughness:.78});
 // One continuous silhouette: fingers, thumb, palm, wrist and off-screen forearm.
 const outline=new THREE.Shape();
 outline.moveTo(-.68,-32);outline.lineTo(-.29,-.85);
 outline.bezierCurveTo(-.28,-.52,-.42,-.30,-.43,.12);
 outline.lineTo(-.43,.80);outline.bezierCurveTo(-.43,.99,-.26,1.02,-.255,.81);
 outline.lineTo(-.245,.48);outline.quadraticCurveTo(-.235,.42,-.22,.49);
 outline.lineTo(-.205,1.04);outline.bezierCurveTo(-.20,1.24,-.025,1.25,-.025,1.045);
 outline.lineTo(-.015,.53);outline.quadraticCurveTo(0,.47,.015,.54);
 outline.lineTo(.025,1.15);outline.bezierCurveTo(.03,1.35,.215,1.34,.21,1.13);
 outline.lineTo(.195,.52);outline.quadraticCurveTo(.21,.46,.23,.53);
 outline.lineTo(.255,1.00);outline.bezierCurveTo(.265,1.18,.44,1.16,.43,.97);
 outline.lineTo(.395,.31);
 outline.bezierCurveTo(.40,.18,.49,.15,.53,.27);
 outline.bezierCurveTo(.60,.49,.80,.43,.73,.20);
 outline.lineTo(.61,-.11);outline.bezierCurveTo(.55,-.28,.31,-.39,.29,-.78);
 outline.lineTo(.68,-32);outline.closePath();
 const handGeo=new THREE.ExtrudeGeometry(outline,{depth:.14,bevelEnabled:true,bevelSize:.037,bevelThickness:.055,bevelSegments:5,curveSegments:12,steps:1});
 handGeo.rotateX(-Math.PI/2);handGeo.translate(0,-.07,0);
 const vertices=handGeo.attributes.position;
 for(let i=0;i<vertices.count;i++){
 const x=vertices.getX(i),z=vertices.getZ(i),y=vertices.getY(i);
 const dome=y>0?.035*Math.exp(-x*x*5-z*z*3):0;
 vertices.setY(i,y+dome+Math.max(0,z-.65)*.075);
 }
 handGeo.computeVertexNormals();mesh(handGeo,skin,hand);
 const flashMat=material({color:'#ffe7b1',transparent:true,opacity:0,depthWrite:false,emissive:'#d6a34f',emissiveIntensity:.3});
 const flash=mesh(new THREE.RingGeometry(.42,.45,64),flashMat,scene);flash.rotation.x=-Math.PI/2;flash.castShadow=false;
 return {update,animate({hit,charge,slap,power,camera}){
 const charging=charge>=0,active=slap<.65;
 hand.visible=charging||active;flash.visible=active&&slap>=.14;
 if(hand.visible){
 let height,bend;
 if(charging){height=.65+charge*.35;bend=.15+charge*.15;}
 else if(slap<.14){const u=slap/.14;height=(1-u*u)*.95;bend=(1-u)*.22;}
 else{const u=Math.min(1,(slap-.14)/.51);height=(1-Math.pow(1-u,3))*1.7;bend=u*.3;}
 const yaw=Math.atan2(camera.position.x-hit.x,camera.position.z-hit.z);
 hand.position.set(hit.x+Math.sin(yaw)*.1,BOOK.top+.14+height,hit.z+Math.cos(yaw)*.1);hand.rotation.set(-bend,yaw,0,"YXZ");hand.scale.set(1,slap>=.14&&slap<.19?.85:1,1);

 }
 if(flash.visible){const u=(slap-.14)/.51;flash.position.set(hit.x,BOOK.top+.012,hit.z);flash.scale.setScalar(1+u*(2+power*.12));flashMat.opacity=(1-u)*.4;}
 }};
}
