import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { CallNotesEditorComponent } from './components/call-notes-editor.component';
import { DeckNotesComponent } from './components/deck-notes.component';
import { DeckMaterialsComponent } from './components/deck-materials.component';
import { DeckHeaderComponent } from '../deck-detail/components/deck-header.component';
import { DeckService, DeckDetail } from '../../core/deck.service';

type Tab = 'callnotes' | 'notes' | 'materials';

@Component({
  selector: 'app-call-notes',
  standalone: true,
  imports: [NgIf, RouterLink, NavbarComponent, LoaderComponent, CallNotesEditorComponent, DeckNotesComponent, DeckMaterialsComponent, DeckHeaderComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <app-deck-header [deck]="deck" active="call-notes" (deckChanged)="deck = $event" />

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

        <app-call-notes-editor *ngIf="tab==='callnotes'" [deckId]="deck.id" [callNotes]="deck.call_notes" [deckCreatedAt]="deck.created_at" [callNotesUpdatedAt]="deck.call_notes_updated_at" />
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
