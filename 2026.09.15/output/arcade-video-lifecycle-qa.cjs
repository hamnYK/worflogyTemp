const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:process.env.MOBILE?{width:390,height:844}:{width:1440,height:1000}});
  await page.goto(pathToFileURL(path.join(process.cwd(),process.env.PAGE||'index.html')).href);
  await page.locator('body > .section-elevator > .arcade-open').click();
  await page.waitForTimeout(1500);
  await page.locator('.arcade-background-video').evaluate(v=>{window.videoEvents=[];for(const name of ['pause','playing','waiting','stalled','error'])v.addEventListener(name,()=>videoEvents.push({name,time:v.currentTime}));});
  async function playing(label){
   const video=page.locator('.arcade-background-video');
   const before=await video.evaluate(v=>v.currentTime);
   await page.waitForTimeout(1200);
   const state=await video.evaluate(v=>({time:v.currentTime,paused:v.paused,error:v.error?.message,events:window.videoEvents}));
   console.log(label,JSON.stringify({time:state.time,paused:state.paused,error:state.error}));
   assert.equal(state.paused,false,label+' is paused');
   assert.notEqual(state.time,before,label+' time did not advance');
  }
  await playing('lobby');
  for(const selector of ['.arcade-play','.arcade-basketball-play','.arcade-curling-play','.arcade-book-flip-play','.arcade-eraser-play','.arcade-ping-play']){
   await page.locator(selector).click();
   await page.waitForSelector('.chip-back');
   await playing(selector);
   await page.locator('.chip-back').click();
   await playing(selector+' return');
  }
  await page.locator('.arcade-background-video').evaluate(v=>{v.currentTime=v.duration-.5;});
  await page.waitForTimeout(2000);
  assert(await page.locator('.arcade-background-video').evaluate(v=>v.currentTime<5&&!v.paused));
  await page.locator('.arcade-close').click();
  await page.waitForFunction(()=>!document.querySelector('.coin-arcade').open);
  assert(await page.locator('.arcade-background-video').evaluate(v=>v.paused));
  await page.locator('body > .section-elevator > .arcade-open').click();
  await page.waitForTimeout(1500);
  await playing('reopened');
  console.log('PASS: video advances during all six games, every return, looping and reopening; stops on close.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
