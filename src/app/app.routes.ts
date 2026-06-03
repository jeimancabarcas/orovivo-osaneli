import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { OrderLandingComponent } from './components/order-landing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'order', component: OrderLandingComponent },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/backoffice.component').then(m => m.BackofficeComponent) 
  },
  { path: '**', redirectTo: '' }
];
