// Upload box component: drag-and-drop file input that accepts PDF, PPT, and PPTX files.
// Emits the selected File object to the parent via (fileSelected).

import { Component, EventEmitter, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload-box',
  standalone: true,
  imports: [NgIf],
  template: `
    <div
      class="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors"
      [class.border-indigo-500]="dragging"
      (dragover)="onDragOver($event)"
      (dragleave)="dragging = false"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <p class="text-gray-500 text-sm">
        Drag & drop a PDF, PPT, or PPTX here, or
        <span class="text-indigo-600 font-medium">browse</span>
      </p>
      <p *ngIf="selectedFile" class="mt-2 text-xs text-gray-700 font-medium">{{ selectedFile.name }}</p>
      <input #fileInput type="file" accept=".pdf,.ppt,.pptx" class="hidden" (change)="onFileChange($event)" />
    </div>
  `,
})
export class UploadBoxComponent {
  @Output() fileSelected = new EventEmitter<File>();
  selectedFile: File | null = null;
  dragging = false;

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragging = true;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File) {
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }
}
