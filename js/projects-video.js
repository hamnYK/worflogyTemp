document.addEventListener('DOMContentLoaded', () => {
  // 1. 비디오 제어 핸들러
  const videoCard = document.querySelector('.project-video-section .project-video-card');
  const video = document.getElementById('project-intro-video');

  if (videoCard && video) {
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
  }

  // 2. 국문 소개서 브로셔 모달 제어 핸들러
  const brochureBtn = document.querySelector('.brochure-btn');
  const brochureModal = document.getElementById('brochure-modal');

  if (brochureBtn && brochureModal) {
    // 모달 열기
    brochureBtn.addEventListener('click', (e) => {
      e.preventDefault();
      brochureModal.classList.add('active');
      brochureModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // 뒷배경 스크롤 방지
    });

    // 클릭 시 모달 닫기
    brochureModal.addEventListener('click', () => {
      brochureModal.classList.remove('active');
      brochureModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // 스크롤 복원
    });
  }
});
