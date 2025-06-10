document.addEventListener("DOMContentLoaded", async () => {
  const blocksContainer = document.getElementById("blocksContainer");

  // Получаем pageId из URL, если есть
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("id");

  if (!pageId) {
    blocksContainer.textContent = "Не указан ID страницы";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/blocks/page/${pageId}`,
      {
        headers: {
          Authorization: localStorage.getItem("accessToken"),
        },
      }
    );

    if (!response.ok) throw new Error("Ошибка загрузки блоков");

    const blocks = await response.json();

    // Очистим контейнер
    blocksContainer.innerHTML = "";

    if (!blocks.length) {
      blocksContainer.textContent = "На данный момент нет блоков";
      return;
    }

    blocks.forEach((block) => renderBlock(block));
  } catch (error) {
    console.error(error);
    blocksContainer.textContent = "Произошла ошибка при загрузке блоков";
  }
});

function getPageIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("pageId");
}

async function fetchBlocks(pageId) {
  const response = await fetch(`/api/pages/${pageId}/blocks`);
  if (!response.ok) {
    throw new Error("Ошибка при загрузке блоков");
  }
  const blocks = await response.json();
  return blocks;
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

function renderBlock(block) {
  const container = document.createElement("div");
  container.classList.add("block-container");
  container.style.marginBottom = "30px";

  console.log(block);

  switch (block.type) {
    case "carousel": {
      const swiperContainer = document.createElement("div");
      swiperContainer.className = "swiper"; // Это основной контейнер Swiper

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      const slides =
        block.settings.slides && block.settings.slides.length
          ? block.settings.slides
          : [
              {
                title: "Заголовок 1",
                subtitle: "Подзаголовок 1",
                text: "Текст слайда 1",
                imageUrl: "https://via.placeholder.com/1200x400?text=Slide+1",
              },
            ];

      slides.forEach((slide) => {
        const slideEl = document.createElement("div");
        slideEl.className = "swiper-slide";

        const img = document.createElement("img");
        console.log(slide.imageUrl);
        img.src = slide.imageUrl || "https://via.placeholder.com/1200x400";
        img.style.width = "100%";
        img.style.height = block.height ? block.height + "px" : "400px";
        img.style.objectFit = "cover";
        slideEl.appendChild(img);

        if (slide.title || slide.subtitle || slide.text) {
          const overlay = document.createElement("div");
          overlay.style.position = "absolute";
          overlay.style.bottom = "20px";
          overlay.style.left = "20px";
          overlay.style.color = "white";
          overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
          overlay.style.padding = "10px";
          overlay.style.borderRadius = "8px";

          if (slide.title) {
            const h2 = document.createElement("h2");
            h2.textContent = slide.title;
            overlay.appendChild(h2);
          }
          if (slide.subtitle) {
            const h3 = document.createElement("h3");
            h3.textContent = slide.subtitle;
            overlay.appendChild(h3);
          }
          if (slide.text) {
            const p = document.createElement("p");
            p.textContent = slide.text;
            overlay.appendChild(p);
          }

          slideEl.style.position = "relative";
          slideEl.appendChild(overlay);
        }

        swiperWrapper.appendChild(slideEl);
      });

      swiperContainer.appendChild(swiperWrapper);

      // Навигация и пагинация
      const next = document.createElement("div");
      next.className = "swiper-button-next";
      const prev = document.createElement("div");
      prev.className = "swiper-button-prev";
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";

      swiperContainer.appendChild(next);
      swiperContainer.appendChild(prev);
      swiperContainer.appendChild(pagination);

      container.appendChild(swiperContainer);

      // Инициализируем Swiper
      setTimeout(() => {
        new Swiper(swiperContainer, {
          loop: true,
          navigation: {
            nextEl: next,
            prevEl: prev,
          },
          pagination: {
            el: pagination,
            clickable: true,
          },
        });
      }, 0);

      break;
    }

    case "text": {
      const textBlock = document.createElement("div");
      textBlock.style.width = block.width ? block.width + "%" : "100%";
      textBlock.style.minHeight = block.height ? block.height + "px" : "auto";
      textBlock.textContent = block.settings.text || "";
      textBlock.style.whiteSpace = "pre-wrap";
      container.appendChild(textBlock);
      break;
    }

    case "image": {
      const imageBlock = document.createElement("div");
      imageBlock.style.position = "relative";
      imageBlock.style.width = block.width ? block.width + "%" : "100%";
      imageBlock.style.height = block.height ? block.height + "px" : "auto";
      imageBlock.style.backgroundImage = `url(${
        block.settings.src || "https://via.placeholder.com/800x400"
      })`;
      imageBlock.style.backgroundSize = "cover";
      imageBlock.style.backgroundPosition = "center";

      if (block.settings.text) {
        const overlayText = document.createElement("div");
        overlayText.textContent = block.settings.text;
        overlayText.style.position = "absolute";
        overlayText.style.top = "50%";
        overlayText.style.left = "50%";
        overlayText.style.transform = "translate(-50%, -50%)";
        overlayText.style.color = "white";
        overlayText.style.textShadow = "0 0 5px rgba(0,0,0,0.7)";
        overlayText.style.padding = "10px";
        overlayText.style.backgroundColor = "rgba(0,0,0,0.3)";
        overlayText.style.borderRadius = "6px";
        imageBlock.appendChild(overlayText);
      }

      container.appendChild(imageBlock);
      break;
    }

    case "menu": {
      const menu = document.createElement("nav");
      menu.style.width = "100%";
      menu.style.backgroundColor = "#eee";
      menu.style.display = "flex";
      menu.style.justifyContent = "center";
      menu.style.padding = "10px 0";

      // Ожидаем, что items - массив строк с названиями пунктов меню
      const items = block.settings.items || [];

      items.forEach((itemText) => {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = itemText;
        link.style.margin = "0 15px";
        link.style.textDecoration = "none";
        link.style.color = "#333";
        menu.appendChild(link);
      });

      container.appendChild(menu);
      break;
    }

    case "footer": {
      const footer = document.createElement("footer");
      footer.style.width = "100%";
      footer.style.textAlign = "center";
      footer.style.padding = "20px 0";
      footer.style.backgroundColor = "#f1f1f1";
      footer.textContent = block.settings.text || "© 2025 Ваша компания";
      container.appendChild(footer);
      break;
    }

    default:
      container.textContent = `Неизвестный тип блока: ${block.type}`;
  }

  // Добавляем data-атрибут с id блока для возможного взаимодействия
  container.dataset.blockId = block.id;

  // Вставляем в главный контейнер страницы, например, с id blocksContainer
  const blocksContainer = document.getElementById("blocksContainer");
  if (blocksContainer) {
    blocksContainer.appendChild(container);
  }
}

async function renderPreview() {
  const pageId = getPageIdFromUrl();
  if (!pageId) {
    alert("pageId не найден в URL");
    return;
  }

  try {
    const blocks = await fetchBlocks(pageId);
    const container = document.getElementById("preview-container");

    // Чистим контейнер перед рендером
    container.innerHTML = "";

    blocks.forEach((block) => {
      const el = renderBlock(block);
      container.appendChild(el);
    });
  } catch (e) {
    console.error(e);
    alert("Ошибка при загрузке страницы");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderPreview();
});
