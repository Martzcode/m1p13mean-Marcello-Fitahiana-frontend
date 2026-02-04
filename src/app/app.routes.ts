import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main/main.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },
            // Future features can be added here
            // {
            //   path: 'dashboard',
            //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            // }
        ]
    },
    { path: '**', redirectTo: '' }
];
