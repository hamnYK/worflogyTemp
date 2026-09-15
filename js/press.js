(() => {
  const dialog=document.getElementById("press-dialog");
  const opener=document.getElementById("open-press");
  opener.addEventListener("click",()=>{dialog.showModal();dialog.scrollTop=0;});
  document.getElementById("close-press").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("close",()=>opener.focus());
})();