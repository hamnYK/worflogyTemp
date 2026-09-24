// Fixed-step planar rolling physics. World units are the same as territory coordinates.
// Prediction and playback use identical trajectories; rendering never decides a landing.
export const PEBBLE={radius:10,maxRange:360,drag:170,step:1/240};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const length=b=>Math.hypot(b.vx,b.vy);
const point=b=>({x:b.x,y:b.y,rotation:b.rotation||0});
export class PebbleSurface{
 constructor({random=Math.random,obstacles}={}){
  this.seed=random()*1000;this.revision=0;this.trails=[];
  this.depth=new Float32Array(200*128);this.axisX=new Float32Array(200*128);this.axisY=new Float32Array(200*128);
  this.obstacles=obstacles?obstacles.map((b,i)=>({rotation:0,id:i,...b})):this.generate(random);
 }
 generate(random){
  const count=3+Math.min(2,Math.floor(random()*3)),rocks=[];
  for(let i=0;i<count;i++){
   const radius=23+random()*12;let p;
   for(let trial=0;trial<1000;trial++){
    // Irrational offsets also avoid a degenerate layout with a constant test RNG.
    p={x:110+780*((random()+trial*.61803398875)%1),y:75+490*((random()+trial*.41421356237)%1)};
    if([220,780].every(x=>Math.hypot(p.x-x,p.y-320)>radius+110)&&rocks.every(b=>Math.hypot(p.x-b.x,p.y-b.y)>radius+b.radius+65))break;
   }
   rocks.push({...p,radius,rotation:random()*Math.PI*2,id:i});
  }
  return rocks;
 }
 clearAt(p,radius=PEBBLE.radius){return this.obstacles.every(b=>Math.hypot(p.x-b.x,p.y-b.y)>radius+b.radius+3);}
 aimAt(start,target,penalty=()=>0){
  let angle=Math.atan2(target.y-start.y,target.x-start.x),power=clamp(Math.round(Math.hypot(target.x-start.x,target.y-start.y)/PEBBLE.maxRange*100),1,100);
  const evaluate=(a,p)=>{const flight=this.simulate(start,a,p);return{angle:a,power:p,score:Math.hypot(flight.end.x-target.x,flight.end.y-target.y)+penalty(flight.end)};};
  let best=evaluate(angle,power);
  for(const step of [8,4,2,1])for(const [da,dp] of [[step*Math.PI/180,0],[-step*Math.PI/180,0],[0,step],[0,-step]]){
   const next=evaluate(best.angle+da,clamp(best.power+dp,1,100));if(next.score<best.score)best=next;
  }
  return best;
 }
 sample(x,y){
  const i=clamp(Math.floor(y/5),0,127)*200+clamp(Math.floor(x/5),0,199);
  return{depth:this.depth[i],x:this.axisX[i],y:this.axisY[i]};
 }
 simulate(start,angle,power){
  const speed=Math.sqrt(2*PEBBLE.drag*PEBBLE.maxRange*clamp(power,1,100)/100);
  const bodies=[{...point(start),radius:PEBBLE.radius,mass:1,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,moving:true},
   ...this.obstacles.map(b=>({...b,mass:(b.radius/PEBBLE.radius)**2*.65,vx:0,vy:0,moving:false}))];
  const trails=bodies.map(b=>[point(b)]),frames=[{time:0,stone:point(bodies[0]),rocks:bodies.slice(1).map(point)}],hits=[];
  let time=0,outside=false;
  const dt=PEBBLE.step;
  for(let step=0;step<240*8;step++){
   for(let i=0;i<bodies.length;i++){
    const b=bodies[i],v=length(b);if(v===0)continue;
    const rut=this.sample(b.x,b.y),ux=b.vx/v,uy=b.vy/v,sign=ux*rut.x+uy*rut.y<0?-1:1;
    const grain=Math.sin(b.x*.045+this.seed)*Math.cos(b.y*.038-this.seed*.2);
    const wobble=Math.sin(b.rotation*2.6+this.seed+i)*.6+grain*.65;
    const bend=(wobble+(ux*rut.y*sign-uy*rut.x*sign)*rut.depth*4)*dt;
    const heading=Math.atan2(b.vy,b.vx)+bend;
    // Grooves resist crossing and guide motion along them. Sand dissipates energy.
    const across=Math.abs(ux*rut.y-uy*rut.x);
    const drag=(i?145:PEBBLE.drag)*(1+grain*.14+rut.depth*(.55*across-.18));
    const next=Math.max(0,v-drag*dt);b.vx=Math.cos(heading)*next;b.vy=Math.sin(heading)*next;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.rotation+=next/b.radius*dt;
    if(next<4){b.vx=0;b.vy=0;}
    if(i){for(const [coord,vel,max] of [['x','vx',1000],['y','vy',640]])if(b[coord]<b.radius||b[coord]>max-b.radius){b[coord]=clamp(b[coord],b.radius,max-b.radius);b[vel]*=-.18;}}
   }
   for(let a=0;a<bodies.length;a++)for(let c=a+1;c<bodies.length;c++){
    const b=bodies[a],d=bodies[c],dx=d.x-b.x,dy=d.y-b.y,dist=Math.hypot(dx,dy),contact=b.radius+d.radius;
    if(dist>=contact)continue;
    const nx=dist>1e-6?dx/dist:1,ny=dist>1e-6?dy/dist:0;
    const overlap=contact-dist+.01,invB=1/b.mass,invD=1/d.mass;
    b.x-=nx*overlap*invB/(invB+invD);b.y-=ny*overlap*invB/(invB+invD);d.x+=nx*overlap*invD/(invB+invD);d.y+=ny*overlap*invD/(invB+invD);
    // Uneven faces vary the contact normal without adding kinetic energy.
    const facet=.14*Math.sin(Math.atan2(ny,nx)*5+d.rotation*1.7+this.seed);
    const cx=nx*Math.cos(facet)-ny*Math.sin(facet),cy=nx*Math.sin(facet)+ny*Math.cos(facet);
    const relative=(d.vx-b.vx)*cx+(d.vy-b.vy)*cy;
    if(relative>=0)continue;
    const impulse=-(1+.32)*relative/(invB+invD);
    const oldD=length(d),oldB=length(b);
    b.vx-=impulse*cx*invB;b.vy-=impulse*cy*invB;d.vx+=impulse*cx*invD;d.vy+=impulse*cy*invD;
    const tangent=clamp(-((d.vx-b.vx)*-cy+(d.vy-b.vy)*cx)/(invB+invD),-impulse*.2,impulse*.2);
    b.vx-=tangent*-cy*invB;b.vy-=tangent*cx*invB;d.vx+=tangent*-cy*invD;d.vy+=tangent*cx*invD;
    if(c>0&&oldD===0&&length(d)<28+d.radius*.4){d.vx=0;d.vy=0;}
    if(a>0&&oldB===0&&length(b)<28+b.radius*.4){b.vx=0;b.vy=0;}
    if(hits.length<50)hits.push({x:(b.x+d.x)/2,y:(b.y+d.y)/2,time,impulse});
   }
   time+=dt;
   for(let i=0;i<bodies.length;i++){const b=bodies[i],last=trails[i].at(-1);if(Math.hypot(b.x-last.x,b.y-last.y)>=3)trails[i].push(point(b));}
   const stone=bodies[0];if(stone.x<0||stone.x>=1000||stone.y<0||stone.y>=640){outside=true;stone.vx=stone.vy=0;}
   if(step%4===3)frames.push({time,stone:point(stone),rocks:bodies.slice(1).map(point)});
   if(bodies.every(b=>length(b)===0))break;
  }
  bodies.forEach((b,i)=>trails[i].push(point(b)));
  frames.push({time,stone:point(bodies[0]),rocks:bodies.slice(1).map(point)});
  return{frames,duration:time,path:trails[0],trails:trails.map((path,i)=>({path,width:bodies[i].radius*(i?.8:.55)})),end:point(bodies[0]),rocks:bodies.slice(1).map(({x,y,radius,rotation,id})=>({x,y,radius,rotation,id})),hits,outside};
 }
 commit(flight){
  this.obstacles=flight.rocks.map(b=>({...b}));
  for(const trail of flight.trails){
   if(trail.path.length<2)continue;
   let moved=0;
   for(let n=1;n<trail.path.length;n++){
    const a=trail.path[n-1],b=trail.path[n],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.01)continue;moved+=len;
    const steps=Math.ceil(len/2.5),reach=Math.ceil(trail.width/5);
    for(let j=0;j<=steps;j++){const x=a.x+dx*j/steps,y=a.y+dy*j/steps;
     for(let oy=-reach;oy<=reach;oy++)for(let ox=-reach;ox<=reach;ox++){
      const cx=Math.floor(x/5)+ox,cy=Math.floor(y/5)+oy;if(cx<0||cx>=200||cy<0||cy>=128)continue;
      const dist=Math.hypot((cx+.5)*5-x,(cy+.5)*5-y);if(dist>trail.width)continue;
      const i=cy*200+cx,weight=(1-dist/trail.width)*.22;this.depth[i]=Math.min(1,this.depth[i]+weight);this.axisX[i]=dx/len;this.axisY[i]=dy/len;
     }
    }
   }
   if(moved>2)this.trails.push(trail);
  }
  // The bounded field retains older grooves physically; keep recent visible strokes economical.
  if(this.trails.length>240)this.trails.splice(0,this.trails.length-240);
  this.revision++;
 }
}
