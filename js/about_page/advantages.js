document.addEventListener('DOMContentLoaded', () => {
    // После загрузки HTML
    const advantageCards = document.querySelectorAll('.advantage-card');
    // Находим все карточки преимуществ
    
    advantageCards.forEach(card => {
        // Для каждой карточки:
        card.addEventListener('mouseover', () => {
            // При наведении мыши:
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            // Поднимаем карточку и добавляем тень
        });
    
        card.addEventListener('mouseout', () => {
            // При уходе мыши:
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            // Возвращаем карточку в исходное положение и уменьшаем тень
        });
    });
});