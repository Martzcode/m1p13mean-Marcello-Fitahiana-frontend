import { Zone } from './zone.model';
import { User } from './user.model';

export interface Boutique {
  _id?: string;
  numero: string;
  nom: string;
  categorie: 'Mode' | 'Alimentation' | 'Électronique' | 'Cosmétique' | 'Sport' | 'Librairie' | 'Restauration' | 'Services' | 'Autre';
  surface: number;
  zone: string | Zone;
  statut: 'libre' | 'occupée';
  commercant?: string | User;
  description?: string;
  telephone?: string;
  email?: string;
  horaires?: {
    [jour: string]: { ouverture: string; fermeture: string };
  };
  images?: string[];
  actif?: boolean;
  createdAt?: Date;
}

