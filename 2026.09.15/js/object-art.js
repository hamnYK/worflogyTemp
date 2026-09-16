/* Shared, text-free vector miniatures for the ontology worlds.
   All geometry is local to an object, so dragging, zoom and story state stay independent. */
(function(){
"use strict";
const C={ink:window.WorfTheme.ink,dark:window.WorfTheme.dark,green:window.WorfTheme.accent,mint:window.WorfTheme.highlight,pale:window.WorfTheme.pale,
 blue:window.WorfTheme.secondary,navy:window.WorfTheme.secondaryDark,sky:window.WorfTheme.secondaryLight,gold:window.WorfTheme.gold,cream:window.WorfTheme.cream,
 paper:window.WorfTheme.paper,edge:window.WorfTheme.edge,white:window.WorfTheme.white,shadow:window.WorfTheme.shadow};
function kit(g){
 const poly=(pts,color,alpha=1,stroke=null)=>{const p=pts.map(([x,y])=>({x,y}));g.fillStyle(color,alpha);g.fillPoints(p,true);if(stroke!==null){g.lineStyle(1.2,stroke,1);g.strokePoints(p,true);}};
 const line=(a,b,color=C.ink,w=2,alpha=1)=>{g.lineStyle(w,color,alpha);g.lineBetween(...a,...b);};
 const rr=(x,y,w,h,color=C.paper,r=5,stroke=null)=>{g.fillStyle(color,1);g.fillRoundedRect(x,y,w,h,r);if(stroke!==null){g.lineStyle(1.4,stroke,1);g.strokeRoundedRect(x,y,w,h,r);}};
 const dot=(x,y,r,color=C.ink)=>{g.fillStyle(color,1);g.fillCircle(x,y,r);};
 const ring=(x,y,r,color=C.blue,w=2,alpha=1)=>{g.lineStyle(w,color,alpha);g.strokeCircle(x,y,r);};
 const ellipse=(x,y,w,h,color,alpha=1)=>{g.fillStyle(color,alpha);g.fillEllipse(x,y,w,h);};
 const arc=(x,y,r,start,end,color=C.gold,w=2,alpha=1)=>{g.lineStyle(w,color,alpha);g.beginPath();g.arc(x,y,r,start,end);g.strokePath();};
 const arrow=(a,b,color=C.blue,w=2)=>{line(a,b,color,w);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);poly([b,[b[0]-7*Math.cos(t-.45),b[1]-7*Math.sin(t-.45)],[b[0]-7*Math.cos(t+.45),b[1]-7*Math.sin(t+.45)]],color);};
 const sphere=(x,y,r,color=C.green)=>{ellipse(x+1,y+2,r*2,r*1.7,C.shadow,.12);dot(x,y,r,color);dot(x-r*.27,y-r*.3,r*.32,C.white);};
 const check=(x,y,s=1)=>{line([x-7*s,y],[x-1*s,y+6*s],C.dark,2.8*s);line([x-1*s,y+6*s],[x+11*s,y-8*s],C.dark,2.8*s);};
 const badge=(x,y,kind="check")=>{dot(x+1,y+2,12,C.shadow);dot(x,y,12,C.gold);ring(x,y,9,C.cream,1);if(kind==="check")check(x,y,.65);else if(kind==="coin"){line([x,y-6],[x,y+6],C.paper,2);line([x-4,y-3],[x+4,y-3],C.paper,2);line([x-4,y+3],[x+4,y+3],C.paper,2);}else{line([x,y-6],[x,y+1],C.dark,2.5);dot(x,y+5,1.8,C.dark);}};
 const slab=(x,y,w=70,h=28,z=7,color=C.paper)=>{
  poly([[x-w/2,y],[x,y+h/2],[x,y+h/2+z],[x-w/2,y+z]],window.WorfTheme.tileSide);
  poly([[x,y+h/2],[x+w/2,y],[x+w/2,y+z],[x,y+h/2+z]],window.WorfTheme.tileFront);
  poly([[x-w/2,y],[x,y-h/2],[x+w/2,y],[x,y+h/2]],color);
  line([x-w/2+2,y],[x,y-h/2+1],C.white,1.4);
 };
 const cube=(x,y,w=54,d=25,h=44,color=C.green)=>{
  const top=[[x-w/2,y-h],[x,y-h-d/2],[x+w/2,y-h],[x,y-h+d/2]];
  poly([[x-w/2,y-h],[x,y-h+d/2],[x,y+d/2],[x-w/2,y]],color);
  const cool=color===C.blue||color===C.sky||color===C.navy;
  poly([[x,y-h+d/2],[x+w/2,y-h],[x+w/2,y],[x,y+d/2]],cool?C.navy:color===C.gold?window.WorfTheme.flow:C.dark);
  poly(top,cool?C.sky:color===C.gold?C.cream:C.mint);
  line([x-w/2+1,y-h],[x,y-h-d/2+1],C.white,1.2);
 };
 const paper=(x=0,y=-17,w=52,h=68)=>{
  rr(x-w/2+4,y-h/2+5,w,h,C.edge,4);rr(x-w/2,y-h/2,w,h,C.paper,4,C.edge);
  poly([[x+w/2-14,y-h/2],[x+w/2,y-h/2+14],[x+w/2-14,y-h/2+14]],C.sky);
  line([x-w/2+10,y-h/2+15],[x+5,y-h/2+15],C.blue,3);
 };
 const rows=(x,y,w=28,count=3,color=C.edge)=>{for(let i=0;i<count;i++)line([x,y+i*9],[x+w-(i%2)*6,y+i*9],color,2);};
 const person=(x,y,s=1,color=C.green)=>{
  ellipse(x+s,y+29*s,25*s,7*s,C.shadow,.12);
  line([x-5*s,y+18*s],[x-6*s,y+28*s],C.dark,3*s);line([x+5*s,y+18*s],[x+6*s,y+28*s],C.dark,3*s);
  line([x-6*s,y+28*s],[x-9*s,y+29*s],C.ink,3*s);line([x+6*s,y+28*s],[x+9*s,y+29*s],C.ink,3*s);
  rr(x-9*s,y-2*s,18*s,22*s,color,5*s);
  rr(x-2.5*s,y-7*s,5*s,7*s,window.WorfTheme.skin,2*s);
  dot(x,y-13*s,8*s,window.WorfTheme.skin);arc(x,y-14*s,8.1*s,Math.PI,Math.PI*2,C.dark,3*s);
  arc(x-1*s,y-14*s,6.5*s,3.45,4.9,C.dark,2*s);
  dot(x-2.5*s,y-13*s,.8*s,C.dark);dot(x+3*s,y-13*s,.8*s,C.dark);
  arc(x+.3*s,y-10*s,2.4*s,.25,2.8,C.dark,.75*s);
  arc(x,y-2*s,3.6*s,.25,2.9,C.paper,.9*s);
  line([x-5*s,y+4*s],[x-4*s,y+14*s],C.paper,.8*s,.3);
  line([x-8*s,y+2*s],[x-12*s,y+8*s],color,4*s);line([x-12*s,y+8*s],[x-12*s,y+12*s],color,3.5*s);
  line([x+8*s,y+2*s],[x+12*s,y+8*s],color,4*s);line([x+12*s,y+8*s],[x+12*s,y+12*s],color,3.5*s);
  dot(x-12*s,y+13*s,2*s,window.WorfTheme.skin);dot(x+12*s,y+13*s,2*s,window.WorfTheme.skin);
 };
 const robot=(x=0,y=-18,s=1)=>{
  ellipse(x+3*s,y+42*s,47*s,12*s,C.shadow,.15);
  rr(x-15*s,y+15*s,30*s,26*s,C.green,8*s);
  rr(x-11*s,y+17*s,22*s,14*s,C.mint,5*s);
  dot(x,y+24*s,3*s,C.gold);
  line([x-18*s,y+21*s],[x-22*s,y+32*s],C.green,7*s);line([x+18*s,y+21*s],[x+22*s,y+32*s],C.green,7*s);
  dot(x-22*s,y+33*s,3.5*s,C.mint);dot(x+22*s,y+33*s,3.5*s,C.mint);
  rr(x-13*s,y+37*s,10*s,6*s,C.dark,2*s);rr(x+3*s,y+37*s,10*s,6*s,C.dark,2*s);
  rr(x-26*s,y-20*s,52*s,37*s,C.dark,10*s);
  rr(x-24*s,y-24*s,48*s,36*s,C.mint,10*s);
  rr(x-20*s,y-17*s,40*s,20*s,C.dark,7*s);
  rr(x-13*s,y-12*s,7*s,5*s,C.paper,2*s);rr(x+6*s,y-12*s,7*s,5*s,C.paper,2*s);
  line([x-3*s,y-3*s],[x+3*s,y-3*s],C.mint,1.3*s);
  line([x,y-24*s],[x,y-35*s],C.ink,2*s);sphere(x,y-37*s,3.6*s,C.gold);
  line([x-14*s,y-22*s],[x+7*s,y-22*s],C.white,1.6*s);
 };
 const bubble=(x,y,w=38,h=26,fill=C.paper)=>{
  rr(x-w/2+2,y-h/2+3,w,h,C.edge,6);rr(x-w/2,y-h/2,w,h,fill,6,C.edge);
  poly([[x-8,y+h/2-1],[x-13,y+h/2+10],[x+3,y+h/2-1]],fill);
 };
 const screen=(x=0,y=-15,w=82,h=57)=>{
  slab(x,y+h/2+18,45,17,4,C.sky);rr(x-5,y+h/2-2,10,20,C.blue,2);
  rr(x-w/2+3,y-h/2+4,w,h,C.navy,6);rr(x-w/2,y-h/2,w,h,C.navy,6);
  rr(x-w/2+4,y-h/2+4,w-8,h-10,C.paper,3);
  line([x-w/2+8,y-h/2+7],[x+w/2-8,y-h/2+7],C.sky,2);
  dot(x,y+h/2-3,1.5,C.mint);
 };
 const lens=(x,y,r=18)=>{
  line([x+r*.7,y+r*.7],[x+r*1.5,y+r*1.6],C.navy,7);
  dot(x,y,r+3,C.navy);dot(x,y,r,C.sky);
  arc(x,y,r-4,3.6,5.0,C.white,2.5);
 };
 const gear=(x,y,r=18,color=C.blue)=>{
  for(let i=0;i<8;i++){const t=i*Math.PI/4;line([x+Math.cos(t)*(r-3),y+Math.sin(t)*(r-3)],[x+Math.cos(t)*(r+4),y+Math.sin(t)*(r+4)],color,7);}
  dot(x,y,r,color);dot(x,y,r*.52,C.paper);ring(x,y,r*.3,color,2);
 };
 const bulb=(x,y,s=1)=>{
  dot(x,y,12*s,C.cream);ring(x,y,12*s,C.gold,1.5);
  line([x-5*s,y+12*s],[x+5*s,y+12*s],C.gold,4*s);line([x-4*s,y+16*s],[x+4*s,y+16*s],C.ink,3*s);
  line([x-3*s,y+8*s],[x-5*s,y],C.gold,1.5);line([x+3*s,y+8*s],[x+5*s,y],C.gold,1.5);
 };
 const book=(x=0,y=-13)=>{
  poly([[x-42,y-30],[x-6,y-24],[x,y-19],[x+7,y-25],[x+42,y-32],[x+42,y+25],[x,y+35],[x-42,y+27]],C.blue);
  poly([[x-39,y-33],[x-5,y-27],[x,y-21],[x,y+29],[x-39,y+20]],C.paper);
  poly([[x,y-21],[x+6,y-28],[x+39,y-35],[x+39,y+18],[x,y+29]],window.WorfTheme.pale);
  for(let i=0;i<4;i++){line([x-30,y-18+i*9],[x-9,y-14+i*9],C.edge,1.7);line([x+8,y-14+i*9],[x+30,y-19+i*9],C.edge,1.7);}
  line([x,y-20],[x,y+30],C.edge,1.4);
 };
 const target=(x,y,r=19)=>{dot(x,y,r,C.paper);ring(x,y,r,C.gold,3);ring(x,y,r*.62,C.gold,2);dot(x,y,r*.2,C.gold);arrow([x+25,y-25],[x,y],C.ink,2);};
 return {poly,line,rr,dot,ring,ellipse,arc,arrow,sphere,check,badge,slab,cube,paper,rows,person,robot,bubble,screen,lens,gear,bulb,book,target};
}
function paint(g,scene,node,state={}){
 g.clear();
 const k=kit(g),{poly,line,rr,dot,ring,ellipse,arc,arrow,sphere,check,badge,slab,cube,paper,rows,person,robot,bubble,screen,lens,gear,bulb,book,target}=k;
 const id=node.id,diagram=scene.diagram.id;
 const network=(pts,edges,color=C.blue,r=4)=>{edges.forEach(([a,b])=>line(pts[a],pts[b],color,2));pts.forEach(([x,y])=>sphere(x,y,r,color));};
 const engine=(kind)=>{
  ellipse(4,30,81,26,C.shadow,.13);
  cube(0,19,72,30,68,C.blue);
  // Faceted appliance body with a translucent front panel.
  poly([[-36,-49],[0,-34],[0,34],[-36,19]],window.WorfTheme.secondary);
  poly([[0,-34],[36,-49],[36,19],[0,34]],window.WorfTheme.secondaryDark);
  rr(-29,-43,58,49,C.dark,5);
  rr(-25,-39,50,41,window.WorfTheme.pale,4);
  line([-24,-38],[18,-38],C.white,1.5);
  [-22,-11,0,11,22].forEach(x=>{line([x,10],[x,15],C.sky,1.4);});
  for(let i=0;i<3;i++)dot(-14+i*14,23,2.5,i<(state.engineRevision||state.incubationRevision||0)?C.gold:C.sky);
  if(kind==="competency"){person(-9,-19,.62);arc(8,-11,12,3.5,6.05,C.gold,3);line([8,-11],[17,-21],C.gold,2.5);}
  else if(kind==="policy"){poly([[-13,-32],[12,-32],[15,-18],[0,-5],[-15,-18]],C.blue);check(0,-20,.75);}
  else if(kind==="incubation"){person(-11,-21,.6);arrow([6,-7],[17,-31],C.gold,3);}
  else if(kind==="world"){poly([[-17,-10],[-6,-31],[5,-10]],C.blue);rr(6,-26,12,18,C.green,1);sphere(15,-32,4,C.gold);}
  else if(kind==="thought"){network([[-14,-25],[9,-30],[15,-11],[-8,-7]],[[0,1],[0,3],[1,2],[2,3]],C.green,3);sphere(-2,-18,4,C.gold);}
  else if(kind==="bias"){line([-16,-17],[16,-13],C.blue,2);line([0,-30],[0,-5],C.ink,2);ellipse(-13,-9,15,5,C.gold);ellipse(13,-5,15,5,C.gold);}
  else network([[0,-31],[-15,-17],[15,-17],[0,-5]],[[0,1],[0,2],[1,3],[2,3]],C.green,3.7);
  return;
 };
 const graph=(count=0)=>{
  ellipse(4,26,124,37,C.shadow,.12);
  for(let j=2;j>=0;j--){ellipse(0,17+j*6,110,35,j%2?C.blue:C.green);ellipse(0,13+j*6,110,33,C.paper);line([-38,20+j*6],[-10,27+j*6],C.edge,1);}
  // A persistent receiving frame distinguishes an empty graph from a missing object.
  g.lineStyle(1.2,C.blue,.35);g.strokeEllipse(0,-17,116,84);g.strokeEllipse(0,-17,53,92);
  if(!count){sphere(0,-13,7,C.mint);ring(0,-13,12,C.blue,1,.5);return;}
  const pts=Array.from({length:count},(_,i)=>{const t=i*2.4,r=12+Math.sqrt(i)*10;return [Math.cos(t)*r,Math.sin(t)*r*.68-20];});
  pts.forEach((p,i)=>{if(i)line(pts[Math.floor((i-1)/2)],p,i>8?C.gold:C.blue,1.8,.85);if(i>5&&i%3===0)line(pts[i-3],p,C.green,1.2,.5);});
  pts.forEach((p,i)=>sphere(...p,i===0?6:4.2,i>8?C.gold:C.green));
 };
 const flowBoard=(type="tree",hot=false)=>{
  screen(0,-22,88,66);
  const pts=type==="tree"?[[0,-43],[-23,-22],[23,-22],[-23,-5],[5,-5]]:[[-25,-26],[0,-42],[25,-26],[0,-9]];
  const edges=type==="tree"?[[0,1],[0,2],[1,3],[2,4]]:[[0,1],[1,2],[2,3],[3,0]];
  edges.forEach(([a,b])=>arrow(pts[a],pts[b],hot?C.green:C.blue,1.7));
  pts.forEach(([x,y],i)=>{rr(x-5,y-5,10,10,hot&&i===2?C.gold:C.mint,2,C.green);});
 };
 const logCard=(mode="tasks",active=false)=>{
  paper(-6,-17,55,72);rr(-19,-58,25,10,C.blue,3);
  if(mode==="tasks"){for(let i=0;i<3;i++){rr(-24,-36+i*15,9,9,active?C.mint:C.sky,2);line([-9,-31+i*15],[12,-31+i*15],C.edge,2);if(active)check(-20,-32+i*15,.38);}}
  else rows(-23,-34,32,4);
  if(active)badge(22,15);
 };
 const consoleGame=()=>{
  cube(0,17,76,30,31,C.blue);
  rr(-34,-42,68,47,C.navy,7);rr(-29,-38,58,37,C.sky,4);
  poly([[-22,-9],[-8,-28],[1,-13],[11,-25],[24,-9]],C.green);
  sphere(18,-30,4,C.gold);
  rr(-22,5,44,24,C.paper,10,C.edge);line([-15,17],[-3,17],C.ink,2);line([-9,11],[-9,23],C.ink,2);dot(10,13,2.5,C.gold);dot(16,19,2.5,C.green);
 };
 const trends=(active=1)=>{
  screen(0,-20,87,63);
  line([-31,-43],[-31,1],C.edge,1);line([-31,1],[31,1],C.edge,1);
  for(let i=0;i<3;i++){rr(-23+i*18,0-(10+i*9)*active,10,(10+i*9)*active+1,i===2?C.gold:C.blue,2);}
  line([-25,-15],[-5,-32],C.green,2);line([-5,-32],[10,-25],C.green,2);arrow([10,-25],[29,-45],C.green,2);
 };
 const analysis=(type)=>{
  if(type==="metrics"){trends(state.metricAnalysis??state.analysisProgress??1);lens(29,7,15);line([22,8],[28,1],C.gold,2);line([28,1],[34,5],C.gold,2);}
  else if(type==="decisions"){flowBoard("tree",state.decisionsAnalyzed);lens(28,8,17);arrow([20,7],[31,-1],C.gold,2);}
  else{if(type==="story")book(-8,-20);else paper(-9,-20,55,73);rows(-28,-28,31,3);if(state.analyzed||state.analysisProgress){line([-25,-28],[-1,-28],C.gold,4);line([-25,-10],[-6,-10],C.gold,4);}lens(25,10,18);line([17,9],[29,4],C.gold,2);}
 };
 const mentor=()=>{
  screen(7,-34,62,44);line([-13,-29],[1,-41],C.blue,2);line([1,-41],[12,-32],C.blue,2);arrow([12,-32],[29,-47],C.gold,2);
  person(-30,-8,.85,C.green);person(32,5,.75,C.blue);
  line([-18,-4],[-3,-20],C.green,3);if(state.mentored)badge(7,19);
 };
 const character=(updated=false)=>{
  slab(0,29,72,28,7,C.sky);person(0,-19,1.35,C.green);
  poly([[-14,-20],[-23,5],[-13,2],[-2,-18]],C.blue);
  if(updated){arc(0,-34,16,3.4,6.0,C.gold,3);arrow([29,20],[29,-25],C.gold,3);sphere(-27,-9,4,C.gold);}
 };
 const world=()=>{
  slab(0,17,95,43,8,C.mint);
  poly([[-43,10],[-23,-32],[-4,11]],C.blue);poly([[-23,-32],[-12,-7],[-30,-7]],C.paper);
  cube(18,9,28,15,42,C.green);rr(11,-29,5,10,C.dark,1);rr(22,-29,5,10,C.dark,1);rr(15,-4,7,13,C.dark,2);
  person(-3,2,.62,C.gold);sphere(35,-46,6,C.gold);
  line([-30,19],[-16,10],C.paper,3);line([-16,10],[-3,16],C.paper,3);
  if(state.narrativeRevision){arrow([10,29],[36,13],C.gold,2.5);}
 };

 if(id==="agent"){robot(0,-21,1.05);bubble(34,-51,25,18,C.paper);[28,34,40].forEach(x=>dot(x,-52,1.8,C.green));return;}
 if(id==="knowledge"){graph(state.knowledgeNodes||0);return;}
 if(id==="rag"){engine(diagram==="narrative"?"world":diagram==="npc"?"thought":diagram==="bias"?"bias":"workflow");return;}
 if(id==="competency"||id==="policy"||id==="incubation"){engine(id);return;}
 if(id==="content"){consoleGame();return;}
 if(id==="api"){
  cube(0,14,70,28,52,C.blue);
  for(let i=0;i<3;i++){rr(-27,-39+i*15,52,10,C.sky,3);dot(-20,-34+i*15,2.2,C.gold);line([-10,-34+i*15],[15,-34+i*15],C.blue,1.5);}
  arrow([-49,-1],[-33,-1],C.gold,2.7);arrow([34,-1],[49,-1],C.gold,2.7);
  if(diagram==="research"){book(0,-23);g.setScale(.94);}
  return;
 }
 if(diagram==="overview"){
  if(id==="ontology"){
   slab(0,25,94,34,7,C.sky);
   const color=state.chapter==="top-down"?C.blue:C.green;
   const progress=state.cosmos??1;
   ellipse(0,-10,100,88,C.sky,.35);g.lineStyle(1.4,color,.6);g.strokeEllipse(0,-10,100,80);g.strokeEllipse(0,-10,44,92);
   const pts=[[-32,-28],[-12,-49],[16,-43],[38,-13],[24,19],[-6,28],[-34,7],[-7,-17],[14,0]];
   const count=Math.floor(progress*pts.length);
   pts.slice(0,count).forEach((p,i)=>{if(i)line(pts[i-1],p,color,1.7);if(i>3)line(pts[i-4],p,color,1.2,.5);});
   pts.slice(0,count).forEach(p=>sphere(...p,5,color));return;
  }
  if(id==="linked"){
   const pts=[[0,-54],[-27,-27],[27,-27],[-37,6],[0,6],[37,6]],edges=[[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,4],[4,5]];
   slab(0,21,96,36,6,C.sky);
   edges.forEach(([a,b],i)=>{if(i/edges.length<=(state.topProgress??1))line(pts[a],pts[b],C.blue,state.topStrength??2);});
   pts.forEach((p,i)=>{if(i/6<=(state.topProgress??1)){cube(p[0],p[1]+5,15,9,11,C.blue);}});
   if((state.topStrength||0)>1){arc(0,-12,48,.15,2.8,C.gold,2);arrow([-45,0],[-43,-10],C.gold,2);}return;
  }
  if(id==="worflogy"){
   slab(0,24,104,39,7,C.mint);
   const pts=[[-11,-17],[12,-36],[16,1],[-35,-38],[-38,6],[38,-48],[43,-8],[13,25],[-18,-61]],edges=[[0,1],[1,2],[0,2],[0,3],[0,4],[1,5],[2,6],[2,7],[3,8],[3,4],[5,6]];
   const count=state.bottomNodes??9;
   edges.forEach(([a,b])=>{if(a<count&&b<count)line(pts[a],pts[b],a>2||b>2?C.gold:C.green,2);});
   pts.slice(0,count).forEach((p,i)=>sphere(...p,i<3?6:4.7,i<3?C.green:C.gold));return;
  }
  if(id==="semantics"){
   const count=state.semanticCount??3;
   for(let i=0;i<count;i++){const x=(i-1)*27,y=-9+(i%2)*12;slab(x,y,34,19,7,i===1?C.cream:C.sky);line([x-8,y-11],[x+7,y-20],C.green,2.5);sphere(x-8,y-11,4,C.green);sphere(x+7,y-20,4,C.gold);}
   return;
  }
  if(id==="holistic"){
   slab(-5,23,79,30,6,C.sky);ellipse(-9,-19,73,66,C.sky);
   g.lineStyle(1.5,C.blue,.7);g.strokeEllipse(-9,-19,73,66);g.strokeEllipse(-9,-19,32,66);g.strokeEllipse(-9,-19,73,24);
   lens(20,5,21);sphere(16,0,4,C.green);line([16,0],[27,10],C.gold,2);sphere(27,10,3,C.gold);return;
  }
  if(id==="dynamics"){
   slab(0,22,86,34,6,C.paper);gear(-16,-22,23,C.green);gear(24,4,17,C.blue);
   arc(-5,-16,45,3.3,5.5,C.gold,2.5);arrow([25,-53],[35,-43],C.gold,2.5);return;
  }
  if(id==="signal"){
   slab(0,25,74,30,6,C.sky);cube(-10,13,33,20,33,C.green);
   line([-10,-20],[-10,-48],C.dark,3);sphere(-10,-48,5,C.gold);
   [16,28,41].forEach((r,i)=>arc(-10,-48,r,-.7,.7,C.gold,2,1-i*.2));sphere(35,-33,3,C.gold);return;
  }
 }
 if(diagram==="platform"){
  if(id==="profile"){
   rr(-37,-51,74,71,C.edge,7);rr(-39,-54,74,71,C.paper,7,C.edge);
   rr(-39,-54,74,13,C.blue,6);rr(-10,-61,16,13,C.navy,4);
   rr(-31,-33,28,32,C.sky,4);person(-17,-17,.62);
   rows(5,-31,21,3);line([-27,28],[28,28],C.blue,2);[-24,-7,10,27].forEach(x=>sphere(x,28,3.5,C.gold));return;
  }
  if(id==="events"){
   slab(0,22,91,36,8,C.sky);
   [[-25,-37],[0,-21],[25,-6]].forEach(([x,y],i)=>{
    rr(x-18+3,y-19+4,36,38,C.edge,5);rr(x-18,y-19,36,38,C.paper,5);
    rr(x-18,y-19,36,7,i===1?C.gold:C.blue,4);
    if(i===0){line([x-5,y+10],[x-5,y-3],C.green,2);line([x-5,y+4],[x+7,y-2],C.green,2);[[x-5,y+10],[x-5,y-3],[x+7,y-2]].forEach(p=>sphere(...p,2.5,C.green));}
    if(i===1){line([x,y-4],[x,y+6],C.dark,3);dot(x,y+12,2,C.dark);}
    if(i===2){bubble(x,y+2,24,15,C.mint);[x-6,x,x+6].forEach(a=>dot(a,y+1,1.4,C.green));}
   });return;
  }
  if(id==="position"){
   person(0,-35,.85);line([0,-11],[0,-2],C.blue,2.5);
   [-30,0,30].forEach(x=>{line([0,-2],[x,-2],C.blue,2);line([x,-2],[x,11],C.blue,2);cube(x,23,24,12,15,x===0?C.green:C.blue);});
   if(state.assigned)badge(0,12);else ring(0,13,14,C.gold,2);return;
  }
  if(id==="guide"){
   flowBoard("tree",state.matched);
   [-31,0,31].forEach((x,i)=>person(x,12,.57,i===1?C.green:C.blue));
   if(state.guided){line([-23,21],[-8,21],C.gold,2);line([8,21],[23,21],C.gold,2);}return;
  }
  if(id==="report"){logCard("tasks",state.reports>0);lens(28,12,14);return;}
  if(id==="growth"){
   trends(state.monitored?1:.3);person(-33,12,.64);
   if(state.monitorReady){ring(-33,3,10,C.gold,1.5);}if(state.monitored>1)badge(31,17);return;
  }
 }
 if(id==="simulation"){ // System dynamics risk simulation appliance.
  screen(0,-19,92,72);
  rr(-31,-45,21,15,C.mint,2,C.green);rr(10,-45,21,15,C.sky,2,C.blue);arrow([-9,-37],[9,-37],C.blue,1.8);
  line([21,-28],[21,-22],C.gold,1.5);line([21,-22],[-20,-22],C.gold,1.5);arrow([-20,-22],[-20,-29],C.gold,1.5);
  for(let j=0;j<3;j++){const pts=Array.from({length:15},(_,i)=>{const t=i/14;return [-30+t*60,-6+Math.sin(t*3+j*.2)*8+(j-1)*t*12];});pts.slice(1,Math.max(2,Math.floor((state.simulationProgress??.5)*15))).forEach((p,i)=>line(pts[i],p,j===1?C.gold:C.blue,j===1?2:1));}
  gear(33,22,12,C.green);return;
 }
 if(id==="start"){
  if(diagram==="narrative"){book();return;}
  if(diagram==="research"){book(-4,-9);rr(17,-50,12,19,C.sky,3);poly([[17,-34],[9,-11],[37,-11],[29,-34]],C.sky,.95,C.blue);poly([[14,-20],[32,-20],[35,-13],[11,-13]],C.green);dot(24,-25,2,C.gold);return;}
  if(diagram==="npc"){character();return;}
  if(diagram==="creator"){
   person(0,-32,1,C.green);slab(0,27,82,28,5,C.sky);rr(-35,-12,70,39,C.navy,4);rr(-31,-8,62,30,C.sky,3);line([-13,22],[13,22],C.blue,1.5);return;
  }
  bubble(0,-22,70,49,C.paper);
  if(diagram==="bias"){rows(-22,-35,41,3);line([-27,28],[-27,8],C.green,3);poly([[-27,8],[-6,12],[-27,23]],C.gold);}
  else{poly([[0,-46],[-17,-14],[17,-14]],C.cream,1,C.gold);line([0,-36],[0,-26],C.dark,3);dot(0,-20,2,C.dark);sphere(28,20,6,C.gold);}
  return;
 }
 if(id==="core"){
  if(diagram==="problem"){
   ellipse(0,12,80,33,C.shadow,.13);ellipse(0,2,80,33,C.blue);ellipse(0,-3,80,31,C.sky);
   person(-36,-19,.72);person(36,-19,.72);person(0,15,.72,C.blue);
   [-21,0,21].forEach((x,i)=>bulb(x,-46-(i%2)*9,.62));if(state.discussed)line([-17,-3],[20,-3],C.gold,3);return;
  }
  if(diagram==="risk"){
   screen(-4,-21,84,61);poly([[-9,-46],[-29,-11],[11,-11]],C.cream,1,C.gold);line([-9,-35],[-9,-24],C.dark,3);dot(-9,-18,2,C.dark);
   for(let i=0;i<3;i++)rr(18,-39+i*12,10+(state.riskDiagnosed?i*3:0),6,i===2?C.gold:C.blue,2);
   lens(27,13,16);return;
  }
  if(diagram==="research"){
   paper(-6,-17,64,79);rows(-27,-37,33,2);
   network([[-23,-8],[10,-15],[0,15]],[[0,1],[1,2]],C.green,4);
   if(state.designRevision){sphere(34,8,4,C.gold);arrow([10,-15],[34,8],C.gold,2);}return;
  }
  if(diagram==="narrative"){world();return;}
  if(diagram==="npc"){
   flowBoard("tree",state.modelReady);gear(31,15,13,C.green);if(state.modelRevision)badge(-31,22);return;
  }
  if(diagram==="creator"){trends(state.targetsSet?1:.5);target(31,15,19);return;}
  if(diagram==="bias"){
   [-28,0,28].forEach((x,i)=>{rr(x-13+3,-42,26,60,C.edge,5);rr(x-13,-46,26,60,state.biasSelected&&i===1?C.cream:C.paper,5,C.edge);ring(x,-29,6,i===1?C.gold:C.blue,2);rows(x-7,-12,14,2);});
   if(state.biasSelected)badge(0,20);return;
  }
 }
 if(id==="alternative"){
  if(["problem","risk"].includes(diagram)){
   cube(0,22,75,29,25,C.blue);
   paper(-8,-26,43,56);bulb(-9,-30,.7);
   [18,29].forEach(r=>arc(10,-29,r,-.65,.65,C.gold,2));
   if(state.alternativeRecommended)badge(27,18);return;
  }
  if(diagram==="creator"){mentor();return;}
  if(diagram==="npc"){
   flowBoard("tree",true); // Scenario branches remain visible behind the moving character token.
   const t=state.simulationProgress??0,pts=[[-25,-15],[0,-35],[25,-6]],a=t<.5?pts[0]:pts[1],b=t<.5?pts[1]:pts[2],p=t<.5?t*2:(t-.5)*2;
   sphere(a[0]+(b[0]-a[0])*p,a[1]+(b[1]-a[1])*p,6,C.gold);return;
  }
  paper(-8,-22,60,76);
  rows(-28,-30,34,4);
  line([-7,24],[33,-30],C.gold,8);line([33,-30],[38,-39],C.dark,4);
  poly([[-10,28],[-9,16],[-1,23]],C.dark);
  if(diagram==="research")badge(-26,22,"coin");else if(state.edited)badge(-26,22);return;
 }
 if(id==="chosen"){
  if(["narrative","npc","creator"].includes(diagram)){consoleGame();if(state.sdkReady)badge(34,-43);return;}
  paper(-12,-27,48,62);paper(4,-12,48,62);rows(-10,-20,24,3);badge(25,22,diagram==="research"?"coin":"check");return;
 }
 if(id==="dialogue"){
  robot(17,-1,.76);bubble(-23,-40,43,30,C.paper);rows(-35,-45,22,2);
  const count=state.dialogueTurns||0;for(let i=0;i<count;i++)sphere(-28+i*12,28,3,i%2?C.gold:C.blue);return;
 }
 if(id==="report"){
  if(diagram==="research"){
   bubble(-17,-35,53,35,C.paper);bubble(18,2,54,37,C.sky);
   if(state.discourse){check(-17,-35,.85);line([18,-7],[18,5],C.blue,3);dot(18,12,2,C.blue);}else{rows(-32,-41,28,2);rows(4,-4,25,2);}return;
  }
  if(diagram==="bias"){
   paper(-6,-16,62,77);line([-4,-27],[-4,15],C.green,2);line([-20,15],[12,15],C.green,2);
   line([-26,-20],[19,state.reportReady?-12:-20],C.gold,3);
   line([-23,-19],[-23,-6],C.blue,1.5);line([15,state.reportReady?-13:-19],[15,1],C.blue,1.5);
   ellipse(-23,-3,21,7,C.blue);ellipse(15,4,21,7,C.blue);if(state.reportReady)badge(29,23);return;
  }
  if(diagram==="creator"){
   [-29,0,29].forEach((x,i)=>{rr(x-10,-52,20,24,i===1?C.cream:C.sky,3,C.edge);line([x,-27],[0,-7],C.blue,1.5);});
   poly([[-33,-12],[33,-12],[10,6],[10,23],[-10,23],[-10,6]],C.blue);poly([[-33,-12],[33,-12],[22,-19],[-22,-19]],C.sky);
   for(let i=0;i<(state.metricsCollected||0);i++)sphere(-20+i*10,-23+i%2*4,3,C.gold);return;
  }
  if(["narrative","npc"].includes(diagram)){
   rr(-41,-41,82,44,C.navy,15);rr(-38,-44,76,41,C.sky,14);
   line([-27,-24],[-9,-24],C.ink,4);line([-18,-33],[-18,-15],C.ink,4);sphere(18,-30,4,C.gold);sphere(27,-19,4,C.green);
   rr(-30,5,62,25,C.paper,4,C.edge);
   for(let i=0;i<(state.playLogCount||0);i++){const x=-23+i*12;dot(x,17+(i%2)*3,3,i%2?C.gold:C.blue);if(i)line([x-12,17+((i-1)%2)*3],[x,17+(i%2)*3],C.blue,1.5);}return;
  }
  logCard("tasks",state.reported);return;
 }
 if(id==="review"){
  if(diagram==="risk"){mentor();return;}
  if(diagram==="problem"){
   paper(0,-26,45,60);rows(-13,-31,24,3);person(-33,6,.73,C.blue);person(33,6,.73);if(state.reviewed)badge(0,15);return;
  }
  analysis(diagram==="narrative"?"story":diagram==="npc"?"decisions":diagram==="creator"?"metrics":"content");return;
 }
 if(id==="feedback"){
  if(["problem","risk"].includes(diagram)){
   paper(-9,-18,61,78);rows(-28,-35,36,4);
   poly([[15,7],[9,34],[20,28],[30,35],[30,8]],C.blue);
   badge(22,4);if(state.policyRecommended){arrow([-41,20],[-24,20],C.gold,3);}return;
  }
  if(diagram==="research"){
   robot(-13,-9,.8);bulb(30,-39,.9);bubble(27,15,26,19,C.sky);if(state.suggested)arrow([19,16],[34,10],C.green,1.8);return;
  }
  if(diagram==="narrative"){
   world();arc(0,-10,50,.1,2.9,C.gold,2.5);arrow([-48,5],[-43,-5],C.gold,2.5);return;
  }
  if(diagram==="npc"){character(state.characterUpdated);return;}
  if(diagram==="creator"){trends();target(30,18,15);if(state.guidanceReady)badge(-29,21);return;}
 }
 // Every declared object has a visual role; fallback is a neutral document.
 logCard("content",false);
}
window.WorfArt={
 draw(scene,node,state={}){const g=scene.add.graphics();paint(g,scene,node,state);return g;},
 paint,
 tile(g,node,selected=false,hovered=false){
  const {poly,ellipse,line}=kit(g);g.clear();
  const w=node.w/2,accent=selected||hovered?window.WorfTheme.active:node.type==="engine"?C.blue:node.type==="knowledge"?C.gold:C.green;
  ellipse(4,37,node.w+8,36,C.shadow,.06);ellipse(3,34,node.w-6,27,C.shadow,.08);
  if(selected||hovered)ellipse(0,28,node.w+16,49,accent,selected?.12:.07);
  poly([[-w,15],[0,40],[0,47],[-w,23]],window.WorfTheme.tileSide);
  poly([[0,40],[w,15],[w,23],[0,47]],window.WorfTheme.tileFront);
  poly([[-w,15],[0,-10],[w,15],[0,40]],selected?window.WorfTheme.tileSelected:window.WorfTheme.tile);
  line([-w+1,15],[0,-9],C.white,1.5);line([0,-9],[w-1,15],window.WorfTheme.edge,1);
  if(selected||hovered){g.lineStyle(selected?2:1.4,accent,.9);g.strokePoints([{x:-w,y:15},{x:0,y:-10},{x:w,y:15},{x:0,y:40}],true);}
  line([-w*.38,36],[0,45],accent,2,selected?1:.5);
 },
 player(scene){
  const g=scene.add.graphics();const {person}=kit(g);person(0,0,1.05,C.green);return g;
 }
};
})();
