const addBlockPlaceholder = document.getElementById("add-block-placeholder");
const blockTypeModal = document.getElementById("blockTypeModal");
const blockTypeList = document.getElementById("block-type-list");
const closeBlockTypeModal = document.getElementById("closeBlockTypeModal");
const formsContainer = document.querySelector(".forms-container");
const token = localStorage.getItem("accessToken");

async function fetchBlockTypes() {
  const response = await fetch("http://localhost:3000/api/pages/all-blocks", {
    headers: {
      Authorization: `${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Ошибка при получении блоков");
  }

  const data = await response.json();
  return data;
}

const namingPlaceholders = {
  title: "Введите заголовок",
  content: "Введите содержимое",
  imageUrl: "Введите ссылку на изображение",
  caption: "Введите подпись к изображению",
  images: "Введите ссылку на изображение",
  footer: "Введите содержимое подвала",
  header: "Введите название компании",
  code: "Вставьте свой html-код в это поле",
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get("pageId");
    const token = localStorage.getItem("accessToken");

    const saveBtn = document.getElementById("download-page");
    saveBtn.href = `http://localhost:3000/api/pages/${pageId}/download`;

    const allTypes = await fetchBlockTypes();
    const typesMap = Object.fromEntries(
      allTypes.map((t) => [t.type, t.schema])
    );

    const response = await fetch(
      `http://localhost:3000/api/pages/one/${pageId}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    if (!response.ok) throw new Error("Ошибка загрузки данных страницы");

    const data = await response.json();
    const blocks = data.page_data.data;

    for (const block of blocks) {
      const blockType = block.type;
      const blockData = block.data;

      const schema = typesMap[blockType];
      if (!schema) {
        console.warn(`Не найдена схема для типа блока: ${blockType}`);
        continue;
      }

      renderFormInContainer(blockType, schema, blockData);
    }
  } catch (err) {
    console.error("Ошибка инициализации страницы:", err);
  }
});

addBlockPlaceholder.addEventListener("click", async () => {
  const types = await fetchBlockTypes();
  blockTypeList.innerHTML = "";

  types.forEach((type) => {
    const item = document.createElement("div");
    item.textContent = type.type;
    item.classList.add("block-type-item");
    item.addEventListener("click", () => {
      blockTypeModal.classList.add("hidden");
      renderFormInContainer(type.type, type.schema);
    });
    blockTypeList.appendChild(item);
  });

  blockTypeModal.classList.remove("hidden");
});

closeBlockTypeModal.addEventListener("click", () => {
  blockTypeModal.classList.add("hidden");
});

function renderFormInContainer(type, schema, prefilledData = {}) {
  const formWrapper = document.createElement("div");
  formWrapper.classList.add("form-block");
  formWrapper.dataset.blockType = type;

  const header = document.createElement("h4");
  header.textContent = type;
  formWrapper.appendChild(header);

  const arrowsContainer = document.createElement("div");
  arrowsContainer.classList.add("arrows-container");

  const upArrow = document.createElement("button");
  upArrow.textContent = "↑";
  upArrow.classList.add("arrow-btn");
  upArrow.title = "Изменить позицию блока";
  upArrow.addEventListener("click", () => moveBlock(formWrapper, -1));

  const downArrow = document.createElement("button");
  downArrow.textContent = "↓";
  downArrow.classList.add("arrow-btn");
  downArrow.title = "Изменить позицию блока";
  downArrow.addEventListener("click", () => moveBlock(formWrapper, 1));

  arrowsContainer.appendChild(upArrow);
  arrowsContainer.appendChild(downArrow);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.title = "Удаление блока";

  const deleteIcon = document.createElement("img");
  deleteIcon.src = "/ico/delete.svg";
  deleteIcon.alt = "Удалить блок";
  deleteIcon.style.width = "20px";
  deleteIcon.style.height = "20px";

  deleteBtn.appendChild(deleteIcon);
  deleteBtn.addEventListener("click", () => openDeleteModal(formWrapper));
  arrowsContainer.appendChild(deleteBtn);

  formWrapper.appendChild(arrowsContainer);

  schema.forEach((field) => {
    let input;
    if (field.type === "long-text") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.name = field.naming;
    input.dataset.naming = field.naming;
    input.placeholder = namingPlaceholders[field.naming] || field.naming;

    if (prefilledData[field.naming] !== undefined) {
      input.value = prefilledData[field.naming];
    }

    formWrapper.appendChild(input);
  });

  const styleMenu = document.createElement("div");
  styleMenu.classList.add("style-menu", "hidden");

  const colorLabel = document.createElement("label");
  colorLabel.textContent = "Цвет блока:";
  const colorInput = document.createElement("input");
  colorInput.type = "color";

  const borderLabel = document.createElement("label");
  borderLabel.textContent = "Края блока:";
  const borderSelect = document.createElement("select");
  borderSelect.classList.add("border-select");
  ["0px", "8px", "16px", "24px"].forEach((val) => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    borderSelect.appendChild(option);
  });

  const applyStyleBtn = document.createElement("button");
  applyStyleBtn.textContent = "Применить";
  applyStyleBtn.classList.add("apply-style-btn");

  applyStyleBtn.addEventListener("click", () => {
    formWrapper.style.backgroundColor = colorInput.value;
    formWrapper.style.borderRadius = borderSelect.value;
    styleMenu.classList.add("hidden");
  });

  styleMenu.appendChild(colorLabel);
  styleMenu.appendChild(colorInput);
  styleMenu.appendChild(borderLabel);
  styleMenu.appendChild(borderSelect);
  styleMenu.appendChild(applyStyleBtn);
  formWrapper.appendChild(styleMenu);

  const styleBtn = document.createElement("button");
  styleBtn.classList.add("style-btn");
  styleBtn.title = "Изменить стили блока";

  const brushIcon = document.createElement("img");
  brushIcon.src = "/ico/brush.svg";
  brushIcon.alt = "Изменить стили";
  brushIcon.style.width = "20px";
  brushIcon.style.height = "20px";

  styleBtn.appendChild(brushIcon);
  styleBtn.addEventListener("click", () => {
    styleMenu.classList.toggle("hidden");
  });

  arrowsContainer.appendChild(styleBtn);
  formWrapper.appendChild(arrowsContainer);

  formsContainer.appendChild(formWrapper);
}

function moveBlock(element, direction) {
  const parent = element.parentNode;
  const children = Array.from(parent.children);
  const index = children.indexOf(element);

  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= children.length) return;

  const referenceNode =
    direction === 1 ? children[newIndex].nextSibling : children[newIndex];
  parent.insertBefore(element, referenceNode);
}

const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", () => {
  const forms = document.querySelectorAll(".form-block");
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("pageId");
  const result = {
    pageId: pageId,
    data: [],
  };

  forms.forEach((form) => {
    const type = form.dataset.blockType;
    const inputs = form.querySelectorAll("input, textarea");
    const blockData = {};

    inputs.forEach((input) => {
      const key = input.dataset.naming;
      const value = input.value;
      blockData[key] = value;
    });

    result.data.push({
      type,
      data: blockData,
    });
  });
  fetch("http://localhost:3000/api/pages/save", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Ошибка создания проекта");
      return res.json(); // если ожидается JSON-ответ
    })
    .then((data) => {
      alert("Сохранено успешно");
      console.log("Ответ от сервера:", data);
    })
    .catch((err) => {
      console.error(err);
      alert("Произошла ошибка при сохранении");
    });

  console.log(result);
});

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const downloadHref = "http://localhost:3000/api/pages/${pageId}/download";

let blockToDelete = null;

function openDeleteModal(blockElement) {
  blockToDelete = blockElement;
  deleteModal.classList.remove("hidden");
}

confirmDeleteBtn.addEventListener("click", () => {
  if (blockToDelete) {
    blockToDelete.remove();
    blockToDelete = null;
  }
  deleteModal.classList.add("hidden");
});

cancelDeleteBtn.addEventListener("click", () => {
  blockToDelete = null;
  deleteModal.classList.add("hidden");
});

const previewBtn = document.getElementById("preview");
previewBtn.addEventListener("click", () => {
  console.log("aaaaaaaaaaaa");
  const forms = document.querySelectorAll(".form-block");
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("pageId");
  const result = {
    pageId: pageId,
    data: [],
  };

  forms.forEach((form) => {
    const type = form.dataset.blockType;
    const inputs = form.querySelectorAll("input, textarea");
    const blockData = {};

    inputs.forEach((input) => {
      const key = input.dataset.naming;
      const value = input.value;
      blockData[key] = value;
    });

    result.data.push({
      type,
      data: blockData,
    });
  });

  localStorage.setItem("preview-data", JSON.stringify(result));

  window.open("/pages/preview.html", "_blank");
});
