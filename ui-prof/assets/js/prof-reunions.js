import { fetchJSON, qs, toast, csvExport, pdfExport, formatTime } from './util.js';

const state = {
  slots: []
};

const renderSlots = () => {
  const list = qs('[data-slot-list]');
  list.innerHTML = state.slots
    .map(
      (slot) => `
      <article class="card" data-slot="${slot.id}">
        <header class="card__header">
          <h3 class="card__title">${formatTime(slot.debut)} - ${formatTime(slot.fin)}</h3>
          <span class="badge">${slot.classe}</span>
        </header>
        <p>${slot.parent ?? 'Créneau libre'}</p>
        <footer>${slot.statut}</footer>
      </article>`
    )
    .join('');
};

const bindGenerator = () => {
  qs('[data-slot-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const start = new Date(`${data.get('date')}T${data.get('debut')}`);
    for (let i = 0; i < Number(data.get('nombre')); i++) {
      const begin = new Date(start.getTime() + i * 10 * 60000);
      const end = new Date(begin.getTime() + 10 * 60000);
      state.slots.push({
        id: Date.now() + i,
        debut: begin.toISOString(),
        fin: end.toISOString(),
        classe: data.get('classe'),
        statut: 'Libre'
      });
    }
    renderSlots();
    toast('Créneaux générés', 'success');
  });
};

const bindBookings = () => {
  qs('[data-slot-list]')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-slot]');
    if (!card) return;
    const slot = state.slots.find((s) => String(s.id) === card.dataset.slot);
    if (slot.parent) {
      slot.parent = null;
      slot.statut = 'Libre';
    } else {
      slot.parent = 'Famille Dupont';
      slot.statut = 'Confirmé';
    }
    renderSlots();
  });
};

const bindExports = () => {
  qs('[data-slot-export]')?.addEventListener('click', () => {
    const rows = state.slots.map((slot) => [formatTime(slot.debut), formatTime(slot.fin), slot.parent ?? 'Libre']);
    csvExport('reunions.csv', ['Début', 'Fin', 'Parent'], rows);
  });
  qs('[data-slot-pdf]')?.addEventListener('click', () => pdfExport('planning-reunions'));
};

const init = async () => {
  state.slots = await fetchJSON('./mock/reunions.json');
  renderSlots();
  bindGenerator();
  bindBookings();
  bindExports();
};

document.addEventListener('DOMContentLoaded', init);
