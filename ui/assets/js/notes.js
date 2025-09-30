import { initShell } from "./app.js";
import { qs, qsa, loadJSON, formatDate, toast } from "./util.js";

const state = {
  notes: [],
  sort: { key: "date", direction: "desc" },
  page: 1,
  perPage: 6
};

const computeAverage = () => {
  if (!state.notes.length) return 0;
  const total = state.notes.reduce((acc, note) => acc + (note.value / note.scale) * note.coefficient, 0);
  const coef = state.notes.reduce((acc, note) => acc + note.coefficient, 0);
  return (total / coef) * 20;
};

const renderTable = () => {
  const table = qs("#notes-body");
  const pagination = qs("#notes-pagination");
  const average = qs("#notes-average");
  if (!table || !pagination) return;
  table.innerHTML = "";
  const sorted = [...state.notes].sort((a, b) => {
    const { key, direction } = state.sort;
    const dir = direction === "asc" ? 1 : -1;
    if (key === "date") {
      return (new Date(a.date) - new Date(b.date)) * dir;
    }
    if (key === "value") {
      return ((a.value / a.scale) * 20 - (b.value / b.scale) * 20) * dir;
    }
    return a[key].localeCompare(b[key]) * dir;
  });
  const start = (state.page - 1) * state.perPage;
  const visible = sorted.slice(start, start + state.perPage);
  if (!visible.length) {
    table.innerHTML = '<tr><td colspan="6" class="table-empty">Aucune note.</td></tr>';
  } else {
    visible.forEach((note) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatDate(note.date)}</td>
        <td>${note.subject}</td>
        <td>${note.title}</td>
        <td>${note.value}/${note.scale}</td>
        <td>${note.coefficient}</td>
        <td>${note.appreciation || ""}</td>
      `;
      table.appendChild(row);
    });
  }
  const totalPages = Math.ceil(sorted.length / state.perPage) || 1;
  state.page = Math.min(state.page, totalPages);
  pagination.innerHTML = `
    <button class="btn btn--ghost" type="button" ${state.page === 1 ? "disabled" : ""} data-page="prev">Préc.</button>
    <span>Page ${state.page} / ${totalPages}</span>
    <button class="btn btn--ghost" type="button" ${state.page === totalPages ? "disabled" : ""} data-page="next">Suiv.</button>
  `;
  if (average) {
    average.textContent = computeAverage().toFixed(2);
  }
};

const initSort = () => {
  qsa("[data-sort]").forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.dataset.sort;
      if (state.sort.key === key) {
        state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
      } else {
        state.sort.key = key;
        state.sort.direction = "asc";
      }
      qsa("[data-sort]").forEach((th) => th.setAttribute("aria-sort", "none"));
      header.setAttribute("aria-sort", state.sort.direction === "asc" ? "ascending" : "descending");
      state.page = 1;
      renderTable();
    });
  });
};

const initPagination = () => {
  const pagination = qs("#notes-pagination");
  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button) return;
    if (button.dataset.page === "prev" && state.page > 1) {
      state.page -= 1;
    }
    if (button.dataset.page === "next") {
      const totalPages = Math.ceil(state.notes.length / state.perPage) || 1;
      if (state.page < totalPages) state.page += 1;
    }
    renderTable();
  });
};

const init = async () => {
  initShell();
  const data = await loadJSON("./mock/notes.json");
  state.notes = data;
  renderTable();
  initSort();
  initPagination();
  toast("Notes chargées", "success", { ttl: 2000 });
};

init().catch((err) => {
  console.error(err);
  toast("Impossible de charger les notes", "danger");
});
