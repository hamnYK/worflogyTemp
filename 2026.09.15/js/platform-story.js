/* Platform demonstration based on company-provided workflow.
   Source events, competency scores and learning are illustrative; no external systems are called. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawPlatformObject=function(scene,node,state={}){
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,color=INK,w=2)=>{g.lineStyle(w,color,1);g.lineBetween(...a,...b);};
 const box=(x,y,w,h,color=INK)=>{g.lineStyle(2,color,1);g.strokeRoundedRect(x,y,w,h,4);};
 const dot=(x,y,r=4,color=INK)=>{g.fillStyle(color,1);g.fillCircle(x,y,r);};
 const person=(x,y,color=INK)=>{dot(x,y-9,6,color);g.fillStyle(color,1);g.fillRoundedRect(x-8,y,16,13,4);};
 const check=(x,y)=>{line([x-7,y],[x-1,y+6],GOLD,3);line([x-1,y+6],[x+11,y-8],GOLD,3);};
 if(id==="profile"){
   box(-35,-32,70,58,BLUE);person(-18,-6);
   [-18,-5,8].forEach((y,i)=>{line([0,y],[24,y],BLUE);dot(4+i*8,y,2,GOLD);});
   line([-29,35],[29,35],BLUE);[-24,-7,10,27].forEach(x=>dot(x,35,3,BLUE));
 }else if(id==="events"){
   [[-25,-25],[0,-5],[25,15]].forEach(([x,y],i)=>{
     g.fillStyle(0xffffff,1);g.fillRoundedRect(x-16,y-17,32,33,4);box(x-16,y-17,32,33,BLUE);
     if(i===0){line([x-6,y+8],[x-6,y-8]);line([x-6,y],[x+6,y-7]);dot(x-6,y+8,2);dot(x-6,y-8,2);dot(x+6,y-7,2);}
     if(i===1){line([x,y-10],[x,y+2],GOLD,3);dot(x,y+8,2,GOLD);}
     if(i===2){box(x-10,y-9,20,13);line([x-6,y+4],[x-9,y+10]);}
   });
 }else if(id==="position"){
   person(0,-20);line([0,-3],[0,8],BLUE);
   [-27,0,27].forEach((x,i)=>{line([0,8],[x,8],BLUE);line([x,8],[x,18],BLUE);box(x-10,18,20,22,i===1?GOLD:BLUE);});
   if(state.assigned)check(0,29);
 }else if(id==="guide"){
   box(-12,-37,24,16,BLUE);line([0,-21],[0,-12],BLUE);
   [-29,0,29].forEach((x,i)=>{line([0,-12],[x,-12],BLUE);line([x,-12],[x,-2],BLUE);box(x-10,-2,20,16,state.matched&&i===1?GOLD:BLUE);});
   if(state.matched){g.fillStyle(GOLD,.23);g.fillRoundedRect(-10,-2,20,16,3);}
   [-26,0,26].forEach(x=>person(x,31,state.guided?INK:BLUE));
   if(state.guided){line([-19,32],[-7,32],GOLD);line([7,32],[19,32],GOLD);}
 }else if(id==="report"){
   box(-27,-34,48,65,BLUE);box(-13,-39,20,10,BLUE);
   [-17,-5,7].forEach(y=>line([-17,y],[9,y],BLUE));
   if(state.reports)check(3,18);
   g.lineStyle(3,INK,1);g.strokeCircle(22,18,12);line([30,27],[40,38],INK,3);
 }else if(id==="growth"){
   box(-37,-31,74,54,BLUE);person(-20,-8,BLUE);line([-7,14],[29,14],BLUE);
   [0,12,24].forEach((x,i)=>{const h=state.monitored?8+i*6:4;g.fillStyle(state.monitored?GOLD:BLUE,1);g.fillRect(x-4,13-h,6,h);});
   line([0,23],[0,34],BLUE);line([-14,34],[14,34],BLUE);
   if(state.monitorReady){g.lineStyle(1,GOLD,.8);g.strokeCircle(-20,-14,12);}
 }else if(id==="competency"||id==="policy"){
   g.fillStyle(0xe3ece7,1);g.fillRoundedRect(-28,-27,56,57,5);box(-28,-27,56,57,BLUE);
   [-20,-7,7,20].forEach(t=>{line([t,-27],[t,-35],BLUE);line([t,30],[t,38],BLUE);line([-28,t],[-36,t],BLUE);line([28,t],[36,t],BLUE);});
   if(id==="competency"){person(-8,2);g.lineStyle(3,GOLD,1);g.beginPath();g.arc(5,1,18,3.5,6.05);g.strokePath();line([5,1],[18,-10],GOLD,3);}
   else{box(-15,-16,28,34);[-7,2,11].forEach(y=>{line([-8,y],[7,y],INK);});check(17,16);}
   for(let i=0;i<(state.engineRevision||0)+1;i++)dot(-14+i*14,24,2.5,GOLD);
 }else if(id==="agent"){
   box(-32,-29,64,44);dot(-12,-10,4);dot(12,-10,4);line([-10,5],[10,5]);
   line([-14,15],[-22,27]);line([-22,27],[4,15]);
   line([0,-29],[0,-41]);dot(0,-43,4,GOLD);
   for(let i=0;i<(state.engineRevision||0)+1;i++)dot(-12+i*12,34,3,BLUE);
 }else if(id==="knowledge"){
   const count=state.knowledgeNodes||0;
   g.lineStyle(1,BLUE,.35);g.strokeEllipse(0,0,148,99);
   const pts=Array.from({length:count},(_,i)=>{const angle=i*2.4,r=18+Math.sqrt(i)*11;return [Math.cos(angle)*r,Math.sin(angle)*r*.65];});
   pts.forEach((p,i)=>{if(i)line(pts[i-1],p,i<8?BLUE:INK,1.4);if(i>3)line(pts[i-4],p,GOLD,1);dot(...p,3.6,i<8?BLUE:INK);});
 }
 return g;
};

window.platformEdgePath=function(scene,edge){
 const get=id=>id==="logic"?{...scene.project(scene.diagram.group.x+scene.diagram.group.w+12,240),w:1,h:1}:scene.nodes.get(id);
 const a=get(edge.from),b=get(edge.to);
 if(!a||!b)return [];
 const plane=n=>({x:((n.x-580)/.82+(n.y-30)/.43)/2,y:((n.y-30)/.43-(n.x-580)/.82)/2});
 const ap=plane(a),bp=plane(b);
 let bends=[];
 if(edge.kind==="context"){
   const infra=scene.diagram.nodes.filter(n=>n.type==="engine"||n.type==="agent").map(n=>plane(get(n.id)));
   const rail=Math.max(...infra.map(n=>n.y))+110,outer=ap.x+140;
   bends=[scene.project(outer,ap.y),scene.project(outer,rail),scene.project(bp.x,rail)];
 }else if(edge.kind==="learning"){
   const infra=scene.diagram.nodes.filter(n=>n.type==="engine"||n.type==="agent").map(n=>plane(get(n.id)));
   const rail=Math.max(...infra.map(n=>n.y))+150;
   // One shared return rail, with distinct branches to the three infrastructure objects.
   const xs=[ap.x,...infra.map(n=>n.x)].filter(x=>x>=Math.min(ap.x,bp.x)&&x<=Math.max(ap.x,bp.x)).sort((x,y)=>ap.x>bp.x?y-x:x-y);
   bends=[...xs.map(x=>scene.project(x,rail))];
 }else if(edge.both&&edge.kind==="infrastructure"){
   const rail=Math.max(ap.y,bp.y)+80;
   bends=[scene.project(ap.x,rail),scene.project(bp.x,rail)];
 }
 const first=bends[0]||b,last=bends.at(-1)||a;
 const source=edge.kind==="context"?{x:a.x+a.w/4,y:a.y+26}:scene.anchor(a,first);
 return [source,...bends,scene.anchor(b,last)];
};
window.drawPlatformConnections=function(scene,graphic){
 const segments=new Map(),arrows=[];
 for(const e of scene.diagram.edges){
  const points=window.platformEdgePath(scene,e);if(points.length<2)continue;
  const active=!scene.selected||e.from===scene.selected||e.to===scene.selected||(scene.platformHighlights?.has(e.from)&&scene.platformHighlights?.has(e.to));
  const alpha=scene.storyRunning&&!(scene.visited.has(e.from)&&scene.visited.has(e.to))?.07:(active?.82:.13);
  const color=e.kind==="context"?0x398c91:e.kind==="learning"?0xc99748:e.kind==="infrastructure"?0x668eab:0x52715d;
  const dashed=e.kind==="infrastructure";
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],key=[color,...[a,b].map(p=>p.x.toFixed(2)+","+p.y.toFixed(2)).sort()].join("|");
    const previous=segments.get(key);
    if(!previous||previous.alpha<alpha)segments.set(key,{a,b,alpha,color,dashed});
  }
  arrows.push({a:points.at(-2),b:points.at(-1),alpha,color});
  if(e.both)arrows.push({a:points[1],b:points[0],alpha,color});
 }
 for(const {a,b,alpha,color,dashed} of segments.values()){
  graphic.lineStyle(1.6,color,alpha);
  const length=Math.hypot(b.x-a.x,b.y-a.y);
  if(dashed){for(let d=0;d<length;d+=13){const end=Math.min(d+6,length);graphic.lineBetween(a.x+(b.x-a.x)*d/length,a.y+(b.y-a.y)*d/length,a.x+(b.x-a.x)*end/length,a.y+(b.y-a.y)*end/length);}}
  else graphic.lineBetween(a.x,a.y,b.x,b.y);
 }
 for(const {a,b,alpha,color} of arrows){
  const theta=Math.atan2(b.y-a.y,b.x-a.x);
  graphic.fillStyle(color,alpha);graphic.fillTriangle(b.x,b.y,b.x-9*Math.cos(theta-.4),b.y-9*Math.sin(theta-.4),b.x-9*Math.cos(theta+.4),b.y-9*Math.sin(theta+.4));
 }
};

window.createPlatformStory=function(scene){
 const state={assigned:false,monitorReady:false,matched:false,guided:false,reports:0,monitored:0,knowledgeNodes:0,engineRevision:0,cycles:0,eventsSeen:[]};
 const layers=new Map(),tweens=[],particles=[];
 let settle=null;
 const steps=[
 ["meet","agent","USER INTERFACE","The user interacts with the platform through the AI agent.",1800],
 ["infrastructure","agent","INFRASTRUCTURE","Two ontology engines support the agent: work competency diagnosis and engineering process policy guidance.",2600],
 ["profile","profile","PROFILE & CAREER","Diagnose the HR profile and career against the engineering process.",2100],
 ["recommend","position","POSITION","Recommend a suitable position and prepare to monitor the member’s growth.",2500],
 ["event","events","EVENTS & ISSUES","A Jira or GitHub event, or a customer issue, triggers the workflow.",2500],
 ["match","guide","WBS MATCHING","Match the event to its WBS and the recommended or actually assigned position.",2600],
 ["guide","guide","WORK & COMMUNICATION","Explain what to do, who to work with, and how to respond within the process policy.",2800],
 ["report","report","RESPONSE REPORT","The member acts on the guide and reports the event or issue response.",2400],
 ["diagnose","competency","COMPETENCY DIAGNOSIS","Diagnose the reported work using the competency ontology engine.",2300],
 ["monitor","growth","GROWTH MONITORING","Reflect the diagnosis in growth monitoring for the recommended position.",2400],
 ["accumulate","knowledge","KNOWLEDGE GRAPH","Accumulate the workflow, communication and outcomes in the knowledge graph.",2800],
 ["learn","policy","INFRASTRUCTURE GROWTH","Accumulated experience grows both ontology engines; the knowledge graph supplies context to the AI agent.",3100],
 ["repeat","events","NEXT EVENT","The next event uses the enriched infrastructure and its updated guidance.",2500],
 ["next-report","growth","CONTINUOUS FEEDBACK","Another response is diagnosed, reflected in growth monitoring, and added to the knowledge graph.",3100],
 ["close-loop","knowledge","EXPERIENCE → INFRASTRUCTURE","Operational experience keeps developing the infrastructure for the next cycle.",2700]
 ];
 function render(id){
   layers.get(id)?.destroy();scene.widgets.get(id).list[1].setVisible(false);
   const graphic=window.drawPlatformObject(scene,scene.nodes.get(id),state);scene.widgets.get(id).add(graphic);layers.set(id,graphic);
 }
 function animate(draw,duration=1800){
   settle=()=>draw(1);
   tweens.push(scene.tweens.addCounter({from:0,to:1,duration,onUpdate:t=>draw(t.getValue()),onComplete:()=>{settle=null;}}));
 }
 function point(id){if(id==="logic")return scene.project(scene.diagram.group.x+scene.diagram.group.w+12,240);return scene.nodes.get(id);}
 function flow(from,to,color=INK){
   const edge=scene.diagram.edges.find(e=>e.from===from&&e.to===to)||{from,to};
   const route=window.platformEdgePath(scene,edge);
   if(route.length<2)return;
   const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y));
   const total=lengths.reduce((a,b)=>a+b,0);
   for(let i=0;i<3;i++){
     const p=scene.add.circle(route[0].x,route[0].y,3.5,color).setDepth(1900);particles.push(p);
     tweens.push(scene.tweens.addCounter({from:0,to:total,delay:i*160,duration:1400,onUpdate:t=>{
       let distance=t.getValue(),segment=0;
       while(segment<lengths.length-1&&distance>lengths[segment])distance-=lengths[segment++];
       const a=route[segment],b=route[segment+1],ratio=Math.min(1,distance/(lengths[segment]||1));
       p.setPosition(a.x+(b.x-a.x)*ratio,a.y+(b.y-a.y)*ratio);
     },onComplete:()=>p.destroy()}));
   }
 }
 function focus(ids){scene.platformHighlights=new Set(ids);ids.forEach(id=>scene.visited.add(id));}
 function storeExperience(count){state.knowledgeNodes=count;render("knowledge");}
 function finishStep(){
   tweens.splice(0).forEach(t=>t.stop());
   if(settle){const end=settle;settle=null;end();}
   particles.splice(0).forEach(p=>p.destroy());
 }
 function step(key){
   finishStep();
   const [,id,speaker,text,duration]=steps.find(s=>s[0]===key);
   focus([id,"agent"]);scene.select(id);
   switch(key){
    case "meet":{
      scene.startMeeting();

      break;
    }
    case "infrastructure":
      focus(["agent","competency","policy"]);flow("competency","agent",BLUE);flow("policy","agent",BLUE);render("competency");render("policy");break;
    case "profile":
      focus(["profile","competency","agent"]);render("profile");break;
    case "recommend":
      state.assigned=true;state.monitorReady=true;focus(["profile","position","growth","competency"]);
      flow("profile","position");flow("position","growth");render("position");render("growth");break;
    case "event":
      state.eventsSeen.push("Jira","GitHub","VOC");render("events");break;
    case "match":
      state.matched=true;focus(["events","position","guide","policy"]);
      flow("events","guide",GOLD);flow("position","guide");render("guide");break;
    case "guide":
      state.guided=true;focus(["guide","policy","agent"]);render("guide");flow("policy","agent",BLUE);break;
    case "report":
      state.reports=1;focus(["guide","report"]);flow("guide","report");render("report");break;
    case "diagnose":
      focus(["report","competency","agent"]);render("competency");flow("competency","agent",BLUE);break;
    case "monitor":
      state.monitored=1;state.cycles=1;focus(["report","growth"]);flow("report","growth");render("growth");break;
    case "accumulate":
      focus(["position","guide","report","growth","logic","knowledge"]);flow("logic","knowledge");
      animate(p=>storeExperience(Math.floor(p*12)),2300);break;
    case "learn":
      focus(["knowledge","competency","policy","agent"]);["competency","policy"].forEach(target=>flow("knowledge",target,GOLD));flow("knowledge","agent",0x398c91);
      animate(p=>{state.engineRevision=p>=.5?1:0;["competency","policy","agent"].forEach(render);},2200);break;
    case "repeat":
      focus(["events","guide","position","policy","agent"]);flow("events","guide",GOLD);flow("position","guide");render("guide");break;
    case "next-report":
      state.reports=2;state.monitored=2;state.cycles=2;focus(["guide","report","growth","logic","knowledge"]);
      flow("guide","report");flow("report","growth");flow("logic","knowledge");
      render("report");render("growth");animate(p=>storeExperience(12+Math.floor(p*6)),2400);break;
    case "close-loop":
      focus(["knowledge","competency","policy","agent"]);["competency","policy"].forEach(target=>flow("knowledge",target,GOLD));flow("knowledge","agent",0x398c91);
      state.engineRevision=2;["competency","policy","agent"].forEach(render);break;
   }
   return {focus:id,speaker,text,duration};
 }
 return {stages:steps.map(([key])=>({type:"platform",key})),step,finishStep,stats:()=>({...state,eventsSeen:[...state.eventsSeen]}),
 destroy(){finishStep();layers.forEach(g=>g.destroy());layers.clear();scene.platformHighlights=null;}};
};
})();


window.drawContextConnection=function(scene,graphic,edge){
 const route=window.platformEdgePath(scene,edge),active=!scene.selected||["knowledge","agent"].includes(scene.selected);
 const alpha=scene.storyRunning&&!scene.visited.has("knowledge")?.07:active?.8:.13;
 graphic.lineStyle(1.7,0x398c91,alpha);
 route.slice(1).forEach((p,i)=>graphic.lineBetween(route[i].x,route[i].y,p.x,p.y));
 const b=route.at(-1),a=route.at(-2),t=Math.atan2(b.y-a.y,b.x-a.x);
 graphic.fillStyle(0x398c91,alpha);graphic.fillTriangle(b.x,b.y,b.x-9*Math.cos(t-.4),b.y-9*Math.sin(t-.4),b.x-9*Math.cos(t+.4),b.y-9*Math.sin(t+.4));
};
window.emitContextFlow=function(scene){
 const route=window.platformEdgePath(scene,{from:"knowledge",to:"agent",kind:"context"});
 const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<3;i++){
  const dot=scene.add.circle(route[0].x,route[0].y,3.8,0x398c91).setDepth(1900);scene.particles.push(dot);
  scene.tweens.addCounter({from:0,to:total,duration:1800,delay:i*160,onUpdate:t=>{
   let d=t.getValue(),j=0;while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];
   const a=route[j],b=route[j+1],r=Math.min(1,d/(lengths[j]||1));dot.setPosition(a.x+(b.x-a.x)*r,a.y+(b.y-a.y)*r);
  },onComplete:()=>dot.destroy()});
 }
};
