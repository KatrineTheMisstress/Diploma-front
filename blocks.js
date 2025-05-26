document.addEventListener("DOMContentLoaded", () => {
  const addBlockBtn = document.getElementById("addBlock");
  const blockMenu = document.getElementById("blockMenu");
  const blockList = document.getElementById("blockList");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const previewBtn = document.getElementById("preview");
  const saveAndExitBtn = document.getElementById("saveAndExitBtn");
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("pageId");

  saveAndExitBtn.addEventListener("click", () => {
    window.location.href = "projects.html";
  });

  previewBtn.addEventListener("click", () => {
    if (!pageId) {
      alert("PageId не найден в URL");
      return;
    }
    window.location.href = `preview.html?id=${pageId}`;
  });

  async function fetchBlocksForPage(pageId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/blocks/${pageId}`,
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка загрузки блоков");
      }

      const blocks = await response.json();

      const container = document.getElementById("blocksContainer");
      container.innerHTML = "";

      blocks.forEach((block) => {
        renderBlock(block);
      });
    } catch (error) {
      console.error("Ошибка при загрузке блоков:", error);
    }
  }

  addBlockBtn.addEventListener("click", () => {
    blockMenu.style.display = "block";
    fetchAvailableBlocks();
  });

  closeMenuBtn.addEventListener("click", () => {
    blockMenu.style.display = "none";
  });

  function uploadImage(file) {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("image", file);

    return fetch("http://localhost:3000/upload", {
      method: "POST",
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки изображения");
        return res.json();
        ЫЫ;
      })
      .then((data) => data.imageUrl); // Предполагается, что сервер возвращает { imageUrl: "..." }
  }

  function createBlock(type) {
    const token = localStorage.getItem("accessToken");
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get("pageId");
    const newBlock = {
      page_id: pageId,
      type: type,
      position_x: 100,
      position_y: 100,
      width: 95,
      height: 300,
      settings: {},
    };

    fetch(`http://localhost:3000/api/blocks`, {
      method: "POST",
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBlock),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка создания блока");
        return res.json();
      })
      .then((block) => {
        renderBlock(block);
      })
      .catch((err) => console.error("Ошибка создания блока:", err));
  }

  async function fetchMyPageId() {
    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:3000/api/pages/my", {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить страницу пользователя");
    }

    const page = await response.json();
    return page.id;
  }

  function saveBlockSettings(blockId, settings) {
    fetch(`http://localhost:3000/api/blocks/${blockId}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({ settings }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось сохранить настройки");
        return res.json();
      })
      .then(() => {
        console.log("Настройки блока сохранены");
      })
      .catch((err) => {
        console.error("Ошибка сохранения настроек:", err);
      });
  }

  function updateBlockOrder() {
    const blocks = Array.from(
      document.getElementById("blocksContainer").children
    );
    const orderedBlockIds = blocks.map((block) => block.dataset.blockId);

    fetch("/api/blocks/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({
        pageId: window.pageId,
        orderedBlockIds: orderedBlockIds,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления порядка блоков");
      })
      .catch(console.error);
  }

  function fetchAvailableBlocks() {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:3000/api/blocks/available-blocks", {
      headers: {
        Authorization: `${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки пресетов");
        return res.json();
      })
      .then((blocks) => {
        blockList.innerHTML = ""; // Очистка старого
        blocks.forEach((block) => {
          const li = document.createElement("li");
          li.textContent = block.name; // предполагаем, что у блока есть name
          li.addEventListener("click", () => {
            createBlock(block.type); // или другой способ инициализации
            blockMenu.style.display = "none";
          });
          blockList.appendChild(li);
        });
      })
      .catch((err) => console.error("Ошибка при загрузке блоков:", err));
  }
});
