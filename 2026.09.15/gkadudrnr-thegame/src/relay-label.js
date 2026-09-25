import './relay-label.css';

export function updateRelayLabel(label,node){
 label.replaceChildren();
 const name=document.createElement('strong');name.textContent=node.name;
 const status=document.createElement('span');status.className='relay-status';
 const caption=document.createElement('span');caption.textContent=`침투 ${node.breach}/3`;
 const meter=document.createElement('span');meter.className='relay-meter';meter.setAttribute('aria-hidden','true');
 for(let i=0;i<3;i++){const pip=document.createElement('i');pip.classList.toggle('filled',i<node.breach);meter.append(pip);}
 status.append(caption,meter);label.append(name,status);
 label.classList.toggle('relay-warning',node.breach===1);
 label.classList.toggle('relay-danger',node.breach>=2);
 label.setAttribute('aria-label',`${node.name}, 침투 ${node.breach}/3`);
}

// Balloon labels stay directly above their tile and only rise to avoid actors.
export function placeRelayLabel(anchor,width,height,bounds,obstacles,lift=100){
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 const x=anchor.x-width/2;
 if(x<8||x+width>bounds.w-8||anchor.y-height-60<12)return null;
 const start=Math.max(12,anchor.y-height-Math.max(90,lift));
 let best=null;
 for(let step=0;step<=Math.ceil((start-12)/8);step++){
  const y=Math.max(12,start-step*8);
  const rect={x,y,w:width,h:height};
  const area=obstacles.reduce((sum,obstacle)=>sum+overlap(rect,obstacle),0);
  const score=area*10000+start-y;
  if(!best||score<best.score)best={...rect,score};
  if(area===0)break;
 }
 return best;
}
