// Call Notes page: editable sections + other materials tab.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckDetail, DeckMaterial } from '../../core/deck.service';
import { CALL_NOTE_SECTIONS } from '../../shared/call-note-sections';
import { extractTextFromPdf, parseSectionsFromText } from '../../shared/pdf-parser.util';

@Component({
  selector: 'app-call-notes',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, NavbarComponent, LoaderComponent, RouterLink],
  styles: [`
    .editor {
      min-height: 80px; width: 100%; box-sizing: border-box;
      font-size: .85rem; line-height: 1.7; font-family: var(--font-body);
      background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px;
      color: var(--text); padding: 10px 12px; outline: none; word-break: break-word;
    }
    .editor:focus { border-color: var(--accent); }
    .editor:empty:before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; }
    .toolbar { display: flex; gap: 4px; margin-bottom: 8px; }
    .toolbar button {
      background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
      color: var(--text-muted); font-size: .75rem; padding: 3px 8px; cursor: pointer;
      line-height: 1.4; transition: color .1s, border-color .1s;
    }
    .toolbar button:hover { color: var(--accent); border-color: var(--accent); }
  `],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.1rem;font-weight:700;letter-spacing:.04em;">{{ deck.startup_name }}</h1>
            <span *ngIf="deck.sector"
              style="display:inline-block;margin-top:6px;font-size:.7rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid #4f8ef7;border-radius:4px;padding:2px 7px;color:#4f8ef7;">
              {{ deck.sector }}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
              style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
              ↓ Download Deck
            </a>
            <a [routerLink]="['/deck', deck.id]"
              style="font-size:.72rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
              View Deck Analysis
            </a>
          </div>
        </div>

        <!-- Top tab switcher: Deck Analysis | Call Notes -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
          <a [routerLink]="['/deck', deck.id]"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Deck Analysis
          </a>
          <span style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;">
            Call Notes
          </span>
        </div>

        <!-- Sub-tab switcher: Notes | Other Materials -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:24px;">
          <button (click)="activeTab='notes'"
            [style.color]="activeTab==='notes' ? 'var(--accent)' : 'var(--text-muted)'"
            [style.background]="activeTab==='notes' ? 'var(--accent-dim)' : 'var(--surface)'"
            style="font-size:.75rem;font-weight:600;padding:7px 16px;border:none;border-right:1px solid var(--border);cursor:pointer;">
            Notes
          </button>
          <button (click)="activeTab='materials'"
            [style.color]="activeTab==='materials' ? 'var(--accent)' : 'var(--text-muted)'"
            [style.background]="activeTab==='materials' ? 'var(--accent-dim)' : 'var(--surface)'"
            style="font-size:.75rem;font-weight:600;padding:7px 16px;border:none;cursor:pointer;">
            Other Materials
          </button>
        </div>

        <!-- ── NOTES TAB ── -->
        <div *ngIf="activeTab === 'notes'">

          <!-- Auto-populate from PDF -->
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:24px;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
              <div>
                <p style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px;">Auto-populate from PDF</p>
                <p style="font-size:.75rem;color:var(--text-muted);">Upload a call notes PDF with section headings — fields will be filled automatically.</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span *ngIf="parsing" style="font-size:.75rem;color:var(--text-muted);">Parsing PDF…</span>
                <span *ngIf="parseSuccess" style="font-size:.75rem;color:#3dca7e;">✓ {{ parsedCount }} sections populated</span>
                <label style="display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
                  <input type="file" accept=".pdf" style="display:none;" (change)="onPdfUpload($event)" />
                  ↑ Upload PDF
                </label>
              </div>
            </div>
          </div>

          <!-- Sections -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div *ngFor="let section of sections"
              style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">

              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);">
                <span style="font-size:.78rem;font-weight:600;color:var(--text);">{{ section.label }}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span *ngIf="filled[section.key]"
                    style="font-size:.65rem;color:#3dca7e;background:rgba(61,202,126,.1);border:1px solid rgba(61,202,126,.3);border-radius:4px;padding:2px 7px;font-weight:600;">
                    ✓ Filled
                  </span>
                  <span *ngIf="!filled[section.key]"
                    style="font-size:.65rem;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:2px 7px;">
                    Empty
                  </span>
                  <button (click)="saveSection(section.key)" [disabled]="savingKey === section.key"
                    style="font-size:.65rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;padding:3px 10px;cursor:pointer;"
                    [style.opacity]="savingKey === section.key ? '0.5' : '1'">
                    {{ savingKey === section.key ? 'Saving…' : savedKey === section.key ? '✓ Saved' : 'Save' }}
                  </button>
                </div>
              </div>

              <div style="padding:14px 18px;">
                <div class="toolbar">
                  <button (mousedown)="fmt($event,'bold')" title="Bold"><b>B</b></button>
                  <button (mousedown)="fmt($event,'italic')" title="Italic"><i>I</i></button>
                  <button (mousedown)="fmt($event,'bullet')" title="Bullet">• List</button>
                </div>
                <div
                  class="editor"
                  [id]="'editor-' + section.key"
                  contenteditable="true"
                  [attr.data-placeholder]="'Add notes for ' + section.label + '...'"
                  (input)="onInput(section.key, $event)"
                  (paste)="onPaste($event)"
                  (keydown)="onKeydown($event)">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── OTHER MATERIALS TAB ── -->
        <div *ngIf="activeTab === 'materials'">

          <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:24px;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
              <div>
                <p style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px;">Upload Material</p>
                <p style="font-size:.75rem;color:var(--text-muted);">Financials, pitch notes, term sheets, or any other file.</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span *ngIf="uploadingMaterial" style="font-size:.75rem;color:var(--text-muted);">Uploading…</span>
                <label style="display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
                  <input type="file" style="display:none;" (change)="onMaterialUpload($event)" />
                  ↑ Upload File
                </label>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">
            <div *ngIf="materials.length === 0"
              style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;text-align:center;color:var(--text-muted);font-size:.85rem;">
              No materials uploaded yet.
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
                <button (click)="deleteMaterial(m.id)"
                  style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:2px 5px;border-radius:4px;line-height:1;">×</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div *ngIf="!loading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>
  `,
})
export class CallNotesComponent implements OnInit {
  deck: DeckDetail | null = null;
  loading = true;
  activeTab: 'notes' | 'materials' = 'notes';

  savingKey: string | null = null;
  savedKey: string | null = null;
  sections = CALL_NOTE_SECTIONS;
  notes: Record<string, string> = {};
  filled: Record<string, boolean> = {};

  parsing = false;
  parseSuccess = false;
  parsedCount = 0;

  materials: DeckMaterial[] = [];
  uploadingMaterial = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        CALL_NOTE_SECTIONS.forEach(s => {
          this.notes[s.key] = d.call_notes?.[s.key] ?? '';
          this.filled[s.key] = !!(d.call_notes?.[s.key]?.trim());
        });
        this.loading = false;
        setTimeout(() => this.populateEditors(), 50);
      },
      error: () => { this.loading = false; },
    });
    this.loadMaterials();
  }

  loadMaterials() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getMaterials(id).subscribe({
      next: m => { this.materials = m; },
    });
  }

  private populateEditors() {
    CALL_NOTE_SECTIONS.forEach(s => {
      const el = document.getElementById('editor-' + s.key);
      if (el) el.innerHTML = this.notes[s.key] || '';
    });
  }

  async onPdfUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    console.log('[PDF upload] file selected:', file.name);
    this.parsing = true;
    this.parseSuccess = false;
    try {
      const text = await extractTextFromPdf(file);
      const parsed = parseSectionsFromText(text);
      console.log('[PDF upload] parsed keys:', Object.keys(parsed));
      this.parsedCount = 0;
      for (const [key, content] of Object.entries(parsed)) {
        if (content.trim()) {
          this.notes[key] = content.trim();
          this.filled[key] = true;
          this.parsedCount++;
          const el = document.getElementById('editor-' + key);
          if (el) el.innerHTML = content.trim().replace(/\n/g, '<br>');
        }
      }
      this.parsing = false;
      this.parseSuccess = true;
      if (this.deck && this.parsedCount > 0) {
        this.deckService.saveCallNotes(this.deck.id, this.notes).subscribe();
      }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${this.parsedCount} sections populated`, showConfirmButton: false, timer: 3000, timerProgressBar: true, background: '#16181c', color: '#3dca7e' });
    } catch (e) {
      console.error('[PDF upload] error:', e);
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

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const html = event.clipboardData?.getData('text/html') ?? '';
    const plain = event.clipboardData?.getData('text/plain') ?? '';
    if (html) {
      document.execCommand('insertHTML', false, this.sanitizePastedHtml(html));
    } else {
      const lines = plain.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const fallback = lines.map(l => {
        const esc = l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div>${esc || '<br>'}</div>`;
      }).join('');
      document.execCommand('insertHTML', false, fallback);
    }
  }

  private sanitizePastedHtml(raw: string): string {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    return this.convertNode(doc.body, 0);
  }

  private convertNode(node: Node, depth: number): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'ul' || tag === 'ol') return Array.from(el.childNodes).map(c => this.convertNode(c, depth + 1)).join('');
    if (tag === 'li') {
      const bullet = depth <= 1 ? '\u2022' : '\u25e6';
      const indent = depth <= 1 ? '' : 'padding-left:20px;';
      let liText = '', nestedLists = '';
      for (const child of Array.from(el.childNodes)) {
        const ct = (child as HTMLElement).tagName?.toLowerCase();
        if (ct === 'ul' || ct === 'ol') nestedLists += this.convertNode(child, depth + 1);
        else if (ct === 'div' || ct === 'p') liText += (child as HTMLElement).innerText ?? (child as HTMLElement).textContent ?? '';
        else liText += this.convertNode(child, depth);
      }
      const esc = liText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div style="${indent}">${bullet} ${esc}</div>${nestedLists}`;
    }
    const children = Array.from(el.childNodes).map(c => this.convertNode(c, depth)).join('');
    if (tag === 'p' || tag === 'div') return `<div>${children || '<br>'}</div>`;
    if (tag === 'br') return '<br>';
    if (tag === 'b' || tag === 'strong') return `<b>${children}</b>`;
    if (tag === 'i' || tag === 'em') return `<i>${children}</i>`;
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return `<div><b>${children}</b></div>`;
    return children;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node) {
      if (node.parentElement?.contentEditable === 'true') break;
      node = node.parentNode;
    }
    if (!node) return;
    const lineEl = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as HTMLElement;
    const cur = lineEl.innerText ?? '';
    if (cur.startsWith('\u25e6 ')) { lineEl.innerText = cur.slice(2); lineEl.style.paddingLeft = ''; }
    else if (cur.startsWith('\u2022 ')) { lineEl.innerText = '\u25e6 ' + cur.slice(2); lineEl.style.paddingLeft = '20px'; }
    else { lineEl.innerText = '\u2022 ' + cur; lineEl.style.paddingLeft = ''; }
    const r = document.createRange();
    r.selectNodeContents(lineEl); r.collapse(false);
    sel.removeAllRanges(); sel.addRange(r);
  }

  fmt(event: MouseEvent, cmd: string) {
    event.preventDefault();
    if (cmd === 'bullet') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const selected = sel.getRangeAt(0).toString();
      document.execCommand('insertText', false, selected ? selected.split('\n').map(l => '\u2022 ' + l).join('\n') : '\u2022 ');
    } else {
      document.execCommand(cmd, false);
    }
  }

  saveSection(key: string) {
    if (!this.deck || this.savingKey) return;
    const el = document.getElementById('editor-' + key);
    if (el) this.notes[key] = el.innerHTML;
    this.savingKey = key;
    this.deckService.saveCallNotes(this.deck.id, { [key]: this.notes[key] }).subscribe({
      next: () => {
        this.savingKey = null; this.savedKey = key;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved', showConfirmButton: false, timer: 1500, timerProgressBar: true, background: '#16181c', color: '#3dca7e' });
        setTimeout(() => { if (this.savedKey === key) this.savedKey = null; }, 2500);
      },
      error: () => { this.savingKey = null; },
    });
  }

  onMaterialUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.deck) return;
    this.uploadingMaterial = true;
    this.deckService.uploadMaterial(this.deck.id, file).subscribe({
      next: m => {
        this.materials = [m, ...this.materials]; this.uploadingMaterial = false;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File uploaded', showConfirmButton: false, timer: 2000, background: '#16181c', color: '#3dca7e' });
      },
      error: () => { this.uploadingMaterial = false; },
    });
    (event.target as HTMLInputElement).value = '';
  }

  deleteMaterial(id: string) {
    if (!this.deck) return;
    this.deckService.deleteMaterial(this.deck.id, id).subscribe({
      next: () => { this.materials = this.materials.filter(m => m.id !== id); },
    });
  }
}
