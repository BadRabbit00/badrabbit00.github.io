document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Элементы ---
  const openCalBtn = document.getElementById('openCalendarBtn');
  const modal = document.getElementById('calendarModal');
  const closeModalBtn = modal?.querySelector('.close-btn');
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

  // Элементы для уведомлений
  const notificationContainer = document.getElementById('custom-notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationCloseBtn = document.getElementById('notification-close');
  let notificationTimeout; // Для автоматического скрытия

  // Проверка наличия ключевых элементов
  if (!openCalBtn || !modal || !closeModalBtn || !prevBtn || !nextBtn || !monthYearEl || !grid || !confirmBtn || !slotDisplay || !form || !nameInput || !emailInput || !phoneInput || !notificationContainer || !notificationMessage || !notificationCloseBtn) {
      console.error("Ошибка инициализации: Один или несколько DOM элементов не найдены.");
      // Показываем уведомление об ошибке, если можем
      if (notificationContainer && notificationMessage) {
           showNotification("Произошла ошибка при загрузке интерфейса. Обновите страницу.", 'error', 0); // 0 = не скрывать автоматически
      } else {
          alert("Критическая ошибка загрузки страницы."); // Фоллбэк
      }
      return; // Останавливаем выполнение скрипта
  }

  // --- Состояние ---
  let currentDate = new Date();
  let pendingSlotInModal = null; // {date, time, label, element}
  let confirmedSlotForForm = null; // {date, time, label}

  // --- Работа с localStorage ---
  const LS = {
      getOccupied: () => JSON.parse(localStorage.getItem('occupiedSlots') || '[]'),
      setOccupied: (arr) => localStorage.setItem('occupiedSlots', JSON.stringify(arr)),
      getAppointments: () => JSON.parse(localStorage.getItem('appointments') || '[]'),
      addAppointment: (appt) => {
          const arr = LS.getAppointments();
          arr.push(appt);
          localStorage.setItem('appointments', JSON.stringify(arr));
      }
  };

  // --- Функция показа уведомлений ---
  const showNotification = (message, type = 'info', duration = 4000) => {
      clearTimeout(notificationTimeout); // Очищаем предыдущий таймаут, если есть

      notificationMessage.textContent = message;
      notificationContainer.className = 'notification'; // Сброс классов типа
      notificationContainer.classList.add(type); // Добавляем новый тип
      notificationContainer.classList.add('visible'); // Показываем

      // Автоматическое скрытие через 'duration' миллисекунд
      if (duration > 0) {
          notificationTimeout = setTimeout(() => {
              hideNotification();
          }, duration);
      }
  };

  // --- Функция скрытия уведомлений ---
  const hideNotification = () => {
      clearTimeout(notificationTimeout); // На всякий случай
      notificationContainer.classList.remove('visible');
  };

  // Закрытие уведомления по кнопке
  notificationCloseBtn.addEventListener('click', hideNotification);

  // --- Вспомогательные функции ---
  const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // --- Рендер Календаря ---
  function renderCalendar() {
      grid.innerHTML = '';
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      monthYearEl.textContent = `${currentDate.toLocaleString('ru-RU', { month: 'long' })} ${year}`;

      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let firstDayWeekday = firstDayOfMonth.getDay();
      firstDayWeekday = (firstDayWeekday === 0) ? 6 : firstDayWeekday - 1;

      for (let i = 0; i < firstDayWeekday; i++) {
          grid.appendChild(document.createElement('div')).classList.add('empty-cell');
      }

      const occupiedSlots = LS.getOccupied();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement('div');
          cell.classList.add('day-cell');
          const currentDayDate = new Date(year, month, day);
          currentDayDate.setHours(0, 0, 0, 0);
          const dateStr = formatDate(currentDayDate);
          const isPastDate = currentDayDate < today;

          if (isPastDate) {
              cell.classList.add('past-date');
          }

          const numEl = document.createElement('div');
          numEl.classList.add('date-number');
          numEl.textContent = day;
          cell.appendChild(numEl);

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
                       // Убираем обработчик для неактивных слотов
                  } else {
                      slot.textContent = label;
                      slot.addEventListener('click', () => handleSlotClick(slot, dateStr, timeType, label));
                  }

                  // Восстанавливаем pending состояние при перерисовке
                  if (pendingSlotInModal && pendingSlotInModal.date === dateStr && pendingSlotInModal.time === timeType && !isOccupied && !isPastDate) {
                      slot.classList.add('selected');
                      pendingSlotInModal.element = slot; // Обновляем ссылку
                  }

                  cell.appendChild(slot);
              });
          grid.appendChild(cell);
      }
       // Перепроверяем состояние кнопки "Выбрать" после рендера
       confirmBtn.disabled = !pendingSlotInModal || !pendingSlotInModal.element || pendingSlotInModal.element.classList.contains('occupied');
  }

  // --- Обработчики Событий ---

  function handleSlotClick(slotElement, date, time, label) {
      // Не даем выбрать уже занятый (на всякий случай, если класс 'occupied' не добавился сразу)
       if(slotElement.classList.contains('occupied')) return;

      if (pendingSlotInModal && pendingSlotInModal.element) {
          pendingSlotInModal.element.classList.remove('selected');
      }

      slotElement.classList.add('selected');
      pendingSlotInModal = { date, time, label, element: slotElement };
      console.log("Pending slot selected:", pendingSlotInModal);
      confirmBtn.disabled = false; // Активируем кнопку
  }

  // Открытие модального окна
  openCalBtn.addEventListener('click', () => {
      console.log("Opening modal. Current confirmed slot:", confirmedSlotForForm);
      pendingSlotInModal = confirmedSlotForForm ? { ...confirmedSlotForForm, element: null } : null; // element будет найден при рендере
      console.log("Pending slot on open:", pendingSlotInModal);
      modal.classList.add('visible'); // Показываем плавно
      renderCalendar(); // Рендерим ПОСЛЕ установки pending, чтобы он мог выделиться
      // Состояние кнопки "Выбрать" установится в конце renderCalendar
  });

  // Закрытие модального окна
  const closeModal = () => {
      modal.classList.remove('visible'); // Скрываем плавно
      // Сбрасываем временный выбор только если он не был подтвержден
      // confirmedSlotForForm остается
      pendingSlotInModal = null;
      console.log("Modal closed. Pending slot cleared (if any). Confirmed stays:", confirmedSlotForForm);
  };
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { // Закрытие по клику на фон
      if (event.target === modal) {
          closeModal();
      }
  });

  // Навигация по месяцам
  const changeMonth = (offset) => {
       currentDate.setMonth(currentDate.getMonth() + offset);
       // Сбрасываем pending, так как текущий выбор может быть не виден
       if (pendingSlotInModal && pendingSlotInModal.element) {
           pendingSlotInModal.element.classList.remove('selected');
       }
       pendingSlotInModal = null;
       confirmBtn.disabled = true; // Деактивируем кнопку
       renderCalendar();
  };
  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));


  // Подтверждение выбора в модальном окне (Кнопка "Выбрать")
  confirmBtn.addEventListener('click', () => {
      if (!pendingSlotInModal) {
          // Эта ситуация маловероятна из-за disabled, но добавим проверку
          showNotification('Пожалуйста, выберите доступный слот времени.', 'warning');
          return;
      }

      // Дополнительная проверка актуальности слота (на случай если данные обновились)
      const occupied = LS.getOccupied();
      if (occupied.some(o => o.date === pendingSlotInModal.date && o.time === pendingSlotInModal.time)) {
          showNotification('К сожалению, этот слот только что заняли. Выберите другой.', 'error');
          pendingSlotInModal.element?.classList.remove('selected'); // Убираем выделение с уже занятого
          pendingSlotInModal = null;
          confirmBtn.disabled = true;
          renderCalendar(); // Перерисовываем
          return;
      }

      // Фиксируем выбор
      confirmedSlotForForm = {
          date: pendingSlotInModal.date,
          time: pendingSlotInModal.time,
          label: pendingSlotInModal.label
      };
      console.log("Slot confirmed for form:", confirmedSlotForForm);

      // Отображаем выбор рядом с кнопкой
      slotDisplay.textContent = `Выбрано: ${confirmedSlotForForm.date}, ${confirmedSlotForForm.label}`;
      closeModal();
       showNotification(`Выбран слот: ${confirmedSlotForForm.date}, ${confirmedSlotForForm.label}`, 'info', 2500); // Краткое подтверждение выбора
  });

  // Отправка формы (Кнопка "Отправить")
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log("Form submit triggered. Checking confirmed slot:", confirmedSlotForForm);

      hideNotification(); // Скроем предыдущие уведомления

      if (!confirmedSlotForForm) {
          showNotification('Пожалуйста, выберите дату и время записи.', 'warning');
          openCalBtn.focus();
          return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!name) {
          showNotification('Пожалуйста, введите ваше имя.', 'warning');
          nameInput.focus();
          return;
      }
      if (!email) {
           showNotification('Пожалуйста, введите ваш email.', 'warning');
           emailInput.focus();
           return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
          showNotification('Пожалуйста, введите корректный email.', 'warning');
          emailInput.focus();
          return;
      }
      if (!phone) {
          showNotification('Пожалуйста, введите ваш номер телефона.', 'warning');
          phoneInput.focus();
          return;
      }
       // Можно добавить валидацию телефона по маске, если нужно


      // --- Все проверки пройдены ---
      const appointmentData = {
          name, email, phone,
          date: confirmedSlotForForm.date,
          time: confirmedSlotForForm.time,
          label: confirmedSlotForForm.label,
          timestamp: new Date().toISOString()
      };

      // Сохранение данных
      try {
          const occupied = LS.getOccupied();
          // Проверка на всякий случай, если слот заняли между выбором и отправкой
          if (occupied.some(o => o.date === confirmedSlotForForm.date && o.time === confirmedSlotForForm.time)) {
              showNotification('К сожалению, выбранный слот был занят перед отправкой. Пожалуйста, выберите новое время.', 'error');
              slotDisplay.textContent = ''; // Очищаем отображение
              confirmedSlotForForm = null; // Сброс выбора
              openCalBtn.focus();
              return; // Прерываем отправку
          }

          occupied.push({ date: confirmedSlotForForm.date, time: confirmedSlotForForm.time });
          LS.setOccupied(occupied);
          LS.addAppointment(appointmentData);

          console.log("Appointment saved:", appointmentData);

          // Сброс формы и состояния
          form.reset();
          slotDisplay.textContent = '';
          const previouslyConfirmed = confirmedSlotForForm; // Для сообщения
          confirmedSlotForForm = null;
          pendingSlotInModal = null;
           confirmBtn.disabled = true; // Кнопка "Выбрать" в модалке снова неактивна
          console.log('Form state reset. Previously confirmed slot:', previouslyConfirmed);

          // Сообщение пользователю с деталями записи
          showNotification(`Запись на ${previouslyConfirmed.date}, ${previouslyConfirmed.label} успешно оформлена!`, 'success', 6000);

      } catch (error) {
          console.error("Ошибка при сохранении данных в localStorage:", error);
          showNotification("Произошла ошибка при сохранении записи. Попробуйте еще раз.", 'error');
      }
  });

  // --- Инициализация ---
  confirmBtn.disabled = true; // Кнопка "Выбрать" изначально неактивна
  console.log("Form script initialized successfully.");
}); // Конец DOMContentLoaded