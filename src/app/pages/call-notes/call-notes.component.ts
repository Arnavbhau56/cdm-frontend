import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { CallNotesEditorComponent } from './components/call-notes-editor.component';
import { DeckNotesComponent } from './components/deck-notes.component';
import { DeckMaterialsComponent } from './components/deck-materials.component';
import { DeckService, DeckDetail } from '../../core/deck.service';

type Tab = 'callnotes' | 'notes' | 'materials';

@Component({
  selector: 'app-call-notes',
  standalone: true,
  imports: [NgIf, RouterLink, NavbarComponent, LoaderComponent, CallNotesEditorComponent, DeckNotesComponent, DeckMaterialsComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.1rem;font-weight:700;letter-spacing:.04em;">{{ deck.startup_name }}</h1>
            <span *ngIf="deck.sector"
              style="display:inline-block;margin-top:6px;font-size:.7rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid #4f8ef7;border-radius:4px;padding:2px 7px;color:#4f8ef7;">
              {{ deck.sector }}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
              style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
              ↓ Download Deck
            </a>
            <a [routerLink]="['/deck', deck.id]"
              style="font-size:.72rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
              View Deck Analysis
            </a>
          </div>
        </div>

        <!-- Top tab: Deck Analysis | Call Notes | Questions -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
          <a [routerLink]="['/deck', deck.id]"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Deck Analysis
          </a>
          <span style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">
            Call Notes
          </span>
          <a [routerLink]="['/deck', deck.id, 'questions']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Questions
          </a>
          <a [routerLink]="['/deck', deck.id, 'intelligence']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);">
            Intelligence
          </a>
        </div>

        <!-- Sub-tabs -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:24px;">
          <button (click)="tab='callnotes'"
            [style.color]="tab==='callnotes' ? 'var(--accent)' : 'var(--text-muted)'"
            [style.background]="tab==='callnotes' ? 'var(--accent-dim)' : 'var(--surface)'"
            style="font-size:.75rem;font-weight:600;padding:7px 16px;border:none;border-right:1px solid var(--border);cursor:pointer;">
            Call Notes
          </button>
          <button (click)="tab='notes'"
            [style.color]="tab==='notes' ? 'var(--accent)' : 'var(--text-muted)'"
            [style.background]="tab==='notes' ? 'var(--accent-dim)' : 'var(--surface)'"
            style="font-size:.75rem;font-weight:600;padding:7px 16px;border:none;border-right:1px solid var(--border);cursor:pointer;">
            Notes
          </button>
          <button (click)="tab='materials'"
            [style.color]="tab==='materials' ? 'var(--accent)' : 'var(--text-muted)'"
            [style.background]="tab==='materials' ? 'var(--accent-dim)' : 'var(--surface)'"
            style="font-size:.75rem;font-weight:600;padding:7px 16px;border:none;cursor:pointer;">
            Files
          </button>
        </div>

        <app-call-notes-editor *ngIf="tab==='callnotes'" [deckId]="deck.id" [callNotes]="deck.call_notes" />
        <app-deck-notes        *ngIf="tab==='notes'"     [deckId]="deck.id" />
        <app-deck-materials    *ngIf="tab==='materials'" [deckId]="deck.id" />

      </div>

      <div *ngIf="!loading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>
  `,
})
export class CallNotesComponent implements OnInit {
  deck: DeckDetail | null = null;
  loading = true;
  tab: Tab = 'callnotes';

  constructor(private route: ActivatedRoute, private deckService: DeckService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => { this.deck = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
