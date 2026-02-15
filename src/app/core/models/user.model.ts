export interface User {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: 'administrateur' | 'commerçant' | 'client';
  photo?: string;
  telephone?: string;
  adresse?: string;
  boutiques?: string[];
  actif?: boolean;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    photo: string;
  };
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
  telephone?: string;
  adresse?: string;
}
