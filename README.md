# Portfolio — Guillaume de Cadoudal

Portfolio bilingue d’AI / Python Engineer, construit avec React, TypeScript et Vite puis publié sur GitHub Pages.

## Fonctionnalités

- contenu français et anglais avec préférence locale persistante ;
- thème clair/sombre, navigation responsive et progression de lecture ;
- six études de cas détaillées et laboratoire de projets filtrable ;
- fiches projet accessibles au clavier et partageables par ancre ;
- CV public sans numéro de téléphone ;
- métadonnées SEO, données structurées et carte Open Graph ;
- aucun tracking, cookie ou formulaire serveur.

## Développement

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:5173/portfolio/`.

```bash
npm test
npm run build
```

## Publication

Le workflow GitHub Actions publie le dossier `dist` sur GitHub Pages à chaque push sur `main`.

URL cible : <https://kaa-serpent.github.io/portfolio/>

## Contenu

Les textes structurés sont centralisés dans `src/content.json`. Le CV est généré par `scripts/generate_cv.py`, puis copié dans `public/` pour le téléchargement.
