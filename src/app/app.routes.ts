import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main/main.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Public routes (sans layout)
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },

    // Protected routes with layout
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },

            // Admin routes
            {
                path: 'admin',
                canActivate: [adminGuard],
                children: [
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
                    },
                    {
                        path: 'zones',
                        loadComponent: () => import('./features/admin/zones-list/zones-list.component').then(m => m.ZonesListComponent)
                    },
                    {
                        path: 'boutiques',
                        loadComponent: () => import('./features/admin/boutiques-list/boutiques-list.component').then(m => m.BoutiquesListComponent)
                    },
                    {
                        path: 'loyers',
                        loadComponent: () => import('./features/admin/loyers/loyers.component').then(m => m.LoyersComponent)
                    },
                    {
                        path: 'paiements',
                        loadComponent: () => import('./features/admin/paiements/paiements.component').then(m => m.PaiementsComponent)
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('./features/admin/users/users-list.component').then(m => m.UsersListComponent)
                    },
                    {
                        path: 'employes',
                        loadComponent: () => import('./features/admin/employes/employes-list.component').then(m => m.EmployesListComponent)
                    },
                    {
                        path: 'centre',
                        loadComponent: () => import('./features/admin/centre-config/centre-config.component').then(m => m.CentreConfigComponent)
                    },
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    }
                ]
            },

            // Merchant routes
            {
                path: 'merchant',
                children: [
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./features/merchant/dashboard/merchant-dashboard.component').then(m => m.MerchantDashboardComponent)
                    },
                    {
                        path: 'boutiques',
                        loadComponent: () => import('./features/merchant/boutique/merchant-boutique.component').then(m => m.MerchantBoutiqueComponent)
                    },
                    {
                        path: 'produits',
                        loadComponent: () => import('./features/merchant/produits/merchant-produits.component').then(m => m.MerchantProduitsComponent)
                    },
                    {
                        path: 'commandes',
                        loadComponent: () => import('./features/merchant/commandes/merchant-commandes.component').then(m => m.MerchantCommandesComponent)
                    },
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    }
                ]
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
