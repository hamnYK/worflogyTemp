const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { pathToFileURL } = require('url');
const { chromium } = require('../tmp/claw-check/node_modules/playwright');
const root = path.resolve(__dirname, '..');
async function main() {
  const names = process.argv.slice(2);
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const results = [];
  try { for (const file of names.length ? names : ['nia-worflogy-tool.html','nia-ontology-workshop-with-worflogy.html']) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    for (const m of html.matchAll(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(m[1]);
    const page = await browser.newPage({viewport:{width:412,height:914}});
    const errors = [];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.join(root,file)).href,{waitUntil:'load'});
    await page.waitForTimeout(800);
    const checks = await page.evaluate(async () => {
      const ok = (condition, message) => { if (!condition) throw new Error(message); };
      // UI-only test fixture; never save a license or call the licensing service.
      hideLicenseGate(); closeLanding();
      const shape = {target_class:'Person',path:'name',min_count:1,severity:'sh:Violation'};
      const schema = {classes:[{label:'Person'}],properties:[{name:'name',type:'owl:DatatypeProperty',domain:'Person',range:'xsd:string'}],triples:[{subject:'p1',predicate:'name',object:'Alice'}],constraints:[shape],exception_rules:[]};
      S.combined={domain_schemas:{test:schema}};
      const type = {s:'p1',p:'rdf:type',o:'Person'};
      ok(runSHACLValidation([type,{s:'p1',p:'username',o:'Alice'}]).length===1,'Substring property false pass');
      shape.min_count=2;
      ok(runSHACLValidation([type,{s:'p1',p:'name',o:'Alice'},{s:'p1',p:'name',o:'Alice'}])[0].actual===1,'Duplicate values counted');
      shape.min_count=1;
      ok(runSHACLValidation([type,{s:'p1',p:'name',o:0}]).length===0,'Zero excluded');
      ok(runSHACLValidation([type,{s:'p1',p:'name',o:false}]).length===0,'False excluded');
      runSHACLValidation([{s:'p1',p:'rdf:type',o:'PersonExtra'}]);
      ok(S.shaclReport.checked===0 && S.shaclReport.untargeted===1,'Substring class target');
      shape.max_count=1;
      runSHACLValidation([type]); ok(S.shaclReport.skipped===1,'Unsupported constraint disguised as pass');
      delete shape.max_count;
      schema['@context']={ex:'https://example.org/'};
      shape.target_class='ex:Person'; shape.path='ex:name';
      ok(runSHACLValidation([{s:'p1',p:'rdf:type',o:'https://example.org/Person'},{s:'p1',p:'https://example.org/name',o:'Alice'}]).length===0 && S.shaclReport.checked===1,'Prefix expansion');
      const validation=validateW3C(schema,'schema');
      ok(!validation.warnings.some(t=>t.includes('domain') && t.includes('공리 위반')),'False domain violation');
      ok(getPrompt('P_EXTRACT_SCENARIO').includes('근거 보존'),'Evidence policy');
      S.customPrompts={P_EXTRACT_SCENARIO:'custom'};
      ok(getPrompt('P_EXTRACT_SCENARIO').startsWith('custom') && getPrompt('P_EXTRACT_SCENARIO').includes('근거 보존'),'Custom prompt compatibility');
      S.schemas={}; S.combined=null; S.upperOntology=null; S.infRules=null;
      const steps=[];
      for(let n=1;n<=10;n++){if(!document.getElementById('s'+n))continue; goStep(n); ok(document.getElementById('s'+n).classList.contains('active'),'Step '+n);steps.push(n);}
      S.infInstances=[]; addInstanceRow(); ok(S.infInstances.length===1,'Add ABox'); clearInstances(); ok(S.infInstances.length===0,'Clear ABox');
      // Stub only the model call, retaining the actual evaluation UI and result mapping.
      callLLM=async (sys,usr)=>{
        ok(!usr.includes('순수 LLM') && !usr.includes('온톨로지 구조화'),'Judge identities leaked');
        ok(usr.includes('END_OF_LONG_ANSWER'),'Evaluation truncated at former 800 chars');
        const answer={conclusion:'A B C <img src=x onerror=alert(1)>'};
        for(const key of ['accuracy','exception_handling','dept_routing','legal_basis']) answer[key]={A:3,B:6,C:9,comment:'A B C'};
        return JSON.stringify(answer);
      };
      await autoEval('fixture question','x'.repeat(1000)+'END_OF_LONG_ANSWER','answer A','answer B');
      ok(S.lastEvalResult?.evaluation_mode==='blinded-llm-review','Evaluation result missing');
      ok(!document.querySelector('#eval-res img'),'Unsafe evaluation markup');
      ok([S.lastEvalResult.overall_A,S.lastEvalResult.overall_B,S.lastEvalResult.overall_C].sort().join(',')==='3,6,9','Score mapping');
      S.schemas={test:schema}; S.combined={domain_schemas:{test:schema}};
      const exported=toJsonLD()['@graph'];
      ok(exported.some(n=>n['@id']==='ont:name' && n['@type']==='owl:DatatypeProperty'),'Export property type lost');
      ok(exported.some(n=>n['ont:name']?.['@value']==='Alice'),'Export literal lost');
      ok(!exported.some(n=>n['@id']==='ont:Alice' && n['@type']==='owl:Class'),'Literal exported as class');
      schema.triples.push({subject:'p1',predicate:'name',object:0});
      ok(toJsonLD()['@graph'].some(n=>n['ont:name']?.['@value']===0),'Export zero lost');
      S.infRules={inferred_rules:[{inference_id:'INF_01',inference_name:'fixture',condition:'Person(?x)',action:'review(?x)'}]};
      S.infInstances=[{s:'p1',t:'Person',p:'name',o:0}];
      callLLM=async()=>JSON.stringify({fired:[{id:'INF_01',name:'fixture',action:'review',risk:'LOW',dept:'test'}],notFired:[],derived:[],contradictions:[],reasoning:'candidate only'});
      await runLLMInference();
      ok(S.infEvidence?.mode==='llm-candidate' && !S.infEvidence.generatedInstances,'Inference mode lost');
      ok(S.infInstances[0].o===0,'Manual facts changed');
      ok(Object.keys(S.infInstanceFiredMap).length===0,'Fabricated fact provenance');
      ok(!document.getElementById('inf-run-btn').disabled,'Run button not restored');
      _persistState();
      ok(JSON.parse(localStorage.getItem('ont_schemas')).test.triples.length===2,'Schema save failed');
      goStep(8);
      return {steps,checks:23, width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
    });
    assert.deepEqual(errors,[],`${file}: page errors`);
    results.push({file,...checks,errors});
    await page.screenshot({path:path.join(__dirname,file.replace('.html','-quality.png')),fullPage:false});
    await page.close();
  }} finally {await browser.close();}
  fs.writeFileSync(path.join(__dirname,'workshop-regression.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
