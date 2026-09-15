/* Add an image, description and date for each new activity. */
window.WORFLOGY_ACTIVITIES = [
  {image:"./assets/images/activities/nia-workshop-20260909-blended.png",description:"2026년 NIA 행정 혁신 온톨로지 워크숍",date:"2026.09.09",alt:"NIA 온톨로지 워크숍에서 발표하는 모습과 참석자들"}
];
(() => {
 const items=window.WORFLOGY_ACTIVITIES;
 const image=document.getElementById("activity-image"),caption=document.getElementById("activity-caption"),date=document.getElementById("activity-date"),controls=document.getElementById("activity-controls"),count=document.getElementById("activity-count");
 const imageNext=document.getElementById("activity-image-next");
 let current=0;
 function render(){
  const item=items[current];image.src=item.image;image.alt=item.alt;
  caption.textContent=item.description;date.textContent=item.date;
  count.textContent=(current+1)+" / "+items.length;
  controls.hidden=items.length<2;
  imageNext.disabled=items.length<2;
 }
 document.getElementById("activity-prev").addEventListener("click",()=>{current=(current-1+items.length)%items.length;render();});
 function next(){
  if(items.length<2)return;
  current=(current+1)%items.length;render();
 }
 document.getElementById("activity-next").addEventListener("click",next);
 imageNext.addEventListener("click",next);
 render();
})();