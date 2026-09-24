/* Interactive diagram renderer. Content lives in diagrams.js; no backend calls. */
(function () {
  "use strict";
  window.createDiagramExplorer = function (host, callbacks) {
    if (!window.Phaser) return null;
    const mobileInput = window.matchMedia("(max-width:760px)");
    let activeScene;
    const syncInput = () => {
      if (!activeScene) return;
      activeScene.input.enabled = !mobileInput.matches;
      activeScene.pan = null;
      activeScene.game.canvas.style.pointerEvents = mobileInput.matches ? "none" : "auto";
      activeScene.game.canvas.style.touchAction = mobileInput.matches ? "auto" : "none";
    };
    mobileInput.addEventListener("change", syncInput);
    let pending;
    let visible=true;
    const layouts = new Map();
    const views = new Map();
    const heritageLayer=document.createElement("div");
    heritageLayer.className="canvas-heritage";
    host.append(heritageLayer);
    class DiagramScene extends Phaser.Scene {
      create() {
        activeScene = this;
        syncInput();
        this.frame = this.add.graphics();
        this.edgesLayer = this.add.graphics();
        this.widgets = new Map();
        this.decorations = [];
        this.selected = null;
        this.input.on("drag", (pointer, item, x, y) => {
          this.manualView=true;
          item.setPosition(x, y);
          const model = this.nodes.get(item.name);
          model.x = x; model.y = y;
          item.setDepth(y+100);
          this.drawEdges();
          if(model.id==="knowledge"&&this.outputDrawing)this.drawKnowledgeGraph();
        });
        this.input.on("dragend", () => {this.saveLayout();this.saveView();});
        this.input.on("pointerdown", (pointer, over) => {
          if (!over.length) this.pan = { x: pointer.x, y: pointer.y, scrollX: this.cameras.main.scrollX, scrollY: this.cameras.main.scrollY };
        });
        this.input.on("pointermove", (pointer) => {
          if (!this.pan || !pointer.isDown) return;
          this.manualView=true;
          const camera = this.cameras.main;
          camera.scrollX = this.pan.scrollX - (pointer.x - this.pan.x) / camera.zoom;
          camera.scrollY = this.pan.scrollY - (pointer.y - this.pan.y) / camera.zoom;
          this.saveView();
        });
        this.input.on("pointerup", (pointer) => {
          if (this.pan && Math.hypot(pointer.x-this.pan.x,pointer.y-this.pan.y)<5) this.select(null);
          this.pan = null;
        });
        this.input.on("gameout", () => { this.pan = null; });
        const wheelHandler=event=>{
          if(mobileInput.matches||!event.ctrlKey||event.deltaY===0)return;
          event.preventDefault();
          const rect=this.game.canvas.getBoundingClientRect();
          this.zoomBy(event.deltaY>0?0.9:1.1,
            (event.clientX-rect.left)*this.scale.width/rect.width,
            (event.clientY-rect.top)*this.scale.height/rect.height);
        };
        host.addEventListener("wheel",wheelHandler,{passive:false});
        this.events.once("shutdown",()=>host.removeEventListener("wheel",wheelHandler));
        this.scale.on("resize", () => this.resizeView());
        if (pending) this.loadDiagram(pending);
        if(!visible){this.scene.pause();game.loop.sleep();}
      }
      saveView() {
        if(!this.diagram)return;
        const c=this.cameras.main;
        views.set(this.diagram.id,{zoom:c.zoom,x:c.scrollX+c.width/2,y:c.scrollY+c.height/2,manual:Boolean(this.manualView)});
      }
      restoreView(view) {
        this.manualView=view.manual;
        this.cameras.main.setZoom(view.zoom).centerOn(view.x,view.y);
        callbacks.zoom(view.zoom);
      }
      resizeView() {
        if(!this.diagram)return;
        const view=views.get(this.diagram.id);
        if(view?.manual){this.restoreView(view);return;}
        this.fit();
        this.focusMobile(this.selected||(this.diagram.group?"agent":"worflogy"));
      }
      project(x,y) { return {x:(x-y)*0.82+580,y:(x+y)*0.43+30}; }
      saveLayout() {
        if (this.diagram) layouts.set(this.diagram.id, new Map([...this.nodes].map(([id,n])=>[id,{x:n.x,y:n.y}])));
      }
      loadDiagram(diagram) {
        this.cancelStory();
        this.saveView();
        this.saveLayout();
        this.diagram = diagram;
        this.hovered=null;
        this.manualView=false;
        this.selected = null;
        this.pan = null;
        this.widgets.forEach(widget => widget.destroy());
        this.widgets.clear();
        this.decorations.forEach(item=>item.destroy());
        this.decorations = [];
        this.nodes = new Map(diagram.nodes.map(n => [n.id, {...n, ...this.project(n.x,n.y), ...(layouts.get(diagram.id)?.get(n.id)||{})}]));
        heritageLayer.replaceChildren();
        this.heritageLabels=new Map();
        this.nodes.forEach(n=>{
          if(!n.heritage)return;
          const label=document.createElement("div");label.className="canvas-heritage__label";
          const person=document.createElement("strong");person.textContent=n.heritage.person;
          const perspective=document.createElement("span");perspective.textContent=n.heritage.perspective;
          label.append(person,perspective);heritageLayer.append(label);
          this.heritageLabels.set(n.id,label);
        });
        this.drawFrame();
        this.nodes.forEach(n => {
          const box = this.add.graphics();
          const label = this.drawIcon(n);
          const item = this.add.container(n.x,n.y,[box,label]).setSize(n.w,Math.max(n.h,140));
          item.name=n.id;
          item.setDepth(n.y+100);
          item.setInteractive({useHandCursor:true});
          this.input.setDraggable(item);
          item.on("pointerdown", () => this.selectObject(n.id));
          item.on("pointerover",()=>{this.hovered=n.id;this.drawEdges();});
          item.on("pointerout",()=>{this.hovered=null;this.drawEdges();});
          this.widgets.set(n.id,item);
        });
        this.drawEdges();
        this.createPlayer();
        const previousView=views.get(diagram.id);
        if(previousView)this.restoreView(previousView);
        else {this.fit();this.focusMobile(diagram.group?"agent":"worflogy");}
        callbacks.select(null);
        callbacks.story?.({phase:"idle",text:diagram.group?"플레이어가 에이전트를 만나 질의를 전달합니다.":"회사 철학과 핵심 기술의 관계를 살펴봅니다."});
      }

      update() {
        if(!this.heritageLabels?.size)return;
        const camera=this.cameras.main,z=camera.zoom;
        this.heritageLabels.forEach((label,id)=>{
          const n=this.nodes.get(id);
          const x=(n.x+66-camera.scrollX-camera.width/2)*z+camera.width/2;
          const y=(n.y-24-camera.scrollY-camera.height/2)*z+camera.height/2;
          // Render text at native CSS resolution; avoid scaling a rasterized text layer.
          label.style.transform="translate("+Math.round(x)+"px,"+Math.round(y)+"px)";
          label.style.width=Math.max(170,200*z)+"px";
          label.style.fontSize=Math.max(14,17*z)+"px";
          label.style.opacity=this.widgets.get(id)?.alpha??1;
        });
      }
      drawIcon(n) {return window.WorfArt.draw(this,n);}
      drawFrame() {
        this.frame.clear();this.frame.setDepth(-10);
        const surface=(x,y,w,h,color)=>{
          const corners=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>this.project(a,b));
          this.frame.fillStyle(color,1);this.frame.fillPoints(corners,true);
          this.frame.lineStyle(1,window.WorfTheme.border,.8);this.frame.strokePoints(corners,true);
          this.frame.lineStyle(1,window.WorfTheme.grid,.6);
          for(let a=x+100;a<x+w;a+=100){const p=this.project(a,y),q=this.project(a,y+h);this.frame.lineBetween(p.x,p.y,q.x,q.y);}
          for(let b=y+100;b<y+h;b+=100){const p=this.project(x,b),q=this.project(x+w,b);this.frame.lineBetween(p.x,p.y,q.x,q.y);}
        };
        const group=this.diagram.group;
        if(!group){surface(15,20,970,455,window.WorfTheme.plane);return;}
        surface(group.x,group.y,group.w,group.h,window.WorfTheme.plane);
        surface(15,535,1010,this.diagram.id==="creator"?185:100,window.WorfTheme.planeSecondary);
        surface(1020,125,270,230,window.WorfTheme.planeResult);
        this.frame.lineStyle(2,window.WorfTheme.border,1);
        [group.x,group.x+group.w].forEach((x,i)=>{
          const inward=i?-1:1,mid=group.y+group.h/2;
          const pts=[[x+inward*16,group.y],[x+inward*4,group.y+12],[x+inward*4,mid-18],[x-inward*8,mid],[x+inward*4,mid+18],[x+inward*4,group.y+group.h-12],[x+inward*16,group.y+group.h]].map(([a,b])=>this.project(a,b));
          this.frame.strokePoints(pts,false);
        });
      }
      related(id) {
        if(this.platformHighlights?.has(id))return true;
        if(!this.selected) return true;
        return id===this.selected || this.diagram.edges.some(e=>(e.from===this.selected&&e.to===id)||(e.to===this.selected&&e.from===id));
      }
      anchor(node,towards,offset=0) {
        const dx=towards.x-node.x,dy=towards.y-node.y;
        const factor=1/Math.max(Math.abs(dx)/(node.w/2+4),Math.abs(dy)/(node.h/2+4),0.001);
        const length=Math.max(1,Math.hypot(dx,dy));
        return {x:node.x+dx*factor-dy/length*offset,y:node.y+dy*factor+dx/length*offset};
      }
      drawEdges() {
        const graphic=this.edgesLayer;
        graphic.clear();
        this.widgets.forEach((widget,id)=>{
          const n=this.nodes.get(id), selected=id===this.selected;
          const box=widget.list[0];
          box.clear();
          window.WorfArt.tile(box,n,selected,this.hovered===id);
          widget.setAlpha(host.classList.contains("canvas-example-enabled")?1:(this.storyRunning&&!this.visited.has(id)&&id!=="agent"?0.32:(this.related(id)?1:0.52)));
        });
        if(["platform","problem","risk","research","narrative","npc","creator","bias"].includes(this.diagram.id)){window.drawPlatformConnections(this,graphic);return;}
        this.diagram.edges.forEach(e=>{
          if(e.kind==="context"){window.drawContextConnection(this,graphic,e);return;}
          const group=this.diagram.group;
          const from=e.from==="logic"?{...this.project(group.x+group.w+12,240),w:1,h:1}:this.nodes.get(e.from);
          const to=this.nodes.get(e.to);
          if(!from||!to) return;
          const active=!this.selected||e.from===this.selected||e.to===this.selected||(this.platformHighlights?.has(e.from)&&this.platformHighlights?.has(e.to));
          const alpha=this.storyRunning&&!(this.visited.has(e.from)&&this.visited.has(e.to))?0.07:(active?0.86:0.10);
          const color=this.selected&&active?window.WorfTheme.active:window.WorfTheme.link;
          const reciprocal=this.diagram.edges.some(other=>other.from===e.to&&other.to===e.from);
          const a=this.anchor(from,to,reciprocal?7:0),b=this.anchor(to,from,reciprocal?-7:0);
          const angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y);
          graphic.lineStyle(active&&this.selected?2:1.3,color,alpha);
          if(e.kind==="infrastructure"||e.kind==="learning"){
            for(let d=0;d<length;d+=13){
              const end=Math.min(d+6,length);
              graphic.lineBetween(a.x+Math.cos(angle)*d,a.y+Math.sin(angle)*d,a.x+Math.cos(angle)*end,a.y+Math.sin(angle)*end);
            }
          }else graphic.lineBetween(a.x,a.y,b.x,b.y);
          const arrow=(point,theta)=>{
            graphic.fillStyle(color,alpha);
            graphic.fillTriangle(point.x,point.y,point.x-10*Math.cos(theta-.4),point.y-10*Math.sin(theta-.4),point.x-10*Math.cos(theta+.4),point.y-10*Math.sin(theta+.4));
          };
          arrow(b,angle);
          if(e.both) arrow(a,angle+Math.PI);
        });
      }
      select(id) {
        this.selected=id;
        this.drawEdges();
        callbacks.select(id);
      }

      selectObject(id) {
        if(mobileInput.matches)return;
        if(this.storyRunning){
          // Freeze this scene in place; retain drawn story layers until replay/reset.
          this.storyTimer?.remove();this.storyTimer=null;
          this.tweens.killAll();
          this.meetingTween=null;this.meetingTarget=null;
          this.storyRunning=false;this.platformHighlights=null;
          callbacks.story?.({phase:"paused",step:this.stageIndex+1,total:this.stages.length-1});
        }
        this.select(id);
      }
      cancelStory() {
        this.meetingTween?.stop();this.meetingTween=null;this.meetingTarget=null;
        this.platformStory?.destroy();this.platformStory=null;
        this.overview?.destroy();this.overview=null;
        this.storyTimer?.remove();
        this.storyTimer=null;
        this.tweens?.killAll();
        this.storyRunning=false;
        this.widgets?.forEach(widget=>widget.list[1].setVisible(true).setAlpha(1).setScale(1).setAngle(0));
        this.particles?.forEach(p=>p.destroy());this.particles=[];
        this.player?.destroy();this.player=null;
        this.outputDrawing?.destroy();this.outputDrawing=null;
      }
      meetingPosition() {
 const agent=this.nodes.get("agent");
 const candidates=[10,-65,-110,75].map(dy=>({x:agent.x-100,y:agent.y+dy}));
 return candidates.find(p=>[...this.nodes.values()].every(n=>n.id==="agent"||
   Math.abs(p.x-n.x)>n.w/2+18||Math.abs(p.y-n.y)>n.h/2+24))||candidates[1];
}
startMeeting() {
 this.finishMeeting();
 const origin=this.project(85,475);this.player.setPosition(origin.x,origin.y);
 this.meetingTarget=this.meetingPosition();
 this.meetingTween=this.tweens.add({targets:this.player,...this.meetingTarget,duration:1200,
   onComplete:()=>{this.meetingTween=null;}});
}
finishMeeting() {
 if(!this.meetingTween)return;
 this.meetingTween.stop();this.meetingTween=null;
 if(this.player&&this.meetingTarget)this.player.setPosition(this.meetingTarget.x,this.meetingTarget.y);
}

createPlayer() {
        if(!this.diagram.group)return;
        const sprite=window.WorfArt.player(this);
        const position=this.project(85,475);
        this.player=this.add.container(position.x,position.y,[sprite]).setDepth(2000);
      }
      playStory() {
        if(["platform","problem","risk","research","narrative","npc","creator","bias"].includes(this.diagram.id)){this.playPlatform();return;}
        if(!this.diagram.group){this.playOverview();return;}
        const diagram=this.diagram;
        this.cancelStory();
        this.selected=null;
        this.createPlayer();
        this.storyRunning=true;
        this.visited=new Set(["agent"]);
        this.stages=[
          {type:"meet"},
          {type:"talk"},
          {type:"context",id:"agent"},
          ...diagram.nodes.filter(n=>n.type==="engine").map(n=>({type:"infra",id:n.id})),
          ...diagram.nodes.filter(n=>n.type==="step").map(n=>({type:"logic",id:n.id})),
          {type:"graph",id:"knowledge"},
          {type:"context",id:"agent",refresh:true},
          {type:"finish"}
        ];
        this.stageIndex=-1;
        this.nextStage();
      }
      playPlatform() {
        this.cancelStory();
        this.selected=null;this.createPlayer();
        this.storyRunning=true;this.visited=new Set(["agent"]);
        this.platformStory=this.diagram.id==="bias"?window.createBiasStory(this):this.diagram.id==="creator"?window.createCreatorStory(this):this.diagram.id==="npc"?window.createNpcStory(this):this.diagram.id==="narrative"?window.createNarrativeStory(this):this.diagram.id==="research"?window.createResearchStory(this):this.diagram.id==="risk"?window.createRiskStory(this):this.diagram.id==="problem"?window.createProblemStory(this):window.createPlatformStory(this);
        this.stages=[...this.platformStory.stages,{type:"context",id:"agent",refresh:true},{type:"finish"}];
        this.stages.splice(2,0,{type:"context",id:"agent"});
        this.stageIndex=-1;this.nextStage();
      }
      playOverview() {
        this.cancelStory();
        this.selected=null;
        this.storyRunning=true;
        this.visited=new Set();
        this.overview=window.createOverviewStory(this);
        this.stages=this.overview.stages;
        this.stages.push({type:"finish"});
        this.stageIndex=-1;
        this.nextStage();
      }
      emitFlow(id) {
        this.diagram.edges.filter(e=>e.from===id||e.to===id).forEach(e=>{
          const a=this.nodes.get(e.from),b=this.nodes.get(e.to);
          if(!a||!b)return;
          if(e.kind==="context"){window.emitContextFlow(this);return;}
          const dot=this.add.circle(a.x,a.y,4,window.WorfTheme.active,1).setDepth(1900);
          this.particles.push(dot);
          this.tweens.add({targets:dot,x:b.x,y:b.y,duration:650,onComplete:()=>dot.destroy()});
        });
      }
      nextStage() {
        if(!this.storyRunning)return;
        this.storyTimer?.remove();this.storyTimer=null;
        this.finishMeeting();
        this.overview?.finishStep();
        this.platformStory?.finishStep();
        const stage=this.stages[++this.stageIndex];
        if(!stage)return;
        const clean=value=>value.replace(/\n/g," ");
        const agent=this.nodes.get("agent");
        let text="",speaker="",duration=1100;
        if(stage.type==="context"){
          this.visited.add("knowledge");this.visited.add("agent");
          this.platformHighlights=new Set(["knowledge","agent"]);this.select("agent");
          window.emitContextFlow(this);
          speaker=stage.refresh?"갱신된 맥락":"지식 그래프의 맥락";
          text=stage.refresh?"새롭게 쌓인 경험을 에이전트에 전달해 다음 대화와 안내에 활용합니다.":"지식 그래프가 관련 지식과 상황의 맥락을 에이전트에 전달해 대화와 판단을 돕습니다.";
          duration=4000;
        }else if(stage.type==="platform"){
          const detail=this.platformStory.step(stage.key);
          text=detail.text;speaker=detail.speaker;duration=detail.duration;stage.id=detail.focus;
        }else if(stage.type==="overview"){
          const detail=this.overview.step(stage.key);
          text=detail.text;duration=detail.duration;stage.id=detail.focus;
        }else if(stage.type==="meet"){
          this.startMeeting();
          
          text="플레이어가 에이전트에게 다가갑니다.";duration=1400;
          this.select("agent");
        }else if(stage.type==="talk"){
          this.tweens.killTweensOf(this.player);
          this.finishMeeting();
          this.diagram.nodes.filter(n=>n.type==="query").forEach(n=>this.visited.add(n.id));
          speaker="플레이어";
          const queries={platform:"프로젝트에 맞는 인력 배치와 업무 가이드를 알려줘.",problem:"이 문제를 해결할 전략을 찾고 싶어.",risk:"프로젝트의 리스크를 진단하고 싶어.",research:"연구 주제로 실험을 설계하고 싶어.",narrative:"자료를 바탕으로 게임 세계관과 NPC를 만들고 싶어.",npc:"게임 캐릭터의 의사 결정 성향을 분석하고 싶어.",creator:"혼자 개발하는 게임의 목표와 성장 지표를 정하고 싶어."};
          text=queries[this.diagram.id];duration=2400;this.emitFlow("agent");
        }else if(stage.type==="infra"){
          const n=this.nodes.get(stage.id);this.visited.add(n.id);this.select(n.id);this.emitFlow(n.id);
          speaker="에이전트";text=clean(n.label)+"을 활용합니다.";duration=1400;
        }else if(stage.type==="logic"){
          const n=this.nodes.get(stage.id);this.visited.add(n.id);this.select(n.id);this.emitFlow(n.id);
          speaker="에이전트";text=clean(n.label);duration=1300;
        }else if(stage.type==="graph"){
          this.visited.add("logic");this.visited.add("knowledge");this.select("knowledge");
          this.tweens.addCounter({from:0,to:1,duration:1300,onUpdate:tween=>this.drawKnowledgeGraph(tween.getValue())});
          speaker="에이전트";text="온톨로지 지식 그래프가 생성됩니다.";duration=1800;
        }else{
          this.storyRunning=false;this.platformHighlights=null;this.select(null);
          callbacks.story?.({phase:"complete",text:"시연 완료",technology:this.diagram.technology});
          return;
        }
        this.drawEdges();
        this.focusMobile(stage.id||"agent",stage.type==="meet");
        callbacks.story?.({phase:stage.type,text,speaker,step:this.stageIndex+1,total:this.stages.length-1});
        this.storyTimer=this.time.delayedCall(duration,()=>this.nextStage());
      }
      drawKnowledgeGraph(progress=1) {
        const n=this.nodes.get("knowledge"),widget=this.widgets.get("knowledge");
        widget.list[1].setVisible(false);
        if(!this.outputDrawing)this.outputDrawing=this.add.graphics().setDepth(1800);
        this.outputDrawing.clear();
        // The generated visual is a demonstration, derived from this diagram's logic nodes.
        const count=this.diagram.nodes.filter(n=>n.type==="step").length;
        const points=Array.from({length:count},(_,i)=>({x:n.x+Math.cos(i/count*Math.PI*2)*70,y:n.y+13+Math.sin(i/count*Math.PI*2)*25}));
        this.outputDrawing.lineStyle(1.5,window.WorfTheme.active,.65);
        points.forEach((p,i)=>{if(i/count>progress)return;const other=points[(i+1)%count];const t=Math.min(1,(progress-i/count)*count);this.outputDrawing.lineBetween(p.x,p.y,p.x+(other.x-p.x)*t,p.y+(other.y-p.y)*t);if(i%2===0)this.outputDrawing.lineBetween(p.x,p.y,n.x,n.y+13);});
        this.outputDrawing.fillStyle(window.WorfTheme.active,1);
        points.forEach((p,i)=>{if(i/count<=progress)this.outputDrawing.fillCircle(p.x,p.y,5);});
        this.outputDrawing.fillCircle(n.x,n.y+13,5);
      }

      focusMobile(id,meeting=false) {
        if(this.scale.width>=600||this.manualView)return;
        const node=this.nodes?.get(id);if(!node)return;
        const camera=this.cameras.main;
        let x=node.x,y=node.y,zoom=.72*(this.diagram.id==="overview"?1.44:1);
        if(node.heritage){x+=108;zoom=Math.min(zoom,camera.width/350);}
        if(meeting&&this.player){x=(x+this.player.x)/2;y=(y+this.player.y)/2;zoom=Math.min(.72,camera.width/(Math.abs(node.x-this.player.x)+190));}
        camera.setZoom(zoom);camera.centerOn(x,y);
        callbacks.zoom(zoom);
        this.saveView();
      }
      fitBounds(diagram,nodes) {
        const original=diagram.bounds;
        const corners=[[original.x,original.y],[original.x+original.w,original.y],[original.x+original.w,original.y+original.h],[original.x,original.y+original.h]].map(([x,y])=>this.project(x,y));
        let minX=Math.min(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxX=Math.max(...corners.map(p=>p.x)),maxY=Math.max(...corners.map(p=>p.y));
        nodes.forEach(n=>{minX=Math.min(minX,n.x-n.w/2-25);maxX=Math.max(maxX,n.x+n.w/2+25);minY=Math.min(minY,n.y-n.h/2-25);maxY=Math.max(maxY,n.y+n.h/2+25);});
        if(diagram.group){
          const view=Object.create(this);view.diagram=diagram;view.nodes=nodes;
          diagram.edges.forEach(e=>window.platformEdgePath(view,e).forEach(p=>{minX=Math.min(minX,p.x-15);maxX=Math.max(maxX,p.x+15);minY=Math.min(minY,p.y-15);maxY=Math.max(maxY,p.y+15);}));
        }
        return {minX,minY,maxX,maxY};
      }
      fit() {
        if(!this.diagram)return;
        const camera=this.cameras.main,subtitleSpace=110;
        const bounds=this.fitBounds(this.diagram,this.nodes);
        // Every initial view uses a scale that fits the largest default diagram.
        // A manually moved node can still require a smaller explicit fit.
        const zoomFor=b=>Math.min(camera.width/(b.maxX-b.minX+35),(camera.height-subtitleSpace)/(b.maxY-b.minY+35),1.3);
        const commonZoom=Math.min(...window.WORFLOGY_DIAGRAMS.filter(diagram=>!diagram.placeholder&&!diagram.renderer&&!diagram.video).map(diagram=>{
          const nodes=new Map(diagram.nodes.map(n=>[n.id,{...n,...this.project(n.x,n.y)}]));
          return zoomFor(this.fitBounds(diagram,nodes));
        }));
        const baseZoom=Math.min(zoomFor(bounds),commonZoom);
        // Overview starts at the equivalent of two + clicks (1.2 squared).
        const initialZoom=baseZoom*(this.diagram.id==="overview"?1.44:1);
        camera.setZoom(initialZoom*(!mobileInput.matches&&this.diagram.id!=="overview"?1.2:1));
        // Keep the enlarged overview below the toolbar with balanced caption clearance.
        // Taller lower connection paths need a little more clearance above captions.
        const captionClearance=!mobileInput.matches?({creator:16,bias:8}[this.diagram.id]||0):0;
        const centerOffset=(this.diagram.id==="overview"?40:subtitleSpace/2)+captionClearance;
        camera.centerOn((bounds.minX+bounds.maxX)/2,(bounds.minY+bounds.maxY)/2+centerOffset/camera.zoom);
        callbacks.zoom(camera.zoom);this.saveView();
      }
      zoomBy(factor,x,y) {
        this.manualView=true;
        const c=this.cameras.main;
        x=x??c.width/2;y=y??c.height/2;
        const before=c.getWorldPoint(x,y);
        c.setZoom(Phaser.Math.Clamp(c.zoom*factor,0.18,2.5));
        // Force updated camera matrices before converting the same screen point.
        c.preRender();
        const after=c.getWorldPoint(x,y);
        c.scrollX+=before.x-after.x;c.scrollY+=before.y-after.y;
        callbacks.zoom(c.zoom);
        this.saveView();
      }
    }
    const game=new Phaser.Game({
      type:Phaser.CANVAS,parent:host,backgroundColor:getComputedStyle(host).getPropertyValue("--scene-background").trim(),banner:false,
      audio:{noAudio:true},render:{antialias:true},
      input:{mouse:{preventDefaultWheel:false,passive:false},touch:{capture:false}},
      scale:{mode:Phaser.Scale.RESIZE,width:host.clientWidth,height:host.clientHeight},
      fps:{target:30},scene:DiagramScene
    });
    return {
      load(diagram){pending=diagram;if(activeScene)activeScene.loadDiagram(diagram);},
      select(id){if(activeScene)activeScene.selectObject(id);},
      play(){if(activeScene)activeScene.playStory();},
      next(){if(activeScene)activeScene.nextStage();},
      zoom(factor){if(activeScene)activeScene.zoomBy(factor);},
      fit(){if(activeScene){activeScene.manualView=true;activeScene.fit();}},
      reset(){if(activeScene?.diagram){const diagram=activeScene.diagram;activeScene.cancelStory();activeScene.diagram=null;layouts.delete(diagram.id);views.delete(diagram.id);activeScene.loadDiagram(diagram);}},
      setVisible(value){
        visible=value;
        if(!activeScene)return;
        if(visible){activeScene.scene.resume();game.loop.wake();}
        else {activeScene.scene.pause();game.loop.sleep();}
      },
      destroy(){mobileInput.removeEventListener("change",syncInput);heritageLayer.remove();game.destroy(true);}
    };
  };
})();
