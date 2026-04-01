// Deck detail page: displays the 4-part AI analysis for a single pitch deck.
// Includes an email modal to send founder questions to any address.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckDetail } from '../../core/deck.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NavbarComponent, ResultCardComponent, LoaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />

      <app-loader *ngIf="loading" message="Loading analysis..." />

      <div *ngIf="!loading && deck" class="max-w-3xl mx-auto px-6 py-8 space-y-5">
        <h1 class="text-2xl font-semibold text-gray-900">{{ deck.startup_name }}</h1>

        <div *ngIf="deck.pdf_url" class="flex">
          <a
            [href]="deck.pdf_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Original Deck
          </a>
        </div>

        <app-result-card title="Business & Revenue Model">
          <p class="text-sm text-gray-700 leading-relaxed">{{ deck.business_model }}</p>
        </app-result-card>

        <app-result-card title="Industry Context">
          <p class="text-sm text-gray-700 leading-relaxed">{{ deck.industry_context }}</p>
        </app-result-card>

        <app-result-card title="Key Risks">
          <ul class="space-y-2">
            <li *ngFor="let risk of deck.key_risks" class="flex gap-2 text-sm text-gray-700">
              <span class="text-red-500 mt-0.5">•</span>
              <span>{{ risk }}</span>
            </li>
          </ul>
        </app-result-card>

        <app-result-card title="Founder Questions">
          <ol class="space-y-2 list-decimal list-inside">
            <li *ngFor="let q of deck.founder_questions" class="text-sm text-gray-700">{{ q }}</li>
          </ol>
          <button
            (click)="showEmailModal = true"
            class="mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Email to Team
          </button>
        </app-result-card>
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
  loading = true;
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
      },
      error: () => (this.loading = false),
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
}
