import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {ChipFootball,FIELD} from './chip-football-rules.mjs';

export function mountFootball(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko;
 const game=new ChipFootball();
 host.innerHTML=`<div class="chip-game"><div class="chip-game-heading"><button type="button" class="wf-button chip-back">${t('게임 선택','Games')}</button><h2>3 CHIPS FOOTBALL</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('칩 축구. 1, 2, 3 선택. 좌우 방향키 조준. 스페이스 발사.','Chip football. Select 1, 2, 3. Arrow keys aim. Space launches.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"><button type="button" data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button type="button" data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button type="button" data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button type="button" data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button type="button" data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><div class="chip-picks"></div><label>${t('힘','Power')} <input class="chip-power" aria-label="${t('발사 강도','Launch power')}" type="range" min="2" max="22" step=".5" value="8"></label><button type="button" class="wf-button chip-fire">${t('발사','Launch')}</button></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.querySelector('.chip-game'),canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch(error){root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다. 브라우저의 하드웨어 가속 설정을 확인해 주세요.','Unable to start 3D. Check hardware acceleration in your browser.')+'</p><button class="wf-button" type="button">'+t('게임 선택','Games')+'</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#101d29');scene.fog=new THREE.Fog('#101d29',35,80);
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 let azimuth=.56,elevation=.91,distance=30,angle=-Math.PI/2,disposed=false,frame,timer,acc=0,last=performance.now(),pointer=null,aimPoint=null;
 const raycaster=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.16);
 function view(){camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*distance*Math.max(1,1.2/camera.aspect),Math.sin(elevation)*distance*Math.max(1,1.2/camera.aspect),Math.cos(azimuth)*Math.cos(elevation)*distance*Math.max(1,1.2/camera.aspect));camera.lookAt(0,0,0);camera.updateMatrixWorld();}
 function resize(){const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 scene.add(new THREE.HemisphereLight(0xc8e9ff,0x243321,2));
 const sun=new THREE.DirectionalLight(0xffe7c2,3.5);sun.position.set(-6,15,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:13,bottom:-13,near:.5,far:40});sun.shadow.normalBias=.025;scene.add(sun);
 const rim=new THREE.DirectionalLight(0x81dfff,2);rim.position.set(9,7,-10);scene.add(rim);
 const materials=new Set(),geometries=new Set(),textures=new Set();
 function mat(color,roughness=.5,metalness=0){const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.add(m);return m;}
 function mesh(geometry,material,x=0,y=0,z=0,parent=scene){geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,m,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 const finish=createArcadeFinish(renderer,scene,geometries,materials,textures);
 finish.plinth(11.1,17.1,-.78,'#458f91');
 const walnut=mat('#392d29',.42),rail=mat('#172831',.32,.55),brass=mat('#bd9a52',.26,.75),white=mat('#eef5df',.55);
 box(11.1,.7,17.1,walnut,0,-.5,0);box(10.5,.12,16.5,brass,0,-.11,0);
 // Procedural felt weave and painted football markings.
 const textureCanvas=document.createElement('canvas');textureCanvas.width=640;textureCanvas.height=1024;const ctx=textureCanvas.getContext('2d');
 ctx.fillStyle='#176554';ctx.fillRect(0,0,640,1024);
 for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#1c6c5a':'#196451';ctx.fillRect(0,i*1024/12,640,1024/12);}
 let seed=13;for(let i=0;i<85000;i++){seed=(seed*1664525+1013904223)>>>0;const x=(seed>>>16)%640;seed=(seed*1664525+1013904223)>>>0;ctx.fillStyle=i%2?'#ffffff09':'#0000000c';ctx.fillRect(x,(seed>>>16)%1024,1,1);}
 ctx.strokeStyle='#e5eed0ab';ctx.lineWidth=3;ctx.strokeRect(16,16,608,992);ctx.beginPath();ctx.moveTo(16,512);ctx.lineTo(624,512);ctx.stroke();ctx.beginPath();ctx.arc(320,512,85,0,Math.PI*2);ctx.stroke();ctx.strokeRect(175,16,290,168);ctx.strokeRect(245,16,150,66);ctx.strokeRect(175,840,290,168);ctx.strokeRect(245,942,150,66);
 ctx.fillStyle='#e5eed0';ctx.beginPath();ctx.arc(320,512,4,0,Math.PI*2);ctx.fill();
 const feltTexture=new THREE.CanvasTexture(textureCanvas);feltTexture.colorSpace=THREE.SRGBColorSpace;feltTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(feltTexture);
 const felt=mat('#ffffff',.91);felt.map=feltTexture;felt.bumpMap=finish.grain('felt');felt.bumpScale=.035;
 walnut.bumpMap=finish.grain('wood');walnut.bumpScale=.018;walnut.roughness=.3;
 const turf=mesh(new THREE.PlaneGeometry(10,16),felt,0,.005,0);turf.rotation.x=-Math.PI/2;turf.castShadow=false;
 box(.24,.4,16.5,rail,-5.15,.15,0);box(.24,.4,16.5,rail,5.15,.15,0);box(10.5,.4,.24,rail,0,.15,8.15);
 for(const sign of [-1,1])box(3.8,.4,.24,rail,sign*3.25,.15,-8.15);
 const cushion=mat('#245747',.8);
 for(const sign of [-1,1]){
 box(.055,.17,16,cushion,sign*5.01,.1,0);
 box(.055,.025,16.4,brass,sign*5.15,.365,0);
 for(let z=-7.5;z<=7.5;z+=1.5)mesh(new THREE.CylinderGeometry(.033,.033,.012,12),brass,sign*5.15,.37,z);
 }
 box(10.1,.025,.055,brass,0,.365,8.15);
 // Metal posts and fine netting behind the opening.
 for(const x of [-1.35,1.35])box(.09,1.1,.09,white,x,.55,-8.04);
 box(2.8,.09,.09,white,0,1.08,-8.04);
 const netMat=new THREE.LineBasicMaterial({color:0xc5d9d0,transparent:true,opacity:.48});materials.add(netMat);
 const points=[];for(let x=-1.35;x<=1.36;x+=.18){points.push(x,0,-8.8,x,1.05,-8.8);points.push(x,1.05,-8.8,x,1.05,-8.04);}
 for(let y=0;y<=1.06;y+=.15){points.push(-1.35,y,-8.8,1.35,y,-8.8);for(const x of [-1.35,1.35])points.push(x,y,-8.8,x,y,-8.04);}
 const netGeo=new THREE.BufferGeometry();netGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometries.add(netGeo);scene.add(new THREE.LineSegments(netGeo,netMat));
 const stage=mat('#17232d',.9);const ground=mesh(new THREE.PlaneGeometry(200,200),stage,0,-1,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const chipColors=['#dc6657','#56a8d4','#d6b766'],chipMeshes=[],rings=[];
 for(let i=0;i<3;i++){
 const g=new THREE.Group();scene.add(g);chipMeshes.push(g);
 finish.chip(g,.34,i+1,chipColors[i],.1);
 const ringMat=new THREE.MeshBasicMaterial({color:0xffe39a,transparent:true,opacity:.8,side:THREE.DoubleSide});materials.add(ringMat);const ring=mesh(new THREE.RingGeometry(.4,.43,64),ringMat,0,.025,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;rings.push(ring);
 }
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(),2,0xffe39a,.35,.2);scene.add(arrow);
 let previousPhase='ready',previousResult=null;
 const picks=root.querySelector('.chip-picks');
 for(let i=0;i<3;i++){const b=document.createElement('button');b.type='button';b.className='wf-button';b.dataset.chip=i;b.onclick=()=>choose(i);picks.append(b);}
 function say(s){status.textContent=s;}
 function updateUI(){
 progress.textContent=t('패스 완료 ','PASSES ')+game.chips.filter(c=>c.passed).length+'/3 · '+(game.canShoot?t('슈팅 가능','SHOT UNLOCKED'):t('슈팅 잠김','SHOT LOCKED'));
 [...picks.children].forEach((b,i)=>{b.textContent=(i+1)+(game.chips[i].passed?' ✓':'');b.setAttribute('aria-label',t('칩 ','Chip ')+(i+1)+(game.chips[i].passed?t(' 패스 완료',' passed'):''));b.disabled=game.phase!=='ready'||i===game.previous||(game.selected!==null&&i!==game.selected);b.setAttribute('aria-pressed',String(i===game.selected));});
 root.querySelector('.chip-fire').disabled=game.phase!=='ready'||game.selected===null;
 root.dataset.phase=game.phase;
 }
 function choose(i){if(!game.select(i)){say(t('선택을 바꿀 수 없거나 직전 패스 칩입니다.','Selection is locked, or this chip made the previous pass.'));return;}say(t('칩 ','Chip ')+(i+1)+t(' 선택 고정 · 다른 두 칩 사이로 통과시키세요.',' locked · Pass through the other two chips.'));updateUI();}
 function fire(vx,vz){if(game.launch(vx,vz)){aimPoint=null;say(game.readyAtLaunch?t('슈팅! 두 칩 사이를 통과해 골대로.','Shoot through the gap and into the goal.'):t('패스 중 · 아직 골을 넣으면 FAIL입니다.','Passing · Scoring before unlock is a FAIL.'));updateUI();}}
 function launchKey(){const power=+root.querySelector('.chip-power').value;fire(Math.cos(angle)*power,Math.sin(angle)*power);}
 root.querySelector('.chip-fire').onclick=launchKey;root.querySelector('.chip-back').onclick=onExit;
 function world(e){const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const p=new THREE.Vector3();return raycaster.ray.intersectPlane(plane,p)?p:null;}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
 if(pointer)return;const p=world(e);const i=p?game.chips.findIndex(c=>Math.hypot(c.x-p.x,c.z-p.z)<.55):-1;
 if(e.button===0&&i>=0&&game.phase==='ready'){if(!game.select(i)){choose(i);return;}choose(i);pointer={id:e.pointerId,mode:'aim',x:e.clientX,y:e.clientY};aimPoint=p;}
 else{pointer={id:e.pointerId,mode:'orbit',x:e.clientX,y:e.clientY};}
 canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});
 };
 canvas.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='aim'){aimPoint=world(e);}else{azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.62,1.16);pointer.x=e.clientX;pointer.y=e.clientY;view();}};
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='aim'&&game.selected!==null){const p=world(e),c=game.chips[game.selected];if(p)fire((c.x-p.x)*5,(c.z-p.z)*5);}pointer=null;aimPoint=null;};
 canvas.onpointercancel=()=>{pointer=null;aimPoint=null;};
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),17,40);view();},{passive:false});
 canvas.onkeydown=e=>{if(['1','2','3'].includes(e.key)){e.preventDefault();choose(+e.key-1);}if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' ')launchKey();else angle+=(e.key==='ArrowLeft'?-.08:.08);}if(e.key==='+'||e.key==='='){distance=Math.max(17,distance-2);view();}if(e.key==='-'){distance=Math.min(40,distance+2);view();}};
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const a=b.dataset.camera;if(a==='in')distance=Math.max(17,distance-2);if(a==='out')distance=Math.min(40,distance+2);if(a==='left')azimuth-=.2;if(a==='right')azimuth+=.2;if(a==='home'){azimuth=.56;elevation=.91;distance=30;}view();});
 function reset(){game.reset();previousPhase='ready';previousResult=null;result.textContent='';result.className='chip-result';updateUI();say(t('칩을 선택하여 두 칩 사이를 통과하세요. 세 칩 모두 통과해야 슈팅을 할 수 있습니다.','Choose a chip. Complete a pass with all three before shooting.'));}
 function checkOutcome(){
 if(game.phase!==previousPhase||game.result!==previousResult){
 updateUI();
 if(game.phase==='fail'){
 const reasons={'early-goal':t('세 칩의 패스가 끝나기 전에 슈팅했습니다.','Shot before all three chips completed a pass.'),'missed-gate':t('두 칩 사이를 통과하지 못했습니다.','The chip did not pass through the gap.'),'collision':t('다른 칩에 부딪혔습니다.','Hit another chip.')};
 result.textContent='FAIL';result.classList.add('show');say(reasons[game.result]+' '+t('자동으로 다시 시작합니다.','Restarting automatically.'));timer=setTimeout(reset,1500);
 }else if(game.phase==='won'){result.textContent='GOAL';result.classList.add('show');say(t('성공! AFTER HOURS로 돌아갑니다.','Goal! Returning to AFTER HOURS.'));timer=setTimeout(()=>{if(!disposed)onWin();},1400);}
 else if(game.result==='pass')say(t('패스 성공! 다른 칩을 선택하세요.','Pass complete! Select a different chip.'));
 previousPhase=game.phase;previousResult=game.result;
 }
 }
 function render(now){
 if(disposed)return;
 const elapsed=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=elapsed;
 while(acc>=1/240){game.step(1/240);acc-=1/240;}
 checkOutcome();
 game.chips.forEach((c,i)=>{const g=chipMeshes[i];g.position.set(c.x,0,c.z);if(game.phase==='moving'&&i===game.selected)g.rotation.y+=Math.hypot(game.vx,game.vz)*elapsed*.7;rings[i].position.set(c.x,.025,c.z);rings[i].visible=i===game.selected||c.passed;rings[i].material.color.set(i===game.selected?0xffe39a:0x8ddbb6);});
 arrow.visible=game.phase==='ready'&&game.selected!==null;
 if(arrow.visible){const c=game.chips[game.selected];let dx=Math.cos(angle),dz=Math.sin(angle),length=2;if(aimPoint){dx=c.x-aimPoint.x;dz=c.z-aimPoint.z;length=Math.min(4,Math.hypot(dx,dz));}const v=new THREE.Vector3(dx,0,dz);if(v.length()>.01){v.normalize();arrow.position.set(c.x,.2,c.z);arrow.setDirection(v);arrow.setLength(Math.max(.2,length),.3,.17);}}
 renderer.render(scene,camera);frame=requestAnimationFrame(render);
 }
 reset();resize();frame=requestAnimationFrame(render);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());arrow.line.geometry.dispose();arrow.line.material.dispose();arrow.cone.geometry.dispose();arrow.cone.material.dispose();renderer.dispose();renderer.forceContextLoss();}};
}

export {mountBasketball} from './chip-basketball.mjs';

export {mountCurling} from './chip-curling.mjs';
