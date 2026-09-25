import {facingVector,facingYaw} from './watch-direction.js';
import {updateRelayLabel,placeRelayLabel} from './relay-label.js';
import { combatVfx } from './combat-vfx.js';
import {updateStatusMarker} from './status-icon.js';
import { coverStance } from './cover-pose.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import RAPIER from '@dimforge/rapier3d-compat';
import { visible, detection } from './rules.js';
import { themeColor as color } from './theme.js';
import { createArt } from './art.js';
import {IllustrationShader} from './world-illustration.js';

export async function createScene(container,onCell,onUnitContext=()=>{}){
 await RAPIER.init();
 const scene=new THREE.Scene();scene.background=new THREE.Color(color('scene-bg'));scene.fog=new THREE.Fog(color('scene-bg'),34,80);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;container.append(renderer.domElement);
 const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.03).texture;scene.environmentIntensity=.65;env.dispose();pmrem.dispose();
 const camera=new THREE.OrthographicCamera(-10,10,10,-10,.1,120);camera.position.set(19,17,24);
 camera.zoom=1.12;camera.updateProjectionMatrix();
 const poses=new Map();
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(6.5,.1,5);controls.enableDamping=true;controls.minZoom=.65;controls.maxZoom=4;controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI*.43;controls.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.ROTATE};
 scene.add(new THREE.HemisphereLight('#fff7e5','#718092',.62));const sun=new THREE.DirectionalLight('#fff4da',1.85);sun.position.set(-4,16,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.035;Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,far:70});scene.add(sun);
 const rim=new THREE.DirectionalLight('#a6bcff',.45);rim.position.set(15,7,-5);scene.add(rim);const memoryLight=new THREE.PointLight('#a079ff',3,8);memoryLight.position.set(12,2,2);scene.add(memoryLight);
 const vfx=combatVfx(scene);
 const art=createArt(scene);art.environment();const terminal=art.terminal();
 const world=new RAPIER.World({x:0,y:-14,z:0});world.timestep=1/60;const floor=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(6.5,-.4,5.5));world.createCollider(RAPIER.ColliderDesc.cuboid(7.5,.3,6.5),floor);
 const composer=new EffectComposer(renderer),renderPass=new RenderPass(scene,camera),ao=new SSAOPass(scene,camera,1,1,12),fxaa=new ShaderPass(FXAAShader),ink=new OutlinePass(new THREE.Vector2(1,1),scene,camera);ink.visibleEdgeColor.set('#162330');ink.hiddenEdgeColor.set('#000000');ink.edgeStrength=3.1;ink.edgeThickness=1.25;ink.edgeGlow=0;ao.kernelRadius=.55;ao.minDistance=.002;ao.maxDistance=.045;composer.addPass(renderPass);composer.addPass(ao);composer.addPass(ink);composer.addPass(new OutputPass());const illustration=new ShaderPass(IllustrationShader);composer.addPass(illustration);composer.addPass(fxaa);
 let high=true,current=null;const actors=new Map(),covers=new Map(),bodies=new Map(),debris=[],fx=[],moves=new Map(),labels=new Map();
 const labelLayer=document.querySelector('#target-labels');
 function basic(hex,opacity=1){return new THREE.MeshBasicMaterial({color:hex,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:false});}
 function flat(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);scene.add(m);return m;}
 const extract=flat(new THREE.PlaneGeometry(1.94,11.94),basic('#427dff',.17),.5,-.045,5.5);
 const defenseMarkers=[3,8].map((z,i)=>{
  const mesh=flat(new THREE.RingGeometry(.52,.67,4),basic('#526aa8',.85),2,.07,z);mesh.rotation.z=Math.PI/4;mesh.visible=false;
  const label=document.createElement('div');label.className='world-label relay-label';label.hidden=true;
  const leader=document.createElement('div');leader.className='relay-leader';leader.hidden=true;leader.setAttribute('aria-hidden','true');
  labelLayer?.append(leader,label);return {mesh,label,leader,x:2,z};
 });
 const ring=flat(new THREE.RingGeometry(.41,.48,48),basic('#2162ff'),0,.03,0),hints=new THREE.Group();scene.add(hints);
 const watchSectors=[0,1,2,3].map(()=>{const mesh=flat(new THREE.RingGeometry(.55,1.5,24,1,-Math.PI/4,Math.PI/2),basic('#b48b48',.25),0,.05,0);mesh.visible=false;return mesh;});
 const hover=flat(new THREE.RingGeometry(.34,.39,4),basic('#1673ee',.65),0,.02,0);hover.rotation.z=Math.PI/4;hover.visible=false;
 function dispose(obj){obj.traverse(n=>{n.geometry?.dispose();if(n.material?.userData.ownedTexture){n.material.map?.dispose();n.material.dispose();art.materials.delete(n.material);}else if(n.material&&!art.materials.has(n.material))n.material.dispose();});obj.removeFromParent();}
 let stageFaction=null,stageArt=null;
 function sync(s){current=s;
  const activeIds=new Set(s.units.map(u=>u.id));for(const [id,g]of actors)if(!activeIds.has(id)){dispose(g);actors.delete(id);labels.get(id)?.remove();labels.delete(id);moves.delete(id);poses.delete(id);}
  const guards=s.units.filter(u=>u.team==='player');watchSectors.forEach((m,i)=>{const u=guards[i];m.visible=!!u?.watch&&u.hp>0;if(m.visible){const v=facingVector(u.watchFacing??u.facing??1);m.position.set(u.x,.05,u.z);m.rotation.z=Math.atan2(-v.z,v.x);}});
  defenseMarkers.forEach((m,i)=>{const n=s.defense?.nodes[i];m.mesh.visible=!!n;m.label.hidden=!n;m.leader.hidden=!n;if(n){updateRelayLabel(m.label,n);m.mesh.material.color.set(n.breach>=2?'#bc4558':n.breach?'#b47a34':'#526aa8');}});
  if(stageFaction!==s.faction){if(stageArt)dispose(stageArt);for(const a of actors.values())dispose(a);actors.clear();for(const l of labels.values())l.remove();labels.clear();moves.clear();poses.clear();stageArt=art.stage(s.faction);stageFaction=s.faction;for(const [id,g] of covers){dispose(g);world.removeRigidBody(bodies.get(id));}covers.clear();bodies.clear();}

  for(const c of s.cover){if(c.hp>0&&!covers.has(c.id)){const h=c.h===2?1.8:.8;const g=c.h===2?art.rack(c.x,c.z,h,String(c.x*10+c.z)):art.crate(c);covers.set(c.id,g);const b=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(c.x,h/2,c.z));world.createCollider(RAPIER.ColliderDesc.cuboid(.43,h/2,.43),b);bodies.set(c.id,b);}if(c.hp<=0&&covers.has(c.id)){dispose(covers.get(c.id));covers.delete(c.id);world.removeRigidBody(bodies.get(c.id));bodies.delete(c.id);}}
  for(const u of s.units){if(actors.has(u.id)&&actors.get(u.id).userData.role!==u.role){dispose(actors.get(u.id));actors.delete(u.id);labels.get(u.id)?.remove();labels.delete(u.id);}if(!actors.has(u.id)){actors.set(u.id,art.agent(u,s.faction));actors.get(u.id).rotation.y=facingYaw(u);const label=document.createElement('div');label.className='world-label';labelLayer?.append(label);labels.set(u.id,label);}const g=actors.get(u.id),detected=detection(s,u);g.visible=(u.hp>0||!!u.downed)&&detected!=='hidden';g.userData.downed=!!u.downed;g.userData.body.visible=detected==='identified';g.userData.base.visible=detected==='identified';g.userData.signal.visible=detected==='signal';const moving=moves.get(u.id);if(moving&&(moving.end.x!==u.x||moving.end.z!==u.z))moves.delete(u.id);if(!moves.has(u.id))g.position.set(u.x,0,u.z);g.userData.stance=coverStance(s,u);const facing=facingVector(u.facing??(u.team==='player'?1:3));g.userData.idleYaw=Math.atan2(facing.x,facing.z);const watching=facingVector(u.watchFacing??u.facing??1);g.userData.watchYaw=u.watch?Math.atan2(watching.x,watching.z):null;
    const label=labels.get(u.id);label.hidden=!g.visible;updateStatusMarker(label,u,detected,s.selected===u.id);
  }
  ink.selectedObjects=[...covers.values(),...actors.values()].filter(g=>g.visible&&(!g.userData.body||g.userData.body.visible));
  const u=s.units.find(a=>a.id===s.selected);ring.visible=!!u&&u.hp>0;if(u)ring.position.set(u.x,.03,u.z);terminal.visible=s.faction==='human'&&!s.carrier;extract.visible=s.faction==='human';
 }
 function highlight(cells){for(const c of [...hints.children])dispose(c);for(const c of cells){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),basic(c.color||color('scene-move'),.1));m.rotation.x=-Math.PI/2;m.position.set(c.x,-.038,c.z);hints.add(m);}}
 const aim=new THREE.Group();scene.add(aim);
 function preview(data){for(const child of [...aim.children])dispose(child);if(!data)return;
  for(const c of data.cells){const tile=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96),basic('#b079e2',.38));tile.rotation.x=-Math.PI/2;tile.position.set(c.x,.04,c.z);aim.add(tile);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(.96,.96)),basic('#8255af'));edge.rotation.x=-Math.PI/2;edge.position.copy(tile.position);aim.add(edge);}
  const a=new THREE.Vector3(data.from.x,1,data.from.z),b=new THREE.Vector3(data.target.x,.5,data.target.z);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineDashedMaterial({color:data.valid?'#285e89':'#a44d4d',dashSize:.18,gapSize:.12,transparent:true,opacity:.8}));line.computeLineDistances();aim.add(line);
 }
 function effects(list){for(const e of list){
  if(e.type==='move'){moves.set(e.id,{path:[e.from,...e.path],elapsed:0,duration:Math.max(.25,e.path.length*.16),end:e.path.at(-1)});}
  else if(e.type==='break'){for(let i=0;i<10;i++){const x=e.x+(Math.random()-.5)*.6,z=e.z+(Math.random()-.5)*.6,y=.3+Math.random()*e.h;const m=art.box(.12+Math.random()*.18,.14,.23,art.steel,x,y,z);const body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z).setLinearDamping(.5));world.createCollider(RAPIER.ColliderDesc.cuboid(.12,.07,.115).setRestitution(.25),body);body.applyImpulse({x:(Math.random()-.5)*.12,y:.09,z:(Math.random()-.5)*.12},true);debris.push({mesh:m,body,age:0});}}
  else if(e.type==='dissolve'){const actor=actors.get(e.id);if(actor?.visible){vfx.dissolve(e);moves.delete(e.id);}}
  else if(e.type==='shot'){if(e.visibleToPlayer===false)continue;const shooter=actors.get(e.from.id);if(shooter)poses.set(shooter.userData.id,{until:performance.now()+450,start:performance.now(),angle:Math.atan2(e.to.x-e.from.x,e.to.z-e.from.z)});vfx.beam(e.from,{...e.to,x:e.to.x+(e.hit?0:.45)});}
  else if(['blast','drone','scan'].includes(e.type)){const t=e.to||e.from;const m=flat(new THREE.RingGeometry(.9,1,48),basic(e.type==='scan'?'#269bcc':'#ac83e8',.8),t.x,.12,t.z);fx.push({mesh:m,life:1,max:1,expand:true});if(e.type!=='scan')vfx.plasma(t);if(e.type==='drone'){const d=new THREE.Group();scene.add(d);art.box(.28,.1,.2,art.dark,0,0,0,d);for(const x of [-.23,.23]){art.box(.23,.025,.06,art.steel,x,0,0,d);art.box(.14,.02,.25,art.cyan,x,.045,0,d);}fx.push({mesh:d,life:.8,max:.8,from:e.from,to:e.to});}}
 }}
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),point=new THREE.Vector3();
 function pick(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(plane,point)?{x:Math.round(point.x),z:Math.round(point.z)}:null;}
 let down=null;
 const canvas=renderer.domElement;
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 canvas.addEventListener('pointerdown',e=>{if(e.button===0||e.button===2)down={id:e.pointerId,button:e.button,x:e.clientX,y:e.clientY,dragged:false};});
 canvas.addEventListener('pointermove',e=>{
  if(down&&e.pointerId===down.id&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>=5){down.dragged=true;canvas.classList.add('dragging');}
  const p=pick(e);hover.visible=!down?.dragged&&!!p&&p.x>=0&&p.x<14&&p.z>=0&&p.z<12;if(p)hover.position.set(p.x,.02,p.z);
 });
 canvas.addEventListener('pointerup',e=>{
  if(!down||e.pointerId!==down.id)return;
  const click=!down.dragged&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5;
  down=null;canvas.classList.remove('dragging');
  if(click){const p=pick(e);if(e.button===2){
   const hit=ray.intersectObjects([...actors.values()].filter(g=>g.visible),true).find(h=>h.object.visible&&h.object.material?.visible!==false);
   let node=hit?.object;while(node&&!node.userData.id)node=node.parent;
   const id=node?.userData.id||current?.units.find(u=>u.x===p?.x&&u.z===p?.z&&u.hp>0)?.id;
   if(id)onUnitContext(id,e.clientX,e.clientY);
  }else if(p)onCell(p.x,p.z);}
 });
 const cancel=()=>{down=null;canvas.classList.remove('dragging');hover.visible=false;};
 canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);window.addEventListener('blur',cancel);
 canvas.addEventListener('pointerleave',()=>hover.visible=false);

 const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);composer.setSize(w,h);illustration.uniforms.resolution.value.set(w*renderer.getPixelRatio(),h*renderer.getPixelRatio());fxaa.material.uniforms.resolution.value.set(1/(w*renderer.getPixelRatio()),1/(h*renderer.getPixelRatio()));camera.left=-10*w/h;camera.right=10*w/h;camera.top=10;camera.bottom=-10;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(container);resize();
 let last=performance.now(),accum=0;function frame(now){const dt=Math.min(.08,(now-last)/1000);last=now;vfx.update(dt);accum+=dt;while(accum>=1/60){world.step();accum-=1/60;}
  for(const [id,a] of moves){a.elapsed+=dt;const unit=actors.get(id);if(!unit)continue;const f=Math.min(1,a.elapsed/a.duration)*(a.path.length-1),i=Math.min(a.path.length-2,Math.floor(f)),t=f-i,p=a.path[i],q=a.path[i+1];unit.position.set(THREE.MathUtils.lerp(p.x,q.x,t),0,THREE.MathUtils.lerp(p.z,q.z,t));unit.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);unit.userData.body.position.x=0;unit.userData.body.position.z=0;unit.userData.body.rotation.set(0,0,0);unit.userData.knees.forEach(k=>k.rotation.x=0);unit.userData.gun.rotation.x=0;unit.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(now*.022+j*Math.PI)*.45);unit.userData.body.position.y=Math.abs(Math.sin(now*.022))*.025;if(a.elapsed>=a.duration){moves.delete(id);unit.userData.legs.forEach(l=>l.rotation.x=0);unit.userData.body.position.y=0;}}
  for(const [id,g]of actors){if(moves.has(id))continue;
   const d=g.userData;if(d.downed){d.body.rotation.z=THREE.MathUtils.lerp(d.body.rotation.z,Math.PI/2,.16);d.body.position.y=THREE.MathUtils.lerp(d.body.position.y,.18,.16);d.body.position.x=THREE.MathUtils.lerp(d.body.position.x,.5,.16);continue;}const pose=poses.get(id),firing=pose&&now<pose.until,stance=d.stance,low=stance?.kind==='crouch'&&!firing,wall=stance?.kind==='wall'&&!firing;
   const mix=1-Math.exp(-dt*12),blend=(obj,key,value)=>obj[key]=THREE.MathUtils.lerp(obj[key],value,mix);
   const yaw=firing?pose.angle:d.watchYaw??d.idleYaw;
   g.rotation.y+=Math.atan2(Math.sin(yaw-g.rotation.y),Math.cos(yaw-g.rotation.y))*mix;
   blend(d.body.position,'y',low?-.29:wall?-.05:0);
   blend(d.body.position,'x',wall?-.14:0);blend(d.body.position,'z',low?.1:0);
   blend(d.body.rotation,'x',low?.16:firing?-.045:0);blend(d.body.rotation,'z',wall?-.1:0);
   d.legs.forEach((leg,j)=>{blend(leg.rotation,'x',low?-.95:wall?(j===0?-.16:.16):0);blend(d.knees[j].rotation,'x',low?1.7:wall?.18:0);});
   d.arms.forEach(arm=>{blend(arm.upper.rotation,'x',wall?-1.05:low?-.85:-.55);blend(arm.lower.rotation,'x',wall?-1.5:low?-1.25:-1.1);});
   blend(d.gun.rotation,'x',wall?-1.05:low?-.6:0);
   blend(d.gun.position,'y',wall?1.12:low?1.05:.98);
   blend(d.gun.position,'z',wall?.22:firing?.35-Math.max(0,1-(now-pose.start)/180)*.09:.35);
   if(!firing)poses.delete(id);
  }
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.age+=dt;d.mesh.position.copy(d.body.translation());d.mesh.quaternion.copy(d.body.rotation());if(d.age>5){world.removeRigidBody(d.body);dispose(d.mesh);debris.splice(i,1);}}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt;if(f.to){const t=1-f.life/f.max;f.mesh.position.set(THREE.MathUtils.lerp(f.from.x,f.to.x,t),1+Math.sin(t*Math.PI)*2,THREE.MathUtils.lerp(f.from.z,f.to.z,t));}else{f.mesh.material.opacity=Math.max(0,f.life/f.max);if(f.expand)f.mesh.scale.setScalar(1+(1-f.life/f.max)*2);}if(f.life<=0){dispose(f.mesh);fx.splice(i,1);}}
  terminal.userData.core.rotation.y=now*.0006;terminal.userData.core.position.y=1.13+Math.sin(now*.002)*.06;ring.material.opacity=.75+Math.sin(now*.004)*.2;
  controls.update();camera.updateMatrixWorld();for(const [id,label]of labels){const g=actors.get(id);if(label.hidden)continue;const p=new THREE.Vector3(g.position.x,1.92,g.position.z).project(camera);label.style.transform=`translate(-50%,-100%) translate(${(p.x+1)/2*container.clientWidth}px,${(1-p.y)/2*container.clientHeight}px)`;label.style.visibility=p.z>1?'hidden':'visible';}
  if(defenseMarkers.some(m=>!m.label.hidden)){
   const bounds={w:container.clientWidth,h:container.clientHeight};
   const project=(x,y,z)=>{const p=new THREE.Vector3(x,y,z).project(camera);return {x:(p.x+1)/2*bounds.w,y:(1-p.y)/2*bounds.h,z:p.z};};
   const obstacles=[];
   const viewportRect=container.getBoundingClientRect();
   for(const tag of document.querySelectorAll('.map-top .map-tag')){const r=tag.getBoundingClientRect();obstacles.push({x:r.left-viewportRect.left-8,y:r.top-viewportRect.top-8,w:r.width+16,h:r.height+16});}
   for(const g of actors.values())if(g.visible){
    const points=[];for(const dx of [-.55,.55])for(const dz of [-.55,.55])for(const y of [0,2.3])points.push(project(g.position.x+dx,y,g.position.z+dz));
    const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));
    obstacles.push({x:x-5,y:y-5,w:Math.max(...points.map(p=>p.x))-x+10,h:Math.max(...points.map(p=>p.y))-y+10});
   }
   for(const m of defenseMarkers){if(m.label.hidden)continue;
    const p=project(m.x,.08,m.z),visible=p.z>=-1&&p.z<=1&&p.x>=0&&p.x<=bounds.w&&p.y>=48&&p.y<=bounds.h-48;
    m.label.style.visibility=m.leader.style.visibility=visible?'visible':'hidden';if(!visible)continue;
    const air=project(m.x,3.2,m.z);
    const rect=placeRelayLabel(p,m.label.offsetWidth,m.label.offsetHeight,bounds,obstacles,p.y-air.y);
    if(!rect){m.label.style.visibility=m.leader.style.visibility='hidden';continue;}
    obstacles.push({...rect,x:rect.x-8,y:rect.y-8,w:rect.w+16,h:rect.h+16});
    m.label.style.transform=`translate(${rect.x}px,${rect.y}px)`;
    const end={x:p.x,y:rect.y+rect.h};
    m.leader.style.width=`${Math.hypot(end.x-p.x,end.y-p.y)}px`;m.leader.style.transform=`translate(${p.x}px,${p.y}px) rotate(${Math.atan2(end.y-p.y,end.x-p.x)}rad)`;
   }
  }
  composer.render();requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
 return {sync,effects,highlight,preview,resetCamera:()=>{camera.zoom=1.12;camera.updateProjectionMatrix();camera.position.set(19,17,24);controls.target.set(6.5,.1,5);},setQuality:()=>{high=!high;ao.enabled=high;renderer.setPixelRatio(high?Math.min(devicePixelRatio,1.5):1);composer.setPixelRatio(renderer.getPixelRatio());resize();return high;},project:(x,z)=>{const p=new THREE.Vector3(x,0,z).project(camera);return {x:(p.x+1)/2*container.clientWidth,y:(1-p.y)/2*container.clientHeight};},get physicalBodies(){return world.bodies.len();}};
}


