document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            menu.classList.add('scrolled');
        } else {
            menu.classList.remove('scrolled');
        }
    });
});
