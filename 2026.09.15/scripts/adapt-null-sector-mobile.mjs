import fs from 'node:fs';
import path from 'node:path';
export function adaptNullSectorMobile(directory){
 for(const entry of ['dist/index.html','local/index.html']){
  const file=path.join(directory,entry),html=fs.readFileSync(file,'utf8');
  if(html.includes('null-sector-mobile.js'))continue;
  if(!html.includes('</body>'))throw new Error('NULL SECTOR HTML structure changed: '+entry);
  fs.writeFileSync(file,html.replace('</body>','<link rel="stylesheet" href="../../css/null-sector-mobile.css"><script defer src="../../js/null-sector-mobile.js"></script></body>'));
 }
}
