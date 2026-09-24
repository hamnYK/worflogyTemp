import {DotsAndBoxes} from './dots-and-boxes-rules.mjs';
import {createTriangleTable} from './triangle-table.mjs';

export function mountDotsAndBoxes(host,{onExit,onWin=onExit,english=false}={}){
 const t=(ko,en)=>english?en:ko;
 let game,selected=null,focused=0,timer,disposed=false,round=0,first=Math.random()<.5?0:1,lastEdge=null;
 host.innerHTML=`<div class="chip-game triangle-game dots-boxes-game"><div class="chip-game-heading"><button type="button" class="wf-button chip-back">${t('게임 선택','Games')}</button><h2 lang="en">DOTS AND BOXES</h2><button type="button" class="wf-button triangle-new">${t('새 판','New board')}</button></div><div class="triangle-score"><span class="triangle-you">${t('나','YOU')} <strong class="triangle-score-you">0</strong></span><span class="triangle-turn"></span><span class="triangle-ai">${t('컴퓨터','COMPUTER')} <strong class="triangle-score-ai">0</strong></span></div><div class="triangle-board" role="group" aria-label="${t('점 36개로 사각형 25칸을 만드는 닷츠 앤 박스 판','Dots and Boxes board with 36 dots and 25 boxes')}"><svg viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g class="triangle-fills"></g><g class="triangle-lines"></g></svg><div class="triangle-dots"></div></div><div class="chip-controls"><button type="button" class="wf-button triangle-cancel">${t('선택 취소','Clear selection')}</button><span class="triangle-count"></span></div><p class="chip-status" role="status" aria-live="polite" aria-atomic="true"></p></div>`;
 const root=host.firstElementChild,board=root.querySelector('.triangle-board'),dots=root.querySelector('.triangle-dots'),fills=root.querySelector('.triangle-fills'),lines=root.querySelector('.triangle-lines'),status=root.querySelector('.chip-status'),cancel=root.querySelector('.triangle-cancel');
 let buttons=[];
 let endTimer=null;
 const resultOverlay=document.createElement('div');resultOverlay.className='chip-result';resultOverlay.setAttribute('aria-hidden','true');resultOverlay.style.zIndex='4';board.append(resultOverlay);
 const score=i=>String(game.scores[i]);
 function preview(i){if(selected===null||selected===i||game.turn!==0||game.invalid(selected,i))return;const count=game.completed(selected,i).length;status.textContent=(selected+1)+'–'+(i+1)+t(' 연결 시: ',' connection: ')+(count?t('내 사각형 ','claim ')+count+t('개 획득 · 추가 차례',' box(es) and play again'):t('완성되는 사각형 없음 · 컴퓨터 차례로 넘어갑니다.','no box completed; computer plays next.'));}
 const table=createTriangleTable(board,positions=>{positions.forEach((p,i)=>{if(buttons[i]){buttons[i].style.left=p.x+'%';buttons[i].style.top=p.y+'%';buttons[i].hidden=!p.visible;}});if(buttons[focused]?.hidden){const next=buttons.findIndex(b=>!b.hidden);if(next>=0){focused=next;buttons.forEach((b,i)=>b.tabIndex=i===focused?0:-1);}}},{title:'DOTS AND BOXES',theme:'western'});
 if(table){
  const controls=document.createElement('div');controls.className='chip-camera triangle-camera';
  for(const [action,label,title] of [['in','+',t('확대','Zoom in')],['out','−',t('축소','Zoom out')],['left','↶',t('왼쪽 회전','Rotate left')],['right','↷',t('오른쪽 회전','Rotate right')],['home',t('기본 뷰','Reset view'),t('기본 시점으로 복귀','Reset view')]]){const b=document.createElement('button');b.type='button';b.className='wf-button';b.dataset.triangleCamera=action;b.textContent=label;b.setAttribute('aria-label',title);b.onclick=()=>table.control(action);controls.append(b);}board.append(controls);
 }
 const svg=(name,attrs)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;};
 function message(){
  if(game.phase==='finished')return (game.winner===-1?t('무승부!','Draw!'):game.winner===0?t('승리!','You win!'):t('컴퓨터 승리.','Computer wins.'))+' '+score(0)+' : '+score(1)+(game.winner===0?t(' · 3초 후 게임 선택으로 돌아갑니다.',' · Returning to Games in 3 seconds.'):t(' · 3초 후 새 판으로 재도전합니다.',' · Trying a new board in 3 seconds.'));
  if(game.turn===1)return t('컴퓨터가 선을 고르고 있습니다.','Computer is choosing an edge.');
  return selected===null?t('내 차례 · 점 두 개를 연결하세요. 가로·세로로 이웃한 점만 연결할 수 있습니다. 사각형을 닫으면 추가 차례. 25칸 중 더 많이 차지하면 승리합니다. 방향키 이동·Enter/Space 선택.','Your turn · Connect two dots. Connect horizontal or vertical neighbors only. Close a box for another turn. Claim the most of the 25 boxes to win. Arrow keys move; Enter/Space selects.'):t('점 ','Dot ')+(selected+1)+t(' 선택 · 연결할 점을 고르세요. 같은 점이나 Esc로 취소합니다.',' selected · Choose a second dot. Select the same dot or press Esc to cancel.');
 }
 function render(notice=''){
  root.dataset.phase=game.phase;root.dataset.turn=String(game.turn);root.dataset.edges=String(game.edges.length);
  root.querySelector('.triangle-score-you').textContent=score(0);root.querySelector('.triangle-score-ai').textContent=score(1);
  root.querySelector('.triangle-score').setAttribute('aria-label',t('획득한 사각형 수: 나 ','Claimed boxes: You ')+score(0)+t(', 컴퓨터 ', ', Computer ')+score(1));
  root.querySelector('.triangle-score').title=t('사각형 한 칸당 1점 · 마지막 변을 닫은 사람이 획득','One point per box · The player who closes the last edge claims it');
  root.querySelector('.triangle-turn').textContent=game.phase==='finished'?t('종료','FINISHED'):game.turn===0?t('내 차례','YOUR TURN'):t('컴퓨터 차례','COMPUTER TURN');
  root.querySelector('.triangle-count').textContent=t('총 25칸 · 나 ','25 boxes · You ')+game.scores[0]+t('개 / 컴퓨터 ',' / Computer ')+game.scores[1]+t('개','');
  fills.replaceChildren(...game.boxes.map(({ids,owner})=>svg('polygon',{points:ids.map(i=>`${game.points[i].x},${game.points[i].y}`).join(' '),class:owner===0?'triangle-owned-you':'triangle-owned-ai'})));
  // Owner initials accompany color so claimed land is distinguishable without color.
  for(const {ids,owner} of game.boxes){const center=ids.reduce((p,i)=>({x:p.x+game.points[i].x/ids.length,y:p.y+game.points[i].y/ids.length}),{x:0,y:0});const label=svg('text',{x:center.x,y:center.y,'text-anchor':'middle','dominant-baseline':'central',class:'triangle-owner-label'});label.textContent=owner===0?'Y':'C';fills.append(label);}
  lines.replaceChildren(...game.edges.map(([a,b],i)=>svg('line',{x1:game.points[a].x,y1:game.points[a].y,x2:game.points[b].x,y2:game.points[b].y,class:i===game.edges.length-1&&lastEdge?'triangle-last-edge':''})));
  buttons.forEach((button,i)=>{button.disabled=game.turn!==0||game.phase!=='playing';button.tabIndex=i===focused?0:-1;button.setAttribute('aria-pressed',String(i===selected));button.classList.toggle('triangle-available',selected!==null&&i!==selected&&!game.invalid(selected,i));});
  cancel.disabled=selected===null||game.turn!==0;status.textContent=notice?notice+' '+message():message();
  table?.sync(game,selected);
  if(game.phase==='finished'&&endTimer===null){
   resultOverlay.textContent=game.winner===0?'VICTORY':game.winner===-1?'DRAW':'TRY AGAIN';resultOverlay.classList.add('show');
   const generation=round,won=game.winner===0;
   endTimer=setTimeout(()=>{if(disposed||generation!==round)return;if(won)onWin?.();else newBoard();},3000);
  }
 }
 function queueAI(){
  if(disposed||game.phase!=='playing'||game.turn!==1)return;
  const generation=round;timer=setTimeout(()=>{
   if(disposed||generation!==round)return;
   const move=game.chooseMove();if(!move)return;
   const result=game.play(...move);lastEdge=move;render(result.captured?t('컴퓨터 사각형 ','Computer claims ')+result.captured+t('개 획득.',' box(es).'):'');
   if(game.turn===0&&game.phase==='playing'&&document.activeElement===document.body)buttons[focused].focus({preventScroll:true});
   queueAI();
  },550);
 }
 function choose(i){
  if(disposed||game.turn!==0||game.phase!=='playing')return;
  focused=i;
  if(selected===null){selected=i;render();return;}
  if(selected===i){selected=null;render();return;}
  const result=game.play(selected,i);
  if(!result.ok){const reasons={'not-adjacent':t('가로·세로로 바로 이웃한 점만 연결할 수 있습니다.','Connect only adjacent horizontal or vertical dots.'),duplicate:t('이미 연결된 선입니다.','That edge already exists.')};render(reasons[result.reason]||t('연결할 수 없는 점입니다.','That connection is not allowed.'));return;}
  lastEdge=[selected,i];selected=null;render(result.captured?t('사각형 ','Claimed ')+result.captured+(result.finished?t('개 획득!',' box(es)!'):t('개 획득! 한 번 더 두세요.',' box(es)! Play again.')):'');queueAI();
 }
 function newBoard(){
  clearTimeout(endTimer);endTimer=null;resultOverlay.classList.remove('show');resultOverlay.textContent='';
  clearTimeout(timer);round++;selected=null;focused=0;lastEdge=null;game=new DotsAndBoxes({first});root.dataset.first=String(first);first=1-first;
  dots.replaceChildren();buttons=game.points.map((p,i)=>{const b=document.createElement('button');b.type='button';b.className='triangle-dot';b.style.left=p.x/10+'%';b.style.top=p.y/6.4+'%';b.dataset.boardX=p.x;b.dataset.boardY=p.y;b.textContent=i+1;b.setAttribute('aria-label',t('점 ','Dot ')+(i+1));b.onclick=()=>choose(i);b.onpointerenter=()=>preview(i);b.onfocus=()=>{focused=i;buttons.forEach((node,j)=>node.tabIndex=j===i?0:-1);preview(i);};dots.append(b);return b;});
  render();queueAI();
 }
 board.onkeydown=e=>{
  if(e.key==='Escape'){e.preventDefault();selected=null;render();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)||game.turn!==0||game.phase!=='playing')return;
  e.preventDefault();let next=focused;
  if(e.key==='Home')next=buttons.findIndex(b=>!b.hidden);else if(e.key==='End')next=buttons.findLastIndex(b=>!b.hidden);else{
   const horizontal=e.key==='ArrowLeft'||e.key==='ArrowRight',sign=e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1;
   const origin=buttons[focused].getBoundingClientRect();
   const candidates=buttons.map((b,i)=>{const r=b.getBoundingClientRect(),dx=r.left-origin.left,dy=r.top-origin.top,forward=(horizontal?dx:dy)*sign;return{i,forward,hidden:b.hidden,score:Math.hypot(dx,dy)+Math.abs(horizontal?dy:dx)*2};}).filter(q=>!q.hidden&&q.forward>0).sort((a,b)=>a.score-b.score);if(candidates.length)next=candidates[0].i;
  }
  if(next>=0){focused=next;buttons[next].focus({preventScroll:true});}
 };
 cancel.onclick=()=>{selected=null;render();buttons[focused].focus({preventScroll:true});};root.querySelector('.chip-back').onclick=onExit;root.querySelector('.triangle-new').onclick=newBoard;
 newBoard();return {dispose(){disposed=true;clearTimeout(timer);clearTimeout(endTimer);round++;table?.dispose();}};
}
