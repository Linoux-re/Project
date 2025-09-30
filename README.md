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
