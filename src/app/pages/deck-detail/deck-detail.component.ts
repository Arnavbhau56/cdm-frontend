// Deck detail page: AI analysis, founder contact card, question selection for email, emailed badges, comments.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
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
        <div class="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ deck.startup_name }}</h1>
            <span *ngIf="deck.sector" class="inline-block mt-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{{ deck.sector }}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Deck
            </a>
            <button (click)="downloadReport()"
              class="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
            <button (click)="deleteDeck()"
              class="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Founder Contact Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900">Founder Email</h2>
            <button *ngIf="!editingFounder" (click)="editingFounder = true"
              class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
            <div *ngIf="editingFounder" class="flex gap-2">
              <button (click)="saveFounder()" [disabled]="savingFounder"
                class="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-40">
                {{ savingFounder ? 'Saving...' : 'Save' }}
              </button>
              <button (click)="cancelEditFounder()" class="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          </div>

          <!-- View mode -->
          <div *ngIf="!editingFounder">
            <a *ngIf="deck.founder_email" [href]="'mailto:' + deck.founder_email"
              class="text-sm text-indigo-600 hover:underline font-medium">{{ deck.founder_email }}</a>
            <p *ngIf="!deck.founder_email" class="text-sm text-gray-400 italic">No email found in deck — click Edit to add manually.</p>
          </div>

          <!-- Edit mode -->
          <div *ngIf="editingFounder">
            <input [(ngModel)]="founderDraft.founder_email" type="email" placeholder="founder@startup.com"
              class="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
            <ol class="space-y-3">
              <li *ngFor="let q of deck.founder_questions; let i = index"
                class="flex items-start gap-3 text-sm text-gray-700">
                <span class="mt-0.5 shrink-0 text-gray-400 font-medium w-5">{{ i + 1 }}.</span>
                <span class="flex-1">{{ q }}</span>
                <!-- Emailed badge -->
                <span *ngIf="isEmailed(i)"
                  class="shrink-0 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Emailed
                </span>
              </li>
            </ol>
            <button (click)="openEmailModal()"
              class="mt-6 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
              Email to Founder
            </button>
          </app-result-card>
        </div>

        <!-- Team Notes -->
        <div style="margin-top: 28px" class="bg-white rounded-xl border border-gray-200 p-8">
          <h2 class="text-base font-semibold text-gray-900 mb-5">Team Notes</h2>
          <div class="space-y-3 mb-5">
            <div *ngIf="comments.length === 0" class="text-sm text-gray-400">No notes yet. Be the first to add one.</div>
            <div *ngFor="let c of comments" class="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800">{{ c.body }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ c.author_name }} · {{ c.created_at | date:'dd MMM yyyy, h:mm a' }}</p>
              </div>
              <button (click)="deleteComment(c.id)" class="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5" title="Delete note">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <textarea [(ngModel)]="newComment" placeholder="Add a note for the team..." rows="2"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            <button (click)="addComment()" [disabled]="!newComment.trim() || savingComment"
              class="self-end bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 whitespace-nowrap">
              {{ savingComment ? 'Saving...' : 'Add Note' }}
            </button>
          </div>
        </div>

      </div>

      <div *ngIf="!loading && !deck" class="text-center py-20 text-gray-400">Deck not found.</div>
    </div>

    <!-- Email Modal -->
    <div *ngIf="showEmailModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Email Founder Questions</h2>
          <button (click)="closeEmailModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <!-- Recipient -->
        <input type="email" [(ngModel)]="recipientEmail" placeholder="recipient@example.com"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />

        <!-- Question selection -->
        <p class="text-xs font-medium text-gray-500 mb-2">Select questions to send:</p>
        <div class="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
          <label *ngFor="let q of deck?.founder_questions; let i = index"
            class="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" [checked]="selectedIndices.has(i)" (change)="toggleQuestion(i)"
              class="mt-0.5 shrink-0 accent-indigo-600" />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">
              {{ i + 1 }}. {{ q }}
              <span *ngIf="isEmailed(i)" class="ml-1 text-xs text-green-600 font-medium">(emailed before)</span>
            </span>
          </label>
        </div>

        <div class="flex gap-2 mb-3">
          <button (click)="selectAll()" class="text-xs text-indigo-600 hover:underline">Select all</button>
          <span class="text-gray-300">|</span>
          <button (click)="selectNone()" class="text-xs text-gray-400 hover:underline">Clear</button>
        </div>

        <p *ngIf="emailError" class="text-red-600 text-sm mb-3">{{ emailError }}</p>
        <p *ngIf="emailSuccess" class="text-green-600 text-sm mb-3">Email sent successfully!</p>

        <button (click)="sendEmail()" [disabled]="sendingEmail || !recipientEmail || selectedIndices.size === 0"
          class="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40">
          {{ sendingEmail ? 'Sending...' : 'Send ' + selectedIndices.size + ' Question' + (selectedIndices.size === 1 ? '' : 's') }}
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

  // Founder contact
  editingFounder = false;
  savingFounder = false;
  founderDraft = { founder_email: '' };

  // Email modal
  showEmailModal = false;
  recipientEmail = '';
  selectedIndices = new Set<number>();
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;

  constructor(private route: ActivatedRoute, private deckService: DeckService, private router: Router) {}

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

  isEmailed(index: number): boolean {
    return !!this.deck?.emailed_questions?.includes(index);
  }

  // Founder contact
  editFounder() {
    if (!this.deck) return;
    this.founderDraft = { founder_email: this.deck.founder_email };
    this.editingFounder = true;
  }

  saveFounder() {
    if (!this.deck) return;
    this.savingFounder = true;
    this.deckService.updateFounderContact(this.deck.id, this.founderDraft).subscribe({
      next: res => {
        this.deck!.founder_email = res.founder_email;
        this.editingFounder = false;
        this.savingFounder = false;
      },
      error: () => (this.savingFounder = false),
    });
  }

  cancelEditFounder() {
    this.editingFounder = false;
  }

  deleteDeck() {
    if (!this.deck) return;
    Swal.fire({
      title: `Delete "${this.deck.startup_name}"?`,
      text: 'This will permanently remove the deck and all its analysis. This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.deckService.deleteDeck(this.deck!.id).subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
    });
  }

  // Email modal
  openEmailModal() {
    if (!this.deck) return;
    // Pre-fill recipient from founder email if available
    this.recipientEmail = this.deck.founder_email || '';
    // Select all by default
    this.selectedIndices = new Set(this.deck.founder_questions.map((_, i) => i));
    this.emailError = '';
    this.emailSuccess = false;
    this.showEmailModal = true;
  }

  toggleQuestion(i: number) {
    if (this.selectedIndices.has(i)) this.selectedIndices.delete(i);
    else this.selectedIndices.add(i);
    this.selectedIndices = new Set(this.selectedIndices); // trigger change detection
  }

  selectAll() {
    if (!this.deck) return;
    this.selectedIndices = new Set(this.deck.founder_questions.map((_, i) => i));
  }

  selectNone() { this.selectedIndices = new Set(); }

  sendEmail() {
    if (!this.deck || !this.recipientEmail || this.selectedIndices.size === 0) return;
    this.sendingEmail = true;
    this.emailError = '';
    this.emailSuccess = false;

    this.deckService.emailQuestions(this.deck.id, this.recipientEmail, Array.from(this.selectedIndices)).subscribe({
      next: res => {
        this.deck!.emailed_questions = res.emailed_questions;
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

  // Comments
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
      ...d.founder_questions.map((q, i) => `${i + 1}. ${q}${this.isEmailed(i) ? ' [Emailed]' : ''}`),
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
