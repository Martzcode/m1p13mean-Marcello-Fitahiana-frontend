# Guide de Contribution & GitHub

Ce guide définit les standards pour collaborer sur le projet via GitHub.

## 🌿 Stratégie de Branches

Nous utilisons une convention de nommage stricte pour les branches afin de maintenir un historique clair.

- **`main`** : Branche de production. Tout code sur cette branche doit être testé et prêt pour le déploiement.
- **`develop`** : Branche d'intégration principale.
- **`feature/nom-de-la-feature`** : Pour le développement de nouvelles fonctionnalités (ex: `feature/login-page`).
- **`fix/nom-du-bug`** : Pour les corrections de bugs (ex: `fix/api-connection-error`).
- **`docs/sujet`** : Pour les mises à jour de documentation.

## 💬 Messages de Commit

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` : Une nouvelle fonctionnalité.
- `fix:` : Une correction de bug.
- `docs:` : Changements dans la documentation.
- `style:` : Changements qui n'affectent pas le sens du code (espace, formatage, etc.).
- `refactor:` : Modification du code qui ne corrige pas de bug et n'ajoute pas de fonctionnalité.
- `chore:` : Mise à jour des tâches de build, dépendances, etc.

*Exemple : `feat(auth): ajouter le service d'authentification`*

## 🔄 Workflow Git

1. **Créer une branche** à partir de `develop` :
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/ma-nouvelle-feature
   ```
2. **Développer et Commiter** : Utilisez des petits commits descriptifs.
3. **Pousser la branche** :
   ```bash
   git push origin feature/ma-nouvelle-feature
   ```
4. **Ouvrir une Pull Request (PR)** : Vers la branche `develop`.

## 🚀 Déploiement

Toute fusion sur la branche `main` déclenchera (prochainement) un pipeline de déploiement automatique vers l'hébergeur choisi.
