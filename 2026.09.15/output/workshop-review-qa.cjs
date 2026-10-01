const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {pathToFileURL}=require('url'),{chromium}=require('../tmp/claw-check/node_modules/playwright');
(async()=>{
const root=path.resolve(__dirname,'..'),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[];
try{for(const file of process.argv.slice(2).length?process.argv.slice(2):['nia-worflogy-tool.html','nia-ontology-workshop-with-worflogy.html']){
const page=await browser.newPage({viewport:{width:412,height:914}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort());await page.goto(pathToFileURL(path.join(root,file)).href);
const result=await page.evaluate(()=>{
hideLicenseGate();closeLanding();const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);};
S.scenarios=[{id:1,title:'Test',text:'Synthetic fixture'}];
S.docs=[{name:'Guide',content:'Example source evidence.',category:'test'}];
S.schemas={1:{domain:'Test',classes:[{id:'ont:Person',label:'Person',type:'owl:Class'},{id:'ont:Org',label:'Org',type:'owl:Class'},{id:'ont:Wrong',label:'Wrong',type:'owl:Class'}],
properties:[{name:'knows',type:'owl:ObjectProperty',domain:'Person',range:'Person',inverseOf:'knownBy'},{name:'knownBy',type:'owl:ObjectProperty',domain:'Person',range:'Person'},{name:'age',type:'owl:DatatypeProperty',domain:'Person',range:'xsd:integer'}],
triples:[{subject:'alice',predicate:'age',object:0,provenance:{origin:'document',document:'sample',location:'p1',quote:'age 0',status:'reviewed'}}],
constraints:[{shape_id:'PersonShape',target_class:'Person',path:'age',min_count:1,max_count:1,pattern:'extra'}],
exception_rules:[{rule_id:'RULE_01',rule_name:'Test',if:{conditions:['Person(?x)','age(?x,?v)','swrlb:greaterThanOrEqual(?v,0)']},then:'knows(?x,?x)',provenance:{origin:'document'}}],
individuals:[{label:'alice',class:'Person',id:'ont:alice'}],procedures:[{id:'P1',title:'Review',actor:'Officer',trigger:'Received',action:'Review record',next:[],rule_refs:['RULE_01']}]}};
S.upperOntology={ontology_groups:[{group_name:'G',upper_classes:[{name:'Agent',equivalent_to:'Entity',disjoint_with:['Org']},{name:'Entity'}],subclass_mappings:[{domain_class:'Person',upper_class:'Agent',domain:'Test',rationale:'Common actor',preserved_differences:'Roles vary',provenance:{origin:'user',status:'reviewed'}}]}]};
S.infRules={inferred_rules:[{inference_id:'INF_01',condition:'Person(?x)',action:'Unknown(?x)',source_rules:['RULE_01']}]};S.infInstances=[{s:'bob',t:'Person',p:'age',o:0}];S.combined=buildCombined();
const div=document.createElement('div');div.id='s4gui-1';document.body.append(div);renderGuiEditor(1);WorkshopReview.flush('Fixture');
ok(!!div.querySelector('[data-wf-review]'),'Review toolbar inserted');
S.infRules.inferred_rules.push({inference_id:'INF_02',condition:'Person(?xy)',action:'Person(?x)'},{inference_id:'INF_03',condition:'Person(42)',action:'Person(alice)'});
const data=toJsonLD(),g=data['@graph'];
ok(g.some(n=>n['owl:inverseOf']?.['@id']==='ont:knownBy'),'Inverse relation exported');
ok(g.some(n=>n['owl:equivalentClass']?.['@id']==='ont:Entity'),'Equivalent class exported');
ok(g.some(n=>n['owl:disjointWith']?.[0]?.['@id']==='ont:Org'),'Disjoint class exported');
ok(g.some(n=>n['@type']==='swrl:Imp'&&n['swrl:body']['@list'].length===3),'SWRL body structured');
ok(g.some(n=>n['@type']==='swrl:Variable'),'SWRL variables declared');
ok(WorkshopReview.lastExportReport.warnings.some(w=>w.includes('INF_01')),'Unsupported rule conversion reported');
ok(WorkshopReview.lastExportReport.warnings.some(w=>w.includes('INF_02')),'Variable names compared exactly');
ok(WorkshopReview.lastExportReport.warnings.some(w=>w.includes('INF_03')),'Literal in individual position rejected');
ok(WorkshopReview.lastExportReport.warnings.some(w=>w.includes('pattern')),'Unsupported shape field reported');
ok(g.some(n=>n['@type']==='rdf:Statement'&&n['ont:provenanceRecord']),'Triple provenance exported');
ok(g.some(n=>n['ont:rationale']==='Common actor'&&n['ont:preservedDifferences']==='Roles vary'),'Mapping rationale exported');
ok(g.some(n=>n['@type']==='ont:WorkflowStep'),'Procedure kept separate');
ok(g.some(n=>n['@id']==='ont:bob'&&n['ont:age']?.['@value']===0),'ABox zero retained');
ok(WorkshopReview.references('Person').length>=5,'Reference impact discovered');
removeClass(1,0);ok(S.schemas[1].classes.length===3,'Referenced class deletion blocked');document.getElementById('wf-review-dialog').close();
updateClass(1,0,'label','Human');ok(S.schemas[1].classes[0].label==='Person','Rename waits for reference review');
document.querySelector('#wf-review-dialog .wf-review-input').value='Human';
[...document.querySelectorAll('#wf-review-dialog button')].find(b=>b.textContent==='이름과 참조 변경').click();
ok(S.schemas[1].classes[0].label==='Human'&&S.schemas[1].properties[0].domain==='Human','Rename updates definition and domain');
ok(S.upperOntology.ontology_groups[0].subclass_mappings[0].domain_class==='Human'&&S.schemas[1].exception_rules[0].if.conditions[0]==='Human(?x)','Rename updates mapping and rule');
ok(S.infInstances[0].t==='Human'&&S.schemas[1].individuals[0].class==='Human','Rename updates instances');
const h=WorkshopReview.history(),index=h.findIndex(x=>x.label.startsWith('이름 변경:'));
ok(index>=0&&h[index].changes.length>1,'Change diff recorded');
WorkshopReview.restore(index);ok(S.schemas[1].classes[0].label==='Person'&&S.schemas[1].properties[0].domain==='Person','Snapshot restore coherent');
WorkshopReview.open(1);
return {checks,data,report:WorkshopReview.lastExportReport};
});
const checks=result.checks;
const dialog=page.locator('#wf-review-dialog');
await dialog.getByLabel('검토할 요소').selectOption({label:'클래스 · Wrong'});
await dialog.getByRole('button',{name:'클래스 → 개체로 재분류',exact:true}).click();
await page.locator('#wf-review-dialog').getByLabel('새 개체의 소속 클래스').selectOption('Person');
await page.locator('#wf-review-dialog').getByRole('button',{name:'재분류 적용',exact:true}).click();
assert(await page.evaluate(()=>S.schemas[1].individuals.some(i=>i.label==='Wrong'&&i.class==='Person')&&!S.schemas[1].classes.some(c=>c.label==='Wrong')));
checks.push('Class to individual conversion');
await page.locator('#wf-review-dialog').getByLabel('검토할 요소').selectOption({label:'개체 · Wrong'});
await page.locator('#wf-review-dialog').getByRole('button',{name:'개체 → 클래스로 재분류',exact:true}).click();
await page.locator('#wf-review-dialog').getByRole('button',{name:'재분류 적용',exact:true}).click();
assert(await page.evaluate(()=>S.schemas[1].classes.some(c=>c.label==='Wrong')&&!S.schemas[1].individuals.some(c=>c.label==='Wrong')));
checks.push('Individual to class conversion');
await page.locator('#wf-review-dialog').getByLabel('검토할 요소').selectOption({label:'속성 · knows'});
await page.locator('#wf-review-dialog').getByLabel('작성 경로',{exact:true}).selectOption('document');
await page.locator('#wf-review-dialog').getByLabel('원문 문서명',{exact:true}).fill('Guide');
await page.locator('#wf-review-dialog').getByLabel('원문 위치 (쪽·절·행 등)',{exact:true}).fill('p2');
await page.locator('#wf-review-dialog').getByRole('button',{name:'검토 내용 적용',exact:true}).click();
assert(await page.evaluate(()=>S.schemas[1].properties[0].provenance.document==='Guide'));
checks.push('Element provenance saved');
await page.locator('#wf-review-dialog').getByText('불러온 원문 대조',{exact:true}).click();
await page.locator('#wf-review-dialog').getByText('Example source evidence.',{exact:true}).waitFor({state:'visible'});
checks.push('Loaded source document preview');
await page.locator('#wf-review-dialog').getByRole('button',{name:'업무 절차 추가',exact:true}).click();
assert(await page.evaluate(()=>S.schemas[1].procedures.length===2));
checks.push('Procedure addition');
await page.evaluate(()=>WorkshopReview.mappingPanel());
await page.locator('#wf-review-dialog').getByLabel('공통화한 이유',{exact:true}).fill('Reviewed common role');
await page.locator('#wf-review-dialog').getByLabel('유지해야 할 도메인 차이',{exact:true}).fill('Different authority');
await page.locator('#wf-review-dialog').getByRole('button',{name:'매핑 검토 저장',exact:true}).click();
assert(await page.evaluate(()=>S.upperOntology.ontology_groups[0].subclass_mappings[0].rationale==='Reviewed common role'));
checks.push('Mapping rationale and differences edited');
await page.evaluate(()=>WorkshopReview.open(1));
const dims=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth,dialog:document.getElementById('wf-review-dialog').getBoundingClientRect().width,body:document.querySelector('.wf-review-body').scrollWidth}));
assert(dims.page<=dims.viewport&&dims.dialog<=dims.viewport);checks.push('412px review dialog fits');
await page.locator('#wf-review-dialog').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
await page.screenshot({path:path.join(root,'output',file.replace('.html','-review.png'))});
await page.evaluate(()=>WorkshopReview.flush('UI test'));
await page.reload();assert(await page.evaluate(()=>WorkshopReview.history().length>0));checks.push('History survives reload');
assert.equal(errors.length,0,errors.join('\n'));checks.push('No page runtime errors');
fs.writeFileSync(path.join(root,'output/workshop-semantic-export.jsonld'),JSON.stringify(result.data,null,2));
results.push({file,checks,dims});await page.close();
}
fs.writeFileSync(path.join(root,'output/workshop-review-qa.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
