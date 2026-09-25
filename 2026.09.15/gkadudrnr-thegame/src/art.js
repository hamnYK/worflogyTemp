import * as T from 'three';
import {tailoredVolume,cutPanel,enamelTexture} from './ink-geometry.js';
import {illustrateDistrict} from './world-illustration.js';

import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Original, code-built environment and characters. No third-party game assets.
export function createArt(scene) {
  const materials = new Set();
  const bands=new T.DataTexture(new Uint8Array([45,116,218]),3,1,T.RedFormat);bands.minFilter=T.NearestFilter;bands.magFilter=T.NearestFilter;bands.needsUpdate=true;
  const material=(color,metalness=.3,roughness=.5,emissive=null)=>{
    const m=new T.MeshToonMaterial({color,gradientMap:bands,...(emissive?{emissive,emissiveIntensity:.35}: {})});materials.add(m);return m;
  };
  const white=material('#e5dfca',.55,.35),steel=material('#7b8997',.7,.38),dark=material('#344252',.65,.43),black=material('#17202d',.35,.65),cyan=material('#779eaa',.4,.25,'#167fac'),blue=material('#455d7b',.5,.35),purple=material('#9a86ad',.4,.22,'#8055d6'),red=material('#796586',.3,.4),rubber=material('#28313d',.05,.85);
  const enamel=enamelTexture();white.map=enamel;steel.map=enamel;
  const skin=material('#c6a98a'),hair=material('#20262d'),coatShade=material('#283647'),violetShade=material('#3c3347');
  const meshes=[];let collect=true;
  function mesh(geo,mat,x,y,z,parent=scene){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(collect)meshes.push(m);return m;}
  function box(w,h,d,mat,x,y,z,parent=scene,bevel=.025){const m=mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);if(!collect&&w>.25&&h>.16&&d>.15){const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),new T.LineBasicMaterial({color:'#283446',transparent:true,opacity:.8}));m.add(edge);}return m;}
  function cylinder(r,h,mat,x,y,z,parent=scene){return mesh(new T.CylinderGeometry(r,r,h,12),mat,x,y,z,parent);}
  function text(label,w,h,x,y,z,parent=scene,fg='#bcecff',bg='#21334d'){
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.font='bold 46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,68);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map:tex});mat.userData.ownedTexture=true;materials.add(mat);return mesh(new T.PlaneGeometry(w,h),mat,x,y,z,parent);
  }
  function tube(points,r,mat,parent=scene){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,6,false),mat,0,0,0,parent);}
  function rack(x,z,height=1.8,id='07',parent=scene){
    const g=new T.Group();g.position.set(x,0,z);parent.add(g);
    box(.88,height,.88,steel,0,height/2,0,g);
    box(.76,height-.14,.055,black,0,height/2,.45,g);
    box(.055,height,.96,white,-.43,height/2,0,g);box(.055,height,.96,white,.43,height/2,0,g);
    for(let i=0;i<Math.floor((height-.3)/.22);i++){
      const y=.23+i*.22;box(.64,.17,.045,dark,0,y,.49,g);
      for(let j=0;j<5;j++)box(.06,.012,.015,steel,-.21+j*.095,y+.025,.521,g,0);
      box(.035,.028,.02,i%3===0?purple:cyan,.28,y,.523,g,0);
      box(.055,.04,.045,white,-.32,y,.51,g);
    }
    box(.94,.09,.96,white,0,height+.02,0,g);
    text(`NODE ${id}`,.57,.13,0,height-.11,.5,g);
    const vent=box(.5,.02,.56,dark,0,height+.07,0,g);
    for(let i=0;i<5;i++)box(.52,.012,.02,steel,0,height+.085,-.2+i*.1,g,0);
    tube([[-.34,.2,-.46],[-.4,height*.55,-.49],[-.22,height-.1,-.48]],.022,cyan,g);
    return g;
  }
  function crate(c){const g=new T.Group();g.position.set(c.x,0,c.z);scene.add(g);box(.84,.7,.84,steel,0,.39,0,g);box(.91,.08,.9,white,0,.8,0,g);box(.88,.1,.88,dark,0,.09,0,g);for(const x of [-.33,.33])box(.075,.76,.92,white,x,.43,0,g);box(.44,.2,.035,dark,0,.52,.44,g);box(.28,.035,.04,cyan,0,.53,.464,g);text('DATA',.36,.09,0,.29,.451,g);return g;}
  function agent(unit,faction='human'){
    const g=new T.Group(),body=new T.Group();g.add(body);scene.add(g);
    const identity=unit.team==='player'?faction:(faction==='human'?'ai':'human');
    const role=unit.role,coat=identity==='human'?blue:red,cloth=role===4?white:coat;
    const ink=new T.MeshBasicMaterial({color:'#141b27',side:T.BackSide});materials.add(ink);
    function form(geo,mat,x,y,z,parent=body){const m=mesh(geo,mat,x,y,z,parent);const outline=new T.Mesh(geo.clone(),ink);outline.scale.setScalar(1.06);m.add(outline);return m;}
    const panel=(w,h,d,mat,x,y,z,parent=body)=>form(tailoredVolume(w,h,d,.88),mat,x,y,z,parent);
    const cut=(points,mat,x,y,z,parent=body)=>form(cutPanel(points),mat,x,y,z,parent);
    const shade=identity==='human'?coatShade:violetShade;
    // Adult proportions: compact angular head, longer legs and a broad coat silhouette.
    const heavy=role===2,w=heavy?.52:.39;
    panel(.28,.17,.24,dark,0,.73,0);
    form(tailoredVolume(w,.49,.3,1.18),cloth,0,1.05,0);
    panel(w*.73,.24,.045,heavy?white:cloth,0,1.1,.19);
    panel(.3,.07,.29,black,0,.82,0);
    for(const x of [-.12,.12])panel(.08,.12,.07,dark,x,.87,.19);
    if([0,3,4,6].includes(role)){
      for(const side of [-1,1]){
       const tail=form(tailoredVolume(.27,.57,.24,.64,-.065),cloth,side*.14,.59,-.055);tail.rotation.z=side*.11;
       cut([[0,.22],[side*.11,.14],[side*.16,-.26],[side*.025,-.2]],shade,side*.12,.63,.077);
       cut([[0,.16],[side*.14,.25],[side*.1,-.09],[-side*.03,-.17]],cloth,side*.1,1.25,.14);
       cut([[0,.12],[side*.065,.16],[side*.03,-.09]],white,side*.1,1.25,.175);
      }
    }
    panel(.11,.08,.12,dark,0,1.34,0);
    const unmasked=role===4||role===5||(role===6&&identity==='human');
    const head=form(new T.IcosahedronGeometry(.165,1),unmasked?skin:coat,0,1.51,0);head.scale.set(.8,1.1,.85);
    if(unmasked){const cap=form(new T.IcosahedronGeometry(.15,0),hair,0,1.62,-.035);cap.scale.set(1,.65,1);}
    else cut([[-.105,.08],[.105,.08],[.065,-.07],[0,-.14],[-.065,-.07]],white,0,1.48,.128);
    panel(.235,.085,.06,black,0,1.54,.125);
    panel(.16,.022,.02,identity==='human'?steel:white,0,1.55,.159);
    if(role===0){const hood=form(new T.IcosahedronGeometry(.235,0),coat,0,1.57,-.08);hood.scale.set(.9,1.25,.9);cut([[-.15,.12],[.03,.2],[.155,.08],[.1,-.16],[-.09,-.2]],black,0,1.5,.145);cut([[-.12,.11],[.12,.08],[.09,.045],[-.105,.07]],white,0,1.5,.176);}
    if(role===5){panel(.29,.055,.3,coat,0,1.67,.03);panel(.28,.04,.17,coat,0,1.65,.16);}
    if(role===6)for(const x of [-.19,.19]){panel(.065,.16,.13,dark,x,1.51,0);panel(.018,.28,.018,steel,x,1.7,-.04);}
    const legs=[],knees=[],arms=[];
    for(const side of [-1,1]){
      const leg=new T.Group();leg.position.set(side*.115,.72,0);body.add(leg);legs.push(leg);
      form(new T.CylinderGeometry(.085,.065,.3,5),shade,0,-.15,0,leg);
      const knee=new T.Group();knee.position.y=-.3;leg.add(knee);knees.push(knee);
      panel(.155,.12,.19,coat,0,-.01,.025,knee);form(new T.CylinderGeometry(.068,.055,.25,5),shade,0,-.19,0,knee);panel(.17,.12,.28,black,0,-.35,.065,knee);
      const shoulder=panel(heavy?.24:.17,.19,.24,(heavy||role===1)?white:cloth,side*(w*.5+.07),1.21,0);shoulder.rotation.z=side*.18;
      const arm=panel(.135,.29,.15,cloth,side*.27,1.035,.06);arm.rotation.x=-.55;
      const forearm=panel(.12,.25,.13,dark,side*.26,.94,.22);forearm.rotation.x=-1.1;arms.push({upper:arm,lower:forearm});
      panel(.13,.09,.12,black,side*.25,.96,.35);
      cut([[0,.09],[side*.09,.015],[side*.045,-.1]],shade,side*(w*.5+.06),1.18,.135);
    }
    // Harness, asymmetric lapel and seam blocks echo the approved portraits.
    const strap=panel(.045,.43,.03,black,-.11,1.07,.205);strap.rotation.z=-.22;
    panel(.064,.06,.034,steel,-.13,1.19,.227);
    for(const y of [.95,1.04,1.13])panel(.025,.025,.025,white,.085,y,.22);
    cut([[-.14,.13],[.035,.09],[.14,-.12],[-.055,-.06]],shade,0,1.06,.211);
    panel(heavy?.4:.27,role===5?.44:.3,.16,dark,0,1.08,-.24);
    if(role===5){for(const x of [-.14,.14]){panel(.055,.55,.08,steel,x,1.16,-.35);panel(.12,.12,.07,white,x,1.36,-.35);}form(new T.ConeGeometry(.085,.32,5),hair,0,1.45,-.2).rotation.x=-.4;}
    if(role===4){panel(.27,.24,.12,cyan,-.22,.8,-.1);panel(.025,.12,.14,white,-.365,.8,-.1);}
    if(role===6)panel(.18,.03,.2,purple,-.25,1.02,.33);
    const gun=new T.Group();gun.position.set(.19,.98,.35);body.add(gun);
    panel(heavy?.2:.11,heavy?.18:.12,role===1?.35:.42,black,0,0,.1,gun);
    panel(.07,.12,.12,dark,0,-.1,.03,gun);
    panel(.095,.035,.3,white,0,.07,.12,gun);
    for(const z of [.08,.15,.22])panel(.12,.022,.025,steel,0,.024,z,gun);
    const length=role===3?.57:role===1?.22:.28;
    panel(heavy?.13:.05,.05,length,steel,0,.01,.3+length/2,gun);
    if(role===3){panel(.07,.06,.25,black,0,.11,.14,gun);panel(.04,.045,.015,cyan,0,.11,.275,gun);}
    if(heavy){panel(.2,.22,.22,dark,0,-.14,.12,gun);for(const x of [-.13,0,.13])panel(.055,.15,.065,white,x,1.12,.235);}
    const base=mesh(new T.RingGeometry(.31,.35,32),new T.MeshBasicMaterial({color:unit.team==='player'?'#326fff':'#d15769',side:T.DoubleSide,transparent:true,opacity:.8}),0,.015,0,g);materials.add(base.material);base.rotation.x=-Math.PI/2;
    const signal=new T.Group();g.add(signal);signal.visible=false;
    const signalMaterial=new T.MeshBasicMaterial({color:'#738a9c',transparent:true,opacity:.32,depthTest:false,depthWrite:false});materials.add(signalMaterial);
    const shape=(geo,x,y,z)=>{const m=new T.Mesh(geo,signalMaterial);m.position.set(x,y,z);m.renderOrder=20;signal.add(m);};
    shape(new T.SphereGeometry(.14,8,6),0,1.4,0);
    shape(new T.CylinderGeometry(.2,.15,.52,6),0,1.02,0);
    for(const side of [-1,1]){shape(new T.CylinderGeometry(.075,.065,.58,5),side*.1,.46,0);shape(new T.CylinderGeometry(.065,.055,.5,5),side*.255,.96,0);}
    g.userData={id:unit.id,role,identity,body,legs,knees,arms,gun,base,signal};return g;
  }
  function environment(){
    const floorCanvas=document.createElement('canvas');floorCanvas.width=floorCanvas.height=256;const ctx=floorCanvas.getContext('2d');ctx.fillStyle='#c6c6b9';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#727c83';ctx.lineWidth=2;ctx.strokeRect(3,3,250,250);ctx.fillStyle='#727c83';for(const [x,y] of [[12,12],[244,12],[12,244],[244,244]]){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ddd9c9';ctx.fillRect(24,24,208,4);
    ctx.strokeStyle='#9a9e97';ctx.lineWidth=1;
    for(const [x,y,l] of [[20,39,35],[185,230,42],[31,210,16]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y-7);ctx.stroke();}
    ctx.fillStyle='#adafa5';ctx.beginPath();ctx.moveTo(4,253);ctx.lineTo(4,229);ctx.lineTo(28,253);ctx.fill();
    const texture=new T.CanvasTexture(floorCanvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;const tile=new T.MeshToonMaterial({map:texture,gradientMap:bands});materials.add(tile);
    box(16,.5,14,dark,6.5,-.46,5.5);
    for(let x=0;x<14;x++)for(let z=0;z<12;z++)box(.988,.1,.988,tile,x,-.11,z,scene,.008);
    for(const x of [-.7,13.7]){box(.18,.22,12.6,white,x,-.12,5.5);box(.045,.025,12.6,cyan,x,.01,5.5);}
    for(const z of [-.7,11.7]){box(14.5,.22,.18,white,6.5,-.12,z);box(14.5,.025,.045,cyan,6.5,.01,z);}
    // Perimeter set dressing stays outside playable cells and never adds hidden blockers.
    for(let x=0;x<14;x+=2){rack(x,-1.5,2.25,`${x+10}`);}
    for(let z=1;z<12;z+=2){const g=rack(14.6,z,2.15,`B${z}`);g.rotation.y=-Math.PI/2;}
    box(16,.8,.22,white,6.5,.05,-2.2);box(.22,.8,14,white,15.25,.05,5);
    for(const z of [-2,12.3])for(let x=-.2;x<14.8;x+=3){box(.18,.65,.2,steel,x,.05,z);}
    tube([[-1,-.2,-1],[-1,-.2,10],[1,-.2,12.3],[13,-.2,12.3]],.055,blue);
    tube([[14.5,.2,-1],[14.5,.2,8],[13.8,.2,12.3]],.05,purple);
    for(let x=4;x<11;x+=3){box(.35,.015,11.7,dark,x,-.05,5.5);for(let z=0;z<12;z+=.5)box(.29,.02,.035,steel,x,-.035,z);}
    const floorSign=text('07 / MEMORY EXCHANGE',3,.5,6.2,-.03,10.9,scene,'#526d9c','#d6e2f4');floorSign.rotation.x=-Math.PI/2;
    const ground=mesh(new T.PlaneGeometry(200,200),material('#e5e1d5',0,1),6,-.77,5);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
    scene.updateMatrixWorld(true);const batches=new Map();for(const m of meshes){const key=m.material.uuid+String(m.castShadow);if(!batches.has(key))batches.set(key,{material:m.material,shadow:m.castShadow,geometries:[]});batches.get(key).geometries.push((m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld));m.removeFromParent();m.geometry.dispose();}
    for(const b of batches.values()){const g=mergeGeometries(b.geometries);b.geometries.forEach(x=>x.dispose());const m=new T.Mesh(g,b.material);m.castShadow=b.shadow;m.receiveShadow=true;scene.add(m);if(b.material!==tile){const lines=new T.LineSegments(new T.EdgesGeometry(g,35),new T.LineBasicMaterial({color:'#28313d',transparent:true,opacity:.35}));scene.add(lines);}}meshes.length=0;collect=false;
  }
  function terminal(){const g=new T.Group();g.position.set(12,0,2);scene.add(g);cylinder(.42,.15,dark,0,.09,0,g);box(.48,.68,.48,white,0,.47,0,g);box(.53,.06,.54,steel,0,.83,0,g);const core=mesh(new T.OctahedronGeometry(.24),purple,0,1.13,0,g);g.userData.core=core;for(let i=0;i<3;i++){const m=mesh(new T.TorusGeometry(.31,.012,6,32),cyan,0,.92+i*.15,0,g);m.rotation.x=Math.PI/2;}text('MEMORY',.62,.14,0,.62,.25,g,'#d7bdff');return g;}
  function stage(faction){
    const g=new T.Group();scene.add(g);
    illustrateDistrict({group:g,faction,box,text,material,dark,white,steel});
    if(faction==='human'){
      box(16,3.3,.18,white,6.5,1.1,-2.3,g);box(.18,3.3,14,white,15.35,1.1,5,g);
      for(let x=-.5;x<15;x+=3){box(.16,3.5,.3,dark,x,1.1,-2.12,g);box(2.35,.65,.04,steel,x+1.4,1.9,-2.18,g);}
      text('ARCHIVE / RESTRICTED',4,.5,7.5,2.25,-2.02,g,'#263247','#e9e5d9');
      for(const x of [1,7,13]){box(2.3,.06,.09,black,x,2.55,-2.02,g);box(1.8,.035,.11,white,x,2.51,-1.98,g);}
      text('07',1.15,.8,12.4,1.75,-2.01,g,'#334457','#ded9c5');
      // Wall seams and service conduits remain outside the playable grid.
      for(const x of [2.4,5.4,8.4,11.4])box(.025,2.8,.035,dark,x,1,-2.19,g);
      for(const y of [.35,.48])tube([[-.8,y,-2.03],[4,y,-2.03],[4.4,y+.3,-2.03],[14.5,y+.3,-2.03]],.028,steel,g);
    }else{
      // Street markings are purely visual. All blocking cover is in the rules map.
      for(const x of [6,8])box(.06,.012,11.5,white,x,-.043,5.5,g,0);
      for(let z=0;z<12;z+=2)box(.09,.013,.8,white,7,-.042,z,g,0);
      for(let x=4;x<=10;x++)box(.6,.013,.18,white,x,-.04,10.7,g,0);
      for(const [x,z,w,h]of [[15.7,2,1,4.2],[15.7,8,1,5]]){
        box(w,h,1.3,steel,x,h/2-.5,z,g);box(w+.12,.13,1.4,white,x,h-.45,z,g);
        for(let y=.4;y<h-.6;y+=.65)for(let k=-w/2+.3;k<w/2;k+=.5)box(.24,.3,.03,dark,x+k,y,z+.67,g,0);
      }
      const sign=text('CIVIL NETWORK / EVACUATION',3.5,.42,7,-.035,8.9,g,'#4f3e65','#d5cadf');sign.rotation.x=-Math.PI/2;
    }
    return g;
  }
  return {environment,stage,rack,crate,agent,terminal,materials,box,material,steel,cyan,white,dark,purple};
}

