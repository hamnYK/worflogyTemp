
const assert=require('assert'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.addInitScript(()=>{const Original=window.Audio;window.Audio=function(...args){const a=new Original(...args);window.testMusic=a;return a;};window.WorflogyChipFootball={mountFootball(host,opts){host.innerHTML='<button id="return-lobby">Back</button>';host.firstChild.onclick=opts.onExit;return{dispose(){}};}};});
await p.goto(pathToFileURL(path.join(process.cwd(),'index.html')).href);
await p.locator('body > .section-elevator > .arcade-open').click();await p.waitForTimeout(1400);
await p.waitForFunction(()=>testMusic.currentTime>0&&!testMusic.paused);
assert(await p.evaluate(()=>testMusic.loop&&!testMusic.muted));
await p.locator('.arcade-mute').click();assert(await p.evaluate(()=>testMusic.muted));
assert.equal(await p.locator('.arcade-mute').getAttribute('aria-pressed'),'true');
await p.locator('.arcade-mute').click();
await p.locator('.arcade-play').click();assert(await p.evaluate(()=>testMusic.paused));assert(await p.locator('.arcade-mute').isHidden());
await p.locator('#return-lobby').click();await p.waitForFunction(()=>!testMusic.paused);
await p.evaluate(()=>{testMusic.currentTime=testMusic.duration-.15;});
await p.waitForFunction(()=>testMusic.currentTime<2&&!testMusic.paused);
await p.screenshot({path:'output/lobby-music-desktop.png'});
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'output/lobby-music-mobile.png'});
const word=await p.locator('.arcade-wordmark').boundingBox(),button=await p.locator('.arcade-mute').boundingBox();
assert(word.x+word.width<=button.x);
await p.locator('.arcade-mute').click();await p.locator('.arcade-close').click();await p.waitForTimeout(1200);assert(await p.evaluate(()=>testMusic.paused));
await p.locator('body > .section-elevator > .arcade-open').click();assert(await p.evaluate(()=>testMusic.muted));
console.log('PASS: real MP3 playback/loop, mute persistence, game pause/return, close, mobile header.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
