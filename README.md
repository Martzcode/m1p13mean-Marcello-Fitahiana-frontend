# Projet MEAN M1P13 - Frontend

Ce projet est un frontend Angular 18+ structuré de manière professionnelle pour assurer la scalabilité et la maintenabilité.

## Architecture

Le projet suit une structure modulaire centrée sur la séparation des préoccupations :

- **`src/app/core/`** : Services singletons, modèles globaux, gardes et intercepteurs. Logique centrale de l'application.
- **`src/app/shared/`** : Composants, directives et pipes réutilisables à travers plusieurs fonctionnalités.
- **`src/app/features/`** : Modules basés sur les fonctionnalités (ex: Accueil, Dashboard). Chaque fonctionnalité encapsule sa propre logique.
- **`src/app/layouts/`** : Composants de structure (ex: MainLayout) qui définissent l'organisation visuelle globale.
- **`src/environments/`** : Configurations spécifiques aux environnements (développement, production).

## Intégration API

Un service de base `ApiService` est disponible dans `core/services/api.service.ts` pour faciliter la communication avec le backend Express.js.
L'URL de l'API peut être configurée dans les fichiers du dossier `src/environments/`.

## Développement

Pour lancer le serveur de développement :
1. Exécutez `npm start`.
2. Accédez à `http://localhost:4200/`.

## Design

Le projet utilise un système de design "Premium" en mode sombre avec :
- Des effets de **Glassmorphism**.
- Une typographie moderne (**Inter**).
- Des variables CSS pour une personnalisation aisée.
