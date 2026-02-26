# Guide de Deploiement Gratuit

Ce guide explique comment deployer le frontend Angular, le backend Express et la base MongoDB gratuitement.

---

## 1. Base de donnees - MongoDB Atlas (deja en place)

La base est hebergee sur MongoDB Atlas (gratuit, cluster M0).

**URL de connexion :** deja configuree dans le `.env` backend (`MONGODB_URI`).

### Si vous devez creer un nouveau cluster :
1. Aller sur [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Creer un compte gratuit
3. Creer un cluster **M0 (Free Tier)**
4. Dans **Database Access** : creer un utilisateur avec mot de passe
5. Dans **Network Access** : ajouter `0.0.0.0/0` (autoriser toutes les IP pour le deploiement)
6. Recuperer la connection string : **Connect > Drivers > Node.js**
7. Format : `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db_name>`

---

## 2. Backend - Render (gratuit)

[Render](https://render.com) offre un tier gratuit pour les Web Services Node.js.

### Etapes :

1. **Pusher le backend sur GitHub** (repo `m1p13mean-Marcello-Fitahiana-backend`)

2. **Creer un compte sur [render.com](https://render.com)** et connecter votre GitHub

3. **Nouveau Web Service :**
   - Cliquer **New > Web Service**
   - Connecter le repo backend
   - Parametres :
     - **Name** : `centre-commercial-api`
     - **Region** : Frankfurt (EU) ou Oregon (US)
     - **Branch** : `main`
     - **Runtime** : Node
     - **Build Command** : `npm install`
     - **Start Command** : `npm start`
     - **Instance Type** : **Free**

4. **Variables d'environnement** (onglet Environment) :
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://mean_db_user:<password>@mean-cluster.byfajqp.mongodb.net/?appName=mean-cluster
   NODE_ENV=production
   JWT_SECRET=CentreCommercial_M1P13_SecretKey_2026_Marcello_Fitahiana
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FRONTEND_URL=https://votre-frontend.vercel.app
   ```

5. **Deployer** : Render build et deploie automatiquement

6. **URL obtenue** : `https://centre-commercial-api.onrender.com`

> **Note** : Sur le tier gratuit Render, le serveur s'arrete apres 15 min d'inactivite et redemarre au prochain appel (delai de ~30s). C'est normal.

### Seed des donnees en production :
```bash
# Temporairement, mettre MONGODB_URI en local vers Atlas puis :
MONGODB_URI="mongodb+srv://..." node seed.js
```

---

## 3. Frontend - Vercel (gratuit)

[Vercel](https://vercel.com) est ideal pour deployer des apps Angular (gratuit, CDN mondial).

### Preparation :

1. **Mettre a jour `environment.ts`** (production) :
   ```typescript
   export const environment = {
       production: true,
       apiUrl: 'https://centre-commercial-api.onrender.com/api/v1',
       uploadsUrl: 'https://centre-commercial-api.onrender.com/uploads'
   };
   ```

2. **Creer `vercel.json`** a la racine du frontend :
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/frontend/browser",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   Le `rewrites` est necessaire pour que le routing Angular fonctionne (SPA).

### Deploiement :

1. **Pusher le frontend sur GitHub** (repo `m1p13mean-Marcello-Fitahiana-frontend`)

2. **Creer un compte sur [vercel.com](https://vercel.com)** et connecter votre GitHub

3. **Importer le projet :**
   - Cliquer **Add New > Project**
   - Selectionner le repo frontend
   - **Framework Preset** : Other
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist/frontend/browser`

4. **Deployer** : Vercel build et deploie automatiquement

5. **URL obtenue** : `https://votre-projet.vercel.app`

### Alternative : Netlify (gratuit)

1. Creer un compte sur [netlify.com](https://netlify.com)
2. **New site from Git** > selectionner le repo
3. **Build command** : `npm run build`
4. **Publish directory** : `dist/frontend/browser`
5. Ajouter un fichier `_redirects` dans `src/` :
   ```
   /*    /index.html   200
   ```
   Et l'ajouter dans `angular.json` > `assets` pour qu'il soit copie au build.

---

## 4. Mise a jour des URLs apres deploiement

### Backend `.env` :
```
FRONTEND_URL=https://votre-frontend.vercel.app
```

### Frontend `environment.ts` :
```typescript
export const environment = {
    production: true,
    apiUrl: 'https://centre-commercial-api.onrender.com/api/v1',
    uploadsUrl: 'https://centre-commercial-api.onrender.com/uploads'
};
```

> **Important** : `environment.development.ts` garde les URLs localhost pour le dev local.

---

## 5. Checklist post-deploiement

- [ ] Backend Render demarre sans erreur (verifier les logs)
- [ ] MongoDB Atlas : IP `0.0.0.0/0` autorisee (Network Access)
- [ ] Frontend Vercel build OK
- [ ] CORS : `FRONTEND_URL` dans le `.env` backend = URL Vercel exacte
- [ ] Tester login admin sur l'URL de production
- [ ] Tester creation commande (flux client complet)
- [ ] Verifier que les uploads d'images fonctionnent

---

## Resume des services gratuits

| Service    | Plateforme    | Tier   | Limite principale                     |
|------------|---------------|--------|---------------------------------------|
| Base       | MongoDB Atlas | M0     | 512 MB stockage                       |
| Backend    | Render        | Free   | Spin-down apres 15 min d'inactivite   |
| Frontend   | Vercel        | Hobby  | 100 GB bandwidth/mois                 |

Cout total : **0 Ar / 0 EUR**
