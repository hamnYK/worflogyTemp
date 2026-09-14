/* Interactive diagram renderer. Content lives in diagrams.js; no backend calls. */
(function () {
  "use strict";
  window.createDiagramExplorer = function (host, callbacks) {
    if (!window.Phaser) return null;
    let activeScene;
    let pending;
    let visible=true;
    const layouts = new Map();
    const views = new Map();
    class DiagramScene extends Phaser.Scene {
      create() {
        activeScene = this;
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
        this.input.on("wheel", (pointer, over, dx, dy) => this.zoomBy(dy > 0 ? 0.9 : 1.1, pointer.x, pointer.y));
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
        this.manualView=false;
        this.selected = null;
        this.pan = null;
        this.widgets.forEach(widget => widget.destroy());
        this.widgets.clear();
        this.decorations.forEach(item=>item.destroy());
        this.decorations = [];
        this.nodes = new Map(diagram.nodes.map(n => [n.id, {...n, ...this.project(n.x,n.y), ...(layouts.get(diagram.id)?.get(n.id)||{})}]));
        this.drawFrame();
        this.nodes.forEach(n => {
          const box = this.add.graphics();
          const label = this.drawIcon(n);
          const item = this.add.container(n.x,n.y,[box,label]).setSize(n.w,n.h);
          item.name=n.id;
          item.setDepth(n.y+100);
          item.setInteractive({useHandCursor:true});
          this.input.setDraggable(item);
          item.on("pointerdown", () => this.select(n.id));
          this.widgets.set(n.id,item);
        });
        this.drawEdges();
        this.createPlayer();
        const previousView=views.get(diagram.id);
        if(previousView)this.restoreView(previousView);
        else {this.fit();this.focusMobile(diagram.group?"agent":"worflogy");}
        callbacks.select(null);
        callbacks.story?.({phase:"idle",text:diagram.group?"플레이어가 AI 에이전트를 만나 질의를 전달합니다.":"회사 철학과 핵심 기술의 관계를 살펴봅니다."});
      }

      drawIcon(n) {
        if(this.diagram.id==="creator")return window.drawCreatorObject(this,n);
          if(this.diagram.id==="npc")return window.drawNpcObject(this,n);
          if(this.diagram.id==="narrative")return window.drawNarrativeObject(this,n);
          if(this.diagram.id==="research")return window.drawResearchObject(this,n);
          if(this.diagram.id==="risk")return window.drawRiskObject(this,n);
          if(this.diagram.id==="problem")return window.drawProblemObject(this,n);
          if(this.diagram.id==="platform")return window.drawPlatformObject(this,n);
        const g=this.add.graphics();
        const ink=0x365646,blue=0x668eab,gold=0xc99748;
        const stroke=(color=ink,width=3)=>g.lineStyle(width,color,1);
        const line=(x1,y1,x2,y2)=>g.lineBetween(x1,y1,x2,y2);
        const circle=(x,y,r,color=ink)=>{g.fillStyle(color,1);g.fillCircle(x,y,r);};
        const outline=(x,y,w,h,color=ink)=>{stroke(color);g.strokeRoundedRect(x,y,w,h,4);};
        const check=(x,y)=>{stroke();line(x-8,y,x-2,y+7);line(x-2,y+7,x+12,y-9);};
        const person=(x,y,s=1)=>{circle(x,y-10*s,7*s);g.fillStyle(ink,1);g.fillRoundedRect(x-10*s,y,20*s,17*s,6);};
        const network=()=>{const pts=[[-27,-18],[24,-23],[-5,8],[30,25],[-29,27]];stroke(blue,2);[[0,1],[0,2],[1,2],[1,3],[2,3],[2,4],[3,4]].forEach(([a,b])=>line(...pts[a],...pts[b]));pts.forEach(([x,y],i)=>circle(x,y,6,i===2?gold:ink));};
        const document=()=>{outline(-24,-32,46,60);stroke();line(-14,-18,9,-18);line(-14,-7,12,-7);line(-14,4,1,4);};
        const bulb=()=>{stroke(gold,3);g.strokeCircle(0,-9,20);line(-9,10,-9,23);line(9,10,9,23);line(-9,23,9,23);line(-6,31,6,31);[[-30,-28,-37,-34],[0,-38,0,-45],[30,-28,37,-34]].forEach(p=>line(...p));};
        const server=()=>{
          g.fillStyle(0x668eab,1);g.fillPoints([{x:-28,y:-22},{x:0,y:-8},{x:0,y:29},{x:-28,y:15}],true);
          g.fillStyle(0x8aa9bc,1);g.fillPoints([{x:0,y:-8},{x:28,y:-22},{x:28,y:15},{x:0,y:29}],true);
          g.fillStyle(0xd7e4e9,1);g.fillPoints([{x:-28,y:-22},{x:0,y:-36},{x:28,y:-22},{x:0,y:-8}],true);
          stroke(0xd6e5e8,2);[0,10,20].forEach(y=>{line(-23,y-14,-6,y-5);line(6,y-5,22,y-13);circle(8,y-6,1.5,gold);});
        };
        const book=()=>{stroke();g.strokePoints([{x:0,y:-23},{x:-29,y:-31},{x:-29,y:25},{x:0,y:33},{x:29,y:25},{x:29,y:-31},{x:0,y:-23}],false);line(0,-23,0,33);};
        const magnify=()=>{stroke(blue,4);g.strokeCircle(-5,-8,22);line(11,9,31,30);};
        if(n.type==="agent"){
          stroke();line(0,-28,0,-40);circle(0,-43,4,gold);g.fillStyle(0xb7d0be,1);g.fillRoundedRect(-29,-26,58,46,12);outline(-29,-26,58,46);circle(-12,-7,4);circle(12,-7,4);line(-9,9,9,9);outline(-18,25,36,13);line(-34,-12,-39,5);line(34,-12,39,5);
        }else if(n.type==="knowledge"){stroke(blue,2);g.strokeEllipse(0,29,88,27);g.strokeEllipse(0,35,88,27);stroke(blue,1);[-32,0,32].forEach(x=>line(x,18,x,-21));circle(0,-29,5,gold);}
        else if(n.type==="query"){outline(-32,-28,64,44);stroke();line(-18,16,-25,31);line(-25,31,0,16);[-16,0,16].forEach(x=>circle(x,-6,3));}
        else if(n.type==="engine"){
          if(n.id==="rag")network();
          else if(n.id==="api"){stroke(blue);g.strokeCircle(0,0,22);line(-42,0,-22,0);line(22,0,42,0);circle(-42,0,5,gold);circle(42,0,5,gold);line(0,-22,0,-38);circle(0,-38,5);g.strokeEllipse(0,0,18,44);}
          else if(n.id==="content"){book();circle(21,-23,8,gold);}
          else if(n.id==="simulation"){stroke(blue);g.strokeEllipse(0,0,77,34);g.strokeEllipse(0,0,34,77);circle(0,0,8,gold);circle(34,-8,5);}
          else if(n.id==="policy"){document();check(10,22);}
          else server();
        }else if(n.id==="profile"){outline(-33,-29,66,58);person(-13,-3,.7);stroke();line(6,-12,23,-12);line(6,0,23,0);line(6,12,19,12);}
        else if(n.id==="events"){outline(-31,-28,62,48);g.fillStyle(gold,1);g.fillTriangle(4,-23,-12,2,2,2);g.fillTriangle(-2,-2,13,-2,-5,19);}
        else if(n.id==="position"){person(0,-9);person(-25,12,.7);person(25,12,.7);circle(25,-27,10,gold);}
        else if(n.id==="guide"){document();stroke(blue);g.strokeCircle(24,20,16);g.fillStyle(blue,1);g.fillTriangle(22,9,16,28,30,23);}
        else if(n.id==="growth"){stroke();line(-31,-28,-31,31);line(-31,31,34,31);stroke(blue,4);line(-23,19,-5,0);line(-5,0,9,8);line(9,8,31,-25);line(18,-24,31,-25);line(31,-25,33,-11);}
        else if(n.id==="report"){document();check(12,20);}
        else if(n.id==="alternative"){
          if(this.diagram.id==="narrative"){stroke(gold,9);line(-19,24,20,-20);stroke(ink,2);line(-24,32,-19,18);}
          else if(this.diagram.id==="npc"){stroke(blue);g.strokeEllipse(0,0,75,35);g.strokeEllipse(0,0,35,75);circle(0,0,8,gold);}
          else if(this.diagram.id==="creator"){person(-19,0);person(20,0);stroke(blue);line(-5,-20,6,-20);}
          else{bulb();g.fillStyle(0xd5e2e8,1);g.fillRoundedRect(-33,24,66,13,3);}
        }else if(n.id==="chosen"){outline(-27,-27,54,54);check(0,0);if(["narrative","npc","creator"].includes(this.diagram.id)){stroke(blue,2);[-35,35].forEach(x=>{line(x,-17,x,17);line(x,0,x>0?43:-43,0);});}}
        else if(n.id==="review"){magnify();if(this.diagram.id==="creator"||this.diagram.id==="research"){stroke(gold,3);line(-16,3,-16,-8);line(-5,3,-5,-18);line(6,3,6,-12);}else{circle(-5,-11,6);stroke();line(-17,6,7,6);}}
        else if(n.id==="feedback"){stroke(blue,3);g.beginPath();g.arc(0,0,28,.3,Math.PI*1.8);g.strokePath();g.fillStyle(blue,1);g.fillTriangle(27,-23,38,-13,21,-9);check(-2,2);}
        else if(n.id==="core"){
          if(this.diagram.id==="research"){stroke(blue,5);line(-17,29,28,29);line(4,26,4,7);line(-9,-24,17,2);g.strokeCircle(5,0,19);g.fillStyle(gold,1);g.fillRoundedRect(-22,-31,17,27,4);}
          else if(this.diagram.id==="narrative"){book();circle(0,-14,13,blue);stroke();g.strokeEllipse(0,-14,40,10);}
          else if(this.diagram.id==="npc"){person(0,-6,1.4);stroke(blue);g.strokeCircle(0,-22,20);}
          else if(this.diagram.id==="creator"){stroke();g.strokeRoundedRect(-34,-21,68,45,13);line(-22,0,-8,0);line(-15,-7,-15,7);circle(17,-4,4,gold);circle(25,6,4,blue);}
          else if(this.diagram.id==="risk"){g.fillStyle(0xe8d5ad,1);g.fillTriangle(0,-36,-35,26,35,26);stroke(gold,4);line(0,-16,0,6);circle(0,16,3,gold);}
          else bulb();
        }else if(n.id==="linked"){
          const pts=[[0,-35],[-25,-5],[25,-5],[-35,30],[0,30],[35,30]];
          stroke(blue,3);[[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,4],[4,5]].forEach(([a,b])=>line(...pts[a],...pts[b]));pts.forEach(([x,y])=>circle(x,y,6,blue));
        }else if(n.id==="worflogy"){
          network();stroke(gold,2);line(24,-23,37,-37);circle(37,-37,5,gold);line(-29,27,-41,36);circle(-41,36,4,gold);
        }else if(n.id==="ontology"){network();stroke(blue,1);g.strokeCircle(0,0,42);}
        else if(n.id==="holistic"){
          // A wide observation lens gathers different phenomena into one field.
          stroke(blue,2);g.strokeEllipse(0,-3,91,67);
          outline(-32,-17,15,22,blue);line(-28,-12,-21,-12);line(-28,-6,-21,-6);
          person(21,-10,.7);circle(0,19,7,gold);
          stroke(ink,2);line(-4,18,0,10);line(0,10,6,15);
          stroke(blue,4);g.strokeCircle(0,-4,42);line(31,27,45,41);
          stroke(gold,1);g.strokeEllipse(0,-4,72,38);
        }
        else if(n.id==="dynamics"){
          // Coupled mechanisms inside a feedback loop.
          [-18,18].forEach((x,j)=>{const y=j?10:-10;stroke(j?ink:blue,3);g.strokeCircle(x,y,16);g.strokeCircle(x,y,5);
            for(let i=0;i<8;i++){const a=i*Math.PI/4;line(x+Math.cos(a)*16,y+Math.sin(a)*16,x+Math.cos(a)*22,y+Math.sin(a)*22);}});
          stroke(gold,2);g.beginPath();g.arc(0,0,43,.25,2.8);g.strokePath();g.beginPath();g.arc(0,0,43,3.4,5.9);g.strokePath();
          g.fillStyle(gold,1);g.fillTriangle(-42,9,-30,15,-40,23);g.fillTriangle(42,-9,30,-15,40,-23);
        }
        else if(n.id==="signal"){
          // A receiver detects a small, distant signal.
          stroke(blue,3);line(-7,31,7,31);line(0,31,0,0);
          g.beginPath();g.arc(0,-7,22,.15,Math.PI-.15);g.strokePath();
          line(0,0,16,-15);circle(18,-18,4,gold);
          [16,28,41].forEach((r,i)=>{g.lineStyle(2,gold,.85-i*.22);g.beginPath();g.arc(18,-18,r,3.4,4.65);g.strokePath();});
          circle(-30,-38,2,gold);
        }
        else if(n.id==="semantics"){
          // Discrete relation units, rather than a generic chain-link symbol.
          [[-23,-20,blue],[21,-7,ink],[-9,23,gold]].forEach(([x,y,c])=>{stroke(c,2);line(x-8,y,x+8,y-7);circle(x-8,y,5,c);circle(x+8,y-7,5,c);});
        }
        else document();
        return g;
      }

      drawFrame() {
        this.frame.clear();this.frame.setDepth(-10);
        const surface=(x,y,w,h,color)=>{
          const corners=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>this.project(a,b));
          this.frame.fillStyle(color,1);this.frame.fillPoints(corners,true);
          this.frame.lineStyle(1,0xd9e1d6,.8);this.frame.strokePoints(corners,true);
          this.frame.lineStyle(1,0xe1e7dd,.6);
          for(let a=x+100;a<x+w;a+=100){const p=this.project(a,y),q=this.project(a,y+h);this.frame.lineBetween(p.x,p.y,q.x,q.y);}
          for(let b=y+100;b<y+h;b+=100){const p=this.project(x,b),q=this.project(x+w,b);this.frame.lineBetween(p.x,p.y,q.x,q.y);}
        };
        const group=this.diagram.group;
        if(!group){surface(15,20,970,455,0xf0f3ec);return;}
        surface(group.x,group.y,group.w,group.h,0xecf1e7);
        surface(15,535,1010,this.diagram.id==="creator"?185:100,0xe8eff0);
        surface(1020,125,270,230,0xf2eee1);
        this.frame.lineStyle(2,0xa1ae9d,1);
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
          const fill=n.type==="engine"?0xebefe9:n.type==="agent"?0xe0ebe2:n.type==="knowledge"?0xf0f3e9:0xffffff;
          box.fillStyle(fill,1);
          box.lineStyle(selected?2.5:1.2,selected?0x315d46:0x9aa69b,1);
          box.fillStyle(0x253829,.10);box.fillEllipse(5,31,n.w+12,40);
          box.fillStyle(selected?0x789984:0xc4d0c1,1);
          box.fillPoints([{x:-n.w/2,y:13},{x:0,y:39},{x:n.w/2,y:13},{x:n.w/2,y:24},{x:0,y:50},{x:-n.w/2,y:24}],true);
          box.fillStyle(selected?0xd2e6d3:fill,1);
          const top=[{x:-n.w/2,y:13},{x:0,y:-13},{x:n.w/2,y:13},{x:0,y:39}];
          box.fillPoints(top,true);box.lineStyle(selected?2:1,selected?0x315d46:0xafbdae,1);box.strokePoints(top,true);
          widget.setAlpha(this.storyRunning&&!this.visited.has(id)&&id!=="agent"?0.12:(this.related(id)?1:0.28));
        });
        if(["platform","problem","risk","research","narrative","npc","creator"].includes(this.diagram.id)){window.drawPlatformConnections(this,graphic);return;}
        this.diagram.edges.forEach(e=>{
          if(e.kind==="context"){window.drawContextConnection(this,graphic,e);return;}
          const group=this.diagram.group;
          const from=e.from==="logic"?{...this.project(group.x+group.w+12,240),w:1,h:1}:this.nodes.get(e.from);
          const to=this.nodes.get(e.to);
          if(!from||!to) return;
          const active=!this.selected||e.from===this.selected||e.to===this.selected||(this.platformHighlights?.has(e.from)&&this.platformHighlights?.has(e.to));
          const alpha=this.storyRunning&&!(this.visited.has(e.from)&&this.visited.has(e.to))?0.07:(active?0.86:0.10);
          const color=this.selected&&active?0x315d46:0x849187;
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
        const sprite=this.add.graphics();
        sprite.fillStyle(0x315d46,1);sprite.fillRoundedRect(-11,-5,22,24,5);
        sprite.fillStyle(0xe2c5a5,1);sprite.fillCircle(0,-17,10);
        sprite.lineStyle(4,0x35403a,1);sprite.lineBetween(-6,18,-7,32);sprite.lineBetween(6,18,7,32);
        const position=this.project(85,475);
        this.player=this.add.container(position.x,position.y,[sprite]).setDepth(2000);
      }
      playStory() {
        if(["platform","problem","risk","research","narrative","npc","creator"].includes(this.diagram.id)){this.playPlatform();return;}
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
        this.platformStory=this.diagram.id==="creator"?window.createCreatorStory(this):this.diagram.id==="npc"?window.createNpcStory(this):this.diagram.id==="narrative"?window.createNarrativeStory(this):this.diagram.id==="research"?window.createResearchStory(this):this.diagram.id==="risk"?window.createRiskStory(this):this.diagram.id==="problem"?window.createProblemStory(this):window.createPlatformStory(this);
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
          const dot=this.add.circle(a.x,a.y,4,0x315d46,1).setDepth(1900);
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
          speaker=stage.refresh?"UPDATED CONTEXT":"KNOWLEDGE GRAPH CONTEXT";
          text=stage.refresh?"The expanded knowledge graph supplies updated context for the agent's next interaction.":"The knowledge graph provides relevant context to the AI agent for understanding the user's situation.";
          duration=2800;
        }else if(stage.type==="platform"){
          const detail=this.platformStory.step(stage.key);
          text=detail.text;speaker=detail.speaker;duration=detail.duration;stage.id=detail.focus;
        }else if(stage.type==="overview"){
          const detail=this.overview.step(stage.key);
          text=detail.text;duration=detail.duration;stage.id=detail.focus;
        }else if(stage.type==="meet"){
          this.startMeeting();
          
          text="플레이어가 AI 에이전트에게 다가갑니다.";duration=1400;
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
          speaker="AI 에이전트";text=clean(n.label)+"을 활용합니다.";duration=1400;
        }else if(stage.type==="logic"){
          const n=this.nodes.get(stage.id);this.visited.add(n.id);this.select(n.id);this.emitFlow(n.id);
          speaker="AI 에이전트";text=clean(n.label);duration=1300;
        }else if(stage.type==="graph"){
          this.visited.add("logic");this.visited.add("knowledge");this.select("knowledge");
          this.tweens.addCounter({from:0,to:1,duration:1300,onUpdate:tween=>this.drawKnowledgeGraph(tween.getValue())});
          speaker="AI 에이전트";text="온톨로지 지식 그래프가 생성됩니다.";duration=1800;
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
        this.outputDrawing.lineStyle(1.5,0x315d46,.65);
        points.forEach((p,i)=>{if(i/count>progress)return;const other=points[(i+1)%count];const t=Math.min(1,(progress-i/count)*count);this.outputDrawing.lineBetween(p.x,p.y,p.x+(other.x-p.x)*t,p.y+(other.y-p.y)*t);if(i%2===0)this.outputDrawing.lineBetween(p.x,p.y,n.x,n.y+13);});
        this.outputDrawing.fillStyle(0x315d46,1);
        points.forEach((p,i)=>{if(i/count<=progress)this.outputDrawing.fillCircle(p.x,p.y,5);});
        this.outputDrawing.fillCircle(n.x,n.y+13,5);
      }

      focusMobile(id,meeting=false) {
        if(this.scale.width>=600||this.manualView)return;
        const node=this.nodes?.get(id);if(!node)return;
        const camera=this.cameras.main;
        let x=node.x,y=node.y,zoom=.72;
        if(meeting&&this.player){x=(x+this.player.x)/2;y=(y+this.player.y)/2;zoom=Math.min(.72,camera.width/(Math.abs(node.x-this.player.x)+190));}
        camera.setZoom(zoom);camera.centerOn(x,y);
        callbacks.zoom(zoom);
        this.saveView();
      }
      fit() {
        if(!this.diagram) return;
        const camera=this.cameras.main,original=this.diagram.bounds;
        const corners=[[original.x,original.y],[original.x+original.w,original.y],[original.x+original.w,original.y+original.h],[original.x,original.y+original.h]].map(([x,y])=>this.project(x,y));
        const b={x:Math.min(...corners.map(p=>p.x)),y:Math.min(...corners.map(p=>p.y)),w:Math.max(...corners.map(p=>p.x))-Math.min(...corners.map(p=>p.x)),h:Math.max(...corners.map(p=>p.y))-Math.min(...corners.map(p=>p.y))};
        // Include moved nodes so "fit" remains useful after editing a layout.
        let minX=b.x,minY=b.y,maxX=b.x+b.w,maxY=b.y+b.h;
        this.nodes.forEach(n=>{minX=Math.min(minX,n.x-n.w/2-25);maxX=Math.max(maxX,n.x+n.w/2+25);minY=Math.min(minY,n.y-n.h/2-25);maxY=Math.max(maxY,n.y+n.h/2+25);});
        const subtitleSpace=this.diagram.group?110:0;
          if(this.diagram.group)this.diagram.edges.forEach(e=>window.platformEdgePath(this,e).forEach(p=>{
            minX=Math.min(minX,p.x-15);maxX=Math.max(maxX,p.x+15);
            minY=Math.min(minY,p.y-15);maxY=Math.max(maxY,p.y+15);
          }));
          camera.setZoom(Math.min(camera.width/(maxX-minX+35),(camera.height-subtitleSpace)/(maxY-minY+35),1.3));
        camera.centerOn((minX+maxX)/2,(minY+maxY)/2+subtitleSpace/(2*camera.zoom));
        callbacks.zoom(camera.zoom);
        this.saveView();
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
      type:Phaser.CANVAS,parent:host,backgroundColor:"#f7f8f5",banner:false,
      audio:{noAudio:true},render:{antialias:true},
      scale:{mode:Phaser.Scale.RESIZE,width:host.clientWidth,height:host.clientHeight},
      fps:{target:30},scene:DiagramScene
    });
    return {
      load(diagram){pending=diagram;if(activeScene)activeScene.loadDiagram(diagram);},
      select(id){if(activeScene)activeScene.select(id);},
      play(){if(activeScene)activeScene.playStory();},
      next(){if(activeScene)activeScene.nextStage();},
      zoom(factor){if(activeScene)activeScene.zoomBy(factor);},
      fit(){if(activeScene){activeScene.manualView=true;activeScene.fit();}},
      reset(){if(activeScene?.diagram){const diagram=activeScene.diagram;activeScene.diagram=null;layouts.delete(diagram.id);views.delete(diagram.id);activeScene.loadDiagram(diagram);}},
      setVisible(value){
        visible=value;
        if(!activeScene)return;
        if(visible){activeScene.scene.resume();game.loop.wake();}
        else {activeScene.scene.pause();game.loop.sleep();}
      },
      destroy(){game.destroy(true);}
    };
  };
})();