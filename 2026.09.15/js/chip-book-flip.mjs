import {bookFlipGuide,syncGuide} from './game-guides.mjs';
import {createBookDetails} from './book-flip-details.mjs';
import * as THREE from '../lib/three.module.min.js';
import {createArcadeFinish} from './arcade-finish.mjs';
import {createTablePan} from './table-pan.mjs';
import {ChipBookFlip,BOOK,BOOKS} from './chip-book-flip-rules.mjs';
export function mountBookFlip(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new ChipBookFlip();
 host.innerHTML=`<div class="chip-game book-flip-game"><div class="chip-game-heading"><button class="wf-button chip-back" type="button">${t('게임 선택','Games')}</button><h2>3 CHIPS BOOK FLIP</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('책치기. 책 위를 길게 눌렀다 놓으면 타격. 방향키로 위치, Space로 타격.','Book flip. Hold and release on the book to strike. Arrow keys position the strike; Space strikes.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"><button data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><div class="book-types">${Object.entries(BOOKS).map(([key,b])=>`<button class="wf-button" data-book="${key}" aria-pressed="false">${t(b.ko,b.en)}</button>`).join('')}</div><label>${t('힘','Power')} <input class="chip-power" type="range" min="1" max="10" step=".1" value="1"></label><button class="wf-button book-strike">${t('책 치기','Strike book')}</button></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result'),power=root.querySelector('.chip-power'),strike=root.querySelector('.book-strike');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start 3D.')+'</p><button class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#243846');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures),pan=createTablePan(camera,canvas);
 function mat(color,roughness=.5,metalness=0){return finish.material({color,roughness,metalness});}
 function mesh(geo,material,parent=scene,x=0,y=0,z=0){geos.add(geo);const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 scene.add(new THREE.HemisphereLight(0xd9efff,0x514332,1.45));
 const light=new THREE.DirectionalLight(0xffecd6,2.6);light.position.set(-5,12,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-8,right:8,top:9,bottom:-9,near:.1,far:35});light.shadow.normalBias=.015;scene.add(light);
 const fill=new THREE.DirectionalLight(0xa6dfff,1);fill.position.set(6,4,-5);scene.add(fill);
 const details=createBookDetails({scene,finish,geos,textures,BOOK,BOOKS,renderer});
 function updateBook(){details.update(game.kind);}
 const chipMeshes=game.chips.map((_,i)=>{
 const g=new THREE.Group();scene.add(g);finish.chip(g,.3,i+1,['#cb6950','#5378a9','#b39a4d'][i]);
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#23745c';x.fillRect(0,0,256,256);x.strokeStyle='#fff0c2';x.lineWidth=8;x.beginPath();x.arc(128,128,114,0,Math.PI*2);x.stroke();x.fillStyle='#fff0c2';x.textAlign='center';x.font='bold 64px Arial';x.fillText('FLIP',128,145);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
 const back=mesh(new THREE.CircleGeometry(.247,64),finish.material({map:texture,roughness:.35}),g,0,-.073,0);back.rotation.x=Math.PI/2;return g;
 });
 const target=mesh(new THREE.TorusGeometry(.42,.018,8,64),mat('#f8d788',.3,.4));target.rotation.x=-Math.PI/2;
 const defaultDistance=12;
 let hit={x:0,z:1.6},distance=defaultDistance,azimuth=.42,elevation=.85,pointer=null,disposed=false,frame,timer,last=performance.now(),acc=0,phase='',slap=10,pendingStrike=null,lastStrikePower=1;
 function heldPower(now){const cycle=((now-pointer.start)/2250)%2;return 1+(1-Math.abs(cycle-1))*9;}
 function view(){const d=distance*Math.max(1,1.1/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d).add(pan.offset);camera.lookAt(pan.offset.clone().add(new THREE.Vector3(0,.3,0)));camera.updateMatrixWorld();}
 function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function refresh(){
 root.dataset.phase=pendingStrike?'striking':game.phase;root.dataset.book=game.kind;root.dataset.hits=game.hits;
 progress.textContent=t('남은 기회 ','HITS LEFT ')+(BOOK.attempts-game.hits)+'/5 · '+t('뒤집힘 ','FLIPPED ')+(game.phase==='moving'?t('판정 중','pending'):game.flipped+'/3');
 strike.disabled=power.disabled=!!pendingStrike||game.phase!=='ready';
 root.querySelectorAll('[data-book]').forEach(b=>{b.disabled=!!pendingStrike||game.phase==='moving';b.setAttribute('aria-pressed',String(b.dataset.book===game.kind));});
 }
 function guide(){syncGuide(status,bookFlipGuide(game,t,{pending:!!pendingStrike,mode:pointer?.mode}));}

 function strikeBook(){if(game.phase!=='ready'||pendingStrike)return;lastStrikePower=+power.value;pendingStrike={x:hit.x,z:hit.z,power:lastStrikePower};power.value=1;slap=0;pointer=null;refresh();guide();}
 strike.onclick=strikeBook;root.querySelector('.chip-back').onclick=onExit;
 function reset(kind=game.kind){clearTimeout(timer);game.reset(kind);phase='';pointer=null;slap=10;pendingStrike=null;lastStrikePower=1;power.value=1;result.className='chip-result';result.textContent='';updateBook();refresh();guide();}
 root.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>reset(b.dataset.book));
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-BOOK.top);
 function point(e){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3());}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{if(pointer||pendingStrike)return;canvas.focus({preventScroll:true});const p=point(e),inside=p&&Math.abs(p.x)<=3&&Math.abs(p.z)<=4;
 pointer={id:e.pointerId,x:e.clientX,y:e.clientY,start:performance.now(),mode:e.button===0&&inside&&game.phase==='ready'?'strike':e.button===2?'orbit':'pan'};
 if(pointer.mode==='strike'){hit={x:p.x,z:p.z};power.value=1;}canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='orbit'){azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.5,1.2);view();}else if(pointer.mode==='pan'){pan.move(pointer.x,pointer.y,e.clientX,e.clientY);view();}pointer.x=e.clientX;pointer.y=e.clientY;};
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;const mode=pointer.mode;if(mode==='strike')power.value=heldPower(performance.now());pointer=null;if(mode==='strike')strikeBook();};
 canvas.onpointercancel=()=>{if(pointer?.mode==='strike')power.value=1;pointer=null;};
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),10,24);view();},{passive:false});
 canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){e.preventDefault();if(game.phase!=='ready'||pendingStrike)return;if(e.key===' '){if(!e.repeat)strikeBook();}else{hit.x=THREE.MathUtils.clamp(hit.x+(e.key==='ArrowRight'?.2:e.key==='ArrowLeft'?-.2:0),-2.9,2.9);hit.z=THREE.MathUtils.clamp(hit.z+(e.key==='ArrowDown'?.2:e.key==='ArrowUp'?-.2:0),-3.9,3.9);}}};
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const k=b.dataset.camera;if(k==='in')distance=Math.max(10,distance-2);if(k==='out')distance=Math.min(24,distance+2);if(k==='left')azimuth-=.2;if(k==='right')azimuth+=.2;if(k==='home'){distance=defaultDistance;azimuth=.42;elevation=.85;pan.reset();}view();});
 function animate(now){
 if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;slap+=dt;if(pendingStrike&&slap>=.14){const hitNow=pendingStrike;pendingStrike=null;game.strike(hitNow.x,hitNow.z,hitNow.power);refresh();}acc+=dt;while(acc>=1/240){game.step(1/240);acc-=1/240;}
 if(pointer?.mode==='strike')power.value=heldPower(now);
 if(phase!==game.phase){phase=game.phase;refresh();if(phase==='won'||phase==='fail'){
 result.textContent=phase==='won'?'ALL FLIPPED!':'FAILURE';result.classList.add('show');
 status.textContent=phase==='won'?t('세 칩 뒤집기 성공! 3초 후 로비로 돌아갑니다.','All three chips flipped! Returning to the lobby in 3 seconds.'):game.reason==='outside'?t('칩이 책 밖으로 떨어졌습니다. 3초 후 다시 시작합니다.','A chip fell off the book. Restarting in 3 seconds.'):game.reason==='attempts'?t('5번의 기회를 모두 사용했습니다. 3초 후 다시 시작합니다.','All 5 hits used. Restarting in 3 seconds.'):t('칩이 안정적으로 멈추지 않았습니다. 3초 후 다시 시작합니다.','The chips did not settle. Restarting in 3 seconds.');
 timer=setTimeout(()=>{if(!disposed){if(game.phase==='won')onWin();else reset();}},3000);
 }}
 guide();chipMeshes.forEach((m,i)=>{m.position.copy(game.chips[i].position);m.quaternion.copy(game.chips[i].quaternion);});
 target.position.set(hit.x,BOOK.top+.012,hit.z);target.visible=game.phase==='ready'&&!pendingStrike;target.scale.setScalar(1+(+power.value)/20);
 details.animate({hit,charge:pointer?.mode==='strike'?+power.value/10:-1,slap,power:lastStrikePower,camera});
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 reset();resize();frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
