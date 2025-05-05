document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Элементы ---
  const openCalBtn = document.getElementById('openCalendarBtn');
  const modal = document.getElementById('calendarModal');
  const closeModalBtn = modal?.querySelector('.close-btn'); // Используем optional chaining на случай отсутствия modal
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  const monthYearEl = document.getElementById('monthYear');
  const grid = document.getElementById('calendarGrid');
  const confirmBtn = document.getElementById('confirmBtn');
  const slotDisplay = document.getElementById('selectedSlotDisplay');
  const form = document.getElementById('appointmentForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Проверка наличия ключевых элементов
  if (!openCalBtn || !modal || !closeModalBtn || !prevBtn || !nextBtn || !monthYearEl || !grid || !confirmBtn || !slotDisplay || !form || !nameInput || !emailInput || !phoneInput) {
      console.error("Ошибка инициализации: Один или несколько DOM элементов не найдены.");
      // Можно показать сообщение пользователю или просто остановить скрипт
      alert("Произошла ошибка при загрузке формы. Пожалуйста, обновите страницу или обратитесь к администратору.");
      return; // Останавливаем выполнение скрипта
  }

  // --- Состояние ---
  let currentDate = new Date(); // Текущая дата для навигации по календарю
  let pendingSlotInModal = null; // Временный выбор слота ВНУТРИ модального окна {date, time, label, element}
  let confirmedSlotForForm = null; // Финальный выбор слота, подтвержденный кнопкой "Выбрать"

  // --- Работа с localStorage ---
  const LS = {
      // Получаем массив занятых слотов {date: 'YYYY-MM-DD', time: 'morning' | 'day' | 'evening'}
      getOccupied: () => JSON.parse(localStorage.getItem('occupiedSlots') || '[]'),
      // Сохраняем массив занятых слотов
      setOccupied: (arr) => localStorage.setItem('occupiedSlots', JSON.stringify(arr)),
      // Получаем массив всех записей
      getAppointments: () => JSON.parse(localStorage.getItem('appointments') || '[]'),
      // Добавляем новую запись
      addAppointment: (appt) => {
          const arr = LS.getAppointments();
          arr.push(appt);
          localStorage.setItem('appointments', JSON.stringify(arr));
      }
      // pendingSlot теперь хранится в переменной JS, а не в localStorage
  };

  // --- Вспомогательные функции ---
  const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // --- Рендер Календаря ---
  function renderCalendar() {
      grid.innerHTML = ''; // Очищаем сетку
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      monthYearEl.textContent = `${currentDate.toLocaleString('ru-RU', { month: 'long' })} ${year}`;

      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let firstDayWeekday = firstDayOfMonth.getDay(); // 0=Вс, 1=Пн...
      firstDayWeekday = (firstDayWeekday === 0) ? 6 : firstDayWeekday - 1; // Преобразуем к 0=Пн, 6=Вс

      // Добавляем пустые ячейки для дней предыдущего месяца
      for (let i = 0; i < firstDayWeekday; i++) {
          grid.appendChild(document.createElement('div')).classList.add('empty-cell');
      }

      const occupiedSlots = LS.getOccupied();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сравниваем только даты

      // Создаем ячейки для каждого дня месяца
      for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement('div');
          cell.classList.add('day-cell');
          const currentDayDate = new Date(year, month, day);
          currentDayDate.setHours(0, 0, 0, 0); // Сравниваем только даты
          const dateStr = formatDate(currentDayDate);
          const isPastDate = currentDayDate < today;

          if (isPastDate) {
              cell.classList.add('past-date');
          }

          // Добавляем номер дня
          const numEl = document.createElement('div');
          numEl.classList.add('date-number');
          numEl.textContent = day;
          cell.appendChild(numEl);

          // Создаем слоты времени
          [['morning', 'Утро (8-12)'], ['day', 'День (12-18)'], ['evening', 'Вечер (18-22)']]
              .forEach(([timeType, label]) => {
                  const slot = document.createElement('div');
                  slot.classList.add('slot');
                  slot.dataset.date = dateStr;
                  slot.dataset.time = timeType;
                  slot.dataset.label = label;

                  const isOccupied = occupiedSlots.some(o => o.date === dateStr && o.time === timeType);

                  if (isPastDate || isOccupied) {
                      slot.classList.add('occupied');
                      slot.textContent = isOccupied ? 'Занято' : 'Прошло';
                  } else {
                      slot.textContent = label;
                      // Обработчик клика для доступных слотов
                      slot.addEventListener('click', () => handleSlotClick(slot, dateStr, timeType, label));
                  }

                  // Если этот слот был выбран как pending до перерисовки, выделяем его
                  if (pendingSlotInModal && pendingSlotInModal.date === dateStr && pendingSlotInModal.time === timeType) {
                       slot.classList.add('selected');
                       pendingSlotInModal.element = slot; // Обновляем ссылку на элемент
                  }

                  cell.appendChild(slot);
              });
          grid.appendChild(cell);
      }
  }

  // --- Обработчики Событий ---

  // Клик по слоту времени
  function handleSlotClick(slotElement, date, time, label) {
      // Снимаем выделение с предыдущего pending слота, если он был
      if (pendingSlotInModal && pendingSlotInModal.element) {
          pendingSlotInModal.element.classList.remove('selected');
      }

      // Устанавливаем новый pending слот
      slotElement.classList.add('selected');
      pendingSlotInModal = { date, time, label, element: slotElement };
      console.log("Pending slot selected:", pendingSlotInModal);

      // Активируем кнопку "Выбрать", если она была неактивна (опционально)
      confirmBtn.disabled = false;
  }

  // Открытие модального окна
  openCalBtn.addEventListener('click', () => {
      console.log("Opening modal. Current confirmed slot:", confirmedSlotForForm);
      // Если уже есть подтвержденный слот, делаем его pending при открытии
      pendingSlotInModal = confirmedSlotForForm ? { ...confirmedSlotForForm, element: null } : null;
       console.log("Pending slot on open:", pendingSlotInModal);
      confirmBtn.disabled = !pendingSlotInModal; // Кнопка активна, только если есть что подтверждать
      modal.style.display = 'flex';
      renderCalendar(); // Рендерим календарь после установки pending
  });

  // Закрытие модального окна
  const closeModal = () => {
      modal.style.display = 'none';
      pendingSlotInModal = null; // Сбрасываем временный выбор при закрытии
      console.log("Modal closed. Pending slot cleared.");
  };
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => { // Закрытие по клику вне окна
      if (event.target === modal) {
          closeModal();
      }
  });

  // Навигация по месяцам
  prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      pendingSlotInModal = null; // Сбрасываем выбор при смене месяца
      confirmBtn.disabled = true; // Деактивируем кнопку подтверждения
      renderCalendar();
  });
  nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      pendingSlotInModal = null;
      confirmBtn.disabled = true;
      renderCalendar();
  });

  // Подтверждение выбора в модальном окне (Кнопка "Выбрать")
  confirmBtn.addEventListener('click', () => {
      if (!pendingSlotInModal) {
          alert('Пожалуйста, выберите слот времени.');
          return;
      }

      // Дополнительная проверка, не заняли ли слот, пока окно было открыто
      const occupied = LS.getOccupied();
      if (occupied.some(o => o.date === pendingSlotInModal.date && o.time === pendingSlotInModal.time)) {
          alert('К сожалению, этот слот только что заняли. Пожалуйста, выберите другой.');
          pendingSlotInModal = null; // Сбрасываем неактуальный выбор
          confirmBtn.disabled = true;
          renderCalendar(); // Перерисовываем, чтобы показать актуальную занятость
          return;
      }

      // Фиксируем выбор
      confirmedSlotForForm = {
          date: pendingSlotInModal.date,
          time: pendingSlotInModal.time,
          label: pendingSlotInModal.label
      };
      console.log("Slot confirmed for form:", confirmedSlotForForm);

      // Отображаем выбор рядом с кнопкой открытия календаря
      slotDisplay.textContent = `Выбрано: ${confirmedSlotForForm.date}, ${confirmedSlotForForm.label}`;
      closeModal(); // Закрываем модальное окно
  });

  // Отправка формы (Кнопка "Отправить")
  form.addEventListener('submit', (event) => {
      event.preventDefault(); // Предотвращаем стандартную отправку
      console.log("Form submit triggered. Checking confirmed slot:", confirmedSlotForForm);

      // 1. Проверка, выбран ли слот времени
      if (!confirmedSlotForForm) {
          alert('Пожалуйста, выберите дату и время записи.');
          openCalBtn.focus(); // Фокус на кнопку выбора даты
          return;
      }

      // 2. Проверка заполненности полей
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!name || !email || !phone) {
          alert('Пожалуйста, заполните все поля: Имя, Почта и Номер телефона.');
          // Фокус на первое незаполненное поле (улучшение)
          if (!name) nameInput.focus();
          else if (!email) emailInput.focus();
          else phoneInput.focus();
          return;
      }

      // 3. (Опционально) Валидация формата email и телефона
      // Простая проверка email
      if (!/^\S+@\S+\.\S+$/.test(email)) {
           alert('Пожалуйста, введите корректный адрес электронной почты.');
           emailInput.focus();
           return;
      }
      // Можно добавить более сложную валидацию телефона, если нужно

      // --- Все проверки пройдены ---

      // 4. Формирование данных для сохранения
      const appointmentData = {
          name,
          email,
          phone,
          date: confirmedSlotForForm.date,
          time: confirmedSlotForForm.time,
          label: confirmedSlotForForm.label,
          timestamp: new Date().toISOString() // Добавляем метку времени создания записи
      };

      // 5. Сохранение данных
      try {
          // Добавляем слот в список занятых
          const occupied = LS.getOccupied();
          occupied.push({ date: confirmedSlotForForm.date, time: confirmedSlotForForm.time });
          LS.setOccupied(occupied);

          // Добавляем полную запись
          LS.addAppointment(appointmentData);

          console.log("Appointment saved:", appointmentData);

          // 6. Сброс формы и состояния
          form.reset(); // Очистка полей формы
          slotDisplay.textContent = ''; // Очистка отображения даты
          const previouslyConfirmed = confirmedSlotForForm; // Для лога
          confirmedSlotForForm = null; // Сброс выбранного слота
          pendingSlotInModal = null; // Сброс pending на всякий случай
          console.log('Form state reset. Previously confirmed slot:', previouslyConfirmed);


          // 7. Сообщение пользователю
          alert('Ваша запись успешно сохранена!');

      } catch (error) {
          console.error("Ошибка при сохранении данных в localStorage:", error);
          alert("Произошла ошибка при сохранении записи. Попробуйте еще раз или обратитесь к администратору.");
      }
  });

  // --- Инициализация ---
  confirmBtn.disabled = true; // Изначально кнопка "Выбрать" неактивна
  console.log("Form script initialized successfully.");
  // Первый рендер не нужен, календарь рендерится при открытии модалки

}); // Конец DOMContentLoaded