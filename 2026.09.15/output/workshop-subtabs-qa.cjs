const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{chromium}=require('../tmp/claw-check/node_modules/playwright');
(async()=>{const root=path.resolve(__dirname,'..'),b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await b.newPage({viewport:{width:412,height:914}});await p.route(/^https?:/,r=>r.abort());await p.goto(pathToFileURL(path.join(root,process.argv[2]||'nia-worflogy-tool.html')).href);await p.evaluate(()=>{hideLicenseGate();closeLanding();});
const fixture=fs.readFileSync(path.join(__dirname,'workshop-review-qa.cjs'),'utf8').split('S.scenarios=')[1].split('const div=')[0];await p.evaluate('S.scenarios='+fixture);
const report=[];
for(const [step,fn,tabs] of [[4,'switchInnerTab',['triple','classes','rule','constraints','raw','gui','diagram']],[5,'switchUpperTab',['classes','links','raw','gui','diagram']],[6,'switchInfTab',['raw','gui','diagram']],[7,'switchS7Tab',['graph','query']],[9,'switchIntTab',['export','python','langchain','sparql','rest','security']],[10,'switchA10Tab',[1,2,3,4,5,6,7]]]){
for(const tab of tabs){await p.evaluate(({step,fn,tab})=>{goStep(step);window[fn](...(step===4?[1,tab]:[tab]));},{step,fn,tab});await p.waitForTimeout(80);
report.push(await p.evaluate(({step,tab})=>{
const host=document.querySelector('.panel.active'),bad=[];
for(const e of host.querySelectorAll('input,textarea,select,button')){
 const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
 let clipped=false;for(let a=e.parentElement;a&&a!==host;a=a.parentElement){const st=getComputedStyle(a);if(['auto','scroll'].includes(st.overflowX)){clipped=true;break;}}
 if(!clipped&&(r.right>innerWidth+2||r.left< -2))bad.push({id:e.id,text:(e.textContent||e.placeholder||'').slice(0,35),right:r.right,width:r.width});
}return {step,tab,page:document.documentElement.scrollWidth,bad};
},{step,tab}));}}
fs.writeFileSync(path.join(__dirname,'workshop-subtabs-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.filter(x=>x.bad.length||x.page>412),null,2));console.log('Checked '+report.length+' sub-tabs');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

