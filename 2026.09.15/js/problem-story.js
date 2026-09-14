/* Company-provided collaboration workflow; scripted visual demonstration. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawProblemObject=function(scene,node,state={}){
 if(["agent","knowledge"].includes(node.id))return window.drawPlatformObject(scene,node,state);
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=4,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=INK)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,4);};
 const person=(x,y,c=INK)=>{dot(x,y-9,5,c);g.fillStyle(c,1);g.fillRoundedRect(x-7,y,14,12,4);};
 const check=(x,y)=>{line([x-7,y],[x-1,y+6],GOLD,3);line([x-1,y+6],[x+10,y-8],GOLD,3);};
 const bulb=(x,y,c=GOLD)=>{g.lineStyle(2,c,1);g.strokeCircle(x,y,8);line([x-4,y+9],[x+4,y+9],c);};
 if(id==="start"){
  box(-30,-28,60,43);line([-15,15],[-22,26]);line([-22,26],[0,15]);line([0,-17],[0,-3],GOLD,3);dot(0,6,2.5,GOLD);
 }else if(id==="core"){
  g.lineStyle(2,BLUE,1);g.strokeEllipse(0,12,66,29);
  [[-31,-4],[0,23],[31,-4]].forEach(([x,y])=>person(x,y));
  [-20,0,20].forEach((x,i)=>bulb(x,-30-i%2*8,state.discussed?GOLD:BLUE));
  if(state.discussed){line([-20,-19],[0,0],GOLD);line([20,-19],[0,0],GOLD);}
 }else if(id==="alternative"){
  box(-29,-22,58,48,BLUE);bulb(0,-4);
  g.lineStyle(2,GOLD,state.weakSignal?1:.35);g.beginPath();g.arc(0,-4,36,-1.1,1.1);g.strokePath();
  g.beginPath();g.arc(0,-4,44,-.8,.8);g.strokePath();
  if(state.alternativeRecommended)check(-20,30);
 }else if(id==="chosen"){
  [-15,0,15].forEach((x,i)=>box(x-20,-30+i*5,32,40,i===2?INK:BLUE));
  if(state.selected)check(15,18);
 }else if(id==="report"){
  box(-25,-34,50,65);[-18,0,18].forEach(y=>{box(-17,y-4,7,7,BLUE);line([-3,y],[17,y],BLUE);if(state.reported)check(-13,y);});
 }else if(id==="review"){
  box(-22,-25,44,45,BLUE);person(-33,20);person(33,20);
  line([-24,18],[-10,5],BLUE);line([24,18],[10,5],BLUE);
  if(state.reviewed)check(0,-2);else {g.lineStyle(2,INK,1);g.strokeCircle(0,-3,8);}
 }else if(id==="feedback"){
  box(-25,-31,50,60);[-17,-7,3].forEach(y=>line([-15,y],[15,y],BLUE));
  g.lineStyle(2,state.policyAdopted?GOLD:BLUE,1);g.strokeCircle(14,21,13);
  if(state.policyAdopted)check(14,21);
  if(state.policyRecommended){line([-36,0],[-28,0],GOLD,3);dot(-39,0,3,GOLD);}
 }else if(id==="rag"){
  box(-31,-31,62,62,BLUE);[-22,-7,8,23].forEach(x=>{line([x,-39],[x,-31],BLUE);line([x,31],[x,39],BLUE);});
  const pts=[[-19,-13],[16,-17],[-4,4],[20,18],[-20,22]];
  [[0,2],[1,2],[2,3],[2,4]].forEach(([a,b])=>line(pts[a],pts[b],BLUE));
  pts.forEach(([x,y])=>dot(x,y,3.5));
  for(let i=0;i<(state.engineRevision||0);i++){dot(30+i*9,-16+i*13,3,GOLD);line([16,-17],[30+i*9,-16+i*13],GOLD);}
 }
 return g;
};
window.createProblemStory=function(scene,options={}){
 const state={discussed:false,selected:false,weakSignal:false,reported:false,reviewed:false,policyAdopted:false,policyRecommended:false,alternativeRecommended:false,knowledgeNodes:0,engineRevision:0};
 const layers=new Map(),tweens=[],particles=[];let settle=null;
 let steps=[
 ["meet","agent","AI AGENT","Bring a problem to the AI agent, the team's interaction interface.",1900],
 ["infrastructure","rag","KNOWLEDGE GRAPH RAG","The ontology engine retrieves knowledge and supports the team's reasoning through the agent.",2500],
 ["discuss","core","TEAM DELIBERATION","Team members meet, discuss the problem and develop several strategies.",2700],
 ["select","chosen","STRATEGY SELECTION","Through deliberation, the team chooses a strategy to carry out.",2400],
 ["retain","alternative","WEAK SIGNALS","Promising unselected strategies remain available as weak signals for continued review.",3000],
 ["execute","report","TASKS & REPORTS","Turn the chosen strategy into tasks, carry them out and report the results.",2800],
 ["review","review","PEER REVIEW","Peers review and evaluate the reported outcomes.",2300],
 ["adopt","feedback","OFFICIAL POLICY","After peer review, adopt the validated approach as official policy for this problem.",2700],
 ["accumulate","knowledge","COLLABORATION → KNOWLEDGE","Connect strategies, decisions, work, reviews and policy in the knowledge graph.",2900],
 ["grow","rag","BOTTOM-UP ONTOLOGY GROWTH","New knowledge and relationships dynamically grow the RAG ontology engine.",2800],
 ["similar","start","A SIMILAR PROBLEM","When a similar problem arises, retrieve the accumulated knowledge.",2400],
 ["policy","feedback","POLICY FIRST","Recommend the established policy first and bring it into the team's discussion.",2700],
 ["reconsider","alternative","RECONSIDER WEAK SIGNALS","Depending on the new problem, an earlier unselected strategy may also be recommended.",3000],
 ["expand","knowledge","NETWORK GROWTH LOOP","Reconsidered strategies add new connections; the growing ontology supports the next collaboration.",3200]
 ];
 if(options.steps)steps=options.steps(steps);
 function render(id){layers.get(id)?.destroy();scene.widgets.get(id).list[1].setVisible(false);const g=(options.draw||window.drawProblemObject)(scene,scene.nodes.get(id),state);scene.widgets.get(id).add(g);layers.set(id,g);}
 function focus(ids){scene.platformHighlights=new Set(ids);ids.forEach(id=>scene.visited.add(id));}
 function flow(from,to,color=INK){
  const edge=scene.diagram.edges.find(e=>(e.from===from&&e.to===to)||(e.both&&e.from===to&&e.to===from));
  let route=window.platformEdgePath(scene,edge||{from,to});
  if(edge&&edge.from!==from)route=route.reverse();
  if(route.length<2)return;
  const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)),total=lengths.reduce((a,b)=>a+b,0);
  for(let i=0;i<3;i++){
   const p=scene.add.circle(route[0].x,route[0].y,3.5,color).setDepth(1900);particles.push(p);
   tweens.push(scene.tweens.addCounter({from:0,to:total,duration:1600,delay:i*170,onUpdate:t=>{
    let d=t.getValue(),j=0;while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];
    const a=route[j],b=route[j+1],r=Math.min(1,d/(lengths[j]||1));p.setPosition(a.x+(b.x-a.x)*r,a.y+(b.y-a.y)*r);
   },onComplete:()=>p.destroy()}));
  }
 }
 function animate(draw){settle=()=>draw(1);tweens.push(scene.tweens.addCounter({from:0,to:1,duration:2200,onUpdate:t=>draw(t.getValue()),onComplete:()=>{settle=null;}}));}
 function finishStep(){tweens.splice(0).forEach(t=>t.stop());if(settle){const done=settle;settle=null;done();}particles.splice(0).forEach(p=>p.destroy());}
 function step(key){
  finishStep();const [,id,speaker,text,duration]=steps.find(s=>s[0]===key);focus([id,"agent"]);
  switch(key){
   case "meet":scene.startMeeting();break;
   case "infrastructure":focus(["agent","rag"]);flow("rag","agent",BLUE);break;
   case "discuss":state.discussed=true;focus(["start","core"]);flow("start","core");render("core");break;
   case "select":state.selected=true;focus(["core","chosen","alternative"]);flow("core","chosen");flow("core","alternative",GOLD);render("chosen");break;
   case "retain":state.weakSignal=true;focus(["alternative","core"]);flow("alternative","core",GOLD);render("alternative");break;
   case "execute":state.reported=true;focus(["chosen","report"]);flow("chosen","report");render("report");break;
   case "review":state.reviewed=true;focus(["report","review"]);flow("report","review");render("review");break;
   case "adopt":state.policyAdopted=true;focus(["review","feedback"]);flow("review","feedback");render("feedback");break;
   case "accumulate":focus(["core","alternative","chosen","report","review","feedback","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(p*12);render("knowledge");});break;
   case "grow":focus(["knowledge","rag","agent"]);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?1:0;render("rag");});break;
   case "similar":focus(["start","rag","agent"]);flow("rag","agent",BLUE);break;
   case "policy":state.policyRecommended=true;focus(["start","feedback","core"]);flow("start","feedback");flow("feedback","core");render("feedback");break;
   case "reconsider":state.alternativeRecommended=true;focus(["alternative","core"]);flow("alternative","core",GOLD);render("alternative");break;
   case "expand":focus(["logic","knowledge","rag","core","alternative"]);flow("logic","knowledge");flow("knowledge","rag",GOLD);animate(p=>{state.knowledgeNodes=12+Math.floor(p*6);state.engineRevision=p>.5?2:1;render("knowledge");render("rag");});break;
  }
  options.onStep?.(key,{state,focus,flow,render,animate});
  scene.select(id);return {focus:id,speaker,text,duration};
 }
 return {stages:steps.map(([key])=>({type:"platform",key})),step,finishStep,stats:()=>({...state}),destroy(){finishStep();layers.forEach(g=>g.destroy());scene.platformHighlights=null;}};
};
})();
