export interface DashboardStats {
  boutiques: {
    total: number;
    actives: number;
    occupees: number;
    libres: number;
  };
  loyers: {
    totalMois: number;
    payesMois: number;
    impayesMois: number;
    loyersImpayes: any[];
    nombreImpayes: number;
  };
  users: {
    clients: number;
    commercants: number;
  };
  chiffreAffaires: {
    annuel: number;
    evolutionMensuelle: Array<{ mois: number; montant: number }>;
  };
}

