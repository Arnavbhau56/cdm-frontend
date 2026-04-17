// Public founder response page — no login required.
// Founder opens this via a unique token link and answers questions directly.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeckService, FounderQuestion } from '../../core/deck.service';

@Component({
  selector: 'app-founder-respond',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div style="min-height:100vh;background:var(--bg);display:flex;flex-direction:column;align-items:center;padding:40px 20px 80px;">

      <!-- Brand -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:40px;">
        <span style="color:var(--accent);font-size:1.4rem;">◈</span>
        <span style="font-size:.95rem;font-weight:700;letter-spacing:.04em;">CDM Capital</span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--text-muted);">
        <div style="width:28px;height:28px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;"></div>
        <p style="font-size:.85rem;">Loading questions…</p>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && error"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;max-width:480px;width:100%;text-align:center;">
        <p style="font-size:1.5rem;margin-bottom:8px;">🔗</p>
        <p style="font-size:.95rem;font-weight:600;color:var(--text);">Invalid or expired link</p>
        <p style="font-size:.82rem;color:var(--text-muted);margin-top:6px;">Please contact CDM Capital for a new link.</p>
      </div>

      <!-- Success -->
      <div *ngIf="submitted"
        style="background:var(--surface);border:1px solid rgba(61,202,126,.3);border-radius:var(--radius);padding:32px;max-width:480px;width:100%;text-align:center;">
        <p style="font-size:1.5rem;margin-bottom:8px;">✅</p>
        <p style="font-size:.95rem;font-weight:600;color:#3dca7e;">Answers submitted!</p>
        <p style="font-size:.82rem;color:var(--text-muted);margin-top:6px;">Thank you. The CDM Capital team will review your responses.</p>
      </div>

      <!-- Questions form -->
      <div *ngIf="!loading && !error && !submitted" style="max-width:680px;width:100%;">
        <h1 style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">{{ startupName }}</h1>
        <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:28px;">
          Please answer the questions below from CDM Capital. You can answer all or just the ones you're comfortable with.
        </p>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <div *ngFor="let q of questions; let i = index"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;">
            <p style="font-size:.88rem;font-weight:500;color:var(--text);margin-bottom:10px;line-height:1.6;">
              {{ i + 1 }}. {{ q.question }}
            </p>
            <textarea
              [(ngModel)]="q.answer"
              placeholder="Your answer…"
              rows="3"
              style="resize:vertical;font-size:.85rem;">
            </textarea>
          </div>
        </div>

        <p *ngIf="saveError" style="font-size:.78rem;color:#e05252;margin-top:12px;">{{ saveError }}</p>

        <button (click)="submit()" [disabled]="saving"
          style="margin-top:20px;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.85rem;font-weight:700;padding:11px 28px;cursor:pointer;transition:opacity .15s;"
          [style.opacity]="saving ? '0.5' : '1'">
          {{ saving ? 'Submitting…' : 'Submit Answers' }}
        </button>
      </div>

    </div>
  `,
})
export class FounderRespondComponent implements OnInit {
  token = '';
  startupName = '';
  questions: FounderQuestion[] = [];
  loading = true;
  error = false;
  submitted = false;
  saving = false;
  saveError = '';

  constructor(private route: ActivatedRoute, private deckService: DeckService) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.deckService.getFounderRespond(this.token).subscribe({
      next: res => {
        this.startupName = res.startup_name;
        this.questions = res.founder_questions.map(q => ({ ...q }));
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  submit() {
    this.saving = true;
    this.saveError = '';
    this.deckService.postFounderAnswers(this.token, this.questions).subscribe({
      next: () => { this.submitted = true; this.saving = false; },
      error: () => { this.saveError = 'Failed to submit. Please try again.'; this.saving = false; },
    });
  }
}
