import { fetchJSON, qs, qsa, formatDateTime, toast } from './util.js';

const state = {
  threads: [],
  filter: 'all'
};

const renderThreads = () => {
  const list = qs('[data-thread-list]');
  const threads = state.filter === 'all' ? state.threads : state.threads.filter((t) => t.categorie === state.filter);
  list.innerHTML = threads
    .map(
      (thread) => `
      <article class="card" data-thread="${thread.id}">
        <header class="card__header">
          <h3 class="card__title">${thread.objet}</h3>
          <span class="badge">${thread.categorie}</span>
        </header>
        <p>${thread.aperçu}</p>
        <footer>${formatDateTime(thread.date)}</footer>
      </article>`
    )
    .join('');
};

const bindFilters = () => {
  qsa('[data-filter-thread]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filterThread;
      renderThreads();
    });
  });
};

const bindComposer = () => {
  const form = qs('[data-message-form]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    state.threads.unshift({
      id: Date.now(),
      objet: data.get('objet'),
      categorie: data.get('destinataires'),
      aperçu: data.get('contenu').slice(0, 80),
      date: new Date().toISOString()
    });
    renderThreads();
    toast('Message envoyé à ' + data.get('destinataires'), 'success');
    form.reset();
  });

  qs('[data-mention]')?.addEventListener('click', (event) => {
    const textarea = qs('[name="contenu"]');
    const mention = event.target.dataset.mention;
    textarea.value += ` @${mention}`;
    textarea.focus();
  });
};

const init = async () => {
  state.threads = await fetchJSON('./mock/messages.json');
  renderThreads();
  bindFilters();
  bindComposer();
};

document.addEventListener('DOMContentLoaded', init);
