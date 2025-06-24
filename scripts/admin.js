const tableBody = document.querySelector("#data-table tbody");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalTableBody = document.querySelector("#modal-table tbody");
const token = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", async () => {
  await getCurUser();
  loadTableData();
});

const translateHeaders = {
  type: "Тип блока",
  html_template: "HTML шаблон",
  styles: "Стили",
  json_template: "JSON шаблон",
};

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    Object.keys(translateHeaders).forEach((key) => {
      const td = document.createElement("td");
      td.textContent = row[key];
      td.contentEditable = "true";
      td.setAttribute("data-key", key);
      td.setAttribute("data-index", index);
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

async function getCurUser() {
  try {
    const res = await fetch("http://92.51.23.240:3000/api/auth/curUser", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!res.ok) {
      throw new Error("Ошибка получения пользователя");
    }

    const user = await res.json();

    if (!user.is_admin) {
      // Редиректим, если пользователь не админ
      window.location.href = "/pages/projects.html";
    }

    return user; // если нужно использовать дальше
  } catch (err) {
    console.error("Ошибка при получении текущего пользователя:", err);
    window.location.href = "/pages/projects.html"; // fallback на ошибку
  }
}

function getTableData(tbody) {
  const data = [];
  const rows = tbody.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const rowData = {
      id: row.dataset.id || undefined, // добавляем ID, если он есть
    };
    let valid = true;

    ["type", "html_template", "styles", "json_template"].forEach((key, idx) => {
      const value = cells[idx]?.textContent.trim();
      if (key === "type" || key === "json_template") {
        if (!value) valid = false;
      }
      rowData[key] = value || "";
    });

    if (valid) data.push(rowData);
  });

  return data;
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const data = getTableData(tableBody);
  if (data.length === 0) {
    alert("Нет корректных данных для сохранения.");
    return;
  }

  try {
    const res = await fetch(
      "http://92.51.23.240:3000/api/pages/blocks/update",
      {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      alert("Данные успешно сохранены.");
      loadTableData();
    } else {
      alert("Ошибка при сохранении данных.");
    }
  } catch (e) {
    alert("Сервер не отвечает.");
  }
});

document.getElementById("create-btn").addEventListener("click", () => {
  modal.style.display = "flex";
  modalTableBody.innerHTML = getNewRowHTML();
});

document.getElementById("cancel-modal").addEventListener("click", () => {
  modal.style.display = "none";
});

document.getElementById("add-row").addEventListener("click", () => {
  modalTableBody.insertAdjacentHTML("beforeend", getNewRowHTML());
});

document.getElementById("submit-new").addEventListener("click", async () => {
  const rows = document.querySelectorAll("#modal-table tbody tr");
  const newBlocks = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const rowData = {
      type: cells[0]?.textContent.trim(),
      html_template: cells[1]?.textContent.trim() || "",
      styles: cells[2]?.textContent.trim() || "",
      json_template: cells[3]?.textContent.trim(),
    };

    if (!rowData.type || !rowData.json_template) {
      return alert("Поля 'Тип блока' и 'JSON шаблон' обязательны!");
    }

    newBlocks.push(rowData);
  });

  try {
    const res = await fetch(
      "http://92.51.23.240:3000/api/pages/blocks/create",
      {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBlocks),
      }
    );

    if (!res.ok) throw new Error();

    alert("Новый блок(и) успешно добавлен!");
    modal.style.display = "none";
    loadTableData();
  } catch (e) {
    console.error("Ошибка добавления блока:", e);
    alert("Ошибка при добавлении блока.");
  }
});

async function loadTableData() {
  try {
    const res = await fetch("http://92.51.23.240:3000/api/pages/blocks", {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!res.ok) throw new Error("Ошибка при загрузке данных");

    const data = await res.json();

    const tbody = tableBody;
    tbody.innerHTML = "";

    data.forEach((block) => {
      const row = document.createElement("tr");

      ["type", "html_template", "styles", "json_template"].forEach((key) => {
        const td = document.createElement("td");
        td.contentEditable = "true";
        td.setAttribute("data-key", key);
        td.textContent = block[key] || "";
        row.appendChild(td);
      });

      row.dataset.id = block.id;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
    alert("Не удалось загрузить блоки. Ошибка: " + err.message);
  }
}

modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) {
    modal.style.display = "none";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  window.location.href = "/pages/login.html";
});

function getNewRowHTML() {
  return `
    <tr>
      <td contenteditable="true"></td>
      <td></td>
      <td></td>
      <td contenteditable="true"></td>
    </tr>
  `;
}
