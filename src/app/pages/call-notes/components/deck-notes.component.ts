import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeckService, DeckNote } from '../../../core/deck.service';
import { InsightRefreshService } from '../../../core/insight-refresh.service';

const KIND_LABELS: Record<string, string> = {
  general: 'General Note',
  mis: 'MIS / Financials',
  whatsapp: 'WhatsApp / Chat',
  call: 'Call Note',
};

const KIND_COLORS: Record<string, string> = {
  general:  'color:var(--text-muted);border-color:var(--border);background:var(--surface-2)',
  mis:      'color:#4f8ef7;border-color:rgba(79,142,247,.35);background:rgba(79,142,247,.08)',
  whatsapp: 'color:#3dca7e;border-color:rgba(61,202,126,.35);background:rgba(61,202,126,.08)',
  call:     'color:#f0c040;border-color:rgba(240,192,64,.35);background:rgba(240,192,64,.08)',
};

@Component({
  selector: 'app-deck-notes',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  template: `
    <!-- Add note form -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:20px;">
      <p style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:12px;">Add Note</p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <button *ngFor="let k of kinds" (click)="selectedKind = k"
          [style]="k === selectedKind ? 'border:1px solid var(--accent);color:var(--accent);background:var(--accent-dim)' : 'border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2)'"
          style="font-size:.72rem;font-weight:600;border-radius:4px;padding:4px 12px;cursor:pointer;">
          {{ kindLabel(k) }}
        </button>
      </div>

      <input [(ngModel)]="newTitle" placeholder="Title (optional)" style="margin-bottom:8px;font-size:.82rem;" />
      <textarea [(ngModel)]="newBody" rows="4" placeholder="Paste WhatsApp chat, MIS numbers, call notes, or any text…" style="resize:vertical;font-size:.85rem;margin-bottom:10px;"></textarea>

      <button (click)="addNote()" [disabled]="!newBody.trim() || saving"
        style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:7px 18px;cursor:pointer;"
        [style.opacity]="!newBody.trim() || saving ? '0.4' : '1'">
        {{ saving ? 'Saving…' : '+ Save Note' }}
      </button>
    </div>

    <!-- Notes list -->
    <div style="display:flex;flex-direction:column;gap:10px;">
      <p *ngIf="notes.length === 0" style="font-size:.82rem;color:var(--text-muted);padding:20px 0;">No notes yet.</p>

      <div *ngFor="let n of notes" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span [style]="kindColor(n.kind)" style="font-size:.65rem;font-weight:700;border:1px solid;border-radius:4px;padding:2px 8px;">{{ kindLabel(n.kind) }}</span>
            <span *ngIf="n.title" style="font-size:.82rem;font-weight:600;color:var(--text);">{{ n.title }}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <span style="font-size:.68rem;color:var(--text-muted);">{{ n.created_at | date:'dd MMM, h:mm a' }}</span>
            <button (click)="deleteNote(n.id)" style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:0 2px;line-height:1;">×</button>
          </div>
        </div>
        <pre style="font-size:.82rem;color:var(--text);line-height:1.65;white-space:pre-wrap;word-break:break-word;margin:0;font-family:var(--font-body);">{{ n.body }}</pre>
      </div>
    </div>
  `,
})
export class DeckNotesComponent implements OnInit {
  @Input() deckId = '';

  notes: DeckNote[] = [];
  kinds = ['general', 'mis', 'whatsapp', 'call'];
  selectedKind = 'general';
  newTitle = '';
  newBody = '';
  saving = false;

  constructor(private deckService: DeckService, private insightRefresh: InsightRefreshService) {}

  ngOnInit() {
    this.deckService.getNotes(this.deckId).subscribe({ next: n => (this.notes = n) });
  }

  kindLabel(k: string) { return KIND_LABELS[k] ?? k; }
  kindColor(k: string) { return KIND_COLORS[k] ?? KIND_COLORS['general']; }

  addNote() {
    if (!this.newBody.trim()) return;
    this.saving = true;
    this.deckService.addNote(this.deckId, this.selectedKind, this.newTitle.trim(), this.newBody.trim()).subscribe({
      next: n => {
        this.notes = [n, ...this.notes];
        this.newTitle = ''; this.newBody = ''; this.saving = false;
        this.insightRefresh.trigger(this.deckId);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Note saved', showConfirmButton: false, timer: 1500, background: '#16181c', color: '#3dca7e' });
      },
      error: () => { this.saving = false; },
    });
  }

  deleteNote(id: string) {
    this.deckService.deleteNote(this.deckId, id).subscribe({
      next: () => { this.notes = this.notes.filter(n => n.id !== id); },
    });
  }
}
