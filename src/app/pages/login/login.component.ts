// Login page: dark auth card matching PathCredit Logger design.

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
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;width:100%;max-width:380px;display:flex;flex-direction:column;gap:20px;">

        <div style="display:flex;align-items:center;gap:10px;">
          <span style="color:var(--accent);font-size:1.4rem;">◈</span>
          <div>
            <div style="font-family:var(--font-body);font-size:.95rem;font-weight:700;letter-spacing:.04em;">CDM Capital</div>
            <div style="font-size:.75rem;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase;">Deck Analyzer</div>
          </div>
        </div>

        <form (ngSubmit)="submit()" #f="ngForm" style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Username</label>
            <input [(ngModel)]="username" name="username" required autocomplete="username" />
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
          </div>

          <p *ngIf="error" style="font-size:.78rem;color:#e05252;">{{ error }}</p>

          <button type="submit" [disabled]="loading"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-family:var(--font-body);font-size:.82rem;font-weight:700;letter-spacing:.04em;padding:11px 18px;cursor:pointer;opacity:1;transition:opacity .15s;"
            [style.opacity]="loading ? '0.5' : '1'">
            {{ loading ? 'Signing in…' : 'Sign In' }}
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
