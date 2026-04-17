// Dashboard: dark theme table matching PathCredit Logger design system.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { UploadBoxComponent } from '../../components/upload-box/upload-box.component';
import { DeckService, DeckSummary } from '../../core/deck.service';

export const CRM_STATUSES: { value: string; label: string }[] = [
  { value: 'pending',          label: 'Pending' },
  { value: 'portfolio',        label: 'Portfolio Company' },
  { value: 'active',           label: 'Active' },
  { value: 'decision_needed',  label: 'Decision To Be Taken' },
  { value: 'dm_call',          label: 'DM Call Setup / TBD' },
  { value: 'deep_dive',        label: 'Need To Deep Dive' },
  { value: 'update_requested', label: 'Update Requested / Founder Followed Up' },
  { value: 'intro_call_done',  label: 'Introductory Call Done' },
  { value: 'wait_watch',       label: 'Wait and Watch' },
  { value: 'tracking',         label: 'Tracking' },
  { value: 'not_raising',      label: 'Not Raising, Introductory Call Done' },
  { value: 'will_raise',       label: 'Will Raise Soon' },
  { value: 'early_undecided',  label: 'Early, Undecided' },
  { value: 'connected_tbd',    label: 'Connected, Calls To Be Decided' },
  { value: 'unresponsive',     label: 'Founder Unresponsive' },
  { value: 'not_fit',          label: 'Not a Fit' },
  { value: 'evaluated_pass',   label: 'Evaluated, Pass' },
  { value: 'pass',             label: 'Pass' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, TitleCasePipe, FormsModule, NavbarComponent, UploadBoxComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />

      <div style="max-width:95vw;margin:0 auto;padding:32px 24px 64px;">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div>
            <h1 style="font-family:var(--font-body);font-size:1rem;font-weight:700;letter-spacing:.04em;">PITCH DECKS</h1>
            <p style="font-size:.78rem;color:var(--text-muted);margin-top:2px;">{{ decks.length }} total</p>
          </div>
          <button (click)="showModal = true"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-family:var(--font-body);font-size:.78rem;font-weight:700;letter-spacing:.04em;padding:9px 16px;cursor:pointer;transition:opacity .15s;"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            + Upload Deck
          </button>
        </div>

        <!-- Filters + bulk delete -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <!-- Filter chips -->
            <button
              [style.background]="!filterCrm ? 'var(--accent-dim)' : 'var(--surface)'"
              [style.borderColor]="!filterCrm ? 'var(--accent)' : 'var(--border)'"
              [style.color]="!filterCrm ? 'var(--accent)' : 'var(--text-muted)'"
              (click)="filterCrm=''; applyFilters()"
              style="border:1px solid;border-radius:20px;font-size:.75rem;font-weight:500;padding:5px 12px;cursor:pointer;transition:all .15s;">
              All
            </button>
            <select [(ngModel)]="filterCrm" (ngModelChange)="applyFilters()"
              style="background:var(--surface);border:1px solid var(--border);border-radius:20px;color:var(--text-muted);font-size:.75rem;padding:5px 12px;cursor:pointer;max-width:200px;">
              <option value="">All Statuses</option>
              <option *ngFor="let s of crmStatuses" [value]="s.value">{{ s.label }}</option>
            </select>
            <input [(ngModel)]="filterSector" (ngModelChange)="applyFilters()" placeholder="Filter sector…"
              style="background:var(--surface);border:1px solid var(--border);border-radius:20px;color:var(--text-muted);font-size:.75rem;padding:5px 12px;width:160px;" />
            <button *ngIf="filterCrm || filterSector" (click)="clearFilters()"
              style="font-size:.75rem;color:var(--text-muted);background:none;border:none;cursor:pointer;padding:5px;">
              Clear ×
            </button>
          </div>

          <div *ngIf="selectedIds.size > 0" style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:.78rem;color:var(--text-muted);">{{ selectedIds.size }} selected</span>
            <button (click)="bulkDelete()"
              style="background:rgba(224,82,82,.1);border:1px solid rgba(224,82,82,.3);border-radius:var(--radius);color:#e05252;font-size:.75rem;padding:5px 12px;cursor:pointer;transition:opacity .15s;">
              Delete Selected
            </button>
          </div>
        </div>

        <!-- Table -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;font-size:.85rem;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:12px 16px;width:40px;">
                  <input type="checkbox" [checked]="isAllSelected()" (change)="toggleAll($event)"
                    style="accent-color:var(--accent);width:auto;" />
                </th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">STARTUP</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">SECTOR</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">FOUNDER EMAIL</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">DATE</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">ANALYSIS</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">DECISION</th>
                <th style="text-align:left;padding:12px 16px;font-family:var(--font-body);font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);font-weight:400;">LATEST NOTE</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="decks.length === 0">
                <td colspan="8" style="padding:48px;text-align:center;color:var(--text-muted);font-size:.85rem;">No decks found.</td>
              </tr>
              <tr *ngFor="let deck of decks"
                style="border-top:1px solid var(--border);transition:background .15s;"
                [style.background]="selectedIds.has(deck.id) ? 'var(--accent-dim)' : 'transparent'"
                onmouseover="if(!this.style.background.includes('accent'))this.style.background='var(--surface-2)'"
                onmouseout="this.style.background=''">

                <td style="padding:12px 16px;" (click)="$event.stopPropagation()">
                  <input type="checkbox" [checked]="selectedIds.has(deck.id)" (change)="toggleSelect(deck.id)"
                    style="accent-color:var(--accent);width:auto;" />
                </td>

                <td style="padding:12px 16px;font-weight:500;">
                  <span
                    [style.color]="deck.status === 'complete' ? 'var(--accent)' : 'var(--text)'"
                    [style.cursor]="deck.status === 'complete' ? 'pointer' : 'default'"
                    (click)="openDeck(deck)">
                    {{ deck.startup_name }}
                  </span>
                </td>

                <td style="padding:12px 16px;">
                  <span *ngIf="deck.sector"
                    style="font-size:.72rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid #4f8ef7;border-radius:4px;padding:2px 7px;color:#4f8ef7;">
                    {{ deck.sector }}
                  </span>
                  <span *ngIf="!deck.sector" style="color:var(--text-muted);">—</span>
                </td>

                <td style="padding:12px 16px;">
                  <a *ngIf="deck.founder_email" [href]="'mailto:' + deck.founder_email"
                    style="font-size:.78rem;color:var(--accent);text-decoration:none;"
                    (click)="$event.stopPropagation()">
                    {{ deck.founder_email }}
                  </a>
                  <span *ngIf="!deck.founder_email" style="color:var(--text-muted);">—</span>
                </td>

                <td style="padding:12px 16px;color:var(--text-muted);font-size:.82rem;">
                  {{ deck.created_at | date:'dd MMM yyyy' }}
                </td>

                <td style="padding:12px 16px;">
                  <span style="font-size:.72rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid;border-radius:4px;padding:2px 7px;"
                    [style.color]="deck.status === 'complete' ? '#3dca7e' : deck.status === 'processing' ? '#f0c040' : deck.status === 'failed' ? '#e05252' : 'var(--text-muted)'"
                    [style.borderColor]="deck.status === 'complete' ? '#3dca7e' : deck.status === 'processing' ? '#f0c040' : deck.status === 'failed' ? '#e05252' : 'var(--border)'">
                    {{ deck.status | titlecase }}
                  </span>
                </td>

                <td style="padding:12px 16px;" (click)="$event.stopPropagation()">
                  <select [ngModel]="deck.crm_status" (ngModelChange)="updateCrmStatus(deck, $event)"
                    style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:.78rem;padding:5px 8px;max-width:190px;cursor:pointer;">
                    <option *ngFor="let s of crmStatuses" [value]="s.value">{{ s.label }}</option>
                  </select>
                </td>

                <td style="padding:12px 16px;max-width:200px;">
                  <ng-container *ngIf="deck.latest_comment; else noComment">
                    <p style="font-size:.78rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ deck.latest_comment.body }}</p>
                    <p style="font-size:.72rem;color:var(--text-muted);">{{ deck.latest_comment.author_name }}</p>
                  </ng-container>
                  <ng-template #noComment><span style="color:var(--text-muted);">—</span></ng-template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div *ngIf="showModal" style="position:fixed;inset:0;background:rgba(14,15,17,.8);display:flex;align-items:center;justify-content:center;z-index:40;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:100%;max-width:440px;margin:0 16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <span style="font-family:var(--font-body);font-size:.75rem;letter-spacing:.1em;color:var(--text-muted);">UPLOAD DECK</span>
          <button (click)="closeModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;line-height:1;">×</button>
        </div>

        <ng-container *ngIf="!uploading">
          <app-upload-box (fileSelected)="onFileSelected($event)" />
          <p *ngIf="uploadError" style="font-size:.78rem;color:#e05252;margin-top:10px;">{{ uploadError }}</p>
          <button (click)="submitUpload()" [disabled]="!selectedFile"
            style="margin-top:16px;width:100%;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-family:var(--font-body);font-size:.78rem;font-weight:700;letter-spacing:.04em;padding:11px;cursor:pointer;opacity:1;transition:opacity .15s;"
            [style.opacity]="!selectedFile ? '0.4' : '1'">
            Analyze Deck
          </button>
        </ng-container>

        <ng-container *ngIf="uploading">
          <div style="display:flex;flex-direction:column;align-items:center;padding:32px 0;">
            <div style="width:28px;height:28px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;margin-bottom:12px;"></div>
            <p style="font-size:.82rem;color:var(--text-muted);">{{ uploadMessage }}</p>
          </div>
          <p *ngIf="uploadError" style="font-size:.78rem;color:#e05252;text-align:center;">{{ uploadError }}</p>
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
  crmStatuses = CRM_STATUSES;
  private pollInterval: any;

  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit() { this.loadDecks(); }

  loadDecks() {
    this.deckService.listDecks({ sector: this.filterSector, crm_status: this.filterCrm })
      .subscribe({ next: d => { this.decks = d; this.selectedIds = new Set(); } });
  }

  applyFilters() { this.loadDecks(); }

  clearFilters() {
    this.filterSector = '';
    this.filterCrm = '';
    this.loadDecks();
  }

  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  toggleAll(e: Event) {
    this.selectedIds = (e.target as HTMLInputElement).checked
      ? new Set(this.decks.map(d => d.id))
      : new Set();
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
      background: '#16181c',
      color: '#e8eaf0',
      showCancelButton: true,
      confirmButtonColor: '#e05252',
      cancelButtonColor: '#2a2d35',
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
        this.uploadError = err.error?.error || 'Upload failed.';
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
