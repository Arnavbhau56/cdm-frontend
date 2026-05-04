import { Component, Input, OnChanges } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeckService } from '../../../core/deck.service';
import { CALL_NOTE_SECTIONS } from '../../../shared/call-note-sections';
import { extractTextFromPdf, parseSectionsFromText } from '../../../shared/pdf-parser.util';

@Component({
  selector: 'app-call-notes-editor',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  styles: [`
    .editor { min-height:80px;width:100%;box-sizing:border-box;font-size:.85rem;line-height:1.7;font-family:var(--font-body);background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:10px 12px;outline:none;word-break:break-word; }
    .editor:focus { border-color:var(--accent); }
    .editor:empty:before { content:attr(data-placeholder);color:var(--text-muted);pointer-events:none; }
    .toolbar { display:flex;gap:4px;margin-bottom:8px; }
    .toolbar button { background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text-muted);font-size:.75rem;padding:3px 8px;cursor:pointer;line-height:1.4; }
    .toolbar button:hover { color:var(--accent);border-color:var(--accent); }
    .paste-overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center; }
    .paste-modal { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:min(640px,90vw);display:flex;flex-direction:column;gap:14px; }
    .paste-textarea { width:100%;box-sizing:border-box;min-height:260px;font-size:.82rem;line-height:1.7;font-family:var(--font-body);background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:10px 12px;resize:vertical; }
    .paste-textarea:focus { outline:none;border-color:var(--accent); }
  `],
  template: `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px;">Auto-populate from PDF</p>
          <p style="font-size:.75rem;color:var(--text-muted);">Upload a call notes PDF — sections will be filled automatically.</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span *ngIf="parsing" style="font-size:.75rem;color:var(--text-muted);">Parsing…</span>
          <span *ngIf="parseSuccess" style="font-size:.75rem;color:#3dca7e;">✓ {{ parsedCount }} sections populated</span>
          <button (click)="openPasteModal()"
            style="font-size:.75rem;font-weight:700;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:6px 14px;cursor:pointer;">
            ✎ Paste Text
          </button>
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:6px 14px;cursor:pointer;">
            <input type="file" accept=".pdf" style="display:none;" (change)="onPdfUpload($event)" />
            ↑ Upload PDF
          </label>
        </div>
      </div>
    </div>

    <!-- Paste text modal -->
    <div *ngIf="showPasteModal" class="paste-overlay" (click)="closePasteModal($event)">
      <div class="paste-modal">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <p style="font-size:.85rem;font-weight:700;color:var(--text);margin:0;">Paste Call Notes Text</p>
          <button (click)="showPasteModal=false" style="background:none;border:none;color:var(--text-muted);font-size:1.1rem;cursor:pointer;line-height:1;">✕</button>
        </div>
        <p style="font-size:.75rem;color:var(--text-muted);margin:0;">Paste the email or document text below. Sections will be detected and filled automatically.</p>
        <textarea class="paste-textarea" [(ngModel)]="pasteText" placeholder="Paste your call notes here…"></textarea>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button (click)="showPasteModal=false"
            style="font-size:.75rem;font-weight:600;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:7px 16px;cursor:pointer;">Cancel</button>
          <button (click)="applyPastedText()" [disabled]="!pasteText.trim()"
            style="font-size:.75rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 16px;cursor:pointer;"
            [style.opacity]="pasteText.trim() ? '1' : '0.4'">
            Populate Sections
          </button>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px;">
      <div *ngFor="let section of sections" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--border);">
          <span style="font-size:.78rem;font-weight:600;color:var(--text);">{{ section.label }}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span *ngIf="filled[section.key]" style="font-size:.65rem;color:#3dca7e;background:rgba(61,202,126,.1);border:1px solid rgba(61,202,126,.3);border-radius:4px;padding:2px 7px;font-weight:600;">✓ Filled</span>
            <span *ngIf="!filled[section.key]" style="font-size:.65rem;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:2px 7px;">Empty</span>
            <button (click)="saveSection(section.key)" [disabled]="savingKey === section.key"
              style="font-size:.65rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;padding:3px 10px;cursor:pointer;"
              [style.opacity]="savingKey === section.key ? '0.5' : '1'">
              {{ savingKey === section.key ? 'Saving…' : savedKey === section.key ? '✓ Saved' : 'Save' }}
            </button>
          </div>
        </div>
        <div style="padding:14px 18px;">
          <div class="toolbar">
            <button (mousedown)="fmt($event,'bold')"><b>B</b></button>
            <button (mousedown)="fmt($event,'italic')"><i>I</i></button>
            <button (mousedown)="fmt($event,'bullet')">• List</button>
          </div>
          <div class="editor" [id]="'editor-' + section.key" contenteditable="true"
            [attr.data-placeholder]="'Add notes for ' + section.label + '...'"
            (input)="onInput(section.key, $event)" (paste)="onPaste($event)" (keydown)="onKeydown($event)">
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CallNotesEditorComponent implements OnChanges {
  @Input() deckId = '';
  @Input() callNotes: Record<string, string> = {};

  sections = CALL_NOTE_SECTIONS;
  notes: Record<string, string> = {};
  filled: Record<string, boolean> = {};
  savingKey: string | null = null;
  savedKey: string | null = null;
  parsing = false;
  parseSuccess = false;
  parsedCount = 0;
  showPasteModal = false;
  pasteText = '';

  constructor(private deckService: DeckService) {}

  ngOnChanges() {
    CALL_NOTE_SECTIONS.forEach(s => {
      this.notes[s.key] = this.callNotes?.[s.key] ?? '';
      this.filled[s.key] = !!(this.callNotes?.[s.key]?.trim());
    });
    setTimeout(() => CALL_NOTE_SECTIONS.forEach(s => {
      const el = document.getElementById('editor-' + s.key);
      if (el) el.innerHTML = this.notes[s.key] || '';
    }), 50);
  }

  openPasteModal() { this.pasteText = ''; this.showPasteModal = true; }

  closePasteModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('paste-overlay')) this.showPasteModal = false;
  }

  applyPastedText() {
    if (!this.pasteText.trim()) return;
    const parsed = parseSectionsFromText(this.pasteText);
    this.parsedCount = 0;
    for (const [key, content] of Object.entries(parsed)) {
      if (content.trim()) {
        this.notes[key] = content.trim(); this.filled[key] = true; this.parsedCount++;
        const el = document.getElementById('editor-' + key);
        if (el) el.innerHTML = content.trim().replace(/\n/g, '<br>');
      }
    }
    this.showPasteModal = false;
    this.parseSuccess = true;
    if (this.parsedCount > 0) this.deckService.saveCallNotes(this.deckId, this.notes).subscribe();
    Swal.fire({ toast: true, position: 'top-end', icon: this.parsedCount > 0 ? 'success' : 'warning',
      title: this.parsedCount > 0 ? `${this.parsedCount} sections populated` : 'No sections detected — check headings match section names',
      showConfirmButton: false, timer: 3500, background: '#16181c', color: this.parsedCount > 0 ? '#3dca7e' : '#f0a500' });
  }

  async onPdfUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.parsing = true; this.parseSuccess = false;
    try {
      const parsed = parseSectionsFromText(await extractTextFromPdf(file));
      this.parsedCount = 0;
      for (const [key, content] of Object.entries(parsed)) {
        if (content.trim()) {
          this.notes[key] = content.trim(); this.filled[key] = true; this.parsedCount++;
          const el = document.getElementById('editor-' + key);
          if (el) el.innerHTML = content.trim().replace(/\n/g, '<br>');
        }
      }
      this.parsing = false; this.parseSuccess = true;
      if (this.parsedCount > 0) this.deckService.saveCallNotes(this.deckId, this.notes).subscribe();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${this.parsedCount} sections populated`, showConfirmButton: false, timer: 3000, background: '#16181c', color: '#3dca7e' });
    } catch {
      this.parsing = false;
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not parse PDF', showConfirmButton: false, timer: 3000, background: '#16181c', color: '#e05252' });
    }
    (event.target as HTMLInputElement).value = '';
  }

  onInput(key: string, event: Event) {
    const el = event.target as HTMLElement;
    this.notes[key] = el.innerHTML;
    this.filled[key] = !!el.innerText.trim();
  }

  saveSection(key: string) {
    if (!this.deckId || this.savingKey) return;
    const el = document.getElementById('editor-' + key);
    if (el) this.notes[key] = el.innerHTML;
    this.savingKey = key;
    this.deckService.saveCallNotes(this.deckId, { [key]: this.notes[key] }).subscribe({
      next: () => {
        this.savingKey = null; this.savedKey = key;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved', showConfirmButton: false, timer: 1500, background: '#16181c', color: '#3dca7e' });
        setTimeout(() => { if (this.savedKey === key) this.savedKey = null; }, 2500);
      },
      error: () => { this.savingKey = null; },
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const html = event.clipboardData?.getData('text/html') ?? '';
    const plain = event.clipboardData?.getData('text/plain') ?? '';
    if (html) {
      document.execCommand('insertHTML', false, this.sanitize(html));
    } else {
      const lines = plain.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      document.execCommand('insertHTML', false, lines.map(l => {
        const e = l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div>${e || '<br>'}</div>`;
      }).join(''));
    }
  }

  private sanitize(raw: string): string {
    return this.cvt(new DOMParser().parseFromString(raw, 'text/html').body, 0);
  }

  private cvt(node: Node, d: number): string {
    if (node.nodeType === Node.TEXT_NODE)
      return (node.textContent ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const el = node as HTMLElement; const tag = el.tagName?.toLowerCase();
    if (tag === 'ul' || tag === 'ol') return Array.from(el.childNodes).map(c => this.cvt(c, d + 1)).join('');
    if (tag === 'li') {
      const b = d <= 1 ? '\u2022' : '\u25e6'; const ind = d <= 1 ? '' : 'padding-left:20px;';
      let txt = '', nested = '';
      for (const c of Array.from(el.childNodes)) {
        const ct = (c as HTMLElement).tagName?.toLowerCase();
        if (ct === 'ul' || ct === 'ol') nested += this.cvt(c, d + 1);
        else if (ct === 'div' || ct === 'p') txt += (c as HTMLElement).innerText ?? (c as HTMLElement).textContent ?? '';
        else txt += this.cvt(c, d);
      }
      return `<div style="${ind}">${b} ${txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>${nested}`;
    }
    const ch = Array.from(el.childNodes).map(c => this.cvt(c, d)).join('');
    if (tag === 'p' || tag === 'div') return `<div>${ch || '<br>'}</div>`;
    if (tag === 'br') return '<br>';
    if (tag === 'b' || tag === 'strong') return `<b>${ch}</b>`;
    if (tag === 'i' || tag === 'em') return `<i>${ch}</i>`;
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return `<div><b>${ch}</b></div>`;
    return ch;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node) { if ((node as HTMLElement).contentEditable === 'true') break; node = node.parentNode; }
    if (!node) return;
    const el = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as HTMLElement;
    const cur = el.innerText ?? '';
    if (cur.startsWith('\u25e6 ')) { el.innerText = cur.slice(2); el.style.paddingLeft = ''; }
    else if (cur.startsWith('\u2022 ')) { el.innerText = '\u25e6 ' + cur.slice(2); el.style.paddingLeft = '20px'; }
    else { el.innerText = '\u2022 ' + cur; el.style.paddingLeft = ''; }
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    sel.removeAllRanges(); sel.addRange(r);
  }

  fmt(event: MouseEvent, cmd: string) {
    event.preventDefault();
    if (cmd === 'bullet') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const s = sel.getRangeAt(0).toString();
      document.execCommand('insertText', false, s ? s.split('\n').map(l => '\u2022 ' + l).join('\n') : '\u2022 ');
    } else { document.execCommand(cmd, false); }
  }
}
