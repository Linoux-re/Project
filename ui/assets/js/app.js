import { qs, qsa, store, trapFocus, toast, announce, keybindings } from "./util.js";

const themeStore = store("local", "pronote-ui");

const applyTheme = (theme) => {
  const html = document.documentElement;
  html.dataset.theme = theme;
  themeStore.set("theme", theme);
  announce(`Thème ${theme === "dark" ? "sombre" : "clair"} activé`);
};

const initThemeToggle = () => {
  const toggle = qs("[data-theme-toggle]");
  const saved = themeStore.get("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);
  if (toggle) {
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      toggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      applyTheme(next);
    });
  }
};

const initSidebar = () => {
  const body = document.body;
  const toggleButtons = qsa("[data-sidebar-toggle]");
  const drawer = qs(".app-sidebar");
  const backdrop = qs(".app-drawer-backdrop");
  let releaseFocus = () => {};
  const open = () => {
    body.classList.add("sidebar-open");
    releaseFocus = trapFocus(drawer);
  };
  const close = () => {
    body.classList.remove("sidebar-open");
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
  qsa("[data-dropdown]").forEach((dropdown) => {
    const button = qs("button", dropdown);
    const menu = qs(".dropdown__menu", dropdown);
    let releaseFocus = () => {};
    const open = () => {
      dropdown.dataset.open = "true";
      releaseFocus = trapFocus(menu);
    };
    const close = () => {
      dropdown.dataset.open = "false";
      releaseFocus();
    };
    button.addEventListener("click", () => {
      const isOpen = dropdown.dataset.open === "true";
      isOpen ? close() : open();
    });
    dropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
      }
    });
    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        close();
      }
    });
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
  const triggers = qsa("[data-toast]");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      toast(trigger.dataset.toast, trigger.dataset.toastType || "default");
    });
  });
};

export const initShell = () => {
  document.body.classList.add("app-shell");
  initThemeToggle();
  initSidebar();
  initDropdowns();
  initTabs();
  initModals();
  initToasts();
  initShortcuts();
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
