# Espace Professeur (UI démo)

Interface statique HTML/CSS/JS dédiée au rôle professeur pour la démo Pronote+. Tous les écrans utilisent des données mockées chargées depuis `/mock/*.json`.

## Lancer la démo

Ouvrez les fichiers HTML directement dans votre navigateur (`file://`) ou servez le dossier avec un mini serveur (ex. `npx serve ui-prof`). Le thème et l’état mobile fonctionnent hors connexion.

## Pages

- `prof-index.html` : tableau de bord, widgets, mini-graphes.
- `prof-devoirs.html` : création/gestion des devoirs, remises, export CSV.
- `prof-notes.html` : tableur de notes avec navigation clavier, collage Excel, exports.
- `prof-competences.html` : saisie A/B/C/D au clavier, exports.
- `prof-presences.html` : prise d’appel P/A/R + export.
- `prof-edt.html` : emploi du temps drag & drop, ajout de séance.
- `prof-messages.html` : messagerie avec filtres, mentions, composition.
- `prof-documents.html` : upload drag & drop avec progression simulée.
- `prof-reunions.html` : génération de créneaux parents-profs, réservations mock et exports.

## Accessibilité & raccourcis

- Couleurs respectant WCAG AA, focus visible, structure sémantique.
- `g d` pour focuser Tableau de bord, `g e` pour focuser Emploi du temps, `?` pour aide.
- Raccourcis spécifiques :
  - Notes : flèches, entrée, collage multi-cellules.
  - Compétences : `1`→A, `2`→B, `3`→C, `4`→D.
  - Présences : `P`, `A`, `R`.

## Checklist a11y

- [x] Navigation clavier complète (sidebar, modales, formulaires).
- [x] Modales avec `aria-modal`, trap focus, fermeture ESC/clic fond.
- [x] Toasts `aria-live="polite"`.
- [x] Tables avec en-têtes `<th>` et rôles ARIA.
- [x] Composants responsive mobile-first.

## Mock data

Les JSON du dossier `mock/` simulent les retours API : profil professeur, devoirs, notes, compétences, présences, edt, messages, documents, réunions.

## Licence

Usage libre pour prototypage interne.
