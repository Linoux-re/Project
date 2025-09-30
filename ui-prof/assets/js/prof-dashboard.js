import { fetchJSON, qs, qsa, formatDate, formatTime } from './util.js';

const renderWidgets = (data) => {
  const nextCourse = qs('[data-widget="next-course"]');
  if (nextCourse) {
    const course = data.prochainsCours[0];
    nextCourse.innerHTML = `
      <strong>${course.titre}</strong>
      <span>${course.classe} · ${formatTime(course.debut)} - ${formatTime(course.fin)}</span>
      <span>${course.salle}</span>
    `;
  }

  const devoirs = qs('[data-widget="devoirs-corriger"]');
  if (devoirs) {
    devoirs.innerHTML = data.devoirsACorriger
      .map((item) => `<li><button class="btn btn--ghost" data-open-devoir="${item.id}">${item.titre} · ${item.classe}</button></li>`)
      .join('');
  }

  const copies = qs('[data-widget="copies-non-rendues"]');
  copies.innerHTML = data.copiesNonRendues
    .map((item) => `<li>${item.nom} · ${item.devoir} <span class="badge badge--warning">${item.joursRetard} j</span></li>`)
    .join('');

  const moyennes = qs('[data-widget="moyennes-classes"]');
  moyennes.innerHTML = data.moyennesParClasse
    .map(
      (item) => `
      <div class="stat-card">
        <h3>${item.classe}</h3>
        <strong>${item.moyenne.toFixed(2)}/20</strong>
        <div class="badge">${item.evolution > 0 ? '+' : ''}${item.evolution.toFixed(2)}</div>
      </div>`
    )
    .join('');

  const notifications = qs('[data-widget="notifications"]');
  notifications.innerHTML = data.notifications
    .map((item) => `<li><span>${formatDate(item.date)} · ${item.message}</span></li>`)
    .join('');
};

const renderSparklines = (data) => {
  qsa('svg[data-spark="notes"]').forEach((svg) => {
    const max = Math.max(...data.distributionNotes);
    const path = data.distributionNotes
      .map((value, idx) => {
        const x = (idx / (data.distributionNotes.length - 1)) * 100;
        const y = 60 - (value / max) * 60;
        return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
    svg.innerHTML = `<path d="${path}" fill="none" stroke="var(--primary)" stroke-width="2" />`;
  });

  qsa('svg[data-spark="presence"]').forEach((svg) => {
    const total = Math.max(...data.tauxPresence);
    svg.innerHTML = data.tauxPresence
      .map((value, idx) => {
        const height = (value / total) * 60;
        const x = idx * 18 + 4;
        const y = 60 - height;
        return `<rect x="${x}" y="${y}" width="12" height="${height}" rx="3"></rect>`;
      })
      .join('');
  });
};

const bindActions = () => {
  qsa('[data-open-devoir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.location.href = 'prof-devoirs.html#devoir-' + btn.dataset.openDevoir;
    });
  });
};

const init = async () => {
  try {
    const data = await fetchJSON('./mock/dashboard.json');
    renderWidgets(data);
    renderSparklines(data);
    bindActions();
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', init);
