/**
 * Worflogy Education Portal Contact Modal Logic
 * WorflogyModal 공통 클래스를 이용한 리팩토링 적용
 */
document.addEventListener("DOMContentLoaded", () => {
  new WorflogyModal({
    openBtnId: "open-contact-modal",
    closeBtnId: "close-ir-modal",
    cancelBtnId: "cancel-ir-modal",
    backdropId: "ir-modal-backdrop",
    formId: "ir-proposal-form",
    submitBtnId: "submit-ir-modal",
    successScreenId: "ir-success-screen",
    successCloseBtnId: "success-close-btn",
    submitType: "edu"
   });
});
