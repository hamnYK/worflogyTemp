import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {createTablePan} from './table-pan.mjs';
import {PEBBLE} from './pebble-physics.mjs';
export function createPebbleTable(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#233b43');
 const camera=new THREE.PerspectiveCamera(38,1,.1,120),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 const material=(color,roughness=.8,metalness=0)=>finish.material({color,roughness,metalness});
 function mesh(g,m,x=0,y=0,z=0){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
 const box=(w,h,d,m,x,y,z)=>mesh(finish.beveledBox(w,h,d),m,x,y,z);
 scene.add(new THREE.HemisphereLight(0xdcecf2,0x685137,1.7));
 const sun=new THREE.DirectionalLight(0xffe4bb,3.2);sun.position.set(-8,16,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:12,bottom:-12,near:.1,far:45});sun.shadow.normalBias=.02;scene.add(sun);
 const rim=new THREE.DirectionalLight(0x97c6d7,1.1);rim.position.set(9,8,-8);scene.add(rim);
 const base=document.createElement('canvas');base.width=1600;base.height=1024;const bx=base.getContext('2d');bx.fillStyle='#a48663';bx.fillRect(0,0,1600,1024);
 let seed=93;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
 for(let i=0;i<145000;i++){const x=rand()*1600,y=rand()*1024,r=.35+rand()*.9;bx.fillStyle=i%3?'#49331d30':'#fff2cb65';bx.beginPath();bx.ellipse(x,y,r,r*.7,0,0,Math.PI*2);bx.fill();}
 bx.strokeStyle='#75533620';bx.lineWidth=1;for(let i=0;i<170;i++){const x=rand()*1600,y=rand()*1024;bx.beginPath();bx.moveTo(x,y);bx.lineTo(x+rand()*40,y+rand()*6);bx.stroke();}
 const paint=document.createElement('canvas');paint.width=1600;paint.height=1024;const ctx=paint.getContext('2d'),map=new THREE.CanvasTexture(paint);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(map);
 const relief=document.createElement('canvas');relief.width=1600;relief.height=1024;const rx=relief.getContext('2d');
 const grain=document.createElement('canvas');grain.width=1600;grain.height=1024;const gx=grain.getContext('2d');gx.fillStyle='#999';gx.fillRect(0,0,1600,1024);
 for(let i=0;i<180000;i++){const shade=70+Math.floor(rand()*130);gx.fillStyle=`rgb(${shade},${shade},${shade})`;gx.fillRect(rand()*1600,rand()*1024,1+rand()*2,1+rand()*2);}
 const reliefMap=new THREE.CanvasTexture(relief);textures.add(reliefMap);reliefMap.anisotropy=map.anisotropy;
 const soil=finish.material({map,roughness:.98,bumpMap:reliefMap,bumpScale:.045});
 box(17,.55,11.24,material('#705137'),0,-.36,0);
 const ground=mesh(new THREE.PlaneGeometry(16,10.24),soil,0,0,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const stoneMat=material('#b7ada0',.92);stoneMat.bumpMap=finish.grain('stone');stoneMat.bumpScale=.025;const wood=material('#795334',.65);wood.bumpMap=finish.grain('wood');wood.bumpScale=.02;
 for(let i=0;i<22;i++){box(.73,.14,.32,stoneMat,-8.05+i*.77,.015,-5.3);box(.73,.14,.32,stoneMat,-8.05+i*.77,.015,5.3);}
 for(let i=0;i<13;i++)for(const side of [-1,1])box(.32,.14,.73,stoneMat,side*8.25,.015,-4.7+i*.78);
 // Weathered schoolyard bench and grass beyond the playable rectangle.
 for(let i=0;i<4;i++)box(5,.12,.22,wood,-3,.55,-6.1+i*.25);
 const iron=material('#35443f',.55,.55);for(const x of [-4.8,-1.2]){box(.12,.8,.8,iron,x,.18,-5.7);box(.12,1.25,.12,iron,x,.68,-6.15);}
 for(let i=0;i<3;i++)box(5,.22,.1,wood,-3,.98+i*.26,-6.15);
 const grass=material('#687851',1);
 for(let i=0;i<55;i++){const o=mesh(new THREE.ConeGeometry(.035,.16+rand()*.2,4),grass,(rand()-.5)*17,.08,rand()<.5?-5.65:5.65);o.rotation.z=(rand()-.5)*.6;}
 const mineral=document.createElement('canvas');mineral.width=mineral.height=256;const mx=mineral.getContext('2d'),pixels=mx.createImageData(256,256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,vein=Math.abs(Math.sin(x*.037+Math.sin(y*.046)*1.6)),shade=130+rand()*65+(vein<.075?45:0);pixels.data[i]=shade;pixels.data[i+1]=shade*.98;pixels.data[i+2]=shade*.94;pixels.data[i+3]=255;}mx.putImageData(pixels,0,0);
 const mineralMap=new THREE.CanvasTexture(mineral);mineralMap.colorSpace=THREE.SRGBColorSpace;textures.add(mineralMap);
 function rock(radius,color,n){
  const geo=new THREE.SphereGeometry(1,48,32),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),factor=1+.095*Math.sin(x*5+n)*Math.cos(z*6-y*4)+.035*Math.sin(y*15+x*11);pos.setXYZ(i,x*factor,y*.75*factor,z*.94*factor);}geo.computeVertexNormals();
  const m=material(color,.86,.02);m.map=mineralMap;m.bumpMap=mineralMap;m.bumpScale=.012;m.clearcoat=.08;
  const o=mesh(geo,m);o.scale.setScalar(radius*.016);return o;
 }
 const rocks=[rock(PEBBLE.radius,'#829d94',1),rock(PEBBLE.radius,'#af8c79',2)],obstacleModels=[];
 const cached=document.createElement('canvas');cached.width=1600;cached.height=1024;const cx=cached.getContext('2d');
 let lastLand='',lastGame=null;
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),pan=createTablePan(camera,canvas);
 const defaultView={zoom:.76,azimuth:-.58,elevation:1.02,x:-1,z:.35};
 let {zoom,azimuth,elevation}=defaultView;
 pan.offset.set(defaultView.x,0,defaultView.z);
 let disposed=false,frame,dirty=true,lastKey='';
 const world=p=>new THREE.Vector3((p.x-500)*.016,.01,(p.y-320)*.016);
 function view(){const d=19*zoom*Math.max(1,1.18/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d).add(pan.offset);camera.lookAt(pan.offset);camera.updateMatrixWorld();dirty=true;}
 function hit(x,y){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);const p=ray.ray.intersectPlane(plane,new THREE.Vector3());return p?{x:p.x/.016+500,y:p.z/.016+320}:null;}
 function control(action){if(action==='in')zoom=Math.max(.55,zoom/1.15);if(action==='out')zoom=Math.min(1.7,zoom*1.15);if(action==='left')azimuth-=.2;if(action==='right')azimuth+=.2;if(action==='home'){({zoom,azimuth,elevation}=defaultView);pan.offset.set(defaultView.x,0,defaultView.z);}view();}
 function move(mode,x,y,nx,ny){if(mode==='orbit'){azimuth-=(nx-x)*.007;elevation=THREE.MathUtils.clamp(elevation+(ny-y)*.004,.65,1.45);}else{pan.move(x,y,nx,ny);pan.offset.x=THREE.MathUtils.clamp(pan.offset.x,-7,7);pan.offset.z=THREE.MathUtils.clamp(pan.offset.z,-5,5);}view();}
 function stroke(points,color,width,dash=[]){if(!points.length)return;ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
 function rut(context,path,width,depth=false){
  if(path.length<2)return;
  const draw=(color,w,offset=0)=>{context.beginPath();path.forEach((p,i)=>context[i?'lineTo':'moveTo'](p.x,p.y+offset));context.strokeStyle=color;context.lineWidth=w;context.lineCap='round';context.lineJoin='round';context.stroke();};
  if(depth){draw('#656565',width);draw('#424242',Math.max(1,width*.35));}
  else{draw('#e2c39a88',width+1.5,-1.1);draw('#73553599',width);draw('#62432988',Math.max(.6,width*.25));}
 }
 function sync(game,{surface,frame:sample,flight,elapsed=0,target}){
  const landKey=game.revision+':'+surface.revision;
  if(lastGame!==game||lastLand!==landKey){lastGame=game;lastLand=landKey;ctx.drawImage(base,0,0);ctx.save();ctx.scale(1.6,1.6);
   for(let i=0;i<game.land.length;i++){const owner=game.land[i];if(!owner)continue;const x=i%200,y=Math.floor(i/200);ctx.fillStyle=owner===1?'#177d6959':'#a6483059';ctx.fillRect(x*5,y*5,5,5);ctx.strokeStyle=owner===1?'#d6fff1dd':'#ffe3bbdd';ctx.lineWidth=1.25;ctx.beginPath();if(x===0||game.land[i-1]!==owner){ctx.moveTo(x*5,y*5);ctx.lineTo(x*5,y*5+5);}if(x===199||game.land[i+1]!==owner){ctx.moveTo(x*5+5,y*5);ctx.lineTo(x*5+5,y*5+5);}if(y===0||game.land[i-200]!==owner){ctx.moveTo(x*5,y*5);ctx.lineTo(x*5+5,y*5);}if(y===127||game.land[i+200]!==owner){ctx.moveTo(x*5,y*5+5);ctx.lineTo(x*5+5,y*5+5);}ctx.stroke();}
   // A faint directional mark also preserves the visibility of older physical grooves.
   for(let i=0;i<surface.depth.length;i++)if(surface.depth[i]>.12){const x=(i%200+.5)*5,y=(Math.floor(i/200)+.5)*5;stroke([{x:x-surface.axisX[i]*2,y:y-surface.axisY[i]*2},{x:x+surface.axisX[i]*2,y:y+surface.axisY[i]*2}],'#60452922',1);}
   for(const trail of surface.trails)rut(ctx,trail.path,trail.width);
   ctx.strokeStyle='#f6e9c3aa';ctx.lineWidth=2;ctx.strokeRect(2,2,996,636);ctx.fillStyle='#503f2ab0';ctx.font='600 12px Arial';ctx.fillText('WORFLOGY / AFTER HOURS',18,23);ctx.textAlign='right';ctx.fillText('PEBBLE TERRITORY',982,23);ctx.textAlign='left';ctx.restore();cx.drawImage(paint,0,0);lastKey='';
  }
  const key=[landKey,game.turn,game.shots,game.stone.x,game.stone.y,target?.x,target?.y,Math.floor(elapsed*24)].join(':');
  if(key!==lastKey){
   lastKey=key;ctx.drawImage(cached,0,0);ctx.save();ctx.scale(1.6,1.6);rx.drawImage(grain,0,0);rx.save();rx.scale(1.6,1.6);
   for(const trail of surface.trails)rut(rx,trail.path,trail.width,true);
   if(flight){const frames=flight.frames.filter(f=>f.time<=elapsed);for(let i=0;i<flight.trails.length;i++){const path=frames.map(f=>i?f.rocks[i-1]:f.stone);rut(ctx,path,flight.trails[i].width);rut(rx,path,flight.trails[i].width,true);}
    for(const hit of flight.hits){const age=elapsed-hit.time;if(age<0||age>.35)continue;ctx.fillStyle='#efd3a266';for(let i=0;i<9;i++){const a=i*2.399,dist=age*45*(.5+i/12);ctx.beginPath();ctx.arc(hit.x+Math.cos(a)*dist,hit.y+Math.sin(a)*dist,1.4*(1-age/.35),0,Math.PI*2);ctx.fill();}}
   }
   stroke(game.path,'#62463099',1.2);
   if(target){const dx=target.x-game.stone.x,dy=target.y-game.stone.y,d=Math.hypot(dx,dy),scale=Math.min(1,70/d);stroke([game.stone,{x:game.stone.x+dx*scale,y:game.stone.y+dy*scale}],'#fff5ce',1.7,[5,4]);}
   ctx.restore();rx.restore();map.needsUpdate=true;reliefMap.needsUpdate=true;
  }
  for(let i=0;i<2;i++){const p=i===game.turn?(sample?.stone||game.stone):game.home(i);rocks[i].visible=!!p;if(p){const v=world(p),r=p.rotation||0;rocks[i].position.set(v.x,.13+Math.abs(Math.sin(r*2))*.012,v.z);rocks[i].rotation.set(Math.sin(r)*.2,r*.3,Math.cos(r*1.3)*.16);}}
  while(obstacleModels.length<surface.obstacles.length)obstacleModels.push(rock(30,['#9a9487','#827c73','#aaa08b','#88877c','#958d7c'][obstacleModels.length],obstacleModels.length+3));
  obstacleModels.forEach((o,i)=>{const b=surface.obstacles[i];o.visible=!!b;if(b){const p=sample?.rocks[i]||b,v=world(p);o.scale.setScalar(b.radius*.016);o.position.set(v.x,b.radius*.016*.74,v.z);o.rotation.set(Math.sin(p.rotation)*.13,p.rotation,Math.cos(p.rotation)*.1);}});
  dirty=true;
 }
 function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();view();}
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
 function animate(){if(disposed)return;if(dirty&&!document.hidden){renderer.render(scene,camera);dirty=false;}frame=requestAnimationFrame(animate);}animate();
 return{sync,hit,control,move,project(p){const q=world(p).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(q.x+1)*r.width/2,y:r.top+(1-q.y)*r.height/2};},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();finish.dispose();sun.shadow.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
