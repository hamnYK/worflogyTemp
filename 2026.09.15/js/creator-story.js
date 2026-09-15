/* Solo developer support workflow from the supplied diagram. Metrics are illustrative. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawCreatorObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createCreatorStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawCreatorObject,
 steps:()=>[
 ["meet","agent","에이전트","에이전트에게 개발 중인 게임의 현황과 목표를 설명합니다.",3015],
 ["infrastructure","incubation","개발자 지원 인프라","게임 콘텐츠와 통계 데이터를 두 온톨로지 엔진과 연결해 개발을 지원합니다.",3665],
 ["developer","start","1인 개발자","개발자의 게임이 놓인 상황과 시장을 살펴 다음 목표를 정할 준비를 합니다.",3665],
 ["targets","core","게임·시장 분석과 정량 지표","게임과 시장을 분석하고 성장을 확인할 수 있는 정량 지표를 정합니다.",3470],
 ["mentor","alternative","멘토링 순환","멘토와 함께 분석 내용과 목표 지표를 검토하고 보완합니다.",3080],
 ["sdk","chosen","게임 콘텐츠 SDK","게임 콘텐츠를 SDK와 연결해 실제 운영 지표를 수집할 준비를 합니다.",3535],
 ["collect","report","지표 수집","설정한 지표에 따라 게임의 운영 수치를 수집합니다.",2820],
 ["metrics","review","지표 분석","수집한 지표를 분석해 현재 상태와 변화 추세를 파악합니다.",3080],
 ["guide-growth","feedback","성장 가이드와 추세 분석","추세를 바탕으로 개발 방향을 안내하고 다음 목표 지표를 다시 정합니다.",3535],
 ["reset-targets","core","지표 재설정","조정한 지표를 게임·시장 분석에 반영해 다음 개발 활동으로 이어갑니다.",3535],
 ["record","knowledge","개발 경험을 지식으로","분석, 멘토링, 지표와 목표 조정의 이유를 연결해 개발 경험을 지식 그래프로 쌓습니다.",4120],
 ["ontology","rag","온톨로지 성장","축적된 경험이 게임 인큐베이터 온톨로지 엔진과 워크플로 온톨로지 엔진을 함께 성장시킵니다.",4250]
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
