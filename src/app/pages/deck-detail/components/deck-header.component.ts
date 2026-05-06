import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { DeckService, DeckDetail, DeckMaterial, DeckNoteSummary, FounderQuestion } from '../../../core/deck.service';

export type ActiveTab = 'analysis' | 'call-notes' | 'questions' | 'intelligence';

@Component({
  selector: 'app-deck-header',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe, FormsModule, RouterLink],
  template: `
    <div *ngIf="deck">
      <!-- Title row -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
        <h1 style="font-size:1.6rem;font-weight:700;letter-spacing:.02em;">{{ deck.startup_name }}</h1>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
            style="font-size:.82rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
            ↓ Download Deck
          </a>
          <button (click)="downloadReport()"
            style="font-size:.82rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
            ↓ Download Report
          </button>
          <button (click)="openEmailModal()"
            style="font-size:.82rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
            ✉ Email to Founder
          </button>
          <button (click)="deleteDeck()"
            style="font-size:.82rem;font-weight:700;color:var(--text-muted);background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
            × Delete
          </button>
        </div>
      </div>

      <!-- Tab switcher -->
      <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
        <span *ngIf="active==='analysis'" style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">Deck Analysis</span>
        <a *ngIf="active!=='analysis'" [routerLink]="['/deck', deck.id]"
          style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">Deck Analysis</a>

        <span *ngIf="active==='call-notes'" style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">Call Notes</span>
        <a *ngIf="active!=='call-notes'" [routerLink]="['/deck', deck.id, 'call-notes']"
          style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">Call Notes</a>

        <span *ngIf="active==='questions'" style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">Questions</span>
        <a *ngIf="active!=='questions'" [routerLink]="['/deck', deck.id, 'questions']"
          style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">Questions</a>

        <span *ngIf="active==='intelligence'" style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;">Intelligence</span>
        <a *ngIf="active!=='intelligence'" [routerLink]="['/deck', deck.id, 'intelligence']"
          style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);">Intelligence</a>
      </div>

      <!-- Company info panel (analysis tab only) -->
      <ng-container *ngIf="active === 'analysis'">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;margin-bottom:28px;display:flex;flex-direction:column;gap:18px;">

        <!-- Registered name + website + date + status -->
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-size:1.5rem;font-weight:600;color:var(--text);">{{ deck.registered_name || deck.startup_name }}</span>
            <span style="color:var(--border);">·</span>
            <span style="font-size:.72rem;color:var(--text-muted);">{{ deck.created_at | date:'dd MMM yyyy' }}</span>
            <span style="color:var(--border);">·</span>
            <span style="font-size:.78rem;font-weight:600;padding:2px 8px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);">{{ deck.status | titlecase }}</span>
          </div>
          <a *ngIf="deck.website" [href]="deck.website" target="_blank" rel="noopener noreferrer"
            style="font-size:.78rem;color:var(--accent);text-decoration:none;">{{ deck.website }}</a>
        </div>

        <!-- Sector -->
        <div *ngIf="deck.sector" style="display:flex;align-items:center;gap:1px;">
          <!-- <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;min-width:76px;">Sector</span> -->
          <span style="font-size:.78rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;border:1px solid var(--border);border-radius:4px;padding:2px 8px;color:var(--text);">{{ deck.sector }}</span>
        </div>

        <!-- Sub-sector -->
        <div *ngIf="deck.sub_sector" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <!-- <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;min-width:76px;">Sub-Sector</span> -->
          <span *ngFor="let tag of deck.sub_sector.split(',')"
            style="font-size:.7rem;font-weight:500;padding:2px 8px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">{{ tag.trim() }}</span>
        </div>

        <!-- One-liner -->
        <p *ngIf="deck.one_liner" style="font-size:.88rem;color:var(--text);line-height:1.6;margin:0;">{{ deck.one_liner }}</p>

        <!-- Documents -->
        <div style="padding-top:12px;border-top:1px solid var(--border);">
          <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:8px;">Documents</span>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">1.</span>
              <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
                style="font-size:.78rem;color:var(--accent);text-decoration:none;">{{ deck.original_filename }}</a>
              <span *ngIf="!deck.pdf_url" style="font-size:.78rem;color:var(--text);">{{ deck.original_filename }}</span>
              <span style="font-size:.65rem;padding:1px 6px;border-radius:3px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">Pitch Deck</span>
            </div>
            <div *ngIf="hasCallNotes()" style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">{{ callNotesDocNum() }}.</span>
              <a [routerLink]="['/deck', deck.id, 'call-notes']" style="font-size:.78rem;color:var(--accent);text-decoration:none;">Call Notes</a>
              <span style="font-size:.65rem;padding:1px 6px;border-radius:3px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">Call Notes</span>
            </div>
            <ng-container *ngFor="let n of liveNotes; let ni = index">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">{{ notesDocNum(ni) }}.</span>
                <span style="font-size:.78rem;color:var(--text);">{{ n.title || kindLabel(n.kind) }}</span>
                <span style="font-size:.65rem;padding:1px 6px;border-radius:3px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">{{ kindLabel(n.kind) }}</span>
              </div>
            </ng-container>
            <ng-container *ngFor="let m of liveMaterials; let mi = index">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">{{ materialsDocNum(mi) }}.</span>
                <a [href]="m.url" target="_blank" rel="noopener noreferrer"
                  style="font-size:.78rem;color:var(--accent);text-decoration:none;">{{ m.name }}</a>
                <span style="font-size:.65rem;padding:1px 6px;border-radius:3px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">File</span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Questions & Answers -->
        <div style="padding-top:12px;border-top:1px solid var(--border);">
          <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:8px;">Questions & Answers</span>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:.6rem;color:var(--text-muted);">Total</span>
              <span style="font-size:1rem;font-weight:700;color:var(--text);">{{ deck.founder_questions.length }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:.6rem;color:var(--text-muted);">Answered</span>
              <span style="font-size:1rem;font-weight:700;color:#3dca7e;">{{ answeredCount() }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:.6rem;color:var(--text-muted);">Pending</span>
              <span style="font-size:1rem;font-weight:700;color:var(--text-muted);">{{ deck.founder_questions.length - answeredCount() }}</span>
            </div>
          </div>
        </div>

        <!-- Key Risks -->
        <div style="padding-top:12px;border-top:1px solid var(--border);">
          <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:6px;">Key Risks</span>
          <span style="font-size:1rem;font-weight:700;color:var(--text);">{{ deck.key_risks.length }}</span>
        </div>

        <!-- Founder Emails -->
        <div style="padding-top:12px;border-top:1px solid var(--border);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:.6rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Founder Email</span>
            <button *ngIf="!editingEmails" (click)="editingEmails=true"
              style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Edit</button>
            <div *ngIf="editingEmails" style="display:flex;gap:8px;">
              <button (click)="saveEmails()" [disabled]="savingEmails"
                style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.78rem;padding:3px 10px;cursor:pointer;">
                {{ savingEmails ? '…' : '✓ Save' }}
              </button>
              <button (click)="cancelEmails()"
                style="background:none;border:none;color:var(--text-muted);font-size:.78rem;cursor:pointer;">Cancel</button>
            </div>
          </div>

          <!-- View mode -->
          <div *ngIf="!editingEmails" style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">1.</span>
              <a *ngIf="deck.founder_email_1 && deck.founder_email_1 !== 'N/A'" [href]="'mailto:' + deck.founder_email_1"
                style="font-size:.85rem;color:var(--accent);text-decoration:none;">{{ deck.founder_email_1 }}</a>
              <span *ngIf="!deck.founder_email_1 || deck.founder_email_1 === 'N/A'"
                style="font-size:.85rem;color:var(--text-muted);font-style:italic;">N/A</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">2.</span>
              <a *ngIf="deck.founder_email_2 && deck.founder_email_2 !== 'N/A'" [href]="'mailto:' + deck.founder_email_2"
                style="font-size:.85rem;color:var(--accent);text-decoration:none;">{{ deck.founder_email_2 }}</a>
              <span *ngIf="!deck.founder_email_2 || deck.founder_email_2 === 'N/A'"
                style="font-size:.85rem;color:var(--text-muted);font-style:italic;">N/A</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">3.</span>
              <a *ngIf="deck.founder_email_3 && deck.founder_email_3 !== 'N/A'" [href]="'mailto:' + deck.founder_email_3"
                style="font-size:.85rem;color:var(--accent);text-decoration:none;">{{ deck.founder_email_3 }}</a>
              <span *ngIf="!deck.founder_email_3 || deck.founder_email_3 === 'N/A'"
                style="font-size:.85rem;color:var(--text-muted);font-style:italic;">N/A</span>
            </div>
          </div>

          <!-- Edit mode — 3 individual inputs -->
          <div *ngIf="editingEmails" style="display:flex;flex-direction:column;gap:8px;max-width:360px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">1.</span>
              <input [(ngModel)]="editEmail1" type="text" placeholder="email or N/A" style="flex:1;font-size:.85rem;" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">2.</span>
              <input [(ngModel)]="editEmail2" type="text" placeholder="email or N/A" style="flex:1;font-size:.85rem;" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:.72rem;color:var(--text-muted);min-width:18px;">3.</span>
              <input [(ngModel)]="editEmail3" type="text" placeholder="email or N/A" style="flex:1;font-size:.85rem;" />
            </div>
          </div>
        </div>

      </div>
      </ng-container>
    </div>

    <!-- Email Modal -->
    <div *ngIf="showEmailModal" style="position:fixed;inset:0;background:rgba(14,15,17,.9);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:100%;max-width:680px;margin:0 16px;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <span style="font-size:.72rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Email to Founder</span>
          <button (click)="closeEmailModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;line-height:1;">×</button>
        </div>

        <!-- Template Selection -->
        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Select Template</p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          <label *ngFor="let t of emailTemplates" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);">
            <input type="radio" [value]="t.id" [(ngModel)]="selectedTemplate" (change)="loadTemplate(t.id)"
              style="accent-color:var(--accent);width:auto;flex-shrink:0;" />
            <div style="flex:1;">
              <span style="font-size:.85rem;font-weight:600;color:var(--text);display:block;">{{ t.name }}</span>
              <span style="font-size:.75rem;color:var(--text-muted);">{{ t.description }}</span>
            </div>
          </label>
        </div>

        <!-- Recipient Selection -->
        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Send To</p>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
          <ng-container *ngFor="let email of founderEmails()">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.85rem;color:var(--text);">
              <input type="checkbox" [checked]="selectedRecipients.has(email)" (change)="toggleRecipient(email)"
                style="accent-color:var(--accent);width:auto;flex-shrink:0;" />
              {{ email }}
            </label>
          </ng-container>
          <p *ngIf="founderEmails().length === 0" style="font-size:.82rem;color:var(--text-muted);font-style:italic;">No founder emails saved.</p>
        </div>

        <!-- Email Body -->
        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Email Body</p>
        <textarea [(ngModel)]="emailBody" rows="12" placeholder="Edit email content..."
          style="resize:vertical;font-size:.85rem;margin-bottom:16px;font-family:monospace;line-height:1.6;"></textarea>

        <p *ngIf="emailError" style="font-size:.85rem;color:#e05252;margin-bottom:10px;">{{ emailError }}</p>
        <p *ngIf="emailSuccess" style="font-size:.85rem;color:#3dca7e;margin-bottom:10px;">✓ Email sent successfully!</p>
        <button (click)="sendCustomEmail()" [disabled]="sendingEmail || selectedRecipients.size === 0 || !emailBody.trim()"
          style="width:100%;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.88rem;font-weight:700;padding:11px;cursor:pointer;"
          [style.opacity]="sendingEmail || selectedRecipients.size === 0 || !emailBody.trim() ? '0.4' : '1'">
          {{ sendingEmail ? 'Sending…' : 'Send Email to ' + selectedRecipients.size + ' Recipient' + (selectedRecipients.size === 1 ? '' : 's') }}
        </button>
      </div>
    </div>
  `,
})
export class DeckHeaderComponent implements OnChanges, OnInit {
  @Input() deck: DeckDetail | null = null;
  @Input() active: ActiveTab = 'analysis';
  @Input() questions: FounderQuestion[] = [];
  @Output() deckChanged = new EventEmitter<DeckDetail>();

  editingEmails = false;
  savingEmails = false;
  editEmail1 = '';
  editEmail2 = '';
  editEmail3 = '';
  liveNotes: DeckNoteSummary[] = [];
  liveMaterials: DeckMaterial[] = [];

  showEmailModal = false;
  selectedRecipients = new Set<string>();
  selectedTemplate = 'info_request';
  emailBody = '';
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;

  emailTemplates = [
    { id: 'info_request', name: 'Information Request', description: 'Request specific documents or data points' },
    { id: 'time_request', name: 'Time Request', description: 'Ask for more time to review internally' },
    { id: 'pass', name: 'Generic Pass', description: 'Politely decline the opportunity' },
    { id: 'custom', name: 'Custom', description: 'Write your own email from scratch' },
  ];


  constructor(private deckService: DeckService, private router: Router) {}

  ngOnInit() { this.refreshDocs(); }

  ngOnChanges() {
    if (this.deck) {
      this.editEmail1 = this.deck.founder_email_1 || '';
      this.editEmail2 = this.deck.founder_email_2 || '';
      this.editEmail3 = this.deck.founder_email_3 || '';
      this.refreshDocs();
    }
  }

  private refreshDocs() {
    if (!this.deck) return;
    this.deckService.getNotes(this.deck.id).subscribe({ next: notes => this.liveNotes = notes.map(n => ({ id: n.id, kind: n.kind, title: n.title, created_at: n.created_at })) });
    this.deckService.getMaterials(this.deck.id).subscribe({ next: m => this.liveMaterials = m });
  }

  hasCallNotes(): boolean {
    return Object.values(this.deck?.call_notes ?? {}).some(v => v?.trim());
  }

  callNotesDocNum(): number { return 2; }
  notesDocNum(ni: number): number { return (this.hasCallNotes() ? 3 : 2) + ni; }
  materialsDocNum(mi: number): number { return (this.hasCallNotes() ? 3 : 2) + this.liveNotes.length + mi; }

  kindLabel(kind: string): string {
    const map: Record<string, string> = { general: 'General Note', mis: 'MIS / Financials', whatsapp: 'WhatsApp / Chat', call: 'Call Note' };
    return map[kind] ?? kind;
  }

  answeredCount(): number {
    return (this.deck?.founder_questions ?? []).filter(q => q.answer?.trim()).length;
  }

  saveEmails() {
    if (!this.deck) return;
    this.savingEmails = true;
    this.deckService.updateFounderContact(this.deck.id, {
      founder_email_1: this.editEmail1.trim() || 'N/A',
      founder_email_2: this.editEmail2.trim() || 'N/A',
      founder_email_3: this.editEmail3.trim() || 'N/A',
    }).subscribe({
      next: res => {
        this.deck!.founder_email_1 = res.founder_email_1;
        this.deck!.founder_email_2 = res.founder_email_2;
        this.deck!.founder_email_3 = res.founder_email_3;
        this.deckChanged.emit(this.deck!);
        this.editingEmails = false;
        this.savingEmails = false;
      },
      error: () => (this.savingEmails = false),
    });
  }

  cancelEmails() {
    this.editEmail1 = this.deck?.founder_email_1 || '';
    this.editEmail2 = this.deck?.founder_email_2 || '';
    this.editEmail3 = this.deck?.founder_email_3 || '';
    this.editingEmails = false;
  }

  deleteDeck() {
    if (!this.deck) return;
    Swal.fire({
      title: `Delete "${this.deck.startup_name}"?`, text: 'This cannot be undone.',
      icon: 'warning', background: '#16181c', color: '#e8eaf0',
      showCancelButton: true, confirmButtonColor: '#e05252', cancelButtonColor: '#2a2d35',
      confirmButtonText: 'Yes, delete', cancelButtonText: 'Cancel',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.deckService.deleteDeck(this.deck!.id).subscribe({ next: () => this.router.navigate(['/dashboard']) });
    });
  }

  downloadReport() {
    if (!this.deck) return;
    const d = this.deck;
    const qs = this.questions.length ? this.questions : d.founder_questions;
    const lines = [
      `CDM CAPITAL — VC BRIEF`, d.startup_name, '='.repeat(60), '',
      '1. BUSINESS & REVENUE MODEL', '-'.repeat(40), d.business_model, '',
      '2. INDUSTRY CONTEXT', '-'.repeat(40), JSON.stringify(d.industry_context, null, 2), '',
      '3. KEY RISKS', '-'.repeat(40), ...d.key_risks.map((r, i) => `${i + 1}. ${r}`), '',
      '4. FOUNDER QUESTIONS', '-'.repeat(40),
      ...qs.map((q, i) => `${i + 1}. ${q.question}${d.emailed_questions.includes(i) ? ' [Emailed]' : ''}${q.answer ? '\n   Answer: ' + q.answer : ''}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${d.startup_name} — CDM Report.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  founderEmails(): string[] {
    if (!this.deck) return [];
    return [this.deck.founder_email_1, this.deck.founder_email_2, this.deck.founder_email_3]
      .filter(e => e && e !== 'N/A');
  }

  openEmailModal() {
    if (!this.deck) return;
    this.selectedRecipients = new Set(this.founderEmails());
    this.selectedTemplate = 'info_request';
    this.loadTemplate('info_request');
    this.emailError = '';
    this.emailSuccess = false;
    this.showEmailModal = true;
  }

  closeEmailModal() {
    this.showEmailModal = false;
    this.selectedRecipients = new Set();
    this.emailBody = '';
    this.emailError = '';
    this.emailSuccess = false;
  }

  toggleRecipient(email: string) {
    if (this.selectedRecipients.has(email)) this.selectedRecipients.delete(email);
    else this.selectedRecipients.add(email);
    this.selectedRecipients = new Set(this.selectedRecipients);
  }

  loadTemplate(templateId: string) {
    const templates: Record<string, string> = {
      info_request: `Hi [Founder Name],\n\nThanks for taking the time to connect. It was great learning about the business and your background.\n\nWe'd like to understand a few aspects in more detail and would appreciate it if you could share the below requested documents/data points:\n\n[Specific data ask 1]\n[Specific data ask 2]\n[Specific data ask 3]\n\nHappy to take a deeper look once we have this.\n\nBest,`,
      time_request: `Hi [Founder Name],\n\nApologies for the delay in response, and we appreciate your patience.\n\nKindly allow us some more time to discuss this opportunity internally, and we will be better placed to share feedback.\n\nWill revert shortly once we've aligned on our end.\n\nBest,`,
      pass: `Hi [Founder Name],\n\nWe spent some time discussing internally and have decided to pass on the opportunity at this point. While we appreciate what you're building, we would not be able to pursue further right now.\n\nWe wish you and the team the very best for your future endeavors!\n\nBest,`,
      custom: '',
    };
    this.emailBody = templates[templateId] || '';
  }

  sendCustomEmail() {
    if (!this.deck || !this.selectedRecipients.size || !this.emailBody.trim()) return;
    this.sendingEmail = true;
    this.emailError = '';
    
    const payload = {
      recipients: Array.from(this.selectedRecipients),
      body: this.emailBody.trim(),
      startup_name: this.deck.startup_name,
    };

    this.deckService.sendCustomEmail(this.deck.id, payload).subscribe({
      next: () => {
        this.emailSuccess = true;
        this.sendingEmail = false;
        setTimeout(() => this.closeEmailModal(), 2000);
      },
      error: err => {
        this.emailError = err?.error?.error || 'Failed to send email.';
        this.sendingEmail = false;
      },
    });
  }
}
