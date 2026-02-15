export interface Employe {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: 'Agent de sécurité' | 'Agent d\'entretien' | 'Réceptionniste' | 'Gestionnaire' | 'Technicien' | 'Autre';
  salaire: number;
  dateEmbauche: Date;
  actif?: boolean;
  createdAt?: Date;
}

export interface SalairePaiement {
  _id?: string;
  employe: string | Employe;
  montant: number;
  mois: number;
  annee: number;
  datePaiement?: Date;
  methodePaiement: 'espèces' | 'virement' | 'chèque';
  statut: 'payé' | 'impayé';
  createdAt?: Date;
}

