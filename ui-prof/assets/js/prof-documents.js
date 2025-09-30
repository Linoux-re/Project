import { fetchJSON, qs, toast, csvExport } from './util.js';

const state = {
  documents: [],
  filter: 'all'
};

const renderList = () => {
  const list = qs('[data-doc-list]');
  const docs = state.filter === 'all' ? state.documents : state.documents.filter((doc) => doc.classe === state.filter);
  list.innerHTML = docs
    .map(
      (doc) => `
      <article class="card" data-doc="${doc.id}">
        <header class="card__header">
          <h3 class="card__title">${doc.titre}</h3>
          <span class="badge">${doc.classe}</span>
        </header>
        <p>${doc.tags.join(', ')}</p>
        <footer>
          <span>${doc.type}</span>
        </footer>
      </article>`
    )
    .join('');
};

const bindFilters = () => {
  qs('[data-doc-filter]')?.addEventListener('change', (event) => {
    state.filter = event.target.value;
    renderList();
  });
};

const bindUpload = () => {
  const dropzone = qs('[data-dropzone]');
  dropzone?.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'));
  dropzone?.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    const files = Array.from(event.dataTransfer.files);
    simulateUpload(files);
  });
  qs('[data-doc-input]')?.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    simulateUpload(files);
  });
};

const simulateUpload = (files) => {
  files.forEach((file) => {
    const progress = document.createElement('div');
    progress.className = 'card';
    progress.innerHTML = `<strong>Upload ${file.name}</strong><progress max="100" value="0"></progress>`;
    qs('[data-doc-uploads]')?.appendChild(progress);
    let val = 0;
    const id = setInterval(() => {
      val += 20;
      progress.querySelector('progress').value = val;
      if (val >= 100) {
        clearInterval(id);
        state.documents.unshift({
          id: Date.now(),
          titre: file.name,
          classe: state.filter === 'all' ? '5A' : state.filter,
          tags: ['Nouveau'],
          type: file.type || 'Document'
        });
        renderList();
        toast(`${file.name} envoyé`, 'success');
        progress.remove();
      }
    }, 250);
  });
};

const bindExport = () => {
  qs('[data-doc-export]')?.addEventListener('click', () => {
    const rows = state.documents.map((doc) => [doc.titre, doc.classe, doc.tags.join(' ')]);
    csvExport('documents.csv', ['Titre', 'Classe', 'Tags'], rows);
  });
};

const init = async () => {
  state.documents = await fetchJSON('./mock/documents.json');
  renderList();
  bindFilters();
  bindUpload();
  bindExport();
};

document.addEventListener('DOMContentLoaded', init);
