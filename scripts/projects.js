document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("projectList");
  const addProjectBtn = document.getElementById("addProject");
  const projectModal = document.getElementById("projectModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const createProjectBtn = document.getElementById("createProjectBtn");
  const projectNameInput = document.getElementById("projectNameInput");
  const font = document.getElementById("fontSelect").value;
  const bgColor = document.getElementById("bgColorInput").value;
  const padding = parseInt(document.getElementById("paddingInput").value, 10);
  const projectId = document.getElementById("settingsModal").dataset.projectId;

  const token = localStorage.getItem("accessToken");
  addProjectBtn.addEventListener("click", () => {
    projectModal.style.display = "block";
    projectNameInput.value = "";
    projectNameInput.focus();
  });

  closeModalBtn.addEventListener("click", () => {
    projectModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === projectModal) {
      projectModal.style.display = "none";
    }
  });

  createProjectBtn.addEventListener("click", () => {
    const name = projectNameInput.value.trim();
    if (!name) {
      alert("Название проекта не может быть пустым");
      return;
    }

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
        window.location.href = `/pages/constructor.html?pageId=${project.id}`;
      })
      .catch((err) => {
        console.error("Ошибка при создании проекта:", err);
      });
  });

  fetch("http://localhost:3000/api/pages/my", {
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
        projects = [projects];
      }

      projectList.innerHTML = "";

      projects.forEach((project) => {
        const li = document.createElement("li");
        li.className = "project-item";

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "project-content";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = project.name || "Без названия";
        nameSpan.className = "project-name";
        nameSpan.addEventListener("click", () => {
          window.location.href = `/pages/constructor.html?pageId=${project.id}`;
        });

        const settingsBtn = document.createElement("button");
        settingsBtn.textContent = "Настроить проект";
        settingsBtn.className = "settings-btn";
        settingsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openSettingsModal(project.id);
        });

        contentWrapper.appendChild(nameSpan);
        contentWrapper.appendChild(settingsBtn);
        li.appendChild(contentWrapper);
        projectList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Ошибка получения проектов:", err);
    });

  addProjectBtn.addEventListener("click", () => {
    projectModal.style.display = "block";
  });

  const applySettingsBtn = document.getElementById("applySettingsBtn");

  applySettingsBtn.addEventListener("click", () => {
    const settingsModal = document.getElementById("settingsModal");
    const projectId = settingsModal.dataset.projectId;

    const padding = parseInt(document.getElementById("paddingInput").value, 10);
    const font = document.getElementById("fontSelect").value.trim();
    const bgColor = document.getElementById("bgColorInput").value.trim();

    // Сборка базового CSS
    let styles = `body {padding: 0px ${padding}%; font-family: '${font}'`;

    // Добавим background-color ТОЛЬКО если он нужен
    if (bgColor && bgColor !== "#ffffff") {
      styles += `; background-color: ${bgColor}`;
    }

    styles += "}";

    const payload = {
      "global-styles": styles,
      id: projectId,
    };

    console.log(payload);

    fetch(`http://localhost:3000/api/pages/save/global-settings`, {
      method: "POST", // или POST, в зависимости от API
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сохранения настроек");
        return res.json();
      })
      .then(() => {
        alert("Настройки применены");
        settingsModal.style.display = "none";
      })
      .catch((err) => {
        console.error("Ошибка применения настроек:", err);
        alert("Не удалось применить настройки");
      });
  });

  closeModalBtn.addEventListener("click", () => {
    projectModal.style.display = "none";
  });

  function openSettingsModal(projectId) {
    const settingsModal = document.getElementById("settingsModal");
    const fontInput = document.getElementById("fontInput");
    const bgColorInput = document.getElementById("bgColorInput");

    bgColorInput.addEventListener("input", () => {
      console.log("Выбран цвет:", bgColorInput.value);
    });

    bgColorInput.value = "#ffffff";
    bgColorInput.placeholder = "#ffffff";

    settingsModal.dataset.projectId = projectId;
    settingsModal.style.display = "block";
  }

  document.getElementById("fontSelect").addEventListener("change", function () {
    const selectedFont = this.value;
    console.log("Выбран шрифт:", selectedFont);
    // Пример применения
    document.body.style.fontFamily = selectedFont;
  });

  const fontSelect = document.getElementById("fontSelect");

  fontSelect.addEventListener("change", () => {
    const selectedFont = fontSelect.value;
    console.log("Выбран шрифт:", selectedFont);
  });

  createProjectBtn.addEventListener("click", () => {
    const name = projectNameInput.value.trim();
    if (!name) {
      alert("Название проекта не может быть пустым");
      return;
    }

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
        window.location.href = `/pages/constructor.html?pageId=${project.id}`;
      })
      .catch((err) => {
        console.error("Ошибка при создании проекта:", err);
      });
  });
});
