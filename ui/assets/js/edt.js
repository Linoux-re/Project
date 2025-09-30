import { initShell } from "./app.js";
import { qs, qsa, loadJSON, formatTime, toast, clamp, announce } from "./util.js";

const HOURS = Array.from({ length: 11 }, (_, idx) => 7 + idx); // 7h-17h
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

const state = {
  view: "week",
  events: [],
  dragging: null
};

const renderGrid = () => {
  const grid = qs("#edt-grid");
  if (!grid) return;
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = state.view === "day" ? "60px 1fr" : "60px repeat(5, 1fr)";
  const days = state.view === "day" ? [DAYS[new Date().getDay() - 1] || "Lun"] : DAYS;
  const headerRow = document.createElement("div");
  headerRow.className = "calendar-grid calendar-grid--header";
  headerRow.style.display = "contents";
  const blank = document.createElement("div");
  blank.className = "calendar-grid__time";
  grid.appendChild(blank);
  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-grid__cell";
    cell.innerHTML = `<strong>${day}</strong>`;
    grid.appendChild(cell);
  });

  HOURS.forEach((hour) => {
    const timeCell = document.createElement("div");
    timeCell.className = "calendar-grid__time";
    timeCell.textContent = `${hour}h`;
    grid.appendChild(timeCell);
    days.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "calendar-grid__cell";
      cell.dataset.day = day;
      cell.dataset.hour = hour;
      grid.appendChild(cell);
    });
  });
  paintEvents();
};

const paintEvents = () => {
  const grid = qs("#edt-grid");
  if (!grid) return;
  qsa(".event-card", grid).forEach((el) => el.remove());
  state.events.forEach((event) => {
    if (state.view === "day" && event.day !== (DAYS[new Date().getDay() - 1] || "Lun")) return;
    const target = qsa(
      `.calendar-grid__cell[data-day='${event.day}'][data-hour='${Math.floor(event.startHour)}']`,
      grid
    )[0];
    if (!target) return;
    const card = document.createElement("article");
    card.className = "event-card";
    card.draggable = true;
    card.dataset.id = event.id;
    card.innerHTML = `
      <div>
        <p class="event-card__title">${event.title}</p>
        <p class="event-card__meta">${formatTime(event.start)} – ${formatTime(event.end)} · ${event.room}</p>
      </div>
      <div class="tooltip" role="tooltip">${event.teacher} · ${event.className}</div>
    `;
    const durationHours = (event.end - event.start) / (1000 * 60 * 60);
    card.style.top = `${(event.startMinuteOffset / 60) * 100}%`;
    card.style.height = `${durationHours * 100}%`;
    target.appendChild(card);
  });
};

const attachDnD = () => {
  const grid = qs("#edt-grid");
  if (!grid) return;
  grid.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".event-card");
    if (!card) return;
    state.dragging = { id: card.dataset.id };
    card.classList.add("dragging");
  });
  grid.addEventListener("dragend", (event) => {
    const card = event.target.closest(".event-card");
    if (card) {
      card.classList.remove("dragging");
    }
    state.dragging = null;
  });
  qsa(".calendar-grid__cell", grid).forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!state.dragging) return;
      const hour = Number(cell.dataset.hour);
      const day = cell.dataset.day;
      const updated = state.events.find((ev) => ev.id === state.dragging.id);
      if (!updated) return;
      const start = new Date(updated.start);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(updated.end);
      const diff = end.getTime() - updated.start;
      end.setHours(hour);
      updated.start = start.getTime();
      updated.end = start.getTime() + diff;
      updated.day = day;
      updated.startHour = hour;
      updated.startMinuteOffset = 0;
      paintEvents();
      toast("Cours déplacé", "success");
    });
  });
};

const switchView = (view) => {
  state.view = view;
  renderGrid();
};

const initViewToggle = () => {
  qsa("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      qsa("[data-view]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      switchView(btn.dataset.view);
    });
  });
};

const loadEvents = async () => {
  const data = await loadJSON("./mock/edt.json");
  state.events = data.map((event, index) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return {
      id: event.id || `evt-${index}`,
      title: event.title,
      room: event.room,
      teacher: event.teacher,
      className: event.class,
      day: event.day,
      start: start.getTime(),
      end: end.getTime(),
      startHour: start.getHours(),
      startMinuteOffset: start.getMinutes()
    };
  });
  renderGrid();
  attachDnD();
};

const initTimeline = () => {
  const indicator = qs("#current-time-indicator");
  const label = qs("#current-time-label");
  if (!indicator) return;
  const update = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const top = clamp((hour - 7 + minutes / 60) * 100, 0, 100);
    indicator.style.top = `${top}%`;
    if (label) {
      label.textContent = `Heure actuelle ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    }
  };
  update();
  setInterval(update, 60000);
};

const init = async () => {
  initShell();
  initViewToggle();
  await loadEvents();
  initTimeline();
  toast("Emploi du temps chargé", "success", { ttl: 2500 });
};

init().catch((error) => {
  console.error(error);
  toast("Erreur lors du chargement de l'emploi du temps", "danger");
});
