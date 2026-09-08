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