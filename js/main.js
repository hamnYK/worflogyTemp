(function () {
  "use strict";
  const diagrams=window.WORFLOGY_DIAGRAMS;
  const copy=window.WORFLOGY_COPY;
  const root=document.getElementById("diagram-sections");
  const directory=root.querySelector(".solution-directory");
  root.replaceChildren();
  const players=[];
  const observers=[];
  const mobileView=window.matchMedia("(max-width:760px)");
  const imageDialog=document.createElement("dialog");
  imageDialog.className="wf-dialog canvas-image-dialog";
  imageDialog.setAttribute("aria-labelledby","canvas-image-title");
  const imageTitle=document.createElement("h2");imageTitle.id="canvas-image-title";imageTitle.textContent="제품 미리보기";
  const imageClose=document.createElement("button");imageClose.type="button";imageClose.textContent="닫기";
  const imageFull=document.createElement("img");imageFull.alt="제품 미리보기";
  const imageNumber=document.createElement("span");imageNumber.className="canvas-image-number";imageNumber.setAttribute("aria-hidden","true");
  const imageHeading=document.createElement("div");imageHeading.className="canvas-image-heading";imageHeading.append(imageNumber,imageTitle);
  const imageActions=document.createElement("div");imageActions.className="canvas-image-actions";imageActions.append(imageClose);
  const imageHeader=document.createElement("header");imageHeader.className="canvas-image-header";imageHeader.append(imageHeading,imageActions);
  const imageFrame=document.createElement("div");imageFrame.className="canvas-image-frame";imageFrame.tabIndex=0;imageFrame.setAttribute("role","region");imageFrame.setAttribute("aria-label","제품 이미지");imageFull.draggable=false;imageFrame.append(imageFull);
  imageDialog.append(imageHeader,imageFrame);document.body.append(imageDialog);
  let imageReturnFocus=null;
  imageClose.addEventListener("click",()=>imageDialog.close());
  imageDialog.addEventListener("click",event=>{if(event.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)imageDialog.close();}});
  imageDialog.addEventListener("close",()=>imageReturnFocus?.focus({preventScroll:true}));

  diagrams.forEach((diagram,index)=>{
    const section=document.createElement("section");
    section.className="diagram-section";
    section.id="section-"+diagram.id;
    section.setAttribute("aria-labelledby","title-"+diagram.id);
    if(diagram.category){
      const category=document.createElement("p");category.className="diagram-category";
      const tag=document.createElement("span");tag.className="wf-badge wf-badge--neutral";tag.textContent=diagram.category;
      category.append(tag);section.append(category);
    }
    if(index===0){
      const header=document.createElement("header");header.className="guide-header";
      const home=document.createElement("a");home.href="#main";home.setAttribute("aria-label","맨 위로");
      home.innerHTML='<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 15 16 2l14 13-3 3L16 8 5 18Zm5 2 9-8 9 8v13h-7v-9h-4v9H7Z" fill="currentColor"/></svg>';
      const title=document.createElement("h1");title.id="title-"+diagram.id;title.textContent='워플로지 “AI 인문 사회 디자인”';
      const mobileNote=document.createElement("p");mobileNote.className="guide-mobile-note";
      mobileNote.textContent="PC에서는 캔버스 조작, 모바일에서는 재생만 가능합니다.";
      header.append(mobileNote,home,title);
      const description=document.createElement("p");description.className="guide-description";
      const promise=document.createElement("strong");promise.textContent="한 번의 문제 해결이 다음 문제를 푸는 지식이 되도록.";
      description.append(promise,"워플로지는 업무와 창작 과정에서 얻은 경험을 지식 그래프로 연결해,",document.createElement("br"),"다시 활용하고 발전시킬 수 있는 체계를 설계합니다.");
      section.append(header,description);
      if(directory)section.append(directory);
      const overviewTitle=document.createElement("h2");overviewTitle.className="diagram-section-title";overviewTitle.id="overview-summary-title";overviewTitle.textContent="0. 워플로지, Bottom-Up 동적 지식 그래프 디자인 기술 회사";section.append(overviewTitle);
    }else{
      const title=document.createElement("h2");title.className="diagram-section-title";title.id="title-"+diagram.id;
      const titleText=document.createElement("span");titleText.textContent=diagram.title;
      title.append(document.createTextNode(index+". "),titleText);
      section.append(title);
      if(diagram.readiness){
        title.classList.add("has-readiness");
        const readiness=document.createElement("p");
        readiness.className="diagram-readiness";
        readiness.textContent=diagram.readiness;

        section.append(readiness);
      }
    }
    if(diagram.video){
      const shell=document.createElement("div");shell.className="diagram-shell";
      const toolbar=document.createElement("div");toolbar.className="toolbar";
      const technology=document.createElement("strong");technology.className="toolbar-technology";technology.textContent=diagram.technologyLabel;
      toolbar.append(technology);
      const video=document.createElement("video");video.className="diagram-canvas diagram-canvas--video";
      video.muted=true;video.autoplay=true;video.loop=true;video.playsInline=true;video.preload="metadata";
      video.setAttribute("muted","");video.setAttribute("playsinline","");video.setAttribute("aria-label",diagram.title);
      video.src=diagram.video;
      shell.append(toolbar,video);section.append(shell);root.append(section);
      let visible=false;
      const syncVideo=()=>{if(visible&&!document.hidden)video.play().catch(()=>{});else video.pause();};
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncVideo();});
      observer.observe(video);observers.push(observer);
      document.addEventListener("visibilitychange",syncVideo);
      players.push({destroy(){video.pause();document.removeEventListener("visibilitychange",syncVideo);}});
      return;
    }
    if(diagram.placeholder){
      const shell=document.createElement("div");shell.className="diagram-shell";
      const canvas=document.createElement("div");canvas.className="diagram-canvas diagram-canvas--placeholder";
      canvas.setAttribute("role","img");canvas.setAttribute("aria-label","공간정보 프로젝트 캔버스, 내용 준비 중");
      shell.append(canvas);section.append(shell);root.append(section);
      return;
    }
    section.append(document.getElementById("diagram-template").content.cloneNode(true));
    root.append(section);
    const byId=id=>section.querySelector('[data-ui="'+id+'"]');
    byId("technology-label").textContent=diagram.technologyLabel;
    if(diagram.relations?.length){
      const label=byId("technology-label");
      const metadata=document.createElement("div");metadata.className="toolbar-metadata";
      label.replaceWith(metadata);metadata.append(label);
      const relations=document.createElement("ul");relations.className="wf-relations";
      relations.setAttribute("aria-label","핵심 연결 관계");
      diagram.relations.forEach(triple=>{
        const row=document.createElement("li");row.className="wf-relation";
        triple.forEach((text,index)=>{
          if(index){const edge=document.createElement("span");edge.className="wf-relation__edge";edge.setAttribute("aria-hidden","true");row.append(edge);}
          const chip=document.createElement("span");
          chip.className="wf-badge"+(index===1?" wf-badge--warning":index===2?" wf-badge--neutral":"");
          chip.textContent=text;row.append(chip);
        });
        relations.append(row);
      });
      metadata.append(relations);
    }
    const host=byId("diagram-canvas");

    host.setAttribute("aria-label",diagram.title+" 관계도. 좌우 방향키로 오브젝트 선택, Escape로 선택 해제.");
    const syncCanvasAccess=()=>{
      host.tabIndex=mobileView.matches||diagram.renderer?-1:0;
      host.setAttribute("role",mobileView.matches?"img":"group");
      host.setAttribute("aria-label",mobileView.matches||diagram.renderer?diagram.title:diagram.title+" 관계도. 좌우 방향키로 오브젝트 선택, Escape로 선택 해제.");
      if(mobileView.matches&&imageDialog.open)imageDialog.close();
    };
    syncCanvasAccess();
    mobileView.addEventListener("change",syncCanvasAccess);
    let explorer=null,selectedId=null,storyActive=false;
    let exampleCard=null;
    const previewNumber={overview:"00",platform:"01",problem:"02",risk:"03",research:"04",narrative:"05",npc:"06",creator:"07",bias:"08","spatial-9":"09","spatial-10":"10","game-11":"11"}[diagram.id];
    if(previewNumber){
      host.classList.add("canvas-example-enabled");
      exampleCard=document.createElement("button");exampleCard.type="button";exampleCard.className="canvas-example-card";
      exampleCard.disabled=true;exampleCard.setAttribute("aria-hidden","true");exampleCard.setAttribute("aria-label","제품 미리보기 확대");
      const label=document.createElement("span");label.className="canvas-example-label";label.textContent="제품 미리보기";
      const photo=document.createElement("img");photo.src="assets/images/canvas-bg/canvas-"+previewNumber+".png";photo.alt="";photo.decoding="async";photo.draggable=false;
      const mobilePreview=document.createElement("figure");mobilePreview.className="canvas-mobile-preview";
      const mobileLabel=document.createElement("figcaption");mobileLabel.className="canvas-example-label";mobileLabel.textContent=label.textContent;
      const mobilePhoto=photo.cloneNode();mobilePhoto.alt="제품 미리보기";
      mobilePhoto.addEventListener("error",()=>{mobilePreview.hidden=true;});
      mobilePreview.append(mobileLabel,mobilePhoto);
      section.querySelector(".diagram-shell").append(mobilePreview);
      photo.addEventListener("error",()=>{exampleCard.hidden=true;});
      exampleCard.append(label,photo);
      section.querySelector(".canvas-viewport").append(exampleCard);
      exampleCard.addEventListener("click",()=>{
        if(mobileView.matches)return;
        explorer?.select(null);
        imageReturnFocus=byId("play-story");imageFull.src=photo.src;imageNumber.textContent=previewNumber;imageFrame.scrollTo(0,0);
        imageDialog.showModal();
      });
    }
    const objectName=(d,id)=>id==="logic"?"지식 그래프 생산 로직":copy.overrides[d.id]?.[id]||copy.names[id]||id;
    if(diagram.noSubtitle)section.querySelector(".canvas-subtitle").hidden=true;
    function caption(speaker,text){
      if(diagram.noSubtitle)return;
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
      text=index===0?"워플로지가 고안한 Bottom-Up 네트워크 성장 루프":diagram.id==="platform"?"Top-Down 시맨틱 디자인 · W3C RDF/OWL 2 기반":({
        "top-down":"전통적인 Top-Down 정적 시맨틱 디자인",
        "bottom-up":"워플로지의 Bottom-Up 동적 지식 그래프 디자인",
        "hybrid":"Top-Down·Bottom-Up 하이브리드 디자인"
      }[state.technology]||"온톨로지 지식 그래프가 완성되었습니다.");
    }
    caption(speaker,text||"오브젝트 사이의 관계를 살펴봅니다.");
    byId("story-progress").textContent=state.step&&state.phase!=="complete"&&state.phase!=="idle"?state.step+" / "+state.total:"";
    const idle=state.phase==="idle",done=state.phase==="complete";
    byId("next-stage").disabled=idle||done||state.phase==="paused";
    byId("play-story").setAttribute("aria-label",idle?"재생":"다시 재생");
    byId("play-story").title=idle?"재생":"다시 재생";
  }

    try {
      const createExplorer=({spatial:window.createSpatialExplorer,farm:window.createFarmExplorer,football:window.createFootballExplorer})[diagram.renderer]||window.createDiagramExplorer;
      explorer=createExplorer(host,{
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
      if(mobileView.matches||diagram.renderer)return;
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