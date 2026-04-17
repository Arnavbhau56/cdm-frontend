// Call Notes page: rich-text editable sections with bold/italic/bullet toolbar.

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckDetail } from '../../core/deck.service';

interface Section { key: string; label: string; }

const SECTIONS: Section[] = [
  { key: 'overview',               label: 'Overview' },
  { key: 'problem',                label: 'Problem' },
  { key: 'solution',               label: 'Solution / Product' },
  { key: 'product_business_model', label: 'Product & Business Model' },
  { key: 'traction_metrics',       label: 'Traction & Metrics' },
  { key: 'founding_team',          label: 'Founding Team' },
  { key: 'competition',            label: 'Competition' },
  { key: 'roadmap_gtm',            label: 'Roadmap / GTM / Expansion' },
  { key: 'fundraise_history',      label: 'Fundraise History & Current Raise' },
];

@Component({
  selector: 'app-call-notes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, FormsModule, NavbarComponent, LoaderComponent, RouterLink],
  styles: [`
    .editor {
      min-height: 80px; width: 100%; box-sizing: border-box;
      font-size: .85rem; line-height: 1.7; font-family: var(--font-body);
      background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px;
      color: var(--text); padding: 10px 12px;
      outline: none; word-break: break-word;
    }
    .editor:focus { border-color: var(--accent); }
    .editor:empty:before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; }
    .editor div { min-height: 1.4em; }
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
      <app-loader *ngIf="loading" message="Loading call notes..." />

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
            <button (click)="downloadCallNotesPdf()"
              style="display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
              ↓ Download Call Notes
            </button>
            <a [routerLink]="['/deck', deck.id]"
              style="font-size:.72rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;text-decoration:none;cursor:pointer;">
              View Deck Analysis
            </a>
          </div>
        </div>

        <!-- Tab switcher -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
          <a [routerLink]="['/deck', deck.id]"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Deck Analysis
          </a>
          <span style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;">
            Call Notes
          </span>
        </div>

        <!-- Sections -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div *ngFor="let section of sections"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">

            <!-- Section header -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);">
              <span style="font-size:.78rem;font-weight:600;color:var(--text);letter-spacing:.02em;">{{ section.label }}</span>
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
                  style="font-size:.65rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;padding:3px 10px;cursor:pointer;transition:opacity .15s;"
                  [style.opacity]="savingKey === section.key ? '0.5' : '1'">
                  {{ savingKey === section.key ? 'Saving…' : savedKey === section.key ? '✓ Saved' : 'Save' }}
                </button>
              </div>
            </div>

            <!-- Toolbar + Editor -->
            <div style="padding:14px 18px;">
              <div class="toolbar">
                <button (mousedown)="fmt($event,'bold')" title="Bold"><b>B</b></button>
                <button (mousedown)="fmt($event,'italic')" title="Italic"><i>I</i></button>
                <button (mousedown)="fmt($event,'bullet')" title="Bullet list">• List</button>
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

      <div *ngIf="!loading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>
  `,
})
export class CallNotesComponent implements OnInit {
  deck: DeckDetail | null = null;
  loading = true;
  savingKey: string | null = null;
  savedKey: string | null = null;
  sections = SECTIONS;
  notes: Record<string, string> = {};
  // Separate stable boolean map — only updated explicitly, never during CD
  filled: Record<string, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.notes = {};
        this.filled = {};
        SECTIONS.forEach(s => {
          this.notes[s.key] = d.call_notes?.[s.key] ?? '';
          this.filled[s.key] = !!(d.call_notes?.[s.key]?.trim());
        });
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.populateEditors(), 50);
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); },
    });
  }

  private populateEditors() {
    SECTIONS.forEach(s => {
      const el = document.getElementById('editor-' + s.key);
      if (el) el.innerHTML = this.notes[s.key] || '';
    });
  }

  onInput(key: string, event: Event) {
    const el = event.target as HTMLElement;
    this.notes[key] = el.innerHTML;
    const hasText = !!el.innerText.trim();
    if (this.filled[key] !== hasText) {
      this.filled[key] = hasText;
      this.cdr.markForCheck();
    }
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'text/html');
    return this.convertNode(doc.body, 0);
  }

  private convertNode(node: Node, depth: number): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();

    if (tag === 'ul' || tag === 'ol') {
      return Array.from(el.childNodes).map(c => this.convertNode(c, depth + 1)).join('');
    }

    if (tag === 'li') {
      const bullet = depth <= 1 ? '\u2022' : '\u25e6';
      const indent = depth <= 1 ? '' : 'padding-left:20px;';
      let liText = '';
      let nestedLists = '';
      for (const child of Array.from(el.childNodes)) {
        const childTag = (child as HTMLElement).tagName?.toLowerCase();
        if (childTag === 'ul' || childTag === 'ol') {
          nestedLists += this.convertNode(child, depth + 1);
        } else if (childTag === 'div' || childTag === 'p') {
          // flatten block children to inline text
          liText += (child as HTMLElement).innerText ?? (child as HTMLElement).textContent ?? '';
        } else {
          liText += this.convertNode(child, depth);
        }
      }
      const escaped = liText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div style="${indent}">${bullet} ${escaped}</div>${nestedLists}`;
    }

    const children = Array.from(el.childNodes).map(c => this.convertNode(c, depth)).join('');

    if (tag === 'p' || tag === 'div') return `<div>${children || '<br>'}</div>`;
    if (tag === 'br') return '<br>';
    if (tag === 'b' || tag === 'strong') return `<b>${children}</b>`;
    if (tag === 'i' || tag === 'em') return `<i>${children}</i>`;
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return `<div><b>${children}</b></div>`;
    if (tag === 'body' || tag === 'span' || tag === 'font') return children;
    return children;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node) {
      const parent = node.parentElement;
      if (parent && parent.contentEditable === 'true') break;
      node = node.parentNode;
    }
    if (!node) return;
    const lineEl: HTMLElement = node.nodeType === Node.TEXT_NODE
      ? (node.parentElement as HTMLElement)
      : (node as HTMLElement);
    const cur = lineEl.innerText ?? '';
    let next: string;
    if (cur.startsWith('\u25e6 ')) {
      next = cur.slice(2);
      lineEl.style.paddingLeft = '';
    } else if (cur.startsWith('\u2022 ')) {
      next = '\u25e6 ' + cur.slice(2);
      lineEl.style.paddingLeft = '20px';
    } else {
      next = '\u2022 ' + cur;
      lineEl.style.paddingLeft = '';
    }
    lineEl.innerText = next;
    const newRange = document.createRange();
    newRange.selectNodeContents(lineEl);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  fmt(event: MouseEvent, cmd: string) {
    event.preventDefault();
    if (cmd === 'bullet') {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const selected = sel.getRangeAt(0).toString();
      if (selected) {
        const bulleted = selected.split('\n').map(l => '\u2022 ' + l).join('\n');
        document.execCommand('insertText', false, bulleted);
      } else {
        document.execCommand('insertText', false, '\u2022 ');
      }
    } else {
      document.execCommand(cmd, false);
    }
  }

  saveSection(key: string) {
    if (!this.deck || this.savingKey) return;
    const el = document.getElementById('editor-' + key);
    if (el) this.notes[key] = el.innerHTML;
    this.savingKey = key;
    this.cdr.markForCheck();
    this.deckService.saveCallNotes(this.deck.id, { [key]: this.notes[key] }).subscribe({
      next: () => {
        this.savingKey = null;
        this.savedKey = key;
        this.cdr.markForCheck();
        setTimeout(() => { if (this.savedKey === key) { this.savedKey = null; this.cdr.markForCheck(); } }, 2500);
      },
      error: () => { this.savingKey = null; this.cdr.markForCheck(); },
    });
  }

  downloadCallNotesPdf() {
    if (!this.deck) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 48;
    const maxW = pageW - margin * 2;
    let y = 56;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(this.deck.startup_name + ' — Call Notes', margin, y);
    y += 28;

    for (const section of SECTIONS) {
      const el = document.getElementById('editor-' + section.key);
      const text = (el ? el.innerText : this.notes[section.key] ?? '').trim();
      if (!text) continue;
      if (y > 760) { doc.addPage(); y = 56; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text(section.label.toUpperCase(), margin, y); y += 16;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        if (y > 780) { doc.addPage(); y = 56; }
        doc.text(line, margin, y); y += 15;
      }
      y += 14;
    }
    doc.save(`${this.deck.startup_name} - Call Notes.pdf`);
  }
}



