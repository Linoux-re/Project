import { initShell } from "./app.js";
import { qs, qsa, loadJSON, toast } from "./util.js";

const state = {
  documents: []
};

const renderDocs = () => {
  const list = qs("#documents-list");
  if (!list) return;
  list.innerHTML = "";
  if (!state.documents.length) {
    list.innerHTML = '<p class="table-empty">Aucun document.</p>';
    return;
  }
  state.documents.forEach((doc) => {
    const item = document.createElement("article");
    item.className = "card";
    item.innerHTML = `
      <header class="card__header">
        <div>
          <h3 class="card__title">${doc.title}</h3>
          <p class="card__meta">${doc.owner} · ${doc.type}</p>
        </div>
        <a class="btn btn--ghost" href="${doc.url}" download>Télécharger</a>
      </header>
      <p>${doc.description || ""}</p>
      <div class="list-inline">
        ${doc.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;
    list.appendChild(item);
  });
};

const simulateUpload = (file) => {
  const uploads = qs("#upload-progress");
  const card = document.createElement("div");
  card.className = "file-card";
  card.innerHTML = `
    <div>
      <strong>${file.name}</strong>
      <p class="text-muted">${(file.size / 1024).toFixed(1)} Ko</p>
    </div>
    <div class="file-card__progress"><span></span></div>
  `;
  uploads?.appendChild(card);
  const bar = qs("span", card);
  let progress = 0;
  const timer = setInterval(() => {
    progress += Math.random() * 25;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      toast("Upload terminé", "success");
      state.documents.unshift({
        id: `doc-${crypto.randomUUID()}`,
        title: file.name,
        owner: "Moi",
        type: file.type || "Document",
        description: "Ajouté via l'uploader",
        url: "#",
        tags: ["Nouveau"]
      });
      renderDocs();
      setTimeout(() => card.remove(), 500);
    }
    bar.style.width = `${progress}%`;
  }, 400);
};

const initDropzone = () => {
  const dropzone = qs("#dropzone");
  const input = qs("#file-input");
  if (!dropzone || !input) return;
  const activate = () => dropzone.setAttribute("data-active", "true");
  const deactivate = () => dropzone.setAttribute("data-active", "false");
  ["dragenter", "dragover"].forEach((event) => {
    dropzone.addEventListener(event, (e) => {
      e.preventDefault();
      activate();
    });
  });
  ["dragleave", "drop"].forEach((event) => {
    dropzone.addEventListener(event, (e) => {
      e.preventDefault();
      deactivate();
    });
  });
  dropzone.addEventListener("drop", (event) => {
    const files = Array.from(event.dataTransfer.files).slice(0, 3);
    files.forEach(simulateUpload);
  });
  input.addEventListener("change", () => {
    const files = Array.from(input.files || []).slice(0, 3);
    files.forEach(simulateUpload);
    input.value = "";
  });
};

const init = async () => {
  initShell();
  const data = await loadJSON("./mock/documents.json");
  state.documents = data;
  renderDocs();
  initDropzone();
};

init().catch((err) => {
  console.error(err);
  toast("Erreur lors du chargement des documents", "danger");
});
