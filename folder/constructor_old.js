let availableBlockTypes = [];
let pageId = null;
let pageStructure = [];

const addBlockPlaceholder = document.getElementById("add-block-placeholder");

import { blockTemplates } from "./blockTemplates.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  pageId = params.get("pageId");
  if (!pageId) {
    alert("Page ID не указан");
    return;
  }

  await renderBlockTypesList();
  await loadPageData();
  setupUIEvents();
});

function setupUIEvents() {
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) saveBtn.addEventListener("click", savePage);

  const placeholder = document.getElementById("add-block-placeholder");
  if (placeholder)
    placeholder.addEventListener("click", () => {
      document.getElementById("blockTypeModal")?.classList.remove("hidden");
    });

  const closeBtn = document.getElementById("closeBlockTypeModal");
  if (closeBtn)
    closeBtn.addEventListener("click", () => {
      document.getElementById("blockTypeModal")?.classList.add("hidden");
    });

  const addBtn = document.getElementById("add-block-btn");
  if (addBtn)
    addBtn.addEventListener("click", () => {
      const blockType = document.getElementById("contentModal").dataset.type;
      const template = blockTemplates.find((t) => t.id === blockType);
      if (!template) return alert("Неизвестный тип блока");

      let content = template.content;
      if (blockType === "zero-block") {
        const raw = document.getElementById("block-content").value.trim();
        try {
          const parsed = JSON.parse(raw);
          content = JSON.stringify(parsed);
        } catch (e) {
          return alert("Невалидный JSON в zero-block");
        }
      }

      pageStructure.push({ type: blockType, content });
      document.getElementById("contentModal").classList.add("hidden");
      document.getElementById("block-content").value = "";
      renderPageStructure();
    });
}

availableBlockTypes = blockTemplates;

function renderBlockTypesList() {
  const list = document.getElementById("block-type-list");
  list.innerHTML = "";

  availableBlockTypes.forEach((type) => {
    const li = document.createElement("li");
    li.textContent = type.name;
    li.className =
      "block hover:bg-blue-100 transition-all duration-200 p-3 rounded cursor-pointer mb-2 shadow-sm";

    li.addEventListener("click", () => {
      document.getElementById("blockTypeModal").classList.add("hidden");

      const newBlock = {
        id: crypto.randomUUID(),
        type: type.id,
        content: type.content,
      };

      pageStructure.push(newBlock);
      renderPageStructure();
    });

    list.appendChild(li);
  });
}

async function loadPageData() {
  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`http://localhost:3000/api/blocks/page/${pageId}`, {
      headers: { Authorization: `${token}` },
    });

    if (!res.ok) throw new Error("Ошибка загрузки страницы");

    const blocks = await res.json();

    if (!Array.isArray(blocks)) {
      throw new Error("Ожидался массив блоков, но пришло что-то другое");
    }

    // Преобразуем, если нужно, в формат pageStructure
    pageStructure = blocks.map((block) => ({
      id: block.id,
      type: block.type,
      content: JSON.stringify(block.settings || {}), // Приводим к строке, как ожидается
    }));

    renderPageStructure();
  } catch (err) {
    console.error("Ошибка загрузки данных страницы:", err);
    pageStructure = [];
    renderPageStructure();
  }
}

function addBlockFromTemplate(template) {
  const newBlock = {
    ...template,
    id: crypto.randomUUID(),
  };
  pageStructure.push(newBlock);
  renderPageStructure();
}

function renderPageStructure() {
  const container = document.getElementById("blocks-container");
  //   container.innerHTML = "";

  if (!pageStructure.length) {
    document.getElementById("empty-placeholder").classList.remove("hidden");
    return;
  }

  //document.getElementById("empty-placeholder").classList.add("hidden");

  pageStructure.forEach((block, index) => {
    const el = document.createElement("div");
    el.className = "block-preview p-4 border rounded mb-4 bg-white";
    el.dataset.id = block.id;

    let contentHTML = "";

    try {
      const parsed = JSON.parse(block.content);
      switch (block.type) {
        case "imageText":
          contentHTML = `
            <div class="flex gap-4">
              <input type="text" placeholder="URL изображения" value="${parsed.imageUrl}" class="w-1/2 p-2 border rounded" />
              <input type="text" placeholder="Текст рядом с картинкой" value="${parsed.text}" class="w-1/2 p-2 border rounded" />
            </div>`;
          break;

        case "slider":
          contentHTML =
            parsed.images
              .map(
                (url, i) =>
                  `<input type="text" value="${url}" placeholder="URL изображения #${
                    i + 1
                  }" class="block w-full p-2 border rounded mt-2"/>`
              )
              .join("") +
            `<button class="mt-2 text-blue-500">+ Добавить изображение</button>`;
          break;

        case "columns":
          contentHTML = parsed.columns
            .map((col, i) => {
              if (col.type === "text") {
                return `<textarea placeholder="Текст колонка #${
                  i + 1
                }" class="block w-full p-2 border rounded mt-2">${
                  col.value
                }</textarea>`;
              } else if (col.type === "image") {
                return `<input type="text" value="${
                  col.value
                }" placeholder="URL картинки колонка #${
                  i + 1
                }" class="block w-full p-2 border rounded mt-2"/>`;
              }
            })
            .join("");
          break;

        case "textBlock":
          contentHTML = `
            <input type="text" placeholder="Заголовок" value="${parsed.title}" class="block w-full p-2 border rounded mb-2" />
            <textarea placeholder="Описание" class="block w-full p-2 border rounded">${parsed.description}</textarea>
          `;
          break;

        case "header":
          contentHTML =
            parsed.menu
              .map(
                (item, i) =>
                  `<input type="text" value="${item}" placeholder="Пункт меню #${
                    i + 1
                  }" class="block w-full p-2 border rounded mt-2" />`
              )
              .join("") +
            `<button class="mt-2 text-blue-500">+ Добавить пункт</button>`;
          break;

        case "footer":
          contentHTML = `
            <textarea placeholder="Текст подвала" class="block w-full p-2 border rounded">${parsed.text}</textarea>`;
          break;

        case "zero-block":
          contentHTML = `
            <textarea class="block w-full p-2 border rounded font-mono" placeholder="{ JSON блок }">${block.content}</textarea>`;
          break;

        default:
          contentHTML = `<div class="text-gray-500">Неизвестный тип блока: ${block.type}</div>`;
      }
    } catch {
      if (block.type === "title") {
        contentHTML = `<input type="text" value="${block.content}" placeholder="Заголовок" class="block w-full p-2 text-2xl font-bold border rounded"/>`;
      } else if (block.type === "text") {
        contentHTML = `<textarea placeholder="Текст" class="block w-full p-2 border rounded">${block.content}</textarea>`;
      } else {
        contentHTML = `<div class="text-red-500">Ошибка в контенте блока</div>`;
      }
    }

    el.innerHTML = contentHTML;

    // Кнопка удаления
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "❌";
    removeBtn.title = "Удалить блок";
    removeBtn.className = "float-right cursor-pointer text-red-500 font-bold";
    removeBtn.onclick = () => {
      pageStructure.splice(index, 1);
      renderPageStructure();
    };

    el.prepend(removeBtn);
    container.appendChild(el);
  });

  setupSortable(container);
}

function setupSortable(container) {
  Sortable.create(container, {
    animation: 150,
    onEnd: async (evt) => {
      const newOrder = Array.from(container.children).map(
        (child) => child.dataset.id
      );

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `http://localhost:3000/api/pages/${pageId}/reorder-blocks`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({ orderedBlockIds: newOrder }),
          }
        );

        if (!res.ok) throw new Error("Ошибка при сохранении порядка блоков");

        // Обновим pageStructure по новому порядку
        const updatedBlocks = await res.json();
        pageStructure = updatedBlocks;
        renderPageStructure();
      } catch (err) {
        console.error("Ошибка reorder:", err);
        alert("Не удалось обновить порядок блоков");
      }
    },
  });
}

async function savePage() {
  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`http://localhost:3000/api/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        content: JSON.stringify(pageStructure),
      }),
    });

    if (!res.ok) throw new Error("Ошибка сохранения страницы");

    alert("Страница сохранена!");
  } catch (err) {
    console.error(err);
    alert("Ошибка при сохранении страницы");
  }
}
