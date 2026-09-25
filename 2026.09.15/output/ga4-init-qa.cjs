const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('js/ga4-init.js','utf8');
for(const [url,enabled] of [['https://www.worflogy.com/',true],['https://worflogy.com/en.html',true],['http://localhost:5173/',false],['http://127.0.0.1:8080/',false],['file:///C:/site/index.html',false],['https://hamnYK.github.io/worflogyTemp/',false],['https://www.worflogy.com.example.org/',false]]){
 const tags=[],context={location:new URL(url),document:{getElementById:id=>tags.find(t=>t.id===id),createElement:()=>({}),head:{append:t=>tags.push(t)}}};context.window=context;vm.createContext(context);vm.runInContext(source,context);vm.runInContext(source,context);
 assert.equal(tags.length,enabled?1:0,url);if(enabled){assert.equal(context.dataLayer.length,2);assert.equal(context.dataLayer[1][0],'config');assert.equal(context.dataLayer[1][1],'G-WN1V0G6RJ0');assert(tags[0].async);assert.equal(tags[0].src,'https://www.googletagmanager.com/gtag/js?id=G-WN1V0G6RJ0');}else assert.equal(context.dataLayer,undefined);
}
for(const file of ['index.html','en.html']){const html=fs.readFileSync(file,'utf8');assert.equal(html.split('src="./js/ga4-init.js"').length-1,1,file);assert(html.indexOf('./js/ga4-init.js')<html.indexOf('</head>'));}
console.log('PASS: existing GA4 ID, production domains only, local/file/preview excluded, duplicate initialization blocked, both generated pages retain one tag.');
