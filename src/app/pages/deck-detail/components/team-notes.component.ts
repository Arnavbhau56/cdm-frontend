// Team notes component: add, view, and delete team comments on a deck.

import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeckService, Comment } from '../../../core/deck.service';

@Component({
  selector: 'app-team-notes',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  template: `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;">
      <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:16px;">Team Notes</span>

      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        <p *ngIf="comments.length === 0" style="font-size:.82rem;color:var(--text-muted);">No notes yet.</p>
        <div *ngFor="let c of comments"
          style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:.85rem;color:var(--text);">{{ c.body }}</p>
            <p style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">
              {{ c.author_name }} · {{ c.created_at | date:'dd MMM yyyy, h:mm a' }}
            </p>
          </div>
          <button (click)="delete(c.id)"
            style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:2px 5px;border-radius:4px;line-height:1;flex-shrink:0;">×</button>
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <textarea [(ngModel)]="newNote" placeholder="Add a note for the team…" rows="2"
          style="flex:1;resize:none;"></textarea>
        <button (click)="add()" [disabled]="!newNote.trim() || saving"
          style="align-self:flex-end;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:9px 14px;cursor:pointer;white-space:nowrap;"
          [style.opacity]="!newNote.trim() || saving ? '0.4' : '1'">
          {{ saving ? '…' : '+ Add Note' }}
        </button>
      </div>
    </div>
  `,
})
export class TeamNotesComponent implements OnInit {
  @Input() deckId = '';

  comments: Comment[] = [];
  newNote = '';
  saving = false;

  constructor(private deckService: DeckService) {}

  ngOnInit() {
    this.deckService.getComments(this.deckId).subscribe({ next: c => (this.comments = c) });
  }

  add() {
    if (!this.newNote.trim()) return;
    this.saving = true;
    this.deckService.addComment(this.deckId, this.newNote.trim()).subscribe({
      next: c => { this.comments = [...this.comments, c]; this.newNote = ''; this.saving = false; },
      error: () => (this.saving = false),
    });
  }

  delete(id: string) {
    this.deckService.deleteComment(this.deckId, id).subscribe({
      next: () => (this.comments = this.comments.filter(c => c.id !== id)),
    });
  }
}
