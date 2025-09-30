# Pronote Monorepo (Simplifié)

Ce dépôt contient un monorepo pnpm prêt à accueillir une application de vie scolaire inspirée de Pronote.

## Structure

```
apps/
  api/  -> NestJS + Prisma
  web/  -> Next.js 14 (App Router)
packages/
  config/
  lib/
  ui/
prisma/
```

## Démarrage rapide

```bash
pnpm install
pnpm dev
```

La commande `pnpm dev` lance les scripts `dev` de chaque workspace (API et Web). Le fichier `docker-compose.yml` fournit une pile de services (PostgreSQL, Redis, Minio, Mailhog, Traefik) à démarrer séparément si nécessaire.

## Base de données

Le schéma Prisma est défini dans `prisma/schema.prisma`. Utilisez `pnpm db:push` pour appliquer le schéma et `pnpm db:seed` pour peupler les données de démonstration.

## Tests

Des tests unitaires exemples sont fournis pour le service de dashboard (Nest) et pour les utilitaires partagés (`packages/lib`).

## Optimisations UI et thèmes

* Les espaces statiques `ui/` et `ui-prof/` utilisent désormais une charte chromatique unie avec trois palettes disponibles :
  * **Océan** (clair, par défaut)
  * **Graphite** (sombre)
  * **Émeraude** (clair contrasté)
* Le choix du thème est persistant (`localStorage`) et s’applique instantanément aux deux espaces. Les boutons de bascule mettent à jour leur libellé via l’attribut `data-theme-label`.
* Les animations ont été uniformisées (`anim-fade-in`, `anim-toast-enter`, `hover-raise`) et ne ciblent que `opacity` / `transform`. Elles sont automatiquement désactivées si `prefers-reduced-motion` est actif.
* Les toasts, modales, drawers et cartes utilisent ces helpers et conservent une transition fluide tout en respectant l’accessibilité (`aria-live`, focus trap).

## Mesures de performance

* `pnpm lighthouse` exécute Lighthouse CI sur les pages clés (`ui/login.html`, `ui/dashboard.html`) à partir du dossier statique.
* `pnpm analyze` lance `next build` avec l’analyse de bundle activée (`ANALYZE=1`). Les rapports sont générés dans `.next/analyze/`.
* Les budgets définis dans `lighthouserc.json` garantissent des scores ≥ 90 (Performance, Accessibilité, Best Practices) et un poids JS utile < 70 KB (gzip) sur les pages publiques.

## Qualité & CI

* Husky + lint-staged formatent/lintent automatiquement les fichiers JS/TS/JSON avant commit (`pnpm prepare` installe les hooks).
* Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute désormais lint → tests → builds ciblés → Lighthouse CI avec mise en cache pnpm.
