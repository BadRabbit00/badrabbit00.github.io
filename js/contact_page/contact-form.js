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

  // ← единственная декларация переменной!
  let selectedSlot = null;
  let currentDate  = new Date();

  function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments') || '[]');
  }

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = `${year} – ${month + 1}`;

    // заголовки дней недели
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
      const hdr = document.createElement('div');
      hdr.textContent = d;
      hdr.style.fontWeight = 'bold';
      calendarGrid.appendChild(hdr);
    });

    // пробелы до 1-го числа
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay + 6) % 7; // понедельник=0
    for (let i = 0; i < firstDay; i++) {
      calendarGrid.appendChild(document.createElement('div'));
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const appointments = getAppointments();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cell = document.createElement('div');
      cell.className = 'day-cell';

      // номер дня
      const num = document.createElement('div');
      num.className   = 'date-number';
      num.textContent = d;
      cell.appendChild(num);

      // три слота
      [['morning','Утро (8-12)'], ['day','День (12-18)'], ['evening','Вечер (18-22)']]
      .forEach(([type,label]) => {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.time = type;
        slot.dataset.date = dateStr;

        // если уже есть в localStorage → «занято»
        if (appointments.some(a=>a.date===dateStr && a.time===type)) {
          slot.classList.add('occupied');
          slot.textContent = 'Занято';
        } else {
          slot.textContent = label;
          slot.addEventListener('click', () => {
            // сбросим предыдущие
            document.querySelectorAll('.slot.selected')
                    .forEach(s=>s.classList.remove('selected'));
            // пометим текущий
            slot.classList.add('selected');
            // и ОБНОВИМ НУЖНУЮ переменную
            selectedSlot = { date: dateStr, time: type, label };
            console.log('Выбран слот:', selectedSlot);
          });
        }
        cell.appendChild(slot);
      });

      calendarGrid.appendChild(cell);
    }
  }

  // открыть/обновить календарь
  openCalendarBtn.addEventListener('click', () => {
    calendarModal.style.display = 'flex';
    renderCalendar();
  });

  // навигация по месяцам
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // подтвердить выбор
  confirmBtn.addEventListener('click', () => {
    if (!selectedSlot) {
      return alert('Пожалуйста, выберите дату и время.');
    }
    selectedSlotDisplay.textContent = `${selectedSlot.date} ${selectedSlot.label}`;
    calendarModal.style.display = 'none';
  });

  // закрыть модал при клике вне
  window.addEventListener('click', e => {
    if (e.target === calendarModal) {
      calendarModal.style.display = 'none';
    }
  });

  // отправка формы
  appointmentForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedSlot) {
      return alert('Вы не выбрали дату/время!');
    }

    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const appts = getAppointments();
    appts.push({ name, email, phone, date: selectedSlot.date, time: selectedSlot.time });
    localStorage.setItem('appointments', JSON.stringify(appts));

    renderCalendar();                       // сразу отразить «занято»
    appointmentForm.reset();
    selectedSlotDisplay.textContent = '';
    selectedSlot = null;                   // сброс для следующей записи

    alert('Ваша запись успешно сохранена!');
  });
});
