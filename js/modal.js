/**
 * Worflogy Common Modal Component (Multi-language Supported)
 * 공통 모달 제어 및 구글 Apps Script 연동 모듈
 */
class WorflogyModal {
  constructor(options) {
    this.openBtn = document.getElementById(options.openBtnId);
    this.closeBtn = document.getElementById(options.closeBtnId);
    this.cancelBtn = document.getElementById(options.cancelBtnId);
    this.backdrop = document.getElementById(options.backdropId);
    this.form = document.getElementById(options.formId);
    this.submitBtn = document.getElementById(options.submitBtnId);
    this.successScreen = document.getElementById(options.successScreenId);
    this.successCloseBtn = document.getElementById(options.successCloseBtnId);
    this.submitType = options.submitType; // 'ir' | 'inquiry' | 'edu'

    // 현재 언어 환경 판별 (영문 디렉토리 '/en/' 유무 확인)
    this.isEnglish = window.location.href.includes('/en/');
    this.currentLang = this.isEnglish ? 'en' : 'ko';

    this.WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxBsuTAuC2SE0CXE6ycda-AdzGGXeZfQ75Pz0qINdvStz6wVXay1df65IuI62-eL97Qmg/exec";

    this.messages = {
      ko: {
        error: "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        submitting: "전송 중...",
        submit: this.getSubmitButtonText('ko')
      },
      en: {
        error: "An error occurred during submission. Please try again later.",
        submitting: "Submitting...",
        submit: this.getSubmitButtonText('en')
      }
    };

    this.init();
  }

  getSubmitButtonText(lang) {
    if (this.submitType === 'ir') {
      return lang === 'en' ? 'Submit Proposal' : '제안 제출하기';
    } else if (this.submitType === 'inquiry') {
      return lang === 'en' ? 'Submit Inquiry' : '문의 제출하기';
    } else {
      return lang === 'en' ? 'Submit Inquiry' : '문의 제출하기';
    }
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener("click", () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => this.close());
    }
    if (this.successCloseBtn) {
      this.successCloseBtn.addEventListener("click", () => this.close());
    }

    // Escape 키 입력 시 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.backdrop && this.backdrop.classList.contains("active")) {
        this.close();
      }
    });

    // 폼 제출 이벤트 처리
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  open() {
    if (this.backdrop) {
      // 폼 초기화 및 활성화
      if (this.form) this.form.style.display = "block";
      if (this.successScreen) this.successScreen.style.display = "none";

      this.backdrop.classList.add("active");
      document.body.style.overflow = "hidden"; // 배경 스크롤 차단

      const firstInput = document.getElementById("ir-name");
      if (firstInput) firstInput.focus();
    }
  }

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove("active");
      document.body.style.overflow = "";

      // 닫기 애니메이션 완료 후 상태 복원하여 깜빡임 방지
      setTimeout(() => {
        if (this.form) {
          this.form.reset();
          this.form.style.display = "block";
        }
        if (this.successScreen) this.successScreen.style.display = "none";
      }, 300);
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const msg = this.messages[this.currentLang] || this.messages.ko;

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = msg.submitting;
    }

    const formData = {
      type: this.submitType,
      name: document.getElementById("ir-name").value,
      company: document.getElementById("ir-company").value,
      email: document.getElementById("ir-email").value,
      message: document.getElementById("ir-message").value
    };

    fetch(this.WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      // 성공 시 폼 숨기고 성공 화면 활성화
      if (this.form) this.form.style.display = "none";
      if (this.successScreen) this.successScreen.style.display = "flex";
    })
    .catch((error) => {
      console.error("Submission error:", error);
      alert(msg.error);
    })
    .finally(() => {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = msg.submit;
      }
    });
  }
}
