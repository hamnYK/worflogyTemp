// Versioned IDs + mutable progress. No character definitions or map geometry.
const unitFields=['x','z','hp','ap','cooldown','jammed','watch','supplies','facing','watchFacing','watchSide','watchFiredTurn','downed','observedLaser'];
const progressFields=['turn','seed','scanUntil','xp','status','selected','carrier','log','turnLimit'];
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function keys(x,allowed){if(!object(x)||Object.keys(x).some(k=>!allowed.includes(k)))throw Error('지원하지 않는 저장 항목입니다.');}
const clone=x=>structuredClone(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function baseline(s,newGame){const b=newGame(s.faction,s.roster,s.agents,s.encounterVersion??1);if(s.mapVersion===1&&s.faction==='ai')b.cover=newGame('human',s.roster).cover;return b;}

export function encodeProgress(s,newGame){
 const base=baseline(s,newGame),progress={};
 for(const k of progressFields)if(s[k]!==undefined)progress[k]=clone(s[k]);
 if(progress.turnLimit===undefined)progress.turnLimit=base.turnLimit;
 return {format:'null-sector-save',version:2,contentVersion:1,savedAt:new Date().toISOString(),
  mission:s.faction==='human'?'archive-01':'defense-01',mapVersion:s.mapVersion,encounterVersion:s.encounterVersion??1,
  roster:[...s.roster],agents:s.agents.map(a=>({xp:a.xp,weapon:a.weapon,module:a.module})),progress,
  units:s.units.map((u,i)=>{const changes={id:u.id};for(const k of unitFields)if(u[k]!==undefined&&!same(u[k],base.units[i][k]))changes[k]=clone(u[k]);return changes;}),
  cover:s.cover.filter((c,i)=>c.hp!==base.cover[i].hp).map(c=>({id:c.id,hp:c.hp})),
  defense:s.defense?{nodes:s.defense.nodes.map(n=>({id:n.id,breach:n.breach,lastBreach:n.lastBreach,lastPurge:n.lastPurge}))}:null
 };
}
export function decodeProgress(d,newGame){
 keys(d,['format','version','contentVersion','savedAt','mission','mapVersion','encounterVersion','roster','agents','progress','units','cover','defense']);
 if(d.contentVersion!==1||!['archive-01','defense-01'].includes(d.mission)||![1,2].includes(d.mapVersion)||![1,2].includes(d.encounterVersion))throw Error('지원하지 않는 미션/콘텐츠 버전입니다.');
 if(!Array.isArray(d.roster)||d.roster.length!==4||new Set(d.roster).size!==4||d.roster.some(r=>!Number.isInteger(r)||r<0||r>6))throw Error('편성 정보가 올바르지 않습니다.');
 if(!Array.isArray(d.agents)||d.agents.length!==7)throw Error('요원 정보가 손상되었습니다.');
 d.agents.forEach(a=>keys(a,['xp','weapon','module']));
 keys(d.progress,progressFields);
 if(progressFields.some(k=>!Object.hasOwn(d.progress,k)))throw Error('진행 정보가 누락되었습니다.');
 const meta={faction:d.mission==='archive-01'?'human':'ai',roster:d.roster,agents:d.agents,mapVersion:d.mapVersion,encounterVersion:d.encounterVersion};
 const s=baseline(meta,newGame);s.mapVersion=d.mapVersion;Object.assign(s,clone(d.progress));
 if(!Array.isArray(d.units)||d.units.length!==s.units.length)throw Error('유닛 정보가 누락되었습니다.');
 d.units.forEach((u,i)=>{keys(u,['id',...unitFields]);if(u.id!==s.units[i].id)throw Error('유닛 ID가 손상되었습니다.');
  if(u.supplies!==undefined)keys(u.supplies,['charge','batteries','kits']);
  if(u.downed!==undefined)keys(u.downed,['remaining','at']);
  Object.assign(s.units[i],clone(u));
 });
 if(!Array.isArray(d.cover)||d.cover.length>s.cover.length)throw Error('엄폐 정보가 손상되었습니다.');
 const seen=new Set();for(const c of d.cover){keys(c,['id','hp']);const target=s.cover.find(x=>x.id===c.id);if(!target||seen.has(c.id))throw Error('엄폐 ID가 손상되었습니다.');seen.add(c.id);target.hp=c.hp;}
 if(d.defense===null)delete s.defense;
 else {keys(d.defense,['nodes']);if(!s.defense||!Array.isArray(d.defense.nodes)||d.defense.nodes.length!==2)throw Error('방어 정보가 손상되었습니다.');
  d.defense.nodes.forEach((n,i)=>{keys(n,['id','breach','lastBreach','lastPurge']);if(n.id!==s.defense.nodes[i].id)throw Error('중계소 ID가 손상되었습니다.');Object.assign(s.defense.nodes[i],clone(n));});
 }
 return s;
}
