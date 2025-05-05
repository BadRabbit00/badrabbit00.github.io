document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    // Находим все карточки

    cards.forEach(card => {
        const fill = card.getAttribute('data-fill');
        // Получаем значение data-fill
        const filledBar = card.querySelector('.filledbar');
        // Находим заполненную полосу

        card.addEventListener('mouseenter', () => {
            filledBar.style.width = `${fill}%`;
            // При наведении - заполняем полосу
        });

        card.addEventListener('mouseleave', () => {
            filledBar.style.width = '0';
            // При уходе - обнуляем полосу
        });
    });
});