document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("projectList");
  const addProjectBtn = document.getElementById("addProject");
  const projectModal = document.getElementById("projectModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const createProjectBtn = document.getElementById("createProjectBtn");
  const projectNameInput = document.getElementById("projectNameInput");

  const token = localStorage.getItem("accessToken");

  // projects.js
  document.addEventListener("DOMContentLoaded", () => {
    const addProjectBtn = document.getElementById("addProjectBtn");
    const projectModal = document.getElementById("projectModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const createProjectBtn = document.getElementById("createProjectBtn");
    const projectNameInput = document.getElementById("projectNameInput");

    // Открыть модальное окно
    addProjectBtn.addEventListener("click", () => {
      projectModal.style.display = "block";
      projectNameInput.value = "";
      projectNameInput.focus();
    });

    // Закрыть модальное окно
    closeModalBtn.addEventListener("click", () => {
      projectModal.style.display = "none";
    });

    // Закрыть модальное окно при клике вне его
    window.addEventListener("click", (event) => {
      if (event.target === projectModal) {
        projectModal.style.display = "none";
      }
    });

    // Создать новый проект
    createProjectBtn.addEventListener("click", () => {
      const name = projectNameInput.value.trim();
      if (!name) {
        alert("Название проекта не может быть пустым");
        return;
      }

      const token = localStorage.getItem("accessToken");

      fetch("http://localhost:3000/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ name }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка создания проекта");
          return res.json();
        })
        .then((project) => {
          window.location.href = `/constructor.html?pageId=${project.id}`;
        })
        .catch((err) => {
          console.error("Ошибка при создании проекта:", err);
        });
    });
  });

  // Загрузить все проекты пользователя
  fetch("http://localhost:3000/api/api/pages/my", {
    headers: {
      Authorization: `${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Ошибка загрузки проектов");
      return res.json();
    })
    .then((projects) => {
      if (!Array.isArray(projects)) {
        projects = [projects]; // если возвращается один
      }

      projectList.innerHTML = "";

      projects.forEach((project) => {
        const li = document.createElement("li");
        li.textContent = project.name || "Без названия";
        li.className = "project-item";
        li.addEventListener("click", () => {
          window.location.href = `/constructor.html?pageId=${project.id}`;
        });
        projectList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Ошибка получения проектов:", err);
    });

  // Открыть модалку
  addProjectBtn.addEventListener("click", () => {
    projectModal.style.display = "block";
  });

  // Закрыть модалку
  closeModalBtn.addEventListener("click", () => {
    projectModal.style.display = "none";
  });

  // Создать новый проект
  createProjectBtn.addEventListener("click", () => {
    const name = projectNameInput.value.trim();
    if (!name) {
      alert("Название проекта не может быть пустым");
      return;
    }

    fetch("http://localhost:3000/api/api/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка создания проекта");
        return res.json();
      })
      .then((project) => {
        window.location.href = `/constructor.html?pageId=${project.id}`;
      })
      .catch((err) => {
        console.error("Ошибка при создании проекта:", err);
      });
  });
});
