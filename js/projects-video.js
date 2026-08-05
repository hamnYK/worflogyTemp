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

  // 2. 핵심 솔루션 인포그래픽 모달 제어 핸들러
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

  // 3. 프랙털 온톨로지 엔진 — 아코디언 토글
  const engineTrigger = document.getElementById('engine-accordion-trigger');
  const enginePanel   = document.getElementById('engine-accordion-panel');

  if (engineTrigger && enginePanel) {
    engineTrigger.addEventListener('click', () => {
      const isOpen = engineTrigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // 닫기: .open 제거 → transition 완료 후 hidden 복원
        enginePanel.classList.remove('open');
        engineTrigger.setAttribute('aria-expanded', 'false');

        // max-height transition 시간(450ms)이 끝난 뒤 hidden 처리
        enginePanel.addEventListener('transitionend', () => {
          if (!enginePanel.classList.contains('open')) {
            enginePanel.hidden = true;
          }
        }, { once: true });

      } else {
        // 열기: hidden 해제 → 다음 프레임에서 .open 추가 (CSS transition 발동)
        enginePanel.hidden = false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            enginePanel.classList.add('open');
            engineTrigger.setAttribute('aria-expanded', 'true');
          });
        });
      }
    });
  }
});