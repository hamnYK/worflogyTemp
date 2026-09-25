import { packSave, validateSave } from './rules.js';
let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{const request=indexedDB.open('null-sector',1);request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function autosave(state){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('saves','readwrite');tx.objectStore('saves').put(packSave(state),'checkpoint');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('저장 중단'));});}
export async function loadLocal(){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('saves').objectStore('saves').get('checkpoint');r.onsuccess=()=>{try{resolve(r.result?validateSave(r.result):null);}catch(e){reject(e);}};r.onerror=()=>reject(r.error);});}
export async function exportSave(state){
  const content=JSON.stringify(packSave(state),null,2);
  if(typeof window.showSaveFilePicker === 'function'){const handle=await window.showSaveFilePicker({suggestedName:`null-sector-turn-${state.turn}.json`,types:[{description:'NULL SECTOR 세이브',accept:{'application/json':['.json']}}]});const stream=await handle.createWritable();await stream.write(content);await stream.close();return;}
  const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='null-sector-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function importSave(file){if(file.size>1024*1024)throw Error('세이브는 1 MB 이하여야 합니다.');return validateSave(JSON.parse(await file.text()));}

