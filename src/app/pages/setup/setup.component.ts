// Setup page: dark theme form matching PathCredit Logger design.

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DeckService, FirmPreferences } from '../../core/deck.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule, NgIf, NavbarComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <div style="max-width:640px;margin:0 auto;padding:36px 24px 64px;">

        <h1 style="font-family:var(--font-body);font-size:1rem;font-weight:700;letter-spacing:.04em;margin-bottom:24px;">FIRM PREFERENCES</h1>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;display:flex;flex-direction:column;gap:18px;">

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Sectors Focus</label>
            <input [(ngModel)]="prefs.sectors_focus" placeholder="e.g. Fintech, SaaS, Deeptech" />
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Stage Focus</label>
            <input [(ngModel)]="prefs.stage_focus" placeholder="e.g. Pre-seed, Seed" />
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Question Style</label>
            <textarea [(ngModel)]="prefs.question_style" rows="3" placeholder="e.g. Direct, first-principles, focus on defensibility"
              style="resize:none;"></textarea>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:.78rem;font-weight:500;color:var(--text-muted);letter-spacing:.04em;">Additional Context</label>
            <textarea [(ngModel)]="prefs.additional_context" rows="3" placeholder="Any other context for the AI analyst…"
              style="resize:none;"></textarea>
          </div>

          <p *ngIf="saved" style="font-size:.78rem;color:#3dca7e;">✓ Preferences saved.</p>
          <p *ngIf="saveError" style="font-size:.78rem;color:#e05252;">{{ saveError }}</p>

          <button (click)="save()" [disabled]="saving"
            style="align-self:flex-start;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-family:var(--font-body);font-size:.78rem;font-weight:700;letter-spacing:.04em;padding:9px 20px;cursor:pointer;transition:opacity .15s;"
            [style.opacity]="saving ? '0.5' : '1'">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SetupComponent implements OnInit {
  prefs: FirmPreferences = { sectors_focus: '', stage_focus: '', question_style: '', additional_context: '' };
  saving = false;
  saved = false;
  saveError = '';

  constructor(private deckService: DeckService) {}

  ngOnInit() { this.deckService.getPreferences().subscribe({ next: p => (this.prefs = p) }); }

  save() {
    this.saving = true;
    this.saved = false;
    this.saveError = '';
    this.deckService.savePreferences(this.prefs).subscribe({
      next: () => { this.saved = true; this.saving = false; setTimeout(() => (this.saved = false), 3000); },
      error: err => { this.saveError = err.error?.error || 'Failed to save.'; this.saving = false; },
    });
  }
}
