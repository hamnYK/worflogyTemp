import {pingPongGuide} from './game-guides.mjs';
import * as THREE from '../lib/three.module.min.js';
import {createPingDetails} from './ping-pong-details.mjs';
import {createArcadeFinish} from './arcade-finish.mjs';
import {ChalkboardPingPong,PING,SCRATCHES} from './chalkboard-ping-pong-rules.mjs';
export function mountChalkboardPingPong(host,{onExit,onWin,english=false}={}){
 const t=(ko,en)=>english?en:ko,game=new ChalkboardPingPong();
 host.innerHTML=`<div class="chip-game ping-game"><div class="chip-game-heading"><button class="wf-button chip-back">${t('게임 선택','Games')}</button><h2>CHALKBOARD PING PONG</h2><output class="chip-progress"></output></div><div class="chip-viewport"><canvas tabindex="0" aria-label="${t('칠판 지우개 탁구. 서브 전 드래그로 시야 이동, 위쪽 방향키로 서브. 마우스로 지우개 이동, 클릭 또는 Space로 타격, Shift와 함께 누르면 스매시.','Chalkboard ping pong. Drag to frame the table before serving with Arrow Up. Move with the mouse, click or Space to hit, Shift to smash.')}"></canvas><div class="chip-result" aria-hidden="true"></div><div class="chip-camera"><button data-camera="in" aria-label="${t('확대','Zoom in')}">+</button><button data-camera="out" aria-label="${t('축소','Zoom out')}">−</button><button data-camera="left" aria-label="${t('왼쪽 회전','Rotate left')}">↶</button><button data-camera="right" aria-label="${t('오른쪽 회전','Rotate right')}">↷</button><button data-camera="home">${t('기본 뷰','Reset view')}</button></div></div><div class="chip-controls"><span class="ping-rally"></span><button class="wf-button ping-hit">${t('타격','Hit')}</button><button class="wf-button ping-smash">${t('스매시 · Shift','Smash · Shift')}</button></div><p class="chip-status" role="status" aria-live="polite"></p></div>`;
 const root=host.firstElementChild,canvas=root.querySelector('canvas'),status=root.querySelector('.chip-status'),progress=root.querySelector('.chip-progress'),result=root.querySelector('.chip-result'),hitButton=root.querySelector('.ping-hit'),smashButton=root.querySelector('.ping-smash'),rally=root.querySelector('.ping-rally');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch{root.innerHTML='<p>'+t('3D 화면을 시작할 수 없습니다.','Unable to start 3D.')+'</p><button class="wf-button">BACK</button>';root.querySelector('button').onclick=onExit;return{dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#243945');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100),geos=new Set(),mats=new Set(),textures=new Set(),finish=createArcadeFinish(renderer,scene,geos,mats,textures);
 const material=o=>finish.material(o);
 function mesh(g,m,parent=scene,x=0,y=0,z=0){geos.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,parent=scene,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);}
 function texture(c){const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.add(tx);return tx;}
 scene.add(new THREE.HemisphereLight(0xd2eeff,0x5a4833,1.6));const sun=new THREE.DirectionalLight(0xffecd8,2.8);sun.position.set(-4,12,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:9,bottom:-9,near:.1,far:35});sun.shadow.normalBias=.008;scene.add(sun);
 const fill=new THREE.DirectionalLight(0x9abfda,1.2);fill.position.set(7,5,-6);scene.add(fill);
 const frameMat=material({color:'#445e65',roughness:.38,metalness:.65}),edgeMat=material({color:'#846043',roughness:.55}),floorMat=material({color:'#36434a',roughness:.9});
 box(25,.2,25,floorMat,scene,0,-6.3,0);
 const details=createPingDetails({THREE,scene,mesh,box,material,texture,finish});
 const deskTextures=[];
 for(const side of [1,-1]){
 const c=document.createElement('canvas');c.width=1024;c.height=768;const x=c.getContext('2d');x.fillStyle=side===1?'#b3833e':'#bd914b';x.fillRect(0,0,1024,768);
 let seed=side===1?31:47;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<1700;i++){const y=random()*768;x.strokeStyle=i%2?'#61412618':'#ffefca22';x.lineWidth=.5+random();x.beginPath();x.moveTo(0,y);for(let a=0;a<=1024;a+=32)x.lineTo(a,y+Math.sin(a*.011+y*.04)*2);x.stroke();}
 x.strokeStyle='#5c462c66';x.lineWidth=2;x.strokeRect(5,5,1014,758);
 const zStart=side===1?.04:-4;
 for(const patch of SCRATCHES.filter(p=>Math.sign(p.z)===side)){
 const px=(patch.x+2.6)/5.2*1024,py=(patch.z-zStart)/3.96*768,rx=patch.r/5.2*1024,ry=patch.r/3.96*768;
 x.save();x.translate(px,py);x.fillStyle='#5e432321';x.beginPath();x.ellipse(0,0,rx,ry,0,0,Math.PI*2);x.fill();
 x.strokeStyle='#624225';x.lineWidth=2.2;for(let j=-2;j<=2;j++){x.beginPath();x.moveTo(-rx*.8,j*ry*.22);x.lineTo(rx*.75,j*ry*.22+ry*.35);x.stroke();}
 x.strokeStyle='#f4d4a4';x.lineWidth=1;x.beginPath();x.moveTo(-rx*.8,-ry*.3);x.lineTo(rx*.8,ry*.4);x.stroke();x.restore();
 }
 x.fillStyle='#32454a99';x.font='italic 22px Georgia';x.fillText(side===1?'철수 ♡ 영희':'3학년 2반',60,680);
 const tx=texture(c);deskTextures.push(tx);const relief=details.deskRelief(side,SCRATCHES);const topMat=material({map:tx,bumpMap:relief,bumpScale:.024,roughnessMap:relief,roughness:.82,clearcoat:.24,clearcoatRoughness:.48});
 details.rounded(5.2,.17,3.96,.035,edgeMat,scene,0,-.095,side*2.02);
 details.deskWear(side);
 const top=mesh(new THREE.PlaneGeometry(5.2,3.96),topMat,scene,0,-.003,side*2.02);top.rotation.x=-Math.PI/2;top.castShadow=false;
 details.schoolDesk(side);
 }
 // An open notebook stands in the desk seam; pages and ruled paper form the net.
 const paperCanvas=document.createElement('canvas');paperCanvas.width=1024;paperCanvas.height=256;const px=paperCanvas.getContext('2d');px.fillStyle='#ece6d5';px.fillRect(0,0,1024,256);px.strokeStyle='#7594b450';px.lineWidth=1;
 for(let y=28;y<256;y+=22){px.beginPath();px.moveTo(0,y);px.lineTo(1024,y);px.stroke();}
 px.strokeStyle='#cf7c7755';for(const xx of [50,562]){px.beginPath();px.moveTo(xx,0);px.lineTo(xx,256);px.stroke();}
 px.fillStyle='#627482';px.font='italic 23px Georgia';px.fillText('AFTER HOURS',135,95);px.fillText('WORFLOGY',660,165);
 const pages=material({map:texture(paperCanvas),roughness:.9,bumpMap:finish.grain('paper'),bumpScale:.004}),cover=material({color:'#476e84',roughness:.75});
 details.notebook(pages,cover);
 const binding=material({color:'#b7afa0',roughness:.5,metalness:.4});
 const rackets=[0,1].map(i=>{
 const g=new THREE.Group();scene.add(g);
 const felt=material({map:details.eraserSurface(false),roughness:1,bumpMap:finish.grain('cloth'),bumpScale:.006});
 details.rounded(.92,.2,.42,.026,felt,g,0,-.09,0);
 const back=material({map:details.eraserSurface(true,i),bumpMap:finish.grain('cloth'),bumpScale:.0015,roughness:.98,clearcoat:0});details.rounded(.95,.11,.45,.024,back,g,0,.045,0);
 details.eraserWear(g);
 return g;
 });
 const ball=mesh(new THREE.SphereGeometry(PING.radius,32,24),material({color:'#fff7e6',roughness:.56,clearcoat:.1,bumpMap:finish.grain('paper'),bumpScale:.0006}));
 const seam=mesh(new THREE.TorusGeometry(PING.radius,.0015,5,48),material({color:'#cfbfa5',roughness:.6}),ball);seam.rotation.x=.6;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const sx=shadowCanvas.getContext('2d'),gr=sx.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'#17232b88');gr.addColorStop(1,'#17232b00');sx.fillStyle=gr;sx.fillRect(0,0,64,64);
 const shadow=mesh(new THREE.PlaneGeometry(.45,.45),material({map:texture(shadowCanvas),transparent:true,depthWrite:false}),scene);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 const readyRing=mesh(new THREE.TorusGeometry(.19,.015,6,40),material({color:'#ead58e',emissive:'#ead58e',emissiveIntensity:.3}));readyRing.castShadow=false;
 const defaultView={distance:11,azimuth:0,elevation:.5,target:[0,-.7,0]};
 let distance=defaultView.distance,azimuth=defaultView.azimuth,elevation=defaultView.elevation,disposed=false,frame,timer,last=performance.now(),acc=0,pointer=null,phase='',serveTime=0,notice='',noticeUntil=0;
 const target=new THREE.Vector3(...defaultView.target);
 function view(){const d=distance*Math.max(1,1.1/camera.aspect);camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d);camera.position.add(target).sub(new THREE.Vector3(0,.3,0));camera.lookAt(target);camera.updateMatrixWorld();}
 function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();view();}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);
 const keys=new Set();root.querySelector('.chip-back').onclick=onExit;
 function strike(smash=false){
 if(game.phase!=='rally')return;
 const ok=game.swing(0,smash);if(ok){notice='';noticeUntil=0;details.impact(game.ball,true);}if(!ok&&game.phase==='rally'){notice=smash?t('스매시는 내 쪽에서 튄 높은 공이 타격 범위에 왔을 때 가능합니다.','Smash when a high ball reaches your paddle after bouncing on your desk.'):t('공이 내 쪽에서 한 번 튄 뒤, 지우개 가까이 왔을 때 치세요.','Hit when the ball reaches your paddle after one bounce on your desk.');noticeUntil=game.time+.65;}
 }
 hitButton.onclick=()=>strike();smashButton.onclick=()=>strike(true);
 const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0));
 function track(e){const r=canvas.getBoundingClientRect();plane.constant=-game.paddles[0].y;ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const p=ray.ray.intersectPlane(plane,new THREE.Vector3());if(p)game.setPaddle(p.x,p.z);}
 canvas.oncontextmenu=e=>e.preventDefault();
 canvas.onpointermove=e=>{if(pointer?.mode==='orbit'){azimuth-=(e.clientX-pointer.x)*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-pointer.y)*.004,.5,1.15);pointer.x=e.clientX;pointer.y=e.clientY;view();}else if(pointer?.mode==='pan'){const scale=2*camera.position.distanceTo(target)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/canvas.clientHeight;const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);target.addScaledVector(right,-(e.clientX-pointer.x)*scale).addScaledVector(up,(e.clientY-pointer.y)*scale);target.x=THREE.MathUtils.clamp(target.x,-5,5);target.y=THREE.MathUtils.clamp(target.y,-3,4);target.z=THREE.MathUtils.clamp(target.z,-5,5);pointer.x=e.clientX;pointer.y=e.clientY;view();}else if(game.phase==='rally')track(e);};
 canvas.onpointerdown=e=>{canvas.focus({preventScroll:true});if(e.button===2){pointer={mode:'orbit',id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}else if(e.button===0){if(game.phase==='ready'){pointer={mode:'pan',id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);return;}if(game.phase!=='rally')return;track(e);if(e.pointerType==='touch'){pointer={mode:'touch',id:e.pointerId};canvas.setPointerCapture(e.pointerId);}else strike(e.shiftKey);}};
 canvas.onpointerup=e=>{if(pointer?.id===e.pointerId){if(pointer.mode==='touch')strike(e.shiftKey);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);pointer=null;}};
 canvas.onpointercancel=()=>pointer=null;
 root.onkeydown=e=>{
 if(game.phase==='ready'){
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
 if(e.key==='ArrowUp'&&!e.repeat){if(pointer){if(canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);pointer=null;}keys.clear();game.serve();details.impact(game.ball,true);canvas.focus({preventScroll:true});}
 return;
 }
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s'].includes(e.key)){e.preventDefault();keys.add(e.key);}
 if(e.key===' '){e.preventDefault();if(!e.repeat)strike(e.shiftKey);}
 };
 root.onkeyup=e=>keys.delete(e.key);canvas.onblur=()=>keys.clear();
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),11,25);view();},{passive:false});
 root.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const k=b.dataset.camera;if(k==='in')distance=Math.max(11,distance-2);if(k==='out')distance=Math.min(25,distance+2);if(k==='left')azimuth-=.2;if(k==='right')azimuth+=.2;if(k==='home'){distance=defaultView.distance;azimuth=defaultView.azimuth;elevation=defaultView.elevation;target.set(...defaultView.target);}view();});
 const reasons={net:t('공책 네트에 걸렸습니다.','The ball hit the notebook net.'),out:t('공이 받을 쪽 책상 밖에 떨어졌습니다.','The ball missed the receiving desk.'),double:t('공이 두 번 튀었습니다.','The ball bounced twice.'),miss:t('받을 쪽이 공을 놓쳤습니다.','The receiver missed the return.'),'own-side':t('공이 친 쪽 책상에 떨어졌습니다.','The shot landed on the hitter’s own desk.')};
 function animate(now){
 if(disposed)return;const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;acc+=dt;
 const p=game.paddles[0],dx=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),dz=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);
 if(game.phase==='rally'&&(dx||dz))game.setPaddle(p.x+dx*dt*4,p.z+dz*dt*4);
 while(acc>=1/240){const vy=game.v.y,hitter=game.lastHitter,rallyCount=game.rally;game.step(1/240);if(vy<0&&game.v.y>0&&game.phase==='rally')details.impact(game.ball,false);if(game.rally>rallyCount||game.lastHitter!==hitter)details.impact(game.ball,true);acc-=1/240;}
 if(phase!==game.phase){phase=game.phase;serveTime=0;notice='';if(phase==='point'||phase==='results'){
 const win=game.pointWinner===0;result.textContent=phase==='results'?(win?'VICTORY':'GOOD GAME'):(win?'+1':'RIVAL +1');result.classList.add('show');
 timer=setTimeout(()=>{if(disposed)return;if(game.phase==='results')onWin();else{game.prepare();result.className='chip-result';}},phase==='results'?3000:1400);
 }}
 
 root.dataset.phase=game.phase;root.dataset.score=game.scores.join('-');root.dataset.canHit=String(game.canHit(0)&&game.swings[0]===0);root.dataset.smash=String(game.smashReady&&game.swings[0]===0);
 progress.textContent=t('나 ','YOU ')+game.scores[0]+' : '+game.scores[1]+t(' 상대 · 5점 선승',' RIVAL · FIRST TO 5');
 rally.textContent=t('랠리 ','RALLY ')+game.rally+' · '+t('최고 ','BEST ')+game.bestRally;
 hitButton.disabled=game.phase!=='rally';smashButton.disabled=!game.smashReady||game.swings[0]>0;
 hitButton.classList.toggle('basket-catch-ready',game.canHit(0));
 let text;
 if(game.phase==='results')text=(game.pointWinner===0?t('5점 승리! ','You reached 5! '):t('상대가 5점을 먼저 얻었습니다. ','The rival reached 5 first. '))+t('3초 후 로비로 돌아갑니다.','Returning to the lobby in 3 seconds.');
 else if(game.phase==='point')text=(game.pointWinner===0?t('내 득점! ','Your point! '):t('상대 득점. ','Rival point. '))+reasons[game.reason];
 else text=pingPongGuide(game,t,{mode:pointer?.mode,notice,noticeUntil});
 if(status.textContent!==text)status.textContent=text;
 ball.position.set(game.ball.x,game.ball.y,game.ball.z);ball.rotation.x+=dt*3;ball.rotation.z+=dt;
 shadow.position.set(game.ball.x,.006,game.ball.z);shadow.visible=Math.abs(game.ball.x)<2.6&&Math.abs(game.ball.z)<4;shadow.scale.setScalar(1+game.ball.y*.22);shadow.material.opacity=Math.max(.18,.7-game.ball.y*.16);
 rackets.forEach((g,i)=>{const p=game.paddles[i],u=1-game.swings[i]/.18,stroke=game.swings[i]>0?Math.sin(u*Math.PI):0,side=i===0?1:-1;g.position.set(p.x,p.y+stroke*.05,p.z-side*stroke*.12);g.rotation.set(side*(1.0-stroke*.85),side*stroke*.08,-side*stroke*.06);});
 details.update(dt,game,camera);
 readyRing.position.copy(ball.position);readyRing.lookAt(camera.position);readyRing.visible=game.canHit(0)&&game.swings[0]===0;
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);
 }
 resize();canvas.focus({preventScroll:true});frame=requestAnimationFrame(animate);
 return{dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);ro.disconnect();finish.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
