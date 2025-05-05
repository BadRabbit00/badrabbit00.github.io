document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const checkVisibility = () => {
        timelineItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            if (isVisible && !item.classList.contains('animated')) {
                item.classList.add('visible', 'animated');
            }
        });
    };
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
});
