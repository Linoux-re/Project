/** @param {string} sel */
export const qs = (sel, scope = document) => scope.querySelector(sel);
/** @param {string} sel */
export const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

export const store = (namespace, storage = localStorage) => ({
  get(key, fallback) {
    try {
      const raw = storage.getItem(`${namespace}:${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  },
  set(key, value) {
    storage.setItem(`${namespace}:${key}`, JSON.stringify(value));
  },
  remove(key) {
    storage.removeItem(`${namespace}:${key}`);
  }
});

export const debounce = (fn, delay = 200) => {
  let id;
  return (...args) => {
    window.clearTimeout(id);
    id = window.setTimeout(() => fn(...args), delay);
  };
};

let focusTrapStack = [];
export const trapFocus = (container) => {
  const focusable = qsa(
    'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
    container
  );
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const previous = document.activeElement;
  const handler = (event) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', handler);
  first.focus();
  focusTrapStack.push({ container, handler, previous });
  return () => {
    container.removeEventListener('keydown', handler);
    const item = focusTrapStack.pop();
    if (item?.previous instanceof HTMLElement) {
      item.previous.focus();
    }
  };
};

const toastStack = [];
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-stack';
toastContainer.setAttribute('aria-live', 'polite');
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(toastContainer);
});

export const toast = (message, type = 'info', timeout = 3500) => {
  const el = document.createElement('div');
  el.className = 'toast';
  el.dataset.type = type;
  el.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(el);
  toastStack.push(el);
  window.setTimeout(() => {
    el.remove();
  }, timeout);
};

export const csvParse = (text) => {
  const rows = text.trim().split(/\r?\n/);
  return rows.map((row) => row.split(/\t|,/));
};

export const csvExport = (filename, headers, rows) => {
  const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const pdfExport = (title) => {
  const win = window.open('', '_blank');
  if (!win) return toast('Autoriser les popups pour exporter le PDF', 'error');
  const doc = document.documentElement.cloneNode(true);
  win.document.write('<!doctype html>' + doc.outerHTML);
  win.document.close();
  win.document.title = title;
  win.focus();
  win.print();
};

export const tableSort = (table, { type = 'text' } = {}) => {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const index = parseInt(table.dataset.sortIndex || '0', 10);
  const direction = table.dataset.sortDirection === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    const av = a.cells[index]?.dataset.sortValue ?? a.cells[index]?.textContent ?? '';
    const bv = b.cells[index]?.dataset.sortValue ?? b.cells[index]?.textContent ?? '';
    if (type === 'number') {
      return (parseFloat(av) - parseFloat(bv)) * direction;
    }
    return String(av).localeCompare(String(bv)) * direction;
  });
  rows.forEach((row) => tbody.appendChild(row));
};

export const paginate = (items, page = 1, perPage = 10) => {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;
  return {
    page: safePage,
    perPage,
    pages,
    total,
    items: items.slice(start, start + perPage)
  };
};

export const formatDate = (iso) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
export const formatDateTime = (iso) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
export const formatTime = (iso) => new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(new Date(iso));

export const hotkeys = (map) => {
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable) {
      return;
    }
    const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.shiftKey ? 'shift+' : ''}${event.key.toLowerCase()}`;
    if (map[key]) {
      event.preventDefault();
      map[key]();
    }
  });
};

export const fetchJSON = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Erreur lors du chargement des données');
  return res.json();
};

export const state = (initial = {}) => {
  let current = { ...initial };
  const listeners = new Set();
  return {
    get: () => current,
    set: (next) => {
      current = { ...current, ...next };
      listeners.forEach((fn) => fn(current));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
};

export const average = (values, weights) => {
  const totalWeights = weights.reduce((acc, w) => acc + w, 0);
  if (!totalWeights) return 0;
  const sum = values.reduce((acc, value, idx) => acc + value * weights[idx], 0);
  return sum / totalWeights;
};

const modalReleases = new Map();

export const openModal = (id) => {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.dataset.open = 'true';
  const dialog = modal.querySelector('.modal__dialog');
  const release = trapFocus(dialog);
  const key = crypto.randomUUID();
  modalReleases.set(key, release);
  modal.dataset.releaseId = key;
};

export const closeModal = (id) => {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.dataset.open = 'false';
  const release = modalReleases.get(modal.dataset.releaseId);
  if (typeof release === 'function') release();
  modalReleases.delete(modal.dataset.releaseId);
  delete modal.dataset.releaseId;
};

export const bindModal = () => {
  qsa('[data-modal-target]').forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger.dataset.modalTarget));
  });
  qsa('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal?.id) closeModal(modal.id);
    });
  });
  qsa('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal.id);
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal(modal.id);
    });
  });
};
