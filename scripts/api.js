export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `${token}` : "",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "./pages/login.html";
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Ошибка при выполнении запроса");
  }

  return response.json();
}
