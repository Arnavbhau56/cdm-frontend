// App routes: defines all SPA routes with auth guard on protected pages.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'deck/:id',
    loadComponent: () => import('./pages/deck-detail/deck-detail.component').then(m => m.DeckDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'deck/:id/call-notes',
    loadComponent: () => import('./pages/call-notes/call-notes.component').then(m => m.CallNotesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'deck/:id/questions',
    loadComponent: () => import('./pages/questions/questions-page.component').then(m => m.QuestionsPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'deck/:id/intelligence',
    loadComponent: () => import('./pages/intelligence/intelligence-page.component').then(m => m.IntelligencePageComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
