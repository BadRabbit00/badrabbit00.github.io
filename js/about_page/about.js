document.addEventListener("DOMContentLoaded", function () {
    const aboutItems = document.querySelectorAll(".about-item");
    // Находим все элементы about-item

    function checkVisibility() {
        // Функция для проверки видимости элемента
        const triggerBottom = window.innerHeight * 0.85;
        // Определяем точку срабатывания анимации

        aboutItems.forEach((item) => {
            // Для каждого элемента:
            const itemTop = item.getBoundingClientRect().top;
            // Получаем положение элемента относительно верха окна

            if (itemTop < triggerBottom) {
                item.classList.add("visible");
                // Добавляем класс visible, если элемент виден
            }
        });
    }

    window.addEventListener("scroll", checkVisibility);
    // Запускаем проверку видимости при прокрутке
    checkVisibility(); // Запускаем при загрузке страницы
});

document.addEventListener("DOMContentLoaded", function () {
    const aboutItems = document.querySelectorAll(".about-item");
    // Находим все элементы about-item

    // Функция для появления блоков при скролле
    function checkVisibility() {
        const triggerBottom = window.innerHeight * 0.85;
        // Определяем точку срабатывания анимации

        aboutItems.forEach((item) => {
            // Для каждого элемента:
            const itemTop = item.getBoundingClientRect().top;
            // Получаем положение элемента относительно верха окна

            if (itemTop < triggerBottom) {
                item.classList.add("visible");
                // Добавляем класс visible, если элемент виден
            }
        });
    }

    // Параллакс-эффект при наведении курсора
    function parallaxEffect(event) {
        const item = event.currentTarget;
        // Получаем текущий элемент
        const rect = item.getBoundingClientRect();
        // Получаем размеры и положение элемента
        const x = (event.clientX - rect.left - rect.width / 2) * 0.02;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.04;
        // Вычисляем смещение для параллакс-эффекта

        item.style.transform = `translate(${x}px, ${y}px)`;
        // Применяем смещение к элементу
    }

    // Вернуть блок в исходное положение
    function resetParallax(event) {
        event.currentTarget.style.transform = "translate(0, 0)";
        // Убираем смещение
    }

    // Навешиваем обработчики событий на каждый блок
    aboutItems.forEach((item) => {
        item.addEventListener("mousemove", parallaxEffect);
        // Добавляем параллакс-эффект при движении мыши
        item.addEventListener("mouseleave", resetParallax);
        // Возвращаем в исходное положение при уходе мыши
    });

    window.addEventListener("scroll", checkVisibility);
    // Запускаем проверку видимости при прокрутке
    checkVisibility();
});