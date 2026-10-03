/* Reuse the tab opened by this page without reloading the user's canvas. */
(()=>{
 let contextonWindow=null;
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a.contexton-floating');
  if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  if(contextonWindow&&!contextonWindow.closed){
   try{contextonWindow.focus();event.preventDefault();return;}catch{contextonWindow=null;}
  }
  // Detach the opener before navigating, while retaining our reference for focus.
  const opened=window.open('about:blank','_blank');
  if(!opened)return; // Keep the native link fallback if popups are blocked.
  try{opened.opener=null;opened.location.replace(link.href);contextonWindow=opened;event.preventDefault();opened.focus();}
  catch{try{opened.close();}catch{}}
 });
})();
