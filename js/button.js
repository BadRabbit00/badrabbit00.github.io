document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-grd');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', x + 'px');
            btn.style.setProperty('--y', y + 'px');
        });
    });
});
