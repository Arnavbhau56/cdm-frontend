import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DeckService, Prompt } from '../../core/deck.service';

@Component({
  selector: 'app-prompts',
  standalone: true,
  imports: [NavbarComponent, FormsModule, NgFor, NgIf],
  template: `
    <app-navbar />
    <div style="max-width:860px;margin:40px auto;padding:0 24px;">
      <h1 style="font-size:1.25rem;font-weight:600;color:var(--text);margin-bottom:28px;">Prompts</h1>

      <div *ngIf="loading" style="color:var(--text-muted);font-size:.875rem;">Loading…</div>

      <div *ngFor="let p of prompts" style="margin-bottom:32px;border:1px solid var(--border);border-radius:var(--radius);padding:20px;background:var(--surface);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-weight:600;font-size:.9rem;color:var(--text);">{{ p.title }}</span>
          <div style="display:flex;gap:8px;">
            <button *ngIf="editing[p.id]" (click)="save(p)"
              style="background:var(--accent);color:#fff;border:none;border-radius:var(--radius);padding:5px 14px;font-size:.78rem;cursor:pointer;font-family:var(--font-body);">
              {{ saving[p.id] ? 'Saving…' : 'Save' }}
            </button>
            <button *ngIf="editing[p.id]" (click)="cancel(p)"
              style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);padding:5px 12px;font-size:.78rem;cursor:pointer;font-family:var(--font-body);">
              Cancel
            </button>
            <button *ngIf="!editing[p.id]" (click)="edit(p)"
              style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);padding:5px 12px;font-size:.78rem;cursor:pointer;font-family:var(--font-body);">
              Edit
            </button>
          </div>
        </div>
        <textarea *ngIf="editing[p.id]" [(ngModel)]="drafts[p.id]" rows="18"
          style="width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:.8rem;font-family:monospace;padding:12px;resize:vertical;line-height:1.5;">
        </textarea>
        <pre *ngIf="!editing[p.id]"
          style="margin:0;white-space:pre-wrap;word-break:break-word;font-size:.78rem;color:var(--text-muted);font-family:monospace;line-height:1.5;max-height:220px;overflow:auto;">{{ p.body }}</pre>
        <div *ngIf="saved[p.id]" style="margin-top:8px;font-size:.75rem;color:#4ade80;">Saved.</div>
      </div>
    </div>
  `,
})
export class PromptsComponent implements OnInit {
  prompts: Prompt[] = [];
  loading = true;
  editing: Record<number, boolean> = {};
  saving: Record<number, boolean> = {};
  saved: Record<number, boolean> = {};
  drafts: Record<number, string> = {};

  constructor(private deck: DeckService) {}

  ngOnInit() {
    this.deck.getPrompts().subscribe({
      next: (ps) => { this.prompts = ps; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  edit(p: Prompt) {
    this.drafts[p.id] = p.body;
    this.editing[p.id] = true;
    this.saved[p.id] = false;
  }

  cancel(p: Prompt) {
    this.editing[p.id] = false;
  }

  save(p: Prompt) {
    this.saving[p.id] = true;
    this.deck.updatePrompt(p.id, this.drafts[p.id]).subscribe({
      next: (updated) => {
        p.body = updated.body;
        this.editing[p.id] = false;
        this.saving[p.id] = false;
        this.saved[p.id] = true;
        setTimeout(() => this.saved[p.id] = false, 3000);
      },
      error: () => { this.saving[p.id] = false; },
    });
  }
}
