import { initShell } from "./app.js";
import { qs, qsa, loadJSON, formatDate, formatTime, toast } from "./util.js";

const state = {
  threads: [],
  activeThread: null
};

const renderThreadList = () => {
  const list = qs("#thread-list");
  if (!list) return;
  list.innerHTML = "";
  state.threads.forEach((thread) => {
    const button = document.createElement("button");
    button.className = "btn btn--ghost";
    button.setAttribute("type", "button");
    button.dataset.threadId = thread.id;
    button.setAttribute("aria-pressed", thread.id === state.activeThread ? "true" : "false");
    button.innerHTML = `
      <strong>${thread.subject}</strong>
      <span class="text-muted">${thread.participants.join(", ")}</span>
      <span class="badge ${thread.unread ? "badge--danger" : ""}">${thread.messages.length}</span>
    `;
    list.appendChild(button);
  });
};

const renderMessages = () => {
  const container = qs("#messages-container");
  if (!container) return;
  container.innerHTML = "";
  const thread = state.threads.find((t) => t.id === state.activeThread);
  if (!thread) {
    container.innerHTML = '<p class="table-empty">Sélectionnez une conversation.</p>';
    return;
  }
  thread.messages.forEach((message) => {
    const article = document.createElement("article");
    article.className = "card anim-fade-in";
    article.innerHTML = `
      <header class="card__header">
        <div>
          <strong>${message.sender}</strong>
          <p class="card__meta">${formatDate(message.sentAt)} · ${formatTime(message.sentAt)}</p>
        </div>
      </header>
      <p>${message.content}</p>
    `;
    container.appendChild(article);
    requestAnimationFrame(() => article.classList.add("show"));
  });
  container.scrollTop = container.scrollHeight;
};

const initComposer = () => {
  const form = qs("#message-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const thread = state.threads.find((t) => t.id === state.activeThread);
    if (!thread) {
      toast("Sélectionnez une conversation", "warning");
      return;
    }
    const content = new FormData(form).get("content").trim();
    if (!content) {
      toast("Message vide", "warning");
      return;
    }
    thread.messages.push({
      sender: "Moi",
      sentAt: new Date().toISOString(),
      content
    });
    form.reset();
    toast("Message envoyé (simulation)", "success", { ttl: 1800 });
    renderMessages();
  });
};

const attachListeners = () => {
  const list = qs("#thread-list");
  list?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-thread-id]");
    if (!button) return;
    state.activeThread = button.dataset.threadId;
    state.threads.forEach((thread) => {
      thread.unread = false;
    });
    renderThreadList();
    renderMessages();
  });
};

const init = async () => {
  initShell();
  const data = await loadJSON("./mock/messages.json");
  state.threads = data;
  state.activeThread = state.threads[0]?.id ?? null;
  renderThreadList();
  renderMessages();
  initComposer();
  attachListeners();
};

init().catch((err) => {
  console.error(err);
  toast("Erreur lors du chargement des messages", "danger");
});
