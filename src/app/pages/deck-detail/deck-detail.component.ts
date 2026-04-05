// Deck detail page: displays the 4-part AI analysis, comments section, and PDF download button.
// Users can add/delete their own comments to annotate the deck for the team.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckDetail, Comment } from '../../core/deck.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, NavbarComponent, ResultCardComponent, LoaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading analysis..." />

      <div *ngIf="!loading && deck" class="w-[85vw] mx-auto px-6 py-12">

        <!-- Header -->
        <div class="flex items-start justify-between gap-4 flex-wrap mb-10">
          <h1 class="text-2xl font-semibold text-gray-900">{{ deck.startup_name }}</h1>
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              *ngIf="deck.pdf_url"
              [href]="deck.pdf_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Deck
            </a>
            <button
              (click)="downloadReport()"
              class="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
          </div>
        </div>

        <!-- Business Model -->
        <app-result-card title="Business & Revenue Model">
          <p class="text-sm text-gray-700 leading-relaxed">{{ deck.business_model }}</p>
        </app-result-card>

        <!-- Industry Context -->
        <div style="margin-top: 28px">
          <app-result-card title="Industry Context">
            <p class="text-sm text-gray-700 leading-relaxed">{{ deck.industry_context }}</p>
          </app-result-card>
        </div>

        <!-- Key Risks -->
        <div style="margin-top: 28px">
          <app-result-card title="Key Risks">
            <ul class="space-y-3">
              <li *ngFor="let risk of deck.key_risks" class="flex gap-2 text-sm text-gray-700">
                <span class="text-red-500 mt-0.5">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </app-result-card>
        </div>

        <!-- Founder Questions -->
        <div style="margin-top: 28px">
          <app-result-card title="Founder Questions">
            <ol class="space-y-3 list-decimal list-inside">
              <li *ngFor="let q of deck.founder_questions" class="text-sm text-gray-700">{{ q }}</li>
            </ol>
            <button
              (click)="showEmailModal = true"
              class="mt-6 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Email to Team
            </button>
          </app-result-card>
        </div>

        <!-- Team Notes -->
        <div style="margin-top: 28px" class="bg-white rounded-xl border border-gray-200 p-8">
          <h2 class="text-base font-semibold text-gray-900 mb-5">Team Notes</h2>
          <div class="space-y-3 mb-5">
            <div *ngIf="comments.length === 0" class="text-sm text-gray-400">No notes yet. Be the first to add one.</div>
            <div
              *ngFor="let c of comments"
              class="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-4 py-3"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800">{{ c.body }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ c.author_name }} · {{ c.created_at | date:'dd MMM yyyy, h:mm a' }}</p>
              </div>
              <button
                (click)="deleteComment(c.id)"
                class="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                title="Delete note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <textarea
              [(ngModel)]="newComment"
              placeholder="Add a note for the team..."
              rows="2"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            ></textarea>
            <button
              (click)="addComment()"
              [disabled]="!newComment.trim() || savingComment"
              class="self-end bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 whitespace-nowrap"
            >
              {{ savingComment ? 'Saving...' : 'Add Note' }}
            </button>
          </div>
        </div>

      </div>

      <div *ngIf="!loading && !deck" class="text-center py-20 text-gray-400">Deck not found.</div>
    </div>

    <!-- Email Modal -->
    <div *ngIf="showEmailModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Email Founder Questions</h2>
          <button (click)="closeEmailModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <input
          type="email"
          [(ngModel)]="recipientEmail"
          placeholder="recipient@example.com"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
        />
        <p *ngIf="emailError" class="text-red-600 text-sm mb-3">{{ emailError }}</p>
        <p *ngIf="emailSuccess" class="text-green-600 text-sm mb-3">Email sent successfully!</p>
        <button
          (click)="sendEmail()"
          [disabled]="sendingEmail || !recipientEmail"
          class="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
        >
          {{ sendingEmail ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  `,
})
export class DeckDetailComponent implements OnInit {
  deck: DeckDetail | null = null;
  comments: Comment[] = [];
  loading = true;
  newComment = '';
  savingComment = false;
  showEmailModal = false;
  recipientEmail = '';
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;

  constructor(private route: ActivatedRoute, private deckService: DeckService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.loading = false;
        this.loadComments();
      },
      error: () => (this.loading = false),
    });
  }

  loadComments() {
    if (!this.deck) return;
    this.deckService.getComments(this.deck.id).subscribe({ next: c => (this.comments = c) });
  }

  addComment() {
    if (!this.deck || !this.newComment.trim()) return;
    this.savingComment = true;
    this.deckService.addComment(this.deck.id, this.newComment.trim()).subscribe({
      next: c => {
        this.comments = [...this.comments, c];
        this.newComment = '';
        this.savingComment = false;
      },
      error: () => (this.savingComment = false),
    });
  }

  deleteComment(commentId: string) {
    if (!this.deck) return;
    this.deckService.deleteComment(this.deck.id, commentId).subscribe({
      next: () => (this.comments = this.comments.filter(c => c.id !== commentId)),
    });
  }

  sendEmail() {
    if (!this.deck || !this.recipientEmail) return;
    this.sendingEmail = true;
    this.emailError = '';
    this.emailSuccess = false;
    this.deckService.emailQuestions(this.deck.id, this.recipientEmail).subscribe({
      next: () => {
        this.emailSuccess = true;
        this.sendingEmail = false;
        setTimeout(() => this.closeEmailModal(), 2000);
      },
      error: err => {
        this.emailError = err.error?.error || 'Failed to send email.';
        this.sendingEmail = false;
      },
    });
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.recipientEmail = '';
    this.emailError = '';
    this.emailSuccess = false;
  }

  downloadReport() {
    if (!this.deck) return;
    const d = this.deck;
    const lines: string[] = [
      `CDM CAPITAL — VC BRIEF`,
      `${d.startup_name}`,
      `${'='.repeat(60)}`,
      ``,
      `1. BUSINESS & REVENUE MODEL`,
      `-`.repeat(40),
      d.business_model,
      ``,
      `2. INDUSTRY CONTEXT`,
      `-`.repeat(40),
      d.industry_context,
      ``,
      `3. KEY RISKS`,
      `-`.repeat(40),
      ...d.key_risks.map((r, i) => `${i + 1}. ${r}`),
      ``,
      `4. FOUNDER QUESTIONS`,
      `-`.repeat(40),
      ...d.founder_questions.map((q, i) => `${i + 1}. ${q}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.startup_name} — CDM Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
