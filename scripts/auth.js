document.addEventListener("DOMContentLoaded", function () {
  const authTitle = document.getElementById("auth-title");
  const authButton = document.getElementById("auth-button");
  const toggleAuth = document.getElementById("toggle-auth");
  let isLogin = true;

  toggleAuth.addEventListener("click", function () {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? "Войти и начать создание" : "Регистрация";
    authButton.textContent = isLogin
      ? "Войти и начать создание"
      : "Зарегистрироваться";
    toggleAuth.textContent = isLogin
      ? "Зарегистрироваться"
      : "Уже есть аккаунт? Войти";
  });
});

function submitForm() {
  const form = document.getElementById("auth-form");

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  console.log(data);

  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((result) => {
      localStorage.setItem("accessToken", result.acessToken);
      return fetch("http://localhost:3000/api/auth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: result.acessToken,
        },
      });
      console.log("Из LocalStorage:", localStorage.getItem("accessToken"));
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }
      return response.json();
    })
    .then((userInfo) => {
      console.log(userInfo);
      window.location.href = "/projects.html";
      console.log("Из LocalStorage:", localStorage.getItem("accessToken"));
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Логин или пароль неверен");
    });
}
