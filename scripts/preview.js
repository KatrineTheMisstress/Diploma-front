const previewContainer = document.getElementById("blocksPreview");
const token = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPageData();
});

async function fetchPageData() {
  const data = JSON.parse(localStorage.getItem("preview-data"));
  console.log(data);
  const response = await fetch("http://92.51.23.240:3000/api/pages/preview", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
  });
  //window.location.href = `/pages/constructor.html?pageId=${project.id}`;

  if (!response.ok) {
    alert("Не удалось загрузить данные для превью");
    return;
  }

  const html = await response.text();
  previewContainer.innerHTML = html;
}
