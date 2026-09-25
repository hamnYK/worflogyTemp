import {build} from 'vite';
import {fileURLToPath} from 'node:url';
import {gameEntry} from './game-entry.mjs';

// Inline every resource so file:// needs neither a server nor module fetches.
for(const [index,page] of ['index.html','design-system.html'].entries()){
 await build({
  configFile:false,
  root:fileURLToPath(new URL('../',import.meta.url)),
  base:'./',
  build:{
   target:'es2022',outDir:'local',emptyOutDir:index===0,
   assetsInlineLimit:()=>true,cssCodeSplit:false,modulePreload:false,
   rollupOptions:{input:page,output:{inlineDynamicImports:true}},
  },
  plugins:[gameEntry(),{
   name:'standalone-html',enforce:'post',
   generateBundle(_options,bundle){
    const html=bundle[page];
    if(!html||html.type!=='asset')throw Error(`Missing HTML output: ${page}`);
    const scripts=Object.values(bundle).filter(item=>item.type==='chunk');
    if(scripts.length!==1||scripts[0].imports.length||scripts[0].dynamicImports.length)throw Error('Standalone output contains external modules');
    const css=Object.values(bundle).filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
    let content=String(html.source).replace(/<script\b[^>]*src="[^"]*"[^>]*><\/script>/g,'').replace(/<link\b[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g,'');
    content=content.replace('</head>',()=>`<style>${css.replace(/<\/style/gi,'<\\/style')}</style></head>`);
    content=content.replace('</body>',()=>`<script type="module">${scripts[0].code.replace(/<\/script/gi,'<\\/script')}</script></body>`);
    html.source=content;
    for(const key of Object.keys(bundle))if(key!==page)delete bundle[key];
   },
  }],
 });
}
console.log('Open local/index.html directly in Chrome or Edge. No server required.');
