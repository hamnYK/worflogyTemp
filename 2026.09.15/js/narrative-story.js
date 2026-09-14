/* Narrative workflow from the supplied diagram; illustrative content and play logs. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawNarrativeObject=function(scene,node,state={}){
 if(["agent","rag","knowledge"].includes(node.id))return window.drawProblemObject(scene,node,state);
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=3,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=BLUE)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,3);};
 const arrow=(a,b,c=INK)=>{line(a,b,c);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(b,[b[0]-6*Math.cos(t-.5),b[1]-6*Math.sin(t-.5)],c);line(b,[b[0]-6*Math.cos(t+.5),b[1]-6*Math.sin(t+.5)],c);};
 const person=(x,y)=>{dot(x,y-8,5);g.fillStyle(INK,1);g.fillRoundedRect(x-7,y,14,13,4);};
 const book=()=>{line([0,-24],[-30,-31],BLUE);line([-30,-31],[-30,21],BLUE);line([-30,21],[0,28],BLUE);line([0,28],[30,21],BLUE);line([30,21],[30,-31],BLUE);line([30,-31],[0,-24],BLUE);line([0,-24],[0,28],BLUE);};
 if(id==="start"){book();[-15,-3,9].forEach(y=>{line([-23,y-5],[-8,y],BLUE);line([7,y],[23,y-5],BLUE);});}
 else if(id==="core"){
  line([-39,8],[-20,-22],BLUE);line([-20,-22],[-2,8],BLUE);line([-8,8],[10,-9],BLUE);line([10,-9],[26,8],BLUE);
  dot(22,-27,6,GOLD);person(24,20);
  const pts=[[-28,23],[-7,17],[-6,35]];pts.forEach(p=>dot(...p,3));arrow(pts[0],pts[1],state.built?GOLD:BLUE);arrow(pts[0],pts[2],BLUE);
  if(state.narrativeRevision){dot(12,38,3,GOLD);arrow(pts[2],[12,38],GOLD);}
 }else if(id==="alternative"){
  box(-27,-30,49,58);[-18,-6,6].forEach(y=>line([-17,y],[10,y],BLUE));
  line([-5,28],[32,-15],GOLD,7);line([31,-15],[35,-20],INK,3);
  if(state.edited)line([-17,19],[-5,19],GOLD,3);
 }else if(id==="chosen"||id==="content"){
  box(-34,-24,68,47);line([-22,-8],[-10,-16],BLUE);line([-22,-8],[-10,0],BLUE);
  line([22,-8],[10,-16],BLUE);line([22,-8],[10,0],BLUE);
  person(0,8);line([-28,31],[28,31],GOLD);
  if(state.sdkReady&&id==="chosen"){dot(36,-27,5,GOLD);line([36,-20],[36,-12],GOLD);}
 }else if(id==="report"){
  box(-34,-29,68,37);line([-25,-11],[-11,-11]);line([-18,-18],[-18,-4]);dot(17,-15,3);dot(25,-7,3);
  const count=state.playLogCount||0;
  for(let i=0;i<count;i++){const x=-27+i*13,y=24+(i%2)*8;dot(x,y,3,GOLD);if(i)line([x-13,24+((i-1)%2)*8],[x,y],BLUE);}
 }else if(id==="review"){
  book();g.lineStyle(2,INK,1);g.strokeCircle(17,10,16);line([28,22],[40,35],INK,4);
  if(state.analyzed){line([-23,-10],[-8,-6],GOLD,4);line([7,-5],[22,-9],GOLD,4);dot(17,10,3,GOLD);}
 }else if(id==="feedback"){
  person(0,0);arrow([-32,20],[-18,-17],BLUE);arrow([-18,-17],[24,-20],BLUE);arrow([24,-20],[32,18],GOLD);
  line([32,18],[10,29],GOLD);arrow([10,29],[-26,23],GOLD);
  if(state.reconstructed){dot(-27,-4,3,GOLD);dot(28,3,3,GOLD);}
 }
 return g;
};
window.createNarrativeStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawNarrativeObject,
 steps:()=>[
 ["meet","agent","AI AGENT","Bring literary and non-literary source material to the AI agent.",2100],
 ["infrastructure","content","NARRATIVE INFRASTRUCTURE","Game content and the knowledge graph RAG ontology engine support the agent.",2700],
 ["sources","start","SOURCE MATERIAL","Use literary and non-literary material to develop the game narrative.",2500],
 ["build","core","WORLD, SCENARIO & NPCs","Build the world, establish the scenario and create its NPCs.",2700],
 ["edit","alternative","EDITING LOOP","Edit the narrative and return the revisions to the world, scenario and NPCs.",2800],
 ["sdk","chosen","GAME CONTENT SDK","Connect the developed world, scenario and NPCs to the game content SDK.",2700],
 ["play","report","PLAY LOGS","Gameplay produces logs of the player's experience and interactions.",2700],
 ["analyze","review","NARRATIVE ANALYSIS","Analyze the play logs to understand how the narrative unfolds.",2800],
 ["reconstruct","feedback","SCENARIO & NPC RECONSTRUCTION","Use narrative analysis to reconstruct the scenario and NPCs.",2800],
 ["revise-world","core","EVOLVING NARRATIVE","Feed the reconstructed scenario and NPCs back into narrative development.",2800],
 ["record","knowledge","NARRATIVE → KNOWLEDGE","Connect sources, edits, game content, play logs, analysis and reconstruction in the knowledge graph.",2900],
 ["ontology","rag","BOTTOM-UP ONTOLOGY GROWTH","Accumulated narrative knowledge dynamically grows the RAG ontology engine.",2900]
 ],
 onStep(key,{state,focus,flow,render,animate}){
 switch(key){
 case "infrastructure":focus(["content","rag","agent"]);flow("content","agent",BLUE);flow("content","rag",BLUE);break;
 case "sources":focus(["start","core"]);flow("start","core");break;
 case "build":state.built=true;focus(["core"]);render("core");break;
 case "edit":state.edited=true;focus(["core","alternative"]);flow("core","alternative",GOLD);flow("alternative","core",GOLD);render("alternative");break;
 case "sdk":state.sdkReady=true;focus(["core","chosen"]);flow("core","chosen");render("chosen");break;
 case "play":focus(["chosen","report"]);flow("chosen","report");animate(p=>{state.playLogCount=Math.floor(p*5);render("report");});break;
 case "analyze":state.analyzed=true;focus(["report","review"]);flow("report","review");render("review");break;
 case "reconstruct":state.reconstructed=true;focus(["review","feedback"]);flow("review","feedback");render("feedback");break;
 case "revise-world":state.narrativeRevision=1;focus(["feedback","core"]);flow("feedback","core",GOLD);render("core");break;
 case "record":focus(["core","alternative","chosen","report","review","feedback","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(p*18);render("knowledge");});break;
 case "ontology":focus(["knowledge","rag","agent"]);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?2:0;render("rag");});break;
 }
 }
 });
};
})();
