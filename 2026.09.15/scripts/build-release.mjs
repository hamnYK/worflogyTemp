/* Create a clean, additive release candidate; never deploy or delete files. */
import {buildNullSector,refreshLocalGame} from './build-null-sector.mjs';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game=buildNullSector();
const out=path.join(root,'tmp','release-'+Date.now());fs.mkdirSync(out,{recursive:true});
const files=['index.html','en.html','nia-ontology-workshop-with-worflogy.html','robots.txt','sitemap.xml','CNAME','.nojekyll','lib/phaser.min.js','lib/mammoth.browser.min.js','lib/vis-network.min.js','lib/workshop-safety.js','lib/PHASER-LICENSE.txt','lib/THREE-LICENSE.txt','lib/CANNON-LICENSE.txt'];
function collect(dir){for(const item of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const relative=path.join(dir,item.name);if(item.isSymbolicLink())throw new Error('Symbolic links are not allowed: '+relative);if(item.name.startsWith('.'))continue;if(item.isDirectory())collect(relative);else if(/\.(css|js|woff2|png|jpe?g|svg|webp|ico|txt|mp4|mp3)$/i.test(item.name))files.push(relative);}}
for(const dir of ['css','js','assets'])collect(dir);
function collectGame(dir){for(const item of fs.readdirSync(path.join(game.directory,dir),{withFileTypes:true})){
 const relative=path.join(dir,item.name);
 if(item.isSymbolicLink())throw new Error('Symbolic links are not allowed: '+relative);
 if(item.isDirectory())collectGame(relative);else {
  const target=path.join(out,'ns',relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(game.directory,relative),target);
  gameFiles++;
 }
}}
for(const entry of ['dist/index.html','dist/design-system.html','local/index.html','local/design-system.html']){
 if(!fs.existsSync(path.join(game.directory,entry)))throw new Error('Missing NULL SECTOR build entry: '+entry);
}
let gameFiles=0;
collectGame('dist');
collectGame('local');
for(const f of files){const target=path.join(out,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,f),target);}
refreshLocalGame(out);
if(process.argv.includes('--json'))console.log(JSON.stringify({directory:out,files:files.length+gameFiles,gameSource:game.source}).replace(/[^\x00-\x7f]/g, char => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")));
else {console.log('Release candidate: '+out);console.log((files.length+gameFiles)+' files. No deployment performed.');}
