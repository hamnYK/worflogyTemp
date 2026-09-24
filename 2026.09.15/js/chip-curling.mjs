import {adjustPower} from './game-input.mjs';
import {curlingGuide,syncGuide} from './game-guides.mjs';
import {createCurlingJunk} from './curling-junk.mjs';
import * as THREE from '../lib/three.module.min.js';
import {createTablePan} from './table-pan.mjs';
import {createArcadeFinish} from './arcade-finish.mjs';
import {ChipCurling,CURL} from './chip-curling-rules.mjs';

export function mountCurling(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new ChipCurling();
 host.innerHTML=`<div class="chip-game curling-game"><div class="chip-game-heading"><button class="wf-button chip-back" type="button">${t('게임 선택','Games')}</button><h2>3 CHIPS CURLING</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('칩 컬링. 칩을 뒤로 당겨 발사. 방향키 조준, 칩을 당기는 동안 좌우 방향키로 회전 조절, Space 발사.','Chip curling. Pull the chip back to launch. Arrow keys aim; while dragging the chip, left/right adjusts curl. Space launches.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"><button type="button" data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button type="button" data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button type="button" data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button type="button" data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button type="button" data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><label>${t('조준','Aim')} <input class="curl-aim basket-aim" type="range" min="-.35" max=".35" step=".005" value="0"></label><label>${t('회전','Curl')} <input class="curl-spin basket-aim" type="range" min="-1" max="1" step=".1" value="0"></label><label>${t('힘','Power')} <input class="chip-power" aria-keyshortcuts="PageUp PageDown" type="range" min="1" max="7" step=".01" value="4.2"></label><button type="button" class="wf-button chip-fire">${t('발사','Launch')}</button></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result'),aim=root.querySelector('.curl-aim'),spin=root.querySelector('.curl-spin'),power=root.querySelector('.chip-power'),fire=root.querySelector('.chip-fire');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start 3D.')+'</p><button type="button" class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#172a3a');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 const mat=(color,roughness=.4,metalness=0)=>finish.material({color,roughness,metalness});
 function mesh(g,m,x=0,y=0,z=0){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 const box=(w,h,d,m,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 scene.add(new THREE.HemisphereLight(0xcfeaff,0x283747,1.8));const sun=new THREE.DirectionalLight(0xfff0df,3);sun.position.set(-6,14,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:14,bottom:-14,near:.5,far:40});sun.shadow.normalBias=.02;scene.add(sun);
 const fill=new THREE.DirectionalLight(0x8dcfff,1.4);fill.position.set(8,5,-7);scene.add(fill);
 finish.plinth(7.3,18.5,-.65,'#63c7dc');const rail=mat('#253e50',.28,.6),metal=mat('#a5becb',.25,.8);
 box(7.3,.55,18.5,rail,0,-.32,0);
 const c=document.createElement('canvas');c.width=768;c.height=2048;const ctx=c.getContext('2d');
 ctx.fillStyle='#d6e9ee';ctx.fillRect(0,0,768,2048);
 let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<12000;i++){ctx.strokeStyle=i%2?'#ffffff25':'#66899713';const x=rand()*768,y=rand()*2048;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*5,y+10+rand()*60);ctx.stroke();}
 const targetY=(CURL.targetZ+9)/18*2048;
 // Coordinates match the physical house so scores agree with the visible rings.
 for(const [r,color] of [[2,'#306388'],[1.3,'#edf4f4'],[.65,'#b9433c'],[.13,'#edf4f4']]){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(384,targetY,r/6.8*768,r/18*2048,0,0,Math.PI*2);ctx.fill();}
 ctx.lineWidth=2;ctx.strokeStyle='#25495f55';ctx.beginPath();ctx.moveTo(384,0);ctx.lineTo(384,2048);ctx.moveTo(0,targetY);ctx.lineTo(768,targetY);ctx.stroke();
 for(const z of [-1.8,5.5]){ctx.fillStyle='#b9433c';ctx.fillRect(0,(z+9)/18*2048,768,8);}
 ctx.fillStyle='#31556e';ctx.textAlign='center';ctx.font='bold 28px Arial';ctx.fillText('WORFLOGY',384,1170);ctx.font='15px Arial';ctx.fillText('A F T E R   H O U R S',384,1200);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(tex);
 const ice=finish.material({map:tex,roughness:.24,clearcoat:1,clearcoatRoughness:.2});ice.bumpMap=finish.grain('wood');ice.bumpScale=.002;
 const sheet=mesh(new THREE.PlaneGeometry(6.8,18),ice,0,.01,0);sheet.rotation.x=-Math.PI/2;sheet.castShadow=false;
 for(const sign of [-1,1]){box(.2,.32,18.3,rail,sign*3.5,.12,0);box(.025,.025,18.3,metal,sign*3.5,.29,0);box(7.2,.32,.2,rail,0,.12,sign*9.1);}
 const ground=mesh(new THREE.PlaneGeometry(150,150),mat('#172a3a',.95),0,-.86,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const chips=[];for(let i=0;i<3;i++){const g=new THREE.Group();scene.add(g);finish.chip(g,.34,i+1,['#c9544f','#4588b9','#cba650'][i],.09);chips.push(g);}
 const syncJunk=createCurlingJunk(scene,finish,geos,textures);
 let best=0;try{best=Math.max(0,Math.min(15,Number(localStorage.getItem('worflogy-curling-best'))||0));}catch{}
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(0,.2,7),2,0xd39034,.3,.16);scene.add(arrow);
 let distance=22,azimuth=.4,elevation=.9,disposed=false,frame,timer,last=performance.now(),acc=0,phase='',pointer=null;
 const pan=createTablePan(camera,canvas);
 function resetCourtPosition(){pan.offset.set(0,0,1);}
 resetCourtPosition();
 function view(){const d=distance*Math.max(1,1.1/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d);camera.position.add(pan.offset);camera.lookAt(pan.offset);camera.updateMatrixWorld();}
 function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 function refresh(){
 root.dataset.phase=game.phase;root.dataset.score=game.score;
 progress.textContent=t('투구 ','SHOTS ')+game.shots+'/3 · '+game.score+t('점 / 목표 6점',' PTS / TARGET 6')+' · '+t('보너스 ','BONUS ')+game.bonus+' · '+t('최고 ','BEST ')+best;
 for(const e of [aim,spin,power,fire])e.disabled=game.phase!=='ready';
 }
 function launch(){if(game.launch(+power.value,+aim.value,+spin.value)){status.textContent=t('빙판 위를 미끄러지고 있습니다.','Sliding across the ice.');refresh();}}
 function dragAim(e){const p=world(e);if(p){aim.value=THREE.MathUtils.clamp(Math.atan2(-p.x,Math.max(.1,p.z-7)),-.35,.35);power.value=THREE.MathUtils.clamp(Math.hypot(p.x,p.z-7)*2,1,7);}}
 fire.onclick=launch;root.querySelector('.chip-back').onclick=onExit;
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.15);
 function world(e){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3());}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointerdown=e=>{if(pointer)return;const p=world(e);pointer={id:e.pointerId,x:e.clientX,y:e.clientY,mode:e.button===0&&game.phase==='ready'&&p&&Math.hypot(p.x,p.z-7)<.8?'aim':e.button===2?'orbit':'pan'};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});};
 canvas.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='pan'){pan.move(pointer.x,pointer.y,e.clientX,e.clientY);pointer.x=e.clientX;pointer.y=e.clientY;view();return;}if(pointer.mode==='aim'){dragAim(e);}else{azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.62,1.16);pointer.x=e.clientX;pointer.y=e.clientY;view();}};
 canvas.onpointerup=e=>{if(!pointer||pointer.id!==e.pointerId)return;if(pointer.mode==='aim'&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8){dragAim(e);launch();}pointer=null;};
 canvas.onpointercancel=()=>pointer=null;
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),10,33);view();},{passive:false});
 canvas.onkeydown=e=>{if(adjustPower(e,power,!!pointer,.1))return;if(e.key===' '){e.preventDefault();if(!e.repeat&&!pointer)launch();}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(game.phase==='ready'){if(pointer&&pointer.mode!=='aim')return;if(e.key==='ArrowUp'||e.key==='ArrowDown'){if(!pointer)power.value=THREE.MathUtils.clamp(+power.value+(e.key==='ArrowUp'?.1:-.1),1,7);return;}const direction=e.key==='ArrowLeft'?-1:1;if(pointer?.mode==='aim'||e.shiftKey)spin.value=THREE.MathUtils.clamp(Math.round((+spin.value+direction*.1)*10)/10,-1,1);else if(!pointer)aim.value=THREE.MathUtils.clamp(+aim.value+direction*.01,-.35,.35);}}};
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const k=b.dataset.camera;if(k==='in')distance=Math.max(10,distance-2);if(k==='out')distance=Math.min(33,distance+2);if(k==='left')azimuth-=.2;if(k==='right')azimuth+=.2;if(k==='home'){resetCourtPosition();distance=22;azimuth=.4;elevation=.9;}view();});
 function reset(){game.reset();phase='';result.className='chip-result';result.textContent='';aim.value=spin.value=0;power.value=4.2;status.textContent=t('칩 3개로 합계 6점! 원은 3·2·1점, 잡동사니를 원 밖으로 밀어내면 개당 +2점입니다.','Reach 6 points in 3 shots. Rings: 3/2/1. Each object cleared from the house: +2.');refresh();}
 function outcome(){if(phase===game.phase)return;phase=game.phase;refresh();if(phase==='ready'&&game.shots)status.textContent=t('다음 칩을 발사하세요. 앞선 칩을 밀어낼 수도 있습니다.','Launch the next chip. You can move earlier chips.');
 if(phase==='won'||phase==='fail'){best=Math.max(best,game.score);try{localStorage.setItem('worflogy-curling-best',String(best));}catch{}refresh();result.textContent=(phase==='won'?'CLEAR':'RETRY')+' · '+game.score+' PTS';result.classList.add('show');status.textContent=t('원 점수 ','RINGS ')+game.ringScore+' + '+t('보너스 ','BONUS ')+game.bonus+' · '+t('최고 ','BEST ')+best+' · '+(phase==='won'?t('AFTER HOURS로 돌아갑니다.','Returning to AFTER HOURS.'):t('다시 도전합니다.','Starting another round.'));timer=setTimeout(()=>{if(!disposed){if(game.phase==='won')onWin();else reset();}},1800);}}
 function animate(now){if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=dt;while(acc>=1/240){game.step(1/240);acc-=1/240;}outcome();
 syncGuide(status,curlingGuide(game,t,pointer?.mode==='aim',spin.value));
 syncJunk(game.junk);
 chips.forEach((g,i)=>{const p=game.chips[i];g.visible=!!p||(game.phase==='ready'&&i===game.shots);g.position.set(p?p.x:0,0,p?p.z:7);g.rotation.y=p?p.angle:0;});
 arrow.visible=game.phase==='ready';arrow.setDirection(new THREE.Vector3(Math.sin(+aim.value),0,-Math.cos(+aim.value)));arrow.setLength(.6+(+power.value)*.3,.3,.16);
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 reset();resize();frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());arrow.line.geometry.dispose();arrow.line.material.dispose();arrow.cone.geometry.dispose();arrow.cone.material.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
