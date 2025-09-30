import { initShell } from "./app.js";
import { qs, qsa, loadJSON, formatDate, toast } from "./util.js";

const state = {
  devoirs: [],
  filter: "all"
};

const renderList = () => {
  const list = qs("#devoirs-list");
  if (!list) return;
  list.innerHTML = "";
  const filtered = state.devoirs.filter((devoir) => {
    if (state.filter === "all") return true;
    if (state.filter === "done") return devoir.status === "rendu";
    if (state.filter === "pending") return devoir.status !== "rendu";
    return true;
  });
  if (!filtered.length) {
    list.innerHTML = '<p class="table-empty">Aucun devoir à afficher.</p>';
    return;
  }
  filtered.forEach((devoir) => {
    const item = document.createElement("article");
    item.className = "card";
    item.dataset.animate = "pop";
    item.innerHTML = `
      <header class="card__header">
        <div>
          <h3 class="card__title">${devoir.title}</h3>
          <p class="card__meta">${devoir.class} · ${devoir.subject}</p>
        </div>
        <span class="badge ${devoir.status === "rendu" ? "badge--ok" : "badge--soft"}">
          ${devoir.status === "rendu" ? "Rendu" : "À faire"}
        </span>
      </header>
      <p>${devoir.instructions}</p>
      <footer class="card__footer list-inline">
        <span class="badge">Rendu le ${formatDate(devoir.dueDate)}</span>
        ${devoir.resources
          .map((res) => `<a class="btn btn--ghost" href="${res.url}" download>${res.label}</a>`)
          .join("")}
        <button class="btn btn--secondary" type="button" data-action="submit" data-id="${devoir.id}">
          ${devoir.status === "rendu" ? "Voir la remise" : "Remettre"}
        </button>
      </footer>
    `;
    list.appendChild(item);
  });
};

const attachHandlers = () => {
  const list = qs("#devoirs-list");
  list?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='submit']");
    if (!button) return;
    const devoir = state.devoirs.find((item) => item.id === button.dataset.id);
    if (!devoir) return;
    if (devoir.status === "rendu") {
      toast("Vous avez déjà remis ce devoir", "warning");
      return;
    }
    devoir.status = "rendu";
    devoir.submission = {
      date: new Date().toISOString(),
      note: null
    };
    toast("Remise enregistrée (simulation)", "success");
    renderList();
  });
};

const initFilter = () => {
  qsa("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      qsa("[data-filter]").forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      state.filter = button.dataset.filter;
      renderList();
    });
  });
};

const initForm = () => {
  const form = qs("#devoir-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const newDevoir = {
      id: `d-${crypto.randomUUID()}`,
      title: formData.get("title"),
      class: formData.get("class"),
      subject: formData.get("subject"),
      instructions: formData.get("instructions"),
      dueDate: formData.get("dueDate"),
      status: "à faire",
      resources: []
    };
    state.devoirs.unshift(newDevoir);
    renderList();
    toast("Devoir créé (simulation)", "success");
    form.reset();
  });
};

const init = async () => {
  initShell();
  const data = await loadJSON("./mock/devoirs.json");
  state.devoirs = data;
  renderList();
  attachHandlers();
  initFilter();
  initForm();
};

init().catch((err) => {
  console.error(err);
  toast("Erreur lors du chargement du cahier de texte", "danger");
});
