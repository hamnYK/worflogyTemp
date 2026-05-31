/**
 * Worflogy Company General Inquiry Modal Logic
 * 다국어(국문/영문) 지원 및 구글 Apps Script 연동
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. 현재 언어 환경 감지
  const isEnglish = window.location.href.includes('/en/');
  const currentLang = isEnglish ? 'en' : 'ko';

  // 2. 모달 제어 및 API 연동 요소 정의
  const openModalBtn = document.getElementById("open-contact-modal");
  const closeModalBtn = document.getElementById("close-ir-modal");
  const cancelModalBtn = document.getElementById("cancel-ir-modal");
  const modalBackdrop = document.getElementById("ir-modal-backdrop");
  const proposalForm = document.getElementById("ir-proposal-form");
  const submitBtn = document.getElementById("submit-ir-modal");
  const successScreen = document.getElementById("ir-success-screen");
  const successCloseBtn = document.getElementById("success-close-btn");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxBsuTAuC2SE0CXE6ycda-AdzGGXeZfQ75Pz0qINdvStz6wVXay1df65IuI62-eL97Qmg/exec";

  const messages = {
    ko: {
      error: "문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      submitting: "전송 중...",
      submit: "문의 제출하기"
    },
    en: {
      error: "An error occurred during submission. Please try again later.",
      submitting: "Submitting...",
      submit: "Submit Inquiry"
    }
  };

  const msg = messages[currentLang] || messages.ko;

  function openModal() {
    if (modalBackdrop) {
      // 폼은 보이게, 성공 화면은 숨긴 상태로 초기화
      if (proposalForm) proposalForm.style.display = "block";
      if (successScreen) successScreen.style.display = "none";
      
      modalBackdrop.classList.add("active");
      document.body.style.overflow = "hidden"; // 배경 스크롤 방지
      
      const firstInput = document.getElementById("ir-name");
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        if (proposalForm) {
          proposalForm.reset();
          proposalForm.style.display = "block";
        }
        if (successScreen) successScreen.style.display = "none";
      }, 300); // 닫기 애니메이션(0.3s)이 완료된 후 원복하여 깜빡임 방지
    }
  }

  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", closeModal);
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", closeModal);
  }

  // ESC 키를 누르면 닫히는 기능은 접근성 및 기본 모달 동작을 위해 유지하되,
  // 마우스 실수 클릭으로 인한 입력 소실 방지를 위해 백드롭 클릭 시 닫히는 로직은 의도적으로 제거하였습니다.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("active")) {
      closeModal();
    }
  });

  if (proposalForm) {
    proposalForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = msg.submitting;
      }

      const formData = {
        type: "inquiry",
        name: document.getElementById("ir-name").value,
        company: document.getElementById("ir-company").value,
        email: document.getElementById("ir-email").value,
        message: document.getElementById("ir-message").value
      };

      fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      .then(() => {
        // 성공 시 폼을 숨기고 성공 완료 화면 노출
        if (proposalForm) proposalForm.style.display = "none";
        if (successScreen) successScreen.style.display = "flex";
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert(msg.error);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = msg.submit;
        }
      });
    });
  }
});
