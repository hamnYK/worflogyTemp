const fs=require('fs'),{spawnSync}=require('child_process');
const release=JSON.parse(fs.readFileSync('output/null-sector-review-release.json','utf16le').replace(/^\uFEFF/,''));
const cases=[['output/null-sector-portraits-qa.cjs','--file'],['output/null-sector-portraits-qa.cjs'],['output/null-sector-design-system-qa.cjs','--verify'],['output/null-sector-entry-qa.cjs'],['output/null-sector-qa.cjs']];
const results=[];
for(const args of cases){console.log('RUN',args.join(' '));const result=spawnSync(process.execPath,args,{env:{...process.env,NULL_SECTOR_QA_ROOT:release.directory},encoding:'utf8'});console.log(result.stdout);if(result.stderr)console.error(result.stderr);results.push({test:args.join(' '),exitCode:result.status});if(result.status!==0)break;}
fs.writeFileSync('output/null-sector-review-results.json',JSON.stringify({release:release.directory,unitTests:58,results},null,2));if(results.some(r=>r.exitCode!==0))process.exitCode=1;
