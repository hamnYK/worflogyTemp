import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {refreshLocalGame} from './build-null-sector.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const release=path.resolve(process.argv[2]);
assert(release.startsWith(path.join(root,'tmp')+path.sep));
const previous=fs.readFileSync(path.join(root,'ns/dist/index.html'));
const sentinel=path.join(root,'ns/dist/deleted-file-qa.txt');
fs.writeFileSync(sentinel,'obsolete output');
refreshLocalGame(release);
assert(!fs.existsSync(sentinel),'Old output must disappear from ns');
assert.deepEqual(fs.readFileSync(path.join(root,'ns/dist/index.html')),previous);
const failed=spawnSync(process.execPath,[path.join(root,'scripts/build-release.mjs'),'--json'],{
 cwd:root,encoding:'utf8',env:{...process.env,NULL_SECTOR_SOURCE:path.join(root,'tmp','missing-source-qa')}
});
assert.notEqual(failed.status,0);
assert.match(failed.stderr,/NULL SECTOR source missing/);
assert.deepEqual(fs.readFileSync(path.join(root,'ns/dist/index.html')),previous);
assert(!fs.existsSync(path.join(release,'gkadudrnr-thegame')));
assert(!fs.existsSync(path.join(release,'ns/src')));
for(const entry of ['dist/index.html','local/index.html','dist/design-system.html','local/design-system.html']){
 assert(fs.existsSync(path.join(release,'ns',entry)));
}
console.log('PASS: obsolete output removed, missing external source fails closed, previous ns preserved, release contains ns artifacts only.');
