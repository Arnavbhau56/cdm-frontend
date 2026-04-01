// Setup page: form to view and update CDM Capital's firm preferences used in AI prompts.

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DeckService, FirmPreferences } from '../../core/deck.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule, NgIf, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />

      <div class="max-w-2xl mx-auto px-6 py-8">
        <h1 class="text-xl font-semibold text-gray-900 mb-6">Firm Preferences</h1>

        <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sectors Focus</label>
            <input
              [(ngModel)]="prefs.sectors_focus"
              placeholder="e.g. Fintech, SaaS, Deeptech"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stage Focus</label>
            <input
              [(ngModel)]="prefs.stage_focus"
              placeholder="e.g. Pre-seed, Seed"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Question Style</label>
            <textarea
              [(ngModel)]="prefs.question_style"
              rows="3"
              placeholder="e.g. Direct, first-principles, focus on defensibility"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Additional Context</label>
            <textarea
              [(ngModel)]="prefs.additional_context"
              rows="3"
              placeholder="Any other context for the AI analyst..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            ></textarea>
          </div>

          <p *ngIf="saved" class="text-green-600 text-sm">Preferences saved successfully.</p>
          <p *ngIf="saveError" class="text-red-600 text-sm">{{ saveError }}</p>

          <button
            (click)="save()"
            [disabled]="saving"
            class="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SetupComponent implements OnInit {
  prefs: FirmPreferences = { sectors_focus: '', stage_focus: '', question_style: '', additional_context: '' };
  saving = false;
  saved = false;
  saveError = '';

  constructor(private deckService: DeckService) {}

  ngOnInit() {
    this.deckService.getPreferences().subscribe({ next: p => (this.prefs = p) });
  }

  save() {
    this.saving = true;
    this.saved = false;
    this.saveError = '';
    this.deckService.savePreferences(this.prefs).subscribe({
      next: () => {
        this.saved = true;
        this.saving = false;
        setTimeout(() => (this.saved = false), 3000);
      },
      error: err => {
        this.saveError = err.error?.error || 'Failed to save preferences.';
        this.saving = false;
      },
    });
  }
}
