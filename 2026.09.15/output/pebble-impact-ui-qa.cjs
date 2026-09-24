const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alchera/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':/\.css$/.test(file)?'text/css':'text/html; charset=utf-8');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');
 await p.evaluate(async()=>{
  const {PebbleSurface}=await import('/js/pebble-physics.mjs'),{PebbleTerritory}=await import('/js/pebble-territory-rules.mjs'),{mountPebbleTerritory}=await import('/js/pebble-territory.mjs');
  PebbleSurface.prototype.generate=()=>[{id:0,x:330,y:320,radius:30,rotation:0},{id:1,x:530,y:160,radius:25,rotation:1},{id:2,x:640,y:500,radius:33,rotation:2}];
  const commit=PebbleSurface.prototype.commit,shoot=PebbleTerritory.prototype.shoot;
  PebbleSurface.prototype.commit=function(flight){commit.call(this,flight);window.lastImpact={hits:flight.hits.length,end:flight.end,rock:this.obstacles[0],trails:this.trails.length,points:flight.path.length};};
  PebbleTerritory.prototype.shoot=function(end,trace){window.resolvedTrace=trace.length;return shoot.call(this,end,trace);};
  const host=document.createElement('div');host.className='coin-arcade';host.style.cssText='position:fixed;inset:0;z-index:9999;padding:24px';document.body.append(host);
  window.handle=mountPebbleTerritory(host,{onExit(){window.handle.dispose();host.remove();}});
 });
 await p.locator('.chip-power').fill('100');await p.locator('.chip-power').dispatchEvent('input');await p.locator('.pebble-fire').click();
 await p.waitForFunction(()=>window.lastImpact);const result=await p.evaluate(()=>({...window.lastImpact,resolved:window.resolvedTrace}));
 assert(result.hits>0);assert(Math.hypot(result.rock.x-330,result.rock.y-320)>2);assert(result.trails>=2);assert.equal(result.resolved,result.points);
 await p.locator('.pebble-game .chip-viewport').screenshot({path:'output/pebble-impact.png'});
 await p.locator('.chip-back').click();assert.deepEqual(errors,[]);console.log('PASS: rendered collision, displaced obstacle, both persistent trails, actual trajectory passed to territory rules, clean disposal.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
