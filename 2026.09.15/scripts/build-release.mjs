/* Create a clean, additive release candidate; never deploy or delete files. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'tmp','release-'+Date.now());fs.mkdirSync(out,{recursive:true});
const files=['index.html','en.html','nia-ontology-workshop-with-worflogy.html','robots.txt','sitemap.xml','CNAME','.nojekyll','lib/phaser.min.js','lib/mammoth.browser.min.js','lib/vis-network.min.js','lib/workshop-safety.js','lib/PHASER-LICENSE.txt','lib/THREE-LICENSE.txt','lib/CANNON-LICENSE.txt'];
function collect(dir){for(const item of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const relative=path.join(dir,item.name);if(item.isSymbolicLink())throw new Error('Symbolic links are not allowed: '+relative);if(item.name.startsWith('.'))continue;if(item.isDirectory())collect(relative);else if(/\.(css|js|woff2|png|jpe?g|svg|webp|ico|txt|mp4|mp3)$/i.test(item.name))files.push(relative);}}
for(const dir of ['css','js','assets'])collect(dir);
for(const f of files){const target=path.join(out,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,f),target);}
if(process.argv.includes('--json'))console.log(JSON.stringify({directory:out,files:files.length}).replace(/[^\x00-\x7f]/g, char => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")));
else {console.log('Release candidate: '+out);console.log(files.length+' files. No deployment performed.');}
