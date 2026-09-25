import {packSave,validateSave} from './rules.js';
const key='null-sector-active-battle';
// Synchronous, tab-local recovery bridges reloads before IndexedDB commits.
// Persistent campaign saves remain in IndexedDB; an intentional menu exit clears this.
export function rememberBattle(state){
 if(state.phase!=='player')return;
 try{sessionStorage.setItem(key,JSON.stringify(packSave(state)));}catch{/* Storage can be unavailable; normal autosave remains active. */}
}
export function leaveBattle(){try{sessionStorage.removeItem(key);}catch{}}
export function recoverBattle(){
 try{const raw=sessionStorage.getItem(key);return raw?validateSave(JSON.parse(raw)):null;}
 catch{leaveBattle();return null;}
}
