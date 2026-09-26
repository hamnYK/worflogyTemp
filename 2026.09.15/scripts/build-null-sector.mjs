import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function buildNullSector(){
 const config=JSON.parse(fs.readFileSync(path.join(root,'null-sector.config.json'),'utf8'));
 const source=path.resolve(process.env.NULL_SECTOR_SOURCE || config.source);
 const websiteWithinSource=path.relative(source,root);
 if(!websiteWithinSource||(!websiteWithinSource.startsWith('..'+path.sep)&&websiteWithinSource!=='..'&&!path.isAbsolute(websiteWithinSource)))throw new Error('The game source must not contain the website directory.');
 for(const entry of ['package.json','package-lock.json','src','scripts','index.html']){
  if(!fs.existsSync(path.join(source,entry)))throw new Error(`NULL SECTOR source missing: ${path.join(source,entry)}`);
 }
 const staging=path.join(root,'tmp');fs.mkdirSync(staging,{recursive:true});
 const work=fs.mkdtempSync(path.join(staging,'ns-build-'));
 // Snapshot only source, never reuse old build output or alter the development folder.
 const excluded=new Set(['node_modules','dist','local','output','tmp','backups','reports','.git','.codex','.agents']);
 fs.cpSync(source,work,{recursive:true,filter(file){
  const relative=path.relative(source,file);
  if(!relative)return true;
  const parts=relative.split(path.sep);
  if(excluded.has(parts[0]))return false;
  if(fs.lstatSync(file).isSymbolicLink())throw new Error('Source links are not allowed: '+file);
  return true;
 }});
 // Keep the homepage handshake in the build adapter, not in the development source.
 const entry=path.join(work,'src','main.js');
 const main=fs.readFileSync(entry,'utf8');
 if(!main.includes('null-sector-ready')){
  if(!main.includes('window.__game=')||!main.includes('await createScene('))throw new Error('Game initialization changed; update the homepage readiness adapter.');
  fs.appendFileSync(entry,'\nif(window.parent!==window)window.parent.postMessage({type:window.__game?"null-sector-ready":"null-sector-error"},"*");\n');
 }
 function npm(args){
  const options={cwd:work,encoding:'utf8',maxBuffer:32*1024*1024};
  const result=process.platform==='win32'
   ?spawnSync('npm.cmd '+args.join(' '),{...options,shell:true})
   :spawnSync('npm',args,options);
  if(result.status!==0)throw new Error('NULL SECTOR '+args[0]+' failed: '+(result.error?.message||result.stderr||result.stdout));
 }
 console.error('Building NULL SECTOR from: '+source);
 npm(['ci','--include=dev','--no-audit','--no-fund']);
 npm(['run','build']);
 for(const entry of ['dist/index.html','dist/design-system.html','local/index.html','local/design-system.html']){
  if(!fs.existsSync(path.join(work,entry)))throw new Error('Missing NULL SECTOR build entry: '+entry);
 }
 return {directory:work,source};
}

export function refreshLocalGame(release){
 const target=path.join(root,'ns');
 const backup=path.join(root,'tmp','ns-previous-'+Date.now());
 const next=path.join(release,'ns');
 if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw new Error('ns must not be a filesystem link');
 // All rename targets are fixed beneath the website root. Retain the previous build.
 const hadTarget=fs.existsSync(target);
 if(hadTarget)fs.renameSync(target,backup);
 try{fs.cpSync(next,target,{recursive:true});}
 catch(error){
  if(fs.existsSync(target))fs.renameSync(target,path.join(root,'tmp','ns-incomplete-'+Date.now()));
  if(hadTarget)fs.renameSync(backup,target);
  throw error;
 }
}
