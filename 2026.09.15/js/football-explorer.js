/* Football tactics and ontology reasoning: a conceptual animation, not a game engine. */
(()=>{
 'use strict';
 window.createFootballExplorer=(host,callbacks)=>{
  const NS='http://www.w3.org/2000/svg';
  const mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const duration=1800;
  let cycle=0,stage=0,running=false,paused=false,visible=true,elapsed=0,last=0,frame=0,zoom=1,pan={x:0,y:0},drag=null,destroyed=false;
  host.classList.add('football-canvas');
  const svg=document.createElementNS(NS,'svg');host.append(svg);
  svg.setAttribute('role','img');svg.setAttribute('aria-label','축구 보드의 패스 관계를 추론하고 AI 학습 상대의 한 수로 연결하는 개념 애니메이션');
  const C=n=>'var(--scene-'+n+')';
  function el(tag,attrs={},parent=svg){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;}
  const set=(n,a)=>{for(const [k,v]of Object.entries(a))n.setAttribute(k,v);};
  const path=(d,stroke='edge',width=1.5,fill='none',parent=world,attrs={})=>el('path',{d,stroke:C(stroke),'stroke-width':width,fill:fill==='none'?'none':C(fill),'stroke-linecap':'round','stroke-linejoin':'round',...attrs},parent);
  const label=(p,x,y,value,size=14,fill='ink',weight=500)=>{const n=el('text',{x,y,'font-size':size,fill:C(fill),'font-weight':weight,'text-anchor':'middle'},p);n.textContent=value;return n;};
  const circle=(p,x,y,r,fill,attrs={})=>el('circle',{cx:x,cy:y,r,fill:C(fill),...attrs},p);
  const world=el('g',{'font-family':'var(--font-body)'});
  const board=el('g',{'data-football-board':''},world),graph=el('g',{'data-football-graph':''},world);
  const project=(x,y)=>[240+x*.8-y*.62,32+x*.30+y*.39];
  const polygon=(points,fill,stroke,parent,extra={})=>el('polygon',{points:points.map(p=>p.join(',')).join(' '),fill:C(fill),stroke:C(stroke),'stroke-width':1.2,...extra},parent);
  const corners=[[0,0],[500,0],[500,340],[0,340]].map(p=>project(...p));
  // A shallow board slab, with restrained material and contact shadows.
  el('ellipse',{cx:335,cy:327,rx:264,ry:27,fill:C('shadow'),opacity:.055},board);
  polygon([corners[1],corners[2],corners[3],...([corners[3],corners[2],corners[1]].map(([x,y])=>[x,y+15]))],'tile-front','border',board);
  polygon(corners,'plane-secondary','border',board);
  const pitch=el('g',{transform:'matrix(.8 .30 -.62 .39 240 32)'},board);
  for(let x=0;x<500;x+=100)el('rect',{x,y:0,width:50,height:340,fill:C('paper'),opacity:.55},pitch);
  for(let x=25;x<500;x+=50)path('M '+x+' 20 V 320','grid',1,'none',pitch);
  for(let y=20;y<=320;y+=50)path('M 25 '+y+' H 475','grid',1,'none',pitch);
  el('rect',{x:20,y:20,width:460,height:300,fill:'none',stroke:C('secondary-dark'),'stroke-width':2},pitch);
  path('M 250 20 V 320','secondary-dark',2,'none',pitch);
  circle(pitch,250,170,56,'paper',{fill:'none',stroke:C('secondary-dark'),'stroke-width':2});
  circle(pitch,250,170,3,'secondary-dark');
  for(const x of [20,410])el('rect',{x,y:100,width:70,height:140,fill:'none',stroke:C('secondary-dark'),'stroke-width':2},pitch);
  for(const x of [20,455])el('rect',{x,y:132,width:25,height:76,fill:'none',stroke:C('secondary-dark'),'stroke-width':2},pitch);
  // Goal nets are drawn above the pitch plane.
  for(const side of [0,500]){
   const a=project(side,135),b=project(side,205),dx=side?18:-18;
   polygon([a,b,[b[0]+dx,b[1]-28],[a[0]+dx,a[1]-28]],'paper','edge',board,{opacity:.85});
   for(let i=1;i<4;i++){const t=i/4;path('M '+(a[0]+(b[0]-a[0])*t)+' '+(a[1]+(b[1]-a[1])*t)+' l '+dx+' -28','grid',1,'none',board);}
   path('M '+a.join(' ')+' l '+dx+' -28 L '+(b[0]+dx)+' '+(b[1]-28)+' L '+b.join(' '),'secondary-dark',2,'none',board);
  }
  const positions=[[80,165],[160,75],[215,230],[300,95],[370,235],[430,125]];
  const pos=positions.map(p=>project(...p));
  const routes=el('g',{},board);
  const routeDefs=[[0,1],[0,2],[1,3],[2,3],[2,4]];
  const routePaths=routeDefs.map(([a,b])=>{
   const [x,y]=pos[a],[u,v]=pos[b];
   return path('M '+x+' '+(y-7)+' Q '+((x+u)/2)+' '+((y+v)/2-35)+' '+u+' '+(v-7),'secondary',2.5,'none',routes,{'stroke-dasharray':'5 7',opacity:0});
  });
  const chosen=path('M '+(pos[1][0]+18)+' '+(pos[1][1]-24)+' Q '+(pos[2][0]+70)+' '+(pos[1][1]-35)+' '+(pos[2][0]+18)+' '+(pos[2][1]-24),'accent',3.5,'none',routes,{opacity:0});
  const target=project(275,180);
  const responsePath=path('M '+pos[5][0]+' '+pos[5][1]+' Q '+(target[0]+35)+' '+(target[1]+25)+' '+target.join(' '),'secondary-dark',2,'none',routes,{'stroke-dasharray':'4 6',opacity:0});
  const halo=circle(board,pos[0][0],pos[0][1],26,'cream',{opacity:.65,stroke:C('gold'),'stroke-width':1.5});
  function token(index){
   const g=el('g',{'data-football-piece':index},board),blue=index>=3;
   el('ellipse',{cx:0,cy:5,rx:19,ry:9,fill:C('shadow'),opacity:.13},g);
   el('ellipse',{cx:0,cy:0,rx:18,ry:10,fill:C(blue?'secondary-dark':'dark')},g);
   el('rect',{x:-18,y:-9,width:36,height:9,fill:C(blue?'secondary-dark':'dark')},g);
   el('ellipse',{cx:0,cy:-10,rx:18,ry:10,fill:C(blue?'secondary':'accent'),stroke:C('paper'),'stroke-width':1.5},g);
   el('ellipse',{cx:0,cy:-11,rx:12,ry:6.5,fill:'none',stroke:C(blue?'secondary-light':'highlight'),'stroke-width':1},g);
   label(g,0,-7,String(index+1),11,'ink',700);
   return g;
  }
  const pieces=positions.map((_,i)=>token(i));
  const ball=el('g',{'data-football-ball':''},board);
  el('ellipse',{cx:0,cy:10,rx:10,ry:4,fill:C('shadow'),opacity:.16},ball);
  circle(ball,0,0,9,'paper',{stroke:C('ink'),'stroke-width':1});
  path('M 0 -4 L 4 -1 L 2 4 H -3 L -5 -1 Z','ink',.5,'ink',ball);
  path('M 0 -4 V -8 M 4 -1 L 8 -3 M 2 4 L 5 7 M -3 4 L -6 6 M -5 -1 L -8 -3','ink',.8,'none',ball);
  // The compact reasoning scene uses the same semantic color roles as the board.
  const graphEdges=el('g',{},graph);
  const inputs=[[48,24],[144,24],[240,24]];
  const edges=['M 48 48 C 48 80 117.13 76 117.13 105.13','M 144 48 V 94','M 240 48 C 240 80 170.87 76 170.87 105.13'].map(d=>path(d,'secondary',2,'none',graphEdges));
  const feed=path('M 0 0','accent',2,'none',world,{'data-football-feed':''});
  const back=path('M 0 0','secondary',2,'none',world,{'stroke-dasharray':'4 7','data-football-return':'',opacity:0});
  const inputGroups=inputs.map(([x,y],i)=>{
   const g=el('g',{transform:'translate('+x+' '+y+')'},graph);
   el('rect',{x:-28,y:-24,width:56,height:48,rx:6,fill:C('paper'),stroke:C('edge')},g);
   if(i===0){circle(g,0,-7,5,'accent');path('M -10 9 Q -10 -1 0 -1 Q 10 -1 10 9','accent',2,'none',g);}
   if(i===1){polygon([[-10,-7],[0,-13],[10,-7],[0,-1]],'secondary-light','secondary-dark',g);path('M -10 -1 L 0 5 L 10 -1 M -10 5 L 0 11 L 10 5','secondary-dark',1.3,'none',g);}
   if(i===2){path('M -10 -8 H 10 M -10 0 H 10 M -10 8 H 10','secondary-dark',1.2,'none',g);for(const [a,b]of [[-3,-8],[5,0],[-5,8]])circle(g,a,b,2.5,'paper',{stroke:C('secondary-dark'),'stroke-width':1.2});}
   return g;
  });
  const core=el('g',{transform:'translate(144 132)'},graph);
  const coreRing=circle(core,0,0,38,'plane',{stroke:C('secondary'),'stroke-width':1.5});
  polygon([[0,-30],[26,-15],[26,15],[0,30],[-26,15],[-26,-15]],'paper','secondary',core);
  for(const [x,y]of [[0,-16],[-15,9],[15,9]]){path('M 0 0 L '+x+' '+y,'secondary',1.5,'none',core);circle(core,x,y,4,'secondary-light',{stroke:C('secondary-dark')});}
  circle(core,0,0,6,'gold',{stroke:C('flow'),'stroke-width':1});
  const outEdge=path('M 144 170 V 202','secondary',2,'none',graph);
  const output=el('g',{transform:'translate(144 230)'},graph);
  const outputBox=el('rect',{x:-32,y:-28,width:64,height:56,rx:6,fill:C('plane-result'),stroke:C('gold')},output);
  path('M 0 -16 V -21','secondary-dark',1.5,'none',output);circle(output,0,-22,2,'gold');
  el('rect',{x:-16,y:-13,width:32,height:25,rx:6,fill:C('paper'),stroke:C('secondary-dark'),'stroke-width':1.5},output);
  circle(output,-6,-2,2.5,'secondary-dark');circle(output,6,-2,2.5,'secondary-dark');
  path('M -5 6 H 5 M -21 -5 V 4 M 21 -5 V 4 M -10 18 H 10','secondary-dark',1.5,'none',output);
  const packets=edges.map(()=>circle(graph,0,0,4,'gold',{opacity:0,stroke:C('paper'),'stroke-width':1.5}));
  const returnPacket=circle(world,0,0,4,'secondary',{opacity:0});
  const feedPacket=circle(world,0,0,4,'accent',{opacity:0});
  const outputPacket=circle(graph,144,170,4,'gold',{opacity:0});
  const feedArrow=path('M -6 -3 L 0 0 L -6 3 Z','accent',.75,'accent',world);
  const backArrow=path('M -6 -3 L 0 0 L -6 3 Z','secondary',.75,'secondary',world);
  const boardPort=circle(world,0,0,4,'secondary',{stroke:C('paper'),'stroke-width':1.5});
  const lengths=edges.map(p=>p.getTotalLength()),chosenLength=chosen.getTotalLength();
  chosen.setAttribute('stroke-dasharray',chosenLength);
  let W=1000,H=480,backLength=0,feedLength=0;
  function layout(){
   const narrow=mobile.matches;
   W=narrow?440:1000;H=narrow?550:480;
   // Reference composition: keep the board centered beneath the reasoning group.
   set(world,{transform:narrow?"translate(0 0)":"translate(122 35) scale(.9)"});
   set(board,{transform:narrow?'translate(-8 0) scale(.69)':'translate(20 90) scale(.92)'});
   set(graph,{transform:narrow?'translate(76 280)':'translate(430 22) scale(.62)'});
   const end=narrow?project(500,260):project(350,0);
   const x=narrow?-8+end[0]*.69:20+end[0]*.92;
   const y=narrow?end[1]*.69:90+end[1]*.92;
   const startX=narrow?188:430+144*.62,startY=narrow?510:22+258*.62;
   const d=narrow?'M '+startX+' '+startY+' H 48 Q 24 510 24 486 V 268 Q 24 252 48 252 H '+x+' V '+y:'M '+startX+' '+startY+' V '+(y-16)+' Q '+startX+' '+y+' '+x+' '+y;
   back.setAttribute('d',d);backLength=back.getTotalLength();
   set(boardPort,{cx:x,cy:y});
   const source=narrow?project(500,90):project(210,0);
   const sx=narrow?-8+source[0]*.69:20+source[0]*.92,sy=narrow?source[1]*.69:90+source[1]*.92;
   const tx=narrow?344:430+20*.62,ty=narrow?304:22+24*.62;
   feed.setAttribute('d',narrow?'M '+sx+' '+sy+' H 410 Q 426 '+sy+' 426 '+(sy+16)+' V 284 Q 426 304 406 304 H '+tx:'M '+sx+' '+sy+' H 406 Q 418 '+sy+' 418 '+(sy-12)+' V '+(ty+12)+' Q 418 '+ty+' '+tx+' '+ty);
   feedLength=feed.getTotalLength();
   for(const [p,a,length]of [[feed,feedArrow,feedLength],[back,backArrow,backLength]]){
    const inset=p===back?8:4;
    const q=p.getPointAtLength(Math.max(0,length-inset)),r=p.getPointAtLength(Math.max(0,length-inset-2));
    set(a,{transform:'translate('+q.x+' '+q.y+') rotate('+(Math.atan2(q.y-r.y,q.x-r.x)*180/Math.PI)+')'});
   }
   camera();
  }
  function camera(){svg.setAttribute('viewBox',[W*(1-1/zoom)/2-pan.x,H*(1-1/zoom)/2-pan.y,W/zoom,H/zoom].join(' '));}
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const mix=(a,b,t)=>a+(b-a)*t;
  function update(){
   const s=stage,u=reduced.matches?1:Math.min(1,elapsed/duration),t=ease(u);
   const previous=cycle%2?target:pos[5],destination=cycle%2?pos[5]:target;
   const response=s===4?ease((u-.62)/.38):0;
   pieces.forEach((p,i)=>{const at=i===5?[mix(previous[0],destination[0],response),mix(previous[1],destination[1],response)]:pos[i];set(p,{transform:'translate('+at.join(' ')+')'});});
   const from=cycle===0?pos[0]:cycle%2?pos[1]:pos[2],to=cycle%2?pos[2]:pos[1];
   const move=s===0?0:s===1?t:1;
   const ballAt=[mix(from[0],to[0],move)+18,mix(from[1],to[1],move)-24-Math.sin(move*Math.PI)*12];
   set(ball,{transform:'translate('+ballAt.join(' ')+') rotate('+(move*150)+')'});
   const active=s===4&&u>.62?[mix(previous[0],destination[0],response),mix(previous[1],destination[1],response)]:s?to:from;
   set(halo,{cx:active[0],cy:active[1],r:24+(running&&!reduced.matches?Math.sin(elapsed/120)*2:0)});
   routePaths.forEach(p=>set(p,{opacity:s?.32:0,'stroke-dashoffset':reduced.matches?0:-elapsed/65}));
   set(chosen,{opacity:cycle>0&&s===1?.7:0,'stroke-dashoffset':chosenLength*(1-t)});
   const dx=destination[0]-previous[0],dy=destination[1]-previous[1],distance=Math.hypot(dx,dy);
   const trim=18/distance;
   responsePath.setAttribute('d','M '+mix(previous[0],destination[0],trim)+' '+mix(previous[1],destination[1],trim)+' L '+mix(previous[0],destination[0],1-trim)+' '+mix(previous[1],destination[1],1-trim));
   set(responsePath,{opacity:s===4?.8:0});
   set(feed,{opacity:s?.85:.35});set(back,{opacity:s?.85:.35,'stroke-dashoffset':reduced.matches?0:-elapsed/75});
   set(coreRing,{fill:C(s===3?'cream':'plane'),stroke:C(s===3?'gold':'secondary'),'stroke-width':s===3?2.5:1.5});
   inputGroups.forEach(g=>set(g.firstElementChild,{stroke:C(s===2&&u>.75?'accent':'edge')}));
   packets.forEach((p,i)=>{const point=edges[i].getPointAtLength(lengths[i]*ease(u/.65));set(p,{cx:point.x,cy:point.y,opacity:s===3&&u<.7?1:0});});
   const forward=feed.getPointAtLength(feedLength*t);set(feedPacket,{cx:forward.x,cy:forward.y,opacity:s===2?1:0});
   set(outputPacket,{cy:170+32*ease((u-.65)/.35),opacity:s===3&&u>=.65?1:0});
   const r=back.getPointAtLength(backLength*ease(u/.62));set(returnPacket,{cx:r.x,cy:r.y,opacity:s===4&&u<=.65?1:0});
   set(boardPort,{r:s===4&&u>.6?4+Math.sin((u-.6)/.4*Math.PI)*5:4});
   set(outputBox,{fill:C(s===4?'cream':'plane-result'),'stroke-width':s===4?2:1});
   svg.dataset.cycle=String(cycle);svg.dataset.stage=String(stage);
  }
  function notify(){
   callbacks.story?.({phase:paused?'paused':running?'football':stage?'complete':'idle',step:stage,total:4});
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function schedule(){if(!frame&&running&&visible&&!document.hidden&&!destroyed)frame=requestAnimationFrame(tick);}
  function tick(time){frame=0;const dt=last?Math.min(time-last,100):0;last=time;elapsed+=dt;if(elapsed>=duration){if(stage<4){stage++;elapsed=0;notify();}else{cycle++;stage=1;elapsed=0;notify();}}update();schedule();}
  function reset(){stop();cycle=0;stage=0;running=false;paused=false;elapsed=0;zoom=1;pan={x:0,y:0};layout();update();notify();}
  function play(){stop();cycle=0;stage=1;running=true;paused=false;elapsed=0;update();notify();schedule();}
  function next(){if(!running)return;if(stage<4){stage++;elapsed=0;}else{cycle++;stage=1;elapsed=0;}update();notify();}
  function visibility(){last=0;if(document.hidden)stop();else schedule();}
  function responsive(){zoom=1;pan={x:0,y:0};layout();update();}
  function pointerDown(e){if(mobile.matches||e.button!==0)return;drag={x:e.clientX,y:e.clientY,pan:{...pan}};svg.setPointerCapture(e.pointerId);}
  function pointerMove(e){if(!drag)return;const rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/W,rect.height/H)*zoom;pan={x:drag.pan.x+(e.clientX-drag.x)/scale,y:drag.pan.y+(e.clientY-drag.y)/scale};camera();}
  function pointerUp(){drag=null;}
  svg.addEventListener('pointerdown',pointerDown);svg.addEventListener('pointermove',pointerMove);
  svg.addEventListener('pointerup',pointerUp);svg.addEventListener('pointercancel',pointerUp);
  // Match the earlier canvases: Ctrl+wheel zooms around the cursor.
  const wheelHandler=event=>{
   if(mobile.matches||!event.ctrlKey||event.deltaY===0)return;
   event.preventDefault();
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const cursor=new DOMPoint(event.clientX,event.clientY);
   const before=cursor.matrixTransform(matrix.inverse());
   const nextZoom=Math.max(.7,Math.min(1.8,zoom*(event.deltaY>0?.9:1.1)));
   if(nextZoom===zoom)return;
   zoom=nextZoom;camera();
   const after=cursor.matrixTransform(svg.getScreenCTM().inverse());
   pan={x:pan.x+after.x-before.x,y:pan.y+after.y-before.y};
   camera();
  };
  host.addEventListener("wheel",wheelHandler,{passive:false});
  const resize=new ResizeObserver(layout);resize.observe(host);
  mobile.addEventListener('change',responsive);reduced.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);
  return{load:reset,play,next,reset,select(){if(running){stop();running=false;paused=true;notify();}},zoom(f){if(!mobile.matches){zoom=Math.max(.7,Math.min(1.8,zoom*f));camera();}},setVisible(v){visible=v;last=0;if(v)schedule();else stop();},destroy(){host.removeEventListener("wheel",wheelHandler);destroyed=true;stop();resize.disconnect();mobile.removeEventListener('change',responsive);reduced.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();}};
 };
})();
