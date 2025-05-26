function renderBlock(block) {
  const container = document.getElementById("blocksContainer");

  const el = document.createElement("div");
  const title = document.createElement("h2");
  const text = document.createElement("p");
  const editIcon = document.createElement("div");
  const content = document.createElement("div");
  const uploadIcon = document.createElement("div");
  const upIcon = document.createElement("div");
  const downIcon = document.createElement("div");
  const deleteIcon = document.createElement("div");

  function rerenderBlock(containerId, renderFunction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    renderFunction(container);
  }

  title.addEventListener("blur", () => {
    saveBlockSettings(block.id, {
      ...block.settings,
      title: title.textContent,
    });
  });

  content.addEventListener("blur", () => {
    saveBlockSettings(block.id, {
      ...block.settings,
      text: content.textContent,
    });
  });

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Ошибка загрузки изображения");
    }

    const data = await response.json();
    return data.imageUrl;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const pageId = await fetchMyPageId();
      window.pageId = pageId;

      fetchBlocksForPage(pageId);
      setupUI();
    } catch (err) {
      console.error("Ошибка при инициализации страницы:", err);
    }
  });

  async function fetchBlocksForPage(pageId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/pages/${pageId}/blocks`,
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );

      if (!response.ok) throw new Error("Ошибка загрузки блоков");

      const blocks = await response.json();
      const container = document.getElementById("blocksContainer");
      container.innerHTML = "";

      blocks.forEach((block) => {
        renderBlock(block);
      });

      console.log("Загружено блоков:", blocks.length);
    } catch (err) {
      console.error("Ошибка загрузки блоков:", err);
    }
  }

  editIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    const color = prompt("Введите цвет фона (например, #fce4ec):");
    if (color) {
      el.style.backgroundColor = color;
    }
  });
  document.querySelectorAll(".edit-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const color = prompt("Введите цвет фона (например, #ff0000):");
      if (color) {
        icon.parentElement.style.backgroundColor = color;
      }
    });
  });

  el.classList.add("block");
  el.style.position = "relative";
  el.style.width = `${block.width}%`;
  el.style.height = `${block.height}px`;
  el.style.padding = "24px";
  el.style.boxSizing = "border-box";
  el.style.border = "2px dashed #ccc";
  el.style.borderRadius = "12px";
  el.style.backgroundColor = "#fdfdfd";
  el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
  el.style.fontFamily = "'Montserrat', sans-serif";
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.justifyContent = "center";
  el.style.alignItems = "center";
  el.style.textAlign = "center";
  el.style.gap = "16px";

  el.dataset.blockId = block.id;

  el.appendChild(editIcon);
  el.appendChild(uploadIcon);
  el.appendChild(upIcon);
  el.appendChild(downIcon);
  el.appendChild(deleteIcon);

  el.addEventListener("mouseenter", () => {
    editIcon.style.opacity = "1";
    upIcon.style.opacity = "1";
    downIcon.style.opacity = "1";
    deleteIcon.style.opacity = "1";
    if (block.type === "image" || block.type === "carousel") {
      uploadIcon.style.opacity = "1";
    }
  });

  el.addEventListener("mouseleave", () => {
    editIcon.style.opacity = "0";
    upIcon.style.opacity = "0";
    downIcon.style.opacity = "0";
    deleteIcon.style.opacity = "0";
    if (block.type === "image" || block.type === "carousel") {
      uploadIcon.style.opacity = "0";
    }
  });

  title.contentEditable = true;
  title.style.fontSize = "24px";
  title.style.fontWeight = "bold";
  title.style.margin = "0";
  title.style.outline = "none";
  content.contentEditable = true;
  content.textContent = block.settings?.text || "Введите текст...";
  content.style.width = "90%";
  content.style.minHeight = "100px";
  content.style.padding = "12px";
  content.style.fontSize = "16px";
  content.style.border = "1px solid #ccc";
  content.style.borderRadius = "8px";
  content.style.outline = "none";
  content.style.whiteSpace = "pre-wrap";
  content.style.wordBreak = "break-word";

  editIcon.className = "edit-icon";
  editIcon.innerHTML = "✏️";
  el.appendChild(editIcon);
  editIcon.title = "Изменить цвет блока";
  editIcon.style.position = "absolute";
  editIcon.style.top = "10px";
  editIcon.style.right = "10px";
  editIcon.style.cursor = "pointer";
  editIcon.style.opacity = "0";
  editIcon.style.transition = "opacity 0.3s";

  if (block.type === "image" || block.type === "carousel") {
    uploadIcon.innerHTML = "🖼️";
    uploadIcon.title = "Загрузить изображение";
    uploadIcon.className = "edit-icon";
    uploadIcon.style.position = "absolute";
    uploadIcon.style.top = "10px";
    uploadIcon.style.right = "40px";
    uploadIcon.style.cursor = "pointer";
    uploadIcon.style.opacity = "0";
    uploadIcon.style.transition = "opacity 0.3s";

    uploadIcon.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
          uploadImage(file).then((imageUrl) => {
            const img = el.querySelector("img");
            if (img) {
              img.src = imageUrl;
            } else {
              const newImg = document.createElement("img");
              newImg.src = imageUrl;
              newImg.style.width = "100%";
              newImg.style.height = "auto";
              el.appendChild(newImg);
            }
            saveBlockSettings(block.id, { src: imageUrl });
          });
        }
      };
      fileInput.click();
    });

    el.appendChild(uploadIcon);
  }

  deleteIcon.innerHTML = "➖";
  deleteIcon.title = "Удалить блок";
  deleteIcon.className = "edit-icon";
  deleteIcon.style.position = "absolute";
  deleteIcon.style.top = "10px";
  deleteIcon.style.right = "70px";
  deleteIcon.style.cursor = "pointer";
  deleteIcon.style.opacity = "0";
  deleteIcon.style.transition = "opacity 0.3s";

  deleteIcon.addEventListener("click", () => {
    if (confirm("Вы уверены, что хотите удалить этот блок?")) {
      fetch(`/blocks/${block.id}`, {
        method: "DELETE",
      }).then(() => {
        el.remove();
      });
    }
    el.appendChild(deleteIcon);
  });

  function saveBlockSettings(blockId, settings) {
    fetch(`http://localhost:3000/api/blocks/${blockId}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({ settings }),
    }).catch((err) => {
      console.error("Ошибка сохранения настроек блока:", err);
    });
  }

  upIcon.innerHTML = "⬆️";
  upIcon.title = "Переместить вверх";
  upIcon.className = "place-icon";
  upIcon.style.position = "absolute";
  upIcon.style.top = "calc(50% - 20px)";
  upIcon.style.right = "10px";
  upIcon.style.cursor = "pointer";
  upIcon.style.opacity = "0";
  upIcon.style.transition = "opacity 0.3s";

  downIcon.innerHTML = "⬇️";
  downIcon.title = "Переместить вниз";
  downIcon.className = "place-icon";
  downIcon.style.position = "absolute";
  downIcon.style.top = "calc(50% + 10px)";
  downIcon.style.right = "10px";
  downIcon.style.cursor = "pointer";
  downIcon.style.opacity = "0";
  downIcon.style.transition = "opacity 0.3s";

  upIcon.addEventListener("click", () => {
    const currentBlock = el;
    const prevBlock = currentBlock.previousElementSibling;
    if (prevBlock) {
      container.insertBefore(currentBlock, prevBlock);
      updateBlockOrderOnServer();
    }
  });

  downIcon.addEventListener("click", () => {
    const currentBlock = el;
    const nextBlock = currentBlock.nextElementSibling;
    if (nextBlock) {
      container.insertBefore(nextBlock, currentBlock);
      updateBlockOrderOnServer();
    }
  });

  title.addEventListener("blur", () => {
    saveBlockSettings(block.id, {
      ...block.settings,
      title: title.textContent,
    });
  });

  content.addEventListener("blur", () => {
    saveBlockSettings(block.id, {
      ...block.settings,
      text: content.textContent,
    });
  });

  function updateBlockOrderOnServer() {
    const container = document.getElementById("blocksContainer");
    const blocks = Array.from(container.children);
    const orderedBlockIds = Array.from(container.children)
      .map((el) => el.dataset.blockId)
      .filter((id) => id !== undefined && id !== null && id !== "");
    console.log(orderedBlockIds);

    fetch("http://localhost:3000/api/blocks/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({
        pageId: window.pageId,
        orderedBlockIds,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка обновления порядка блоков");
        }
        return res.json();
      })
      .then(console.log)
      .catch(console.error);
  }

  switch (block.type) {
    case "carousel": {
      el.style.flexDirection = "column";

      // Заголовок
      const carouselTitle = document.createElement("h2");
      carouselTitle.contentEditable = true;
      carouselTitle.textContent = block.settings?.title || "Карусель";
      carouselTitle.style.fontSize = "24px";
      carouselTitle.style.fontWeight = "bold";
      carouselTitle.style.outline = "none";
      carouselTitle.addEventListener("blur", () => {
        block.settings.title = carouselTitle.textContent;
        saveBlockSettings(block.id, block.settings);
      });
      el.appendChild(carouselTitle);

      // Swiper контейнер
      const swiperContainer = document.createElement("div");
      swiperContainer.className = "swiper";
      swiperContainer.style.width = "100%";
      swiperContainer.style.height = "300px";

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      //const slides = block.settings.slides?.length ? block.settings.slides : [];
      const slides = block.settings.slides || [];

      slides.forEach((slide, index) => {
        const slideEl = createSlideElement(slide.imageUrl, slide.text, index);
        swiperWrapper.appendChild(slideEl);
      });

      swiperContainer.appendChild(swiperWrapper);

      // Кнопки навигации и пагинация
      const prev = document.createElement("div");
      prev.className = "swiper-button-prev";
      const next = document.createElement("div");
      next.className = "swiper-button-next";
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";

      swiperContainer.appendChild(prev);
      swiperContainer.appendChild(next);
      swiperContainer.appendChild(pagination);
      el.appendChild(swiperContainer);

      // Инициализация Swiper
      let swiperInstance;
      setTimeout(() => {
        swiperInstance = new Swiper(swiperContainer, {
          loop: false,
          navigation: { nextEl: next, prevEl: prev },
          pagination: { el: pagination, clickable: true },
        });
      }, 0);

      // Кнопка добавления слайда
      const addSlideBtn = document.createElement("button");
      addSlideBtn.textContent = "+ Добавить слайд";
      addSlideBtn.style.marginTop = "10px";
      addSlideBtn.style.alignSelf = "flex-start";
      addSlideBtn.style.padding = "8px 16px";
      addSlideBtn.style.border = "none";
      addSlideBtn.style.background = "#007bff";
      addSlideBtn.style.color = "white";
      addSlideBtn.style.borderRadius = "6px";
      addSlideBtn.style.cursor = "pointer";
      el.appendChild(addSlideBtn);

      // Модалка
      const modal = document.getElementById("slideModal");
      const slideTextInput = document.getElementById("slideText");
      const slideImageInput = document.getElementById("slideImage");
      const saveSlideBtn = document.getElementById("saveSlideBtn");
      const cancelSlideBtn = document.getElementById("cancelSlideBtn");

      addSlideBtn.addEventListener("click", () => {
        slideTextInput.value = "";
        slideImageInput.value = "";
        modal.style.display = "block";
      });

      cancelSlideBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });

      saveSlideBtn.addEventListener("click", async () => {
        const text = slideTextInput.value;
        const imageFile = slideImageInput.files[0];

        if (!text || !imageFile) {
          alert("Заполните текст и выберите изображение");
          return;
        }

        const imageUrl = await uploadImage(imageFile);

        if (!block.settings) block.settings = {};
        if (!block.settings.slides) block.settings.slides = [];

        const newSlide = { imageUrl, text };
        block.settings.slides.push(newSlide);
        saveBlockSettings(block.id, { slides: block.settings.slides });

        // Создать новый DOM элемент и добавить в Swiper
        const index = block.settings.slides.length - 1;
        const newSlideEl = createSlideElement(imageUrl, text, index);
        swiperInstance.appendSlide(newSlideEl);

        modal.style.display = "none";
      });

      // Функция создания слайда
      function createSlideElement(imageUrl, text, index) {
        const slideEl = document.createElement("div");
        slideEl.className = "swiper-slide";
        slideEl.style.position = "relative";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.width = "100%";
        img.style.height = "250px";
        img.style.objectFit = "cover";
        img.style.cursor = "pointer";

        img.addEventListener("click", () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (file) {
              uploadImage(file).then((newImageUrl) => {
                img.src = newImageUrl;
                block.settings.slides[index].imageUrl = newImageUrl;
                saveBlockSettings(block.id, { slides: block.settings.slides });
              });
            }
          };
          fileInput.click();
        });

        const textOverlay = document.createElement("div");
        textOverlay.contentEditable = true;
        textOverlay.textContent = text;
        textOverlay.style.position = "absolute";
        textOverlay.style.bottom = "10px";
        textOverlay.style.left = "10px";
        textOverlay.style.color = "white";
        textOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        textOverlay.style.padding = "6px 12px";
        textOverlay.style.borderRadius = "8px";
        textOverlay.style.outline = "none";

        textOverlay.addEventListener("blur", () => {
          block.settings.slides[index].text = textOverlay.textContent;
          saveBlockSettings(block.id, { slides: block.settings.slides });
        });

        slideEl.appendChild(img);
        slideEl.appendChild(textOverlay);

        return slideEl;
      }

      break;
    }

    case "text":
      title.textContent = block.settings?.title || "Заголовок блока";
      title.setAttribute("contenteditable", "true");

      text.textContent = block.settings?.text || "Ваш текст...";
      text.setAttribute("contenteditable", "true");
      el.appendChild(title);
      el.appendChild(content);
      break;

    case "image":
      title.textContent = block.settings?.title || "Заголовок блока";
      title.setAttribute("contenteditable", "true");

      text.textContent = block.settings?.text || "Ваш текст...";
      text.setAttribute("contenteditable", "true");
      const imageTitle = document.createElement("h2");
      imageTitle.contentEditable = true;
      imageTitle.textContent = "Изображение";
      imageTitle.style.fontSize = "24px";
      imageTitle.style.fontWeight = "bold";
      imageTitle.style.outline = "none";

      const img = document.createElement("img");
      img.src = block.settings?.src || "https://via.placeholder.com/300";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";

      el.appendChild(imageTitle);
      el.appendChild(img);
      break;

    case "menu":
      const menu = document.createElement("nav");
      menu.style.width = "100%";
      menu.style.margin = "0";
      menu.style.padding = "0";
      menu.style.display = "flex";
      menu.style.height = "40px";
      menu.style.justifyContent = "space-around";
      menu.style.backgroundColor = "#eee";
      (block.settings?.items || []).forEach((item) => {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = item;
        link.style.padding = "10px";
        link.style.textDecoration = "none";
        link.style.color = "#333";
        menu.appendChild(link);
      });
      el.style.width = "100%";
      el.style.padding = "0";
      el.style.border = "none";
      el.appendChild(menu);
      break;

    case "footer":
      const footer = document.createElement("footer");
      footer.style.width = "100%";
      footer.style.textAlign = "center";
      footer.style.height = "40px";
      footer.style.padding = "20px";
      footer.style.backgroundColor = "#f1f1f1";
      footer.textContent = block.settings?.text || "© 2025 Ваша компания";
      el.style.width = "100%";
      el.style.padding = "0";
      el.style.border = "none";
      el.appendChild(footer);
      break;

    case "custom-html":
      const customDiv = document.createElement("div");
      customDiv.innerHTML = block.settings?.html || "<div>Ваш HTML код</div>";
      el.appendChild(customDiv);
      break;
    default:
      el.textContent = `Неизвестный тип блока: ${block.type}`;
  }

  container.appendChild(el);
}
