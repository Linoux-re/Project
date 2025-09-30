# Interface Pronote Demo

Cette interface statique démontre une application type Pronote construite en HTML/CSS/JS natif. Toutes les données sont simulées via des fichiers JSON locaux chargés avec `fetch`. Aucun backend n'est requis.

## Structure

```
ui/
  index.html
  login.html
  dashboard.html
  edt.html
  devoirs.html
  notes.html
  absences.html
  messages.html
  documents.html
  admin.html
  assets/
    css/
      base.css
      layout.css
      components.css
      forms.css
      animations.css
    js/
      app.js
      auth.js
      edt.js
      devoirs.js
      notes.js
      messages.js
      documents.js
      util.js
    icons/
      ui-sprite.svg
  mock/
    *.json
  img/
    placeholders/
```

## Utilisation

1. Ouvrez un serveur statique (ex: `npx serve ui` ou `python -m http.server`).
2. Naviguez vers `/ui/index.html` pour choisir un rôle ou directement `/ui/login.html`.
3. Les pages chargent leurs données depuis `mock/*.json` et appliquent les interactions côté client.

## Checklist accessibilité

- [x] Contrastes AA vérifiés sur palette claire/sombre
- [x] Focus visible personnalisé, sans suppression d'outline
- [x] Composants ARIA (modale, tabs, toast, navigation)
- [x] Navigation clavier complète (sidebar trap focus, raccourcis `g d`, `g e`, `?`)
- [x] Respect `prefers-reduced-motion`

## Tests manuels suggérés

- Connexion avec mauvais mot de passe 5 fois → verrouillage 30s
- Connexion correcte → modale 2FA code `123456`
- Toggle thème → persiste sur toutes les pages
- Drag & drop d'un cours dans `edt.html`
- Tri des tableaux sur `notes.html` et pagination
- Upload mock sur `documents.html` avec barre de progression
- Toasts automatiques (`app.toast`)

## Performances

- Aucun framework; JS total < 30KB (non minifié ~26KB)
- Composants réutilisables et chargement différé des modules par page
- Images SVG optimisées, lazy load

## Captures (à générer)

Ajoutez des captures d'écran dans `ui/img/` si nécessaire.

