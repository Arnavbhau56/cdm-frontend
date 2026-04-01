// Dashboard page: lists all uploaded decks in a table and provides an upload modal.
// Polls the backend after upload until analysis is complete or failed.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { UploadBoxComponent } from '../../components/upload-box/upload-box.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckSummary } from '../../core/deck.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, NavbarComponent, UploadBoxComponent, LoaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />

      <div class="max-w-5xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-semibold text-gray-900">Pitch Decks</h1>
          <button
            (click)="showModal = true"
            class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Upload New Deck
          </button>
        </div>

        <!-- Decks table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-5 py-3 font-medium text-gray-600">Startup</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600">Uploaded</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="decks.length === 0">
                <td colspan="3" class="px-5 py-8 text-center text-gray-400">No decks uploaded yet.</td>
              </tr>
              <tr
                *ngFor="let deck of decks"
                [class.cursor-pointer]="deck.status === 'complete'"
                [class.hover:bg-gray-50]="deck.status === 'complete'"
                (click)="openDeck(deck)"
                class="border-t border-gray-100"
              >
                <td class="px-5 py-3 font-medium text-gray-900">{{ deck.startup_name }}</td>
                <td class="px-5 py-3 text-gray-500">{{ deck.created_at | date:'dd MMM yyyy' }}</td>
                <td class="px-5 py-3">
                  <span
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-700': deck.status === 'processing',
                      'bg-green-100 text-green-700': deck.status === 'complete',
                      'bg-red-100 text-red-700': deck.status === 'failed',
                      'bg-gray-100 text-gray-600': deck.status === 'uploaded'
                    }"
                  >
                    {{ deck.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Upload Pitch Deck</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <ng-container *ngIf="!uploading">
          <app-upload-box (fileSelected)="onFileSelected($event)" />
          <p *ngIf="uploadError" class="text-red-600 text-sm mt-3">{{ uploadError }}</p>
          <button
            (click)="submitUpload()"
            [disabled]="!selectedFile"
            class="mt-4 w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
          >
            Analyze Deck
          </button>
        </ng-container>

        <ng-container *ngIf="uploading">
          <div class="flex flex-col items-center py-8">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-gray-600">{{ uploadMessage }}</p>
          </div>
          <p *ngIf="uploadError" class="text-red-600 text-sm text-center">{{ uploadError }}</p>
        </ng-container>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  decks: DeckSummary[] = [];
  showModal = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadMessage = 'Uploading deck...';
  uploadError = '';
  private pollInterval: any;

  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit() {
    this.loadDecks();
  }

  loadDecks() {
    this.deckService.listDecks().subscribe({ next: d => (this.decks = d) });
  }

  onFileSelected(file: File) {
    this.selectedFile = file;
    this.uploadError = '';
  }

  submitUpload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadMessage = 'Uploading deck...';
    this.uploadError = '';

    this.deckService.uploadDeck(this.selectedFile).subscribe({
      next: res => {
        this.uploadMessage = 'Analyzing with AI...';
        this.loadDecks();
        this.pollStatus(res.id);
      },
      error: err => {
        this.uploadError = err.error?.error || 'Upload failed. Please try again.';
        this.uploading = false;
      },
    });
  }

  pollStatus(id: string) {
    this.pollInterval = setInterval(() => {
      this.deckService.getDeck(id).subscribe({
        next: deck => {
          this.loadDecks();
          if (deck.status === 'complete') {
            clearInterval(this.pollInterval);
            this.closeModal();
            this.router.navigate(['/deck', id]);
          } else if (deck.status === 'failed') {
            clearInterval(this.pollInterval);
            this.uploadError = deck.error_message || 'Analysis failed.';
            this.uploading = false;
          }
        },
      });
    }, 3000);
  }

  openDeck(deck: DeckSummary) {
    if (deck.status === 'complete') this.router.navigate(['/deck', deck.id]);
  }

  closeModal() {
    this.showModal = false;
    this.uploading = false;
    this.selectedFile = null;
    this.uploadError = '';
    clearInterval(this.pollInterval);
  }
}
