import { fetchJSON, qs, toast, csvExport, formatTime } from './util.js';

const state = {
  cours: [],
  current: null
};

const renderCours = () => {
  const select = qs('[data-presence-cours]');
  select.innerHTML = state.cours
    .map((cours) => `<option value="${cours.id}">${cours.classe} · ${formatTime(cours.debut)}</option>`)
    .join('');
  select.dispatchEvent(new Event('change'));
};

const renderListe = () => {
  const list = qs('[data-presence-eleves]');
  if (!state.current || !list) return;
  list.innerHTML = state.current.eleves
    .map(
      (eleve) => `
      <li data-eleve="${eleve.id}">
        <span>${eleve.nom}</span>
        <div class="inline-actions" role="group" aria-label="Statut ${eleve.nom}">
          <button class="btn" data-status="P" aria-pressed="${eleve.statut === 'P'}">Présent</button>
          <button class="btn btn--ghost" data-status="A" aria-pressed="${eleve.statut === 'A'}">Absent</button>
          <button class="btn btn--ghost" data-status="R" aria-pressed="${eleve.statut === 'R'}">Retard</button>
        </div>
      </li>`
    )
    .join('');
};

const bindCours = () => {
  qs('[data-presence-cours]')?.addEventListener('change', (event) => {
    const id = event.target.value;
    state.current = state.cours.find((cours) => String(cours.id) === id);
    renderListe();
  });
};

const bindListe = () => {
  qs('[data-presence-eleves]')?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-status]');
    if (!btn) return;
    const li = btn.closest('li');
    const eleve = state.current.eleves.find((item) => String(item.id) === li.dataset.eleve);
    eleve.statut = btn.dataset.status;
    renderListe();
  });

  document.addEventListener('keydown', (event) => {
    if (!state.current) return;
    if (!['p', 'a', 'r'].includes(event.key.toLowerCase())) return;
    const focused = document.activeElement?.closest('li');
    if (!focused) return;
    const eleve = state.current.eleves.find((item) => String(item.id) === focused.dataset.eleve);
    eleve.statut = event.key.toUpperCase();
    renderListe();
  });
};

const bindActions = () => {
  qs('[data-presence-notifier]')?.addEventListener('click', () => {
    toast('Notification envoyée (démo)', 'success');
  });
  qs('[data-presence-export]')?.addEventListener('click', () => {
    if (!state.current) return;
    const rows = state.current.eleves.map((eleve) => [eleve.nom, eleve.statut]);
    csvExport('presence.csv', ['Élève', 'Statut'], rows);
  });
};

const init = async () => {
  state.cours = await fetchJSON('./mock/presences.json');
  renderCours();
  bindCours();
  bindListe();
  bindActions();
};

document.addEventListener('DOMContentLoaded', init);
