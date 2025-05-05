document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM-элементы
  const openCalBtn = document.getElementById('openCalendarBtn');
  const modal = document.getElementById('calendarModal');
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  const monthYearEl = document.getElementById('monthYear');
  const grid = document.getElementById('calendarGrid');
  const confirmBtn = document.getElementById('confirmBtn');
  const slotDisplay = document.getElementById('selectedSlotDisplay');
  const form = document.getElementById('appointmentForm');
  const closeModalBtn = document.querySelector('.close-btn'); // Предполагаем, что есть кнопка закрытия модального окна

  // 2. Состояние
  let currentDate = new Date(); // для навигации по месяцам
  let confirmedSlotForForm = null; // { date, time, label } - Слот, подтвержденный для формы

  // 3. Работа с localStorage
  const LS = {
      getOccupied: () => JSON.parse(localStorage.getItem('occupiedSlots') || '[]'),
      setOccupied: arr => localStorage.setItem('occupiedSlots', JSON.stringify(arr)),
      getPending: () => JSON.parse(localStorage.getItem('pendingSlot') || 'null'),
      setPending: slot => localStorage.setItem('pendingSlot', JSON.stringify(slot)),
      clearPending: () => localStorage.removeItem('pendingSlot'),
      getAppointments: () => JSON.parse(localStorage.getItem('appointments') || '[]'),
      addAppointment: appt => {
          const arr = LS.getAppointments();
          arr.push(appt);
          localStorage.setItem('appointments', JSON.stringify(arr));
      }
  };

  // --- Вспомогательная функция для форматирования даты ---
  function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }

  // 4. Рендер календаря
  function renderCalendar() {
      grid.innerHTML = '';
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Устанавливаем название месяца и года
      monthYearEl.textContent = `${currentDate.toLocaleString('ru-RU', { month: 'long' })} ${year}`;

      // Добавляем заголовки дней недели
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(d => {
          const el = document.createElement('div');
          el.className = 'weekday-header'; // Добавьте стиль для этого класса в CSS
          el.textContent = d;
          grid.appendChild(el);
      });

      // Определяем первый день месяца и количество дней
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Корректируем номер первого дня недели (0=Пн, 6=Вс)
      let firstDayWeekday = firstDayOfMonth.getDay(); // 0=Вс, 1=Пн, ...
      firstDayWeekday = (firstDayWeekday === 0) ? 6 : firstDayWeekday - 1; // Преобразуем к 0=Пн, 6=Вс

      // Добавляем пустые ячейки для дней предыдущего месяца
      for (let i = 0; i < firstDayWeekday; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'empty-cell'; // Добавьте стиль для этого класса в CSS
          grid.appendChild(emptyCell);
      }

      const occupied = LS.getOccupied();
      const pending = LS.getPending();
      const today = new Date(); // Сегодняшняя дата для сравнения
      today.setHours(0, 0, 0, 0); // Убираем время для корректного сравнения дат

      for (let day = 1; day <= daysInMonth; day++) {
          const currentDayDate = new Date(year, month, day);
          const dateStr = formatDate(currentDayDate); // YYYY-MM-DD
          const cell = document.createElement('div');
          cell.className = 'day-cell';

           // Проверка, является ли дата прошедшей
           const isPastDate = currentDayDate < today;
           if (isPastDate) {
              cell.classList.add('past-date'); // Добавьте стиль для этого класса в CSS
           }

          // Добавляем номер дня
          const numEl = document.createElement('div');
          numEl.className = 'date-number';
          numEl.textContent = day;
          cell.appendChild(numEl);

          // Создаём три слота для времени
          [['morning', 'Утро (8-12)'],
           ['day', 'День (12-18)'],
           ['evening', 'Вечер (18-22)']].forEach(([type, label]) => {
              const slot = document.createElement('div');
              slot.className = 'slot';
              slot.dataset.date = dateStr;
              slot.dataset.time = type;
              slot.dataset.label = label; // Сохраняем читабельный label

              // Проверяем, занят ли слот
              const isOccupied = occupied.some(o => o.date === dateStr && o.time === type);

              if (isPastDate || isOccupied) {
                  slot.classList.add('occupied');
                  slot.textContent = isPastDate ? 'Прошло' : 'Занято';
                  slot.style.pointerEvents = 'none'; // Делаем некликабельным
               } else {
                  slot.textContent = label;

                  // Подсвечиваем временно выбранный слот (pending)
                  if (pending && pending.date === dateStr && pending.time === type) {
                      slot.classList.add('selected');
                  }

                  // Добавляем обработчик клика для выбора слота
                  slot.addEventListener('click', () => {
                      // Снимаем выделение с предыдущего выбранного слота
                      const previouslySelected = grid.querySelector('.slot.selected');
                      if (previouslySelected) {
                          previouslySelected.classList.remove('selected');
                      }

                      // Выделяем текущий слот
                      slot.classList.add('selected');

                      // Сохраняем ВРЕМЕННЫЙ выбор в localStorage (pending)
                      const currentPendingSlot = { date: dateStr, time: type, label: label };
                      LS.setPending(currentPendingSlot);
                      console.log('Pending selection:', currentPendingSlot);
                  });
              }
              cell.appendChild(slot);
          });
          grid.appendChild(cell);
      }
  }

  // 5. Открытие/закрытие модального окна
  openCalBtn.addEventListener('click', () => {
      // При открытии проверяем, есть ли подтвержденный слот для формы
      // Если есть, то нужно его отобразить как pending при рендере
      if(confirmedSlotForForm) {
          LS.setPending(confirmedSlotForForm);
      } else {
          // Если подтвержденного нет, можно очистить и pending на всякий случай
           LS.clearPending();
      }
      modal.style.display = 'flex';
      renderCalendar();
  });

  function closeModal() {
      modal.style.display = 'none';
      LS.clearPending(); // Очищаем временный выбор при закрытии без подтверждения
      // Если confirmedSlotForForm не пуст, то он остается - пользователь может передумать
      // и снова открыть календарь, чтобы выбрать другую дату.
      // confirmedSlotForForm сбрасывается только при успешной отправке формы.
  }

  if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
  }

  // Закрытие по клику вне модального окна
  window.addEventListener('click', e => {
      if (e.target === modal) {
          closeModal();
      }
  });

  // Навигация по месяцам
  prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      LS.clearPending(); // Очищаем pending при смене месяца
      renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      LS.clearPending(); // Очищаем pending при смене месяца
      renderCalendar();
  });

  // 6. Подтверждение выбора в модальном окне (Кнопка "Выбрать")
  confirmBtn.addEventListener('click', () => {
      const pending = LS.getPending();

      if (!pending) {
          alert('Пожалуйста, выберите дату и время.');
          return;
      }

      // Дополнительная проверка: не заняли ли слот, пока модальное окно было открыто?
      const occupied = LS.getOccupied();
      if (occupied.some(o => o.date === pending.date && o.time === pending.time)) {
          alert('Увы, этот слот только что заняли. Пожалуйста, выберите другой.');
          LS.clearPending(); // Очищаем неактуальный pending
          renderCalendar(); // Перерисовываем календарь, чтобы показать занятость
          return;
      }

      // Если все хорошо, сохраняем выбор для основной формы
      confirmedSlotForForm = pending; // Записываем в переменную JS
      slotDisplay.textContent = `Выбрано: ${pending.date} ${pending.label}`; // Отображаем рядом с кнопкой
      LS.clearPending(); // Очищаем временный выбор из localStorage
      modal.style.display = 'none'; // Закрываем модальное окно
      console.log('Confirmed slot for form:', confirmedSlotForForm);
  });

  // 7. Отправка основной формы (Кнопка 2)
  form.addEventListener('submit', e => {
      e.preventDefault(); // Предотвращаем стандартную отправку формы

      // Проверяем, был ли слот подтвержден из модального окна
      if (!confirmedSlotForForm) {
          alert('Пожалуйста, выберите дату и время для записи, нажав на кнопку выбора даты.');
          return; // Прерываем отправку
      }

      // Собираем данные из формы
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');

      const appointmentData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          date: confirmedSlotForForm.date, // Берем из подтвержденного слота
          time: confirmedSlotForForm.time,  // Берем из подтвержденного слота
          label: confirmedSlotForForm.label // Можно тоже сохранить для информации
      };

      // Валидация полей формы (простая)
      if (!appointmentData.name || !appointmentData.email || !appointmentData.phone) {
           alert('Пожалуйста, заполните все поля формы: Имя, Почта, Номер телефона.');
           return;
      }

      // --- Вот здесь добавляем слот в occupied ---
      const occupied = LS.getOccupied();
      occupied.push({ date: confirmedSlotForForm.date, time: confirmedSlotForForm.time });
      LS.setOccupied(occupied); // Сохраняем обновленный список занятых слотов

      // Сохраняем полную информацию о записи
      LS.addAppointment(appointmentData);

      console.log('Appointment saved:', appointmentData);
      console.log('Updated occupied slots:', LS.getOccupied());

      // Сброс формы и состояния
      form.reset(); // Очищаем поля формы
      slotDisplay.textContent = ''; // Очищаем текст рядом с кнопкой
      confirmedSlotForForm = null; // Сбрасываем подтвержденный слот
      LS.clearPending(); // На всякий случай очищаем и pending

      // Сообщение пользователю
      alert('Ваша запись успешно сохранена! Слот теперь отмечен как занятый.');

      // Перерендер календаря не нужен немедленно, он обновится при следующем открытии модалки
  });

  // --- Инициализация ---
  // При загрузке страницы можно очистить pending, если он остался с прошлого раза
  LS.clearPending();
  // Также можно проверить, есть ли сохраненный confirmedSlotForForm (маловероятно, но возможно)
  // и отобразить его, но обычно форма должна быть чистой при загрузке.
});