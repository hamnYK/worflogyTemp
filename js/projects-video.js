document.addEventListener('DOMContentLoaded', () => {
  const videoCard = document.querySelector('.project-video-section .project-video-card');
  const video = document.getElementById('project-intro-video');

  if (!videoCard || !video) return;

  // 우클릭 차단
  videoCard.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 마우스 진입 시 소리 재생 (Unmute)
  videoCard.addEventListener('mouseenter', () => {
    video.muted = false;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio play prevented by browser auto-play policy until user interaction.");
      });
    }
  });

  // 마우스 이탈 시 소리 끄기 (Mute)
  videoCard.addEventListener('mouseleave', () => {
    video.muted = true;
  });

  // 모바일/터치 환경 지원: 클릭 시 토글
  videoCard.addEventListener('click', () => {
    video.muted = !video.muted;
  });
});
