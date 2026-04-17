// Upload box: dark drag-and-drop file input matching PathCredit Logger style.

import { Component, EventEmitter, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload-box',
  standalone: true,
  imports: [NgIf],
  template: `
    <div
      (dragover)="onDragOver($event)"
      (dragleave)="dragging = false"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      style="border:2px dashed;border-radius:var(--radius);padding:32px 20px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;"
      [style.borderColor]="dragging ? 'var(--accent)' : 'var(--border)'"
      [style.background]="dragging ? 'var(--accent-dim)' : 'var(--surface-2)'">
      <p style="font-size:.82rem;color:var(--text-muted);">
        Drag & drop a PDF, PPT, or PPTX here, or
        <span style="color:var(--accent);font-weight:600;">browse</span>
      </p>
      <p *ngIf="selectedFile" style="margin-top:8px;font-size:.78rem;color:var(--text);font-family:var(--font-body);">{{ selectedFile.name }}</p>
      <input #fileInput type="file" accept=".pdf,.ppt,.pptx" style="display:none;" (change)="onFileChange($event)" />
    </div>
  `,
})
export class UploadBoxComponent {
  @Output() fileSelected = new EventEmitter<File>();
  selectedFile: File | null = null;
  dragging = false;

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragging = true; }
  onDrop(e: DragEvent) { e.preventDefault(); this.dragging = false; const f = e.dataTransfer?.files[0]; if (f) this.setFile(f); }
  onFileChange(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.setFile(f); }
  private setFile(f: File) { this.selectedFile = f; this.fileSelected.emit(f); }
}
