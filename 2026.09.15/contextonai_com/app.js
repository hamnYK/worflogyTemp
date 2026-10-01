const $ = (selector) => document.querySelector(selector);
let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}
document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(button.dataset.color);
    toast(button.dataset.color + ' 복사했습니다.');
  } catch { toast('색상 코드: ' + button.dataset.color + ' · 직접 선택해 복사해 주세요.'); }
}));
const tokens = {
  name: 'contexton', version: '0.1',
  colors: { canvas:'#F6F5F2', surface:'#FFFFFF', ink:'#202522', muted:'#626963', border:'#DDE1DA', focus:'#315EFB', logic:'#36766C', logicSoft:'#EAF2EE', perspective:'#895975', perspectiveSoft:'#F3EBF0', creative:'#785C36', creativeSoft:'#F3EADB', verify:'#6C627D', verifySoft:'#EEEBF3' },
  typography: { fontFamily:'Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif', title:{size:24,lineHeight:32,weight:600}, section:{size:18,lineHeight:26,weight:600}, input:{size:16,lineHeight:26,weight:400}, body:{size:14,lineHeight:22,weight:400}, label:{size:12,lineHeight:18,weight:500} },
  writing:{body:{size:14,lineHeight:27},fictionBody:{size:15,lineHeight:32},origins:['network','creative','verify']}, spacing:[4,8,12,16,24,32,48,64], radius:{control:6,node:12,pill:999}, node:{width:240,previewLines:3,opinionLimit:200}
};
$('#download-tokens').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(tokens,null,2)],{type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'contexton-design-tokens.json';
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
  toast('디자인 토큰을 내려받습니다.');
});
const notes = {default:'240px 너비 · 12px 모서리 · 의견 3줄 미리보기', selected:'선택됨 · 파란색 외곽선으로 편집 대상을 표시합니다.',drop:'드롭 대상 · 이미지를 놓으면 연결하여 추가하는 상태입니다.'};
document.querySelectorAll('[data-state]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-state]').forEach(item => {item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',String(item===button));});
  $('#example-node').className = 'example-node' + (button.dataset.state==='default'?'':' is-'+button.dataset.state);
  $('#node-state-note').textContent = notes[button.dataset.state];
}));
$('#opinion').addEventListener('input', () => {
  const length = $('#opinion').value.length;
  $('#char-count').textContent = length+' / 200';
  $('#save-opinion').disabled = !$('#opinion').value.trim();
  $('#save-status').textContent = '디자인 시연용 · 이 화면에서만 유지됩니다.';
});
$('#save-opinion').addEventListener('click', () => {
  const value = $('#opinion').value.trim();
  if (!value) return;
  $('#example-node .mini-copy p').textContent = value;
  $('#save-status').textContent = '예시 노드에 반영했습니다. 새로고침하면 초기화됩니다.';
  toast('예시 노드에 의견을 반영했습니다.');
});
$('#add-demo').addEventListener('click', () => {
 $('[data-state="drop"]').click();
 $('#example-node').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 toast('노드의 드롭 대상 상태를 미리 봅니다.');
});
$('#connect-demo').addEventListener('click', () => {
 $('#relationships').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 $('[data-proposal-id="1"]').focus({preventScroll:true});
});
const sections = [...document.querySelectorAll('main>section')];
function updateNav() {
 let current = sections[0].id;
 sections.forEach(section => { if(section.getBoundingClientRect().top < 160) current = section.id; });
 document.querySelectorAll('nav a').forEach(link => {
  const active = link.getAttribute('href') === '#'+current; link.classList.toggle('active',active);
  if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
 });
}
addEventListener('scroll',updateNav,{passive:true});updateNav();




