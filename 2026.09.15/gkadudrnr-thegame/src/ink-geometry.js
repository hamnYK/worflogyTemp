import * as T from 'three';

// Cut cloth and armour from shaped volumes, rather than stacked cuboids.
export function tailoredVolume(w,h,d,taper=.72,flare=0){
 const geo=new T.BoxGeometry(w,h,d);
 const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const top=p.getY(i)>0;
  p.setX(i,p.getX(i)*(top?taper:1));
  p.setZ(i,p.getZ(i)*(top?.82:1)+(top?0:flare));
 }
 geo.computeVertexNormals();return geo;
}

export function cutPanel(points,depth=.025){
 const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});geo.computeVertexNormals();return geo;
}

export function enamelTexture(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 x.fillStyle='#ffffff';x.fillRect(0,0,256,256);
 x.strokeStyle='#8b9090';x.lineWidth=1.4;
 x.beginPath();x.moveTo(11,34);x.lineTo(11,12);x.lineTo(39,12);x.moveTo(217,244);x.lineTo(245,244);x.lineTo(245,221);x.stroke();
 x.strokeStyle='#b3b3aa';x.lineWidth=1;
 for(const [a,b,l] of [[18,68,19],[233,172,12],[24,228,25],[184,17,14]]){x.beginPath();x.moveTo(a,b);x.lineTo(a+l,b-3);x.stroke();}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
