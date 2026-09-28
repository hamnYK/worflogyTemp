const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':'text/html; charset=utf-8');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:2}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:'+server.address().port+'/robots.txt');
 await p.evaluate(()=>{document.body.innerHTML='<section class="diagram-section"><div id="host" style="width:1200px;height:800px"></div></section>';window.draws=0;window.tableFrames=0;window.originalRAF=window.requestAnimationFrame;window.requestAnimationFrame=cb=>originalRAF(time=>{tableFrames++;cb(time);});for(const type of [WebGLRenderingContext,WebGL2RenderingContext])for(const method of ['drawArrays','drawElements']){const original=type.prototype[method];type.prototype[method]=function(...a){draws++;return original.apply(this,a);};}});
 const pixel=await p.evaluate(async()=>{const T=await import('/lib/three.module.min.js'),{resizeArcadeRenderer}=await import('/js/arcade-rendering.mjs');const r=new T.WebGLRenderer();resizeArcadeRenderer(r,1600,1000);const large=r.domElement.width*r.domElement.height;resizeArcadeRenderer(r,390,600);const small=r.getPixelRatio();r.dispose();r.forceContextLoss();return {large,small};});
 assert(pixel.large<=2500000);assert.equal(pixel.small,2);console.log('Pixel budget',pixel);
 for(const name of ['triangle','pebble']){
 await p.evaluate(async name=>{const host=document.querySelector('#host');if(name==='triangle'){window.table=(await import('/js/triangle-table.mjs')).createTriangleTable(host,()=>{});}else{const canvas=document.createElement('canvas');host.append(canvas);window.table=(await import('/js/pebble-table.mjs')).createPebbleTable(canvas);}},name);
 await p.waitForTimeout(1500);const before=await p.evaluate(()=>draws),idleFrames=await p.evaluate(()=>tableFrames);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>draws),before,name+' idle draws');assert.equal(await p.evaluate(()=>tableFrames),idleFrames,name+' idle frame callbacks');
 await p.evaluate(()=>table.control('in'));await p.waitForTimeout(100);assert((await p.evaluate(()=>draws))>before,name+' camera redraw');
 await p.evaluate(()=>{table.dispose();document.querySelector('#host').innerHTML='';});console.log('PASS idle / camera / dispose',name);
 }
 for(const [script,factory]of [['farm-explorer.js','createFarmExplorer'],['spatial-explorer.js','createSpatialExplorer']]){
 await p.addScriptTag({url:'/js/'+script});
 await p.evaluate(factory=>{window.frames=0;window.hiddenForTest=false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hiddenForTest});window.originalRAF=window.originalRAF||window.requestAnimationFrame;window.requestAnimationFrame=cb=>originalRAF(time=>{frames++;cb(time);});window.explorer=window[factory](document.querySelector('#host'),{});explorer.play();},factory);
 await p.waitForTimeout(120);assert((await p.evaluate(()=>frames))>0);
 for(const action of ['offscreen','hidden','reset']){
 await p.evaluate(action=>{if(action==='offscreen')explorer.setVisible(false);if(action==='hidden'){hiddenForTest=true;document.dispatchEvent(new Event('visibilitychange'));}if(action==='reset')explorer.reset();},action);
 const count=await p.evaluate(()=>frames);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>frames),count,factory+' '+action);
 await p.evaluate(action=>{if(action==='offscreen')explorer.setVisible(true);if(action==='hidden'){hiddenForTest=false;document.dispatchEvent(new Event('visibilitychange'));}},action);
 if(action!=='reset'){await p.waitForTimeout(100);assert((await p.evaluate(()=>frames))>count,'resume '+action);}
 }
 await p.evaluate(()=>{explorer.destroy();document.querySelector('#host').innerHTML='';});console.log('PASS animation lifecycle',factory);
 }
 assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
