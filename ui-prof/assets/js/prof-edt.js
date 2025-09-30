import { fetchJSON, qs, qsa, formatTime, toast, bindModal, openModal, closeModal } from './util.js';

const state = {
  cours: [],
  view: 'semaine'
};

const render = () => {
  const grid = qs('[data-edt-grid]');
  if (!grid) return;
  grid.innerHTML = state.cours
    .map(
      (cours) => `
      <article class="card" draggable="true" data-cours="${cours.id}" style="--start:${cours.position.start};--end:${cours.position.end}">
        <header class="card__header">
          <h3 class="card__title">${cours.matiere}</h3>
          <span class="badge">${cours.classe}</span>
        </header>
        <p>${formatTime(cours.debut)} - ${formatTime(cours.fin)} · ${cours.salle}</p>
      </article>`
    )
    .join('');
};

const bindDrag = () => {
  let dragged = null;
  qsa('[data-edt-grid] article').forEach((card) => {
    card.addEventListener('dragstart', () => {
      dragged = card;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      dragged = null;
      card.classList.remove('dragging');
    });
  });

  qs('[data-edt-grid]')?.addEventListener('dragover', (event) => {
    event.preventDefault();
    const y = event.offsetY;
    if (!dragged) return;
    dragged.style.setProperty('--start', Math.max(1, Math.round(y / 40)));
    dragged.style.setProperty('--end', Math.max(Number(dragged.style.getPropertyValue('--start')) + 1, Math.round(y / 40) + 2));
  });
};

const bindConflicts = () => {
  const cards = qsa('[data-edt-grid] article');
  cards.forEach((card) => card.classList.remove('conflict'));
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].style.getPropertyValue('--start') === cards[j].style.getPropertyValue('--start')) {
        cards[i].classList.add('conflict');
        cards[j].classList.add('conflict');
      }
    }
  }
};

const bindActions = () => {
  qs('[data-action="switch-view"]')?.addEventListener('click', () => {
    state.view = state.view === 'semaine' ? 'jour' : 'semaine';
    qs('[data-view-label]')?.replaceChildren(document.createTextNode(state.view));
  });
  qs('[data-action="ajouter-seance"]')?.addEventListener('click', () => {
    openModal('modal-seance');
  });
  qs('[data-seance-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    state.cours.push({
      id: Date.now(),
      matiere: data.get('matiere'),
      classe: data.get('classe'),
      salle: data.get('salle'),
      debut: data.get('debut'),
      fin: data.get('fin'),
      position: { start: 5, end: 7 }
    });
    render();
    bindDrag();
    bindConflicts();
    toast('Séance ajoutée (démo)', 'success');
    closeModal('modal-seance');
    form.reset();
  });
};

const init = async () => {
  state.cours = await fetchJSON('./mock/edt.json');
  render();
  bindDrag();
  bindConflicts();
  bindModal();
  bindActions();
};

document.addEventListener('DOMContentLoaded', init);
