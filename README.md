# Centre Commercial - Frontend

Frontend Angular 18 pour le systeme de gestion de centre commercial.

**Auteurs :** Fitahiana (ETU002421) & Marcello (ETU002641) - Projet M1 MEAN Stack

---

## Prerequis

- **Node.js** v18+ (recommande v20)
- **npm** v9+
- **Backend** demarre sur `http://localhost:3000` (voir le [README backend](../m1p13mean-Marcello-Fitahiana-backend/README.md))

## Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Martzcode/m1p13mean-Marcello-Fitahiana-frontend.git
cd m1p13mean-Marcello-Fitahiana-frontend

# 2. Installer les dependances
npm install
```

## Configuration

Les URLs de l'API sont configurees dans les fichiers d'environnement :

**`src/environments/environment.development.ts`** (dev local) :
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api/v1',
    uploadsUrl: 'http://localhost:3000/uploads'
};
```

**`src/environments/environment.ts`** (production) :
```typescript
export const environment = {
    production: true,
    apiUrl: 'https://votre-backend.onrender.com/api/v1',
    uploadsUrl: 'https://votre-backend.onrender.com/uploads'
};
```

> Modifier `environment.ts` avec les URLs de production avant de deployer.

## Demarrage

```bash
# Serveur de developpement (http://localhost:4200)
npm start

# Build de production
npm run build
# Les fichiers sont generes dans dist/frontend/browser/
```

## Comptes de test

Apres avoir lance le seed sur le backend (`npm run seed`) :

| Role         | Email                   | Mot de passe  |
|--------------|-------------------------|---------------|
| Admin        | admin@centre.mg         | admin123      |
| Commercant   | paul.andriam@centre.mg  | password123   |
| Client       | client@centre.mg        | client123     |

## Fonctionnalites par role

### Admin
- Dashboard (stats, CA, loyers impayes)
- Gestion des zones
- Gestion des boutiques
- Gestion des loyers et paiements
- Gestion des utilisateurs
- Gestion des commandes
- Gestion des depenses (OPEX/CAPEX)
- Infos du centre commercial

### Commercant (Marchand)
- Dashboard (CA, commandes, stock)
- Gestion de sa boutique (infos, horaires)
- Gestion de ses produits (CRUD, stock, images)
- Gestion des commandes recues
- Consultation de ses loyers

### Client
- Catalogue de produits (recherche, filtres)
- Fiche boutique (description, horaires, produits)
- Panier d'achat
- Passage de commande
- Historique des commandes
- Profil personnel

## Structure du projet

```
src/
  app/
    core/                    # Services, modeles, guards, intercepteurs
      constants/             # Constantes (URLs API)
      guards/                # Auth guards (admin, merchant, client)
      interceptors/          # HTTP interceptors (JWT token)
      models/                # Interfaces TypeScript
      services/              # Services HTTP (API calls)
    features/                # Composants par fonctionnalite
      admin/                 # Pages admin (dashboard, zones, boutiques, loyers...)
      client/                # Pages client (catalogue, panier, commandes...)
      merchant/              # Pages marchand (dashboard, produits, commandes...)
      public/                # Pages publiques (boutiques, produits)
      shared/                # Pages communes (profil)
      auth/                  # Login, register
      home/                  # Page d'accueil
    layouts/                 # Header, footer, layout principal
    shared/                  # Composants reutilisables
  environments/              # Config par environnement (dev, prod)
```

## Technologies

- **Angular 18** (standalone components, @if/@for/@switch)
- **Tailwind CSS** (design gray minimalist)
- **RxJS** (gestion reactive)
- **TypeScript 5.5**

## Deploiement

Voir le fichier [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet de deploiement gratuit (Vercel/Netlify + Render + MongoDB Atlas).
