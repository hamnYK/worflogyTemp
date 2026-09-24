
import * as THREE from '../lib/three.module.min.js';

// Decorative objects stay outside the playable paper and share its GPU lifecycle.
export function addTerritoryDesk({eastern,scene,paperGroup,mesh,box,mat,finish}){
 const metal=mat(eastern?'#857354':'#bc9855',.3,.75),ink=mat('#161e20',.38),wood=mat(eastern?'#482b20':'#603725',.5);
 wood.bumpMap=finish.grain('wood');wood.bumpScale=.009;ink.clearcoat=.35;
 function rod(radius,length,material,x,y,z,angle=0,parent=scene){
  const o=mesh(new THREE.CylinderGeometry(radius*.92,radius,length,24),material,x,y,z,parent);
  o.rotation.x=Math.PI/2;o.rotation.z=angle;return o;
 }
 if(eastern){
  // Bamboo brush handles, cream hair and dark ink tips.
  for(const [x,z,angle]of [[6.8,.8,-.12],[7.45,1.35,.08]]){
   const g=new THREE.Group();scene.add(g);g.position.set(x,.18,z);g.rotation.y=angle;
   rod(.095,3.6,mat('#b58d4e',.66),0,0,0,0,g);
   for(const p of [-1.3,-.4,.55,1.4])rod(.104,.045,wood,0,0,p,0,g);
   const hair=mesh(new THREE.ConeGeometry(.14,.62,16),mat('#ddd3b9',.96),0,0,-2.06,g);hair.rotation.x=-Math.PI/2;
   const tip=mesh(new THREE.ConeGeometry(.06,.25,16),ink,0,0,-2.32,g);tip.rotation.x=-Math.PI/2;
   rod(.11,.13,ink,0,0,-1.76,0,g);
  }
  box(1.6,.18,2.3,mat('#373c38',.8),-7,.03,1.9);
  box(1.15,.025,1.6,ink,-7,.13,1.85);
  box(.42,.15,1.2,mat('#202725',.6),-7.1,.23,2.25);
  // Celadon brush rest and a small vermilion seal beside the inkstone.
  for(const x of [6.7,7,7.3])mesh(new THREE.SphereGeometry(.2,16,12),mat('#789b8c',.3),x,.07,2.8);
  const seal=box(.64,.6,.64,mat('#9b4838',.55),-7,.23,-1.8);seal.rotation.y=.15;
  box(.78,.09,.78,wood,-7,-.02,-1.8);
  // Scroll rollers and slim hardwood paperweights frame the sheet.
  for(const z of [-4.12,4.12]){
   const roller=rod(.12,12.8,wood,0,.12,z,0,paperGroup);roller.rotation.z=Math.PI/2;
   for(const x of [-6.5,6.5]){const cap=rod(.17,.22,metal,x,.12,z,0,paperGroup);cap.rotation.z=Math.PI/2;}
  }
  for(const x of [-5.92,5.92])box(.13,.06,7.65,wood,x,.11,0,paperGroup);
 }else{
  // A fountain-pen nib and feather quill, with a brass-rimmed ink bottle.
  const bottle=mesh(new THREE.CylinderGeometry(.5,.57,.55,32),mat('#20343b',.25),-7,.17,2.5);
  mesh(new THREE.TorusGeometry(.28,.08,8,24),metal,-7,.49,2.5).rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(.22,.22,.035,24),ink,-7,.49,2.5);
  const quill=new THREE.Group();scene.add(quill);quill.position.set(6.9,.2,.25);quill.rotation.y=-.15;
  rod(.035,4.8,metal,0,0,0,0,quill);
  const feather=mat('#e6dfc8',.93);feather.side=THREE.DoubleSide;feather.sheen=.3;
  feather.bumpMap=finish.grain('cloth');feather.bumpScale=.002;
  const vaneGeometry=new THREE.PlaneGeometry(.9,2.5,16,32),vanePos=vaneGeometry.attributes.position;
  for(let i=0;i<vanePos.count;i++){
   const u=(vanePos.getY(i)+1.25)/2.5,xx=vanePos.getX(i)*Math.pow(Math.sin(Math.PI*u),.65);
   vanePos.setXYZ(i,xx,.04+Math.sin(u*Math.PI)*.09+Math.abs(xx)*.08,vanePos.getY(i)+.35);
  }
  vaneGeometry.computeVertexNormals();mesh(vaneGeometry,feather,0,0,0,quill);
  for(let i=1;i<25;i++){const u=i/25,z=-.9+u*2.5,w=.43*Math.pow(Math.sin(Math.PI*u),.65);
   for(const sign of [-1,1]){const rib=box(w,.007,.01,feather,sign*w*.46,.065+Math.sin(u*Math.PI)*.09,z,quill);rib.rotation.y=sign*-.38;}
  }
  const nib=mesh(new THREE.ConeGeometry(.1,.42,4),metal,0,0,-2.52,quill);nib.rotation.x=-Math.PI/2;
  // Brass drafting compass and a wax seal on the desk.
  for(const sign of [-1,1]){const arm=box(.08,.07,2.6,metal,-7+sign*.3,.12,-1.3);arm.rotation.y=sign*.23;}
  mesh(new THREE.SphereGeometry(.15,12,8),metal,-7,.15,-2.57);
  mesh(new THREE.CylinderGeometry(.42,.46,.06,32),mat('#973d36',.7),6.95,.06,3.3);
  mesh(new THREE.TorusGeometry(.28,.025,6,24),metal,6.95,.105,3.3).rotation.x=Math.PI/2;
  for(const x of [-5.9,5.9])for(const z of [-3.95,3.95]){
   box(.65,.02,.055,metal,x+(x<0?.28:-.28),.1,z,paperGroup);
   box(.055,.02,.6,metal,x,.1,z+(z<0?.27:-.27),paperGroup);
  }
 }
}
