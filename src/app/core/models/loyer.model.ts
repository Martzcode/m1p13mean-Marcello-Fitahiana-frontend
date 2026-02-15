import { Boutique } from './boutique.model';
import { User } from './user.model';

export interface Loyer {
  _id?: string;
  boutique: string | Boutique;
  commercant: string | User;
  montant: number;
  periodicite: 'mensuel' | 'trimestriel' | 'annuel';
  dateDebut: Date;
  dateFin?: Date;
  statut: 'actif' | 'expiré' | 'résilié';
  createdAt?: Date;
}

