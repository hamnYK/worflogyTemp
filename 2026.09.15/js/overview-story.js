/* Company philosophy animation. Narration follows the company-provided explanation.
   W3C/third-party history is not independently asserted by this visual demonstration. */
(function () {
  "use strict";
  window.createOverviewStory = function (scene) {
    const BLUE=0x668eab,GREEN=0x365646,GOLD=0xc99748;
    const layers=new Map(),tweens=[],particles=[];
    const state={topNodes:6,topStrength:1,bottomNodes:3,growthCycles:0,topSemantics:0,bottomSemantics:0,cosmos:0,topCosmos:0,bottomCosmos:0,chapter:"top-down"};
    let settle=null;
    const steps=[
      ["cosmos","ontology","먼저 전통적인 Top-Down 방식으로 온톨로지를 구성합니다.",2200],
      ["interpret","holistic","현상을 전체론적으로 해석합니다.",1800],
      ["top","linked","전체론적 해석을 위에서 아래로 구조화합니다.",2300],
      ["reinforce","linked","기존 노드와 연결을 유지하면서 네트워크를 강화합니다.",2800],
      ["top-semantics","semantics","Top-Down으로 만든 시맨틱스를 모읍니다.",2000],
      ["top-assemble","ontology","Top-Down의 시맨틱스로 시맨틱 코스모스를 완성합니다.",2800],
      ["top-complete","ontology","전통적인 Top-Down은 네트워크 강화를 지향하는 시맨틱 기술입니다.",3400],
      ["bottom-start","ontology","이제 워플로지의 Bottom-Up 방식으로 별도의 시맨틱 코스모스를 구성합니다.",2400],
      ["bottom-interpret","holistic","현상을 전체론적으로 해석합니다.",1800],
      ["reconstruct","dynamics","전체론적 해석을 체계역학 디자인으로 재구성합니다.",2300],
      ["weak-signal","signal","위크시그널 이론이 체계역학 디자인에 영향을 줍니다.",2300],
      ["grow","worflogy","노드와 관계가 반복적으로 증가하는 네트워크 성장 루프입니다.",4600],
      ["bottom-semantics","semantics","Bottom-Up으로 만든 시맨틱스를 모읍니다.",2000],
      ["bottom-assemble","ontology","Bottom-Up의 시맨틱스로 별도의 시맨틱 코스모스를 완성합니다.",2800],
      ["bottom-complete","ontology","워플로지가 고안한 Bottom-Up은 네트워크 성장을 지향하는 시맨틱 기술입니다.",3400]
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
      const g=layer("linked");g.clear();
      fixedEdges.forEach(([a,b],i)=>{if(i/fixedEdges.length<=progress)segment(g,fixed[a],fixed[b],BLUE,strength);});
      fixed.forEach((p,i)=>{if(i/6<=progress)dot(g,...p,5,BLUE);});
      if(strength>1&&phase<1){const route=[0,1,3,4,5,2,0],v=phase*12,index=Math.floor(v)%6,a=fixed[route[index]],b=fixed[route[index+1]],t=v-Math.floor(v);dot(g,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,5,GOLD);}
    }
    function bottom(count=state.bottomNodes,progress=1) {
      const g=layer("worflogy");g.clear();
      growthEdges.forEach(([a,b])=>{if(a<count&&b<count)segment(g,growing[a],growing[b],a>2||b>2?GOLD:GREEN,2);});
      growing.slice(0,count).forEach((p,i)=>dot(g,...p,i<3?5:4,i<3?GREEN:GOLD));
      // Each revolution introduces a new signal, then two new nodes and their relations.
      const cycle=Math.min(2,Math.floor(progress*3)),phase=progress===1?1:progress*3-cycle;
      const angle=phase*Math.PI*2-Math.PI/2;
      g.lineStyle(1.5,GREEN,.35);g.strokeEllipse(0,-1,110,99);
      if(progress<1){dot(g,Math.cos(angle)*55,Math.sin(angle)*49-1,4,GOLD);g.lineStyle(1,GOLD,.35);g.strokeCircle(0,0,14+phase*37);}
      g.fillStyle(GREEN,.7);g.fillTriangle(51,-19,58,-11,47,-9);
    }
    function semantics() {
      const g=layer("semantics");g.clear();
      const count=state.chapter==="top-down"?state.topSemantics:state.bottomSemantics;
      for(let i=0;i<count;i++){const x=(i%3-1)*23,y=Math.floor(i/3)*25-15,color=state.chapter==="top-down"?BLUE:GREEN;
        dot(g,x-5,y,4,color);dot(g,x+6,y-7,4,color);segment(g,[x-5,y],[x+6,y-7],color,2);
      }
    }
    function cosmos(progress=state.cosmos) {
      const g=layer("ontology");g.clear();
      const color=state.chapter==="top-down"?BLUE:GREEN;
      g.lineStyle(1,color,.45);g.strokeEllipse(0,-4,98,76);g.strokeEllipse(0,-4,44,86);
      const points=[[-32,-18],[-14,-33],[12,-28],[32,-9],[25,18],[0,31],[-27,19],[-5,-5],[11,8]];
      const count=Math.floor(progress*points.length);
      points.slice(0,count).forEach((p,i)=>{
        if(i)segment(g,points[i-1],p,color,1.7,.8);
        if(i>3)segment(g,points[i-4],p,color,1,.5);
        dot(g,...p,4,color);
      });
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