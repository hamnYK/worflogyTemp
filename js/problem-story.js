/* Company-provided collaboration workflow; scripted visual demonstration. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawProblemObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createProblemStory=function(scene,options={}){
 const state={discussed:false,selected:false,weakSignal:false,reported:false,reviewed:false,policyAdopted:false,policyRecommended:false,alternativeRecommended:false,knowledgeNodes:0,engineRevision:0};
 const layers=new Map(),tweens=[],particles=[];let settle=null;
 let steps=[
 ["meet","agent","에이전트","에이전트에게 문제를 설명하고 팀의 논의를 시작합니다.",2885],
 ["infrastructure","rag","온톨로지 엔진","워크플로 온톨로지 엔진이 관련 지식을 찾아 에이전트를 통한 팀의 논의를 지원합니다.",3990],
 ["discuss","core","팀의 숙의","팀원들이 문제를 함께 살펴보고 여러 해결 전략을 제안합니다.",3145],
 ["select","chosen","전략 선택","전략의 가능성과 한계를 충분히 논의한 뒤 실행할 전략을 선택합니다.",3405],
 ["retain","alternative","위크시그널","이번에 선택하지 않은 전략도 위크시그널로 남겨 두고 다른 가능성을 계속 살펴봅니다.",3990],
 ["execute","report","과업 수행과 보고","선택한 전략을 구체적인 과업으로 나누어 수행하고 결과를 보고합니다.",3405],
 ["review","review","동료 검토","동료들이 실행 과정과 결과를 검토하고 해결 방법을 평가합니다.",3210],
 ["adopt","feedback","공식 정책 채택","동료 검토를 거친 해결 방법을 해당 문제의 공식 정책으로 채택합니다.",3470],
 ["accumulate","knowledge","협업을 지식으로","전략과 선택의 이유, 실행 결과와 정책을 연결해 협업 경험을 지식 그래프로 쌓습니다.",4055],
 ["grow","rag","Bottom-Up 온톨로지 성장","새롭게 쌓인 지식과 관계를 반영하면서 워크플로 온톨로지 엔진이 성장합니다.",3665],
 ["similar","start","유사한 문제","유사한 문제가 생기면 이전에 쌓인 정책과 해결 경험을 찾아봅니다.",3340],
 ["policy","feedback","정책 우선 추천","이전에 채택한 정책을 우선 추천해 다음 문제 해결의 출발점으로 삼습니다.",3600],
 ["reconsider","alternative","위크시그널 재검토","새로운 상황에 적합하다면 이전에 선택하지 않았던 전략도 다시 추천합니다.",3600],
 ["expand","knowledge","네트워크 성장 루프","전략을 재검토하는 과정에서 새로운 관계가 생기고, 성장한 지식이 다음 협업에 활용됩니다.",4185]
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
