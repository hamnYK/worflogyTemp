const assert=require('assert'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();await p.waitForTimeout(1200);
for(const selector of ['.arcade-play','.arcade-basketball-play','.arcade-curling-play']){
await p.locator(selector).click();const canvas=p.locator('.chip-viewport canvas');await canvas.waitFor();await p.waitForTimeout(500);await p.mouse.move(0,0);const before=await canvas.screenshot({style:'.chip-camera{visibility:hidden}'});
const r=await canvas.boundingBox();await p.mouse.move(r.x+60,r.y+70);await p.mouse.down();await p.mouse.move(r.x+190,r.y+130,{steps:8});await p.mouse.up();await p.waitForTimeout(100);
const after=await canvas.screenshot({style:'.chip-camera{visibility:hidden}'});assert(!before.equals(after),'Pan must move scene');
assert.equal(await p.locator('.chip-game').getAttribute('data-phase'),'ready');
await p.locator('[data-camera="home"]').click();await p.mouse.move(0,0);await p.waitForTimeout(100);const reset=await canvas.screenshot({style:'.chip-camera{visibility:hidden}'});assert(before.equals(reset),'Home must restore original framing');
await p.mouse.move(r.x+60,r.y+70);await p.mouse.down({button:'right'});await p.mouse.move(r.x+160,r.y+110,{steps:6});await p.mouse.up({button:'right'});await p.waitForTimeout(100);assert(!before.equals(await canvas.screenshot({style:'.chip-camera{visibility:hidden}'})),'Right drag must orbit');
await p.locator('.chip-back').click();
}
assert.deepEqual(errors,[]);console.log('PASS: all three games pan on left drag, orbit on right drag, restore framing on reset, and do not launch from empty space.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
