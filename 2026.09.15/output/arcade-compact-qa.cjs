const path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();await p.waitForTimeout(1200);
await p.screenshot({path:'output/arcade-compact-desktop.png'});
console.log(await p.locator('.arcade-cards').evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns,cards:[...el.children].map(c=>({width:c.offsetWidth,height:c.offsetHeight,title:getComputedStyle(c.querySelector('h2')).fontSize,action:c.querySelector('button').offsetHeight}))})));
await p.locator('.arcade-cards').evaluate(el=>{const card=el.firstElementChild;for(let i=0;i<9;i++)el.append(card.cloneNode(true));});
for(const width of [1440,768,390]){
await p.setViewportSize({width,height:1000});await p.waitForTimeout(150);
console.log(await p.locator('.arcade-cards').evaluate(el=>({viewport:innerWidth,columns:getComputedStyle(el).gridTemplateColumns,count:el.children.length,overflow:el.scrollWidth>el.clientWidth})));
}
await p.screenshot({path:'output/arcade-compact-mobile.png'});
}finally{await b.close();}})();
