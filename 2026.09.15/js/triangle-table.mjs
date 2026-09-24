import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {createTablePan} from './table-pan.mjs';

// Real tabletop lighting/materials, with the playable paper as a dynamic texture.
export function createTriangleTable(board,onProject){
 const canvas=document.createElement('canvas');canvas.className='triangle-table-canvas';canvas.setAttribute('aria-hidden','true');board.prepend(canvas);
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{canvas.remove();return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#233b43');
 const camera=new THREE.PerspectiveCamera(36,1,.1,100),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 const mat=(color,roughness=.6,metalness=0)=>finish.material({color,roughness,metalness});
 function mesh(g,m,x=0,y=0,z=0,parent=scene){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,d,m,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
 scene.add(new THREE.HemisphereLight(0xdceef4,0x584031,1.6));
 const sun=new THREE.DirectionalLight(0xffe4b9,3);sun.position.set(-6,13,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:40});sun.shadow.normalBias=.012;sun.shadow.bias=-.0001;scene.add(sun);
 const fill=new THREE.DirectionalLight(0x98cfdf,1.2);fill.position.set(8,8,-7);scene.add(fill);
 const wood=mat('#8d5b36',.46);wood.bumpMap=finish.grain('wood');wood.bumpScale=.035;wood.roughnessMap=wood.bumpMap;
 box(19,.7,16,wood,0,-.64,0);const trim=mat('#263b40',.4,.45);box(19.15,.12,16.15,trim,0,-1,0);
 const leather=mat('#244c48',.86);leather.bumpMap=finish.grain('felt');leather.bumpScale=.018;box(16.6,.11,13.9,leather,0,-.225,0);
 const stitchMat=mat('#b0a17c',.95);for(let x=-8;x<8;x+=.25)for(const z of [-6.6,6.6])box(.1,.008,.02,stitchMat,x,-.164,z);for(let z=-6.5;z<6.5;z+=.25)for(const x of [-8,8])box(.02,.008,.1,stitchMat,x,-.164,z);
 const paperGroup=new THREE.Group();scene.add(paperGroup);
 for(let i=0;i<5;i++){const sheet=box(12.3,.024,8.3,mat(i%2?'#e7ddc5':'#f4ecdb',.95),i%2*.025,-.08+i*.028,0,paperGroup);sheet.rotation.y=(i-2)*.0018;}
 const textureCanvas=document.createElement('canvas');textureCanvas.width=1800;textureCanvas.height=1152;const ctx=textureCanvas.getContext('2d');
 const base=document.createElement('canvas');base.width=1800;base.height=1152;const bx=base.getContext('2d');bx.fillStyle='#f8f2df';bx.fillRect(0,0,1800,1152);
 let seed=31;for(let i=0;i<90000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%1800;seed=(seed*1664525+1013904223)>>>0;bx.fillStyle=i%2?'#846b3c0b':'#ffffff35';bx.fillRect(x,seed%1152,1,1);}
 bx.strokeStyle='#849fba28';bx.lineWidth=1;for(let y=75;y<1152;y+=48){bx.beginPath();bx.moveTo(0,y);bx.lineTo(1800,y);bx.stroke();}
 bx.strokeStyle='#c96c673d';bx.beginPath();bx.moveTo(72,0);bx.lineTo(72,1152);bx.stroke();
 bx.fillStyle='#596967';bx.font='600 25px Arial';bx.fillText('WORFLOGY / AFTER HOURS',104,41);bx.textAlign='right';bx.fillText('TRIANGLE TERRITORY',1745,41);
 const paperTexture=new THREE.CanvasTexture(textureCanvas);paperTexture.colorSpace=THREE.SRGBColorSpace;paperTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(paperTexture);
 const paperMat=finish.material({map:paperTexture,roughness:.94,bumpMap:finish.grain('felt'),bumpScale:.002});
 const page=mesh(new THREE.PlaneGeometry(12,8),paperMat,0,.065,0,paperGroup);page.rotation.x=-Math.PI/2;page.castShadow=false;
 const gold=mat('#b7a16c',.28,.8),graphite=mat('#323b3d',.8),cedar=mat('#d5ae7b',.85);
 function pencil(color,x,z,angle){const g=new THREE.Group();scene.add(g);g.position.set(x,.01,z);g.rotation.y=angle;
  const body=mesh(new THREE.CylinderGeometry(.085,.085,3.4,6),mat(color,.38),0,.1,0,g);body.rotation.x=Math.PI/2;
  const tip=mesh(new THREE.ConeGeometry(.085,.4,6),cedar,0,.1,-1.9,g);tip.rotation.x=-Math.PI/2;
  const lead=mesh(new THREE.ConeGeometry(.027,.13,12),graphite,0,.1,-2.12,g);lead.rotation.x=-Math.PI/2;
  const cap=mesh(new THREE.CylinderGeometry(.089,.089,.2,24),gold,0,.1,1.63,g);cap.rotation.x=Math.PI/2;
  return g;
 }
 pencil('#1e776d',6.85,1,-.18);pencil('#b85e48',7.4,1.7,-.1);
 const eraser=box(.85,.3,1.4,mat('#e6c3b8',.95),-7,.03,3);eraser.rotation.y=-.25;const sleeve=box(.88,.31,.8,mat('#456c79',.75),-7,.035,3);sleeve.rotation.y=-.25;
 const ruler=new THREE.Group();scene.add(ruler);ruler.position.set(-7,-.03,-.5);ruler.rotation.y=.08;box(.8,.12,6,mat('#d2ae6f',.52),0,0,0,ruler);
 for(let i=0;i<=50;i++)box(i%5===0?.35:.18,.005,.012,graphite,.2,.063,-2.8+i*.112,ruler);
 const clip=new THREE.Group();paperGroup.add(clip);clip.position.set(0,.2,-4.05);box(1.25,.2,.5,trim,0,0,0,clip);
 for(const x of [-.46,.46]){const ring=mesh(new THREE.TorusGeometry(.24,.022,8,32),gold,x,.19,-.12,clip);ring.rotation.x=-Math.PI/3;}
 let state=null,edgeCount=0,started=0,frame,disposed=false,depthScale=1,dirty=true;
 const pan=createTablePan(camera,canvas);
 const defaultElevation=Math.atan2(1,.43);let azimuth=0,elevation=defaultElevation,zoom=1,baseDistance=16.5,pointer=null;
 function world(p){return new THREE.Vector3((p.x/1000-.5)*12,.072,(p.y/640-.5)*8*depthScale);}
 function project(){if(state)onProject(state.game.points.map(p=>{const q=world(p).project(camera);return{x:(q.x+1)*50,y:(1-q.y)*50,visible:q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1&&Math.abs(q.y)<=1};}));}
 function view(){const radius=baseDistance*Math.hypot(1,.43)*zoom;camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*radius,Math.sin(elevation)*radius,Math.cos(azimuth)*Math.cos(elevation)*radius).add(pan.offset);camera.lookAt(pan.offset);camera.updateMatrixWorld();project();dirty=true;}
 function control(action){if(action==='in')zoom=Math.max(.6,zoom/1.15);if(action==='out')zoom=Math.min(1.65,zoom*1.15);if(action==='left')azimuth-=.2;if(action==='right')azimuth+=.2;if(action==='home'){zoom=1;azimuth=0;elevation=defaultElevation;pan.reset();}view();}
 function down(e){
  if(pointer||e.target.closest('[data-triangle-camera]')||![0,2].includes(e.button))return;
  if(e.button===0&&e.target.closest('.triangle-dot'))return;
  e.preventDefault();pointer={id:e.pointerId,x:e.clientX,y:e.clientY,mode:e.button===2?'orbit':'pan'};board.setPointerCapture(e.pointerId);board.classList.add('triangle-dragging');
 }
 function move(e){if(!pointer||pointer.id!==e.pointerId)return;
  if(pointer.mode==='pan'){pan.move(pointer.x,pointer.y,e.clientX,e.clientY);pan.offset.x=THREE.MathUtils.clamp(pan.offset.x,-6,6);pan.offset.z=THREE.MathUtils.clamp(pan.offset.z,-7,7);}
  else{azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.65,1.45);}
  pointer.x=e.clientX;pointer.y=e.clientY;view();
 }
 function up(e){if(pointer?.id!==e.pointerId)return;pointer=null;board.classList.remove('triangle-dragging');if(board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId);}
 function wheel(e){e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*Math.exp(e.deltaY*.001),.6,1.65);view();}
 function context(e){e.preventDefault();}
 function key(e){if(['+','=','-','0'].includes(e.key)){e.preventDefault();control(e.key==='0'?'home':e.key==='-'?'out':'in');}}
 board.addEventListener('pointerdown',down);board.addEventListener('pointermove',move);board.addEventListener('pointerup',up);board.addEventListener('pointercancel',up);board.addEventListener('lostpointercapture',up);board.addEventListener('wheel',wheel,{passive:false});board.addEventListener('contextmenu',context);board.addEventListener('keydown',key);
 function draw(fraction=1){if(!state)return;const {game,selected}=state;ctx.drawImage(base,0,0);ctx.save();ctx.scale(1.8,1.8);
  for(const {ids,owner} of game.triangles){ctx.save();ctx.beginPath();ids.forEach((id,i)=>{const p=game.points[id];ctx[i?'lineTo':'moveTo'](p.x,p.y);});ctx.closePath();ctx.clip();ctx.fillStyle=owner===0?'#208d7670':'#c66b4475';ctx.fillRect(0,0,1000,640);ctx.strokeStyle=owner===0?'#1f695b90':'#95492d90';ctx.lineWidth=.6;for(let x=-640;x<1100;x+=5){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(owner===0?640:-640),640);ctx.stroke();}ctx.restore();const p=ids.reduce((a,i)=>({x:a.x+game.points[i].x/3,y:a.y+game.points[i].y/3}),{x:0,y:0});ctx.fillStyle='#354a43';ctx.font='600 19px Georgia';ctx.textAlign='center';ctx.fillText(owner===0?'Y':'C',p.x,p.y+4);}
  game.edges.forEach(([a,b],i)=>{const p=game.points[a],q=game.points[b],f=i===game.edges.length-1?fraction:1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(q.x-p.x)*f,p.y+(q.y-p.y)*f);ctx.strokeStyle=i===game.edges.length-1?'#8b642c':'#354149';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.stroke();});
  // Projected native dot buttons keep targets and labels crisp at every size.
  ctx.restore();paperTexture.needsUpdate=true;dirty=true;
 }
 function resize(){const r=board.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;depthScale=r.width<600?1.3:1;paperGroup.scale.z=depthScale;
  renderer.shadowMap.needsUpdate=true;baseDistance=r.width<600?22:16.5;camera.updateProjectionMatrix();view();draw();}
 const ro=new ResizeObserver(resize);ro.observe(board);board.classList.add('triangle-3d');resize();
 function animate(now){if(disposed)return;if(!document.hidden){const f=Math.min(1,(now-started)/330);if(f<1||started){draw(f);if(f===1)started=0;}if(dirty){renderer.render(scene,camera);dirty=false;}}frame=requestAnimationFrame(animate);}frame=requestAnimationFrame(animate);
 return {control,sync(game,selected){const added=state&&state.game===game&&game.edges.length>edgeCount;state={game,selected};edgeCount=game.edges.length;if(added&&!matchMedia('(prefers-reduced-motion: reduce)').matches)started=performance.now();else started=0;draw(started?0:1);project();},dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();if(pointer)up({pointerId:pointer.id});for(const [type,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['wheel',wheel],['contextmenu',context],['keydown',key]])board.removeEventListener(type,fn);finish.dispose();sun.shadow.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();board.classList.remove('triangle-3d');}};
}
