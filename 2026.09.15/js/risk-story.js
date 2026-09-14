/* Risk workflow supplied by WORFLOGY. Curves illustrate scenarios, not computed forecasts. */
(function(){
"use strict";
const INK=0x365646,BLUE=0x668eab,GOLD=0xc99748;
window.drawRiskObject=function(scene,node,state={}){
 if(!["simulation","core","review"].includes(node.id))return window.drawProblemObject(scene,node,state);
 const g=scene.add.graphics();
 const line=(a,b,c=INK,w=2)=>{g.lineStyle(w,c,1);g.lineBetween(...a,...b);};
 const dot=(x,y,r=3,c=INK)=>{g.fillStyle(c,1);g.fillCircle(x,y,r);};
 const box=(x,y,w,h,c=BLUE)=>{g.lineStyle(2,c,1);g.strokeRoundedRect(x,y,w,h,3);};
 const person=(x,y)=>{dot(x,y-10,6);g.fillStyle(INK,1);g.fillRoundedRect(x-8,y,16,17,4);};
 const arrow=(a,b,c=BLUE)=>{line(a,b,c);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(b,[b[0]-6*Math.cos(t-.5),b[1]-6*Math.sin(t-.5)],c);line(b,[b[0]-6*Math.cos(t+.5),b[1]-6*Math.sin(t+.5)],c);};
 if(node.id==="simulation"){
  box(-40,-38,80,75);
  [-28,-10,10,28].forEach(x=>{line([x,-44],[x,-38],BLUE);line([x,37],[x,43],BLUE);});
  // Stocks, directed flows and feedback above alternative time trajectories.
  box(-29,-27,19,15);box(12,-27,19,15);
  arrow([-10,-19],[12,-19]);
  line([22,-12],[22,-4],GOLD);line([22,-4],[-20,-4],GOLD);arrow([-20,-4],[-20,-12],GOLD);
  line([-28,5],[-28,27],BLUE);line([-28,27],[31,27],BLUE);
  const progress=state.simulationProgress||0;
  [0,1,2].forEach((scenario)=>{
   let prev=[-25,11];
   for(let i=1;i<=Math.floor(20*progress);i++){
    const t=i/20,p=[-25+t*54,11+Math.sin(t*3+scenario*.35)*8+(scenario-1)*t*9];
    line(prev,p,scenario===1?GOLD:BLUE,scenario===1?2:1.3);prev=p;
   }
   if(progress)dot(...prev,2,scenario===1?GOLD:BLUE);
  });
 }else if(node.id==="core"){
  g.lineStyle(2,INK,1);g.strokeCircle(-12,-7,23);line([5,11],[20,27],INK,4);
  [-24,-14,-4].forEach((x,i)=>{line([x,5],[x,5-(i+1)*8],state.riskDiagnosed?GOLD:BLUE,4);});
  [[20,-29],[32,-7],[24,15]].forEach(([x,y],i)=>{box(x-5,y-5,10,10);if(state.riskDiagnosed)line([11,-7],[x-6,y],GOLD);});
 }else{
  // A mentor guides a member with simulation evidence; visually distinct from peer review.
  person(-29,8);person(29,21);
  dot(-23,10,3,GOLD);
  box(-16,-34,49,29);line([-9,-13],[1,-23],BLUE);line([1,-23],[10,-16],BLUE);line([10,-16],[24,-28],GOLD);
  arrow([-17,13],[16,21]);
  if(state.mentored){line([-5,27],[1,33],GOLD,3);line([1,33],[14,19],GOLD,3);}
 }
 return g;
};
window.createRiskStory=function(scene){
 return window.createProblemStory(scene,{
  draw:window.drawRiskObject,
  steps:base=>{
   const replacements={
    meet:["agent","AI AGENT","Bring a project risk to the AI agent, the user's interaction interface.",2000],
    infrastructure:["simulation","RISK INFRASTRUCTURE","A system dynamics risk simulation engine works with the knowledge graph RAG ontology engine.",3000],
    discuss:["core","RISK DIAGNOSIS","Diagnose the project risk and develop feasible response strategies.",2600],
    select:["chosen","STRATEGY SELECTION","Compare the strategies and choose a feasible response to the diagnosed risk.",2600],
    review:["review","EXPERT MENTORING","The mentor who supplied the risk simulation know-how reviews the reported work and guides the team.",3300],
    adopt:["feedback","OFFICIAL POLICY","Following expert mentoring, adopt the validated response as policy for future project risks.",2800],
    accumulate:["knowledge","RISK OPTIMIZATION → KNOWLEDGE","Connect risk diagnosis, strategies, work reports, mentoring and adopted policy in the knowledge graph.",3100],
    similar:["start","A SIMILAR PROJECT RISK","Retrieve accumulated knowledge when a similar project risk arises.",2400],
    policy:["feedback","POLICY FIRST","Recommend the established policy first as a starting point for the next risk response.",2700],
    expand:["knowledge","NETWORK GROWTH LOOP","New risk contexts and reconsidered strategies add relationships and keep the ontology growing.",3100]
   };
   const result=base.map(([key,...rest])=>[key,...(replacements[key]||rest)]);
   result.splice(3,0,["simulate","simulation","SYSTEM DYNAMICS","Compare how risk may evolve over time through system dynamics feedback and scenario simulation.",3200]);
   return result;
  },
  onStep(key,{state,focus,flow,render,animate}){
   if(key==="infrastructure"){
    focus(["simulation","rag","agent"]);flow("simulation","agent",BLUE);flow("simulation","rag",BLUE);
    render("simulation");
   }else if(key==="discuss"){
    state.riskDiagnosed=true;render("core");
   }else if(key==="simulate"){
    focus(["core","simulation","rag","agent"]);flow("simulation","agent",BLUE);
    animate(p=>{state.simulationProgress=p;state.simulated=p===1;render("simulation");});
   }else if(key==="review"){
    state.mentored=true;focus(["report","review","simulation"]);render("review");
   }
  }
 });
};
})();
