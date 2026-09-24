import {adjustPower} from './game-input.mjs';
import {eraserGuide,syncGuide} from './game-guides.mjs';
import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {createTablePan} from './table-pan.mjs';
import {EraserWrestling,RING,PRESS} from './eraser-wrestling-rules.mjs';
export function mountEraserWrestling(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new EraserWrestling();
 host.innerHTML=`<div class="chip-game eraser-game"><div class="chip-game-heading"><button class="wf-button chip-back">${t('게임 선택','Games')}</button><h2>ERASER WRESTLING</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('지우개 레슬링. 내 파란 지우개의 가장자리를 눌렀다 놓으세요. 1부터 8로 누를 위치 선택, Space로 뒤집기.','Eraser wrestling. Hold and release an edge of your blue eraser. Keys 1 to 8 select an edge; Space flips.') }"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"><button data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><label>${t('누를 위치','Press point')} <select class="eraser-edge">${PRESS.map((_,i)=>'<option value="'+i+'">'+(i+1)+'</option>').join('')}</select></label><label>${t('힘','Power')} <input class="chip-power" aria-keyshortcuts="PageUp PageDown" type="range" min="1" max="10" step=".1" value="5"></label><button class="wf-button eraser-flip">${t('뒤집기','Flip')}</button></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),progress=root.querySelector('.chip-progress'),status=root.querySelector('.chip-status'),result=root.querySelector('.chip-result'),power=root.querySelector('.chip-power'),edge=root.querySelector('.eraser-edge'),flip=root.querySelector('.eraser-flip');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start 3D.')+'</p><button class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#233947');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures),pan=createTablePan(camera,canvas);
 const mat=options=>finish.material(options);
 function mesh(geo,material,parent=scene,x=0,y=0,z=0){geos.add(geo);const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function texture(c){const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(tex);return tex;}
 function rounded(w,h,d,r=.04){
 const shape=new THREE.Shape(),x=-w/2,y=-d/2;
 shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+d-r);shape.quadraticCurveTo(x+w,y+d,x+w-r,y+d);shape.lineTo(x+r,y+d);shape.quadraticCurveTo(x,y+d,x,y+d-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(shape,{depth:h-.016,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,curveSegments:10,steps:1});g.rotateX(-Math.PI/2);g.translate(0,-(h-.016)/2,0);return g;
 }
 scene.add(new THREE.HemisphereLight(0xcfeaff,0x62513d,1.7));const sun=new THREE.DirectionalLight(0xffe5c3,2.8);sun.position.set(-5,11,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:9,bottom:-9,near:.1,far:35});sun.shadow.normalBias=.009;scene.add(sun);
 const fill=new THREE.DirectionalLight(0x9fcefa,1.2);fill.position.set(7,5,-5);scene.add(fill);
 const wood=mat({color:'#b4a48b',roughness:.62,map:finish.grain('oak'),bumpMap:finish.grain('wood'),bumpScale:.014});mesh(finish.beveledBox(17,.3,17),wood,scene,0,-.22,0);
 const paper=document.createElement('canvas');paper.width=paper.height=1024;const ctx=paper.getContext('2d');ctx.fillStyle='#eee6cf';ctx.fillRect(0,0,1024,1024);
 let seed=61;for(let i=0;i<18000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ctx.fillStyle=i%2?'#998b6410':'#ffffff20';ctx.fillRect(seed%1024,(seed>>>10)%1024,1,2);}
 ctx.strokeStyle='#56799224';ctx.lineWidth=1;for(let i=0;i<1024;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke();}
 ctx.strokeStyle='#334d65';ctx.lineWidth=5;ctx.strokeRect(102.4,51.2,819.2,921.6);ctx.lineWidth=1;ctx.strokeRect(110,59,804,906);
 ctx.fillStyle='#35536a';ctx.textAlign='center';ctx.font='bold 31px Arial';ctx.fillText('ERASER WRESTLING',512,145);ctx.font='18px Arial';ctx.fillText('WORFLOGY  /  AFTER HOURS',512,907);
 ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(135,512);ctx.lineTo(889,512);ctx.stroke();ctx.setLineDash([]);
 const sheetMat=mat({map:texture(paper),roughness:.9,bumpMap:finish.grain('paper'),bumpScale:.006});const sheet=mesh(new THREE.PlaneGeometry(10,10),sheetMat,scene,0,-.001,0);sheet.rotation.x=-Math.PI/2;sheet.castShadow=false;
 // The visible border is x +/-4, z +/-4.5, matching the rules exactly.
 const models=game.bodies.map((_,i)=>{
 const g=new THREE.Group();scene.add(g);
 const rubber=mat({color:i?'#edb3a3':'#e8e5d9',roughness:.87,bumpMap:finish.grain('cloth'),bumpScale:.0015});
 mesh(rounded(1.8,.3,.84,.07),rubber,g);
 const band=mat({color:i?'#a94f45':'#375e89',roughness:.66,clearcoat:.08,bumpMap:finish.grain('paper'),bumpScale:.004});mesh(rounded(1.02,.309,.849,.035),band,g,-.04,0,0);
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle=i?'#a94f45':'#375e89';x.fillRect(0,0,512,256);x.strokeStyle='#f5e9cc';x.lineWidth=3;x.strokeRect(14,14,484,228);x.fillStyle='#f5e9cc';x.textAlign='center';x.font='bold 75px Arial';x.fillText(i?'RIVAL':'PLAYER',256,118);x.font='24px Arial';x.fillText('SOFT RUBBER  /  01',256,168);x.font='18px Arial';x.fillText('WORFLOGY',256,210);
 const label=mat({map:texture(c),roughness:.7,bumpMap:finish.grain('paper'),bumpScale:.003});
 for(const sign of [-1,1]){const face=mesh(new THREE.PlaneGeometry(.94,.76),label,g,-.04,sign*.157,0);face.rotation.x=-sign*Math.PI/2;face.castShadow=false;}
 // Shallow wear lines on the exposed ends.
 for(const sign of [-1,1])for(let j=0;j<4;j++){const line=mesh(new THREE.BoxGeometry(.16,.001,.005),mat({color:i?'#ce998a':'#c3bdac',roughness:1}),g,sign*.7,.151,(j-1.5)*.11);line.rotation.y=sign*.25;line.castShadow=false;}
 return g;
 });
 const markers=PRESS.map((_,i)=>{
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#ffffff';x.beginPath();x.arc(32,32,28,0,Math.PI*2);x.fill();x.fillStyle='#243849';x.textAlign='center';x.font='bold 40px Arial';x.fillText(i+1,32,46);
 const m=mesh(new THREE.CircleGeometry(.1,24),mat({map:texture(c),roughness:.8,side:THREE.DoubleSide}),scene);m.rotation.x=-Math.PI/2;m.castShadow=false;return m;
 });
 const pointerRing=mesh(new THREE.TorusGeometry(.14,.012,8,40),mat({color:'#e9b451',emissive:'#e9b451',emissiveIntensity:.25}));pointerRing.rotation.x=-Math.PI/2;pointerRing.castShadow=false;
 let selected=1,distance=17,azimuth=.36,elevation=.88,pointer=null,last=performance.now(),acc=0,frame,timer,disposed=false,phaseKey='',aiDelay=0;
 edge.value=selected;
 function view(){const d=distance*Math.max(1,1.1/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d).add(pan.offset);camera.lookAt(pan.offset);camera.updateMatrixWorld();}
 function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function refresh(){
 const mine=game.phase==='ready'&&game.turn===0;
 root.dataset.phase=game.phase;root.dataset.turn=game.turn;root.dataset.moves=game.moves;
 progress.textContent=t('공격 ','MOVES ')+game.moves+' · '+(game.phase==='won'?t('승리','VICTORY'):game.phase==='lost'?t('패배','DEFEAT'):game.turn===0?t('내 차례 · 파랑','YOUR TURN · BLUE'):t('상대 차례 · 빨강','RIVAL TURN · RED'));
 power.disabled=edge.disabled=!mine;flip.disabled=!mine||!game.accessible(0,selected);
 [...edge.options].forEach((o,i)=>o.disabled=!game.accessible(0,i));
 }
 function guide(){syncGuide(status,eraserGuide(game,t,{mode:pointer?.mode,selected}));}

 function launch(){if(game.launch(selected,+power.value)){pointer=null;refresh();}}
 flip.onclick=launch;edge.onchange=()=>{selected=+edge.value;refresh();};root.querySelector('.chip-back').onclick=onExit;
 const ray=new THREE.Raycaster();function hit(e){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const hits=ray.intersectObject(models[0],true);return hits[0]?.point;}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{
 if(pointer)return;canvas.focus({preventScroll:true});let mode=e.button===2?'orbit':'pan';
 if(e.button===0&&game.phase==='ready'&&game.turn===0){const p=hit(e);if(p){
 let nearest=-1,d=Infinity;PRESS.forEach((_,i)=>{const v=game.pressPoint(0,i),dist=Math.hypot(p.x-v.x,p.z-v.z);if(dist<d&&game.accessible(0,i)){d=dist;nearest=i;}});
 if(nearest>=0&&d<.34){selected=nearest;edge.value=selected;power.value=1;mode='press';refresh();}
 }}
 pointer={id:e.pointerId,x:e.clientX,y:e.clientY,start:performance.now(),mode};canvas.setPointerCapture(e.pointerId);
 };
 canvas.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='orbit'){azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.5,1.2);view();}else if(pointer.mode==='pan'){pan.move(pointer.x,pointer.y,e.clientX,e.clientY);view();}pointer.x=e.clientX;pointer.y=e.clientY;};
 function charge(now){return 1+9*(1-Math.abs(((now-pointer.start)/1800)%2-1));}
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;const mode=pointer.mode;if(mode==='press')power.value=charge(performance.now());pointer=null;if(mode==='press')launch();};
 canvas.onpointercancel=()=>pointer=null;
 canvas.onkeydown=e=>{if(adjustPower(e,power,!!pointer))return;if(pointer){if(e.key===' ')e.preventDefault();return;}if(/^[1-8]$/.test(e.key)&&game.phase==='ready'&&game.turn===0){e.preventDefault();const slot=+e.key-1;if(game.accessible(0,slot)){selected=slot;edge.value=slot;refresh();}}if(e.key===' '){e.preventDefault();if(!e.repeat&&game.turn===0)launch();}};
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),10,26);view();},{passive:false});
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const k=b.dataset.camera;if(k==='in')distance=Math.max(10,distance-2);if(k==='out')distance=Math.min(26,distance+2);if(k==='left')azimuth-=.2;if(k==='right')azimuth+=.2;if(k==='home'){distance=17;azimuth=.36;elevation=.88;pan.reset();}view();});
 function reset(){clearTimeout(timer);game.reset();pointer=null;phaseKey='';aiDelay=0;selected=1;edge.value=selected;power.value=5;result.className='chip-result';result.textContent='';refresh();guide();}
 function animate(now){
 if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=dt;while(acc>=1/240){game.step(1/240);acc-=1/240;}
 const key=game.phase+game.turn;
 if(key!==phaseKey){phaseKey=key;refresh();aiDelay=0;
 if(game.phase==='won'||game.phase==='lost'){
 pointer=null;result.textContent=game.phase==='won'?'VICTORY':'DEFEAT';result.classList.add('show');
 const why=game.reason==='outside'?(game.winner===0?t('상대가 장외로 나가 승리했습니다.','The rival lost by ring-out.'):t('장외 판정으로 패배했습니다.','You lost by ring-out.')):game.reason==='blocked'?(game.winner===0?t('상대가 누를 곳을 모두 막았습니다.','All rival press points are covered.'):t('내 지우개의 누를 곳이 모두 막혔습니다.','All your press points are covered.')):(game.winner===0?t('내 지우개가 상대 위에 완전히 올라탔습니다.','Your eraser landed fully on the rival.'):t('상대 지우개가 내 지우개 위에 완전히 올라탔습니다.','The rival landed fully on your eraser.'));
 status.textContent=(game.winner===0?t('승리! ','You win! '):t('패배. ','You lose. '))+why+' '+(game.winner===0?t('3초 후 로비로 돌아갑니다.','Returning to the lobby in 3 seconds.'):t('3초 후 다시 시작합니다.','Restarting in 3 seconds.'));
 timer=setTimeout(()=>{if(!disposed){if(game.winner===0)onWin();else reset();}},3000);
 }}
 if(game.phase==='ready'&&game.turn===1){aiDelay+=dt;if(aiDelay>.9){const plan=game.planAI();if(plan)game.launch(plan.slot,plan.power);else game.finish(0,'blocked');}}
 if(pointer?.mode==='press')power.value=charge(now);
 guide();models.forEach((m,i)=>{m.position.copy(game.bodies[i].position);m.quaternion.copy(game.bodies[i].quaternion);});
 const mine=game.phase==='ready'&&game.turn===0;
 markers.forEach((m,i)=>{const p=game.pressPoint(0,i);m.position.set(p.x,p.y+.018,p.z);m.visible=mine&&game.accessible(0,i);m.scale.setScalar(i===selected?1.15:.85);});
 const press=game.pressPoint(0,selected);pointerRing.position.set(press.x,press.y+.025,press.z);pointerRing.visible=mine&&game.accessible(0,selected);
 if(pointer?.mode==='press'){const wobble=+power.value/10;pointerRing.scale.setScalar(1+wobble*.35);}
 else pointerRing.scale.setScalar(1);
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 reset();resize();frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
