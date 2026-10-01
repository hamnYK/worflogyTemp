/* Workshop recommendations, reviewed 2026-10-02 against provider documentation.
 * Ranking is a workshop suitability judgement, not a measured benchmark.
 * Discovery confirms catalog visibility only, not quota or generation permission.
 */
const WORKSHOP_MODELS = {
 gemini: [
  ['gemini-3.8-flash','기본 추천 · 문서 추출과 반복 실습'],
  ['gemini-3.7-flash','균형형 · 문서 분석과 답변 비교'],
  ['gemini-3.5-flash-lite','비용 우선 · 초안과 반복 실습'],
  ['gemini-3.6-flash','대안 · 기존 워크숍 비교 재현'],
  ['gemini-3.1-pro-preview','정밀 검토 · 복합 규칙 / Preview']
 ],
 openai: [
  ['gpt-6.1-sol','기본 추천 · 설계 품질과 비용 균형'],
  ['gpt-6-luna','비용 우선 · 추출 초안과 반복 실습'],
  ['gpt-6-astra','품질 우선 · 복합 규칙 정밀 검토'],
  ['gpt-5.4-mini','경량 대안 · 반복 분석'],
  ['gpt-5.4','대안 · 기존 결과와 비교']
 ],
 anthropic: [
  ['claude-sonnet-5-5','기본 추천 · 문서 이해와 규칙 설계'],
  ['claude-opus-5-5','품질 우선 · 예외와 복합 관계 검토'],
  ['claude-haiku-4-5-20251001','속도 우선 · 추출 초안과 반복 실습'],
  ['claude-fable-5-1','심층 검토 · 높은 비용과 응답 시간'],
  ['claude-sonnet-4-6','대안 · 기존 결과와 비교']
 ]
};
const WORKSHOP_PROVIDER_UI = {gemini:'g',openai:'o',anthropic:'a',local:'l'};
const _modelRequests = {};
const _modelVisibility = {};

function workshopModelOptions(provider, ids = null, previous = '') {
 const select = document.getElementById(WORKSHOP_PROVIDER_UI[provider] + '-mdl');
 if (!select || !WORKSHOP_MODELS[provider]) return;
 const desired = previous || select.value || S.models[provider];
 const ranked = WORKSHOP_MODELS[provider].filter(([id]) => !ids || ids.has(id)).slice(0,5);
 select.replaceChildren();
 const group = document.createElement('optgroup');
 group.label = ids ? '목록 확인된 워크숍 추천 (최대 5개)' : '워크숍 추천 5개 · 접근 여부 미확인';
 for (const [id, note] of ranked) group.append(new Option(id + ' — ' + note, id));
 select.append(group);
 if (desired && !ranked.some(([id])=>id===desired)) {
  const saved = document.createElement('optgroup'); saved.label = '기존 선택 유지 · 추천 목록 외';
  saved.append(new Option(desired + (ids && !ids.has(desired) ? ' — 목록에서 확인되지 않음' : ' — 연결 테스트 필요'),desired));
  select.append(saved);
 }
 if (desired && [...select.options].some(o=>o.value===desired)) select.value=desired;
 if (!select.options.length) select.append(new Option('추천 모델이 없습니다 · 키 권한을 확인하세요',''));
 S.models[provider]=select.value;
 return ranked.length;
}

function resetWorkshopModelAccess(provider) {
 const providers = provider ? [provider] : Object.keys(WORKSHOP_MODELS);
 for (const p of providers) {
  _modelRequests[p]?.abort(); delete _modelRequests[p]; delete _modelVisibility[p];
  workshopModelOptions(p);
  const el=document.getElementById('models-status-'+p);
  if(el) el.textContent='추천은 품질·비용·응답 시간 기준입니다. 키 입력 후 모델 목록을 확인하세요.';
  const dot=document.getElementById('apdot-'+p); if(dot)dot.style.display='none';
  document.getElementById('ao-'+WORKSHOP_PROVIDER_UI[p])?.classList.remove('live');
  const btn=document.getElementById('models-refresh-'+p); if(btn)btn.disabled=false;
 }
}

function anthropicHeaders(key) {
 return {'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'};
}

async function refreshWorkshopModels(provider) {
 if(!WORKSHOP_MODELS[provider])return;
 const prefix=WORKSHOP_PROVIDER_UI[provider], key=document.getElementById(prefix+'-key').value.trim();
 const el=document.getElementById('models-status-'+provider), btn=document.getElementById('models-refresh-'+provider);
 resetWorkshopModelAccess(provider);
 if(!key){el.textContent='API 키를 입력한 뒤 모델 목록을 확인하세요.';return;}
 const controller=new AbortController(); _modelRequests[provider]=controller;
 const timer=setTimeout(()=>controller.abort(),20000);
 btn.disabled=true; el.textContent='모델 목록 확인 중… (생성 요청 없음)';
 try {
  const ids=new Set(); let cursor=''; let pages=0;
  do {
   let url,headers;
   if(provider==='gemini') {
    url='https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(cursor?'&pageToken='+encodeURIComponent(cursor):'');
    headers={'x-goog-api-key':key};
   } else if(provider==='anthropic') {
    url='https://api.anthropic.com/v1/models?limit=1000'+(cursor?'&after_id='+encodeURIComponent(cursor):'');headers=anthropicHeaders(key);
   } else {url='https://api.openai.com/v1/models';headers={'Authorization':'Bearer '+key};}
   const response=await fetch(url,{headers,signal:controller.signal});
   if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();
   if(provider==='gemini') {
    if(!Array.isArray(data.models))throw new Error('모델 목록 응답 형식 오류');
    for(const model of data.models || []) if(model.supportedGenerationMethods?.includes('generateContent')) ids.add(String(model.name).replace(/^models\//,''));
    cursor=data.nextPageToken || '';
   } else {
    if(!Array.isArray(data.data))throw new Error('모델 목록 응답 형식 오류');
    for(const model of data.data || []) if(model.id)ids.add(model.id);
    cursor=provider==='anthropic' && data.has_more ? data.last_id : '';
    if(provider==='anthropic' && data.has_more && !cursor)throw new Error('페이지 응답 오류');
   }
   if(++pages>=20 && cursor)throw new Error('모델 목록이 너무 깁니다. 잠시 후 다시 확인하세요.');
  }while(cursor);
  if(_modelRequests[provider]!==controller || document.getElementById(prefix+'-key').value.trim()!==key)return;
  _modelVisibility[provider]=ids;
  const count=workshopModelOptions(provider,ids);
  el.textContent=`목록 확인: 추천 ${count}개. 5개 미만이면 확인된 후보만 표시합니다. 목록 조회는 사용 권한·잔액을 보장하지 않으므로 저장 및 연결 테스트로 최종 확인하세요.`;
 }catch(error){
  if(_modelRequests[provider]!==controller)return;
  el.textContent='모델 목록을 확인하지 못했습니다 ('+(error.name==='AbortError'?'시간 초과':error.message)+'). 추천 목록은 미확인 상태로 유지합니다. 키·네트워크·조직의 브라우저 접근 정책을 확인하세요.';
 }finally{
  clearTimeout(timer);
  if(_modelRequests[provider]===controller){btn.disabled=false;delete _modelRequests[provider];}
 }
}

// Provider-specific request formats; no credentials or prompts are persisted here.
async function workshopCloudRequest(provider,key,model,sys,usr,signal,expectJson) {
 let url,headers,body;
 if(provider==='anthropic') {
  url='https://api.anthropic.com/v1/messages'; headers=anthropicHeaders(key);
  body={model,max_tokens:16384,system:sys,messages:[{role:'user',content:usr}]};
 } else if(provider==='openai') {
  url='https://api.openai.com/v1/responses';headers={'Content-Type':'application/json','Authorization':'Bearer '+key};
  body={model,instructions:sys,input:usr,max_output_tokens:16384,store:false};
  if(expectJson)body.text={format:{type:'json_object'}};
 } else throw new Error('지원하지 않는 공급자입니다.');
 const response=await fetch(url,{method:'POST',headers,signal,body:JSON.stringify(body)});
 const data=await response.json();
 if(!response.ok)throw new Error('HTTP '+response.status+': '+String(data.error?.message || 'API 요청 실패').split(key).join('[redacted]'));
 let text,finish,tokens;
 if(provider==='anthropic') {
  finish=data.stop_reason;
  text=(data.content || []).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  tokens={input:data.usage?.input_tokens,output:data.usage?.output_tokens,total:(data.usage?.input_tokens || 0)+(data.usage?.output_tokens || 0)};
  if(!['end_turn','stop_sequence'].includes(finish))throw new Error('Claude 응답이 완료되지 않았습니다: '+(finish || 'unknown'));
 } else {
  finish=data.status;
  text=(data.output || []).filter(o=>o.type==='message').flatMap(o=>o.content || []).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');
  tokens={input:data.usage?.input_tokens,output:data.usage?.output_tokens,total:data.usage?.total_tokens};
  if(finish!=='completed')throw new Error('OpenAI 응답이 완료되지 않았습니다: '+(data.incomplete_details?.reason || finish || 'unknown'));
 }
 if(!text?.trim())throw new Error('텍스트 응답이 없습니다. 모델의 거절 응답 또는 출력 제한을 확인하세요.');
 return {response:text,finishReason:finish,tokens};
}

document.addEventListener('DOMContentLoaded',()=>{
 for(const provider of Object.keys(WORKSHOP_MODELS)) {
  const prefix=WORKSHOP_PROVIDER_UI[provider], select=document.getElementById(prefix+'-mdl'), key=document.getElementById(prefix+'-key');
  workshopModelOptions(provider,null,S.models[provider]);
  document.getElementById('models-refresh-'+provider).addEventListener('click',()=>refreshWorkshopModels(provider));
  key.addEventListener('input',()=>{ S.keys[provider]='';try{sessionStorage.removeItem('ont_key_'+provider);}catch{} resetWorkshopModelAccess(provider); });
  key.addEventListener('change',()=>{if(key.value.trim())refreshWorkshopModels(provider);});
  select.addEventListener('change',()=>{
   S.models[provider]=select.value;
   try{localStorage.setItem('ont_mdl_'+provider,select.value);}catch{}
   document.getElementById('apdot-'+provider).style.display='none';
   document.getElementById('ao-'+prefix).classList.remove('live');
  });
 }
});
