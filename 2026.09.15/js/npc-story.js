/* Character incubation workflow from the supplied diagram. Simulations and logs are illustrative. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawNpcObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createNpcStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawNpcObject,
 steps:()=>[
 ["meet","agent","에이전트","에이전트와 대화하며 개발할 캐릭터의 설정과 행동을 살펴봅니다.",3210],
 ["infrastructure","content","캐릭터 육성 인프라","게임 콘텐츠와 사유 구조화 온톨로지 엔진이 캐릭터 개발을 지원합니다.",3470],
 ["character","start","게임 캐릭터","행동과 의사 결정 구조를 설계하고 평가할 캐릭터를 정합니다.",3145],
 ["model","core","시스템다이나믹스와 Top-Down 디자인","시스템다이나믹스와 Top-Down 정적 지식 그래프로 캐릭터의 행동·판단 구조를 모델링합니다.",4380],
 ["simulate","alternative","시뮬레이션","캐릭터가 상황에 따라 어떻게 행동하고 판단하는지 시뮬레이션합니다.",3340],
 ["refine","core","시뮬레이션 피드백","시뮬레이션에서 확인한 내용을 캐릭터 모델에 반영합니다.",2950],
 ["sdk","chosen","게임 콘텐츠 SDK","모델링한 캐릭터를 게임 콘텐츠 SDK로 연결해 플레이에 적용합니다.",3405],
 ["play","report","플레이 로그","플레이에서 캐릭터가 마주한 상황과 그에 따른 행동·선택을 기록합니다.",3470],
 ["decisions","review","의사 결정 분석","로그를 살펴 캐릭터가 어떤 상황에서 어떤 선택을 했는지 분석합니다.",3405],
 ["update-character","feedback","캐릭터 업데이트","의사 결정 분석을 바탕으로 캐릭터의 행동과 판단 구조를 보완합니다.",3405],
 ["rebuild","core","모델 업데이트","변경 사항을 모델에 반영해 다음 시뮬레이션과 플레이에서 살펴봅니다.",3405],
 ["record","knowledge","캐릭터 경험을 지식으로","캐릭터 모델, 시뮬레이션과 실제 선택을 연결해 경험을 지식 그래프로 쌓습니다.",3795],
 ["ontology","rag","Bottom-Up 온톨로지 성장","쌓인 캐릭터 경험을 반영하면서 사유 구조화 온톨로지 엔진이 성장합니다.",3535]
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
