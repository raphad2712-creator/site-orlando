const SUPABASE_URL = 'https://bmoeknvuxrndlfairyth.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lagn5A2PP6V6kT_G9hvM3Q_kzIamfaz';
const calendar = document.querySelector('#calendar');
const state = {
  view: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  start: null,
  end: null,
  reserved: new Set()
};
const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateToIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(date) {
  return date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : 'Selecione';
}

function rangeHasReserved(start, end) {
  const date = new Date(start);
  while (date <= end) {
    if (state.reserved.has(dateToIso(date))) return true;
    date.setDate(date.getDate() + 1);
  }
  return false;
}

function updateSelection() {
  document.querySelector('#checkin-label').textContent = formatDate(state.start);
  document.querySelector('#checkout-label').textContent = formatDate(state.end);
  document.querySelector('#quote-button').disabled = !(state.start && state.end);
}

function selectDate(date) {
  const status = document.querySelector('#calendar-status');
  status.textContent = '';
  if (!state.start || state.end || date <= state.start) {
    state.start = date;
    state.end = null;
  } else if (rangeHasReserved(state.start, date)) {
    status.textContent = 'Este período possui datas reservadas. Escolha outro intervalo.';
    state.start = date;
    state.end = null;
  } else {
    state.end = date;
  }
  updateSelection();
  renderCalendar();
}

function renderCalendar() {
  calendar.innerHTML = '';
  dayNames.forEach(name => {
    const item = document.createElement('div');
    item.className = 'calendar-day-name';
    item.textContent = name;
    calendar.appendChild(item);
  });

  const year = state.view.getFullYear();
  const month = state.view.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());
  document.querySelector('#calendar-title').textContent = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(first);

  for (let index = 0; index < first.getDay(); index += 1) {
    const blank = document.createElement('span');
    blank.className = 'calendar-blank';
    calendar.appendChild(blank);
  }

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month, day);
    const reserved = state.reserved.has(dateToIso(date));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    button.textContent = day;
    button.disabled = date < today || reserved;
    button.setAttribute('aria-label', reserved ? `${formatDate(date)} — Reservado` : formatDate(date));
    if (reserved) button.classList.add('is-reserved');
    if (sameDay(date, today)) button.classList.add('is-today');
    if (sameDay(date, state.start)) button.classList.add('is-start');
    if (sameDay(date, state.end)) button.classList.add('is-end');
    if (state.start && state.end && date > state.start && date < state.end) button.classList.add('is-range');
    button.addEventListener('click', () => selectDate(date));
    calendar.appendChild(button);
  }
}

document.querySelector('#calendar-prev').addEventListener('click', () => {
  const now = new Date();
  const previous = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
  if (previous >= new Date(now.getFullYear(), now.getMonth(), 1)) {
    state.view = previous;
    renderCalendar();
  }
});

document.querySelector('#calendar-next').addEventListener('click', () => {
  state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
  renderCalendar();
});

document.querySelector('#quote-button').addEventListener('click', () => {
  const message = `Olá! Gostaria de um orçamento para a Orlando Rent Homes. Entrada: ${formatDate(state.start)}. Saída: ${formatDate(state.end)}.`;
  window.open(`https://wa.me/5511999066659?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

async function loadReservations() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas?select=data&order=data.asc`, { headers: { apikey: SUPABASE_KEY } });
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    state.reserved = new Set(data.map(item => item.data));
    document.querySelector('#calendar-status').textContent = '';
    renderCalendar();
  } catch (error) {
    document.querySelector('#calendar-status').textContent = 'A disponibilidade está temporariamente indisponível. Entre em contato pelo WhatsApp.';
  }
}

renderCalendar();
updateSelection();
loadReservations();
