import {ChipFootball} from '../js/chip-football-rules.mjs';
let seed=19;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const settle=g=>{for(let n=0;n<2200&&g.phase==='moving';n++)g.step(1/240);};
for(let run=0;run<12000;run++){
 const g=new ChipFootball();g.select(0);g.launch(0,-8);g.advance(2);const route=[];
 for(const i of [0,1,2]){
 g.select(i);const others=g.chips.filter((_,j)=>j!==i),c=g.chips[i],u=.3+rand()*.4,x=others[0].x*(1-u)+others[1].x*u,z=others[0].z*(1-u)+others[1].z*u,dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),speed=Math.min(21,(d+.8+rand()*5)*1.25);
 route.push([i,dx/d*speed,dz/d*speed]);g.launch(dx/d*speed,dz/d*speed);settle(g);if(g.phase!=='ready')break;
 }
 if(!g.canShoot||g.phase!=='ready')continue;
 for(const i of [0,1]){
 const h=new ChipFootball();Object.assign(h,structuredClone(g));h.select(i);const c=h.chips[i],dx=-c.x,dz=-8.5-c.z,d=Math.hypot(dx,dz);h.launch(dx/d*22,dz/d*22);settle(h);
 if(h.phase==='won'){console.log(JSON.stringify([...route,[i,dx/d*22,dz/d*22]]));process.exit(0);}
 }
}throw Error('No four shot route found');
