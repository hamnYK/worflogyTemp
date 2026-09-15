/* Diagram-based research notebook demonstration. Data, transactions and analysis are illustrative. */
(function(){
"use strict";
const INK=window.WorfTheme.active,BLUE=window.WorfTheme.link,GOLD=window.WorfTheme.flow;
window.drawResearchObject=function(scene,node,state={}){return window.WorfArt.draw(scene,node,state);};
window.createResearchStory=function(scene){
 return window.createProblemStory(scene,{
 draw:window.drawResearchObject,
 steps:()=>[
 ["meet","agent","에이전트","에이전트에게 연구 주제를 설명하고 실험 설계에 대한 대화를 시작합니다.",3535],
 ["infrastructure","api","연구 지원 인프라","외부 학술 자료와 워크플로 온톨로지 엔진을 활용해 연구 주제를 살펴봅니다.",3665],
 ["topic","start","연구 주제","연구 주제를 바탕으로 노트를 작성하고 AI 파트너의 제안도 함께 검토합니다.",3730],
 ["draft","core","내용 작성과 인과율 설정","연구 내용을 기록하고 실험에서 살펴볼 원인과 결과의 관계를 설정합니다.",3535],
 ["purchase","alternative","구매와 개선","설계를 구매해 개선하고, 보완한 내용을 연구 노트와 인과관계에 반영합니다.",3665],
 ["sell","chosen","판매된 설계","판매된 실험 설계가 검토되면서 동의하는 내용과 논의할 쟁점이 모입니다.",3535],
 ["discourse","report","동의와 쟁점","설계에서 동의하는 부분과 의견이 갈리는 쟁점을 정리합니다.",3080],
 ["analysis","review","내용 분석","논의 내용을 분석해 설계에서 더 검토하거나 보완할 부분을 찾습니다.",3405],
 ["suggestions","feedback","AI 파트너의 제안","AI 파트너가 내용 분석을 바탕으로 연구 설계를 보완할 방향을 제안합니다.",3665],
 ["evolve","core","진화하는 실험 설계","제안을 연구 내용과 인과관계에 반영해 다음 실험 설계를 보완합니다.",3405],
 ["record","knowledge","연구를 지식으로","설계, 개선과 논의의 근거를 연결해 연구 경험을 지식 그래프로 쌓습니다.",3600],
 ["ontology","rag","Bottom-Up 온톨로지 성장","쌓인 연구 지식과 관계를 반영하면서 워크플로 온톨로지 엔진이 성장합니다.",3600]
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
