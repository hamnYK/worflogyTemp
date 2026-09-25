import {enemyIntel} from './enemy-intel.js';
import {directlyVisible} from './rules.js';
import {portrait,actionIcon} from './ui-art.js';
import {statusIcon} from './status-icon.js';
import {unitStatus} from './unit-status.js';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// One common silhouette: undisclosed roles never change its shape or equipment.
function silhouette(unknown,faction){return `<span class="contact-portrait ${unknown?'unknown':'trooper'} ${faction}" aria-hidden="true"><svg viewBox="0 0 64 80"><path class="contact-shadow" d="M4 80 9 54 23 47 23 39 18 29 20 12 30 5 43 12 46 29 40 40 40 47 55 54 62 80Z"/><path class="contact-facet" d="m20 13 10-8 13 7-5 8-16 4Zm3 34 9 10 8-10 15 7-10 9 4 17H15l5-19-11-7Z"/>${unknown?'<path class="contact-scan" d="M4 28h56M4 44h56M4 60h56"/><path class="contact-brackets" d="M8 20V6h12M44 6h12v14M8 64v10h12M44 74h12V64"/>':'<path class="contact-mask" d="m21 25 20-1-3 13-7 6-7-7Z"/><path class="contact-visor" d="m20 22 23-2-2 8-18 1Z"/>'}</svg></span>`;}
export function enemyCard(state,e){
 const known=directlyVisible(state,e),info=enemyIntel(state,e),faction=state.faction==='human'?'ai':'human';
 const specialist=state.encounterVersion===2&&Number(e.id.slice(1))<4;
 const icon=statusIcon(e,known?'identified':'signal'),status=unitStatus(e),observed=known&&!!e.observedLaser;
 const face=known&&specialist?portrait(e.role,faction):silhouette(!known,faction);
 return `<button class="enemy-card contact-card shared-enemy-card ${known?'identified':'unidentified'} ${observed?'observed':''}" data-target="${e.id}">
 <span class="contact-stage" role="img" aria-label="${info.stage}" title="${info.stage}">${actionIcon(known?'watch':'skill',0)}</span>
 <span class="contact-identity">${face}<span class="contact-copy"><strong>${escape(info.name)}</strong><small>${escape(info.type)}</small>
 ${known?`<span class="contact-health" role="img" aria-label="HP ${e.hp}/${e.maxHp}"><i style="width:${status.percent}%"></i></span><span class="contact-condition" aria-label="${escape(status.label)}">${icon.svg}<span>${e.downed?'복구 '+e.downed.remaining+'턴':escape(status.label)}</span></span>`:'<span class="contact-health unknown-health" aria-hidden="true"></span><small class="contact-unknown">상태 미확인</small>'}</span></span>
 <span class="contact-ability ${observed?'confirmed':''}" role="img" aria-label="${observed?'레이저 사격 확인':'능력 미확인'}" title="${observed?'레이저 사격 확인':'능력 미확인'}">${observed?actionIcon('shoot',0):'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>'}</span></button>`;
}
