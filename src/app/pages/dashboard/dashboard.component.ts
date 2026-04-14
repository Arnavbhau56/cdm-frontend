// Dashboard: deck table with sector/CRM filters, checkbox selection, bulk delete, email column.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { UploadBoxComponent } from '../../components/upload-box/upload-box.component';
import { DeckService, DeckSummary } from '../../core/deck.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, TitleCasePipe, FormsModule, NavbarComponent, UploadBoxComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />

      <div class="w-[90vw] mx-auto px-6 py-8">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-semibold text-gray-900">Pitch Decks</h1>
          <button (click)="showModal = true" class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            + Upload New Deck
          </button>
        </div>

        <!-- Filters + bulk delete toolbar -->
        <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div class="flex items-center gap-3 flex-wrap">
            <select [(ngModel)]="filterCrm" (ngModelChange)="applyFilters()"
              class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input [(ngModel)]="filterSector" (ngModelChange)="applyFilters()" placeholder="Filter by sector..."
              class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
            <button *ngIf="filterCrm || filterSector" (click)="clearFilters()" class="text-sm text-gray-400 hover:text-gray-600">Clear</button>
          </div>

          <!-- Bulk delete -->
          <div *ngIf="selectedIds.size > 0" class="flex items-center gap-3">
            <span class="text-sm text-gray-500">{{ selectedIds.size }} selected</span>
            <button (click)="bulkDelete()"
              class="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 w-10">
                  <input type="checkbox" [checked]="isAllSelected()" (change)="toggleAll($event)"
                    class="accent-indigo-600" />
                </th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Startup</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Sector</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Founder Email</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Uploaded</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Analysis</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Decision</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600">Latest Note</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="decks.length === 0">
                <td colspan="8" class="px-5 py-8 text-center text-gray-400">No decks found.</td>
              </tr>
              <tr *ngFor="let deck of decks"
                class="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                [class.bg-indigo-50]="selectedIds.has(deck.id)">

                <!-- Checkbox -->
                <td class="px-4 py-3" (click)="$event.stopPropagation()">
                  <input type="checkbox" [checked]="selectedIds.has(deck.id)" (change)="toggleSelect(deck.id)"
                    class="accent-indigo-600" />
                </td>

                <!-- Startup name -->
                <td class="px-4 py-3 font-medium text-gray-900">
                  <span [class.text-indigo-600]="deck.status === 'complete'"
                    [class.cursor-pointer]="deck.status === 'complete'"
                    (click)="openDeck(deck)">{{ deck.startup_name }}</span>
                </td>

                <!-- Sector -->
                <td class="px-4 py-3">
                  <span *ngIf="deck.sector" class="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{{ deck.sector }}</span>
                  <span *ngIf="!deck.sector" class="text-gray-300">—</span>
                </td>

                <!-- Founder email -->
                <td class="px-4 py-3">
                  <a *ngIf="deck.founder_email" [href]="'mailto:' + deck.founder_email"
                    class="text-xs text-indigo-600 hover:underline" (click)="$event.stopPropagation()">
                    {{ deck.founder_email }}
                  </a>
                  <span *ngIf="!deck.founder_email" class="text-gray-300 text-xs">—</span>
                </td>

                <!-- Date -->
                <td class="px-4 py-3 text-gray-500">{{ deck.created_at | date:'dd MMM yyyy' }}</td>

                <!-- Analysis status -->
                <td class="px-4 py-3">
                  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-700': deck.status === 'processing',
                      'bg-green-100 text-green-700': deck.status === 'complete',
                      'bg-red-100 text-red-700': deck.status === 'failed',
                      'bg-gray-100 text-gray-600': deck.status === 'uploaded'
                    }">
                    {{ deck.status | titlecase }}
                  </span>
                </td>

                <!-- CRM status dropdown -->
                <td class="px-4 py-3" (click)="$event.stopPropagation()">
                  <select [ngModel]="deck.crm_status" (ngModelChange)="updateCrmStatus(deck, $event)"
                    class="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    [ngClass]="{
                      'border-yellow-300 bg-yellow-50 text-yellow-700': deck.crm_status === 'pending',
                      'border-green-300 bg-green-50 text-green-700': deck.crm_status === 'approved',
                      'border-red-300 bg-red-50 text-red-700': deck.crm_status === 'rejected'
                    }">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                <!-- Latest comment -->
                <td class="px-4 py-3 max-w-xs">
                  <ng-container *ngIf="deck.latest_comment; else noComment">
                    <p class="text-xs text-gray-700 truncate">{{ deck.latest_comment.body }}</p>
                    <p class="text-xs text-gray-400">{{ deck.latest_comment.author_name }}</p>
                  </ng-container>
                  <ng-template #noComment><span class="text-gray-300 text-xs">—</span></ng-template>
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
          <button (click)="submitUpload()" [disabled]="!selectedFile"
            class="mt-4 w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40">
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
  selectedIds = new Set<string>();
  showModal = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadMessage = 'Uploading deck...';
  uploadError = '';
  filterSector = '';
  filterCrm = '';
  private pollInterval: any;

  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit() { this.loadDecks(); }

  loadDecks() {
    this.deckService.listDecks({ sector: this.filterSector, crm_status: this.filterCrm })
      .subscribe({ next: d => { this.decks = d; this.selectedIds.clear(); } });
  }

  applyFilters() { this.loadDecks(); }

  clearFilters() {
    this.filterSector = '';
    this.filterCrm = '';
    this.loadDecks();
  }

  // Selection
  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  toggleAll(e: Event) {
    if ((e.target as HTMLInputElement).checked) {
      this.selectedIds = new Set(this.decks.map(d => d.id));
    } else {
      this.selectedIds = new Set();
    }
  }

  isAllSelected(): boolean {
    return this.decks.length > 0 && this.selectedIds.size === this.decks.length;
  }

  bulkDelete() {
    if (!this.selectedIds.size) return;
    Swal.fire({
      title: `Delete ${this.selectedIds.size} deck${this.selectedIds.size > 1 ? 's' : ''}?`,
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.deckService.bulkDeleteDecks(Array.from(this.selectedIds)).subscribe({
        next: () => this.loadDecks(),
      });
    });
  }

  updateCrmStatus(deck: DeckSummary, newStatus: string) {
    this.deckService.updateCrmStatus(deck.id, newStatus).subscribe({
      next: res => (deck.crm_status = res.crm_status),
    });
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
