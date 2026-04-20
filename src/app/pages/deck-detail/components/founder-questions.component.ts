// Founder questions accordion: view, edit, add, delete questions and record answers.
// Emits (questionsChanged) when the list is saved so the parent can refresh.

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeckService, FounderQuestion } from '../../../core/deck.service';

@Component({
  selector: 'app-founder-questions',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div style="display:flex;flex-direction:column;gap:8px;">

      <div *ngFor="let q of questions; let i = index"
        style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">

        <!-- Row -->
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;"
          (click)="toggle(i)">

          <span *ngIf="q.answer.trim()" title="Answered"
            style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(61,202,126,.15);border:1px solid rgba(61,202,126,.4);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#3dca7e;">✓</span>
          <span *ngIf="!q.answer.trim()" title="Not answered"
            style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(240,192,64,.1);border:1px solid rgba(240,192,64,.3);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--accent);">?</span>

          <div style="flex:1;min-width:0;">
            <span *ngIf="editingIndex !== i" style="font-size:.88rem;color:var(--text);line-height:1.6;">
              {{ i + 1 }}. {{ q.question }}
            </span>
            <input *ngIf="editingIndex === i" [(ngModel)]="q.question"
              style="font-size:.85rem;padding:6px 10px;" (click)="$event.stopPropagation()" />
          </div>

          <span *ngIf="isEmailed(i)"
            style="flex-shrink:0;font-size:.65rem;font-weight:600;color:#3dca7e;background:rgba(61,202,126,.1);border:1px solid rgba(61,202,126,.3);border-radius:4px;padding:2px 6px;">
            ✓ Emailed
          </span>

          <div style="display:flex;gap:6px;flex-shrink:0;" (click)="$event.stopPropagation()">
            <button *ngIf="editingIndex !== i" (click)="editingIndex = i"
              style="background:none;border:none;color:var(--text-muted);font-size:.8rem;cursor:pointer;padding:2px 5px;border-radius:4px;">✎</button>
            <button *ngIf="editingIndex === i" (click)="save(); editingIndex = -1"
              style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.75rem;padding:2px 8px;cursor:pointer;">✓</button>
            <button (click)="remove(i)"
              style="background:none;border:none;color:var(--text-muted);font-size:.9rem;cursor:pointer;padding:2px 5px;border-radius:4px;">×</button>
          </div>

          <span style="color:var(--text-muted);font-size:.75rem;flex-shrink:0;">
            {{ open.has(i) ? '▲' : '▼' }}
          </span>
        </div>

        <!-- Answer panel -->
        <div *ngIf="open.has(i)" style="border-top:1px solid var(--border);padding:12px 14px;background:var(--bg);">
          <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Answer</p>
          <textarea [id]="'answer-' + i" [(ngModel)]="q.answer" placeholder="Write the answer here…"
            rows="3" style="resize:vertical;font-size:.85rem;margin-bottom:8px;"></textarea>
          <button (click)="saveAnswer(i)"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">
            Save
          </button>
        </div>
      </div>

      <!-- Add question -->
      <div *ngIf="adding"
        style="background:var(--surface-2);border:1px solid var(--accent);border-radius:var(--radius);padding:12px 14px;display:flex;flex-direction:column;gap:8px;">
        <input [(ngModel)]="newText" placeholder="Enter new question…" style="font-size:.85rem;" />
        <div style="display:flex;gap:8px;">
          <button (click)="confirmAdd()"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:6px 14px;cursor:pointer;">Add</button>
          <button (click)="adding = false; newText = ''"
            style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:6px 14px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;align-items:center;">
      <button (click)="adding = true"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;">
        + Add Question
      </button>
      <button (click)="emailModal.emit()"
        style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:7px 16px;cursor:pointer;">
        Email to Founder
      </button>
      <button (click)="autoAnswer()" [disabled]="autoAnswering"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;display:flex;align-items:center;gap:6px;"
        [style.opacity]="autoAnswering ? '0.5' : '1'">
        <span>{{ autoAnswering ? 'Finding answers…' : '✦ Try to find answers' }}</span>
      </button>
    </div>
  `,
})
export class FounderQuestionsComponent {
  @Input() deckId = '';
  @Input() questions: FounderQuestion[] = [];
  @Input() emailedIndices: number[] = [];
  @Output() questionsChanged = new EventEmitter<FounderQuestion[]>();
  @Output() emailModal = new EventEmitter<void>();

  open = new Set<number>();
  editingIndex = -1;
  adding = false;
  newText = '';
  autoAnswering = false;

  constructor(private deckService: DeckService) {}

  isEmailed(i: number) { return this.emailedIndices.includes(i); }

  toggle(i: number) {
    if (this.open.has(i)) this.open.delete(i); else this.open.add(i);
    this.open = new Set(this.open);
  }

  save() {
    this.deckService.saveQuestions(this.deckId, this.questions).subscribe({
      next: res => this.questionsChanged.emit(res.founder_questions),
    });
  }

  saveAnswer(index: number) {
    if (!this.questions[index]?.answer.trim()) return;
    this.deckService.saveQuestions(this.deckId, this.questions).subscribe({
      next: res => {
        this.questionsChanged.emit(res.founder_questions);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Answer saved', showConfirmButton: false, timer: 2000, timerProgressBar: true, background: '#16181c', color: '#3dca7e' });
      },
    });
  }

  remove(i: number) {
    this.questions.splice(i, 1);
    this.questions = [...this.questions];
    this.open.delete(i);
    this.save();
  }

  confirmAdd() {
    if (!this.newText.trim()) return;
    this.questions = [...this.questions, { question: this.newText.trim(), answer: '' }];
    this.newText = '';
    this.adding = false;
    this.save();
  }

  autoAnswer() {
    this.autoAnswering = true;
    this.deckService.autoAnswerQuestions(this.deckId).subscribe({
      next: res => {
        this.autoAnswering = false;
        this.questions = res.founder_questions.map(q => ({ ...q }));
        this.questionsChanged.emit(this.questions);
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: res.updated > 0 ? `${res.updated} answer${res.updated === 1 ? '' : 's'} found` : 'No answers found in context',
          showConfirmButton: false, timer: 3000, timerProgressBar: true,
          background: '#16181c', color: res.updated > 0 ? '#3dca7e' : '#f0c040',
        });
      },
      error: () => {
        this.autoAnswering = false;
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to find answers', showConfirmButton: false, timer: 3000, background: '#16181c', color: '#e05252' });
      },
    });
  }
}
