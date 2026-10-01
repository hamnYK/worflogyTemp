const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('../tmp/claw-check/node_modules/playwright');
(async()=>{const root=path.resolve(__dirname,'..'),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
try{for(const file of ['nia-worflogy-tool.html','nia-ontology-workshop-with-worflogy.html']){
const page=await browser.newPage({viewport:{width:412,height:914}});await page.route(/^https?:/,r=>r.abort());await page.goto(pathToFileURL(path.join(root,file)).href);
const result=await page.evaluate(async()=>{
hideLicenseGate();closeLanding();const assert=(v,m)=>{if(!v)throw Error(m)};
S.upperOntology={};const r={inference_id:'INF_01',condition:'Department(dept)',action:'Notified(dept)',risk_level:'LOW',cascade_rules:[],source_rules:[],conditions_detail:[],business_impact:'Example'};
let check=validateW3C({inferred_rules:[r]},'inference');assert(check.errors.length===0 && check.warnings.length===0,'Ground constant single rule rejected');
check=validateW3C({inferred_rules:[]},'inference');assert(check.valid,'Empty grounded result rejected');
r.condition='Property(?x,?y)';r.action='Conclusion(?x)';check=validateW3C({inferred_rules:[r]},'inference');assert(!check.warnings.some(w=>w.includes('DL-Safety')),'False ClassAtom requirement');
r.action='Conclusion(?z)';check=validateW3C({inferred_rules:[r]},'inference');assert(check.warnings.some(w=>w.includes('action-only variable')),'Unbound conclusion missed');
document.getElementById('ds-portal-q').value='<test & query>';await searchPortal();const a=document.querySelector('#ds-portal-results a');assert(new URL(a.href).searchParams.get('keyword')==='<test & query>','Search keyword encoding');assert(!document.querySelector('#ds-portal-results test'),'Injected HTML');
setScen.call(document.querySelector('.s3-chip'),Object.keys(SCENS)[0]);assert(document.getElementById('scen-inp').value.startsWith('[교육용 가상'),'Missing synthetic disclaimer');
return {checks:7,width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
});results.push({file,...result});await page.close();}
fs.writeFileSync(path.join(root,'output/workshop-content-qa.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
