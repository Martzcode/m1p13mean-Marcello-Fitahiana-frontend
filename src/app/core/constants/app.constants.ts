// Base URLs et configuration
export const API_CONFIG = {
  // En production Docker, utiliser le nom du service
  // En dev local, utiliser localhost:3000
  BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app',
  API_VERSION: 'v1',
  get API_URL() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      UPDATE_DETAILS: '/auth/updatedetails',
      UPDATE_PASSWORD: '/auth/updatepassword'
    },
    USERS: '/users',
    CENTRE: '/centre',
    ZONES: '/zones',
    BOUTIQUES: '/boutiques',
    LOYERS: '/loyers',
    PAIEMENTS: '/paiements',
    EMPLOYES: '/employes',
    DASHBOARD: '/dashboard'
  }
};

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'administrateur',
  MERCHANT: 'commerçant',
  CLIENT: 'client'
};

// Catégories de boutiques
export const BOUTIQUE_CATEGORIES = [
  'Mode',
  'Alimentation',
  'Électronique',
  'Cosmétique',
  'Sport',
  'Librairie',
  'Restauration',
  'Services',
  'Autre'
];

// Statuts
export const BOUTIQUE_STATUS = {
  LIBRE: 'libre',
  OCCUPEE: 'occupée'
};

export const LOYER_STATUS = {
  ACTIF: 'actif',
  EXPIRE: 'expiré',
  RESILIE: 'résilié'
};

export const PAIEMENT_STATUS = {
  PAYE: 'payé',
  IMPAYE: 'impayé',
  PARTIEL: 'partiel'
};

// Méthodes de paiement
export const PAYMENT_METHODS = {
  LOYERS: ['espèces', 'carte', 'virement', 'chèque'],
  SALAIRES: ['espèces', 'virement', 'chèque']
};

// Fonctions d'employés
export const EMPLOYE_FONCTIONS = [
  'Agent de sécurité',
  'Agent d\'entretien',
  'Réceptionniste',
  'Gestionnaire',
  'Technicien',
  'Autre'
];

// Périodicité des loyers
export const LOYER_PERIODICITE = [
  'mensuel',
  'trimestriel',
  'annuel'
];

// Mois de l'année
export const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

// Jours de la semaine
export const DAYS_OF_WEEK = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche'
];

// Image placeholder par défaut (SVG inline encodé en data URI)
export const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <rect x="120" y="100" width="160" height="120" rx="8" fill="#d1d5db"/>
  <circle cx="165" cy="140" r="15" fill="#9ca3af"/>
  <polygon points="140,220 200,160 260,220" fill="#9ca3af"/>
  <polygon points="200,220 240,180 280,220" fill="#b0b5bc"/>
  <text x="200" y="280" text-anchor="middle" fill="#6b7280" font-family="system-ui,sans-serif" font-size="16" font-weight="500">Pas d'image</text>
</svg>`)}`;

