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
        <div style="display:flex;align-items:center;gap:20px;">
          <img src="assets/logo.png" alt="CDM Capital" style="height:36px;object-fit:contain;" />
          <a routerLink="/dashboard"
            style="color:var(--text);font-size:.85rem;font-family:var(--font-body);text-decoration:none;padding:5px 10px;border-radius:var(--radius);transition:background .15s;"
            onmouseover="this.style.background='var(--accent-dim)'"
            onmouseout="this.style.background='transparent'">
            Home
          </a>
          <a routerLink="/prompts"
            style="color:var(--text);font-size:.85rem;font-family:var(--font-body);text-decoration:none;padding:5px 10px;border-radius:var(--radius);transition:background .15s;"
            onmouseover="this.style.background='var(--accent-dim)'"
            onmouseout="this.style.background='transparent'">
            Prompts
          </a>
        </div>
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
