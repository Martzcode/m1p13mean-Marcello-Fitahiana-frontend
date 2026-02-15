import { Loyer } from './loyer.model';
import { User } from './user.model';

export interface Paiement {
  _id?: string;
  loyer: string | Loyer;
  commercant: string | User;
  montant: number;
  mois: number;
  annee: number;
  datePaiement?: Date;
  methodePaiement: 'espèces' | 'carte' | 'virement' | 'chèque';
  statut: 'payé' | 'impayé' | 'partiel';
  reference?: string;
  createdAt?: Date;
}

