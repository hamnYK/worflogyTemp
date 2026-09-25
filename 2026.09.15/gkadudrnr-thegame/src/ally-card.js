import {ROLES} from './rules.js';
import {portrait} from './ui-art.js';
import {symbol,apPips} from './symbols.js';
import {unitStatus} from './unit-status.js';
import {unitCapacity} from './supplies.js';
import {WATCH_SIDES} from './watch-direction.js';
export function allyCard(state,a,i=0){return `<button class="unit-card shared-unit-card ${a.id===state.selected?'selected':''} ${a.downed?'incapacitated':a.hp<=0?'dead':''}" data-unit="${a.id}" ${a.hp<=0?'disabled':''}><span class="unit-num">0${i+1}</span>${portrait(a.role,state.faction)}<div><strong>${a.name}${state.carrier===a.id?' '+symbol('memory')+' 운반 중':''}</strong><small>${a.downed?'전투 불능 · 복구 '+a.downed.remaining+'턴':ROLES[a.role].name}</small><div class="hp"><i style="width:${a.hp/a.maxHp*100}%"></i></div><span class="unit-meta">${a.hp} / ${a.maxHp} HP <b>${a.watch?(WATCH_SIDES[a.watchSide]??'정면')+' 경계':apPips(a.ap)}</b></span><span class="unit-condition">${unitStatus(a).label}<span class="charge-meter" role="img" aria-label="충전 ${a.supplies.charge}/${unitCapacity(state,a)}">${Array.from({length:unitCapacity(state,a)},(_,i)=>`<i class="${i<a.supplies.charge?'filled':''}" aria-hidden="true"></i>`).join('')}<b>${a.supplies.charge}/${unitCapacity(state,a)}</b></span></span></div></button>`;}
