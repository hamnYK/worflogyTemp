// Shared canvas shortcut; native range-keyboard controls remain unchanged.
export function adjustPower(event,power,blocked=false,step=.5){
 if(event.key!=='PageUp'&&event.key!=='PageDown')return false;
 event.preventDefault();
 if(!blocked&&!power.disabled)power.value=Math.max(+power.min,Math.min(+power.max,+power.value+(event.key==='PageUp'?step:-step)));
 return true;
}
