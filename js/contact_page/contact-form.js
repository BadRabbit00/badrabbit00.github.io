// js/contact_page/contact-form.js
document.addEventListener('DOMContentLoaded', () => {
  const openCalendarBtn     = document.getElementById('openCalendarBtn');
  const calendarModal       = document.getElementById('calendarModal');
  const prevMonthBtn        = document.getElementById('prevMonthBtn');
  const nextMonthBtn        = document.getElementById('nextMonthBtn');
  const monthYear           = document.getElementById('monthYear');
  const calendarGrid        = document.getElementById('calendarGrid');
  const confirmBtn          = document.getElementById('confirmBtn');
  const selectedSlotDisplay = document.getElementById('selectedSlotDisplay');
  const appointmentForm     = document.getElementById('appointmentForm');

  let currentDate  = new Date();
  let selectedSlot = null; // единственная декларация!

  // ——— Работа с localStorage ———
  function getOccupied() {
    return JSON.parse(localStorage.getItem('occupiedSlots') || '[]');
  }
  function setOccupied(arr) {
    localStorage.setItem('occupiedSlots', JSON.stringify(arr));
  }
  function getPending() {
    return JSON.parse(localStorage.getItem('pendingSlot') || 'null');
  }
  function setPending(slot) {
    localStorage.setItem('pendingSlot', JSON.stringify(slot));
  }
  function clearPending() {
    localStorage.removeItem('pendingSlot');
  }
  function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments') || '[]');
  }

  // ——— Рендер календаря ———
  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = `${year} – ${month + 1}`;

    // Заголовки дней
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
      const hdr = document.createElement('div');
      hdr.textContent = d;
      hdr.style.fontWeight = 'bold';
      calendarGrid.appendChild(hdr);
    });

    // Пустые ячейки до 1-го дня
    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = (firstDayIndex + 6) % 7;
    for (let i = 0; i < firstDayIndex; i++) {
      calendarGrid.appendChild(document.createElement('div'));
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const occupied    = getOccupied();
    const pending     = getPending();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell    = document.createElement('div');
      cell.className = 'day-cell';

      const num = document.createElement('div');
      num.className   = 'date-number';
      num.textContent = d;
      cell.appendChild(num);

      ['morning','day','evening'].forEach(type => {
        let label;
        if (type === 'morning')   label = 'Утро (8-12)';
        if (type === 'day')       label = 'День (12-18)';
        if (type === 'evening')   label = 'Вечер (18-22)';

        const slot = document.createElement('div');
        slot.className     = 'slot';
        slot.dataset.date  = dateStr;
        slot.dataset.time  = type;

        // если в списке занятых — помечаем «Занято»
        if (occupied.some(o => o.date === dateStr && o.time === type)) {
          slot.classList.add('occupied');
          slot.textContent = 'Занято';
        } else {
          // иначе даём возможность выбрать
          slot.textContent = label;
          slot.addEventListener('click', () => {
            document.querySelectorAll('.slot.selected')
                    .forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');

            selectedSlot = { date: dateStr, time: type, label };
            setPending(selectedSlot);
            console.log('pending saved:', selectedSlot);
          });

          // если это «pending» при повторном рендере — подчеркнуть
          if (pending &&
              pending.date === dateStr &&
              pending.time === type) {
            slot.classList.add('selected');
            selectedSlot = pending;
          }
        }

        cell.appendChild(slot);
      });

      calendarGrid.appendChild(cell);
    }
  }

  // ——— Открыть/скрыть календарь и навигация ———
  openCalendarBtn.addEventListener('click', () => {
    calendarModal.style.display = 'flex';
    renderCalendar();
  });
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  window.addEventListener('click', e => {
    if (e.target === calendarModal) {
      calendarModal.style.display = 'none';
    }
  });

  // ——— Подтвердить выбор (кнопка «Выбрать») ———
  confirmBtn.addEventListener('click', () => {
    const pending = getPending();
    if (!pending) {
      return alert('Пожалуйста, выберите дату и время.');
    }
    // проверяем ещё раз, не занято ли кем-то из confirmed
    const occupied = getOccupied();
    if (occupied.some(o => o.date === pending.date && o.time === pending.time)) {
      return alert('Этот слот уже занят!');
    }
    // подтверждаем: записываем в занятые
    occupied.push(pending);
    setOccupied(occupied);
    clearPending();

    selectedSlotDisplay.textContent = `${pending.date} ${pending.label}`;
    calendarModal.style.display = 'none';
    console.log('Confirmed slot:', pending);
  });

  // ——— Отправка формы ———
  appointmentForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedSlot) {
      return alert('Вы не выбрали дату и время!');
    }

    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const appts = getAppointments();
    appts.push({
      name,
      email,
      phone,
      date: selectedSlot.date,
      time: selectedSlot.time
    });
    localStorage.setItem('appointments', JSON.stringify(appts));

    // обновляем занятые слоты в календаре
    renderCalendar();

    appointmentForm.reset();
    selectedSlotDisplay.textContent = '';
    selectedSlot = null;
    alert('Ваша запись успешно сохранена!');
  });
});
