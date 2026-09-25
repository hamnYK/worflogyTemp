export function unitStatus(unit){
 const percent=Math.max(0,Math.ceil(unit.hp/unit.maxHp*100));
 const label=unit.downed?`치명상 · 복구 ${unit.downed.remaining}턴`:percent===0?'소멸':percent<30?'치명상':percent<=70?'부상':'정상';
 return {percent,label};
}
