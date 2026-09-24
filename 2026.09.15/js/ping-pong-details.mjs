
/* Visual-only details: shared material ownership, bounded reusable impact pool. */
export function createPingDetails({THREE,scene,mesh,box,material,texture,finish}){
 let seed=519;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function rounded(w,h,d,r,m,parent,x=0,y=0,z=0){
 w-=r*.7;h-=r*.7;
 const shape=new THREE.Shape(),a=-w/2+r,b=-h/2+r,W=w-2*r,H=h-2*r;
 shape.moveTo(a,b-r);shape.lineTo(a+W,b-r);shape.quadraticCurveTo(a+W+r,b-r,a+W+r,b);shape.lineTo(a+W+r,b+H);shape.quadraticCurveTo(a+W+r,b+H+r,a+W,b+H+r);shape.lineTo(a,b+H+r);shape.quadraticCurveTo(a-r,b+H+r,a-r,b+H);shape.lineTo(a-r,b);shape.quadraticCurveTo(a-r,b-r,a,b-r);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r*.35,bevelSegments:3,steps:1,curveSegments:5});geo.translate(0,0,-(d-2*r)/2);
 return mesh(geo,m,parent,x,y,z);
 }
 function deskRelief(side,patches){
 const c=document.createElement('canvas');c.width=1024;c.height=768;const ctx=c.getContext('2d');ctx.fillStyle='#bcbcbc';ctx.fillRect(0,0,1024,768);
 for(let i=0;i<1300;i++){const y=rnd()*768;ctx.strokeStyle=i%2?'#c5c5c5':'#b5b5b5';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(340,y+2,690,y-2,1024,y);ctx.stroke();}
 for(const p of patches.filter(p=>Math.sign(p.z)===side)){const x=(p.x+2.6)/5.2*1024,y=(p.z-(side===1?.04:-4))/3.96*768,rx=p.r/5.2*1024,ry=p.r/3.96*768;ctx.strokeStyle='#353535';ctx.lineWidth=2.2;
 for(let j=-2;j<=2;j++){ctx.beginPath();ctx.moveTo(x-rx*.8,y+j*ry*.22);ctx.lineTo(x+rx*.75,y+j*ry*.22+ry*.35);ctx.stroke();}}
 const tx=texture(c);tx.colorSpace=THREE.NoColorSpace;return tx;
 }
 const exposed=material({color:'#d4b78a',roughness:.85}),dark=material({color:'#544538',roughness:.9});
 function deskWear(side){
 for(let j=0;j<24;j++){const sign=j%2?1:-1,z=side*(.15+rnd()*3.7),o=box(.012,.012+rnd()*.023,.025+rnd()*.12,exposed,scene,sign*2.595,-.045,z);o.rotation.x=rnd()*.3;}
 for(const xx of [-2.4,2.4])for(const z of [side*.2,side*3.83]){
 const screw=mesh(new THREE.CylinderGeometry(.031,.031,.004,14),dark,scene,xx,.001,z);box(.038,.004,.006,exposed,scene,xx,.004,z);
 }
 }

 // School furniture proportions: thin plywood, tubular steel, open book shelf.
 function schoolDesk(side){
 const steel=material({color:'#344c42',metalness:.38,roughness:.64}),rubber=material({color:'#272b26',roughness:.95}),rust=material({color:'#765038',roughness:.95});
 const tube=(a,b,r=.095,parent=scene)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),12),steel,parent);o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
 for(const xx of [-2.12,2.12]){
 for(const z of [.55,3.45]){tube([xx,-.2,side*z],[xx*1.065,-6.04,side*(z+(z>2?.12:-.12))],.105);mesh(new THREE.CylinderGeometry(.145,.15,.22,12),rubber,scene,xx*1.065,-6.06,side*(z+(z>2?.12:-.12)));}
 tube([xx,-.24,side*.55],[xx,-.24,side*3.45],.11);
 tube([xx,-4.75,side*.55],[xx,-4.75,side*3.45],.075);
 }
 tube([-2.12,-.24,side*.55],[2.12,-.24,side*.55],.11);tube([-2.12,-.24,side*3.45],[2.12,-.24,side*3.45],.11);
 // Open toward the pupil, with folded sheet-steel sides and a recessed shelf.
 box(4.18,.065,2.65,steel,scene,0,-1.2,side*1.95);
 for(const xx of [-2.08,2.08])box(.055,.92,2.65,steel,scene,xx,-.74,side*1.95);
 box(4.18,.92,.055,steel,scene,0,-.74,side*.63);
 tube([-2.12,-4.8,side*.6],[2.12,-4.8,side*.6],.075);
 for(let j=0;j<14;j++)box(.04,.025+rnd()*.09,.012,rust,scene,(j%2?1:-1)*2.22,-.6-rnd()*4.7,side*.55);
 // Bag hook on the outside of the frame.
 const hook=mesh(new THREE.TorusGeometry(.13,.035,8,16,Math.PI*1.4),steel,scene,2.22,-.75,side*2.8);hook.rotation.y=Math.PI/2;
 const wood=material({map:eraserWood(0),bumpMap:finish.grain('wood'),bumpScale:.007,roughness:.66,clearcoat:.18});
 const chair=new THREE.Group();scene.add(chair);chair.position.set(side*4.65,0,side*1.65);chair.rotation.y=side*.35;
 rounded(2.85,.16,2.7,.055,wood,chair,0,-2.65,0);
 rounded(2.85,1.12,.15,.04,wood,chair,0,-.97,-1.24);
 for(const x of [-1.13,1.13]){
 tube([x,-2.72,1],[x*1.13,-6.04,1.2],.085,chair);
 tube([x,-.43,-1.25],[x*1.13,-6.04,-1.45],.085,chair);
 tube([x,-4.8,-1.35],[x,-4.8,1.12],.065,chair);
 for(const z of [-1.45,1.2])mesh(new THREE.CylinderGeometry(.125,.13,.2,12),rubber,chair,x*1.13,-6.06,z);
 for(const y of [-.65,-1.24]){const rivet=mesh(new THREE.SphereGeometry(.045,10,6),steel,chair,x,y,-1.15);rivet.scale.z=.35;}
 }
 }


 function notebook(pages,cover){
 // Separate soft exercise books: trapped lower edge, bowed paper and loose tips.
 const g=new THREE.Group();scene.add(g);
 pages.side=THREE.DoubleSide;cover.side=THREE.DoubleSide;
 cover.bumpMap=finish.grain('cloth');cover.bumpScale=.002;
 const shades=['#557386','#8a7160','#657b66','#7c6f89'];
 for(let book=0;book<4;book++){
 const center=-1.95+book*1.3,lean=[.24,-.2,.29,-.25][book],height=[.69,.73,.7,.67][book];
 const jacket=material({color:shades[book],roughness:.86,bumpMap:finish.grain('paper'),bumpScale:.004,sheen:.12,side:THREE.DoubleSide});
 for(let layer=0;layer<7;layer++){
 const isCover=layer===0||layer===6,w=isCover?1.33:1.29,h=height-(isCover?0:.018);
 const geo=new THREE.PlaneGeometry(w,h,24,18),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){
 const x=pos.getX(i),v=(pos.getY(i)+h/2)/h,u=x/(w/2),free=Math.pow(v,2.4),edge=Math.pow(Math.abs(u),3);
 const sag=(.065+.065*edge)*free;
 const bow=lean*free+Math.sin(u*Math.PI*.8+book)*.06*free;
 const fan=(layer-3)*(.006+.009*free);
 pos.setXYZ(i,x+Math.sin(v*Math.PI)*.014*u,.005+v*h-sag,bow+fan+Math.sin(u*5+book)*.024*free);
 }
 geo.computeVertexNormals();mesh(geo,isCover?jacket:pages,g,center,0,0);
 }
 }
 }
 function eraserWood(i){
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle=i?'#aa754d':'#c69e68';x.fillRect(0,0,512,256);
 for(let j=0;j<460;j++){const y=rnd()*256;x.strokeStyle=j%2?'#65442b30':'#f7dfb12a';x.lineWidth=.5+rnd();x.beginPath();x.moveTo(0,y);x.bezierCurveTo(150,y+7,350,y-6,512,y);x.stroke();}
 for(let j=0;j<85;j++){x.fillStyle='#e2d9c244';x.fillRect(rnd()*512,rnd()*256,1+rnd()*8,1);}
 return texture(c);
 }
 const chalk=material({color:'#d5d4bf',roughness:1}),feltSeam=material({color:'#8a8c80',roughness:1});

 function eraserSurface(board,index=0){
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
 x.fillStyle=board?(index?'#716651':'#555f59'):'#696d68';x.fillRect(0,0,512,256);
 for(let j=0;j<4800;j++){x.fillStyle=j%3?'#eeece03b':'#282f301f';const px=rnd()*512,py=rnd()*256;x.fillRect(px,py,board?2:2,board?1:3);}
 for(let j=0;j<35;j++){const px=rnd()*512,py=rnd()*256,r=12+rnd()*40,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,board?'#eeeade38':'#eeeade99');gr.addColorStop(1,'#eeeade00');x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2);}
 return texture(c);
 }

 function eraserWear(g){
 const cardboard=material({color:'#a89a78',roughness:1});
 for(let j=0;j<4;j++){
 for(const z of [-.222,.222])box(.86,.003,.003,cardboard,g,0,.016+j*.021,z);
 for(const x of [-.471,.471])box(.003,.003,.35,cardboard,g,x,.016+j*.021,0);
 }
 for(let j=0;j<14;j++)box(.012+rnd()*.03,.006,.008,cardboard,g,-.43+rnd()*.86,.094,(j%2?1:-1)*.19);

 for(let i=0;i<7;i++)box(.85,.006,.008,feltSeam,g,0,-.19,-.17+i*.057);
 for(let i=0;i<28;i++){const a=rnd()*Math.PI*2;mesh(new THREE.SphereGeometry(.004+rnd()*.007,5,4),chalk,g,Math.cos(a)*.45,-.13+rnd()*.05,Math.sin(a)*.19);}
 }

 const puff=document.createElement('canvas');puff.width=puff.height=64;const pc=puff.getContext('2d'),pg=pc.createRadialGradient(32,32,0,32,32,32);pg.addColorStop(0,'#f2f0df99');pg.addColorStop(.4,'#f2f0df44');pg.addColorStop(1,'#f2f0df00');pc.fillStyle=pg;pc.fillRect(0,0,64,64);const puffMap=texture(puff);
 const effects=[];
 for(let i=0;i<6;i++){
 const group=new THREE.Group();scene.add(group);
 const mat=material({color:'#e6ddc2',transparent:true,opacity:0,depthWrite:false,roughness:1});
 const ring=mesh(new THREE.RingGeometry(.085,.103,32),mat,group);ring.rotation.x=-Math.PI/2;ring.castShadow=ring.receiveShadow=false;
 const dustMat=material({map:puffMap,transparent:true,opacity:0,depthWrite:false,roughness:1,side:THREE.DoubleSide});
 const motes=[];for(let j=0;j<12;j++){const m=mesh(new THREE.PlaneGeometry(.15,.15),dustMat,group);m.castShadow=m.receiveShadow=false;motes.push(m);}
 group.visible=false;effects.push({group,mat,dustMat,ring,motes,life:0,dust:false});
 }
 let slot=0;
 function impact(p,dust){
 const f=effects[slot++%effects.length];f.group.position.set(p.x,dust?p.y:.012,p.z);f.life=dust?.46:.24;f.dust=dust;f.group.visible=true;f.ring.visible=!dust;
 f.motes.forEach((m,j)=>{m.visible=dust;m.position.set(0,0,0);m.userData.v=new THREE.Vector3(Math.cos(j*2.4)*(.15+rnd()*.3),.1+rnd()*.22,Math.sin(j*2.4)*(.15+rnd()*.3));});
 }
 function update(dt,game,camera){
 for(const f of effects){if(f.life<=0)continue;f.life=Math.max(0,f.life-dt);f.group.visible=f.life>0;const u=1-f.life/(f.dust?.46:.24);f.mat.opacity=(1-u)*(f.dust?.6:.32);f.ring.scale.setScalar(1+u*2.3);f.dustMat.opacity=(1-u)*.55;for(const m of f.motes)if(m.visible){m.position.addScaledVector(m.userData.v,dt);m.scale.setScalar(.6+u*2.2);if(camera)m.quaternion.copy(camera.quaternion);}}
 }
 return{eraserSurface,schoolDesk,rounded,deskRelief,deskWear,notebook,eraserWood,eraserWear,impact,update};
}
