// Login page: email/password form that authenticates via JWT and redirects to /dashboard.

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 class="text-xl font-semibold text-gray-900 mb-1">CDM Capital</h1>
        <p class="text-sm text-gray-500 mb-6">Deck Analyzer — Sign in to continue</p>

        <form (ngSubmit)="submit()" #f="ngForm">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              [(ngModel)]="username" name="username" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" [(ngModel)]="password" name="password" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p *ngIf="error" class="text-red-600 text-sm mb-4">{{ error }}</p>

          <button
            type="submit" [disabled]="loading"
            class="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn()) router.navigate(['/dashboard']);
  }

  submit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Invalid credentials. Please try again.';
        this.loading = false;
      },
    });
  }
}
