const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{chromium}=require('../tmp/claw-check/node_modules/playwright');
(async()=>{const root=path.resolve(__dirname,'..'),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:412,height:914},isMobile:true,hasTouch:true});await page.route(/^https?:/,r=>r.abort());await page.goto(pathToFileURL(path.join(root,'nia-worflogy-tool.html')).href);
await page.evaluate(()=>{hideLicenseGate();closeLanding();});
const fixture=fs.readFileSync(path.join(__dirname,'workshop-review-qa.cjs'),'utf8').split("S.scenarios=")[1].split("const div=")[0];await page.evaluate("S.scenarios="+fixture);
const report=[];
for(let n=1;n<=10;n++){
await page.evaluate(n=>goStep(n),n);await page.waitForTimeout(100);
report.push(await page.evaluate(n=>{
const host=document.querySelector('.panel.active');const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
const describe=e=>({tag:e.tagName,id:e.id,cls:typeof e.className==='string'?e.className.slice(0,70):'',text:(e.textContent||'').trim().slice(0,36),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)});
return {step:n,width:document.documentElement.scrollWidth,overflow:[...host.querySelectorAll('*')].filter(visible).filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(describe),small:[...host.querySelectorAll('input:not([type=hidden]),select,button')].filter(visible).filter(e=>e.getBoundingClientRect().height<40||e.getBoundingClientRect().width<36).slice(0,15).map(describe)};
},n));if([4,6,7,8,9].includes(n))await page.screenshot({path:path.join(root,'output/mobile-before-'+n+'.png')});
}
console.log(JSON.stringify(report,null,2));fs.writeFileSync(path.join(root,'output/workshop-mobile-probe.json'),JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

