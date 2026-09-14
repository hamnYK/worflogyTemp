/* Character incubation workflow from the supplied diagram. Simulations and logs are illustrative. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawNpcObject=function(scene,node,state={}){
 if(!["start","core","alternative","review","feedback"].includes(node.id))return window.drawNarrativeObject(scene,node,state);
 const g=scene.add.graphics(),id=node.id;
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=3,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=BLUE)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,3);};
 const person=(x,y)=>{dot(x,y-14,8);g.fillStyle(INK,1);g.fillRoundedRect(x-11,y,22,23,5);line([x-6,y+22],[x-9,y+34],INK,3);line([x+6,y+22],[x+9,y+34],INK,3);};
 const arrow=(a,b,c=INK)=>{line(a,b,c);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(b,[b[0]-6*Math.cos(t-.5),b[1]-6*Math.sin(t-.5)],c);line(b,[b[0]-6*Math.cos(t+.5),b[1]-6*Math.sin(t+.5)],c);};
 if(id==="start"){person(0,-7);g.lineStyle(2,BLUE,1);g.strokeEllipse(0,33,60,18);}
 else if(id==="core"){
  const pts=[[0,-30],[-27,-5],[27,-5],[-30,24],[0,24],[30,24]];
  [[0,1],[0,2],[1,3],[1,4],[2,5]].forEach(([a,b])=>arrow(pts[a],pts[b],BLUE));
  pts.forEach(p=>box(p[0]-5,p[1]-5,10,10));
  arrow([38,20],[43,-16],state.modelReady?GOLD:BLUE);arrow([43,-16],[12,-30],state.modelReady?GOLD:BLUE);
  if(state.modelRevision){line([-30,32],[30,32],GOLD,3);dot(0,-30,3,GOLD);}
 }else if(id==="alternative"){
  box(-38,-33,76,65);
  const pts=[[-26,17],[-4,-14],[23,-19],[25,14]];
  [[0,1],[1,2],[1,3]].forEach(([a,b])=>arrow(pts[a],pts[b],BLUE));
  pts.forEach(p=>dot(...p,3));
  if(state.simulationProgress){const p=state.simulationProgress;
   const a=p<.5?pts[0]:pts[1],b=p<.5?pts[1]:pts[3],t=p<.5?p*2:(p-.5)*2;
   dot(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,5,GOLD);
  }
 }else if(id==="review"){
  const pts=[[-28,19],[-12,-3],[9,-22],[13,12]];
  [[0,1],[1,2],[1,3]].forEach(([a,b])=>arrow(pts[a],pts[b],BLUE));
  pts.forEach(p=>dot(...p,3));
  g.lineStyle(2,INK,1);g.strokeCircle(16,4,18);line([29,17],[41,29],INK,4);
  if(state.decisionsAnalyzed){arrow(pts[1],pts[3],GOLD);dot(13,12,4,GOLD);}
 }else{
  person(-7,-10);arrow([18,26],[18,-20],state.characterUpdated?GOLD:BLUE);
  [-12,0,12].forEach((y,i)=>line([28,y],[state.characterUpdated?40:34,y],i===1?GOLD:BLUE,3));
  if(state.characterUpdated){g.lineStyle(2,GOLD,1);g.strokeCircle(-7,-24,14);}
 }
 return g;
};
window.createNpcStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawNpcObject,
 steps:()=>[
 ["meet","agent","AI AGENT","Bring a game character to the AI agent.",1900],
 ["infrastructure","content","CHARACTER INFRASTRUCTURE","Game content and the knowledge graph RAG ontology engine support the agent.",2700],
 ["character","start","GAME CHARACTER","Start with the game character to be developed and evaluated.",2400],
 ["model","core","SYSTEM DYNAMICS & TOP-DOWN DESIGN","Represent the character using system dynamics and a Top-Down static knowledge graph.",2900],
 ["simulate","alternative","SIMULATION","Simulate the character's behavior and decisions using the model.",2800],
 ["refine","core","SIMULATION FEEDBACK","Use the simulation to refine the character model.",2600],
 ["sdk","chosen","GAME CONTENT SDK","Connect the modeled character to the game content SDK.",2500],
 ["play","report","PLAY LOGS","Gameplay produces logs of character behavior and decisions.",2700],
 ["decisions","review","DECISION ANALYSIS","Analyze the character's decisions recorded in the play logs.",2800],
 ["update-character","feedback","CHARACTER UPDATE","Use decision analysis to update the game character.",2700],
 ["rebuild","core","MODEL UPDATE","Feed the updated character back into the model for the next simulation and gameplay cycle.",2900],
 ["record","knowledge","CHARACTER EXPERIENCE → KNOWLEDGE","Connect character models, simulations, play logs, decisions and updates in the knowledge graph.",2900],
 ["ontology","rag","BOTTOM-UP ONTOLOGY GROWTH","Accumulated character experience dynamically grows the RAG ontology engine.",2900]
 ],
 onStep(key,{state,focus,flow,render,animate}){
 switch(key){
 case "infrastructure":focus(["content","rag","agent"]);flow("content","agent",BLUE);flow("content","rag",BLUE);break;
 case "character":focus(["start","core"]);flow("start","core");break;
 case "model":state.modelReady=true;focus(["core"]);render("core");break;
 case "simulate":focus(["core","alternative"]);flow("core","alternative",GOLD);animate(p=>{state.simulationProgress=p;render("alternative");});break;
 case "refine":state.modelRevision=1;focus(["alternative","core"]);flow("alternative","core",GOLD);render("core");break;
 case "sdk":state.sdkReady=true;focus(["core","chosen"]);flow("core","chosen");render("chosen");break;
 case "play":focus(["chosen","report"]);flow("chosen","report");animate(p=>{state.playLogCount=Math.floor(p*5);render("report");});break;
 case "decisions":state.decisionsAnalyzed=true;focus(["report","review"]);flow("report","review");render("review");break;
 case "update-character":state.characterUpdated=true;focus(["review","feedback"]);flow("review","feedback");render("feedback");break;
 case "rebuild":state.modelRevision=2;focus(["feedback","core"]);flow("feedback","core",GOLD);render("core");break;
 case "record":focus(["core","alternative","chosen","report","review","feedback","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(p*18);render("knowledge");});break;
 case "ontology":focus(["knowledge","rag","agent"]);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?2:0;render("rag");});break;
 }
 }
 });
};
})();
