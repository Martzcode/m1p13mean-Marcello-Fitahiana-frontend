import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main/main.component';

export const routes: Routes = [
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
