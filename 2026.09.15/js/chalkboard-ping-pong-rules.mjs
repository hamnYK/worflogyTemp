export const PING={halfWidth:2.6,halfLength:4,radius:.11,gravity:9.81,netHeight:.68,target:5};
// These visible carved marks also define the physical bounce patches.
export const SCRATCHES=[{x:-1.25,z:1.7,r:.48,kick:.9},{x:1.35,z:2.8,r:.36,kick:-.75},{x:.95,z:-1.65,r:.45,kick:-.85},{x:-1.45,z:-2.8,r:.35,kick:.7}];
export class ChalkboardPingPong{
 constructor({random=Math.random}={}){this.random=random;this.reset();}
 reset(){this.scores=[0,0];this.rally=0;this.bestRally=0;this.swings=[0,0];this.time=0;this.prepare();}
 prepare(){
 this.server=(this.scores[0]+this.scores[1])%2;this.phase='ready';this.rally=0;this.bounces=0;this.lastHitter=this.server;this.receiver=1-this.server;this.reason=null;this.pointWinner=null;this.scratch=null;
 this.paddles=[{x:0,z:3.3,y:.9},{x:0,z:-3.3,y:.9}];this.ball={x:0,y:1.2,z:this.server===0?3.3:-3.3};this.v={x:0,y:0,z:0};this.aiTime=0;this.aiError=(this.random()-.5)*.65;this.aiSmash=this.random()<.2;
 }
 setPaddle(x,z){if(!Number.isFinite(x)||!Number.isFinite(z))return;this.paddles[0].x=Math.max(-2.8,Math.min(2.8,x));this.paddles[0].z=Math.max(1.15,Math.min(4.55,z));if(this.phase==='ready'&&this.server===0){this.ball.x=this.paddles[0].x;this.ball.z=this.paddles[0].z;}}
 get smashReady(){return this.canHit(0)&&this.ball.y>=1.25;}
 canHit(index){
 const p=this.paddles[index],b=this.ball;
 return this.phase==='rally'&&this.receiver===index&&this.bounces===1&&b.y>=PING.radius&&b.y<2.5&&Math.abs(b.x-p.x)<.68&&Math.abs(b.z-p.z)<.62;
 }
 send(index,smash=false){
 const b=this.ball,p=this.paddles[index],sign=index===0?-1:1;
 const time=smash?.49:1.03,targetZ=sign*(1.65+Math.min(.6,Math.abs(b.x)*.2));
 const offset=Math.max(-.5,Math.min(.5,b.x-p.x));
 const targetX=Math.max(-2.15,Math.min(2.15,-p.x*.55+offset*2.5));
 this.v={x:(targetX-b.x)/time,y:(PING.radius-b.y+.5*PING.gravity*time*time)/time,z:(targetZ-b.z)/time};
 this.lastHitter=index;this.receiver=1-index;this.bounces=0;this.scratch=null;this.aiTime=0;this.aiError=(this.random()-.5)*.65;this.aiSmash=this.random()<.2;
 }
 serve(){
 if(this.phase!=='ready')return false;
 const p=this.paddles[this.server];this.ball={x:p.x,y:1.2,z:p.z};this.phase='rally';this.send(this.server);this.swings[this.server]=.18;return true;
 }
 swing(index=0,smash=false){
 if(this.phase==='ready'&&index===this.server)return this.serve();
 if(this.phase!=='rally'||this.swings[index]>0)return false;
 this.swings[index]=.18;
 if(!this.canHit(index))return false;
 if(smash&&this.ball.y<1.25)return false;
 this.send(index,smash);this.rally++;this.bestRally=Math.max(this.bestRally,this.rally);return true;
 }
 point(winner,reason){
 if(this.phase!=='rally')return;
 this.scores[winner]++;this.pointWinner=winner;this.reason=reason;this.v={x:0,y:0,z:0};
 this.phase=this.scores[winner]>=PING.target?'results':'point';
 }
 miss(){this.point(this.bounces?this.lastHitter:1-this.lastHitter,this.bounces?'miss':'out');}
 bounce(){
 if((this.ball.z>0?0:1)!==this.receiver){this.point(this.receiver,'own-side');return;}
 if(this.bounces){this.point(this.lastHitter,'double');return;}
 this.bounces=1;this.ball.y=PING.radius;this.v.y=Math.abs(this.v.y)*.82;
 const patch=SCRATCHES.find(p=>Math.hypot(this.ball.x-p.x,this.ball.z-p.z)<p.r);
 if(patch){this.v.x+=patch.kick;this.v.y*=1.08;this.scratch=patch;}
 }
 step(dt){
 this.time+=dt;this.swings=this.swings.map(t=>Math.max(0,t-dt));
 if(this.phase!=='rally')return;
 this.aiTime+=dt;const b=this.ball,old={...b};this.v.y-=PING.gravity*dt;b.x+=this.v.x*dt;b.y+=this.v.y*dt;b.z+=this.v.z*dt;
 // Swept crossings prevent fast smashes from tunnelling through the notebook or table.
 if(old.z*b.z<=0&&old.z!==b.z){
 const f=old.z/(old.z-b.z),y=old.y+(b.y-old.y)*f,x=old.x+(b.x-old.x)*f;
 if(Math.abs(x)<PING.halfWidth+PING.radius&&y<PING.netHeight+PING.radius){this.point(1-this.lastHitter,'net');return;}
 }
 if(old.y>=PING.radius&&b.y<PING.radius&&this.v.y<0){
 const f=(old.y-PING.radius)/(old.y-b.y),x=old.x+(b.x-old.x)*f,z=old.z+(b.z-old.z)*f;
 b.x=x;b.z=z;
 if(Math.abs(x)<=PING.halfWidth&&Math.abs(z)<=PING.halfLength)this.bounce();else this.miss();
 }
 if(this.phase!=='rally')return;
 if(b.y<-1||Math.abs(b.x)>4.2||Math.abs(b.z)>5.4){this.miss();return;}
 for(const p of this.paddles)p.y=Math.max(.28,Math.min(2.3,b.y));
 if(this.receiver===1){
 const p=this.paddles[1],travel=Math.max(0,(p.z-b.z)/(this.v.z||-1)),target=Math.max(-2.65,Math.min(2.65,b.x+this.v.x*travel+this.aiError));
 if(this.aiTime>.16)p.x+=Math.max(-dt*3.7,Math.min(dt*3.7,target-p.x));
 if(this.canHit(1)&&this.aiTime>.22)this.swing(1,this.aiSmash&&b.y>=1.25);
 }
 }
 advance(seconds){for(let t=0;t<seconds;t+=1/240)this.step(Math.min(1/240,seconds-t));}
}
