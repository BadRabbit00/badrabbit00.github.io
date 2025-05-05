document.addEventListener('DOMContentLoaded', () => {
    // Получаем кнопку
    const upBtn = document.getElementById('upBtn');

    // Функция для отображения/скрытия кнопки при прокрутке
    window.onscroll = function () {
        scrollFunction();
    };

    // Функция для плавного скролла вверх
    function topFunction() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавный скролл
        });
    }

    // Функция для отображения/скрытия кнопки с анимацией
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            upBtn.style.display = 'flex'; // Показываем кнопку (flex для центрирования)
            setTimeout(() => {
                upBtn.classList.add('show'); // Запускаем анимацию появления
            }, 10); // Небольшая задержка для корректного запуска анимации
        } else {
            upBtn.classList.remove('show'); // Скрываем кнопку с анимацией
            setTimeout(() => {
                upBtn.style.display = 'none'; // Полностью скрываем кнопку после анимации
            }, 300); // Задержка должна соответствовать длительности анимации (0.3s)
        }
    }

    // Эффект градиента, следующего за курсором
    document.addEventListener('DOMContentLoaded', () => {
        const loginBtn = document.getElementById('loginBtn');
    
        // Эффект градиента, который следует за курсором
        if (loginBtn) {
            loginBtn.addEventListener('mousemove', (e) => {
                const rect = loginBtn.getBoundingClientRect();
                const x = e.clientX - rect.left; // Позиция курсора по X относительно кнопки
                const y = e.clientY - rect.top;  // Позиция курсора по Y относительно кнопки
    
                loginBtn.style.setProperty('--x', x + 'px');
                loginBtn.style.setProperty('--y', y + 'px');
            });
        }
    });

    // Обработчик клика для кнопки
    upBtn.addEventListener('click', topFunction);

    //Логин
    // Получаем элементы
    const loginBtn = document.getElementById('loginBtn');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');

    // Открываем модальное окно при нажатии на кнопку "Войти"
    loginBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Закрываем модальное окно при нажатии на крестик
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрываем модальное окно при клике вне его области
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка отправки формы
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Предотвращаем отправку формы

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Здесь можно добавить логику для проверки логина и пароля
        if (username === 'admin' && password === '1234') {
            alert('Вход выполнен успешно!');
            modal.style.display = 'none'; // Закрываем модальное окно
        } else {
            alert('Неверный логин или пароль!');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeBtns = document.querySelectorAll('.close');
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');

    // Открываем модальное окно при нажатии на кнопку "Отправить запрос"
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            contactModal.style.display = 'block';
        });
    }

    // Закрываем модальное окно при нажатии на крестик
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            contactModal.style.display = 'none';
            successModal.style.display = 'none';
        });
    });

    // Закрываем модальное окно при клике вне его области
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Обработка отправки формы
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем отправку формы

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Здесь можно добавить логику для отправки данных на сервер
            console.log('Имя:', name);
            console.log('Телефон:', phone);
            console.log('Email:', email);
            console.log('Сообщение:', message);

            contactModal.style.display = 'none'; // Закрываем модальное окно
            successModal.style.display = 'block'; // Открываем модальное окно с сообщением об успешной отправке
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы
    const loginBtn = document.getElementById('loginBtn');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');

    // Открываем модальное окно при нажатии на кнопку "Войти"
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // Закрываем модальное окно при нажатии на крестик
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Закрываем модальное окно при клике вне его области
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка отправки формы
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем отправку формы

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Здесь можно добавить логику для проверки логина и пароля
            if (username === 'admin' && password === '1234') {
                alert('Вход выполнен успешно!');
                modal.style.display = 'none'; // Закрываем модальное окно
            } else {
                alert('Неверный логин или пароль!');
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                // Фокусируемся на поле логина
                document.getElementById('username').focus();
            }
        });
    }
});