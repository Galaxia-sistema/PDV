import { Routes } from '@angular/router';
import { Graphics } from './components/graphics/graphics';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./components/graphics/graphics').then(m => m.Graphics)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/graphics/graphics').then(m => m.Graphics)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
