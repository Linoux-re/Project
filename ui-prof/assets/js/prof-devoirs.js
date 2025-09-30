import {
  fetchJSON,
  qs,
  qsa,
  toast,
  csvExport,
  formatDate,
  bindModal,
  openModal,
  closeModal
} from './util.js';

const state = {
  devoirs: [],
  filter: {
    classe: 'all',
    statut: 'all'
  }
};

const renderList = () => {
  const list = qs('[data-devoir-list]');
  if (!list) return;
  const filtered = state.devoirs.filter((item) => {
    const matchClasse = state.filter.classe === 'all' || item.classe === state.filter.classe;
    const matchStatut =
      state.filter.statut === 'all' ||
      (state.filter.statut === 'open' && !item.cloture) ||
      (state.filter.statut === 'closed' && item.cloture);
    return matchClasse && matchStatut;
  });
  list.innerHTML = filtered
    .map(
      (item) => `
      <article class="card anim-fade-in" id="devoir-${item.id}">
        <header class="card__header">
          <h3 class="card__title">${item.titre}</h3>
          <span class="badge">${item.classe}</span>
        </header>
        <p>${item.consigne}</p>
        <footer class="inline-actions">
          <span class="badge ${item.plagiat > 0.8 ? 'badge--danger' : ''}">Plagiat ${Math.round(item.plagiat * 100)}%</span>
          <span>${formatDate(item.dateRendu)}</span>
          <button class="btn btn--ghost" data-open-remises="${item.id}">Remises (${item.remises.length}/${item.eleves})</button>
        </footer>
      </article>`
    )
    .join('');
  requestAnimationFrame(() => {
    qsa('.anim-fade-in', list).forEach((card) => card.classList.add('show'));
  });
  bindRemises();
};

const bindFilters = () => {
  qs('[data-filter-classe]')?.addEventListener('change', (event) => {
    state.filter.classe = event.target.value;
    renderList();
  });
  qs('[data-filter-statut]')?.addEventListener('change', (event) => {
    state.filter.statut = event.target.value;
    renderList();
  });
};

const bindRemises = () => {
  qsa('[data-open-remises]').forEach((btn) => {
    btn.addEventListener('click', () => showRemises(btn.dataset.openRemises));
  });
};

const showRemises = (id) => {
  const modal = qs('#modal-remises');
  const devoir = state.devoirs.find((item) => String(item.id) === String(id));
  if (!modal || !devoir) return;
  const tbody = modal.querySelector('tbody');
  tbody.innerHTML = devoir.remises
    .map(
      (remise) => `
        <tr>
          <td>${remise.nom}</td>
          <td>${remise.statut}</td>
          <td>${remise.note ?? '—'}</td>
          <td>
            <button class="btn btn--ghost" data-feedback="${remise.id}">Commentaire</button>
          </td>
        </tr>
      `
    )
    .join('');
  openModal('modal-remises');
};

const bindForm = () => {
  const form = qs('[data-create-devoir]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const devoir = {
      id: Date.now(),
      titre: data.get('titre'),
      classe: data.get('classe'),
      consigne: data.get('consigne'),
      dateRendu: data.get('dateRendu'),
      plagiat: Math.random(),
      cloture: false,
      eleves: 28,
      remises: []
    };
    state.devoirs.unshift(devoir);
    renderList();
    toast('Devoir créé (démo)', 'success');
    form.reset();
    closeModal('modal-devoir');
  });
};

const bindExports = () => {
  qs('[data-export-remises]')?.addEventListener('click', () => {
    const rows = state.devoirs.flatMap((devoir) =>
      devoir.remises.map((remise) => [devoir.titre, remise.nom, remise.statut, remise.note ?? ''])
    );
    csvExport('remises.csv', ['Devoir', 'Élève', 'Statut', 'Note'], rows);
    toast('Export CSV généré', 'success');
  });
};

const init = async () => {
  bindModal();
  bindFilters();
  bindForm();
  bindExports();
  const data = await fetchJSON('./mock/devoirs.json');
  state.devoirs = data;
  renderList();
};

document.addEventListener('DOMContentLoaded', init);
