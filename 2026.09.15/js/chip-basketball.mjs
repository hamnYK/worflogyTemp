import {basketballGuide,basketballResult,syncGuide} from './game-guides.mjs';
import * as THREE from '../lib/three.module.min.js';
import {createTablePan} from './table-pan.mjs';
import {createArcadeFinish} from './arcade-finish.mjs';
import {ChipBasketball,BASKET} from './chip-basketball-rules.mjs';

export function mountBasketball(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new ChipBasketball();
 host.innerHTML=`<div class="chip-game basketball-game"><div class="chip-game-heading"><button type="button" class="wf-button chip-back">${t('게임 선택','Games')}</button><h2>1 CHIP BASKETBALL</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('칩 농구. 마우스로 집게 이동, 클릭으로 잡기. 방향키로 이동, 잡은 뒤 위아래 키로 슛 높이 조절. 왼쪽 드래그 후 놓으면 슛.','Chip basketball. Move the grippers with the pointer or arrow keys. Click to catch. Once held, up/down changes elevation; left-drag and release shoots.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="basket-catch-meter" aria-hidden="true"><span></span></div><div class="chip-camera"><button type="button" data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button type="button" data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button type="button" data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button type="button" data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button type="button" data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><button type="button" class="wf-button basket-action"></button><label>${t('던질 방향','Toss direction')} <input class="basket-aim" type="range" min="-180" max="180" step="1" value="-30" aria-label="${t('좌우 조준','Horizontal aim')}"></label><label>${t('힘','Power')} <input class="chip-power" type="range" min="4" max="14" step=".1" value="8" aria-label="${t('발사 강도','Launch power')}"></label><label>${t('높이','Elevation')} <input class="basket-loft basket-aim" type="range" min="40" max="80" step="1" value="65"></label></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.querySelector('.chip-game'),canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),action=root.querySelector('.basket-action'),aim=root.querySelector('.basket-aim'),power=root.querySelector('.chip-power'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result'),meter=root.querySelector('.basket-catch-meter'),needle=meter.firstElementChild;
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start the 3D table.')+'</p><button type="button" class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#142130');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);let azimuth=.48,elevation=.68,distance=14,disposed=false,frame,timer,last=performance.now(),acc=0,pointer=null,phase='',lastCatchable=false;
 const geos=new Set(),mats=new Set(),textures=new Set();
 function material(color,roughness=.45,metalness=0){const m=new THREE.MeshStandardMaterial({color,roughness,metalness});mats.add(m);return m;}
 function mesh(g,m,x=0,y=0,z=0,parent=scene){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function line(points,color){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));geos.add(g);const m=new THREE.LineBasicMaterial({color,transparent:true,opacity:.7});mats.add(m);const o=new THREE.Line(g,m);scene.add(o);return o;}
 scene.add(new THREE.HemisphereLight(0xd7efff,0x292c35,2.1));
 const sun=new THREE.DirectionalLight(0xffe7c2,3.2);sun.position.set(-5,13,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:10,bottom:-10,near:.5,far:35});sun.shadow.normalBias=.02;scene.add(sun);
 const light=new THREE.DirectionalLight(0x83cfff,1.8);light.position.set(7,6,-6);scene.add(light);
 const finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 finish.plinth(16.5,16.5,-.65,'#558eb4');
 const wood=material('#a76e40',.48),trim=material('#293441',.35,.6),gold=material('#c3a464',.27,.7),white=material('#f7f3df'),orange=material('#ee673c',.32,.2),blue=material('#3f75ae',.3,.18);
 box(16.5,.65,16.5,trim,0,-.4,0);box(16.2,.1,16.2,gold,0,-.045,0);
 const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');
 ctx.fillStyle='#bc9567';ctx.fillRect(0,0,1024,1024);let seed=91;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let x=0;x<1024;x+=32){ctx.fillStyle=x%64?'#b88856':'#c29c6e';ctx.fillRect(x,0,32,1024);ctx.strokeStyle='#785c3b40';for(let j=0;j<20;j++){const xx=x+rand()*32;ctx.beginPath();ctx.moveTo(xx,0);ctx.bezierCurveTo(xx+4,350,xx-3,700,xx,1024);ctx.stroke();}for(let y=(x/32%3)*85;y<1024;y+=256){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+32,y);ctx.stroke();}}
 // Blue rear zone starts behind the physical backboard, z < -0.9.
 ctx.fillStyle='#183c6860';ctx.fillRect(0,0,1024,(8+BASKET.backboardZ)*64);
 ctx.strokeStyle='#fff0d6';ctx.lineWidth=3;ctx.strokeRect(12,12,1000,1000);
 for(const r of [2, BASKET.threeRadius]){ctx.beginPath();ctx.arc(512,512,r*64,0,Math.PI*2);ctx.stroke();}
 ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(12,(8+BASKET.backboardZ)*64);ctx.lineTo(1012,(8+BASKET.backboardZ)*64);ctx.stroke();ctx.setLineDash([]);
 ctx.textAlign='center';ctx.fillStyle='#fff0d6';ctx.font='bold 30px Arial';
 for(const [z,label] of [[3,'2 PTS'],[6,'3 PTS'],[-3,'4 PTS'],[-6,'6 PTS']])ctx.fillText(label,512,(z+8)*64);
 ctx.font='bold 18px Arial';ctx.fillText('WORFLOGY / AFTER HOURS',512,970);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(tex);const floor=finish.material({color:'#ffffff',roughness:.32,clearcoat:.75,clearcoatRoughness:.25});floor.map=tex;floor.bumpMap=finish.grain('wood');floor.bumpScale=.009;const board=mesh(new THREE.PlaneGeometry(16,16),floor,0,.012,0);board.rotation.x=-Math.PI/2;board.castShadow=false;
 for(const sign of [-1,1]){box(.13,.3,16.4,trim,sign*8.13,.08,0);box(16.4,.3,.13,trim,0,.08,sign*8.13);}
 const ground=mesh(new THREE.PlaneGeometry(100,100),material('#192736',.95),0,-.85,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 box(.16,4.5,.16,trim,0,2.25,-1.45);box(.13,.13,.65,trim,0,3.6,-1.15);
 const glass=new THREE.MeshPhysicalMaterial({color:0xc6e7f0,transparent:true,opacity:.28,roughness:.09,metalness:.25,clearcoat:1,side:THREE.DoubleSide});mats.add(glass);
 box(3.5,2.35,.08,glass,0,3.75,-0.9);
 for(const x of [-1.78,1.78])box(.07,2.42,.08,white,x,3.75,-0.9);
 for(const y of [2.54,4.96])box(3.6,.07,.08,white,0,y,-0.9);
 line([[-.6,3,-0.84],[-.6,3.8,-0.84],[.6,3.8,-0.84],[.6,3,-0.84]],0xffffff);
 box(.2,.13,.8,orange,0,3,-0.45);
 const rim=mesh(new THREE.TorusGeometry(.8,.055,16,96),orange,0,3,0);rim.rotation.x=Math.PI/2;
 // Padded support, bolted glass mount and woven rope net.
 box(.46,2.05,.4,blue,0,1.04,-1.45);
 box(.55,.35,.12,trim,0,3.04,-0.78);
 for(const x of [-1.6,1.6])for(const y of [2.72,4.78]){const bolt=mesh(new THREE.SphereGeometry(.045,12,8),gold,x,y,-0.82);bolt.scale.z=.4;}
 const netMaterial=material('#f1ead7',.87);
 for(let i=0;i<16;i++)for(const twist of [-1,1]){
 const points=[];for(let j=0;j<=5;j++){const a=i*Math.PI/8+twist*j*Math.PI/16,r=.8-j*.071;points.push(new THREE.Vector3(Math.cos(a)*r,2.97-j*.18,Math.sin(a)*r));}
 mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.012,5,false),netMaterial);
 }
  const chip=new THREE.Group(),spinGroup=new THREE.Group();scene.add(chip);chip.add(spinGroup);
 finish.chip(spinGroup,.3,1,'#3f75ae');
 spinGroup.rotation.x=Math.PI/2;
 // Twin mechanical grippers: anodized housings, steel pistons and rubber jaws.
 const grippers=new THREE.Group();scene.add(grippers);
 const housing=finish.material({color:'#304858',metalness:.7,roughness:.28,clearcoat:.4});
 const steel=finish.material({color:'#becbd1',metalness:.9,roughness:.2});
 const rubber=material('#19262c',.9),indicator=finish.material({color:'#80daca',emissive:'#52bba9',emissiveIntensity:.8,roughness:.35});
 const jaws=[];
 for(const sign of [-1,1]){
 const assembly=new THREE.Group();grippers.add(assembly);jaws.push({assembly,sign});
 box(.36,.32,.66,housing,sign*.65,0,.12,assembly);
 box(.14,.4,.76,steel,sign*.85,-.03,.12,assembly);
 const piston=mesh(new THREE.CylinderGeometry(.065,.065,.4,24),steel,sign*.38,0,0,assembly);piston.rotation.z=Math.PI/2;
 box(.11,.35,.36,housing,sign*.19,0,0,assembly);
 box(.065,.26,.24,rubber,sign*.12,0,0,assembly);
 for(const z of [-.08,.08])box(.012,.21,.014,steel,sign*.081,0,z,assembly);
 for(const z of [-.12,.34]){const bolt=mesh(new THREE.CylinderGeometry(.035,.035,.015,16),steel,sign*.65,.169,z,assembly);}
 box(.15,.012,.045,indicator,sign*.65,.17,.12,assembly);
 // A compact rear carriage gives the release a visible spring stroke.
 box(.12,.13,.48,steel,sign*.62,-.23,.3,assembly);
 }
 let gripClosure=0,cock=0,releaseCock=0,gripperActive=false;
 const trajectoryMat=new THREE.LineDashedMaterial({color:0xffe9a8,dashSize:.18,gapSize:.13});mats.add(trajectoryMat);
 const trajectoryGeo=new THREE.BufferGeometry();geos.add(trajectoryGeo);const trajectory=new THREE.Line(trajectoryGeo,trajectoryMat);scene.add(trajectory);
 const pan=createTablePan(camera,canvas);
 function resetCourtPosition(){pan.offset.set(Math.sin(.48)*3.2,0,Math.cos(.48)*3.2);}
 resetCourtPosition();
 function view(){const d=distance*Math.max(1,1.05/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,1+Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d);camera.position.add(pan.offset);camera.lookAt(pan.offset.x,1,pan.offset.z);camera.updateMatrixWorld();}
 function resize(){const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function say(text){status.textContent=text;}
 let best=0;try{const saved=Number(localStorage.getItem('worflogy-basketball-best'));if(Number.isFinite(saved))best=Math.max(0,Math.min(BASKET.maxScore,saved));}catch{}
 const loft=root.querySelector('.basket-loft'),keys=new Set();
 function refresh(){
 root.dataset.phase=game.phase;root.dataset.attempt=game.attempt;root.dataset.total=game.total;
 const labels={ready:t('칩 던지기','Toss chip'),spinning:t('그리퍼로 잡기','Catch'),held:t('슛','Shoot'),flying:t('슈팅 중','In flight'),'attempt-end':t('다음 시도','Next attempt'),results:t('결과','Results')};
 action.textContent=labels[game.phase];action.disabled=['flying','attempt-end','results'].includes(game.phase);
 aim.disabled=true;aim.parentElement.hidden=true;power.disabled=!['ready','held'].includes(game.phase);loft.disabled=game.phase!=='held';
 progress.textContent=game.attempt+'/'+BASKET.attempts+' · '+game.total+t('점',' PTS')+(game.phase==='held'?' · '+game.shotPoints+t('점 슛','-POINT SHOT'):'');
 meter.hidden=game.phase!=='spinning';
 }
 function act(){
 if(game.phase==='ready'){gripperActive=false;game.setGrip(7.7,7.7);game.spin(+power.value);say(t('마우스로 집게를 칩에 맞추고 클릭하세요. 회전이 멈추면 실패입니다.','Move the grippers onto the chip and click before it stops spinning.'));}
 else if(game.phase==='spinning'){if(!gripperActive){say(t('마우스를 코트로 옮겨 집게를 진입시키세요.','Move the pointer onto the court to bring in the grippers.'));return;}if(game.catch()){aim.value=0;power.value=9;loft.value=65;say(game.shotPoints+t('점 구역! ↑·↓로 높이 조절 · 왼쪽 드래그로 힘 조절 · 놓으면 슛.','-point zone! Up/down arrows for elevation, left-drag for power, release to shoot.'));}}
 else if(game.phase==='held'){releaseCock=cock;game.launch(+power.value,0,+loft.value);say(t('슛!','Shot!'));}
 refresh();
 }
 action.onclick=act;root.querySelector('.chip-back').onclick=onExit;
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.6);
 function world(e,height=.6){const r=canvas.getBoundingClientRect();plane.constant=-height;ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3());}
 function track(e){if(game.bounces===0)return;gripperActive=true;const p=world(e,Math.min(1.5,Math.max(.6,game.p.y)));if(p)game.setGrip(p.x,p.z);}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
 if(pointer)return;canvas.focus({preventScroll:true});
 if(game.phase==='spinning'&&e.button===0&&!e.shiftKey){track(e);if(e.pointerType==='touch'){pointer={id:e.pointerId,mode:'track',x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}else act();return;}
 const p=world(e),onChip=p&&Math.hypot(p.x-game.p.x,p.z-game.p.z)<.85;
 if(e.button===0&&onChip&&game.phase==='ready'){pointer={id:e.pointerId,mode:'toss',x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);return;}
 pointer={id:e.pointerId,mode:e.button===0&&onChip&&game.phase==='held'?'aim':e.button===2?'orbit':'pan',x:e.clientX,y:e.clientY};
 canvas.setPointerCapture(e.pointerId);
 };
 canvas.onpointermove=e=>{
 if(game.phase==='spinning'&&(!pointer||pointer.mode==='track'))track(e);
 if(!pointer||pointer.id!==e.pointerId)return;
 if(pointer.mode==='pan'){pan.move(pointer.x,pointer.y,e.clientX,e.clientY);pointer.x=e.clientX;pointer.y=e.clientY;view();}
 else if(pointer.mode==='orbit'){azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.45,1.05);pointer.x=e.clientX;pointer.y=e.clientY;view();}
 else if(pointer.mode==='toss'){const p=world(e,game.p.y);if(p){const dx=game.p.x-p.x,dz=game.p.z-p.z;power.value=THREE.MathUtils.clamp(Math.hypot(dx,dz)*3,4,14);}}
 else if(pointer.mode==='aim'){const p=world(e);if(p){const dx=game.p.x-p.x,dz=game.p.z-p.z;power.value=THREE.MathUtils.clamp(Math.hypot(dx,dz)*3,4,14);}}
 };
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;const mode=pointer.mode,moved=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);pointer=null;if(mode==='track')act();else if(['aim','toss'].includes(mode)&&moved>8)act();};
 canvas.onpointercancel=()=>pointer=null;
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),8,32);view();},{passive:false});
 canvas.onkeydown=e=>{
 if(game.phase==='held'&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();loft.value=THREE.MathUtils.clamp(+loft.value+(e.key==='ArrowUp'?2:-2),40,80);say(t('슛 높이 ','Shot elevation ')+loft.value+'°');return;}
 if(e.key===' '){e.preventDefault();if(!e.repeat)act();}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);}
 };
 canvas.onkeyup=e=>keys.delete(e.key);canvas.onblur=()=>keys.clear();
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const key=b.dataset.camera;if(key==='in')distance=Math.max(8,distance-2);if(key==='out')distance=Math.min(32,distance+2);if(key==='left')azimuth-=.2;if(key==='right')azimuth+=.2;if(key==='home'){resetCourtPosition();distance=14;elevation=.68;azimuth=.48;}view();});
 function prepareUI(){gripperActive=false;gripClosure=0;cock=0;releaseCock=0;pointer=null;keys.clear();phase='';result.className='chip-result';result.textContent='';aim.value=-30;power.value=8;loft.value=65;status.textContent=t('칩을 당겨 힘을 정하고 놓으세요. 위로 솟은 칩이 바닥에 튄 뒤 집게로 잡으세요.','Pull and release to toss upward. Catch the chip after it bounces off the court.');refresh();}
 function outcomes(){
 if(phase===game.phase)return;phase=game.phase;refresh();
 if(phase==='attempt-end'){
 result.textContent=game.scores[game.scores.length-1]+' PTS';result.className='chip-result show chip-result-perfect';
 say(basketballResult(game,t)+t((game.attempt+1)+'번째 시도를 준비합니다.','Preparing attempt '+(game.attempt+1)+'.'));
 timer=setTimeout(()=>{if(!disposed){game.next();prepareUI();}},1800);
 }
 if(phase==='results'){
 best=Math.max(best,game.total);try{localStorage.setItem('worflogy-basketball-best',String(best));}catch{}
 result.className='chip-result show basket-results';
 result.innerHTML='<strong>'+game.total+' / '+BASKET.maxScore+'</strong><span>'+game.scores.map((score,i)=>t((i+1)+'차',['FIRST','SECOND','THIRD'][i])+' '+score).join(' · ')+'</span><span>'+t('최고 기록 ','BEST ')+best+'</span><small>'+t('3초 후 로비로 돌아갑니다.','Returning to the lobby in 3 seconds.')+'</small>';
 say(basketballResult(game,t)+t('세 번의 도전이 끝났습니다. 합계 ','Three attempts complete. Total ')+game.total+t('점, 최고 기록 ',' points, best ')+best+t('점. 3초 후 로비로 돌아갑니다.',' points. Returning to the lobby in 3 seconds.'));
 timer=setTimeout(()=>{if(!disposed)onWin();},3000);
 }
 }
 function animate(now){
 if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=dt;
 if(game.phase==='spinning'){const dx=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),dz=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);if((dx||dz)&&game.bounces>0){gripperActive=true;game.setGrip(game.grip.x+dx*dt*5,game.grip.z+dz*dt*5);}}
 while(acc>=1/240){game.step(1/240);acc-=1/240;}outcomes();
 syncGuide(status,basketballGuide(game,t,{mode:pointer?.mode,gripperActive,loft:loft.value}));
 chip.position.set(game.p.x,game.p.y,game.p.z);
 if(game.orientation){chip.quaternion.set(game.orientation.x,game.orientation.y,game.orientation.z,game.orientation.w);spinGroup.rotation.set(0,0,0);}
 else{chip.rotation.set(0,0,0);spinGroup.rotation.set(game.phase==='flying'?Math.PI/2+game.time*7:Math.PI/2,0,0);}
 const holding=game.phase==='held',flying=game.phase==='flying',bearing=holding?game.bearing:Math.atan2(-game.grip.x,game.grip.z);
 const blend=1-Math.exp(-dt*18);gripClosure+=((holding?1:0)-gripClosure)*blend;cock+=((holding?.22:0)-cock)*(1-Math.exp(-dt*8));
 const recoil=flying?releaseCock*Math.max(0,1-game.time/.12):cock;
 const gripPos=holding?game.p:game.grip;
 grippers.position.set(gripPos.x-Math.sin(bearing)*recoil,holding?.6:Math.min(1.5,Math.max(.6,game.p.y)),gripPos.z+Math.cos(bearing)*recoil);
 grippers.rotation.y=-bearing;
 for(const {assembly,sign} of jaws)assembly.position.x=sign*(.15+(1-gripClosure)*.38);
 grippers.visible=gripperActive&&['spinning','held','flying'].includes(game.phase);root.dataset.grippers=String(grippers.visible);
 if(holding){chip.position.x-=Math.sin(bearing)*recoil;chip.position.z+=Math.cos(bearing)*recoil;chip.rotation.y=-bearing;}
 const catchable=game.catchable;root.dataset.catchable=String(catchable);meter.hidden=!catchable;needle.style.transform='translateX(0)';meter.classList.toggle('is-ready',catchable);
 if(catchable!==lastCatchable){lastCatchable=catchable;action.classList.toggle('basket-catch-ready',catchable);}
 trajectory.visible=holding||(game.phase==='ready'&&pointer?.mode==='toss');
 if(trajectory.visible&&!holding){const pts=[],v=+power.value;for(let i=0;i<24;i++){const time=i*.04;pts.push(new THREE.Vector3(game.p.x,game.p.y+(3+v*.35)*time-4.905*time*time,game.p.z));}trajectory.geometry.setFromPoints(pts);trajectory.computeLineDistances();}
 if(holding){const pts=[],v=+power.value,el=+loft.value*Math.PI/180;for(let i=0;i<24;i++){const time=i*.04;pts.push(new THREE.Vector3(game.p.x+Math.sin(bearing)*Math.cos(el)*v*time,.6+Math.sin(el)*v*time-4.905*time*time,game.p.z-Math.cos(bearing)*Math.cos(el)*v*time));}trajectory.geometry.setFromPoints(pts);trajectory.computeLineDistances();}
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 prepareUI();resize();frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
