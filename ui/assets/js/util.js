/** Utility helpers shared across pages */
export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const store = (type = "local", namespace = "pronote-ui") => {
  const storage = type === "session" ? sessionStorage : localStorage;
  return {
    get(key, fallback = null) {
      try {
        const value = storage.getItem(`${namespace}:${key}`);
        return value ? JSON.parse(value) : fallback;
      } catch (err) {
        console.warn("Storage get error", err);
        return fallback;
      }
    },
    set(key, value) {
      try {
        storage.setItem(`${namespace}:${key}`, JSON.stringify(value));
      } catch (err) {
        console.warn("Storage set error", err);
      }
    },
    remove(key) {
      storage.removeItem(`${namespace}:${key}`);
    }
  };
};

let focusStack = [];
export const trapFocus = (container) => {
  const focusable = qsa(
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    container
  );
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const previous = document.activeElement;
  focusStack.push(previous);
  const handleKey = (event) => {
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener("keydown", handleKey);
  first.focus();
  return () => {
    container.removeEventListener("keydown", handleKey);
    if (focusStack.length) {
      const previousFocus = focusStack.pop();
      previousFocus && previousFocus.focus && previousFocus.focus();
    }
  };
};

export const debounce = (fn, delay = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const formatDate = (date, options = {}) => {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options
  });
  return fmt.format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
};

export const validateEmail = (value) =>
  /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/.test(value.trim());

export const passwordStrengthHint = (value) => {
  if (value.length < 10) return "Minimum 10 caractères";
  const hasNumber = /\d/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  let hints = [];
  if (!hasNumber) hints.push("chiffre");
  if (!hasUpper) hints.push("majuscule");
  if (!hasSymbol) hints.push("symbole");
  return hints.length ? `Ajoutez ${hints.join(", ")}` : "Mot de passe robuste";
};

const toastRegion = () => {
  let container = qs(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "region");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }
  return container;
};

export const toast = (message, type = "default", options = {}) => {
  const container = toastRegion();
  const toastEl = document.createElement("div");
  toastEl.className = "toast anim-toast-enter";
  toastEl.dataset.type = type;
  toastEl.innerHTML = `
    <div>
      <p>${message}</p>
      ${options.description ? `<p class="text-muted">${options.description}</p>` : ""}
    </div>
    <button class="btn btn--ghost" type="button" aria-label="Fermer la notification">&times;</button>
  `;
  let dismissed = false;
  const close = () => {
    if (dismissed) return;
    dismissed = true;
    toastEl.classList.remove("show");
    toastEl.addEventListener(
      "transitionend",
      () => {
        toastEl.remove();
      },
      { once: true }
    );
  };
  toastEl.querySelector("button").addEventListener("click", close);
  container.appendChild(toastEl);
  requestAnimationFrame(() => {
    toastEl.classList.add("show");
  });
  const ttl = options.ttl ?? 4000;
  if (ttl) setTimeout(close, ttl);
  return close;
};

export const loadJSON = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Impossible de charger ${path}`);
  return response.json();
};

export const formatDuration = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs ? `${hrs}h` : ""}${mins ? `${mins}`.padStart(2, "0") : ""}`;
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const announce = (message) => {
  let region = qs("#sr-announcer");
  if (!region) {
    region = document.createElement("div");
    region.id = "sr-announcer";
    region.className = "visually-hidden";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  region.textContent = message;
};

export const createIcon = (id, label = "") => {
  const span = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  span.setAttribute("aria-hidden", label ? "false" : "true");
  span.setAttribute("focusable", "false");
  span.classList.add("icon");
  span.innerHTML = `<use href="#${id}"></use>`;
  if (label) {
    span.setAttribute("role", "img");
    span.setAttribute("aria-label", label);
  }
  return span;
};

export const keybindings = () => {
  const bindings = new Map();
  let sequence = [];
  let timer;
  const reset = () => {
    sequence = [];
    clearTimeout(timer);
  };
  const handler = (event) => {
    if (event.target.matches("input, textarea")) return;
    const key = `${event.ctrlKey ? "ctrl+" : ""}${event.key.toLowerCase()}`;
    sequence.push(key);
    const combo = sequence.join(" ");
    clearTimeout(timer);
    timer = setTimeout(reset, 600);
    if (bindings.has(combo)) {
      event.preventDefault();
      bindings.get(combo)();
      reset();
    }
  };
  document.addEventListener("keydown", handler);
  return {
    register(shortcut, callback) {
      bindings.set(shortcut, callback);
    },
    destroy() {
      document.removeEventListener("keydown", handler);
      bindings.clear();
      reset();
    }
  };
};
