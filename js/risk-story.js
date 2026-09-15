/* Risk workflow supplied by WORFLOGY. Curves illustrate scenarios, not computed forecasts. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawRiskObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createRiskStory=function(scene){
 return window.createProblemStory(scene,{
  draw:window.drawRiskObject,
  steps:base=>{
   const replacements={
    meet:["agent","에이전트","에이전트에게 프로젝트 상황과 우려되는 리스크를 설명합니다.",3080],
    infrastructure:["simulation","리스크 대응 인프라","리스크 시뮬레이션 엔진과 워크플로 온톨로지 엔진이 함께 대응 전략의 검토를 지원합니다.",4120],
    discuss:["core","리스크 진단","문제가 프로젝트에 미칠 리스크를 진단하고 여러 대응 전략을 세웁니다.",3470],
    select:["chosen","전략 선택","진단과 시뮬레이션 결과를 바탕으로 실행할 대응 전략을 선택합니다.",3340],
    review:["review","전문가 멘토링","시뮬레이션 노하우를 제공한 멘토가 수행 결과를 검토하고 보완할 점을 짚습니다.",3795],
    adopt:["feedback","정책 채택","전문가 멘토링을 거친 대응 방법을 이후에도 활용할 수 있는 정책으로 채택합니다.",3860],
    accumulate:["knowledge","리스크 최적화를 지식으로","리스크 진단부터 전략, 수행 결과와 멘토링까지 연결해 대응 경험을 지식 그래프로 쌓습니다.",4250],
    similar:["start","유사한 프로젝트 리스크","유사한 프로젝트 리스크가 발생하면 이전 대응 경험과 정책을 찾아봅니다.",3535],
    policy:["feedback","정책 우선 추천","이전에 채택한 정책을 우선 추천해 다음 리스크 대응에 활용합니다.",3340],
    expand:["knowledge","네트워크 성장 루프","새로운 리스크 상황과 전략의 관계가 쌓이면서 온톨로지가 성장하고 다음 대응을 지원합니다.",4185]
   };
   const result=base.map(([key,...rest])=>[key,...(replacements[key]||rest)]);
   result.splice(3,0,["simulate","simulation","시스템다이나믹스","시스템다이나믹스 시뮬레이션으로 전략에 따라 리스크가 시간에 걸쳐 어떻게 달라지는지 비교합니다.",4380]);
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
