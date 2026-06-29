document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-bkgsor-platform');
  const toast = document.getElementById('bkgsor-toast');
  if (!btn || !toast) return;

  let isAnimating = false;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;

    isAnimating = true;
    toast.classList.add('show');

    // 1.0초(1000ms) 동안 완전히 보여준 뒤, 클래스를 제거하여 0.5초(500ms) 동안 서서히 fade-out 시킵니다 (총 1.5초)
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }, 1000);
  });

  // 비디오 우클릭·컨텍스트 메뉴 JS 이중 차단
  const video = document.getElementById('bkgsor-demo-video');
  if (video) {
    video.addEventListener('contextmenu', (e) => e.preventDefault());
  }
});