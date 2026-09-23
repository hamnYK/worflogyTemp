const assert=require('assert'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const snapshot=()=>page.locator('.wf-card--glass').evaluateAll(cards=>cards.map(card=>{
 const c=getComputedStyle(card),t=getComputedStyle(card.querySelector('.wf-card__title')),a=getComputedStyle(card.querySelector('.wf-card__action,.wf-card__status'));
 return {surface:c.backgroundImage,border:c.borderColor,blur:c.backdropFilter,padding:c.padding,radius:c.borderRadius,gap:c.gap,size:t.fontSize,weight:t.fontWeight,font:t.fontFamily,color:t.color,actionSize:a.fontSize,actionHeight:a.minHeight};
}));
await page.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);
await page.locator('body > .section-elevator > .arcade-open').click();await page.waitForTimeout(1200);
const production=await snapshot();assert.equal(production.length,2);
for(const card of production){assert.equal(card.padding,'24px');assert.equal(card.radius,'6px');assert.equal(card.gap,'12px');assert.equal(card.size,'24px');assert.equal(card.weight,'700');assert.equal(card.blur,'blur(8px)');assert.equal(card.actionHeight,'44px');}
await page.screenshot({path:'output/glass-arcade-desktop.png'});
await page.setViewportSize({width:390,height:844});assert(await page.locator('.coin-arcade').evaluate(e=>e.scrollWidth<=innerWidth));await page.screenshot({path:'output/glass-arcade-mobile.png'});
await page.keyboard.press('Tab');await page.locator('.arcade-play').focus();assert.equal(await page.locator('.arcade-play').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
await page.keyboard.press('Enter');await page.waitForSelector('.chip-game[data-phase="ready"]');
await page.goto(pathToFileURL(path.join(process.cwd(),'design-system.html')).href);
assert.deepEqual(await snapshot(),production);
await page.locator('#ds-glass-play').click();assert((await page.locator('#ds-glass-status').innerText()).includes('PLAY'));
await page.setViewportSize({width:1440,height:1000});await page.locator('.ds-glass-stage').screenshot({path:'output/glass-system-examples.png'});
const cdp=await page.context().newCDPSession(page);
await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
for(const card of await snapshot()){assert.equal(card.surface,'none');assert.equal(card.blur,'none');}
await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
for(const card of await snapshot())assert.equal(card.surface,'none');
// Composite every gradient segment over bright and dark backgrounds.
const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const palettes=[[[15,60,58,.78],[8,35,40,.66],[27,91,78,.82]],[[42,54,82,.78],[16,36,52,.68]]];
let minimum=Infinity;for(const stops of palettes)for(let j=1;j<stops.length;j++)for(let i=0;i<=100;i++)for(const bg of [0,255]){
const f=i/100,a=stops[j-1],b=stops[j],alpha=a[3]*(1-f)+b[3]*f;
const rgb=[0,1,2].map(k=>(a[k]*a[3]*(1-f)+b[k]*b[3]*f)+bg*(1-alpha));
minimum=Math.min(minimum,1.05/(lum(rgb)+.05));}
assert(minimum>=4.5);assert.deepEqual(errors,[]);
console.log('PASS: shared production/specimen styles, desktop/mobile, keyboard PLAY, reduced transparency, forced colors; minimum white-text contrast '+minimum.toFixed(2)+':1.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});