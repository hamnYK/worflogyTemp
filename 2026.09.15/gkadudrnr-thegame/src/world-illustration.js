import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const palettes=new WeakMap();

// Shared visual treatment for both campaigns, including hostile agents.
// Screen-space ink is applied only to the 3D render, never the interface.
export const IllustrationShader={
 uniforms:{tDiffuse:{value:null},resolution:{value:new T.Vector2(1,1)}},
 vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 resolution;varying vec2 vUv;
 float lum(vec2 p){return dot(texture2D(tDiffuse,p).rgb,vec3(.299,.587,.114));}
 void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 d=1./resolution;
 float gx=lum(vUv+vec2(d.x,0.))-lum(vUv-vec2(d.x,0.));
 float gy=lum(vUv+vec2(0.,d.y))-lum(vUv-vec2(0.,d.y));
 float edge=smoothstep(.09,.36,length(vec2(gx,gy)));
 vec3 ink=vec3(.075,.10,.14);c.rgb=mix(c.rgb,ink,edge*.32);
 gl_FragColor=c;}`
};

export function illustrateDistrict({group,faction,box,text,material,dark,white,steel}){
 if(!palettes.has(material))palettes.set(material,['#c9c4b2','#52627a','#8fabb7','#ae8e56'].map(c=>material(c)));
 const [stone,shadow,glass,gold]=palettes.get(material);
 const facade=(x,z,w,h)=>{
  box(w,h,1.1,stone,x,h/2-.5,z,group);
  box(w,.16,1.2,dark,x,h-.5,z,group);
  box(w+.15,.09,1.3,white,x,h-.38,z,group);
  // Broad recessed window ribbons, stone mullions and dark sills.
  for(let y=.5;y<h-1;y+=.9){
   box(w-.25,.54,.04,shadow,x,y,z+.565,group);
   box(w-.4,.36,.045,glass,x,y+.04,z+.592,group);
   box(w-.18,.07,.16,dark,x,y-.29,z+.63,group);
   for(let a=-w/2+.3;a<w/2;a+=.48)box(.035,.54,.065,white,x+a,y,z+.62,group);
  }
  for(const side of [-1,1])box(.13,h,.19,white,x+side*(w/2-.04),h/2-.5,z+.61,group);
 };
 if(faction==='ai'){
  // Civic infrastructure, rather than a row of unrelated grey blocks.
  facade(-1,-3.8,3.1,5.3);facade(3.2,-4.2,3.6,6.2);facade(8,-4.1,3.3,5.1);facade(12,-4,3,6.8);
  text('CIVIC / 07',2.5,.38,3.2,.25,-3.58,group,'#e9e0ca','#293b50');
  box(3.1,.15,1.3,dark,3.2,.6,-3.1,group);
  for(const x of [-.9,3.2,8,12]){box(.12,2.1,.12,dark,x,.65,-2.35,group);box(.62,.08,.33,white,x,1.73,-2.35,group);}
 }else{
  // Deep archive bays continue the architecture beyond the tactical cutaway.
  for(const x of [-.6,3.3,7.2,11.1]){
   box(3.65,2.9,.16,shadow,x,2.5,-3.3,group);
   for(const a of [-1.25,0,1.25]){box(.96,2.5,.05,dark,x+a,2.4,-3.19,group);for(let y=1.4;y<3.6;y+=.36)box(.74,.055,.055,steel,x+a,y,-3.15,group);}
   box(.19,4.3,.4,white,x-1.85,1.55,-3,group);
   box(3.8,.17,.45,white,x,3.85,-3,group);
  }
  text('MEMORY CONSERVATION',4.8,.42,5.5,4.05,-2.75,group,'#24384c','#e5dfca');
 }
 // Surrounding service apron makes the map part of a place, not a floating toy.
 box(19,.12,2.2,stone,6.5,-.58,-2.5,group);
 box(2,.12,15,stone,15.5,-.58,5,group);
 for(let x=-2;x<16;x+=1.5)box(.025,.012,2.1,shadow,x,-.51,-2.5,group);
 for(let z=-2;z<12;z+=1.5)box(1.9,.012,.025,shadow,15.5,-.51,z,group);
 for(const x of [-1,14]){box(.45,.24,.7,gold,x,-.38,12.15,group);box(.47,.035,.73,dark,x,-.25,12.15,group);}
 // Consolidate architecture into a few draws instead of hundreds of window parts.
 group.updateMatrixWorld(true);
 const batches=new Map(),sources=[],lines=[];
 group.traverse(o=>{
  if(o.isLineSegments){lines.push(o);return;}
  if(!o.isMesh||o.material.userData.ownedTexture)return;
  if(!batches.has(o.material))batches.set(o.material,[]);
  batches.get(o.material).push((o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));sources.push(o);
 });
 const lineGeos=lines.map(o=>o.geometry.clone().applyMatrix4(o.matrixWorld));
 for(const o of lines){o.removeFromParent();o.geometry.dispose();o.material.dispose();}
 for(const o of sources){o.removeFromParent();o.geometry.dispose();}
 for(const [mat,geos]of batches){const m=new T.Mesh(mergeGeometries(geos),mat);m.castShadow=true;m.receiveShadow=true;group.add(m);geos.forEach(g=>g.dispose());}
 if(lineGeos.length){group.add(new T.LineSegments(mergeGeometries(lineGeos),new T.LineBasicMaterial({color:'#283446',transparent:true,opacity:.65})));lineGeos.forEach(g=>g.dispose());}
}
