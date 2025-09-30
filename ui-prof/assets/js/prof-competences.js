import { fetchJSON, qs, qsa, toast, csvExport, pdfExport } from './util.js';

const LEVELS = ['A', 'B', 'C', 'D'];

const state = {
  classe: '5A',
  competence: null,
  items: []
};

const renderCompetences = () => {
  const list = qs('[data-competence-list]');
  if (!list) return;
  list.innerHTML = state.items
    .filter((item) => item.classe === state.classe)
    .map(
      (item) => `
      <button class="btn btn--ghost" data-competence="${item.id}">
        ${item.domaine} · ${item.libelle}
      </button>`
    )
    .join('');
};

const renderGrid = (competence) => {
  const table = qs('[data-competence-table] tbody');
  if (!table) return;
  table.innerHTML = competence.evaluations
    .map(
      (item) => `
      <tr data-eval="${item.id}">
        <th scope="row">${item.eleve}</th>
        ${LEVELS.map(
          (level) => `
            <td>
              <button class="btn btn--ghost" data-level="${level}" aria-pressed="${item.niveau === level}">
                ${level}
              </button>
            </td>`
        ).join('')}
      </tr>`
    )
    .join('');
};

const bindCompetences = () => {
  qsa('[data-competence]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const competence = state.items.find((item) => String(item.id) === btn.dataset.competence);
      if (!competence) return;
      state.competence = competence;
      renderGrid(competence);
    });
  });
};

const bindGrid = () => {
  qs('[data-competence-table]')?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-level]');
    if (!target) return;
    const row = target.closest('tr');
    const id = row.dataset.eval;
    const level = target.dataset.level;
    const evaluation = state.competence.evaluations.find((item) => String(item.id) === id);
    evaluation.niveau = level;
    renderGrid(state.competence);
    toast(`Niveau ${level} enregistré`, 'success');
  });

  document.addEventListener('keydown', (event) => {
    if (!state.competence) return;
    if (!LEVELS.includes(event.key.toUpperCase())) return;
    const focused = document.activeElement?.closest('tr');
    if (!focused) return;
    const evalId = focused.dataset.eval;
    const evaluation = state.competence.evaluations.find((item) => String(item.id) === evalId);
    if (!evaluation) return;
    evaluation.niveau = event.key.toUpperCase();
    renderGrid(state.competence);
  });
};

const bindExports = () => {
  qs('[data-competence-export-csv]')?.addEventListener('click', () => {
    if (!state.competence) return;
    const rows = state.competence.evaluations.map((item) => [item.eleve, item.niveau]);
    csvExport(`competences-${state.competence.libelle}.csv`, ['Élève', 'Niveau'], rows);
  });
  qs('[data-competence-export-pdf]')?.addEventListener('click', () => {
    if (!state.competence) return;
    pdfExport(`competences-${state.competence.libelle}`);
  });
};

const init = async () => {
  state.items = await fetchJSON('./mock/competences.json');
  renderCompetences();
  bindCompetences();
  bindGrid();
  bindExports();
};

document.addEventListener('DOMContentLoaded', init);
