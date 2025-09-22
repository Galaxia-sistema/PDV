import { Routes } from '@angular/router';
import { Graphics } from './components/graphics/graphics';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/graphics/graphics').then(m => m.Graphics)
  },  
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
