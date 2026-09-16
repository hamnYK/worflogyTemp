/* Smart farm concept animation, informed by the supplied system and prototype images. */
(()=>{
 'use strict';
 window.createFarmExplorer=(host,callbacks)=>{
  const NS='http://www.w3.org/2000/svg',mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const defaultZoom=()=>mobile.matches?1:1/1.2;
  const preview=host.closest('.diagram-section').querySelector('.canvas-example-card');
  let stage=0,running=false,visible=true,elapsed=0,last=0,frame,zoom=defaultZoom(),pan={x:0,y:0},drag;
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('role','img');svg.setAttribute('aria-label','식물 센서와 공간정보를 분석해 가상 식물과 아바타로 소통하는 스마트 팜');host.append(svg);host.classList.add('farm-canvas');
  const el=(tag,attrs={},parent=svg)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
  const color=name=>`var(--scene-${name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())})`;
  const rect=(g,x,y,w,h,c,r=4,extra={})=>el('rect',{x,y,width:w,height:h,rx:r,fill:color(c),...extra},g);
  const line=(g,pts,c='link',w=2,extra={})=>el('polyline',{points:pts.map(p=>p.join(',')).join(' '),fill:'none',stroke:color(c),'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round',...extra},g);
  const path=(g,d,c='link',w=2,fill='none',extra={})=>el('path',{d,fill:fill==='none'?fill:color(fill),stroke:color(c),'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round',...extra},g);
  const dot=(g,x,y,r,c,extra={})=>el('circle',{cx:x,cy:y,r,fill:color(c),...extra},g);
  const poly=(g,pts,c,stroke='edge')=>el('polygon',{points:pts.map(p=>p.join(',')).join(' '),fill:color(c),stroke:color(stroke),'stroke-width':1},g);
  const ellipse=(g,x,y,rx,ry,c,alpha=1)=>el('ellipse',{cx:x,cy:y,rx,ry,fill:color(c),opacity:alpha},g);
  function slab(g,w=120){ellipse(g,0,12,w*.48,18,'shadow',.08);poly(g,[[-w/2,0],[0,24],[w/2,0],[w/2,8],[0,32],[-w/2,8]],'tileFront');poly(g,[[-w/2,0],[0,-24],[w/2,0],[0,24]],'paper');line(g,[[-w/2,0],[0,-24],[w/2,0]],'white',2);}
  function leaf(g,x,y,right){path(g,`M ${x} ${y} Q ${x+(right?26:-26)} ${y-33} ${x+(right?30:-30)} ${y-12} Q ${x+(right?20:-20)} ${y+3} ${x} ${y} Z`,'secondaryDark',.7,'secondary');path(g,`M ${x} ${y} l ${right?22:-22} -13`,'secondaryLight',1);}
  function plant(g,fruit=false){
   ellipse(g,0,2,25,8,'shadow',.1);path(g,'M -23 -27 L -17 0 Q 0 10 17 0 L 23 -27','flow',1,'cream');ellipse(g,0,-27,23,7,'highlight');ellipse(g,0,-27,18,4,'dark');
   path(g,'M 0 -27 Q 3 -59 0 -104','secondaryDark',4);
   leaf(g,0,-48,false);leaf(g,1,-65,true);leaf(g,0,-83,false);leaf(g,0,-100,true);
   if(fruit){for(const [x,y]of [[-13,-55],[19,-71],[-8,-88]]){dot(g,x,y,8,'accent');dot(g,x-2,y-3,2,'highlight');}}
  }
  function avatar(g,x=0,y=0,s=1,farmer=false){
   const p=el('g',{transform:`translate(${x},${y}) scale(${s})`},g);ellipse(p,0,4,17,5,'shadow',.12);
   path(p,'M -5 -20 L -6 0 M 5 -20 L 6 0','dark',6);line(p,[[-7,0],[-11,2]],'ink',4);line(p,[[5,0],[10,2]],'ink',4);
   path(p,'M -9 -45 Q 0 -50 9 -45 L 11 -21 Q 0 -15 -11 -21 Z',farmer?'secondaryDark':'accent',1,farmer?'secondaryDark':'accent');
   rect(p,-3,-51,6,8,'skin',2);ellipse(p,0,-60,9,11,'skin');path(p,'M -9 -61 Q -10 -77 2 -74 Q 12 -73 10 -60 Q 4 -68 -3 -64 Z','dark',1,'dark');
   if(farmer){ellipse(p,0,-69,18,4,'gold');path(p,'M -10 -70 L -7 -80 Q 0 -84 8 -79 L 11 -70','flow',1,'cream');}
   for(const eyeX of [-3,4])dot(p,eyeX,-60,.85,'dark',{'data-person-eye':''});
   path(p,'M 1 -59 l 1 3 l -1 0','flow',.6);
   path(p,'M -2 -53 Q 1 -51 4 -53','dark',.85);
   path(p,'M -4 -46 Q 0 -42 4 -46','paper',1.2);
   path(p,'M -6 -39 L -5 -25','paper',.8,'none',{opacity:'.3'});
   path(p,'M -9 -41 Q -14 -36 -15 -30',farmer?'secondaryDark':'accent',6);dot(p,-16,-28,3,'skin');
   const arm=el('g',{'data-farm-arm':''},p);line(arm,[[9,-40],[18,-36],[20,-46]],farmer?'secondaryDark':'accent',6);dot(arm,20,-48,3,'skin');
   if(farmer){rect(arm,16,-59,11,16,'ink',2);rect(arm,18,-57,7,11,'paper',1);dot(arm,21.5,-44.5,.6,'edge');}
   return p;
  }
  function bubble(g,x,y,kind){const b=el('g',{transform:`translate(${x},${y})`},g);rect(b,-18,-13,36,26,'paper',6,{stroke:color('edge'),'stroke-width':1});poly(b,[[-5,12],[-9,19],[4,12]],'paper','paper');if(kind==='heart')path(b,'M 0 7 C -18 -3 -6 -12 0 -5 C 6 -12 18 -3 0 7 Z','accent',1,'accent');else if(kind==='check')line(b,[[-8,0],[-2,6],[9,-6]],'secondaryDark',2.5);else{for(const x of [-8,0,8])dot(b,x,0,2,'secondary');}}
  function render(){
   const narrow=mobile.matches,W=narrow?440:1000,H=narrow?410:550;
   svg.replaceChildren();svg.setAttribute('viewBox',`${-pan.x} ${-pan.y} ${W/zoom} ${H/zoom}`);
   const defs=el('defs');
   for(const [id,a,b]of [['farm-display','paper','secondaryLight'],['farm-land','plane','secondaryLight'],['farm-glass','paper','plane']]){
    const gradient=el('linearGradient',{id,x1:'0%',y1:'0%',x2:'100%',y2:'100%'},defs);
    el('stop',{offset:'0%','stop-color':color(a)},gradient);el('stop',{offset:'100%','stop-color':color(b)},gradient);
   }
   const focus=stage>=5?'immersive':'synchronization';
   svg.setAttribute('data-experience',focus);
   // Translate both scenes together; reserving padding would shrink the artwork.
   let layoutX=0,layoutY=0;
   if(!narrow){
    const viewW=W/defaultZoom(),viewH=H/defaultZoom();
    const scale=Math.min(host.clientWidth/viewW,host.clientHeight/viewH);
    const letterboxY=(host.clientHeight-viewH*scale)/2;
    const cardBottom=preview?preview.getBoundingClientRect().bottom-host.getBoundingClientRect().top:164;
    layoutX=viewW/2-501;
    layoutY=(cardBottom+20-letterboxY)/scale-186.5;
   }
   const composition=el('g',{'data-farm-composition':'',transform:`translate(${layoutX},${layoutY})`});
   function scene(name,index){
    return el('g',{'data-farm-experience':name,transform:narrow?'translate(0,-8)':`translate(${index?525:35},125)`,display:narrow&&name!==focus?'none':'inline'},composition);
   }
   function platform(g){
    ellipse(g,221,337,180,39,'shadow',.06);
    poly(g,[[24,306],[222,260],[418,306],[418,316],[222,363],[24,316]],'tileFront');
    poly(g,[[24,306],[222,260],[418,306],[222,353]],'paper');
    line(g,[[24,306],[222,260],[418,306]],'white',2);
    for(const x of [90,150,210,270,330])line(g,[[x,292+(Math.abs(x-222)*.1)],[x+55,327]],'grid',.7,{opacity:'.5'});
   }
   function pulse(g,coords,active){
    line(g,coords,active?'active':'edge',active?2.5:1.3,{'data-signal-path':''});
    if(active)for(let i=0;i<coords.length-1;i++)dot(g,...coords[i],3.3,'accent',{'data-farm-packet':'','data-from':coords[i].join(','),'data-to':coords[i+1].join(',')});
   }
   // Experience 1: the physical plant and its sensor-driven animated counterpart.
   const sync=scene('synchronization',0);platform(sync);
   const rig=el('g',{transform:'translate(18,-9)','data-plant-rig':''},sync);
   poly(rig,[[43,314],[101,332],[157,315],[99,297]],'shadow','shadow').setAttribute('opacity','.09');
   const bed=el('g',{transform:'translate(92,297)'},rig);
   poly(bed,[[-49,-8],[5,-24],[62,-8],[9,10]],'dark');
   poly(bed,[[-49,-8],[9,10],[9,31],[-49,14]],'cream','gold');
   poly(bed,[[9,10],[62,-8],[62,15],[9,31]],'gold');
   for(let i=0;i<4;i++)line(bed,[[-42+i*12,-7],[-4+i*12,5]],'flow',.6,{opacity:'.4'});
   const living=el('g',{transform:'translate(94,283) scale(1.22)','data-physical-plant':''},rig);
   // Foliage with a mature, branching silhouette, rooted in the planting bed.
   path(living,'M 0 0 C -7 -49 8 -86 0 -130','secondaryDark',3.4);
   path(living,'M -1 -43 Q -23 -58 -31 -78 M 2 -70 Q 26 -77 36 -101 M 1 -99 Q -14 -110 -17 -125','secondaryDark',2);
   for(const [x,y,right]of [[-3,-35,false],[1,-51,true],[-19,-62,false],[18,-78,true],[0,-88,false],[-8,-108,false],[1,-127,true]])leaf(living,x,y,right);
   for(const [x,y]of [[-26,-59],[25,-68],[-10,-99]]){dot(living,x,y,7,'accent');ellipse(living,x-2,y-2,2,2.5,'highlight');}
   line(rig,[[142,290],[142,232]],'dark',2);
   rect(rig,129,208,27,30,'secondaryDark',4);rect(rig,133,212,19,15,'paper',2);
   path(rig,'M 135 220 l 3 -4 l 4 8 l 4 -6 l 4 2','secondary',1.5);
   dot(rig,142,232,2,stage>=1?'accent':'gold');
   path(rig,'M 130 224 C 103 226 123 198 94 196','flow',1.5);dot(rig,94,196,4,'gold');
   if(stage===1||stage===2)for(const r of [10,17])dot(rig,94,196,r,'paper',{fill:'none',stroke:color('gold'),'stroke-width':1,opacity:'.55','data-sensor-ring':''});
   pulse(sync,[[171,226],[180,226],[180,271],[229,271],[229,221]],stage>0&&stage<=4);
   // Large app, not a small symbolic monitor: the plant visibly reacts to the signal.
   const app=el('g',{'data-farm-app':''},sync);
   rect(app,197,81,207,219,'shadow',12,{opacity:'.08'});
   rect(app,192,74,207,219,'secondaryDark',11);
   rect(app,197,79,197,209,'paper',7);
   rect(app,197,79,197,19,'pale',7);
   for(let i=0;i<3;i++)dot(app,207+i*8,88,1.7,i?'edge':'accent');
   rect(app,270,85,64,5,'grid',2);
   rect(app,205,105,181,148,'plane',4,{fill:'url(#farm-display)'});
   path(app,'M 205 230 Q 245 197 290 227 T 386 220','grid',1);
   ellipse(app,250,226,29,8,'shadow',.08);
   const virtual=el('g',{transform:'translate(250,230) scale(.86)','data-virtual-plant':'','data-responsive':String(stage>=3)},app);plant(virtual,true);
   const appAvatar=avatar(app,345,235,1.02);appAvatar.setAttribute('data-linked-avatar','app');
   if(stage>=3){
    bubble(app,354,132,stage>=4?'check':'dots');
    // Measured signal drives the animated state and the activity trace, not plant growth.
    path(app,'M 211 274 L 229 274 L 237 266 L 244 280 L 254 262 L 264 274 L 284 274','secondary',1.8, 'none',{'data-app-wave':''});
   }else path(app,'M 211 274 H 284','edge',1.2);
   rect(app,309,262,67,18,'pale',4);dot(app,319,271,3,stage>=3?'accent':'edge');rect(app,329,268,36,5,'grid',2);
   // Experience 2: a large, continuous farm panorama with an integrated chatbot character.
   const immersive=scene('immersive',1);platform(immersive);
   const panorama=el('g',{'data-panorama':''},immersive);
   const contour='M 40 91 Q 221 32 402 91 L 402 258 Q 221 320 40 258 Z';
   const clip=el('clipPath',{id:'farm-panorama-clip'},defs);el('path',{d:contour},clip);
   path(panorama,contour,'secondaryDark',1.7,'plane',{fill:'url(#farm-glass)'});
   const landscape=el('g',{'clip-path':'url(#farm-panorama-clip)'},panorama);
   path(landscape,'M 28 175 Q 123 139 223 170 T 415 163 L 415 295 L 28 295 Z','secondaryLight',1,'secondaryLight');
   path(landscape,'M 28 208 Q 188 150 415 223 L 415 292 L 28 294 Z','plane',1,'plane');
   // Perspective crop rows and varied tree silhouettes give the view a farm, not a diagram, setting.
   for(let i=0;i<7;i++){
    const bx=55+i*56,tx=165+i*15;
    path(landscape,`M ${bx} 291 Q ${(bx+tx)/2} 215 ${tx} 168`,'secondary',5,'none',{opacity:'.33'});
    for(let j=0;j<5;j++){
     const t=j/5,x=bx+(tx-bx)*t,y=283-107*t,s=1-t*.55;
     const seedling=el('g',{transform:`translate(${x},${y}) scale(${s})`},landscape);
     ellipse(seedling,1,2,10,2.5,'shadow',.08);
     path(seedling,'M 0 1 Q -2 -4 0 -10','secondaryDark',1);
     path(seedling,'M 0 -2 Q -14 -1 -12 -10 Q -4 -12 0 -2','secondaryDark',.65,'secondary');
     path(seedling,'M 0 -3 Q 12 -4 10 -13 Q 2 -14 0 -3','secondaryDark',.65,'secondary');
     path(seedling,'M -8 -8 L 0 -2 L 7 -10','secondaryLight',.65);
    }
   }
   for(const [x,y,h]of [[62,223,105],[108,196,113],[153,178,89],[304,191,101],[354,214,126],[398,223,97]]){
    path(landscape,`M ${x} ${y} L ${x-2} ${y-h*.6}`,'dark',3);
    const crown=el('g',{transform:`translate(${x},${y-h*.7}) scale(1,${h/100})`},landscape);
    path(crown,'M 0 -32 C -11 -32 -17 -19 -14 -9 C -24 4 -13 28 0 31 C 17 27 22 12 15 0 C 20 -14 12 -31 0 -32 Z','secondaryDark',.65,'secondary');
    path(crown,'M -3 -27 C -12 -22 -12 -9 -8 -3 C -15 9 -8 20 -3 23 C 3 8 -1 -10 4 -24 Z','secondaryLight',.5,'secondaryLight');
    line(landscape,[[x,y-h*.45],[x+9,y-h*.68]],'dark',1.2);
   }
   path(landscape,'M 172 296 Q 218 230 229 172','paper',28);
   // Curved latitude guides and the twin-lens camera convey spherical capture without lettering.
   path(panorama,'M 40 132 Q 221 73 402 132 M 40 216 Q 221 276 402 216','paper',1,'none',{opacity:'.55'});
   path(panorama,'M 116 71 Q 77 174 116 278 M 328 70 Q 365 174 328 279','edge',.9,'none',{opacity:'.5'});
   const character=el('g',{'data-panorama-character':'',opacity:stage>=5?1:.45},panorama);
   // Full-size avatar standing in the panorama, with a broad hat and softer clothing silhouette.
   const person=avatar(character,244,264,1.83);person.setAttribute('data-linked-avatar','panorama');
   ellipse(person,0,-70,19,4,'cream');path(person,'M -11 -71 L -8 -82 Q 0 -85 8 -81 L 11 -71','gold',1,'cream');
   if(stage>=5){
    ellipse(character,244,274,29,6,'paper',.4);
    bubble(panorama,292,112,stage===7?'dots':stage===8?'check':'dots');
   }
   const camera=el('g',{transform:'translate(117,284)','data-farm-camera':''},immersive);
   ellipse(camera,1,9,20,5,'shadow',.1);ellipse(camera,0,6,23,7,'paper');rect(camera,-15,-20,30,22,'secondaryDark',5);dot(camera,-6,-9,6,'secondaryLight');dot(camera,6,-9,6,'secondaryLight');dot(camera,-6,-9,3,'ink');dot(camera,6,-9,3,'ink');
   path(camera,'M -28 5 C -34 25 31 25 28 5','gold',2);poly(camera,[[28,5],[23,10],[32,11]],'gold','gold');
   const user=el('g',{'data-farmer':''},immersive);avatar(user,170,321,1.22,true);
   if(stage>=6)bubble(user,145,210,stage===6?'dots':stage===8?'heart':'dots');
   // Conversation alternates between the farmer and the character, instead of crossing the whole diagram.
   if(stage>=6){
    const a=[194,266],b=[219,239],reverse=stage===8;
    path(immersive,'M 194 266 Q 214 268 219 239',stage===8?'secondary':'active',1.4,'none',{'stroke-dasharray':'3 5','data-chatbot-link':''});
    if(stage<8)dot(immersive,...a,3,'accent',{'data-farm-packet':'','data-from':(reverse?b:a).join(','),'data-to':(reverse?a:b).join(',')});
   }
   for(const arm of svg.querySelectorAll('[data-linked-avatar] [data-farm-arm]')){
    arm.setAttribute('transform',stage>=5?'rotate(-12 9 -40)':'rotate(0 9 -40)');
   }
  }
  function notify(){callbacks.story?.({phase:running?'farm':stage?'complete':'idle',step:stage,total:8});}
  function advance(){stage=Math.min(8,stage+1);elapsed=0;if(stage===8)running=false;notify();render();}
  function tick(time){const dt=last?Math.min(time-last,100):0;last=time;if(visible&&running){elapsed+=dt;if(elapsed>=2200)advance();else if(!reduced.matches){
   for(const packet of svg.querySelectorAll('[data-farm-packet]')){const a=packet.dataset.from.split(',').map(Number),b=packet.dataset.to.split(',').map(Number),t=(elapsed%1200)/1200;packet.setAttribute('cx',a[0]+(b[0]-a[0])*t);packet.setAttribute('cy',a[1]+(b[1]-a[1])*t);}
   if(stage===3||stage===4){const plant=svg.querySelector('[data-virtual-plant]');if(plant)plant.setAttribute('transform',`translate(250,230) scale(.86) rotate(${Math.sin(elapsed/360)*2})`);}
   if(stage>=5)for(const arm of svg.querySelectorAll('[data-linked-avatar] [data-farm-arm]'))arm.setAttribute('transform',`rotate(${-12+Math.sin(elapsed/420)*12} 9 -40)`);
   if(stage>=6)for(const arm of svg.querySelectorAll('[data-farmer] [data-farm-arm]'))arm.setAttribute('transform',`rotate(${Math.sin(elapsed/500)*3} 9 -40)`);
  }}frame=requestAnimationFrame(tick);}
  function reset(){stage=0;running=false;elapsed=0;zoom=defaultZoom();pan={x:0,y:0};render();notify();}
  const resize=new ResizeObserver(()=>{zoom=defaultZoom();pan={x:0,y:0};render();});
  resize.observe(host);if(preview)resize.observe(preview);
  svg.addEventListener('pointerdown',e=>{if(mobile.matches)return;drag={x:e.clientX,y:e.clientY,pan:{...pan}};svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!drag||mobile.matches)return;const k=1000/svg.getBoundingClientRect().width/zoom;pan={x:drag.pan.x+(e.clientX-drag.x)*k,y:drag.pan.y+(e.clientY-drag.y)*k};render();});
  for(const type of ['pointerup','pointercancel'])svg.addEventListener(type,()=>{drag=null;});
  frame=requestAnimationFrame(tick);
  return{load(){reset();},play(){stage=1;elapsed=0;running=true;render();notify();},next(){if(running)advance();},reset,select(){},zoom(factor){if(mobile.matches)return;zoom=Math.max(.7,Math.min(2,zoom*factor));render();},setVisible(v){visible=v;last=0;},destroy(){cancelAnimationFrame(frame);resize.disconnect();svg.remove();}};
 };
})();
