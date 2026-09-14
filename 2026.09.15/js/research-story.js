/* Diagram-based research notebook demonstration. Data, transactions and analysis are illustrative. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawResearchObject=function(scene,node,state={}){
 if(["agent","rag","knowledge"].includes(node.id))return window.drawProblemObject(scene,node,state);
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=3,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=BLUE)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,3);};
 const arrow=(a,b,c=INK)=>{line(a,b,c);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(b,[b[0]-6*Math.cos(t-.5),b[1]-6*Math.sin(t-.5)],c);line(b,[b[0]-6*Math.cos(t+.5),b[1]-6*Math.sin(t+.5)],c);};
 const check=(x,y)=>{line([x-6,y],[x,y+6],GOLD,3);line([x,y+6],[x+11,y-8],GOLD,3);};
 const notebook=()=>{box(-29,-33,58,64);[-22,-8,6,20].forEach(y=>line([-35,y],[-24,y],INK));};
 if(id==="start"){
  notebook();g.lineStyle(2,GOLD,1);g.strokeCircle(0,-10,10);line([-5,2],[5,2],GOLD);line([-12,17],[13,17],BLUE);
 }else if(id==="core"){
  notebook();line([-17,-23],[16,-23],BLUE);
  const pts=[[-15,-4],[14,-4],[0,18]];
  pts.forEach(p=>dot(...p,4));
  arrow(pts[0],pts[1],state.drafted?GOLD:BLUE);arrow(pts[1],pts[2],state.drafted?GOLD:BLUE);
  if(state.designRevision){dot(36,8,4,GOLD);arrow(pts[1],[36,8],GOLD);}
  if(state.designRevision>1){dot(30,29,4,GOLD);arrow([36,8],[30,29],GOLD);}
 }else if(id==="alternative"){
  box(-26,-28,47,50);line([-17,-18],[10,-18],BLUE);
  g.lineStyle(2,GOLD,1);g.strokeCircle(23,16,12);arrow([29,-13],[37,-4],GOLD);arrow([37,-4],[27,0],GOLD);
  if(state.purchased)check(-10,5);
 }else if(id==="chosen"){
  notebook();[-20,-8,4].forEach(y=>line([-15,y],[13,y],BLUE));
  g.lineStyle(2,GOLD,1);g.strokeCircle(25,22,12);
  if(state.sold)check(25,22);
 }else if(id==="report"){
  box(-37,-27,43,33);box(-3,0,43,33,GOLD);
  line([-21,6],[-28,15],BLUE);line([15,33],[22,40],GOLD);
  if(state.discourse){check(-20,-12);line([18,7],[18,19],GOLD,3);dot(18,26,2,GOLD);}
 }else if(id==="review"){
  // Read passages, relate statements and surface contested content.
  box(-28,-33,47,61);[-21,-10,1,12].forEach(y=>line([-19,y],[9,y],BLUE));
  const p=state.analysisProgress||0;
  if(p>.15)line([-19,-10],[7,-10],GOLD,4);
  if(p>.45)line([-19,12],[0,12],GOLD,4);
  g.lineStyle(2,INK,1);g.strokeCircle(19,10,17);line([31,22],[43,35],INK,4);
  if(p>.75){dot(16,6,3,GOLD);dot(24,14,3,GOLD);line([16,6],[24,14],GOLD);}
 }else if(id==="feedback"){
  box(-32,-28,64,45);line([-15,17],[-22,28]);line([-22,28],[0,17]);
  dot(-15,-9,4);dot(-2,-9,4);line([-16,4],[-2,4]);
  if(state.suggested){arrow([10,5],[24,-13],GOLD);dot(24,-13,3,GOLD);}
 }else if(id==="api"){
  [-13,0,13].forEach((x,i)=>box(x-24,-30+i*4,43,50,BLUE));
  [-16,-5,6].forEach(y=>line([-2,y],[19,y],BLUE));
  arrow([-43,9],[-25,9],GOLD);arrow([26,9],[43,9],GOLD);
 }
 return g;
};
window.createResearchStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawResearchObject,
 steps:()=>[
 ["meet","agent","AI AGENT","Bring a research topic to the AI agent.",1900],
 ["infrastructure","api","RESEARCH INFRASTRUCTURE","External scholarly data and the knowledge graph RAG ontology engine support the agent.",2800],
 ["topic","start","RESEARCH TOPIC","A research topic starts both notebook authoring and suggestions from the AI partner.",2600],
 ["draft","core","CONTENT & CAUSAL RELATIONSHIPS","Write the research content and define the causal relationships of the experimental design.",2800],
 ["purchase","alternative","PURCHASE & IMPROVEMENT","Purchased designs are improved; those improvements return to the content and causal model.",2900],
 ["sell","chosen","SOLD DESIGNS","The experimental design is sold and becomes a basis for agreement and contested points.",2700],
 ["discourse","report","AGREEMENT & CONTESTED POINTS","Collect agreement and contested points concerning the design.",2600],
 ["analysis","review","CONTENT ANALYSIS","Analyze the content of agreement and contested points to identify issues for the design.",2900],
 ["suggestions","feedback","AI PARTNER SUGGESTIONS","Content analysis informs the AI partner's suggestions for the research topic.",2800],
 ["evolve","core","EVOLVING EXPERIMENTAL DESIGN","Use the suggestions to revise the content and causal model for the next design.",2800],
 ["record","knowledge","RESEARCH → KNOWLEDGE","Connect designs, improvements, agreement, contested points, analysis and suggestions in the knowledge graph.",2900],
 ["ontology","rag","BOTTOM-UP ONTOLOGY GROWTH","The accumulated research knowledge dynamically grows the RAG ontology engine.",2900]
 ],
 onStep(key,{state,focus,flow,render,animate}){
 switch(key){
 case "infrastructure":focus(["api","rag","agent"]);flow("api","agent",BLUE);flow("api","rag",BLUE);break;
 case "topic":focus(["start","core","feedback"]);flow("start","core");flow("start","feedback");break;
 case "draft":state.drafted=true;focus(["core"]);render("core");break;
 case "purchase":state.purchased=true;focus(["core","alternative"]);flow("core","alternative",GOLD);flow("alternative","core",GOLD);render("alternative");break;
 case "sell":state.sold=true;focus(["core","chosen"]);flow("core","chosen");render("chosen");break;
 case "discourse":state.discourse=true;focus(["chosen","report"]);flow("chosen","report");render("report");break;
 case "analysis":focus(["report","review"]);flow("report","review");animate(p=>{state.analysisProgress=p;render("review");});break;
 case "suggestions":state.suggested=true;focus(["review","feedback"]);flow("review","feedback");render("feedback");break;
 case "evolve":state.designRevision=1;focus(["feedback","core"]);flow("feedback","core",GOLD);render("core");break;
 case "record":focus(["core","alternative","chosen","report","review","feedback","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(18*p);render("knowledge");});break;
 case "ontology":focus(["knowledge","rag","agent"]);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?2:0;render("rag");});break;
 }
 }
 });
};
})();
