/* Company philosophy animation. Narration follows the company-provided explanation.
   W3C/third-party history is not independently asserted by this visual demonstration. */
(function () {
  "use strict";
  window.createOverviewStory = function (scene) {
    const BLUE=window.WorfTheme.link,GREEN=window.WorfTheme.active,GOLD=window.WorfTheme.flow;
    const layers=new Map(),tweens=[],particles=[];
    const state={topNodes:6,topStrength:1,bottomNodes:3,growthCycles:0,topSemantics:0,bottomSemantics:0,cosmos:0,topCosmos:0,bottomCosmos:0,chapter:"top-down"};
    let settle=null;
    const steps=[
      ["cosmos","ontology","온톨로지는 의미와 관계가 연결된 세계, 시맨틱 코스모스입니다. 먼저 Top-Down으로 구성하는 과정을 살펴봅니다.",5160],
      ["interpret","holistic","현상을 이루는 요소와 그 관계를 전체 흐름 속에서 해석합니다.",3210],
      ["top","linked","이 해석을 상위 개념에서 세부 요소로 내려가며 구조화합니다.",3145],
      ["reinforce","linked","기존 구조를 반복해서 활용하며 노드 사이의 연결을 강화합니다.",3210],
      ["top-semantics","semantics","Top-Down으로 정리한 의미와 관계, 시맨틱스를 모읍니다.",3210],
      ["top-assemble","ontology","모인 시맨틱스를 연결해 하나의 시맨틱 코스모스를 완성합니다.",3145],
      ["top-complete","ontology","전통적인 Top-Down은 기존 네트워크의 강화를 지향하는 시맨틱 기술입니다.",3795],
      ["bottom-start","ontology","이번에는 워플로지가 고안한 Bottom-Up 방식으로 시맨틱 코스모스를 새롭게 구성합니다.",4250],
      ["bottom-interpret","holistic","현상을 전체 흐름 속에서 해석하고, 요소들이 서로 주는 영향을 살펴봅니다.",3665],
      ["reconstruct","dynamics","이 해석을 원인과 결과, 상호작용과 피드백을 담은 체계역학 구조로 바꿉니다.",3730],
      ["weak-signal","signal","작지만 새로운 가능성을 보여주는 위크시그널을 체계역학 디자인에 반영합니다.",3665],
      ["grow","worflogy","새로운 의미와 관계를 아래에서부터 쌓아 올립니다. 이 순환이 반복되면서 네트워크가 성장합니다.",4600],
      ["bottom-semantics","semantics","Bottom-Up으로 형성한 의미와 관계, 시맨틱스를 모읍니다.",3275],
      ["bottom-assemble","ontology","성장하며 만들어진 시맨틱스를 연결해 시맨틱 코스모스를 완성합니다.",3340],
      ["bottom-complete","ontology","워플로지가 고안한 Bottom-Up은 새로운 노드와 관계를 더하며 네트워크의 성장을 지향합니다.",4445]
    ];
    function layer(id) {
      if(!layers.has(id)){
        const widget=scene.widgets.get(id);
        widget.list[1].setVisible(false);
        const graphic=scene.add.graphics();widget.add(graphic);layers.set(id,graphic);
      }
      return layers.get(id);
    }
    function dot(g,x,y,r,color){g.fillStyle(color,1);g.fillCircle(x,y,r);}
    function segment(g,a,b,color,width=2,alpha=1){g.lineStyle(width,color,alpha);g.lineBetween(a[0],a[1],b[0],b[1]);}
    const fixed=[[0,-35],[-25,-5],[25,-5],[-35,30],[0,30],[35,30]];
    const fixedEdges=[[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,4],[4,5]];
    const growing=[[-11,0],[12,-18],[16,20],[-35,-21],[-38,23],[38,-34],[43,9],[13,42],[-18,-44]];
    const growthEdges=[[0,1],[1,2],[0,2],[0,3],[0,4],[1,5],[2,6],[2,7],[3,8],[3,4],[5,6]];
    function top(progress=1,strength=state.topStrength,phase=0) {
      window.WorfArt.paint(layer("linked"),scene,scene.nodes.get("linked"),{topProgress:progress,topStrength:strength});
    }
    function bottom(count=state.bottomNodes,progress=1) {
      window.WorfArt.paint(layer("worflogy"),scene,scene.nodes.get("worflogy"),{bottomNodes:count});
    }
    function semantics() {
      window.WorfArt.paint(layer("semantics"),scene,scene.nodes.get("semantics"),{semanticCount:state.chapter==="top-down"?state.topSemantics:state.bottomSemantics});
    }
    function cosmos(progress=state.cosmos) {
      window.WorfArt.paint(layer("ontology"),scene,scene.nodes.get("ontology"),{cosmos:progress,chapter:state.chapter});
    }
    function animate(draw,duration,finalize) {
      settle=()=>{finalize?.();draw(1);};
      const t=scene.tweens.addCounter({from:0,to:1,duration,onUpdate:tween=>draw(tween.getValue()),onComplete:()=>{finalize?.();settle=null;}});
      tweens.push(t);
    }
    function travel(from,to,color) {
      const a=scene.nodes.get(from),b=scene.nodes.get(to);
      for(let i=0;i<3;i++){
        const p=scene.add.circle(a.x,a.y,3.5,color).setDepth(1900);particles.push(p);
        tweens.push(scene.tweens.add({targets:p,x:b.x,y:b.y,delay:i*180,duration:1000,onComplete:()=>p.destroy()}));
      }
    }
    function finishStep() {
      tweens.splice(0).forEach(t=>t.stop());
      if(settle){const final=settle;settle=null;final();}
      particles.splice(0).forEach(p=>p.destroy());
      ["holistic","dynamics","signal"].forEach(id=>scene.widgets.get(id)?.list[1].setAlpha(1).setAngle(0).setScale(1));
    }
    function step(key) {
      finishStep();
      const [,focus,text,duration]=steps.find(s=>s[0]===key);
      if(key==="bottom-start"){
        state.chapter="bottom-up";state.cosmos=0;
        scene.visited=new Set();
        semantics();cosmos(0);
      }
      scene.visited.add(focus);scene.select(focus);
      switch(key){
        case "cosmos":cosmos(0);break;
        case "bottom-interpret":
        case "interpret":
          const lens=scene.widgets.get("holistic").list[1];
          tweens.push(scene.tweens.add({targets:lens,scaleX:1.12,scaleY:1.12,yoyo:true,duration:650}));
          break;
        case "top":
          travel("holistic","linked",BLUE);
          animate(p=>top(p,1),1800,()=>{state.topStrength=1;});
          break;
        case "reinforce":
          animate(p=>top(1,1+3*p,p),2200,()=>{state.topStrength=4;});
          break;
        case "top-semantics":
          travel("linked","semantics",BLUE);
          animate(p=>{state.topSemantics=Math.ceil(p*3);semantics();},1500);
          break;
        case "reconstruct":
          travel("holistic","dynamics",GREEN);
          const gear=scene.widgets.get("dynamics").list[1];
          tweens.push(scene.tweens.add({targets:gear,angle:90,duration:1800}));
          break;
        case "weak-signal":
          travel("signal","dynamics",GOLD);
          const signal=scene.widgets.get("signal").list[1];
          tweens.push(scene.tweens.add({targets:signal,alpha:.25,yoyo:true,repeat:3,duration:220}));
          break;
        case "grow":
          travel("dynamics","worflogy",GREEN);
          animate(p=>{state.growthCycles=Math.floor(p*3);state.bottomNodes=3+2*state.growthCycles;bottom(state.bottomNodes,p);},4000);
          break;
        case "bottom-semantics":
          travel("worflogy","semantics",GREEN);
          animate(p=>{state.bottomSemantics=Math.ceil(p*3);semantics();},1500);
          break;
        case "top-assemble":
          travel("semantics","ontology",BLUE);
          animate(p=>{state.cosmos=p;state.topCosmos=p;cosmos(p);},2300);
          break;
        case "bottom-assemble":
          travel("semantics","ontology",GREEN);
          animate(p=>{state.cosmos=p;state.bottomCosmos=p;cosmos(p);},2300);
          break;
      }
      return {focus,text,duration};
    }
    return {
      stages:steps.map(([key])=>({type:"overview",key})),
      step,finishStep,
      stats:()=>({...state}),
      destroy(){finishStep();layers.forEach(g=>g.destroy());layers.clear();}
    };
  };
})();