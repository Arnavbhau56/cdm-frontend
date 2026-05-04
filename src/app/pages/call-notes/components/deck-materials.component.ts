import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { DeckService, DeckMaterial } from '../../../core/deck.service';
import { InsightRefreshService } from '../../../core/insight-refresh.service';

@Component({
  selector: 'app-deck-materials',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  template: `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px;">Upload File</p>
          <p style="font-size:.75rem;color:var(--text-muted);">Financials, MIS, term sheets, pitch notes — any file.</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span *ngIf="uploading" style="font-size:.75rem;color:var(--text-muted);">Uploading…</span>
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:6px 14px;cursor:pointer;">
            <input type="file" style="display:none;" (change)="onUpload($event)" />
            ↑ Upload File
          </label>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;">
      <div *ngIf="materials.length === 0"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;text-align:center;color:var(--text-muted);font-size:.85rem;">
        No files uploaded yet.
      </div>
      <div *ngFor="let m of materials"
        style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:.88rem;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ m.name }}</p>
          <p style="font-size:.72rem;color:var(--text-muted);margin-top:2px;">{{ m.created_at | date:'dd MMM yyyy, h:mm a' }}</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <a [href]="m.url" target="_blank" rel="noopener noreferrer"
            style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;padding:4px 10px;text-decoration:none;">
            Open
          </a>
          <button (click)="delete(m.id)" style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:2px 5px;line-height:1;">×</button>
        </div>
      </div>
    </div>
  `,
})
export class DeckMaterialsComponent implements OnInit {
  @Input() deckId = '';

  materials: DeckMaterial[] = [];
  uploading = false;

  constructor(private deckService: DeckService, private insightRefresh: InsightRefreshService) {}

  ngOnInit() {
    this.deckService.getMaterials(this.deckId).subscribe({ next: m => (this.materials = m) });
  }

  onUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.deckService.uploadMaterial(this.deckId, file).subscribe({
      next: m => {
        this.materials = [m, ...this.materials];
        this.uploading = false;
        this.insightRefresh.trigger(this.deckId);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File uploaded — updating answers…', showConfirmButton: false, timer: 3000, background: '#16181c', color: '#3dca7e' });
        this.deckService.autoAnswerQuestions(this.deckId).subscribe();
      },
      error: () => { this.uploading = false; },
    });
    (event.target as HTMLInputElement).value = '';
  }

  delete(id: string) {
    this.deckService.deleteMaterial(this.deckId, id).subscribe({
      next: () => { this.materials = this.materials.filter(m => m.id !== id); },
    });
  }
}
