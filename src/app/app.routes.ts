import { Routes } from '@angular/router';
import { Graphics } from './components/graphics/graphics';
import { MapComponent } from './components/map/map';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/graphics/graphics').then(m => m.Graphics)
  },  
  {
    path: 'map',
    loadComponent: () => import('./components/map/map').then(m => m.MapComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
