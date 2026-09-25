import {unitStatus} from './unit-status.js';

const paths={
 normal:'M12 3 5 6v6c0 4 4 7 7 9 3-2 7-5 7-9V6Z M8.5 12l2.5 2.5 4.5-5',
 wounded:'m8 3 13 13-5 5L3 8Z M8 8h.01M12 12h.01M16 16h.01M8 16h.01M16 8h.01',
 critical:'m12 3 10 18H2Z M12 9v5 M12 17h.01',
 downed:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z',
 signal:'M8 4a9 9 0 0 0 0 16 M16 4a9 9 0 0 1 0 16 M10 8a5 5 0 0 0 0 8 M14 8a5 5 0 0 1 0 8 M12 12h.01'
};
export function statusIcon(unit,detection='identified'){
 const status=unitStatus(unit);
 const kind=detection==='signal'?'signal':unit.downed?'downed':status.percent<30?'critical':status.percent<=70?'wounded':'normal';
 return {kind,label:kind==='signal'?'미확인 신호':status.label,svg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[kind]}"/></svg>`};
}
export function updateStatusMarker(element,unit,detection='identified',selected=false){
 const icon=statusIcon(unit,detection);
 element.className=`world-label unit-status-icon status-${icon.kind} ${unit.team==='enemy'?'hostile':''} ${selected?'is-selected':''}`;
 element.innerHTML=icon.svg;element.setAttribute('role','img');element.setAttribute('aria-label',icon.label);element.dataset.unitId=unit.id;
}
