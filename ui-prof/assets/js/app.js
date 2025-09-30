import { qs, qsa, store, trapFocus, toast, hotkeys } from './util.js';

const themeStore = store('ui-prof-theme');
let sidebarRelease = null;
const THEMES = ['ocean', 'graphite', 'emerald'];
const THEME_LABELS = {
  ocean: 'Océan',
  graphite: 'Graphite',
  emerald: 'Émeraude'
};

const updateThemeLabels = (theme) => {
  qsa('[data-action="toggle-theme"]').forEach((toggle) => {
    const label = qs('[data-theme-label]', toggle);
    if (label) {
      label.textContent = `Thème : ${THEME_LABELS[theme]}`;
    }
    toggle.setAttribute('data-theme', theme);
  });
};

const applyTheme = (theme) => {
  const html = document.documentElement;
  const stored = themeStore.get('theme');
  const fallback = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'graphite' : 'ocean';
  const next = THEMES.includes(theme) ? theme : THEMES.includes(stored) ? stored : fallback;
  html.dataset.theme = next;
  themeStore.set('theme', next);
  updateThemeLabels(next);
};

const toggleTheme = () => {
  const current = document.documentElement.dataset.theme || 'ocean';
  const index = THEMES.indexOf(current);
  const next = THEMES[(index + 1) % THEMES.length];
  applyTheme(next);
};

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(themeStore.get('theme'));
  qsa('[data-action="toggle-theme"]').forEach((toggle) => {
    toggle.addEventListener('click', toggleTheme);
  });

  const sidebar = qs('.sidebar');
  const backdrop = qs('.sidebar-backdrop');
  const openBtn = qs('[data-action="open-sidebar"]');
  const closeBtn = qs('[data-action="close-sidebar"]');

  const setSidebar = (open) => {
    if (!sidebar) return;
    sidebar.dataset.open = String(open);
    backdrop?.setAttribute('data-open', String(open));
    if (open) {
      sidebarRelease = trapFocus(sidebar);
    } else if (typeof sidebarRelease === 'function') {
      sidebarRelease();
      sidebarRelease = null;
    }
  };

  openBtn?.addEventListener('click', () => setSidebar(true));
  closeBtn?.addEventListener('click', () => setSidebar(false));
  backdrop?.addEventListener('click', () => setSidebar(false));

  hotkeys({
    'g d': () => qs('[data-shortcut="dashboard"]')?.focus(),
    'g e': () => qs('[data-shortcut="edt"]')?.focus(),
    '?': () => toast('Raccourcis : g d tableau de bord, g e emploi du temps', 'info', 5000)
  });

  requestAnimationFrame(() => {
    qsa('.card').forEach((card) => {
      card.classList.add('anim-fade-in');
      requestAnimationFrame(() => card.classList.add('show'));
    });
  });

  const roleGuard = async () => {
    try {
      const me = await fetch('./mock/prof-me.json').then((res) => res.json());
      if (me.role !== 'prof') {
        toast('Accès réservé aux professeurs. Redirection...', 'error');
        setTimeout(() => (window.location.href = '../ui/login.html'), 1200);
      }
      qs('[data-user-name]')?.replaceChildren(document.createTextNode(me.name));
    } catch (error) {
      console.error(error);
      toast('Impossible de vérifier la session', 'error');
    }
  };
  roleGuard();
});

