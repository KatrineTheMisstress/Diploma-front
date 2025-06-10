document.addEventListener("DOMContentLoaded", function () {
  // Меню
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".menu");

  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  // Карусель
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".dots");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  let currentIndex = 0;
  let interval;

  function updateCarousel() {
    document.querySelector(".carousel-slides").style.transform = `translateX(-${
      currentIndex * 100
    }%)`;
    document.querySelectorAll(".dots span").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    updateCarousel();
  }

  function autoSlide() {
    interval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 10000);
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => {
      goToSlide(index);
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });

  prevBtn.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    resetAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    resetAutoSlide();
  });

  function resetAutoSlide() {
    clearInterval(interval);
    autoSlide();
  }

  updateCarousel();
  autoSlide();

  const closeMenuBtn = document.querySelector(".close-menu");
  closeMenuBtn.addEventListener("click", () => {
    menu.classList.remove("open");
  });
});
