import {
  fetchJSON,
  qs,
  qsa,
  toast,
  csvExport,
  pdfExport,
  average
} from './util.js';

const NOTES_FIELDS = ['eleve', 'note', 'coefficient', 'commentaire'];

const state = {
  devoirs: [],
  classe: '5A'
};

const tableBody = () => qs('[data-notes-table] tbody');

const renderTable = () => {
  const tbody = tableBody();
  if (!tbody) return;
  tbody.innerHTML = state.devoirs
    .filter((line) => line.classe === state.classe)
    .map(
      (line) => `
        <tr data-eleve="${line.eleveId}">
          <th scope="row">${line.eleve}</th>
          <td><input data-field="note" type="number" min="0" max="20" step="0.25" value="${line.note ?? ''}" class="table-input" aria-label="Note pour ${line.eleve}"></td>
          <td><input data-field="coefficient" type="number" min="0.1" max="5" step="0.1" value="${line.coefficient}" class="table-input" aria-label="Coefficient pour ${line.eleve}"></td>
          <td><input data-field="commentaire" type="text" value="${line.commentaire ?? ''}" class="table-input" aria-label="Appréciation pour ${line.eleve}"></td>
        </tr>`
    )
    .join('');
  computeAverage();
};

const computeAverage = () => {
  const lines = state.devoirs.filter((line) => line.classe === state.classe && line.note != null);
  const values = lines.map((line) => Number(line.note));
  const weights = lines.map((line) => Number(line.coefficient));
  const avg = values.length ? average(values, weights) : 0;
  qs('[data-notes-average]')?.replaceChildren(document.createTextNode(`${avg.toFixed(2)}/20`));
};

const handleInput = (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const cell = input.closest('tr');
  const field = input.dataset.field;
  const eleveId = cell?.dataset.eleve;
  if (!field || !eleveId) return;
  const record = state.devoirs.find((line) => String(line.eleveId) === eleveId && line.classe === state.classe);
  if (!record) return;
  if (field === 'note') {
    let value = Number(input.value);
    if (Number.isNaN(value) || value < 0 || value > 20) {
      input.classList.add('invalid');
      toast('Note hors barème 0-20', 'error');
      return;
    }
    input.classList.remove('invalid');
    record.note = value;
  } else if (field === 'coefficient') {
    record.coefficient = Number(input.value) || 1;
  } else {
    record.commentaire = input.value;
  }
  computeAverage();
};

const handlePaste = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const text = event.clipboardData?.getData('text');
  if (!text) return;
  const rows = text.trim().split(/\r?\n/).map((row) => row.split(/\t|,/));
  const startRow = target.closest('tr');
  if (!startRow) return;
  const allRows = Array.from(tableBody().rows);
  const startIndex = allRows.indexOf(startRow);
  rows.forEach((cols, rowIdx) => {
    const rowEl = allRows[startIndex + rowIdx];
    if (!rowEl) return;
    const inputs = qsa('input.table-input', rowEl);
    cols.forEach((value, colIdx) => {
      const inputEl = inputs[colIdx];
      if (!inputEl) return;
      inputEl.value = value;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
};

const handleKeydown = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const row = target.closest('tr');
  if (!row) return;
  const inputs = qsa('input.table-input', row);
  const index = inputs.indexOf(target);
  const rows = Array.from(tableBody().rows);
  const rowIndex = rows.indexOf(row);
  const navigate = (nextRowIndex, nextIndex) => {
    const nextRow = rows[nextRowIndex];
    if (!nextRow) return;
    const nextInputs = qsa('input.table-input', nextRow);
    const nextInput = nextInputs[nextIndex] || nextInputs[nextInputs.length - 1];
    nextInput?.focus();
    nextInput?.select();
  };
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      navigate(rowIndex, Math.min(index + 1, inputs.length - 1));
      break;
    case 'ArrowLeft':
      event.preventDefault();
      navigate(rowIndex, Math.max(index - 1, 0));
      break;
    case 'ArrowDown':
      event.preventDefault();
      navigate(Math.min(rowIndex + 1, rows.length - 1), index);
      break;
    case 'ArrowUp':
      event.preventDefault();
      navigate(Math.max(rowIndex - 1, 0), index);
      break;
    case 'Enter':
      event.preventDefault();
      navigate(Math.min(rowIndex + 1, rows.length - 1), index);
      break;
    default:
      break;
  }
};

const bindListeners = () => {
  tableBody()?.addEventListener('change', handleInput);
  tableBody()?.addEventListener('paste', handlePaste);
  tableBody()?.addEventListener('keydown', handleKeydown);
  qs('[data-notes-classe]')?.addEventListener('change', (event) => {
    state.classe = event.target.value;
    renderTable();
  });
  qs('[data-action="normalize"]')?.addEventListener('click', () => {
    state.devoirs = state.devoirs.map((line) => {
      if (line.classe !== state.classe || line.note == null) return line;
      const min = 8;
      const max = 20;
      line.note = Number(((line.note - min) / (max - min)) * 20).toFixed(2);
      return line;
    });
    renderTable();
  });
  qs('[data-action="round"]')?.addEventListener('click', () => {
    state.devoirs.forEach((line) => {
      if (line.classe !== state.classe || line.note == null) return;
      const rest = line.note % 1;
      const increments = [0, 0.25, 0.5, 0.75];
      const nearest = increments.reduce((prev, current) =>
        Math.abs(current - rest) < Math.abs(prev - rest) ? current : prev
      );
      line.note = Math.floor(line.note) + nearest;
    });
    renderTable();
  });
  qs('[data-action="export-csv"]')?.addEventListener('click', () => {
    const lines = state.devoirs.filter((line) => line.classe === state.classe);
    const rows = lines.map((line) => [line.eleve, line.note ?? '', line.coefficient, line.commentaire ?? '']);
    csvExport(`notes-${state.classe}.csv`, ['Élève', 'Note', 'Coeff', 'Commentaire'], rows);
  });
  qs('[data-action="export-pdf"]')?.addEventListener('click', () => {
    pdfExport(`notes-${state.classe}`);
  });
};

const init = async () => {
  state.devoirs = await fetchJSON('./mock/notes.json');
  renderTable();
  bindListeners();
};

document.addEventListener('DOMContentLoaded', init);
