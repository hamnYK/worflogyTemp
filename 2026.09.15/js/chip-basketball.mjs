import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {ChipBasketball,BASKET} from './chip-basketball-rules.mjs';

export function mountBasketball(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new ChipBasketball();
 host.innerHTML=`<div class="chip-game basketball-game"><div class="chip-game-heading"><button type="button" class="wf-button chip-back">${t('게임 선택','Games')}</button><h2>1 CHIP BASKETBALL</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('칩 농구. 스페이스로 회전, 그리퍼로 잡기, 발사. 좌우 방향키로 조준.','Chip basketball. Space to spin, grip the chip, and launch. Left/right arrows aim.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="basket-catch-meter" aria-hidden="true"><span></span></div><div class="chip-camera"><button type="button" data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button type="button" data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button type="button" data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button type="button" data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button type="button" data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><button type="button" class="wf-button basket-action"></button><label>${t('조준','Aim')} <input class="basket-aim" type="range" min="-.4" max=".4" step=".01" value="0" aria-label="${t('좌우 조준','Horizontal aim')}"></label><label>${t('힘','Power')} <input class="chip-power" type="range" min="7" max="14" step=".1" value="9.6" aria-label="${t('발사 강도','Launch power')}"></label></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.querySelector('.chip-game'),canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),action=root.querySelector('.basket-action'),aim=root.querySelector('.basket-aim'),power=root.querySelector('.chip-power'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result'),meter=root.querySelector('.basket-catch-meter'),needle=meter.firstElementChild;
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start the 3D table.')+'</p><button type="button" class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#142130');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);let azimuth=.48,elevation=.68,distance=21,disposed=false,frame,timer,last=performance.now(),acc=0,pointer=null,phase='',lastCatchable=false;
 const geos=new Set(),mats=new Set(),textures=new Set();
 function material(color,roughness=.45,metalness=0){const m=new THREE.MeshStandardMaterial({color,roughness,metalness});mats.add(m);return m;}
 function mesh(g,m,x=0,y=0,z=0,parent=scene){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function line(points,color){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));geos.add(g);const m=new THREE.LineBasicMaterial({color,transparent:true,opacity:.7});mats.add(m);const o=new THREE.Line(g,m);scene.add(o);return o;}
 scene.add(new THREE.HemisphereLight(0xd7efff,0x292c35,2.1));
 const sun=new THREE.DirectionalLight(0xffe7c2,3.2);sun.position.set(-5,13,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:10,bottom:-10,near:.5,far:35});sun.shadow.normalBias=.02;scene.add(sun);
 const light=new THREE.DirectionalLight(0x83cfff,1.8);light.position.set(7,6,-6);scene.add(light);
 const finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 finish.plinth(8.5,12.5,-.65,'#558eb4');
 const wood=material('#a76e40',.48),trim=material('#293441',.35,.6),gold=material('#c3a464',.27,.7),white=material('#f7f3df'),orange=material('#ee673c',.32,.2),blue=material('#3f75ae',.3,.18);
 box(8.5,.65,12.5,trim,0,-.4,0);box(8.2,.1,12.2,gold,0,-.045,0);
 const c=document.createElement('canvas');c.width=768;c.height=1152;const ctx=c.getContext('2d');
 ctx.fillStyle='#be9565';ctx.fillRect(0,0,c.width,c.height);let seed=91;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let x=0;x<768;x+=48){ctx.fillStyle=x%96?'#b88856':'#c29c6e';ctx.fillRect(x,0,48,1152);ctx.strokeStyle='#785c3b44';ctx.lineWidth=1;for(let j=0;j<60;j++){const xx=x+rand()*48;ctx.beginPath();ctx.moveTo(xx,0);ctx.bezierCurveTo(xx+4,350,xx-3,700,xx,1152);ctx.stroke();}}
 ctx.strokeStyle='#fff0d6';ctx.lineWidth=4;ctx.strokeRect(22,22,724,1108);ctx.beginPath();ctx.moveTo(22,576);ctx.lineTo(746,576);ctx.stroke();ctx.beginPath();ctx.arc(384,576,90,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#214a6499';ctx.fillRect(264,22,240,285);ctx.strokeRect(264,22,240,285);ctx.beginPath();ctx.arc(384,307,120,0,Math.PI);ctx.stroke();ctx.beginPath();ctx.arc(384,125,310,0,Math.PI);ctx.stroke();
 // Staggered maple plank joints beneath the lacquer.
 ctx.globalCompositeOperation='multiply';ctx.strokeStyle='#785c3b55';ctx.lineWidth=1;
 for(let x=0;x<768;x+=48){for(let y=(x/48%3)*95;y<1152;y+=288){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+48,y);ctx.stroke();}}
 ctx.globalCompositeOperation='source-over';
 ctx.save();ctx.translate(384,720);ctx.fillStyle='#fff0d6bb';ctx.textAlign='center';ctx.font='bold 28px Arial';ctx.fillText('WORFLOGY',0,0);ctx.font='12px Arial';ctx.fillText('A F T E R   H O U R S',0,24);ctx.restore();
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(tex);const floor=finish.material({color:'#ffffff',roughness:.32,clearcoat:.75,clearcoatRoughness:.25});floor.map=tex;floor.bumpMap=finish.grain('wood');floor.bumpScale=.009;const board=mesh(new THREE.PlaneGeometry(8,12),floor,0,.012,0);board.rotation.x=-Math.PI/2;board.castShadow=false;
 for(const x of [-4.13,4.13])box(.13,.15,12.4,trim,x,.08,0);
 const ground=mesh(new THREE.PlaneGeometry(100,100),material('#192736',.95),0,-.85,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 box(.16,4.5,.16,trim,0,2.25,-5.45);box(.13,.13,.65,trim,0,3.6,-5.15);
 const glass=new THREE.MeshPhysicalMaterial({color:0xc6e7f0,transparent:true,opacity:.28,roughness:.09,metalness:.25,clearcoat:1,side:THREE.DoubleSide});mats.add(glass);
 box(3.5,2.35,.08,glass,0,3.75,-4.9);
 for(const x of [-1.78,1.78])box(.07,2.42,.08,white,x,3.75,-4.9);
 for(const y of [2.54,4.96])box(3.6,.07,.08,white,0,y,-4.9);
 line([[-.6,3,-4.84],[-.6,3.8,-4.84],[.6,3.8,-4.84],[.6,3,-4.84]],0xffffff);
 box(.2,.13,.8,orange,0,3,-4.45);
 const rim=mesh(new THREE.TorusGeometry(.8,.055,16,96),orange,0,3,-4);rim.rotation.x=Math.PI/2;
 // Padded support, bolted glass mount and woven rope net.
 box(.46,2.05,.4,blue,0,1.04,-5.45);
 box(.55,.35,.12,trim,0,3.04,-4.78);
 for(const x of [-1.6,1.6])for(const y of [2.72,4.78]){const bolt=mesh(new THREE.SphereGeometry(.045,12,8),gold,x,y,-4.82);bolt.scale.z=.4;}
 const netMaterial=material('#f1ead7',.87);
 for(let i=0;i<16;i++)for(const twist of [-1,1]){
 const points=[];for(let j=0;j<=5;j++){const a=i*Math.PI/8+twist*j*Math.PI/16,r=.8-j*.071;points.push(new THREE.Vector3(Math.cos(a)*r,2.97-j*.18,-4+Math.sin(a)*r));}
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
 let gripClosure=0,cock=0,releaseCock=0;
 const trajectoryMat=new THREE.LineDashedMaterial({color:0xffe9a8,dashSize:.18,gapSize:.13});mats.add(trajectoryMat);
 const trajectoryGeo=new THREE.BufferGeometry();geos.add(trajectoryGeo);const trajectory=new THREE.Line(trajectoryGeo,trajectoryMat);scene.add(trajectory);
 function view(){const d=distance*Math.max(1,1.05/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,1+Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d);camera.lookAt(0,1,0);camera.updateMatrixWorld();}
 function resize(){const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function say(text){status.textContent=text;}
 function refresh(){
 root.dataset.phase=game.phase;
 const labels={ready:t('회전시키기','Spin'),spinning:t('그리퍼로 잡기','Grip the chip'),held:t('그리퍼 발사','Launch'),flying:t('슈팅 중','In flight'),fail:'FAIL',won:'GOAL'};
 action.textContent=labels[game.phase];action.disabled=['flying','fail','won'].includes(game.phase);aim.disabled=power.disabled=game.phase!=='held';
 progress.textContent=game.phase==='ready'||game.phase==='spinning'?t('01 / 회전 · 잡기','01 / SPIN · CATCH'):t('02 / 조준 · 슈팅','02 / AIM · SHOOT');
 meter.hidden=game.phase!=='spinning';
 }
 function act(){
 if(game.phase==='ready'){game.spin();say(t('표시가 가운데에 올 때 그리퍼로 칩을 잡으세요.','Close the grippers when the marker reaches the center.'));}
 else if(game.phase==='spinning'){if(game.catch())say(t('칩을 세웠습니다. 조준과 힘을 맞추고 그리퍼로 발사하세요.','Chip secured. Set aim and power, then launch.'));}
 else if(game.phase==='held'){releaseCock=cock;game.launch(+power.value,+aim.value);say(t('그리퍼에서 칩을 발사했습니다.','Chip launched from the grippers.'));}
 refresh();
 }
 action.onclick=act;root.querySelector('.chip-back').onclick=onExit;
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.6);
 function world(e){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const p=new THREE.Vector3();return ray.ray.intersectPlane(plane,p)?p:null;}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
 if(pointer)return;const p=world(e),onChip=p&&Math.hypot(p.x,p.z-3.6)<.85;
 if(e.button===0&&onChip&&['ready','spinning'].includes(game.phase)){act();return;}
 if(e.button===0&&onChip&&game.phase==='held')pointer={id:e.pointerId,mode:'aim',x:e.clientX,y:e.clientY};
 else pointer={id:e.pointerId,mode:'orbit',x:e.clientX,y:e.clientY};
 canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});
 };
 canvas.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;
 if(pointer.mode==='orbit'){azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.45,1.05);pointer.x=e.clientX;pointer.y=e.clientY;view();}
 else{const p=world(e);if(p){aim.value=THREE.MathUtils.clamp(-p.x*.18,-.4,.4);power.value=THREE.MathUtils.clamp(7+Math.max(0,p.z-3.6)*2.3,7,14);}}};
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='aim'&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8)act();pointer=null;};
 canvas.onpointercancel=()=>{pointer=null;};
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),13,32);view();},{passive:false});
 canvas.onkeydown=e=>{if(e.key===' '){e.preventDefault();if(!e.repeat)act();}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();if(game.phase==='held')aim.value=THREE.MathUtils.clamp(+aim.value+(e.key==='ArrowLeft'?-.02:.02),-.4,.4);}};
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const key=b.dataset.camera;if(key==='in')distance=Math.max(13,distance-2);if(key==='out')distance=Math.min(32,distance+2);if(key==='left')azimuth-=.2;if(key==='right')azimuth+=.2;if(key==='home'){distance=21;elevation=.68;azimuth=.48;}view();});
 function reset(){gripClosure=0;cock=0;releaseCock=0;game.reset();phase='';result.className='chip-result';result.textContent='';say(t('칩을 회전시킨 뒤 그리퍼로 잡아 세워 보세요.','Spin the chip, then catch it upright with the grippers.'));refresh();}
 function outcomes(){
 if(phase===game.phase)return;phase=game.phase;refresh();
 if(phase==='fail'){result.textContent='FAIL';result.classList.add('show');say(game.result==='catch'?t('칩을 놓쳤습니다. 다시 시작합니다.','Missed the catch. Restarting.'):t('다시 도전해 보세요. 자동으로 다시 시작합니다.','Try again. Restarting automatically.'));timer=setTimeout(reset,1500);}
 if(phase==='won'){result.textContent='GOAL';result.classList.add('show');say(t('성공! AFTER HOURS로 돌아갑니다.','Basket! Returning to AFTER HOURS.'));timer=setTimeout(()=>{if(!disposed)onWin();},1400);}
 }
 function animate(now){
 if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=dt;
 while(acc>=1/240){game.step(1/240);acc-=1/240;}
 outcomes();chip.position.set(game.p.x,game.p.y,game.p.z);chip.rotation.y=game.phase==='spinning'?game.angle:0;
 spinGroup.rotation.x=game.phase==='flying'?Math.PI/2+game.time*7:Math.PI/2;
 chip.rotation.z=game.phase==='spinning'?Math.sin(game.angle*2)*.065:0;
 const holding=game.phase==='held',flying=game.phase==='flying';
 const blend=1-Math.exp(-dt*18);
 gripClosure+=((holding?1:0)-gripClosure)*blend;
 cock+=((holding?.22:0)-cock)*(1-Math.exp(-dt*8));
 const recoil=flying?releaseCock*Math.max(0,1-game.time/.12):cock;
 grippers.position.set(0,.6,3.6+recoil);
 grippers.rotation.y=holding?-Number(aim.value):0;
 for(const {assembly,sign} of jaws)assembly.position.x=sign*(.15+(1-gripClosure)*.38);
 grippers.visible=!['fail','won'].includes(game.phase);
 if(holding||flying)chip.position.z+=recoil;
 if(holding)chip.rotation.y=-Number(aim.value);
 const catchable=game.catchable;root.dataset.catchable=String(catchable);needle.style.transform='translateX('+Math.sin(game.angle)*65+'px)';meter.classList.toggle('is-ready',catchable);
 if(catchable!==lastCatchable){lastCatchable=catchable;action.classList.toggle('basket-catch-ready',catchable);}
 trajectory.visible=game.phase==='held';
 if(trajectory.visible){const pts=[],v=+power.value,a=+aim.value,el=55*Math.PI/180;for(let i=0;i<24;i++){const t=i*.04;pts.push(new THREE.Vector3(Math.sin(a)*Math.cos(el)*v*t,.6+Math.sin(el)*v*t-4.905*t*t,3.6-Math.cos(a)*Math.cos(el)*v*t));}trajectory.geometry.setFromPoints(pts);trajectory.computeLineDistances();}
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 reset();resize();frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
