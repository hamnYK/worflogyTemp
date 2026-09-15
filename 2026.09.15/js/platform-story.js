/* Platform demonstration based on company-provided workflow.
   Source events, competency scores and learning are illustrative; no external systems are called. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawPlatformObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};

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
  const color=e.kind==="context"?window.WorfTheme.active:e.kind==="learning"?window.WorfTheme.flow:e.kind==="infrastructure"?window.WorfTheme.link:window.WorfTheme.link;
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
 ["meet","agent","사용자 인터페이스","에이전트와 대화하며 업무 상황을 전달하고 필요한 안내를 받습니다.",3340],
 ["infrastructure","agent","기술 인프라","업무 수행을 진단하는 엔진과 프로세스 정책을 안내하는 엔진이 함께 에이전트를 지원합니다.",4185],
 ["profile","profile","프로필과 커리어","구성원의 프로필과 경력을 살펴 현재 프로세스에서 맡을 수 있는 역할을 진단합니다.",3925],
 ["recommend","position","포지션 추천","진단을 바탕으로 적합한 포지션을 추천하고, 그 역할에서의 성장을 살펴볼 준비를 합니다.",4120],
 ["event","events","이벤트와 이슈","업무 생산성·협업 도구의 이벤트나 고객 민원(VOC)이 들어오면 대응할 업무를 확인합니다.",4250],
 ["match","guide","WBS 매칭","이벤트를 업무 분류 체계(WBS)의 과업과 연결하고, 추천받거나 실제 배정된 포지션을 확인합니다.",4510],
 ["guide","guide","업무 소통 가이드","프로세스 정책과 포지션에 맞춰 무엇을, 누구와, 어떻게 해야 하는지 안내합니다.",3860],
 ["report","report","대응 보고","구성원이 안내에 따라 업무를 수행하고 대응 과정과 결과를 보고합니다.",3470],
 ["diagnose","competency","업무 역량 진단","업무 수행 진단 온톨로지 엔진이 보고 내용을 바탕으로 수행 결과를 진단합니다.",3795],
 ["monitor","growth","성장 모니터링","진단 결과를 추천 포지션과 연결해 구성원의 성장 모니터링에 반영합니다.",3535],
 ["accumulate","knowledge","지식 그래프 축적","업무 안내, 협업과 수행 결과를 서로 연결해 지식 그래프에 쌓습니다.",3470],
 ["learn","policy","인프라 성장","축적된 업무 경험을 두 온톨로지 엔진에 반영해 진단과 정책 안내를 보완합니다.",3795],
 ["repeat","events","다음 이벤트","다음 이벤트에는 이전 경험을 반영한 엔진과 업무 가이드를 활용합니다.",3470],
 ["next-report","growth","지속적인 피드백","새로운 대응 결과도 진단해 성장 모니터링을 갱신하고, 지식 그래프에 쌓습니다.",3795],
 ["close-loop","knowledge","경험에서 인프라로","업무 경험이 엔진을 성장시키고, 성장한 엔진이 다음 업무를 지원하는 순환이 이어집니다.",4120]
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
      state.eventsSeen.push("업무 생산성·협업 도구","VOC");render("events");break;
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
      focus(["knowledge","competency","policy","agent"]);["competency","policy"].forEach(target=>flow("knowledge",target,GOLD));flow("knowledge","agent",window.WorfTheme.active);
      animate(p=>{state.engineRevision=p>=.5?1:0;["competency","policy","agent"].forEach(render);},2200);break;
    case "repeat":
      focus(["events","guide","position","policy","agent"]);flow("events","guide",GOLD);flow("position","guide");render("guide");break;
    case "next-report":
      state.reports=2;state.monitored=2;state.cycles=2;focus(["guide","report","growth","logic","knowledge"]);
      flow("guide","report");flow("report","growth");flow("logic","knowledge");
      render("report");render("growth");animate(p=>storeExperience(12+Math.floor(p*6)),2400);break;
    case "close-loop":
      focus(["knowledge","competency","policy","agent"]);["competency","policy"].forEach(target=>flow("knowledge",target,GOLD));flow("knowledge","agent",window.WorfTheme.active);
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
 graphic.lineStyle(1.7,window.WorfTheme.active,alpha);
 route.slice(1).forEach((p,i)=>graphic.lineBetween(route[i].x,route[i].y,p.x,p.y));
 const b=route.at(-1),a=route.at(-2),t=Math.atan2(b.y-a.y,b.x-a.x);
 graphic.fillStyle(window.WorfTheme.active,alpha);graphic.fillTriangle(b.x,b.y,b.x-9*Math.cos(t-.4),b.y-9*Math.sin(t-.4),b.x-9*Math.cos(t+.4),b.y-9*Math.sin(t+.4));
};
window.emitContextFlow=function(scene){
 const route=window.platformEdgePath(scene,{from:"knowledge",to:"agent",kind:"context"});
 const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<3;i++){
  const dot=scene.add.circle(route[0].x,route[0].y,3.8,window.WorfTheme.active).setDepth(1900);scene.particles.push(dot);
  scene.tweens.addCounter({from:0,to:total,duration:1800,delay:i*160,onUpdate:t=>{
   let d=t.getValue(),j=0;while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];
   const a=route[j],b=route[j+1],r=Math.min(1,d/(lengths[j]||1));dot.setPosition(a.x+(b.x-a.x)*r,a.y+(b.y-a.y)*r);
  },onComplete:()=>dot.destroy()});
 }
};
