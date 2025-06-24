export const blockTemplates = [
  {
    id: "title",
    name: "Заголовок",
    content: "Заголовок страницы",
  },
  {
    id: "text",
    name: "Текст",
    content: "Простой текстовый блок",
  },
  {
    id: "imageText",
    name: "Картинка и текст",
    content: JSON.stringify({
      imageUrl: "/path/to/image.jpg",
      text: "Описание рядом с картинкой",
    }),
  },
  {
    id: "slider",
    name: "Слайдер",
    content: JSON.stringify({
      images: ["/img1.jpg", "/img2.jpg"],
    }),
  },
  {
    id: "columns",
    name: "Колонки",
    content: JSON.stringify({
      columns: [
        { type: "text", value: "Колонка 1" },
        { type: "image", value: "/img.jpg" },
      ],
    }),
  },
  {
    id: "textBlock",
    name: "Заголовок и описание",
    content: JSON.stringify({
      title: "Заголовок",
      description: "Описание",
    }),
  },
  {
    id: "header",
    name: "Верхнее меню",
    content: JSON.stringify({
      menu: ["Главная", "О нас", "Контакты"],
    }),
  },
  {
    id: "footer",
    name: "Подвал страницы",
    content: JSON.stringify({
      text: "© 2025 Все права защищены",
    }),
  },
  {
    id: "zero-block",
    name: "Кастомный JSON блок",
    content: JSON.stringify({}),
  },
];
