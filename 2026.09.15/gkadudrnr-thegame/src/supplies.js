export const batteryCapacity=agent=>['impact','sniper'].includes(agent?.weapon)?4:6;
export const initialSupplies=(unit,agents)=>({charge:unit.team==='player'?batteryCapacity(agents?.[unit.role]):6,batteries:2,kits:unit.team==='player'?1:0});
export const unitCapacity=(state,unit)=>unit.team==='player'?batteryCapacity(state.agents?.[unit.role]):6;
