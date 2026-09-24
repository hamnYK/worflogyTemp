
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),assert=require('assert');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage=process.argv[2]||'before';
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await b.newPage({viewport:{width:1280,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.locator('body>.section-elevator>.arcade-open').click();
for(const [name,button]of [['football','.arcade-play'],['basketball','.arcade-basketball-play'],['curling','.arcade-curling-play'],['book','.arcade-book-flip-play'],['eraser','.arcade-eraser-play'],['ping','.arcade-ping-play'],['triangle','.arcade-triangle-play'],['boxes','.arcade-boxes-play'],['pebble','.arcade-pebble-play']]){
await p.locator(button).click();await p.waitForSelector('.chip-game canvas');await p.waitForTimeout(450);
for(const width of [1280,390]){
await p.setViewportSize({width,height:1100});await p.waitForTimeout(200);
await p.locator('.chip-game').screenshot({path:'output/quality-'+stage+'-'+name+'-'+width+'.png'});
assert(await p.locator('.chip-game').evaluate(e=>e.scrollWidth<=e.clientWidth),'No horizontal overflow: '+name);
}
await p.setViewportSize({width:1280,height:1100});
const result=await p.locator('.chip-game').evaluate(e=>({width:e.clientWidth,overflow:e.scrollWidth>e.clientWidth,canvases:e.querySelectorAll('canvas').length}));assert(!result.overflow);console.log(name,JSON.stringify(result));
await p.locator('.chip-back').click();
}
assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
