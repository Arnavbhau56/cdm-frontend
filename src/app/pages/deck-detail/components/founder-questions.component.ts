// Founder questions accordion: view, edit, add, delete questions and record answers.
// Includes AI-powered "Suggest Questions" flow: user enters a prompt, GPT returns suggestions,
// each suggestion can be individually accepted or rejected before saving.

import { Component, Input, Output, EventEmitter } from '@angular/core';
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

      <!-- Manual add question -->
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

    <!-- ── Action bar ── -->
    <div *ngIf="!hideActions" style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;align-items:center;">
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
      <button (click)="openSuggest()"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;">
        ✦ Suggest Questions
      </button>
    </div>

    <!-- ── Suggest Questions panel ── -->
    <div *ngIf="suggestOpen"
      style="margin-top:20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px;">

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">AI Question Suggestions</span>
        <button (click)="closeSuggest()" style="background:none;border:none;color:var(--text-muted);font-size:1.1rem;cursor:pointer;line-height:1;">×</button>
      </div>

      <!-- Prompt input -->
      <div *ngIf="suggestions.length === 0 && !suggesting" style="display:flex;flex-direction:column;gap:10px;">
        <p style="font-size:.8rem;color:var(--text-muted);line-height:1.6;">
          Tell the model what angle to focus on — e.g. <em>"go deeper on GTM and channel strategy"</em>, <em>"probe the product moat"</em>, <em>"focus on unit economics and burn"</em>.
        </p>
        <textarea [(ngModel)]="suggestPrompt" rows="3" placeholder="e.g. Dig deeper into the product differentiation and why customers won't churn to a competitor…"
          style="resize:vertical;font-size:.85rem;"></textarea>
        <div style="display:flex;gap:8px;">
          <button (click)="runSuggest()" [disabled]="!suggestPrompt.trim()"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:8px 18px;cursor:pointer;"
            [style.opacity]="!suggestPrompt.trim() ? '0.4' : '1'">
            Generate
          </button>
          <button (click)="closeSuggest()"
            style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:8px 14px;cursor:pointer;">
            Cancel
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="suggesting"
        style="display:flex;align-items:center;gap:10px;padding:16px 0;color:var(--text-muted);font-size:.82rem;">
        <span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;"></span>
        Generating questions…
      </div>

      <!-- Suggestions list -->
      <div *ngIf="suggestions.length > 0 && !suggesting" style="display:flex;flex-direction:column;gap:0;">
        <p style="font-size:.72rem;color:var(--text-muted);margin-bottom:12px;">
          Accept or reject each suggestion. Accepted questions will be added to the list.
        </p>

        <div *ngFor="let s of suggestions; let si = index"
          [style.opacity]="s.decided ? '0.45' : '1'"
          style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);transition:opacity .2s;">

          <div style="flex:1;min-width:0;">
            <p style="font-size:.86rem;color:var(--text);line-height:1.65;">{{ si + 1 }}. {{ s.text }}</p>
          </div>

          <div *ngIf="!s.decided" style="display:flex;gap:6px;flex-shrink:0;margin-top:2px;">
            <button (click)="accept(si)"
              style="background:rgba(61,202,126,.12);border:1px solid rgba(61,202,126,.4);border-radius:4px;color:#3dca7e;font-size:.72rem;font-weight:700;padding:4px 10px;cursor:pointer;">
              ✓ Accept
            </button>
            <button (click)="reject(si)"
              style="background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.3);border-radius:4px;color:#e05252;font-size:.72rem;font-weight:700;padding:4px 10px;cursor:pointer;">
              ✗ Reject
            </button>
          </div>

          <span *ngIf="s.decided && s.accepted"
            style="flex-shrink:0;font-size:.68rem;font-weight:600;color:#3dca7e;margin-top:4px;">Added ✓</span>
          <span *ngIf="s.decided && !s.accepted"
            style="flex-shrink:0;font-size:.68rem;color:var(--text-muted);margin-top:4px;">Rejected</span>
        </div>

        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button (click)="acceptAll()"
            style="background:rgba(61,202,126,.12);border:1px solid rgba(61,202,126,.4);border-radius:var(--radius);color:#3dca7e;font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">
            Accept All
          </button>
          <button (click)="rejectAll()"
            style="background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.3);border-radius:var(--radius);color:#e05252;font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">
            Reject All
          </button>
          <button (click)="resetSuggest()"
            style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.72rem;padding:6px 14px;cursor:pointer;">
            Try Different Prompt
          </button>
          <button (click)="commitAccepted()" [disabled]="!hasAccepted()"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:6px 16px;cursor:pointer;margin-left:auto;"
            [style.opacity]="!hasAccepted() ? '0.4' : '1'">
            Save Accepted ({{ acceptedCount() }})
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class FounderQuestionsComponent {
  @Input() deckId = '';
  @Input() questions: FounderQuestion[] = [];
  @Input() emailedIndices: number[] = [];
  @Input() hideActions = false;
  @Output() questionsChanged = new EventEmitter<FounderQuestion[]>();
  @Output() emailModal = new EventEmitter<void>();

  open = new Set<number>();
  editingIndex = -1;
  adding = false;
  newText = '';
  autoAnswering = false;

  // Suggest flow state
  suggestOpen = false;
  suggestPrompt = '';
  suggesting = false;
  suggestions: { text: string; decided: boolean; accepted: boolean }[] = [];

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
        res.founder_questions.forEach((q, i) => { if (q.answer?.trim()) this.open.add(i); });
        this.open = new Set(this.open);
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: res.updated > 0
            ? `${res.updated} answer${res.updated === 1 ? '' : 's'} found from context`
            : 'No new answers found in available context',
          showConfirmButton: false, timer: 3500, timerProgressBar: true,
          background: '#16181c', color: res.updated > 0 ? '#3dca7e' : '#f0c040',
        });
      },
      error: () => {
        this.autoAnswering = false;
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to find answers', showConfirmButton: false, timer: 3000, background: '#16181c', color: '#e05252' });
      },
    });
  }

  // ── Suggest flow ──

  openSuggest() {
    this.suggestOpen = true;
    this.suggestPrompt = '';
    this.suggestions = [];
  }

  closeSuggest() {
    this.suggestOpen = false;
    this.suggestPrompt = '';
    this.suggestions = [];
  }

  resetSuggest() {
    this.suggestPrompt = '';
    this.suggestions = [];
  }

  runSuggest() {
    if (!this.suggestPrompt.trim()) return;
    this.suggesting = true;
    this.suggestions = [];
    this.deckService.suggestQuestions(this.deckId, this.suggestPrompt.trim()).subscribe({
      next: res => {
        this.suggesting = false;
        this.suggestions = res.suggestions.map(s => ({ text: s, decided: false, accepted: false }));
      },
      error: () => {
        this.suggesting = false;
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to generate suggestions', showConfirmButton: false, timer: 3000, background: '#16181c', color: '#e05252' });
      },
    });
  }

  accept(i: number) { this.suggestions[i] = { ...this.suggestions[i], decided: true, accepted: true }; }
  reject(i: number) { this.suggestions[i] = { ...this.suggestions[i], decided: true, accepted: false }; }
  acceptAll() { this.suggestions = this.suggestions.map(s => ({ ...s, decided: true, accepted: true })); }
  rejectAll() { this.suggestions = this.suggestions.map(s => ({ ...s, decided: true, accepted: false })); }

  hasAccepted() { return this.suggestions.some(s => s.accepted); }
  acceptedCount() { return this.suggestions.filter(s => s.accepted).length; }

  commitAccepted() {
    const toAdd = this.suggestions.filter(s => s.accepted).map(s => ({ question: s.text, answer: '' }));
    if (!toAdd.length) return;
    this.questions = [...this.questions, ...toAdd];
    this.deckService.saveQuestions(this.deckId, this.questions).subscribe({
      next: res => {
        this.questionsChanged.emit(res.founder_questions);
        this.closeSuggest();
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: `${toAdd.length} question${toAdd.length === 1 ? '' : 's'} added`,
          showConfirmButton: false, timer: 2500, timerProgressBar: true,
          background: '#16181c', color: '#3dca7e',
        });
      },
    });
  }
}
