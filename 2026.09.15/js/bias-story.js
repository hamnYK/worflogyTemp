/* Supplied agent-bias workflow. Dialogue and reports are scripted illustrations. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawBiasObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createBiasStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawBiasObject,
 steps:()=>[
 ["meet","agent","에이전트와 대화","에이전트와 대화하며 특정 주제에서 어떤 편향이 드러나는지 살펴봅니다.",3470],
 ["infrastructure","rag","인지 편향 진단 온톨로지 엔진","인지 편향 진단 온톨로지 엔진이 대화 맥락과 의사 결정의 분석을 지원합니다.",3730],
 ["topic","start","게임 시뮬레이션과 대화 시작","편향을 살펴볼 주제와 역할극의 상황을 정합니다.",2690],
 ["choose-bias","core","진단할 인지 편향 선택","해당 주제에서 에이전트의 판단을 살펴볼 인지 편향을 선택합니다.",3275],
 ["roleplay","dialogue","역할극 게임과 NPC 대화","NPC 역할의 에이전트와 대화하고, 응답과 선택을 상황 맥락과 함께 기록합니다.",3860],
 ["analyze-logs","review","게임 로그 분석","대화 상황과 로그를 함께 살펴 에이전트의 응답과 선택에 나타난 편향을 분석합니다.",3925],
 ["bias-report","report","인지 편향 분석과 보고","에이전트가 보인 편향을 정리하고, 판단 근거가 된 대화와 선택을 함께 보고합니다.",3925],
 ["record","knowledge","진단 과정을 지식으로","주제와 진단 기준, 대화와 분석 근거를 연결해 지식 그래프로 쌓습니다.",3535],
 ["ontology","rag","온톨로지 성장","축적된 진단 경험을 반영하면서 인지 편향 진단 온톨로지 엔진이 성장합니다.",3665]
 ],
 onStep(key,{state,focus,flow,render,animate}){
 switch(key){
 case "topic":state.topicSet=true;focus(["start","core"]);flow("start","core");break;
 case "choose-bias":state.biasSelected=true;focus(["core"]);render("core");break;
 case "roleplay":focus(["core","dialogue","agent"]);flow("core","dialogue");animate(p=>{state.dialogueTurns=Math.floor(p*5);render("dialogue");});break;
 case "analyze-logs":focus(["dialogue","review"]);flow("dialogue","review");animate(p=>{state.analysisProgress=p;render("review");});break;
 case "bias-report":state.reportReady=true;state.subject="agent";focus(["review","report"]);flow("review","report");render("report");break;
 case "record":focus(["core","dialogue","review","report","logic","knowledge"]);flow("logic","knowledge");animate(p=>{state.knowledgeNodes=Math.floor(p*16);render("knowledge");});break;
 case "ontology":focus(["knowledge","rag","agent"]);flow("knowledge","rag",GOLD);animate(p=>{state.engineRevision=p>.5?2:0;render("rag");});break;
 }
 }
 });
};
})();
