/* Reuses company.html's inquiry fields and Apps Script payload. */
(() => {
  "use strict";
  const dialog=document.getElementById("contact-dialog");
  const form=document.getElementById("contact-form");
  const submit=form.querySelector('[type="submit"]');
  const status=document.getElementById("contact-status");
  const opener=document.getElementById("open-contact-modal");
  const notice=document.createElement('p');notice.className='contact-invitation';notice.id='contact-result';notice.setAttribute('role','status');notice.hidden=true;opener.parentElement.append(notice);
  let pending=false;
  opener.addEventListener("click",()=>dialog.showModal());
  dialog.querySelectorAll("[data-contact-close]").forEach(button=>button.addEventListener("click",()=>dialog.close()));
  dialog.addEventListener("close",()=>opener.focus());
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(pending||!form.reportValidity())return;
    pending=true;submit.disabled=true;submit.setAttribute("aria-busy","true");submit.textContent="전송 중…";
    status.textContent="";
    notice.hidden=true;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
    const fields=new FormData(form);
    const payload={type:"inquiry",...Object.fromEntries(fields)};
    try{
      await fetch(window.WorflogyConfig.WEB_APP_URL,{
        method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),signal:controller.signal
      });
      // An opaque response cannot confirm email delivery.
      // Keep input until a server receipt can actually be verified.
      dialog.close();
      notice.textContent="문의 전송을 요청했습니다. 아직 접수 여부를 확인하지 못해 입력 내용을 유지했습니다.";notice.hidden=false;
      status.textContent=notice.textContent;
    }catch(error){
      const message=error.name==='AbortError'?"응답이 지연되어 요청을 중단했습니다. 입력 내용은 유지됩니다.":"전송하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      status.textContent=message;notice.textContent=message;notice.hidden=false;
    }finally{
      clearTimeout(timer);
      pending=false;submit.disabled=false;submit.removeAttribute("aria-busy");submit.textContent="문의 제출하기";
    }
  });
})();