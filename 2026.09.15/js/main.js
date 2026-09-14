(function () {
  "use strict";
  const diagrams=window.WORFLOGY_DIAGRAMS;
  const copy=window.WORFLOGY_COPY;
  const root=document.getElementById("diagram-sections");
  const players=[];
  const observers=[];
  diagrams.forEach((diagram,index)=>{
    const section=document.createElement("section");
    section.className="diagram-section";
    section.id="section-"+diagram.id;
    section.setAttribute("aria-labelledby","title-"+diagram.id);
    if(index===0){
      const header=document.createElement("header");header.className="guide-header";
      const home=document.createElement("a");home.href="#main";home.setAttribute("aria-label","맨 위로");
      home.innerHTML='<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 15 16 2l14 13-3 3L16 8 5 18Zm5 2 9-8 9 8v13h-7v-9h-4v9H7Z" fill="currentColor"/></svg>';
      const title=document.createElement("h1");title.id="title-"+diagram.id;title.textContent='워플로지 “워크플로 온톨로지”';
      header.append(home,title);
      const description=document.createElement("p");description.className="guide-description";
      description.append("인공지능 인문 사회 디자인 : 사유를 맥락으로 연결하고 소통하다.",document.createElement("br"),"Bottom-Up 동적 지식 그래프 디자인의 기술 스타트업");
      section.append(header,description);
    }else{
      const title=document.createElement("h2");title.className="diagram-section-title";title.id="title-"+diagram.id;
      title.textContent=["platform","problem","risk","research","narrative","npc","creator"].includes(diagram.id)?diagram.title:diagram.nav+" · "+diagram.title;
      section.append(title);
    }
    section.append(document.getElementById("diagram-template").content.cloneNode(true));
    root.append(section);
    const byId=id=>section.querySelector('[data-ui="'+id+'"]');
    const host=byId("diagram-canvas");
    host.setAttribute("aria-label",diagram.title+" 관계도. 좌우 방향키로 오브젝트 선택, Escape로 선택 해제.");
    let explorer=null,selectedId=null,storyActive=false;
    const englishName=(d,id)=>id==="logic"?"Knowledge Graph Production Logic":copy.overrides[d.id]?.[id]||copy.names[id]||id;
    function caption(speaker,text){
      byId("speaker").textContent=speaker||"";
      byId("speaker").hidden=!speaker;
      byId("story-text").textContent=text;
    }
    function showSelection(id){
      selectedId=id;
      if(storyActive)return;
      if(!id){caption("","Select an object or start the animation.");return;}
      caption(englishName(diagram,id),copy.objectDescriptions?.[diagram.id]?.[id]||copy.descriptions[id]||"Explore this object’s interactions and influence.");
    }
  function showStory(state){
    const diagram=diagrams[index];
    storyActive=state.phase!=="idle"&&state.phase!=="complete";
    let text="",speaker="";
    if(state.phase==="platform"||state.phase==="context"){text=state.text;speaker=state.speaker;}
    else if(state.phase==="overview"){text=copy.overview[state.step-1];speaker=state.step<=7?"01 / TRADITIONAL TOP-DOWN":"02 / WORFLOGY BOTTOM-UP";}
    else if(state.phase==="idle")text=index===0?"Explore two approaches to composing an ontology.":"The player meets the AI agent and brings a question.";
    else if(state.phase==="meet")text="The player approaches the AI agent.";
    else if(state.phase==="talk"){speaker="PLAYER";text=copy.queries[diagram.id];}
    else if(state.phase==="infra"){speaker="AI AGENT";text="Using "+englishName(diagram,selectedId)+".";}
    else if(state.phase==="logic"){speaker="AI AGENT";text=englishName(diagram,selectedId);}
    else if(state.phase==="graph"){speaker="AI AGENT";text="The interactions produce an ontology knowledge graph.";}
    else if(state.phase==="complete"){
      speaker="SEMANTIC TECHNOLOGY";
      text=index===0?"Bottom-Up Network Growth Loop — Invented by WORFLOGY":diagram.id==="platform"?"Top-Down Semantic Design · Infrastructure That Grows with Experience":({
        "top-down":"Traditional Top-Down Static Semantic Design",
        "bottom-up":"WORFLOGY’s Bottom-Up Dynamic Knowledge Graph Design",
        "hybrid":"Hybrid Top-Down and Bottom-Up Design"
      }[state.technology]||"Ontology knowledge graph complete.");
    }
    caption(speaker,text||"Explore the relationships between these objects.");
    byId("story-progress").textContent=state.step?state.step+" / "+state.total:"";
    const idle=state.phase==="idle",done=state.phase==="complete";
    byId("next-stage").disabled=idle||done;
    byId("play-story").setAttribute("aria-label",idle?"재생":"다시 재생");
    byId("play-story").title=idle?"재생":"다시 재생";
  }

    try {
      explorer=window.createDiagramExplorer(host,{
        select:showSelection,story:showStory,
        zoom:value=>{byId("zoom-level").textContent=Math.round(value*100)+"%";}
      });
      if(!explorer)throw Error("Phaser is unavailable");
      explorer.load(diagram);
      players.push(explorer);
      const observer=new IntersectionObserver(([entry])=>explorer.setVisible(entry.isIntersecting),{rootMargin:"150px"});
      observer.observe(host);observers.push(observer);
    }catch(error){
      console.error("Diagram initialization failed",diagram.id,error);
      byId("engine-status").hidden=false;
      host.hidden=true;
      section.querySelectorAll(".toolbar button").forEach(button=>button.disabled=true);
      caption("","This diagram is unavailable.");
    }
    byId("zoom-in").addEventListener("click",()=>explorer?.zoom(1.2));
    byId("zoom-out").addEventListener("click",()=>explorer?.zoom(1/1.2));
    byId("reset").addEventListener("click",()=>explorer?.reset());
    byId("play-story").addEventListener("click",()=>explorer?.play());
    byId("next-stage").addEventListener("click",()=>explorer?.next());
    host.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Escape"].includes(event.key))return;
      event.preventDefault();
      if(event.key==="Escape"){explorer?.select(null);return;}
      const nodes=diagram.nodes,current=nodes.findIndex(n=>n.id===selectedId);
      const next=current<0?(event.key==="ArrowRight"?0:nodes.length-1):(current+(event.key==="ArrowRight"?1:-1)+nodes.length)%nodes.length;
      if(explorer)explorer.select(nodes[next].id);else showSelection(nodes[next].id);
    });
  });
  document.getElementById("year").textContent=new Date().getFullYear();
  window.addEventListener("pagehide",event=>{if(!event.persisted){observers.forEach(observer=>observer.disconnect());players.forEach(player=>player.destroy());}});
})();