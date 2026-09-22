/* Concept illustration: layered shape data -> ontology -> scenario experiences. */
(()=>{
 'use strict';
 window.createSpatialExplorer=(host,callbacks)=>{
  const NS='http://www.w3.org/2000/svg',mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let stage=0,running=false,visible=true,elapsed=0,last=0,frame=0,zoom=1,pan={x:0,y:0},drag=null,diagram;
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('role','img');svg.setAttribute('aria-label','공간정보 레이어와 온톨로지, 시나리오 서비스의 연결');host.append(svg);host.classList.add('spatial-canvas');
  const el=(tag,attrs={},parent=svg)=>{const node=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);parent.append(node);return node;};
  const poly=(g,points,fill,stroke='--scene-border',width=1)=>el('polygon',{points:points.map(p=>p.join(',')).join(' '),fill:`var(${fill})`,stroke:`var(${stroke})`,'stroke-width':width},g);
  const line=(g,points,color='--scene-link',width=2)=>el('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:`var(${color})`,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'},g);
  function render(){
   const W=700,H=820,cx=350,half=278,depth=52;
   svg.replaceChildren();svg.setAttribute('viewBox',`${-pan.x} ${-pan.y} ${W/zoom} ${H/zoom}`);

   const defs=el('defs');
   for(const [id,a,b]of [['map','--scene-paper','--scene-plane'],['ontology','--scene-cream','--scene-paper'],['experience','--scene-paper','--scene-secondary-light']]){
    const gradient=el('linearGradient',{id:'spatial-'+id,x1:'0%',y1:'0%',x2:'100%',y2:'100%'},defs);
    el('stop',{offset:'0%','stop-color':`var(${a})`},gradient);el('stop',{offset:'100%','stop-color':`var(${b})`},gradient);
   }
   const path=(g,d,color,width=1,fill='none',extra={})=>el('path',{d,fill,stroke:`var(${color})`,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...extra},g);
   const rect=(g,x,y,w,h,color,r=3,extra={})=>el('rect',{x,y,width:w,height:h,rx:r,fill:`var(${color})`,...extra},g);
   const dot=(g,x,y,r,color,extra={})=>el('circle',{cx:x,cy:y,r,fill:`var(${color})`,...extra},g);
   // A common coordinate system registers the same geography on every plate.
   const project=(u,v,y)=>[cx+(u-v)*half,y+(u+v)*depth];
   const points=(coords,y)=>coords.map(([u,v])=>project(u,v,y));
   const route=(g,coords,y,color,width,extra={})=>{const n=line(g,points(coords,y),color,width);for(const [k,v]of Object.entries(extra))n.setAttribute(k,v);return n;};
   function boundedSurface(parent,y,key){
    const id='spatial-surface-'+key;
    const clip=el('clipPath',{id,clipPathUnits:'userSpaceOnUse'},defs);
    el('polygon',{points:[[cx-half+3,y],[cx,y-depth+3],[cx+half-3,y],[cx,y+depth-3]].map(p=>p.join(',')).join(' ')},clip);
    return el('g',{'clip-path':`url(#${id})`,'data-surface-content':key},parent);
   }
   function plate(g,y,type,active=false){
    const p=points([[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],y);
    el('ellipse',{cx,cy:y+20,rx:half*.88,ry:depth*.67,fill:'var(--scene-shadow)',opacity:'.05'},g);
    poly(g,[[cx-half,y],[cx,y+depth],[cx,y+depth+7],[cx-half,y+7]],'--scene-tile-side','--scene-edge',.7);
    poly(g,[[cx,y+depth],[cx+half,y],[cx+half,y+7],[cx,y+depth+7]],'--scene-tile-front','--scene-edge',.7);
    const top=poly(g,p,'--scene-paper',active?'--scene-active':type==='ontology'?'--scene-gold':'--scene-border',active?1.8:1);
    top.setAttribute('fill',`url(#spatial-${type})`);
    line(g,[p[3],p[0],p[1]],'--scene-paper',2);
    const grid=boundedSurface(g,y,'grid-'+y);
    for(let i=-3;i<=3;i++){
     route(grid,[[i/8,-.5],[i/8,.5]],y,'--scene-grid',.65,{opacity:'.35'});
     route(grid,[[-.5,i/8],[.5,i/8]],y,'--scene-grid',.65,{opacity:'.35'});
    }
   }
   const river=[[-.5,-.28],[-.32,-.24],[-.12,-.08],[.04,.01],[.11,.21],[.27,.36],[.45,.5]];
   const roads=[[[-.48,.11],[.48,.11]],[[-.13,-.48],[-.13,.46]],[[.31,-.48],[.31,.43]],[[-.45,-.33],[.44,-.33]]];
   const blocks=[[-.34,-.39,20,18,22],[-.24,-.24,19,16,30],[.03,-.38,22,19,38],[.19,-.24,19,15,27],[.4,-.23,16,16,22],[-.34,.29,24,20,19],[-.23,.39,17,16,27],[.12,-.23,15,14,20],[.42,.01,16,15,25]];
   function building(g,x,y,w,d,h){
    el('ellipse',{cx:x+3,cy:y+4,rx:w*.65,ry:d*.35,fill:'var(--scene-shadow)',opacity:'.12'},g);
    poly(g,[[x-w/2,y-h],[x,y-h+d/2],[x,y+d/2],[x-w/2,y]],'--scene-secondary-light','--scene-border',.5);
    poly(g,[[x,y-h+d/2],[x+w/2,y-h],[x+w/2,y],[x,y+d/2]],'--scene-secondary-dark','--scene-border',.5);
    poly(g,[[x-w/2,y-h],[x,y-h-d/2],[x+w/2,y-h],[x,y-h+d/2]],'--scene-paper','--scene-border',.5);
    poly(g,[[x-w*.28,y-h],[x,y-h-d*.28],[x+w*.28,y-h],[x,y-h+d*.28]],'--scene-highlight','--scene-highlight',.5);
    line(g,[[x-w*.4,y-h+1],[x,y-h+d*.4],[x+w*.4,y-h+1]],'--scene-paper',.8);
    poly(g,[[x+2,y+d*.25],[x+5,y+d*.1],[x+5,y-5],[x+2,y-4]],'--scene-ink','--scene-secondary-dark',.4);
    for(let level=6;level<h-4;level+=7){
     line(g,[[x+3,y-level+d*.15],[x+w*.36,y-level-d*.1]],'--scene-secondary-light',1.4);
     line(g,[[x-w*.35,y-level],[x-3,y-level+d*.23]],'--scene-paper',1.3);
    }
   }
   function tree(g,x,y,s=1){
    el('ellipse',{cx:x+2,cy:y+3,rx:9*s,ry:3*s,fill:'var(--scene-shadow)',opacity:'.12'},g);
    path(g,`M ${x} ${y} v ${-15*s}`,'--scene-dark',2*s);
    const crown=el('g',{transform:`translate(${x},${y-17*s}) scale(${s})`},g);
    path(crown,'M 0 -12 C -6 -13 -9 -7 -8 -2 C -12 5 -5 12 0 12 C 8 12 12 4 8 -2 C 10 -7 5 -12 0 -12 Z','--scene-secondary-dark',.5,'var(--scene-secondary)');
    path(crown,'M -2 -10 C -8 -7 -5 -3 -6 1 C -8 6 -3 9 -1 8 Q -4 0 2 -9 Z','--scene-secondary-light',.4,'var(--scene-secondary-light)');
   }
   // Terrain contours follow two elevations rather than decorative concentric circles.
   const ys=[721,655,589,523];
   for(let i=0;i<4;i++){
    const y=ys[i],layer=el('g',{'data-layer':i});plate(layer,y,'map',stage===i+1);
    const g=boundedSurface(layer,y,'features-'+i);
    if(i===0){
     for(const [u,v,rx,ry]of [[-.22,.04,.23,.3],[.23,-.2,.16,.21]])for(let k=0;k<6;k++){
      const scale=1-k*.135,pts=[];
      for(let j=0;j<=60;j++){const a=j/60*Math.PI*2,r=1+.06*Math.cos(a*3)+.04*Math.sin(a*5);pts.push(project(u+Math.cos(a)*rx*scale*r,v+Math.sin(a)*ry*scale*r,y));}
      path(g,'M '+pts.map(p=>p.join(',')).join(' L ')+' Z','--scene-flow',k%3===0?1.1:.6,'none',{opacity:'.75'});
     }
     route(g,river,y,'--scene-secondary-light',2);
    }
    if(i===1){
     route(g,river,y,'--scene-secondary-light',16);
     route(g,river,y,'--scene-secondary',9);
     route(g,[[.36,-.35],[.23,-.18],[.04,.01]],y,'--scene-secondary-light',7);
     route(g,[[.36,-.35],[.23,-.18],[.04,.01]],y,'--scene-secondary',3);
     for(let k=0;k<4;k++){const [x,z]=project(.15+k*.023,.26+k*.026,y);line(g,[[x-3,z],[x+4,z-1]],'--scene-paper',.8);}
    }
    if(i===2){
     for(const r of roads){route(g,r,y,'--scene-border',10);route(g,r,y,'--scene-paper',8);route(g,r,y,'--scene-link',.7,{'stroke-dasharray':'3 5'});}
     for(const [u,v]of [[-.13,.11],[.31,.11],[-.13,-.33]]){const [x,z]=project(u,v,y);dot(g,x,z,3,'--scene-paper',{stroke:'var(--scene-border)','stroke-width':1});}
     for(const [u,v]of [[-.25,.2],[.34,-.1]]){const [x,z]=project(u,v,y);for(let k=0;k<4;k++)line(g,[[x+k*2,z-2],[x+k*2+3,z]],'--scene-paper',1);}
    }
    if(i===3){
     for(const r of roads)route(g,r,y,'--scene-grid',3);
     for(const [u,v,w,d,h]of blocks){const [x,z]=project(u*.82,v*.82,y);building(g,x,z+12,w,d,h*.75);}
     for(const [u,v]of [[.33,.32],[.4,.34],[-.4,.02]]){const [x,z]=project(u,v,y);tree(g,x,z,.6);}
    }
   }
   // Typed entities, relationship diamonds and linked instances form a semantic layer.
   const oy=427,ontology=el('g',{'data-ontology':''});plate(ontology,oy,'ontology',stage>0&&stage<5);
   const og=boundedSurface(ontology,oy,'ontology');
   const entityCoords=[[-.36,-.29],[.04,-.36],[.35,-.16],[-.33,.23],[.02,.05],[.31,.34]],entities=entityCoords.map(([u,v])=>project(u*.72,v*.72,oy));
   const relations=[[0,1],[0,3],[0,4],[1,2],[1,4],[2,4],[2,5],[3,4],[4,5]];
   relations.forEach(([a,b],i)=>{
    const A=entities[a],B=entities[b],active=stage>0&&(i%4===stage-1||stage>=5);
    line(og,[A,B],active?'--scene-active':'--scene-flow',active?1.9:1.1);
    const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;
    poly(og,[[mx-4,my],[mx,my-3],[mx+4,my],[mx,my+3]],'--scene-gold','--scene-flow',.6);
   });
   function icon(g,kind){
    if(kind===0)building(g,0,5,15,9,17);
    if(kind===1){path(g,'M -8 5 L -3 -5 L 4 5 L 9 -4','--scene-secondary-dark',2);dot(g,-8,5,2,'--scene-accent');dot(g,9,-4,2,'--scene-accent');}
    if(kind===2){for(let j=0;j<3;j++)path(g,`M -9 ${-5+j*5} Q -4 ${-9+j*5} 0 ${-5+j*5} T 9 ${-5+j*5}`,'--scene-secondary',1.5);}
    if(kind===3){tree(g,0,8,.75);}
    if(kind===4){dot(g,0,-5,4,'--scene-accent');rect(g,-6,1,12,9,'--scene-accent',4);}
    if(kind===5){rect(g,-9,-9,18,18,'--scene-paper',2,{stroke:'var(--scene-secondary-dark)','stroke-width':1});rect(g,-9,-9,18,5,'--scene-accent',2);for(const [x,y]of [[-4,0],[3,0],[-4,5],[3,5]])dot(g,x,y,1.2,'--scene-gold');}
   }
   entities.forEach(([x,y],i)=>{
    el('ellipse',{cx:x+1,cy:y+3,rx:21,ry:10,fill:'var(--scene-shadow)',opacity:'.1'},og);
    const hex=Array.from({length:6},(_,n)=>[x+22*Math.cos(n*Math.PI/3),y+15*Math.sin(n*Math.PI/3)]);
    if(i!==4){
     const dx=i%2?30:-30,dy=15,sx=x+dx,sy=y+dy;
     // Intersect the centre-to-instance ray with the actual hexagon boundary.
     const halfHeight=15*Math.sin(Math.PI/3);
     const t=1/Math.max(Math.abs(dx)/22+Math.abs(dy)/(2*halfHeight),Math.abs(dy)/halfHeight);
     const length=Math.hypot(dx,dy),end=1-3.6/length;
     line(og,[[x+dx*t,y+dy*t],[x+dx*end,y+dy*end]],'--scene-flow',.8).setAttribute('data-instance-edge','');
     dot(og,sx,sy,3,'--scene-paper',{stroke:'var(--scene-gold)','stroke-width':1.2});
    }
    poly(og,hex,'--scene-paper',i===4?'--scene-active':'--scene-gold',1.2);
    const glyph=el('g',{transform:`translate(${x},${y-2}) scale(.85)`},og);icon(glyph,i);

   });
   // Pulses rise from the registered feature layers into their semantic entities.
   for(let i=0;i<4;i++){
    const x=cx+half-12-i*10,from=ys[i]+3,to=oy+8;
    line(svg,[[x,from],[x,to]],stage===i+1?'--scene-active':'--scene-edge',stage===i+1?1.6:.65).setAttribute('opacity',stage===i+1?'1':'.45');
    if(stage===i+1)for(const reverse of [false,true]){
     const t=reduced.matches ? 0.5 :(elapsed%1400)/1400;
     dot(svg,x+(reverse?-3:3),from+(to-from)*(reverse?1-t:t),3.3,reverse?'--scene-secondary':'--scene-active',{'data-from':from,'data-to':to,'data-packet':reverse?'return':'input'});
    }
   }
   // The upper platform is a lived-in miniature, with a map interface as its backdrop.
   const ui=el('g',{'data-scenario-ui':''});plate(ui,276,'experience',stage>=5);
   line(svg,[[cx+125,oy-35],[cx+125,322]],stage>=5?'--scene-active':'--scene-edge',1.5);
   const screen=el('g',{'data-service-screen':''},ui);
   const sx=196,sy=30,sw=308,sh=174;
   rect(screen,sx+5,sy+6,sw,sh,'--scene-shadow',10,{opacity:'.1'});
   rect(screen,sx,sy,sw,sh,'--scene-secondary-dark',9);
   rect(screen,sx+5,sy+5,sw-10,sh-10,'--scene-paper',6);
   rect(screen,sx+5,sy+5,sw-10,20,'--scene-pale',5);
   for(let i=0;i<3;i++)dot(screen,sx+15+i*9,sy+15,2,i===0?'--scene-accent':'--scene-edge');
   rect(screen,sx+112,sy+11,88,7,'--scene-grid',3);
   const map=el('g',{transform:`translate(${sx+16},${sy+36})`},screen);
   rect(map,0,0,276,120,'--scene-plane',3);
   path(map,'M 0 70 C 55 30 91 88 142 62 S 212 17 276 34','--scene-secondary-light',18);
   path(map,'M 0 70 C 55 30 91 88 142 62 S 212 17 276 34','--scene-secondary',8);
   for(const x of [42,103,176,231])path(map,`M ${x} 0 V 120`,'--scene-paper',7);
   for(const y of [24,93])path(map,`M 0 ${y} H 276`,'--scene-paper',7);
   for(const [x,y,w,h]of [[8,4,22,12],[54,36,32,16],[118,5,36,12],[186,48,28,30],[243,64,23,19],[54,101,30,11],[119,99,39,13]])rect(map,x,y,w,h,'--scene-tile-front',2,{opacity:'.6'});
   const pin=(g,x,y,color='--scene-accent')=>{path(g,`M ${x} ${y+12} C ${x-19} ${y-6} ${x-9} ${y-17} ${x} ${y-17} C ${x+9} ${y-17} ${x+19} ${y-6} ${x} ${y+12} Z`,color,1,`var(${color})`);dot(g,x,y-6,4,'--scene-paper');};
   if(stage===5){
    path(map,'M 42 103 V 93 H 103 V 24 H 176 V 48','--scene-paper',8);
    path(map,'M 42 103 V 93 H 103 V 24 H 176 V 48','--scene-active',3, 'none',{'data-result-route':''});
    dot(map,42,103,5,'--scene-paper',{stroke:'var(--scene-active)','stroke-width':2});pin(map,176,42);
   }else if(stage===6){
    rect(map,111,34,56,49,'--scene-secondary-light',5);tree(map,126,64,.7);tree(map,151,73,.7);
    const event=el('g',{transform:'translate(187,26)'},map);rect(event,-17,-17,34,32,'--scene-paper',4,{stroke:'var(--scene-gold)','stroke-width':1.5});rect(event,-17,-17,34,8,'--scene-accent',3);
    for(const x of [-8,0,8])for(const y of [-1,7])dot(event,x,y,2,'--scene-gold');
    pin(map,139,43,'--scene-gold');
   }else if(stage===7){
    pin(map,103,34);pin(map,231,78,'--scene-secondary-dark');
    const card=el('g',{transform:'translate(140,34)'},map);rect(card,0,0,102,48,'--scene-paper',5,{stroke:'var(--scene-border)','stroke-width':1});dot(card,15,17,8,'--scene-gold');path(card,'M 11 17 l 3 3 l 5 -6','--scene-dark',1.8);rect(card,30,12,58,5,'--scene-grid',2);rect(card,30,23,41,4,'--scene-grid',2);rect(card,10,36,79,4,'--scene-secondary-light',2);
   }else{dot(map,103,24,5,'--scene-accent');dot(map,231,93,5,'--scene-secondary-dark');}
   // Integrated screen supports; no freestanding explanatory text.
   poly(ui,[[302,204],[316,204],[316,229],[302,229]],'--scene-tile-front');
   poly(ui,[[384,204],[398,204],[398,229],[384,229]],'--scene-tile-front');
   poly(ui,[[280,231],[350,216],[420,231],[350,248]],'--scene-paper','--scene-border',1);
   for(const [u,v]of [[-.38,.23],[.37,-.31]]){const [x,y]=project(u,v,276);tree(ui,x,y,1.15);}
   // Rounded clothed silhouettes follow the site's existing miniature proportions.
   const people=el('g',{'data-citizens':'','data-happy':String(stage>=5)},ui);
   const citizens=[[219,280,.95,0],[298,309,1.06,1],[402,301,1.02,2],[486,270,.92,3]];
   citizens.forEach(([x,y,scale,i])=>{
    const person=el('g',{'data-person':i,'data-x':x,'data-base':y,'data-scale':scale,transform:`translate(${x},${y}) scale(${scale})`},people);
    el('ellipse',{cx:1,cy:3,rx:15,ry:5,fill:'var(--scene-shadow)',opacity:'.12'},person);
    const feminine=i===1||i===3;
    person.setAttribute('data-person-style',feminine?'long-hair':'short-hair');
    const shirt=i%2?'--scene-secondary-dark':'--scene-accent';
    if(feminine)path(person,'M -10 -54 Q -13 -69 0 -69 Q 13 -68 12 -54 L 14 -39 Q 8 -35 3 -41 L -11 -40 Z','--scene-dark',1,'var(--scene-dark)');
    path(person,'M -6 -19 L -7 -3 M 6 -19 L 7 -3','--scene-dark',6);
    path(person,'M -8 -2 L -12 0 M 6 -2 L 10 0','--scene-ink',4);
    path(person,feminine?'M -8 -41 Q 0 -45 8 -41 L 7 -31 L 14 -15 Q 0 -11 -14 -15 L -7 -31 Z':'M -9 -41 Q 0 -45 9 -41 L 11 -21 Q 0 -16 -11 -21 Z',shirt,1,`var(${shirt})`);
    path(person,'M -6 -40 L -4 -23','--scene-paper',1,'none',{opacity:'.25'});
    rect(person,-3,-48,6,7,'--scene-skin',2);
    el('ellipse',{cx:0,cy:-55,rx:9,ry:10,fill:'var(--scene-skin)'},person);
    path(person,feminine?'M -9 -54 Q -12 -68 0 -67 Q 12 -66 9 -55 L 4 -60 Q -1 -57 -9 -54 Z':'M -9 -55 Q -10 -69 3 -67 Q 12 -66 9 -58 Q 3 -64 -5 -58 Z','--scene-dark',1,'var(--scene-dark)');
    for(const eyeX of [-2,4])dot(person,eyeX,-54,.9,'--scene-dark',{'data-person-eye':''});
    path(person,'M 1 -53 l 1 2 l -1 0','--scene-flow',.6);
    path(person,stage>=5?'M -2 -48 Q 1 -45 4 -48':'M -2 -48 Q 1 -47 4 -48','--scene-dark',.85);
    path(person,'M -4 -41 Q 0 -37 4 -41','--scene-paper',1.1);
    path(person,'M -9 -38 Q -15 -32 -13 -26',shirt,6);
    dot(person,-13,-24,3,'--scene-skin');
    const arm=el('g',{'data-arm':i},person);
    path(arm,'M 9 -38 Q 17 -33 18 -43',shirt,6);dot(arm,18,-44,3,'--scene-skin');
    rect(arm,14,-54,10,15,'--scene-ink',2);rect(arm,16,-52,6,10,'--scene-paper',1);dot(arm,19,-40,.55,'--scene-border');
    if(stage>=5){
     const bubble=el('g',{transform:'translate(8,-86)'},person);rect(bubble,-14,-10,28,22,'--scene-paper',6,{stroke:'var(--scene-border)','stroke-width':1});poly(bubble,[[1,11],[5,16],[7,11]],'--scene-paper','--scene-paper',.5);
     if(i%2===0)path(bubble,'M -6 1 L -1 6 L 7 -4','--scene-secondary-dark',2.3);
     else path(bubble,'M 0 6 C -15 -2 -5 -10 0 -4 C 5 -10 15 -2 0 6 Z','--scene-accent',1,'var(--scene-accent)');
    }
   });
  }
  function notify(){callbacks.story?.({phase:running?'spatial':stage?'complete':'idle',step:stage,total:7});}
  function advance(){stage=Math.min(7,stage+1);elapsed=0;if(stage===7)running=false;notify();render();}
  function tick(time){const dt=last?Math.min(100,time-last):0;last=time;if(visible&&running){elapsed+=dt;if(elapsed>=2400)advance();else if(!reduced.matches){
    for(const packet of svg.querySelectorAll('[data-packet]')){const t=(elapsed%1400)/1400,a=Number(packet.dataset.from),b=Number(packet.dataset.to);packet.setAttribute('cy',a+(b-a)*(packet.dataset.packet==='return'?1-t:t));}
    if(stage>=5)for(const arm of svg.querySelectorAll('[data-arm]'))arm.setAttribute('transform',`rotate(${Math.sin(elapsed/480+Number(arm.dataset.arm))*4} 9 -38)`);
   }}frame=requestAnimationFrame(tick);}
  function reset(){stage=0;running=false;elapsed=0;zoom=1;pan={x:0,y:0};notify();render();}
  // Match the earlier canvases: Ctrl+wheel zooms around the cursor.
  const wheelHandler=event=>{
   if(mobile.matches||!event.ctrlKey||event.deltaY===0)return;
   event.preventDefault();
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const cursor=new DOMPoint(event.clientX,event.clientY);
   const before=cursor.matrixTransform(matrix.inverse());
   const nextZoom=Math.max(.7,Math.min(2,zoom*(event.deltaY>0?.9:1.1)));
   if(nextZoom===zoom)return;
   zoom=nextZoom;render();
   const after=cursor.matrixTransform(svg.getScreenCTM().inverse());
   pan={x:pan.x+after.x-before.x,y:pan.y+after.y-before.y};
   render();
  };
  host.addEventListener("wheel",wheelHandler,{passive:false});
  const resize=new ResizeObserver(()=>{pan={x:0,y:0};zoom=1;render();});resize.observe(host);
  const down=e=>{if(mobile.matches)return;drag={x:e.clientX,y:e.clientY,pan:{...pan}};svg.setPointerCapture(e.pointerId);};
  const move=e=>{if(!drag||mobile.matches)return;const ratio=700/svg.getBoundingClientRect().width/zoom;pan={x:drag.pan.x+(e.clientX-drag.x)*ratio,y:drag.pan.y+(e.clientY-drag.y)*ratio};render();};
  const up=()=>{drag=null;};svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
  frame=requestAnimationFrame(tick);
  return {load(value){diagram=value;reset();},play(){stage=1;elapsed=0;running=true;notify();render();},next(){if(running)advance();},reset,select(){},zoom(factor){if(mobile.matches)return;zoom=Math.max(.7,Math.min(2,zoom*factor));render();},setVisible(value){visible=value;last=0;},destroy(){host.removeEventListener("wheel",wheelHandler);cancelAnimationFrame(frame);resize.disconnect();svg.remove();}};
 };
})();
