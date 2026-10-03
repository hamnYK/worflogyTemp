/* Reuse related first-party tabs in both directions, including reloads. */
(()=>{const SIDE='home',SELECTOR='a.contexton-floating,a[data-contexton-link]';
 // Only these two first-party sites participate; never exchange canvas/auth data.
 const origins=new Set(['https://worflogy.com','https://www.worflogy.com','https://contextonai.com','https://www.contextonai.com']);
 const ownName=SIDE==='home'?'worflogy-home':'worflogy-contexton';
 const peerName=SIDE==='home'?'worflogy-contexton':'worflogy-home';
 window.name=ownName;let peer=null;
 const isPeer=origin=>origins.has(origin)&&(SIDE==='home'?new URL(origin).hostname.includes('contextonai.com'):new URL(origin).hostname.endsWith('worflogy.com'));
 const announce=target=>{if(!target)return;for(const origin of origins)if(isPeer(origin)){try{target.postMessage({type:'worflogy-tab-ready',side:SIDE},origin);}catch{}}};
 window.addEventListener('message',event=>{
  if(!isPeer(event.origin)||!event.source||event.source===window||event.data?.side===SIDE)return;
  if(event.data?.type!=='worflogy-tab-ready'&&event.data?.type!=='worflogy-tab-ack')return;
  peer=event.source;
  if(event.data.type==='worflogy-tab-ready')event.source.postMessage({type:'worflogy-tab-ack',side:SIDE},event.origin);
 });
 announce(window.opener);
 window.addEventListener('pageshow',()=>{window.name=ownName;announce(window.opener);announce(peer);});
 document.addEventListener('click',event=>{
  const link=event.target.closest?.(SELECTOR);
  if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href,location.href);if(!isPeer(url.origin))return;
  if(peer&&!peer.closed){try{peer.focus();event.preventDefault();return;}catch{peer=null;}}
  // Empty URL recovers a named, related tab without reloading its work.
  const opened=window.open('',peerName);if(!opened){event.preventDefault();return;}
  event.preventDefault();peer=opened;
  try{if(opened.location.href==='about:blank')opened.location.replace(url.href);}catch{/* Existing cross-origin tab: keep its page intact. */}
  announce(opened);try{opened.focus();}catch{}
 });
})();
