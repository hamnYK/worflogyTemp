const {chromium}=require('../tmp/claw-check/node_modules/playwright');
const {pathToFileURL}=require('url');
const fs=require('fs'), path=require('path'), assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try{for(const filename of process.argv.slice(2).length?process.argv.slice(2):['nia-worflogy-tool.html','nia-ontology-workshop-with-worflogy.html']){
  const page=await browser.newPage({viewport:{width:412,height:914}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,r=>r.abort());
  await page.goto(pathToFileURL(path.join(root,filename)).href);
  const report=await page.evaluate(async()=>{
   const checks=[];
   function ok(v,m){if(!v)throw new Error(m);checks.push(m);}
   hideLicenseGate();closeLanding();goStep(1);
   let requests=[],mode='all',pageNo=0;
   window.fetch=async(url,options={})=>{
    const u=new URL(url), body=options.body?JSON.parse(options.body):null;
    requests.push({host:u.host,path:u.pathname,query:u.search,body,headers:options.headers});
    if(mode==='unauthorized')return new Response('{}',{status:401});
    if(u.pathname.endsWith('/models')){
     let p=u.host.includes('google')?'gemini':u.host.includes('anthropic')?'anthropic':'openai';
     let ids=WORKSHOP_MODELS[p].map(([id])=>id);
     if(mode==='subset')ids=ids.slice(1,3);
     if(p==='gemini')return Response.json({models:ids.map(id=>({name:'models/'+id,supportedGenerationMethods:['generateContent']})).concat([{name:'models/embedding-only',supportedGenerationMethods:['embedContent']}])});
     if(p==='anthropic' && mode==='pages'){
      pageNo++;return Response.json({data:ids.slice(pageNo===1?0:2,pageNo===1?2:5).map(id=>({id})),has_more:pageNo===1,last_id:ids[1]});
     }
     return Response.json({data:ids.map(id=>({id}))});
    }
    if(u.pathname==='/v1/messages')return Response.json({content:[{type:'thinking',thinking:'hidden'},{type:'text',text:'{"ok":true}'}],stop_reason:mode==='truncated'?'max_tokens':'end_turn',usage:{input_tokens:20,output_tokens:10}});
    if(u.pathname==='/v1/responses')return Response.json({status:mode==='truncated'?'incomplete':'completed',output:[{type:'reasoning'},{type:'message',content:[{type:'output_text',text:'{"ok":true}'}]}],usage:{input_tokens:20,output_tokens:10,total_tokens:30}});
    if(u.pathname.endsWith(':generateContent'))return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'hidden'},{text:'{"ok":'},{text:'true}'}]}}]});
    if(u.pathname==='/v1/chat/completions')return Response.json({choices:[{message:{content:'{"ok":true}'},finish_reason:'stop'}]});
    throw new Error('Unexpected mock URL '+u.pathname);
   };
   for(const p of ['gemini','openai','anthropic']){
    const prefix=WORKSHOP_PROVIDER_UI[p];selAPI(p);
    ok(document.getElementById(prefix+'-cfg').style.display==='block',p+' tab');
    ok(document.getElementById(prefix+'-mdl').options.length===5,p+' five recommendations');
    document.getElementById(prefix+'-key').value='fixture-key-'+p;
    const before=requests.length;await refreshWorkshopModels(p);
    ok(requests.slice(before).every(r=>!r.body),p+' discovery makes no generation requests');
    ok(_modelVisibility[p]?.size===5,p+' model listing');
    await saveKey();
    ok(document.getElementById('api-st').textContent.includes('연결 성공'),p+' save and test');
    ok(sessionStorage.getItem('ont_key_'+p)==='fixture-key-'+p,p+' session storage');
    ok(!localStorage.getItem('ont_key_'+p),p+' no persistent key');
    const text=await callLLM('Return JSON.','test','fixture',{expectJson:true});
    ok(JSON.parse(text).ok===true,p+' JSON response');
   }
   const ar=requests.find(r=>r.path==='/v1/messages');
   ok(ar.headers['x-api-key']==='fixture-key-anthropic' && ar.headers['anthropic-dangerous-direct-browser-access']==='true','Claude authentication and browser headers');
   ok(ar.body.system && ar.body.messages[0].role==='user' && !('temperature' in ar.body),'Claude request shape');
   const or=requests.find(r=>r.path==='/v1/responses');
   ok(or.body.store===false && !('temperature' in or.body) && or.body.max_output_tokens===16384,'OpenAI compatible parameters');
   ok(requests.filter(r=>r.host.includes('google')).every(r=>!r.query.includes('key=')),'Gemini key never in URL');
   mode='subset';await refreshWorkshopModels('openai');
   ok(document.querySelectorAll('#o-mdl optgroup')[0].children.length===2,'Available subset only');
   ok(document.getElementById('o-mdl').value==='gpt-6.1-sol','Previous selection retained explicitly');
   mode='unauthorized';await refreshWorkshopModels('openai');
   ok(!_modelVisibility.openai && document.getElementById('models-status-openai').textContent.includes('401'),'Failed discovery not verified');
   mode='pages';await refreshWorkshopModels('anthropic');ok(pageNo===2 && _modelVisibility.anthropic.size===5,'Claude pagination');
   const mockFetch=window.fetch;let release;
   window.fetch=()=>new Promise(resolve=>{release=()=>resolve(Response.json({data:[{id:'stale-model'}]}));});
   const stale=refreshWorkshopModels('openai');
   window.fetch=mockFetch;mode='all';await refreshWorkshopModels('openai');
   release();await stale;
   ok(_modelVisibility.openai.size===5 && !_modelVisibility.openai.has('stale-model'),'Stale discovery cannot overwrite new list');
   mode='truncated';selAPI('anthropic');
   let rejected=false;try{await callLLM('sys','test');}catch{rejected=true;}ok(rejected,'Claude truncation rejected');
   selAPI('openai');rejected=false;try{await callLLM('sys','test');}catch{rejected=true;}ok(rejected,'OpenAI truncation rejected');
   mode='all';selAPI('local');S.models.local='fixture-local';
   ok(JSON.parse(await callLLM('sys','test')).ok,'Local compatibility retained');
   selAPI('anthropic');document.getElementById('a-key').value='fixture-key-updated';document.getElementById('a-key').dispatchEvent(new Event('input'));
   ok(!S.keys.anthropic && !sessionStorage.getItem('ont_key_anthropic') && !_modelVisibility.anthropic,'Edited key invalidates prior credentials');
   document.getElementById('a-key').value='fixture-key-anthropic';await saveKey();
   return {checks,width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  await page.reload();
  const restored=await page.evaluate(()=>({provider:S.provider,claude:!!S.keys.anthropic,gemini:!!S.keys.gemini,openai:!!S.keys.openai,model:S.models.anthropic}));
  assert.deepEqual(restored,{provider:'anthropic',claude:true,gemini:true,openai:true,model:'claude-sonnet-5-5'});
  await page.evaluate(()=>{hideLicenseGate();closeLanding();goStep(1);document.getElementById('a-cfg').scrollIntoView();});
  await page.waitForTimeout(700);
  await page.screenshot({path:path.join(__dirname,filename.replace('.html','-providers.png'))});
  await page.evaluate(()=>{document.getElementById('clear-api-keys-btn').click();if(['gemini','openai','anthropic'].some(p=>S.keys[p]||sessionStorage.getItem('ont_key_'+p)))throw new Error('Clear keys failed');});
  assert.deepEqual(errors,[]);
  results.push({filename,...report,restored:true,cleared:true,errors});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(__dirname,'workshop-provider-qa.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
