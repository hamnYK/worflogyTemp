document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-bkgsor-platform');
  if (!btn) return;

  const isEnglish = window.location.pathname.includes('/en/') || window.location.href.includes('/en/');

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isEnglish) {
      alert('The BKGSoR platform is currently preparing for service launch. We will do our best to meet you as soon as possible.');
    } else {
      alert('현재 BKGSoR 플랫폼 서비스 론칭을 준비하고 있습니다. 빠른 시일 내에 만나보실 수 있도록 최선을 다하겠습니다.');
    }
  });
});
