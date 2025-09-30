# Rapport d'optimisation UI / Performance

## Résumé
- Harmonisation de la charte couleurs via trois thèmes unis (`ocean`, `graphite`, `emerald`) avec bascule persistante.
- Animations limitées à `opacity/transform` (`anim-fade-in`, `anim-toast-enter`, `hover-raise`) et désactivées si `prefers-reduced-motion`.
- Refonte des toasts/modales/sidebar avec délégation d'événements, focus trap, aria-live et transition GPU-friendly.
- Chaîne CI enrichie (lint → tests → build → Lighthouse CI) et scripts développeur (`pnpm analyze`, `pnpm lighthouse`).

## Poids des bundles (gzip)
| Ressource | Avant (work) | Après | Variation |
| --- | --- | --- | --- |
| `ui/assets/js/app.js` | 1.74 KB | 2.31 KB | +0.57 KB |
| `ui/assets/js/auth.js` | 1.76 KB | 1.83 KB | +0.07 KB |
| **Total JS login** | **3.49 KB** | **4.14 KB** | **+0.65 KB** |
| `ui/assets/css/base.css` | 1.47 KB | 1.60 KB | +0.13 KB |
| `ui/assets/css/components.css` | 2.11 KB | 2.10 KB | −0.01 KB |
| `ui/assets/css/forms.css` | 0.95 KB | 0.96 KB | +0.01 KB |
| `ui/assets/css/animations.css` | 0.29 KB | 0.35 KB | +0.06 KB |
| **Total CSS login** | **4.82 KB** | **5.01 KB** | **+0.19 KB** |

Malgré l’ajout des thèmes et utilitaires, le JavaScript reste largement sous le budget requis (< 70 KB) et le CSS critique des pages publiques est < 8 KB.

## Lighthouse & Core Web Vitals
- CI configure `lhci` pour analyser `/login.html` et `/dashboard.html` en mode mobile (`lighthouserc.json`).
- Budgets enforce `Performance`, `Accessibilité`, `Best Practices` ≥ 0.90 et `total-byte-weight` ≤ 200 KB.
- L’exécution locale nécessite un binaire Chrome. Dans cet environnement conteneur, l’exécution via `npx @lhci/cli` échoue faute de navigateur, mais GitHub Actions dispose de Chrome stable.

## Accessibilité & DX
- Boutons de thème exposent un libellé dynamique `data-theme-label`, accessibles et persistés (`localStorage`).
- Modales/drawers utilisent `trapFocus`, sortie `Escape`, overlays cliquables et feedback SR via `announce()` / `aria-live`.
- Toasts empilables avec fermeture automatique et transitions respectant les préférences de mouvement.
- Husky + lint-staged ajoutés pour bloquer les commits non formatés; `pnpm lighthouse` et `pnpm analyze` disponibles.

## Fichiers retirés / renommés
- Suppression de l’attribut décoratif `data-animate` remplacé par des classes utilitaires (`anim-fade-in`).
- Aucune suppression de fichier physique.

## Check-list de validation
- [x] Thèmes `ocean`, `graphite`, `emerald` disponibles côté `ui/` et `ui-prof/`.
- [x] Animations uniquement sur `opacity/transform`, désactivables (`prefers-reduced-motion` ou toggle anti-motion).
- [x] Menu latéral avec focus trap & animation glissante.
- [x] Toasts, modales et dropdowns en délégation d’événements et aria-ready.
- [x] CI : lint, tests, build, Lighthouse CI via GitHub Actions.
