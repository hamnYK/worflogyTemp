import {batchPlushParts} from './plush-batching.mjs';
﻿
import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {resizeArcadeRenderer} from './arcade-rendering.mjs';
import {createTablePan} from './table-pan.mjs';
import {clawGuide,syncGuide} from './game-guides.mjs';
import {createPlushAtelier} from './plush-atelier.mjs';
import {ClawPhysics,plushInventory,CLAW,chuteLayout} from './claw-physics.mjs';

export function mountClawMachine(host,{onExit,onWin=onExit,english=false}={}){
 const t=(ko,en)=>english?en:ko;
 host.innerHTML=`<div class="chip-game claw-game"><div class="chip-game-heading"><button class="wf-button claw-back" type="button">${t('게임 선택','Games')}</button><h2>POCKET PLUSH</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('인형 뽑기. 키보드 전용. 5회 안에 친구 3개. 방향키로 위치, Q와 E로 집게 방향 조절. 스페이스로 내리고 다시 누르면 닫기.','Claw machine. Keyboard only. Collect 3 friends in 5 tries. Arrow keys move, Q and E turn the claw. Space lowers; press again to close.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="claw-caption">AFTER HOURS TOY CLUB<span>SMALL FRIENDS, BIG FEELINGS.</span></div><div class="chip-camera"><button type="button" data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button type="button" data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button type="button" data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button type="button" data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button type="button" data-view="front">${t('정면','Front')}</button><button type="button" data-view="top">${t('위에서','Above')}</button></div></div><div class="chip-controls claw-keyboard"><span><kbd>↑ ↓ ← →</kbd> ${t('이동','Move')}</span><span><kbd>Q / E</kbd> ${t('집게 회전','Turn claw')}</span><span><kbd>SPACE</kbd> ${t('내리기 / 닫기','Lower / close')}</span></div><p class="chip-status" role="status" aria-live="polite"></p><div class="claw-collection" aria-label="${t('모은 인형','Collected plushies')}"></div></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),progress=root.querySelector('output'),result=root.querySelector('.chip-result'),collection=root.querySelector('.claw-collection');
 root.querySelector('.claw-back').onclick=onExit;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{status.textContent=t('3D 화면을 시작할 수 없습니다. 하드웨어 가속을 확인해 주세요.','Unable to start 3D. Please check hardware acceleration.');return{dispose(){}};}
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#233b43');scene.fog=new THREE.Fog('#233b43',24,55);
 const camera=new THREE.PerspectiveCamera(36,1,.1,80),geos=new Set(),mats=new Set(),textures=new Set();
 const finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 const mat=(color,opts={})=>finish.material({color,roughness:.45,...opts});
 const cream=mat('#f4e7cf',{clearcoat:.6}),green=mat('#527d75',{metalness:.3}),gold=mat('#c9aa74',{metalness:.78,roughness:.25}),steel=mat('#d8e1e3',{metalness:.9,roughness:.2}),dark=mat('#223e43'),pink=mat('#e7a6a4'),white=mat('#fff4dc');
 const mesh=(g,m,x=0,y=0,z=0,parent=scene)=>{geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(w,h,d,m,x,y,z,p)=>mesh(finish.beveledBox(w,h,d),m,x,y,z,p);
 const sphere=new THREE.SphereGeometry(1,28,20);
 const oval=(m,x,y,z,sx,sy,sz,p)=>{const o=mesh(sphere,m,x,y,z,p);o.scale.set(sx,sy,sz);return o;};
 function tube(points,r,m,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),m,0,0,0,parent);}
 function label(text,w,h,x,y,z,color='#254c48',bg='#f1e5ce',size=60){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font='700 '+Math.min(200,size*2.1)+'px Arial';ctx.fillText(text,512,132,930);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);return mesh(new THREE.PlaneGeometry(w,h),mat('#ffffff',{map:tex,roughness:.65}),x,y,z);
 }
 scene.add(new THREE.HemisphereLight(0xe0f7ff,0x576353,1.6));
 const sun=new THREE.DirectionalLight(0xffe4ba,2.8);sun.position.set(-5,10,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:9,bottom:-7,near:.1,far:30});sun.shadow.normalBias=.008;scene.add(sun);
 const cabinetLight=new THREE.PointLight(0xffe7d0,12,8,2);cabinetLight.position.set(0,5,1);scene.add(cabinetLight);
 const fill=new THREE.DirectionalLight(0xa5dce3,1.6);fill.position.set(6,7,-5);scene.add(fill);
 const floor=mesh(new THREE.PlaneGeometry(100,100),mat('#30484b',{roughness:1}),0,-.24,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 finish.plinth(7.4,6.4,-.12,'#527d75');
 // Enamel cabinet, recessed prize bay, padded bed and brass corner hardware.
 box(6.2,1.25,4.8,green,0,.65,0);box(6.3,.14,4.9,gold,0,1.29,0);const bed=mat('#d9a5a6',{roughness:.93,bumpMap:finish.grain('fabric'),bumpScale:.018,sheen:.5,sheenColor:new THREE.Color('#f7d7c5')});chuteLayout().beds.forEach(([x,y,z,w,h,d])=>box(w,h,d,bed,x,y,z));
 const roof=[box(6.3,.55,4.9,cream,0,6.15,0),box(6.38,.08,4.98,cream,0,6.44,0)];
 roof.push(box(5.94,.035,4.56,green,0,6.49,0));
 for(const x of [-2.85,2.85])for(const z of [-2.16,2.16])roof.push(oval(gold,x,6.519,z,.047,.014,.047));
 roof.push(label('POCKET PLUSH',4.5,.43,0,6.18,2.46),label('01 / AFTER HOURS TOY CLUB',3.3,.22,0,5.85,2.46,'#a88351'));
 for(const x of [-3,3])for(const z of [-2.3,2.3]){
  box(.17,4.55,.17,cream,x,3.72,z);box(.21,.12,.21,gold,x,1.62,z);
  oval(gold,x,5.8,z+.1,.045,.045,.025);
 }
 box(5.85,4.25,.08,green,0,3.65,-2.34);
 label('MAKE ROOM FOR A LITTLE JOY.',4.5,.38,0,5.22,-2.28,'#f5e9d6','#527d75',42);
 for(let i=-2;i<=2;i++){const ring=mesh(new THREE.TorusGeometry(.18,.017,8,32),gold,i*1.1,4.5,-2.25);ring.castShadow=false;}
 const glass=mat('#c5efec',{transparent:true,opacity:.09,roughness:.08,metalness:.1,depthWrite:false,side:THREE.DoubleSide});
 for(const x of [-2.91,2.91]){const pane=mesh(new THREE.PlaneGeometry(4.42,4.12),glass,x,3.72,0);pane.rotation.y=Math.PI/2;pane.castShadow=false;}
 // Subtle pane reflections keep the toys legible through the front glass.
 const glint=mat('#e0fff5',{transparent:true,opacity:.22,depthWrite:false});
 const stripe=box(.026,3.7,.018,glint,2.66,3.65,2.34);stripe.rotation.z=-.07;stripe.castShadow=false;
 box(1.65,.8,.1,dark,-1.83,.65,2.45);box(1.78,.1,.17,gold,-1.83,1.08,2.48);
 label('PRIZE OUT',1.18,.2,-1.83,.68,2.515,'#f0d8a8','#223e43',62);
 box(2.15,.26,.75,cream,1.55,1.2,2.66);
 mesh(new THREE.CylinderGeometry(.17,.21,.12,32),gold,2.12,1.39,2.68);
 oval(pink,2.12,1.46,2.68,.16,.08,.16);
 mesh(new THREE.CylinderGeometry(.055,.055,.3,16),steel,1.13,1.47,2.68);
 oval(dark,1.13,1.67,2.68,.14,.14,.14);
 label('NO COINS. JUST COMPANY.',2.5,.22,.6,.65,2.415,'#e5d2a9','#527d75',44);

 // Folded cabinet panels, service fittings and a stitched cushion edge.
 const rubber=mat('#243734',{roughness:.94}),satin=mat('#a0b9b4',{metalness:.65,roughness:.36});
 for(const x of [-2.83,2.83]){
  box(.026,.91,.022,gold,x,.64,2.42);
  for(const z of [-2.17,2.17]){mesh(new THREE.CylinderGeometry(.12,.15,.2,24),rubber,x,.03,z);oval(steel,x,1.23,z,.036,.026,.036);}
 }
 for(let i=0;i<14;i++)box(.22,.028,.025,dark,.65+(i%7)*.24,.29+Math.floor(i/7)*.075,2.416);
 const lock=mesh(new THREE.CylinderGeometry(.065,.065,.035,24),gold,2.72,.63,2.43);lock.rotation.x=Math.PI/2;box(.012,.06,.012,dark,2.72,.63,2.455);
 for(const x of [-2.81,2.81])for(const y of [1.8,5.48]){
  box(.11,.2,.065,satin,x,y,2.34);oval(steel,x,y,2.38,.025,.025,.015);
 }
 // Clear front pane, polished edges, and a faint studio window reflection.
 const frontGlass=mesh(new THREE.PlaneGeometry(5.64,4.07),glass,0,3.72,2.31);frontGlass.castShadow=false;frontGlass.receiveShadow=false;
 const reflectCanvas=document.createElement('canvas');reflectCanvas.width=256;reflectCanvas.height=512;
 const rc=reflectCanvas.getContext('2d'),rg=rc.createLinearGradient(0,0,256,190);
 rg.addColorStop(0,'rgba(232,255,250,0)');rg.addColorStop(.35,'rgba(232,255,250,0)');rg.addColorStop(.42,'rgba(232,255,250,.10)');rg.addColorStop(.62,'rgba(232,255,250,.025)');rg.addColorStop(.7,'rgba(232,255,250,0)');
 rc.fillStyle=rg;rc.fillRect(0,0,256,512);
 const reflectTexture=new THREE.CanvasTexture(reflectCanvas);textures.add(reflectTexture);
 const reflectMat=new THREE.MeshBasicMaterial({map:reflectTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide});mats.add(reflectMat);
 const reflection=mesh(new THREE.PlaneGeometry(5.64,4.06),reflectMat,0,3.72,2.32);reflection.castShadow=false;
 for(const x of [-2.82,2.82])box(.012,4.08,.015,glint,x,3.72,2.32);
 box(5.62,.018,.018,glint,0,1.685,2.32);
 // Warm diffusers under the canopy and softly rounded cushion piping.
 const lamp=mat('#fff0cd',{emissive:'#ffdfab',emissiveIntensity:2.4,roughness:.4});
 for(const x of [-2.55,2.55]){roof.push(box(.09,.045,3.9,lamp,x,5.855,0));box(.025,3.75,.025,gold,x>0?2.87:-2.87,3.75,-2.26);}
 tube([[-2.9,1.5,2.18],[0,1.5,2.18],[2.9,1.5,2.18]],.026,white);
 for(let i=-27;i<=27;i++)box(.028,.005,.013,white,i*.1,1.523,2.16);
 // Actual receiving chute on the left of the toy bed.
 const chute=CLAW.chute,layout=chuteLayout();
 box(chute.half*2,.035,chute.half*2,dark,chute.x,-.18,chute.z);
 layout.guards.forEach(([x,y,z,w,h,d])=>{const panel=box(w,h,d,glass,x,y,z);panel.castShadow=false;box(w,.035,d,gold,x,y+h/2,z);});
 layout.shaft.forEach(([x,y,z,w,h,d])=>box(w,h,d,dark,x,y,z));
 layout.ramps.forEach(r=>{const [x,y,z,w,h,d]=r.box,o=box(w,h,d,gold,x,y,z);o.rotation.set(...r.rotation);});
 // Rails and a three-finger steel claw.
 for(const x of [-2.6,2.6])box(.09,.1,4.3,steel,x,5.66,0);
 const carriage=new THREE.Group();scene.add(carriage);
 box(5.35,.13,.15,steel,0,5.65,0,carriage);
 const trolley=new THREE.Group();scene.add(trolley);box(.65,.22,.53,green,0,5.52,0,trolley);
 const claw=new THREE.Group();scene.add(claw);
 mesh(new THREE.CylinderGeometry(.23,.3,.29,32),steel,0,0,0,claw);oval(green,0,.18,0,.25,.13,.25,claw);
 const cable=mesh(new THREE.CylinderGeometry(.026,.026,1,12),dark);
 const fingers=[];
 for(let i=0;i<3;i++){
  const pivot=new THREE.Group();pivot.rotation.y=i*Math.PI*2/3;claw.add(pivot);
  const finger=new THREE.Group();pivot.add(finger);
  tube([[.18,-.07,0],[.43,-.38,0],[.48,-.72,0],[.29,-.89,0]],.042,steel,finger);
  oval(dark,.29,-.89,0,.068,.07,.07,finger);fingers.push(finger);
 }

 // Wheel bogies, lead screw, motor, joint pins and rubber gripping pads.
 for(const x of [-2.6,2.6]){
  box(.3,.27,.43,green,x,5.64,0,carriage);
  for(const z of [-.16,.16]){const wheel=mesh(new THREE.CylinderGeometry(.12,.12,.08,24),rubber,x,5.72,z,carriage);wheel.rotation.z=Math.PI/2;oval(gold,x+.05,5.72,z,.026,.055,.055,carriage);}
 }
 const screw=mesh(new THREE.CylinderGeometry(.042,.042,5.2,20),steel,0,5.72,.15,carriage);screw.rotation.z=Math.PI/2;
 for(let i=0;i<40;i++){const groove=mesh(new THREE.TorusGeometry(.047,.009,5,12),dark,-2.5+i*.128,5.72,.15,carriage);groove.rotation.y=Math.PI/2;}
 box(.8,.08,.67,steel,0,5.65,0,trolley);box(.32,.34,.3,dark,0,5.38,-.16,trolley);
 for(const x of [-.25,.25])for(const z of [-.19,.19])oval(gold,x,5.7,z,.028,.018,.028,trolley);
 for(let i=0;i<3;i++){
  const a=i*Math.PI*2/3;
  const pin=mesh(new THREE.CylinderGeometry(.085,.085,.16,20),gold,Math.cos(a)*.225,-.075,-Math.sin(a)*.225,claw);pin.rotation.x=Math.PI/2;pin.rotation.z=a;
  const finger=fingers[i];for(let j=0;j<4;j++){const pad=box(.085,.015,.115,rubber,.29,-.82-j*.023,0,finger);pad.rotation.z=-.2;}
 }
 const coilPoints=[];for(let i=0;i<=180;i++){const a=i/180*Math.PI*24;coilPoints.push(new THREE.Vector3(Math.cos(a)*.047,i/180-.5,Math.sin(a)*.047));}
 const coil=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPoints),200,.009,5,false),rubber);
 const ring=mesh(new THREE.RingGeometry(.39,.425,64),mat('#fce0a0',{emissive:'#edbc68',emissiveIntensity:.7,side:THREE.DoubleSide}),0,1.565,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
 const cross=[];
 for(const a of [0,Math.PI/2]){const o=box(.21,.009,.018,gold,0,1.57,0);o.rotation.y=a;cross.push(o);}
 
 const kinds=[
  {name:t('딸기 토끼','Berry bunny'),color:'#dd9bb1',type:'bunny'},
  {name:t('버터 곰','Butter bear'),color:'#d4ad6f',type:'bear'},
  {name:t('민트 고양이','Mint kitten'),color:'#8fbead',type:'cat'},
  {name:t('라일락 곰','Lilac bear'),color:'#a798cd',type:'bear'},
  {name:t('우유 토끼','Milk bunny'),color:'#e2d8c5',type:'bunny'},
  {name:t('구름 펭귄','Cloud penguin'),color:'#83acc5',type:'penguin'},
  {name:t('레몬 별 쿠션','Lemon star'),color:'#e4c574',type:'star'},
  {name:t('졸린 물범','Sleepy seal'),color:'#b6c3cd',type:'seal'},
  {name:t('복숭아 문어','Peach octopus'),color:'#dca2a1',type:'octopus'}
 ];
 const atelier=createPlushAtelier({finish,geos,mats,textures}),plushes=[];
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const shadowContext=shadowCanvas.getContext('2d'),shadowGradient=shadowContext.createRadialGradient(64,64,6,64,64,64);
 shadowGradient.addColorStop(0,'rgba(63,35,37,.55)');shadowGradient.addColorStop(.45,'rgba(63,35,37,.24)');shadowGradient.addColorStop(1,'rgba(63,35,37,0)');
 shadowContext.fillStyle=shadowGradient;shadowContext.fillRect(0,0,128,128);
 const shadowTexture=new THREE.CanvasTexture(shadowCanvas);textures.add(shadowTexture);
 function makePlush(kind,s,x,z,rotation){
  const g=new THREE.Group(),art=atelier.make(kinds[kind].type,kinds[kind].color,plushes.length);batchPlushParts(art.group);g.add(art.group);scene.add(g);
  g.scale.setScalar(s);g.position.set(x,1.57,z);g.rotation.y=rotation;
  const sm=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.75});mats.add(sm);
  const shadow=mesh(new THREE.PlaneGeometry(1.35,1.2),sm,x,1.555,z);shadow.rotation.x=-Math.PI/2;shadow.scale.setScalar(s);shadow.castShadow=false;shadow.receiveShadow=false;
  plushes.push({g,art,shadow,kind,s,x,z,y:1.57,rotation,caught:false,compression:0,compressionAxis:new THREE.Vector3(0,1,0),sway:0,swayVelocity:0,bounce:0});
 }
 const inventory=plushInventory();inventory.forEach(p=>makePlush(p.kind,p.s,0,0,0));
 const simulation=new ClawPhysics(inventory.map((p,i)=>({...p,type:kinds[p.kind].type,wallBounds:plushes[i].art.wallBounds})),{seed:Math.floor(Math.random()*1000000)});
 plushes.forEach((p,i)=>p.physics=simulation.toys[i]);
 const fingerVisuals=fingers.map(f=>{const g=new THREE.Group();f.parent.remove(f);f.position.set(-.18,.07,0);g.add(f);scene.add(g);return g;});
 let phase=simulation.phase,tries=0,score=0,disposed=false,frame,last=performance.now(),heldKey=null,best=0,attemptResult='',resultTimer=null;
 const pan=createTablePan(camera,canvas),pointers=new Map();
 let azimuth=Math.atan2(6.5,14.8),elevation=Math.atan2(6.1,Math.hypot(6.5,14.8)),distance=Math.hypot(6.5,6.1,14.8),targetY=3.05,gesture=null,aimed=false;
 const aim={x:0,z:0},reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 try{best=Math.max(0,Math.min(3,Number(localStorage.getItem('worflogy-plush-physics-best'))||0));}catch{}
 function refresh(){
  root.dataset.phase=phase;root.dataset.caught=score;root.dataset.attempt=tries;
  progress.textContent=t('친구 ','FRIENDS ')+score+'/3 · '+t('시도 ','TRIES ')+tries+'/5 · '+t('최고 ','BEST ')+best;

 }
 function guide(){syncGuide(status,clawGuide({phase,tries,score,holding:simulation.holding},t,{mode:[...pointers.values()].some(p=>p.moved),aimed,result:attemptResult}));}
 function readyText(){guide();}
 function setAim(x,z){if(phase!=='ready')return;simulation.setAim(x,z);aim.x=simulation.aim.x;aim.z=simulation.aim.z;aimed=true;guide();}
 function grabToy(){if(simulation.start()){heldKey=null;phase=simulation.phase;tries=simulation.tries;attemptResult='';refresh();guide();}}

 function touchPair(){const a=[...pointers.values()];if(a.length<2)return null;const [p,q]=a;return{x:(p.x+q.x)/2,y:(p.y+q.y)/2,d:Math.max(1,Math.hypot(p.x-q.x,p.y-q.y)),angle:Math.atan2(q.y-p.y,q.x-p.x)};}
 function zoom(factor){distance=THREE.MathUtils.clamp(distance*factor,7,32);view();}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
  if(![0,2].includes(e.button)||pointers.size>=2)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,button:e.button});
  if(pointers.size>1){pointers.forEach(p=>p.moved=true);gesture=touchPair();}
  canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});
 };
 canvas.onpointermove=e=>{
  const p=pointers.get(e.pointerId);if(!p)return;
  const oldX=p.x,oldY=p.y;p.x=e.clientX;p.y=e.clientY;
  if(pointers.size===2){
   const next=touchPair();
   if(gesture){distance=THREE.MathUtils.clamp(distance*gesture.d/next.d,7,32);azimuth-=Math.atan2(Math.sin(next.angle-gesture.angle),Math.cos(next.angle-gesture.angle));pan.move(gesture.x,gesture.y,next.x,next.y);view();}
   gesture=next;return;
  }
  if(!p.moved&&Math.hypot(p.x-p.startX,p.y-p.startY)<6)return;
  const fromX=p.moved?oldX:p.startX,fromY=p.moved?oldY:p.startY;p.moved=true;
  if(p.button===2){azimuth-=(p.x-fromX)*.007;elevation=THREE.MathUtils.clamp(elevation+(p.y-fromY)*.005,.12,1.45);}
  else pan.move(fromX,fromY,p.x,p.y);
  view();
 };
 function releasePointer(e,cancelled=false){
  const p=pointers.get(e.pointerId);if(!p)return;

  pointers.delete(e.pointerId);gesture=null;
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 }
 canvas.onpointerup=e=>releasePointer(e);
 canvas.onpointercancel=canvas.onlostpointercapture=e=>releasePointer(e,true);
 const wheel=e=>{e.preventDefault();zoom(Math.exp(THREE.MathUtils.clamp(e.deltaY,-500,500)*.001));};
 canvas.addEventListener('wheel',wheel,{passive:false});
 const move=(direction,delta=.075)=>{setAim(aim.x+(direction==='left'?-delta:direction==='right'?delta:0),aim.z+(direction==='up'?-delta:direction==='down'?delta:0));};
 canvas.onkeydown=e=>{if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1.12:1/1.12);return;}if(pointers.size)return;if(['q','e'].includes(e.key.toLowerCase())){e.preventDefault();simulation.twist(e.key.toLowerCase()==='q'?-.2:.2);return;}const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(d){e.preventDefault();move(d);}if(e.code==='Space'){e.preventDefault();if(!e.repeat)grabToy();}};
 function view(){
  const d=distance*Math.max(1,.92/camera.aspect);
  roof.forEach(o=>o.visible=elevation<.85);
  camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,targetY+Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d).add(pan.offset);
  camera.lookAt(pan.offset.x,targetY,pan.offset.z);camera.updateMatrixWorld();
  root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='top'?elevation>1:Math.abs(azimuth-Math.atan2(6.5,14.8))<.001&&Math.abs(elevation-Math.atan2(6.1,Math.hypot(6.5,14.8)))<.001)));
 }
 root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{
  const top=b.dataset.view==='top';pan.reset();
  azimuth=top?0:Math.atan2(6.5,14.8);elevation=top?Math.atan2(12,6.5):Math.atan2(6.1,Math.hypot(6.5,14.8));distance=top?Math.hypot(12,6.5):Math.hypot(6.5,6.1,14.8);targetY=top?1.7:3.05;view();
 });
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{
  const action=b.dataset.camera;if(action==='in')zoom(1/1.15);if(action==='out')zoom(1.15);
  if(action==='left')azimuth-=.2;if(action==='right')azimuth+=.2;view();
 });
 root.querySelectorAll('[data-view],[data-camera]').forEach(b=>b.addEventListener('click',()=>canvas.focus({preventScroll:true})));
 function resize(){const r=canvas.parentElement.getBoundingClientRect();resizeArcadeRenderer(renderer,r.width,r.height);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function refill(reset=true){
  clearTimeout(resultTimer);resultTimer=null;result.classList.remove('show');
  if(reset)simulation.reset();
  plushes.forEach((p,i)=>{p.physics=simulation.toys[i];p.g.visible=true;p.shadow.visible=true;p.compression=0;});
  phase=simulation.phase;tries=score=0;attemptResult='';aimed=false;heldKey=null;aim.x=aim.z=0;collection.replaceChildren();refresh();guide();canvas.focus({preventScroll:true});
 }

 const offset=new THREE.Vector3(),cableStart=new THREE.Vector3(),cableEnd=new THREE.Vector3(),cableDirection=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 function tick(now){
  if(disposed)return;const dt=Math.min((now-last)/1000,.05);last=now;
  if(document.hidden){heldKey=null;frame=requestAnimationFrame(tick);return;}
  if(heldKey&&phase==='ready')move(heldKey,dt*1.7);
  simulation.update(dt);
  const changed=phase!==simulation.phase||score!==simulation.score;
  if(phase!==simulation.phase&&simulation.phase==='ready'){aimed=false;aim.x=aim.z=0;}
  phase=simulation.phase;tries=simulation.tries;score=simulation.score;attemptResult=simulation.result;
  if(score>best){best=score;try{localStorage.setItem('worflogy-plush-physics-best',String(best));}catch{}}
  for(const toy of simulation.collected.splice(0)){
   const badge=document.createElement('span');badge.style.setProperty('--plush-color',kinds[toy.kind].color);
   badge.textContent=kinds[toy.kind].name+' · '+(toy.s<.8?'S':toy.s<1.1?'M':'L');collection.append(badge);
  }
  if(changed){
   refresh();
   if((phase==='done'||phase==='fail')&&resultTimer===null){
    result.textContent=phase==='done'?'FRIENDS FOUND!':'TRY AGAIN';result.classList.add('show');
    resultTimer=setTimeout(()=>{resultTimer=null;if(disposed)return;if(phase==='done')onWin?.();else refill();},3000);
   }
  }
  claw.position.copy(simulation.palm.position);claw.quaternion.copy(simulation.palm.quaternion);
  fingerVisuals.forEach((g,i)=>{g.position.copy(simulation.fingers[i].body.position);g.quaternion.copy(simulation.fingers[i].body.quaternion);});
  carriage.position.z=simulation.command.z;trolley.position.set(simulation.command.x,0,simulation.command.z);
  cableStart.set(simulation.command.x,5.4,simulation.command.z);
  cableEnd.set(0,.2,0).applyQuaternion(claw.quaternion).add(claw.position);
  cableDirection.copy(cableStart).sub(cableEnd);
  cable.position.copy(cableStart).add(cableEnd).multiplyScalar(.5);cable.scale.y=Math.max(.01,cableDirection.length());cable.quaternion.setFromUnitVectors(up,cableDirection.normalize());
  coil.position.copy(cable.position);coil.quaternion.copy(cable.quaternion);coil.scale.y=cable.scale.y;
  for(const p of plushes){
   const toy=p.physics,body=toy.body;p.caught=toy.caught;p.g.visible=!toy.caught;
   p.g.quaternion.copy(body.quaternion);offset.set(0,toy.center*p.s,0).applyQuaternion(p.g.quaternion);
   p.g.position.copy(body.position).sub(offset);
   // Cosmetic cloth compression follows real contact; it never moves the body.
   p.compression=THREE.MathUtils.damp(p.compression,Math.min(.06,toy.pressure*.0025),12,dt);
   offset.copy(toy.compressionAxis);
   if(offset.dot(p.compressionAxis)<0)offset.negate();
   p.compressionAxis.lerp(offset,1-Math.exp(-dt*10)).normalize();
   const n=p.compressionAxis,a=1+p.compression*.3,b=-p.compression*1.3,cy=toy.center;
   // Bounded visual cloth give follows contact forces without changing the collider.
   p.art.group.matrixAutoUpdate=false;
   p.art.group.matrix.set(a+b*n.x*n.x,b*n.x*n.y,b*n.x*n.z,-b*n.x*n.y*cy,
    b*n.y*n.x,a+b*n.y*n.y,b*n.y*n.z,(1-a-b*n.y*n.y)*cy,
    b*n.z*n.x,b*n.z*n.y,a+b*n.z*n.z,-b*n.z*n.y*cy,0,0,0,1);
   p.art.group.matrixWorldNeedsUpdate=true;
   // Stuffed appendages follow the rigid body. Contact jitter must not drive
   // a second, unphysical ear/head/limb animation during filling or settling.
   p.art.headRig.rotation.z=p.art.headRest;
   p.art.limbs.forEach(l=>l.group.rotation.z=l.rest);
   p.art.ears.forEach(e=>e.group.rotation.z=e.rest);
   const height=Math.max(0,body.position.y-toy.center*p.s-CLAW.bed);
   p.shadow.visible=!toy.caught;p.shadow.position.set(body.position.x,1.535,body.position.z);p.shadow.material.opacity=.65/(1+height*3);p.shadow.scale.setScalar(p.s*(1+height*.18));
  }
  const markY=simulation.surface(simulation.aim.x,simulation.aim.z)+.035;
  ring.position.set(simulation.aim.x,markY,simulation.aim.z);ring.visible=phase==='ready';
  cross.forEach(o=>{o.position.set(simulation.aim.x,markY+.005,simulation.aim.z);o.visible=ring.visible;});
  guide();renderer.render(scene,camera);frame=requestAnimationFrame(tick);
 }
 refill(false);resize();frame=requestAnimationFrame(tick);
 return{dispose(){if(disposed)return;disposed=true;clearTimeout(resultTimer);cancelAnimationFrame(frame);ro.disconnect();simulation.dispose();heldKey=null;pointers.clear();canvas.removeEventListener('wheel',wheel);scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();});finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();}};
}

