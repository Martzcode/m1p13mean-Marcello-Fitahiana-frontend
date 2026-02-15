export interface CentreCommercial {
  _id?: string;
  nom: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  horaires?: {
    lundi?: { ouverture?: string; fermeture?: string };
    mardi?: { ouverture?: string; fermeture?: string };
    mercredi?: { ouverture?: string; fermeture?: string };
    jeudi?: { ouverture?: string; fermeture?: string };
    vendredi?: { ouverture?: string; fermeture?: string };
    samedi?: { ouverture?: string; fermeture?: string };
    dimanche?: { ouverture?: string; fermeture?: string };
  };
  description?: string;
  email?: string;
  telephone?: string;
  createdAt?: Date;
}

