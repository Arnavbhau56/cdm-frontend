// Deck detail shell: loads deck data and composes sub-components.
// Sub-components: FounderQuestionsComponent, TeamNotesComponent (in ./components/).

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FounderQuestionsComponent } from './components/founder-questions.component';
import { TeamNotesComponent } from './components/team-notes.component';
import { DeckService, DeckDetail, FounderQuestion } from '../../core/deck.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe, FormsModule, RouterLink, NavbarComponent, ResultCardComponent, LoaderComponent, FounderQuestionsComponent, TeamNotesComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading analysis..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.1rem;font-weight:700;letter-spacing:.04em;">{{ deck.startup_name }}</h1>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
              style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
              ↓ Download Deck
            </a>
            <button (click)="downloadReport()"
              style="font-size:.72rem;font-weight:700;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
              ↓ Download Report
            </button>
            <button (click)="deleteDeck()"
              style="font-size:.72rem;font-weight:700;color:#e05252;background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.3);border-radius:var(--radius);padding:7px 14px;cursor:pointer;">
              × Delete
            </button>
          </div>
        </div>

        <!-- Tab switcher -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
          <span style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">
            Deck Analysis
          </span>
          <a [routerLink]="['/deck', deck.id, 'call-notes']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Call Notes
          </a>
          <a [routerLink]="['/deck', deck.id, 'questions']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Questions
          </a>
          <a [routerLink]="['/deck', deck.id, 'intelligence']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);">
            Intelligence
          </a>
        </div>

        <!-- Unified company info panel -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;margin-bottom:24px;display:flex;flex-direction:column;gap:20px;">

          <!-- Row 1: registered name + date + status chip -->
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span *ngIf="deck.registered_name" style="font-size:.82rem;font-weight:600;color:var(--text);">{{ deck.registered_name }}</span>
            <span *ngIf="!deck.registered_name" style="font-size:.82rem;color:var(--text-muted);font-style:italic;">Registered name not found</span>
            <span style="color:var(--border);">·</span>
            <span style="font-size:.72rem;color:var(--text-muted);">{{ deck.created_at | date:'dd MMM yyyy' }}</span>
            <span style="color:var(--border);">·</span>
            <span [style.color]="deck.status === 'complete' ? '#3dca7e' : deck.status === 'failed' ? '#e05252' : '#f0c040'"
              [style.borderColor]="deck.status === 'complete' ? 'rgba(61,202,126,.35)' : deck.status === 'failed' ? 'rgba(224,82,82,.35)' : 'rgba(240,192,64,.35)'"
              style="font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:4px;border:1px solid;background:transparent;">
              {{ deck.status | titlecase }}
            </span>
          </div>

          <!-- Row 2: sector + sub-sector tags -->
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span *ngIf="deck.sector"
              style="font-size:.7rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;border:1px solid #4f8ef7;border-radius:4px;padding:2px 8px;color:#4f8ef7;">
              {{ deck.sector }}
            </span>
            <ng-container *ngIf="deck.sub_sector">
              <span *ngFor="let tag of deck.sub_sector.split(',')" 
                style="font-size:.7rem;font-weight:500;padding:2px 8px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">
                {{ tag.trim() }}
              </span>
            </ng-container>
          </div>

          <!-- Row 3: one-liner -->
          <p *ngIf="deck.one_liner" style="font-size:.88rem;color:var(--text);line-height:1.6;margin:0;">{{ deck.one_liner }}</p>

          <!-- Row 4: stats -->
          <div style="display:flex;gap:28px;flex-wrap:wrap;padding-top:4px;border-top:1px solid var(--border);">
            <div style="display:flex;flex-direction:column;gap:3px;">
              <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Documents</span>
              <span style="font-size:1.05rem;font-weight:700;color:var(--text);">{{ 1 + deck.materials.length }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Questions</span>
              <span style="font-size:1.05rem;font-weight:700;color:var(--text);">{{ deck.founder_questions.length }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Answered</span>
              <span style="font-size:1.05rem;font-weight:700;color:#3dca7e;">{{ answeredCount() }}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Key Risks</span>
              <span style="font-size:1.05rem;font-weight:700;color:#e05252;">{{ deck.key_risks.length }}</span>
            </div>
          </div>

          <!-- Row 5: uploaded files (only if any) -->
          <div *ngIf="deck.materials.length > 0" style="display:flex;flex-direction:column;gap:8px;">
            <span style="font-size:.6rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Uploaded Files</span>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <a *ngFor="let m of deck.materials" [href]="m.url" target="_blank" rel="noopener noreferrer"
                style="display:flex;align-items:center;gap:6px;font-size:.75rem;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;padding:4px 10px;text-decoration:none;white-space:nowrap;">
                <span>↗</span><span>{{ m.name }}</span>
              </a>
            </div>
          </div>

          <!-- Row 6: founder email -->
          <div style="padding-top:16px;border-top:1px solid var(--border);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:.6rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Founder Email</span>
              <button *ngIf="!editingFounder" (click)="editingFounder = true"
                style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Edit</button>
              <div *ngIf="editingFounder" style="display:flex;gap:8px;">
                <button (click)="saveFounder()" [disabled]="savingFounder"
                  style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.78rem;padding:3px 10px;cursor:pointer;">
                  {{ savingFounder ? '…' : '✓ Save' }}
                </button>
                <button (click)="editingFounder = false"
                  style="background:none;border:none;color:var(--text-muted);font-size:.78rem;cursor:pointer;">Cancel</button>
              </div>
            </div>
            <div *ngIf="!editingFounder">
              <a *ngIf="deck.founder_email" [href]="'mailto:' + deck.founder_email"
                style="font-size:.88rem;color:var(--accent);text-decoration:none;">{{ deck.founder_email }}</a>
              <p *ngIf="!deck.founder_email" style="font-size:.82rem;color:var(--text-muted);font-style:italic;margin:0;">No email found — click Edit to add manually.</p>
            </div>
            <div *ngIf="editingFounder">
              <input [(ngModel)]="founderEmail" type="email" placeholder="founder@startup.com" style="max-width:360px;" />
            </div>
          </div>

        </div>

        <!-- Analysis cards -->
        <div style="margin-top:32px;">
          <app-result-card title="Business & Revenue Model">
            <p style="font-size:.88rem;color:var(--text);line-height:1.75;">{{ deck.business_model }}</p>
          </app-result-card>
        </div>

        <div style="margin-top:24px;">
          <app-result-card title="Industry Context">
            <!-- Legacy fallback for old decks -->
            <div *ngIf="deck.industry_context?.legacy" style="display:flex;flex-direction:column;gap:16px;">
              <p style="font-size:.88rem;color:var(--text);line-height:1.8;white-space:pre-wrap;">{{ deck.industry_context.legacy }}</p>
            </div>
            <!-- Structured view for new decks -->
            <div *ngIf="!deck.industry_context?.legacy" style="display:flex;flex-direction:column;gap:0;">

              <!-- Text sections -->
              <ng-container *ngFor="let section of industryTextSections()">
                <div style="padding:18px 0;border-bottom:1px solid var(--border);">
                  <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:8px;">{{ section.label }}</p>
                  <p style="font-size:.88rem;color:var(--text);line-height:1.8;">{{ section.value }}</p>
                </div>
              </ng-container>

              <!-- Competitive Landscape -->
              <div *ngIf="competitiveLandscape()" style="padding:18px 0;border-bottom:1px solid var(--border);">
                <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">Competitive Landscape</p>
                <p *ngIf="competitiveLandscape()?.market_structure" style="font-size:.88rem;color:var(--text);line-height:1.8;margin-bottom:18px;">{{ competitiveLandscape()!.market_structure }}</p>

                <!-- India competitors -->
                <p style="font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Top Players — India</p>
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
                  <div *ngFor="let c of competitiveLandscape()!.competitors_india"
                    style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;">
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
                      <span style="font-size:.82rem;font-weight:700;color:var(--text);">{{ c.name }}</span>
                      <span style="font-size:.68rem;font-weight:600;padding:1px 7px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface);">{{ c.relevance }}</span>
                    </div>
                    <p style="font-size:.82rem;color:var(--text);line-height:1.6;margin-bottom:2px;">{{ c.description }}</p>
                    <p *ngIf="c.scale" style="font-size:.75rem;color:var(--text-muted);">{{ c.scale }}</p>
                  </div>
                </div>

                <!-- Global competitors -->
                <p style="font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Top Players — Global</p>
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
                  <div *ngFor="let c of competitiveLandscape()!.competitors_global"
                    style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;">
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
                      <span style="font-size:.82rem;font-weight:700;color:var(--text);">{{ c.name }}</span>
                      <span style="font-size:.68rem;font-weight:600;padding:1px 7px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface);">{{ c.relevance }}</span>
                    </div>
                    <p style="font-size:.82rem;color:var(--text);line-height:1.6;margin-bottom:2px;">{{ c.description }}</p>
                    <p *ngIf="c.scale" style="font-size:.75rem;color:var(--text-muted);">{{ c.scale }}</p>
                  </div>
                </div>

                <!-- Trends -->
                <p style="font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Key Trends</p>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div *ngFor="let t of competitiveLandscape()!.trends"
                    style="display:flex;gap:12px;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);">
                    <span style="flex-shrink:0;font-size:.72rem;font-weight:700;color:var(--accent);padding-top:2px;">&#x2192;</span>
                    <div>
                      <p style="font-size:.8rem;font-weight:700;color:var(--text);margin-bottom:3px;">{{ t.trend }}</p>
                      <p style="font-size:.82rem;color:var(--text-muted);line-height:1.65;">{{ t.detail }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Remaining text sections after competitive -->
              <ng-container *ngFor="let section of industryTailSections()">
                <div style="padding:18px 0;border-bottom:1px solid var(--border);">
                  <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:8px;">{{ section.label }}</p>
                  <p style="font-size:.88rem;color:var(--text);line-height:1.8;">{{ section.value }}</p>
                </div>
              </ng-container>

            </div>
          </app-result-card>
        </div>

        <div style="margin-top:24px;">
          <app-result-card title="Key Risks">
            <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
              <li *ngFor="let risk of deck.key_risks" style="display:flex;gap:10px;font-size:.88rem;color:var(--text);line-height:1.65;">
                <span style="color:#e05252;flex-shrink:0;margin-top:2px;">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </app-result-card>
        </div>

        <!-- Team Notes sub-component -->
        <div style="margin-top:24px;">
          <app-team-notes [deckId]="deck.id" />
        </div>

      </div>

      <div *ngIf="!loading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>

    <!-- Email Modal -->
    <div *ngIf="showEmailModal" style="position:fixed;inset:0;background:rgba(14,15,17,.85);display:flex;align-items:center;justify-content:center;z-index:40;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:100%;max-width:500px;margin:0 16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <span style="font-size:.72rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Email Founder Questions</span>
          <button (click)="closeEmailModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;line-height:1;">×</button>
        </div>
        <input type="email" [(ngModel)]="recipientEmail" placeholder="recipient@example.com" style="margin-bottom:16px;" />
        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Select Questions</p>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;margin-bottom:12px;padding-right:4px;">
          <label *ngFor="let q of questions; let i = index"
            style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:.82rem;color:var(--text);line-height:1.5;">
            <input type="checkbox" [checked]="selectedIndices.has(i)" (change)="toggleIndex(i)"
              style="margin-top:3px;accent-color:var(--accent);width:auto;flex-shrink:0;" />
            <span>{{ i + 1 }}. {{ q.question }}
              <span *ngIf="deck && deck.emailed_questions.includes(i)" style="margin-left:6px;font-size:.68rem;color:#3dca7e;">(emailed before)</span>
            </span>
          </label>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <button (click)="selectAll()" style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Select all</button>
          <span style="color:var(--border);">|</span>
          <button (click)="clearSelection()" style="background:none;border:none;font-size:.75rem;color:var(--text-muted);cursor:pointer;">Clear</button>
        </div>
        <p *ngIf="emailError" style="font-size:.78rem;color:#e05252;margin-bottom:10px;">{{ emailError }}</p>
        <p *ngIf="emailSuccess" style="font-size:.78rem;color:#3dca7e;margin-bottom:10px;">✓ Email sent successfully!</p>
        <button (click)="sendEmail()" [disabled]="sendingEmail || !recipientEmail || selectedIndices.size === 0"
          style="width:100%;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.78rem;font-weight:700;padding:11px;cursor:pointer;"
          [style.opacity]="sendingEmail || !recipientEmail || selectedIndices.size === 0 ? '0.4' : '1'">
          {{ sendingEmail ? 'Sending…' : 'Send ' + selectedIndices.size + ' Question' + (selectedIndices.size === 1 ? '' : 's') }}
        </button>
      </div>
    </div>
  `,
})
export class DeckDetailComponent implements OnInit, OnDestroy {
  deck: DeckDetail | null = null;
  questions: FounderQuestion[] = [];
  loading = true;
  editingFounder = false;
  savingFounder = false;
  founderEmail = '';
  showEmailModal = false;
  recipientEmail = '';
  selectedIndices = new Set<number>();
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;
  private pollTimer: any = null;

  constructor(private route: ActivatedRoute, private router: Router, private deckService: DeckService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.questions = d.founder_questions.map(q => ({ ...q }));
        this.founderEmail = d.founder_email;
        this.loading = false;
        // If still processing, poll until complete then auto-answer
        if (d.status === 'processing') {
          this.pollUntilComplete(id);
        }
      },
      error: () => (this.loading = false),
    });
  }

  ngOnDestroy() {
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  private pollUntilComplete(id: string) {
    this.pollTimer = setTimeout(() => {
      this.deckService.getDeck(id).subscribe({
        next: d => {
          this.deck = d;
          this.questions = d.founder_questions.map(q => ({ ...q }));
          if (d.status === 'processing') {
            this.pollUntilComplete(id);
          } else if (d.status === 'complete') {
            // Auto-run answer finding after fresh analysis
            this.deckService.autoAnswerQuestions(id).subscribe({
              next: res => {
                this.questions = res.founder_questions.map(q => ({ ...q }));
                if (this.deck) this.deck.founder_questions = res.founder_questions;
              },
            });
          }
        },
      });
    }, 4000);
  }

  answeredCount() {
    return this.questions.filter(q => q.answer?.trim()).length;
  }

  private readonly INDUSTRY_HEAD_KEYS = [
    { key: 'value_chain_position', label: 'Value Chain Position' },
    { key: 'market_size',          label: 'Market Size' },
    { key: 'market_timing',        label: 'Market Timing' },
  ] as const;

  private readonly INDUSTRY_TAIL_KEYS = [
    { key: 'unit_economics',    label: 'Unit Economics' },
    { key: 'regulatory',        label: 'Regulatory' },
    { key: 'failure_modes',     label: 'Failure Modes' },
    { key: 'winners_playbook',  label: "Winners' Playbook" },
  ] as const;

  industryTextSections() {
    const ic = this.deck?.industry_context as any;
    if (!ic) return [];
    return this.INDUSTRY_HEAD_KEYS.filter(m => ic[m.key]).map(m => ({ label: m.label, value: ic[m.key] as string }));
  }

  industryTailSections() {
    const ic = this.deck?.industry_context as any;
    if (!ic) return [];
    return this.INDUSTRY_TAIL_KEYS.filter(m => ic[m.key]).map(m => ({ label: m.label, value: ic[m.key] as string }));
  }

  competitiveLandscape() {
    const cl = (this.deck?.industry_context as any)?.competitive_landscape;
    if (!cl || typeof cl === 'string') return null;
    return cl as import('../../core/deck.service').CompetitiveLandscape;
  }

  onQuestionsChanged(updated: FounderQuestion[]) {
    if (this.deck) this.deck.founder_questions = updated;
    this.questions = updated.map(q => ({ ...q }));
  }

  saveFounder() {
    if (!this.deck) return;
    this.savingFounder = true;
    this.deckService.updateFounderContact(this.deck.id, { founder_email: this.founderEmail }).subscribe({
      next: res => { this.deck!.founder_email = res.founder_email; this.editingFounder = false; this.savingFounder = false; },
      error: () => (this.savingFounder = false),
    });
  }

  openEmailModal() {
    if (!this.deck) return;
    this.recipientEmail = this.deck.founder_email || '';
    this.selectedIndices = new Set(this.questions.map((_, i) => i));
    this.emailError = '';
    this.emailSuccess = false;
    this.showEmailModal = true;
  }

  toggleIndex(i: number) {
    if (this.selectedIndices.has(i)) this.selectedIndices.delete(i);
    else this.selectedIndices.add(i);
    this.selectedIndices = new Set(this.selectedIndices);
  }

  selectAll() { this.selectedIndices = new Set(this.questions.map((_, i) => i)); }
  clearSelection() { this.selectedIndices = new Set(); }

  sendEmail() {
    if (!this.deck || !this.recipientEmail || !this.selectedIndices.size) return;
    this.sendingEmail = true;
    this.emailError = '';
    this.deckService.emailQuestions(this.deck.id, this.recipientEmail, Array.from(this.selectedIndices)).subscribe({
      next: res => { this.deck!.emailed_questions = res.emailed_questions; this.emailSuccess = true; this.sendingEmail = false; setTimeout(() => this.closeEmailModal(), 2000); },
      error: err => { this.emailError = err.error?.error || 'Failed to send email.'; this.sendingEmail = false; },
    });
  }

  closeEmailModal() { this.showEmailModal = false; this.recipientEmail = ''; this.emailError = ''; this.emailSuccess = false; }

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
    const lines = [
      `CDM CAPITAL — VC BRIEF`, d.startup_name, '='.repeat(60), '',
      '1. BUSINESS & REVENUE MODEL', '-'.repeat(40), d.business_model, '',
      '2. INDUSTRY CONTEXT', '-'.repeat(40), d.industry_context, '',
      '3. KEY RISKS', '-'.repeat(40), ...d.key_risks.map((r, i) => `${i + 1}. ${r}`), '',
      '4. FOUNDER QUESTIONS', '-'.repeat(40),
      ...this.questions.map((q, i) => `${i + 1}. ${q.question}${d.emailed_questions.includes(i) ? ' [Emailed]' : ''}${q.answer ? '\n   Answer: ' + q.answer : ''}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${d.startup_name} — CDM Report.txt`; a.click();
    URL.revokeObjectURL(url);
  }
}
