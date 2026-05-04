// Navbar: dark header matching PathCredit Logger brand style.

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header style="border-bottom:1px solid var(--border);background:var(--surface);position:sticky;top:0;z-index:10;">
      <div style="max-width:95vw;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;">
        <a routerLink="/dashboard" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
          <span style="color:var(--accent);font-size:1.3rem;">◈</span>
          <span style="font-family:var(--font-body);font-size:.95rem;font-weight:700;letter-spacing:.04em;">CDM Capital</span>
          <span style="font-size:.75rem;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase;">Deck Analyzer</span>
        </a>
        <div style="display:flex;align-items:center;gap:12px;">
          <button (click)="auth.logout()"
            style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:5px 10px;cursor:pointer;font-family:var(--font-body);transition:color .15s,border-color .15s;"
            onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--text-muted)'"
            onmouseout="this.style.color='var(--text-muted)';this.style.borderColor='var(--border)'">
            Sign out
          </button>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
