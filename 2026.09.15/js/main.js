(function () {
  "use strict";
  const diagrams=window.WORFLOGY_DIAGRAMS;
  const copy=window.WORFLOGY_COPY;
  const root=document.getElementById("diagram-sections");
  root.replaceChildren();
  const players=[];
  const observers=[];
  const imageDialog=document.createElement("dialog");
  imageDialog.className="canvas-image-dialog";
  imageDialog.setAttribute("aria-labelledby","canvas-image-title");
  const imageTitle=document.createElement("h2");imageTitle.id="canvas-image-title";imageTitle.textContent="제품 미리보기";
  const imageClose=document.createElement("button");imageClose.type="button";imageClose.textContent="닫기";
  const imageFull=document.createElement("img");imageFull.alt="제품 미리보기";
  imageDialog.append(imageTitle,imageClose,imageFull);document.body.append(imageDialog);
  let imageReturnFocus=null;
  imageClose.addEventListener("click",()=>imageDialog.close());
  imageDialog.addEventListener("click",event=>{if(event.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)imageDialog.close();}});
  imageDialog.addEventListener("close",()=>imageReturnFocus?.focus({preventScroll:true}));

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
      title.textContent=diagram.title;
      section.append(title);
      if(diagram.readiness){
        title.classList.add("has-readiness");
        const readiness=document.createElement("p");
        readiness.className="diagram-readiness";
        readiness.textContent=diagram.readiness;
        if(diagram.readiness==="PoC Ready")readiness.lang="en";
        section.append(readiness);
      }
    }
    section.append(document.getElementById("diagram-template").content.cloneNode(true));
    root.append(section);
    const byId=id=>section.querySelector('[data-ui="'+id+'"]');
    byId("technology-label").textContent=diagram.technologyLabel;
    const host=byId("diagram-canvas");

    host.setAttribute("aria-label",diagram.title+" 관계도. 좌우 방향키로 오브젝트 선택, Escape로 선택 해제.");
    let explorer=null,selectedId=null,storyActive=false;
    let exampleCard=null;
    const previewNumber={overview:"01",platform:"02",problem:"03",risk:"04",research:"05",narrative:"06",npc:"07",creator:"08",bias:"09"}[diagram.id];
    if(previewNumber){
      host.classList.add("canvas-example-enabled");
      exampleCard=document.createElement("button");exampleCard.type="button";exampleCard.className="canvas-example-card";
      exampleCard.disabled=true;exampleCard.setAttribute("aria-hidden","true");exampleCard.setAttribute("aria-label","제품 미리보기 확대");
      const label=document.createElement("span");label.className="canvas-example-label";label.textContent="제품 미리보기";
      const photo=document.createElement("img");photo.src="assets/images/canvas-bg/canvas-"+previewNumber+".png";photo.alt="";photo.decoding="async";photo.draggable=false;
      photo.addEventListener("error",()=>{exampleCard.hidden=true;});
      exampleCard.append(label,photo);
      section.querySelector(".diagram-shell").append(exampleCard);
      exampleCard.addEventListener("click",()=>{
        explorer?.select(null);
        imageReturnFocus=byId("play-story");imageFull.src=photo.src;
        imageDialog.showModal();
      });
    }
    const objectName=(d,id)=>id==="logic"?"지식 그래프 생산 로직":copy.overrides[d.id]?.[id]||copy.names[id]||id;
    function caption(speaker,text){
      byId("speaker").textContent=speaker||"";
      byId("speaker").hidden=!speaker;
      byId("story-text").textContent=text;
    }
    function showSelection(id){
      selectedId=id;
      if(storyActive)return;
      if(!id){caption("",copy.introductions[diagram.id]);return;}
      caption(objectName(diagram,id),copy.objectDescriptions?.[diagram.id]?.[id]||copy.descriptions[id]||"이 오브젝트의 상호작용과 영향 관계를 살펴봅니다.");
    }
  function showStory(state){
    const diagram=diagrams[index];
    storyActive=!["idle","complete","paused"].includes(state.phase);
    if(exampleCard){
      exampleCard.classList.toggle("is-visible",storyActive);
      exampleCard.disabled=!storyActive;exampleCard.setAttribute("aria-hidden",String(!storyActive));
    }
    let text="",speaker="";
    if(state.phase==="platform"||state.phase==="context"){text=state.text;speaker=state.speaker;}
    else if(state.phase==="overview"){text=state.text;speaker=state.step<=7?"01 / 전통적인 Top-Down":"02 / 워플로지 Bottom-Up";}
    else if(state.phase==="idle")text=copy.introductions[diagram.id];
    else if(state.phase==="meet")text="사용자가 에이전트에게 다가갑니다.";
    else if(state.phase==="talk"){speaker="사용자";text=copy.queries[diagram.id];}
    else if(state.phase==="infra"){speaker="에이전트";text=copy.objectDescriptions[diagram.id]?.[selectedId];}
    else if(state.phase==="logic"){speaker="에이전트";text=objectName(diagram,selectedId);}
    else if(state.phase==="graph"){speaker="에이전트";text="상호작용을 통해 온톨로지 지식 그래프가 생성됩니다.";}
    else if(state.phase==="complete"){
      speaker="활용 기술";
      text=index===0?"워플로지가 고안한 Bottom-Up 네트워크 성장 루프":diagram.id==="platform"?"Top-Down 설계 · W3C RDF/OWL 2 기반":({
        "top-down":"전통적인 Top-Down 정적 시맨틱 디자인",
        "bottom-up":"워플로지의 Bottom-Up 동적 지식 그래프 디자인",
        "hybrid":"Top-Down·Bottom-Up 하이브리드 디자인"
      }[state.technology]||"온톨로지 지식 그래프가 완성되었습니다.");
    }
    caption(speaker,text||"오브젝트 사이의 관계를 살펴봅니다.");
    byId("story-progress").textContent=state.step?state.step+" / "+state.total:"";
    const idle=state.phase==="idle",done=state.phase==="complete";
    byId("next-stage").disabled=idle||done||state.phase==="paused";
    byId("play-story").setAttribute("aria-label",idle?"재생":"다시 재생");
    byId("play-story").title=idle?"재생":"다시 재생";
  }

    try {
      explorer=window.createDiagramExplorer(host,{
        select:showSelection,story:showStory,
        zoom:()=>{}
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
      const fallback=document.createElement('div');fallback.className='diagram-fallback';
      const description=document.createElement('p');description.textContent=diagram.desc;fallback.append(description);
      const list=document.createElement('ul');
      diagram.nodes.forEach(node=>{const item=document.createElement('li');item.textContent=copy.objectDescriptions?.[diagram.id]?.[node.id]||node.description||node.label.replace(/\n/g,' ');list.append(item);});
      fallback.append(list);section.append(fallback);
      section.querySelectorAll(".toolbar button, .canvas-zoom button").forEach(button=>button.disabled=true);
      caption("","이 도면을 불러오지 못했습니다.");
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
  const workshopLink=document.querySelector(".workshop-floating");
  let workshopWindow=null;
  workshopLink.addEventListener("click",event=>{
    if(!workshopWindow||workshopWindow.closed){
      workshopWindow=window.open(workshopLink.href,"worflogy-workshop");
      if(!workshopWindow)return;
      workshopWindow.opener=null;
    }
    event.preventDefault();
    workshopWindow.focus();
  });

  window.addEventListener("pagehide",event=>{if(!event.persisted){observers.forEach(observer=>observer.disconnect());players.forEach(player=>player.destroy());}});
})();