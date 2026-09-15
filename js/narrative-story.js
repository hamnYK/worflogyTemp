/* Narrative workflow from the supplied diagram; illustrative content and play logs. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawNarrativeObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createNarrativeStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawNarrativeObject,
 steps:()=>[
 ["meet","agent","에이전트","에이전트에게 문학·비문학 자료를 전달하고 만들고 싶은 이야기를 설명합니다.",3665],
 ["infrastructure","content","게임 서사 인프라","게임 콘텐츠와 게임 서사 온톨로지 엔진을 활용해 서사 구성을 지원합니다.",3600],
 ["sources","start","기초 자료","자료 속 개념과 관계를 살펴 세계관과 이야기의 바탕을 마련합니다.",3340],
 ["build","core","세계관·시나리오·NPC","세계관을 만들고 그 안에서 전개될 시나리오와 NPC를 구성합니다.",3340],
 ["edit","alternative","편집 순환","서사를 편집하고 수정한 내용을 세계관·시나리오·NPC에 반영합니다.",3405],
 ["sdk","chosen","게임 콘텐츠 SDK","구성한 서사를 게임 콘텐츠 SDK로 연결해 실제 플레이에 적용합니다.",3470],
 ["play","report","플레이 로그","플레이 중 일어난 사건과 플레이어·NPC의 상호작용을 로그로 기록합니다.",3600],
 ["analyze","review","서사 분석","플레이 로그를 살펴 이야기가 실제로 어떻게 전개됐는지 분석합니다.",3340],
 ["reconstruct","feedback","시나리오·NPC 재구성","분석 결과를 바탕으로 시나리오와 NPC를 다시 구성합니다.",3080],
 ["revise-world","core","진화하는 게임 서사","재구성한 내용을 서사 개발에 반영해 다음 플레이로 이어갑니다.",3210],
 ["record","knowledge","서사를 지식으로","자료부터 서사 구성, 플레이와 재구성까지 연결해 지식 그래프로 쌓습니다.",3600],
 ["ontology","rag","Bottom-Up 온톨로지 성장","새로운 서사와 플레이 경험을 반영하면서 게임 서사 온톨로지 엔진이 성장합니다.",3795]
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
