/* Solo developer support workflow from the supplied diagram. Metrics are illustrative. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawCreatorObject=function(scene,node,state={}){
 if(["agent","rag","knowledge","chosen","content"].includes(node.id))return window.drawNarrativeObject(scene,node,state);
 if(node.id==="alternative")return window.drawRiskObject(scene,{...node,id:"review"},{mentored:state.mentored});
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=3,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=BLUE)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,3);};
 const person=(x,y)=>{dot(x,y-10,6);g.fillStyle(INK,1);g.fillRoundedRect(x-8,y,16,16,4);};
 const chart=(progress=1)=>{line([-26,-25],[-26,26],BLUE);line([-26,26],[29,26],BLUE);[-15,0,15].forEach((x,i)=>line([x,20],[x,20-(i+1)*12*progress],INK,5));};
 if(id==="start"){person(0,-14);box(-32,6,64,28);line([-39,39],[39,39],INK,3);}
 else if(id==="core"){
  box(-37,-28,41,31);line([-29,-13],[-15,-13]);line([-22,-20],[-22,-6]);dot(-4,-17,3);
  g.lineStyle(2,GOLD,1);g.strokeCircle(21,15,18);g.strokeCircle(21,15,9);dot(21,15,3,GOLD);
  line([-29,28],[-16,11],state.targetsSet?GOLD:BLUE,3);line([-16,11],[-3,19],BLUE);
  if(state.targetRevision)line([21,15],[36,-9],GOLD,3);
 }else if(id==="report"){
  [-27,0,27].forEach((x,i)=>{box(x-8,-29,16,19);line([x,-6],[0,13],BLUE);});
  g.lineStyle(2,INK,1);g.strokeEllipse(0,17,44,15);g.strokeEllipse(0,28,44,15);line([-22,17],[-22,28]);line([22,17],[22,28]);
  for(let i=0;i<(state.metricsCollected||0);i++)dot(-14+i*7,20,2.5,GOLD);
 }else if(id==="review"){
  chart(state.metricAnalysis||0);g.lineStyle(2,GOLD,1);g.strokeCircle(20,-7,15);line([31,4],[40,15],GOLD,3);
 }else if(id==="feedback"){
  chart();line([-20,6],[-4,-9],GOLD);line([-4,-9],[11,-2],GOLD);line([11,-2],[31,-28],GOLD);
  if(state.guidanceReady){g.lineStyle(2,GOLD,1);g.strokeCircle(31,-28,7);}
 }else if(id==="api"){
  box(-32,-29,64,58);[-18,-3,12].forEach((y,i)=>{dot(-21,y,3,BLUE);line([-12,y],[18,y],BLUE);});
  line([-43,0],[-33,0],GOLD,3);line([33,0],[43,0],GOLD,3);
 }else if(id==="incubation"){
  box(-34,-33,68,66);person(-13,-8);
  line([5,19],[13,7],GOLD,3);line([13,7],[25,-15],GOLD,3);
  [-22,0,22].forEach(x=>{line([x,-40],[x,-33],BLUE);line([x,33],[x,40],BLUE);});
  for(let i=0;i<(state.incubationRevision||0);i++){dot(-12+i*17,25,3.5,GOLD);}
 }
 return g;
};
window.createCreatorStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawCreatorObject,
 steps:()=>[
 ["meet","agent","AI AGENT","A solo game content developer meets the AI agent.",2100],
 ["infrastructure","incubation","DEVELOPER SUPPORT INFRASTRUCTURE","Game content and its statistics API work with game incubation and knowledge graph RAG ontology engines.",3100],
 ["developer","start","SOLO DEVELOPER","Start with the developer's game and its market context.",2400],
 ["targets","core","GAME, MARKET & METRICS","Analyze the game and market, then define quantitative targets.",2800],
 ["mentor","alternative","MENTORING LOOP","Mentoring helps refine the analysis and quantitative targets.",2900],
 ["sdk","chosen","GAME CONTENT SDK","Connect the game content to the SDK for collecting metrics.",2700],
 ["collect","report","METRIC COLLECTION","Collect the game's quantitative metrics.",2700],
 ["metrics","review","METRIC ANALYSIS","Analyze the collected metrics to inform the developer's next steps.",2800],
 ["guide-growth","feedback","GROWTH GUIDANCE & TRENDS","Provide growth guidance, analyze trends and reset quantitative targets.",2900],
 ["reset-targets","core","UPDATED TARGETS","Return the revised targets to game and market analysis for the next cycle.",2800],
 ["record","knowledge","DEVELOPMENT → KNOWLEDGE","Connect analysis, mentoring, metrics, guidance and revised targets in the knowledge graph.",2900],
 ["ontology","rag","ONTOLOGY GROWTH","Accumulated development experience grows both the game incubation and RAG ontology engines.",2800]
 ],
 onStep(key,{state,focus,flow,render,animate}){
 switch(key){
 case "infrastructure":focus(["content","api","incubation","rag","agent"]);flow("content","agent",BLUE);flow("api","content",BLUE);flow("api","incubation",BLUE);flow("incubation","rag",BLUE);break;
 case "developer":focus(["start","core"]);flow("start","core");break;
 case "targets":state.targetsSet=true;focus(["core"]);render("core");break;
 case "mentor":state.mentored=true;focus(["core","alternative"]);flow("core","alternative",GOLD);flow("alternative","core",GOLD);render("alternative");break;
 case "sdk":state.sdkReady=true;focus(["core","chosen"]);flow("core","chosen");render("chosen");break;
 case "collect":focus(["chosen","report"]);flow("chosen","report");animate(p=>{state.metricsCollected=Math.floor(p*5);render("report");});break;
 case "metrics":focus(["report","review"]);flow("report","review");animate(p=>{state.metricAnalysis=p;render("review");});break;
 case "guide-growth":state.guidanceReady=true;focus(["review","feedback"]);flow("review","feedback");render("feedback");break;
 case "reset-targets":state.targetRevision=1;focus(["feedback","core"]);flow("feedback","core",GOLD);render("core");break;
 case "record":focus(["core","alternative","chosen","report","review","feedback","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(p*18);render("knowledge");});break;
 case "ontology":focus(["knowledge","incubation","rag","agent"]);flow("knowledge","incubation",GOLD);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?2:0;state.incubationRevision=state.engineRevision;render("incubation");render("rag");});break;
 }
 }
 });
};
})();
