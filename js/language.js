/* Local, reversible language switching. User input and diagram state remain untouched. */
(() => {
  "use strict";
  const dictionary=window.WORFLOGY_EN||{};
  const normalize=text=>text.replace(/\s+/g," ").trim();
  const normalized=new Map(Object.entries(dictionary).map(([ko,en])=>[normalize(ko),en]));
  const sources=new WeakMap(),attributes=new WeakMap();
  const translatedAttributes=["aria-label","aria-roledescription","title","alt","placeholder","content"];
  const ignored="script,style,noscript,textarea,input,[contenteditable]:not([contenteditable='false']),[data-language-control]";
  function initialLanguage(){
    if(["ko","en"].includes(history.state?.language))return history.state.language;
    // Only the entry URL is adaptive; explicit language links remain stable.
    if(location.pathname.endsWith("/")){
      try {
        const saved=localStorage.getItem("worflogy-language");
        if(["ko","en"].includes(saved))return saved;
      } catch {}
      const preferred=navigator.languages?.[0]||navigator.language||"en";
      return /^ko(?:-|$)/i.test(preferred)?"ko":"en";
    }
    return document.documentElement.dataset.pageLanguage==="en"?"en":"ko";
  }
  let language=initialLanguage();
  try {history.replaceState({...history.state,language},"",location.href);} catch {}
  function english(text){
    if(Object.hasOwn(dictionary,text))return dictionary[text];
    const key=normalize(text);
    if(normalized.has(key))return text.match(/^\s*/)[0]+normalized.get(key)+text.match(/\s*$/)[0];
    const usage="\uc744 \ud65c\uc6a9\ud569\ub2c8\ub2e4.";
    if(key.endsWith(usage))return "Uses "+english(key.slice(0,-usage.length))+".";
    const suffix=" \uad00\uacc4\ub3c4. \uc88c\uc6b0 \ubc29\ud5a5\ud0a4\ub85c \uc624\ube0c\uc81d\ud2b8 \uc120\ud0dd, Escape\ub85c \uc120\ud0dd \ud574\uc81c.";
    if(text.endsWith(suffix))return english(text.slice(0,-suffix.length))+dictionary[suffix];
    return text;
  }
  function renderText(node){
    if(!node.parentElement||node.parentElement.closest(ignored))return;
    let entry=sources.get(node);
    if(!entry)entry={source:node.parentElement.getAttribute("data-i18n-ko")??node.data};
    else if(node.data!==entry.rendered)entry={source:node.data};
    entry.rendered=language==="en"?english(entry.source):entry.source;
    sources.set(node,entry);
    if(node.data!==entry.rendered)node.data=entry.rendered;
  }
  function renderAttributes(element){
    if(element.closest(ignored))return;
    let entries=attributes.get(element);
    if(!entries){
      entries={};
      const original=JSON.parse(element.getAttribute("data-i18n-attrs")||"{}");
      for(const [name,source] of Object.entries(original))entries[name]={source,rendered:element.getAttribute(name)};
      attributes.set(element,entries);
    }
    for(const name of translatedAttributes){
      if(!element.hasAttribute(name))continue;
      const value=element.getAttribute(name);
      let entry=entries[name];
      if(!entry||value!==entry.rendered)entry={source:value};
      entry.rendered=language==="en"?english(entry.source):entry.source;
      entries[name]=entry;
      if(value!==entry.rendered)element.setAttribute(name,entry.rendered);
    }
  }
  function render(root){
    if(root.nodeType===Node.TEXT_NODE){renderText(root);return;}
    if(root.nodeType!==Node.ELEMENT_NODE)return;
    if(root.closest(ignored))return;
    renderAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode()){
      if(node.nodeType===Node.TEXT_NODE)renderText(node);else renderAttributes(node);
    }
  }
  const toggle=document.getElementById("language-toggle");
  function refresh(){
    document.documentElement.lang=language;
    document.querySelectorAll(".canvas-subtitle").forEach(node=>node.lang=language);
    toggle.textContent=language==="ko"?"English":"\ud55c\uad6d\uc5b4";
    toggle.lang=language==="ko"?"en":"ko";
    toggle.setAttribute("aria-label",language==="ko"?"Switch to English":"\ud55c\uad6d\uc5b4\ub85c \uc804\ud658");
    toggle.setAttribute("hreflang",language==="ko"?"en":"ko");
    toggle.setAttribute("href",language==="ko"?"./en.html":"./index.html");
    render(document.documentElement);
    updateMetadata();
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==="characterData")renderText(record.target);
      else if(record.type==="attributes")renderAttributes(record.target);
      else for(const node of record.addedNodes)render(node);
    }
    document.querySelectorAll(".canvas-subtitle").forEach(node=>{if(node.lang!==language)node.lang=language;});
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:translatedAttributes});
  function updateMetadata(){
    const url=document.querySelector('link[rel="alternate"][hreflang="'+language+'"]')?.href;
    if(!url)return;
    document.querySelector('link[rel="canonical"]').href=url;
    document.querySelector('meta[property="og:url"]').content=url;
    document.querySelector('meta[property="og:locale"]').content=language==="ko"?"ko_KR":"en_US";
    document.querySelector('meta[property="og:locale:alternate"]').content=language==="ko"?"en_US":"ko_KR";
    const data=document.getElementById("page-structured-data");
    const schema=JSON.parse(data.textContent);
    const page=schema["@graph"].find(item=>item["@type"]==="WebPage");
    page.url=url;page["@id"]=url+"#webpage";page.inLanguage=language;page.name=document.title;
    page.description=document.querySelector('meta[name="description"]').content;
    const organization=schema["@graph"].find(item=>item["@type"]==="Organization");
    organization.name=language==="ko"?"\uc8fc\uc2dd\ud68c\uc0ac \uc6cc\ud50c\ub85c\uc9c0":"Worflogy Inc.";
    organization.alternateName=language==="ko"?"Worflogy Inc.":"\uc8fc\uc2dd\ud68c\uc0ac \uc6cc\ud50c\ub85c\uc9c0";
    data.textContent=JSON.stringify(schema);
  }
  let transition=0;
  // A later user action takes priority over deferred font position correction.
  for(const event of ["pointerdown","wheel","touchstart","keydown"])window.addEventListener(event,()=>{transition++;},{passive:true});
  function switchInPlace(next){
    const version=++transition;
    const sections=[...document.querySelectorAll('#diagram-sections > section, main > section.simple-section')];
    const anchor=sections.find(el=>{const r=el.getBoundingClientRect();return r.top<=innerHeight*.3&&r.bottom>innerHeight*.3;})||sections.find(el=>el.getBoundingClientRect().bottom>0);
    const offset=anchor?.getBoundingClientRect().top,previousY=scrollY;
    language=next;refresh();
    const restore=()=>{if(version!==transition)return;window.scrollTo({top:anchor?scrollY+anchor.getBoundingClientRect().top-offset:previousY,behavior:'instant'});};
    restore();
    // The alternate display font can change preceding section heights on first use.
    const restoredY=scrollY;
    document.fonts.ready.then(()=>requestAnimationFrame(()=>{if(Math.abs(scrollY-restoredY)<3)restore();}));
  }
  toggle.addEventListener("click",event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    const next=language==="ko"?"en":"ko";
    const url=new URL(toggle.href);url.hash=location.hash;
    try {history.pushState({language:next},"",url);} catch {
      // file:// cannot always change filenames through History; stay in this document.
      try {history.pushState({language:next},"",location.href);} catch {}
    }
    try {localStorage.setItem("worflogy-language",next);} catch {}
    switchInPlace(next);
  });
  window.addEventListener("popstate",event=>{
    const next=["ko","en"].includes(event.state?.language)?event.state.language:(location.pathname.endsWith("/en.html")?"en":"ko");
    switchInPlace(next);
  });
  window.WorflogyLanguage={get current(){return language;},translate:english};
  refresh();
})();
