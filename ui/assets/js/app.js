import { qs, qsa, store, trapFocus, toast, announce, keybindings } from "./util.js";

const themeStore = store("local", "pronote-ui");
const THEMES = ["ocean", "graphite", "emerald"];
const THEME_LABELS = {
  ocean: "Océan",
  graphite: "Graphite",
  emerald: "Émeraude"
};

const updateThemeLabels = (theme) => {
  qsa("[data-theme-toggle]").forEach((toggle) => {
    const label = qs("[data-theme-label]", toggle);
    if (label) {
      label.textContent = `Thème : ${THEME_LABELS[theme]}`;
    }
    toggle.setAttribute("data-theme", theme);
  });
};

const applyTheme = (theme, shouldAnnounce = true) => {
  const html = document.documentElement;
  const nextTheme = THEMES.includes(theme) ? theme : "ocean";
  html.dataset.theme = nextTheme;
  themeStore.set("theme", nextTheme);
  updateThemeLabels(nextTheme);
  if (shouldAnnounce) {
    announce(`Thème ${THEME_LABELS[nextTheme]} activé`);
  }
};

const initThemeToggle = () => {
  const toggles = qsa("[data-theme-toggle]");
  if (!toggles.length) return;
  const saved = themeStore.get("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (prefersDark ? "graphite" : "ocean");
  applyTheme(initial, false);
  const getNext = (current) => {
    const index = THEMES.indexOf(current);
    return THEMES[(index + 1) % THEMES.length];
  };
  const handler = () => {
    const current = document.documentElement.dataset.theme || "ocean";
    const next = getNext(current);
    applyTheme(next);
  };
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", handler);
  });
};

const initSidebar = () => {
  const body = document.body;
  const toggleButtons = qsa("[data-sidebar-toggle]");
  const drawer = qs(".app-sidebar");
  const backdrop = qs(".app-drawer-backdrop");
  if (drawer) {
    drawer.classList.add("anim-drawer");
  }
  let releaseFocus = () => {};
  const open = () => {
    body.classList.add("sidebar-open");
    drawer?.classList.add("show");
    releaseFocus = drawer ? trapFocus(drawer) : () => {};
  };
  const close = () => {
    body.classList.remove("sidebar-open");
    drawer?.classList.remove("show");
    releaseFocus();
  };
  toggleButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      body.classList.contains("sidebar-open") ? close() : open();
    })
  );
  if (backdrop) {
    backdrop.addEventListener("click", close);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("sidebar-open")) {
      close();
    }
  });
};

const initDropdowns = () => {
  let activeDropdown = null;
  const releases = new WeakMap();
  qsa('[data-dropdown] > button').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-dropdown] > button");
    if (trigger) {
      const dropdown = trigger.closest("[data-dropdown]");
      if (activeDropdown && activeDropdown !== dropdown) {
        activeDropdown.dataset.open = "false";
        const release = releases.get(activeDropdown);
        if (release) release();
        releases.delete(activeDropdown);
        const activeButton = qs("button", activeDropdown);
        activeButton?.setAttribute("aria-expanded", "false");
      }
      const isOpen = dropdown.dataset.open === "true";
      dropdown.dataset.open = isOpen ? "false" : "true";
      if (!isOpen) {
        const menu = qs(".dropdown__menu", dropdown);
        if (menu) {
          releases.set(dropdown, trapFocus(menu));
        }
        trigger.setAttribute("aria-expanded", "true");
      } else {
        const release = releases.get(dropdown);
        if (release) release();
        releases.delete(dropdown);
        trigger.setAttribute("aria-expanded", "false");
      }
      activeDropdown = dropdown.dataset.open === "true" ? dropdown : null;
      return;
    }
    if (activeDropdown && !activeDropdown.contains(event.target)) {
      activeDropdown.dataset.open = "false";
      const release = releases.get(activeDropdown);
      if (release) release();
      releases.delete(activeDropdown);
      const activeButton = qs("button", activeDropdown);
      activeButton?.setAttribute("aria-expanded", "false");
      activeDropdown = null;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeDropdown) {
      activeDropdown.dataset.open = "false";
      const release = releases.get(activeDropdown);
      if (release) release();
      releases.delete(activeDropdown);
      const activeButton = qs("button", activeDropdown);
      activeButton?.setAttribute("aria-expanded", "false");
      activeDropdown = null;
    }
  });
};

const initTabs = () => {
  qsa('[role="tablist"]').forEach((tablist) => {
    const tabs = qsa('[role="tab"]', tablist);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const selected = tab.getAttribute("aria-controls");
        tabs.forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
        const panels = qsa(`.tab-panel`, tablist.parentElement);
        panels.forEach((panel) => {
          panel.setAttribute("aria-hidden", panel.id === selected ? "false" : "true");
        });
      });
    });
  });
};

const initShortcuts = () => {
  const shortcuts = keybindings();
  const goTo = (href) => () => {
    window.location.href = href;
  };
  shortcuts.register("g", () => {}); // placeholder to allow combos
  shortcuts.register("g d", goTo("dashboard.html"));
  shortcuts.register("g e", goTo("edt.html"));
  shortcuts.register("?", () => {
    const help = qs("#modal-shortcuts");
    if (help) {
      openModal(help.id);
    }
  });
  window.__shortcuts = shortcuts;
};

let modalCleanup = new Map();

export const openModal = (id) => {
  const modal = qs(`#${id}`);
  if (!modal) return;
  modal.dataset.open = "true";
  const content = qs(".modal__content", modal);
  if (content) {
    const release = trapFocus(content);
    modalCleanup.set(id, release);
  }
  announce("Fenêtre ouverte");
};

export const closeModal = (id) => {
  const modal = qs(`#${id}`);
  if (!modal) return;
  modal.dataset.open = "false";
  if (modalCleanup.has(id)) {
    modalCleanup.get(id)();
    modalCleanup.delete(id);
  }
  announce("Fenêtre fermée");
};

const initModals = () => {
  qsa("[data-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.modalOpen));
  });
  qsa("[data-modal-close]").forEach((trigger) => {
    trigger.addEventListener("click", () => closeModal(trigger.dataset.modalClose));
  });
  qsa(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal__overlay")) {
        closeModal(modal.id);
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      qsa(".modal[data-open='true']").forEach((modal) => closeModal(modal.id));
    }
  });
};

const initToasts = () => {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-toast]");
    if (!trigger) return;
    toast(trigger.dataset.toast, trigger.dataset.toastType || "default");
  });
};

export const initShell = () => {
  document.body.classList.add("app-shell");
  initSidebar();
  initDropdowns();
  initTabs();
  initShortcuts();
  qsa(".card").forEach((card) => card.classList.add("anim-fade-in"));
  qsa(".modal__content").forEach((modal) => modal.classList.add("anim-fade-in"));
  requestAnimationFrame(() => {
    qsa(".anim-fade-in").forEach((el) => el.classList.add("show"));
  });
  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = "#main";
  skipLink.textContent = "Aller au contenu";
  document.body.prepend(skipLink);
  const motionToggle = qs("[data-motion-toggle]");
  if (motionToggle) {
    const toggle = () => {
      const reduced = document.body.classList.toggle("no-motion");
      announce(`Animations ${reduced ? "désactivées" : "activées"}`);
    };
    motionToggle.addEventListener("click", toggle);
  }
};

window.app = {
  toast,
  openModal,
  closeModal
};

initThemeToggle();
initToasts();
initModals();

export { toast };
