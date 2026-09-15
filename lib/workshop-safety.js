/* Targeted input boundaries; no global DOM or fetch overrides. */
function _wfEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function _wfNormalizeDocs(){
 if(!Array.isArray(S.docs)){S.docs=[];return;}
 S.docs=S.docs.filter(d=>d&&typeof d==='object').map(d=>({...d,name:String(d.name??'Untitled'),content:String(d.content??d.text??''),category:String(d.category??'기타')}));
}
async function _wfReadResponse(url,options={},kind='json',timeout=45000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{const parsed=new URL(url,location.href);if(!['http:','https:'].includes(parsed.protocol))throw new Error('HTTP 또는 HTTPS 주소를 입력하세요.');
 const response=await fetch(parsed.href,{...options,signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);
 if(kind==='auto'){const type=response.headers.get('content-type')||'';return {json:type.includes('json'),data:type.includes('json')?await response.json():await response.text()};}
 return kind==='text'?await response.text():await response.json();
 }catch(error){if(error.name==='AbortError')throw new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.');throw error;}finally{clearTimeout(timer);}
}

document.addEventListener('DOMContentLoaded',()=>{
 const save=document.getElementById('save-key-btn');if(!save)return;
 const clear=document.createElement('button');clear.type='button';clear.className='btn btn-s';clear.textContent='저장한 API 키 지우기';clear.id='clear-api-keys-btn';
 clear.addEventListener('click',()=>{for(const p of ['gemini','openai']){S.keys[p]='';try{sessionStorage.removeItem('ont_key_'+p);}catch{}}
 for(const id of ['g-key','o-key']){const input=document.getElementById(id);if(input)input.value='';}
 const status=document.getElementById('api-st');if(status)status.textContent='저장한 API 키를 지웠습니다.';
 });save.insertAdjacentElement('afterend',clear);
});
