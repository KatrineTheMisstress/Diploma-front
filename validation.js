document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("form").addEventListener("submit", validateForm);
});

function validateForm(event) {
  event.preventDefault();
  let isValid = true;

  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const usernameValidation = document.getElementById("username-validation");
  const passwordValidation = document.getElementById("password-validation");
  const validationSummary = document.getElementById("validation-summary");

  usernameValidation.textContent = "";
  passwordValidation.textContent = "";
  validationSummary.textContent = "";

  if (!username.value.trim()) {
    usernameValidation.textContent = "Пожалуйста, введите логин.";
    isValid = false;
  }

  if (!password.value.trim()) {
    passwordValidation.textContent = "Пожалуйста, введите пароль.";
    isValid = false;
  }

  if (isValid) {
    if (isValid) {
      submitForm();
    }
  } else {
    validationSummary.textContent = "Пожалуйста, исправьте ошибки ниже.";
  }
}
