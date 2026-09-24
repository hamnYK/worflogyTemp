const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await browser.newPage({viewport:{width:1210,height:900}});await p.addInitScript(()=>Math.random=()=>.123);
await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.locator('body > .section-elevator > .arcade-open').click();await p.locator('.arcade-pebble-play').click();await p.locator('.pebble-game canvas').waitFor();await p.waitForTimeout(300);
const canvas=p.locator('.pebble-game canvas'),position=()=>canvas.evaluate(e=>[+e.dataset.stoneX,+e.dataset.stoneY]);
const initial=await position();await p.locator('[data-camera="in"]').click();await p.locator('[data-camera="left"]').click();assert.notDeepEqual(await position(),initial);
await p.locator('[data-camera="home"]').click();assert.deepEqual(await position(),initial);
await p.locator('.pebble-game').screenshot({path:'output/pebble-default-desktop.png'});
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.locator('[data-camera="home"]').click();await p.locator('.pebble-game').screenshot({path:'output/pebble-default-mobile.png'});
const r=await canvas.boundingBox(),[x,y]=await position();assert(x>r.x&&x<r.x+r.width&&y>r.y&&y<r.y+r.height);
console.log('PASS: initial view equals reset after zoom/orbit; mobile stone remains visible.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
