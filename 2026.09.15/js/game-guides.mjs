// State-derived guidance: never announce a completed action while another is moving.
export function footballGuide(g,t,dragging=false){
 if(g.phase==='breaking')return t('칩을 펼치는 중입니다. 모두 멈추면 시작합니다. 이 동작은 횟수·충돌 실패에서 제외됩니다.','Spreading the chips. Wait until they stop. This opening is uncounted and allows collisions.');
 if(g.phase==='moving')return g.crossed
 ?t('두 칩 사이를 통과했습니다. 아직 이동 중이니 결과를 기다리세요.','Gap crossed. The chip is still moving; wait for the result.')
 :g.readyAtLaunch?t('슈팅 중입니다. 두 칩 사이를 통과해 골에 들어가야 합니다.','Shot in motion. It must pass through the gap and enter the goal.'):t('패스 중입니다. 다른 칩과 충돌하거나 지금 골을 넣으면 실패입니다.','Pass in motion. Hitting a chip or scoring before unlock fails.');
 if(g.phase!=='ready')return null;
 if(g.selected!==null){
 if(g.opening)return t('선택한 칩을 뒤로 당겼다 놓아 펼치세요. 시작 동작은 횟수·충돌 실패에서 제외됩니다.','Pull and release the selected chip to spread the cluster. The opening is uncounted and allows collisions.');
 return t('칩 ','Chip ')+(g.selected+1)+t(' 선택 고정. ',' locked. ')+(g.canShoot?t('두 칩 사이를 통과해 골을 노리세요.','Shoot through the gap into the goal.'):t('다른 두 칩 사이를 통과시키세요. 칩 충돌은 실패입니다.','Pass between the other two chips. Chip collisions fail.'))+(dragging?t(' 놓으면 발사됩니다.',' Release to launch.'):'');
 }
 if(g.opening)return t('칩 하나를 선택하고 뒤로 당겼다 놓아 펼치세요. 시작 동작은 횟수·충돌 실패에서 제외됩니다.','Select a chip, pull back and release to spread the cluster. The opening is uncounted and allows collisions.');
 if(g.canShoot)return t('세 칩 모두 통과 완료! 직전 칩을 제외하고 선택해 두 칩 사이로 슈팅하세요.','All three chips have passed! Select a different chip and shoot through the gap.');
 return t('칩을 선택하여 두 칩 사이를 통과하세요. 세 칩 모두 통과해야 슈팅을 할 수 있습니다.','Select a chip and pass between the other two. All three chips must pass before shooting.')+(g.previous!==null?t(' 직전 칩은 다시 선택할 수 없습니다.',' You cannot select the previous chip.'):'');
}
export function basketballGuide(g,t,{mode,gripperActive,loft=65}={}){
 if(g.phase==='ready')return g.attempt+'/3 · '+(mode==='toss'?t('당기는 거리로 토스 힘을 정하고 놓으세요. 칩은 위로 던져집니다.','Pull farther for a stronger upward toss; release to throw.'):t('마우스 왼쪽 버튼으로 칩을 당겼다 놓아 위로 던지세요. 힘 설정 후 ‘칩 던지기’도 가능합니다.','Left-drag and release the chip to toss upward, or set power and press Toss chip.'));
 if(g.phase==='spinning'){
 if(!g.bounces)return t('위로 던지는 중입니다. 첫 바운드 이후에 집게로 잡을 수 있습니다.','Toss in progress. Catching is available after the first bounce.');
 if(!gripperActive)return t('바운드했습니다. 마우스 또는 방향키로 집게를 칩에 맞추세요.','The chip has bounced. Move the grippers with the pointer or arrow keys.');
 if(g.catchable)return t('지금 잡을 수 있습니다! 클릭 또는 Space로 잡으세요. 터치는 손을 떼면 잡습니다.','Catch now! Click or press Space. On touch, lift your finger to catch.');
 if(g.p.y>=1.5)return t('칩이 높이 떠 있습니다. 집게로 따라가며 낮아질 때를 기다리세요.','The chip is too high. Track it and wait until it drops lower.');
 return t('집게를 회전 중인 칩에 맞추고 잡으세요. 빗나가면 이번 기회는 0점입니다.','Align the grippers with the spinning chip and catch. A missed catch scores zero.');
 }
 if(g.phase==='held')return g.shotPoints+t('점 슛 · 높이 ','-point shot · Elevation ')+loft+'° · '+t('↑/↓로 높이, 칩 왼쪽 드래그로 힘 조절 후 놓으면 슛. 골대 방향은 자동입니다.','Up/down sets elevation; left-drag the chip for power and release. Aim follows the hoop automatically.');
 if(g.phase==='flying')return t('슈팅 중입니다. 골인 판정을 기다리세요.','Shot in flight. Wait for the result.');
 return null;
}
export function basketballResult(g,t){
 if(g.result==='basket')return g.scores[g.scores.length-1]+t('점 득점! ',' points! ');
 const reasons={catch:t('잡기에 실패했습니다.','Catch missed.'),miss:t('슛이 들어가지 않았습니다.','Shot missed.'),'spin-timeout':Math.abs(g.p.x)>8.5||Math.abs(g.p.z)>8.5?t('칩이 코트를 벗어났습니다.','The chip left the court.'):g.spinTime>14?t('잡기 시간이 끝났습니다.','Catch time expired.'):t('칩의 회전이 멈췄습니다.','The chip stopped spinning.')};
 return (reasons[g.result]||t('이번 시도는 실패입니다.','Attempt missed.'))+t(' 이번 기회는 0점입니다. ',' This attempt scores zero. ');
}
export function curlingGuide(g,t,dragging=false,spin=0){
 if(g.phase==='moving')return t('칩과 잡동사니가 움직이는 중입니다. 모두 멈춘 뒤 점수를 계산합니다.','Chips and objects are moving. Scores update once everything stops.');
 if(g.phase!=='ready')return null;
 if(dragging)return t('당겨서 방향·힘 조절 · ←/→로 회전 ','Pull to aim and set power · Left/right for curl ')+Number(spin).toFixed(1)+t(' · 놓으면 발사됩니다.',' · Release to launch.');
 return (g.shots+1)+t('/3번째 칩을 당겨 발사하세요. 드래그 중 ←/→로 회전 조절. 원 3·2·1점 + 완전히 밀어낸 물건당 2점, 최종 합계 6점이 목표입니다.','/3: Pull and release the chip; left/right adjusts curl while dragging. Rings score 3/2/1, fully cleared objects +2 each. Target: 6 after all shots.');
}
export function syncGuide(status,text){if(text!==null&&status.textContent!==text)status.textContent=text;}

export function bookFlipGuide(g,t,{pending=false,mode}={}){
 if(pending)return t('책을 내리치는 중입니다. 칩이 튄 뒤 멈출 때까지 기다리세요.','Striking the book. Wait for the chips to bounce and settle.');
 if(g.phase==='moving')return t('칩이 움직이고 있습니다. 뒤집힘은 모두 멈춘 뒤 판정하며, 책 밖으로 떨어지면 즉시 실패합니다.','Chips are moving. Flips are judged after settling; falling off the book fails immediately.');
 if(g.phase!=='ready')return null;
 if(mode==='strike')return t('힘이 커졌다 작아지기를 반복합니다. 원하는 세기에 놓으세요. 타격 후 힘은 1로 초기화됩니다.','Power rises and falls. Release at the strength you want. Power resets to 1 after each strike.');
 if(mode==='pan'||mode==='orbit')return t('시야를 조정하고 있습니다. 놓은 뒤 책 위를 길게 눌러 타격하세요.','Adjusting the view. Release, then hold on the book to charge a strike.');
 return (5-g.hits)+t('회 남음 · 책 위를 길게 눌렀다 놓으세요. 멈췄을 때 초록 면 3개가 모두 위로 향하면 승리, 하나라도 떨어지면 실패입니다. 방향키로 위치·힘 슬라이더로 세기를 정하고 Space로 칠 수도 있습니다.',' hits left · Hold and release on the book. Win with all three green faces up at rest; any chip falling off fails. Alternatively, set position with arrows and power with the slider, then press Space.');
}
export function eraserGuide(g,t,{mode,selected=0}={}){
 if(g.phase==='moving')return t('지우개가 움직이는 중입니다. 멈춘 뒤 올라타기·봉쇄·장외를 판정합니다. 경계에 걸쳐 있어도 되지만 완전히 나가면 패배입니다.','Erasers are moving. Riding, blocked edges and ring-out are judged after settling. Straddling the boundary is allowed; fully outside loses.');
 if(g.phase!=='ready')return null;
 if(g.turn===1)return t('상대 차례입니다. 상대가 누를 위치와 힘을 고르고 있습니다.','Rival turn. The rival is choosing an edge and power.');
 if(mode==='press')return t('힘이 커졌다 작아집니다. 놓으면 선택한 가장자리 쪽으로 뒤집힙니다.','Power rises and falls. Release to flip toward the selected edge.');
 if(mode==='pan'||mode==='orbit')return t('시야 조정 중입니다. 놓은 뒤 파란 지우개의 보이는 번호를 눌러 공격하세요.','Adjusting the view. Release, then press a visible number on your blue eraser.');
 if(!g.accessible(0,selected))return t('선택한 누름점이 막혔습니다. 보이는 다른 번호를 클릭하거나 1–8 키로 선택하세요.','The selected press point is covered. Click another visible number or select it with keys 1–8.');
 return t('파란 지우개의 번호를 길게 눌렀다 놓으세요. 1–8로 위치·슬라이더로 힘을 정하고 Space로도 뒤집습니다. 상대 위에 완전히 올라타거나 누를 곳을 모두 막으면 승리, 단순히 걸친 상태는 계속 진행합니다.','Hold and release a numbered edge of your blue eraser, or choose 1–8, set power and press Space. Fully ride on the rival or block all its press points to win. Partial overlap continues play.');
}
export function pingPongGuide(g,t,{mode,notice='',noticeUntil=0}={}){
 if(g.phase==='ready'){
 const server=g.server===0?t('내 서브 · ','Your serve · '):t('상대 서브 · ','Rival serve · ');
 return server+(mode==='pan'||mode==='orbit'?t('시야 조정 중입니다. 드래그를 놓고 ↑ 방향키를 누르면 서브가 시작됩니다.','Adjusting the view. Release the drag, then press Arrow Up to start the serve.'):t('왼쪽 드래그로 위치, 오른쪽 드래그로 회전, 휠로 확대·축소. ↑ 방향키로 서브를 시작하세요.','Left-drag to pan, right-drag to rotate, wheel to zoom. Press Arrow Up to start the serve.'));
 }
 if(g.phase!=='rally')return null;
 if(g.receiver===1)return t('상대가 받을 차례입니다. 마우스·방향키로 지우개를 옮겨 다음 공을 준비하세요. 높이는 자동입니다.','Rival receiving. Move with the mouse or arrows to prepare for the return. Height is automatic.');
 if(g.canHit(0)&&g.swings[0]>0)return t('스윙을 마치는 중입니다. 지우개를 공에 맞추고 다음 타격을 준비하세요.','Finishing the swing. Keep the eraser aligned and prepare to hit again.');
 if(g.smashReady)return t('높은 공! Shift+클릭 또는 Shift+Space, 스매시 버튼으로 치세요.','High ball! Use Shift+click, Shift+Space, or the Smash button.');
 if(g.canHit(0))return t('지금 받아치세요! 클릭 또는 Space. 높이는 자동으로 맞춰집니다.','Hit now! Click or Space. Height is adjusted automatically.');
 if(!g.bounces)return t('내 책상에서 한 번 튈 때까지 기다리며 마우스·방향키로 공을 따라가세요. 높이는 자동입니다.','Track with the mouse or arrows and wait for one bounce on your desk. Height is automatic.');
 if(notice&&g.time<noticeUntil)return notice;
 return (g.scratch?t('흠집에 맞아 방향이 바뀌었습니다. ','A carved patch deflected the ball. '):'')+t('한 번 튀었습니다. 두 번째 바운드 전에 지우개를 공 가까이 옮겨 클릭 또는 Space로 치세요.','The ball has bounced once. Move close and hit with click or Space before its second bounce.');
}
