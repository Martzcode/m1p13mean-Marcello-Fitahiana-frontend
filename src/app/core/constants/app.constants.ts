// Base URLs et configuration
export const API_CONFIG = {
  // En production Docker, utiliser le nom du service
  // En dev local, utiliser localhost:3000
  BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'http://localhost:3000',
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

