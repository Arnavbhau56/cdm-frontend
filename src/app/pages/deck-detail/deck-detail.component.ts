// Deck detail shell: loads deck data and composes sub-components.

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FounderQuestionsComponent } from './components/founder-questions.component';
import { DeckHeaderComponent } from './components/deck-header.component';
import { DeckService, DeckDetail, FounderQuestion } from '../../core/deck.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe, FormsModule, RouterLink, NavbarComponent, ResultCardComponent, LoaderComponent, FounderQuestionsComponent, DeckHeaderComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading analysis..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <app-deck-header [deck]="deck" active="analysis" [questions]="questions" (deckChanged)="deck = $event" />

        <!-- Analysis cards -->
        <div style="margin-top:8px;">
          <app-result-card title="Business & Revenue Model">
            <p style="font-size:.88rem;color:var(--text);line-height:1.75;">{{ deck.business_model }}</p>
          </app-result-card>
        </div>

        <div style="margin-top:24px;">
          <app-result-card title="Industry Context">
            <div *ngIf="deck.industry_context?.legacy" style="display:flex;flex-direction:column;gap:16px;">
              <p style="font-size:.88rem;color:var(--text);line-height:1.8;white-space:pre-wrap;">{{ deck.industry_context.legacy }}</p>
            </div>
            <div *ngIf="!deck.industry_context?.legacy" style="display:flex;flex-direction:column;gap:0;">
              <ng-container *ngFor="let section of industryTextSections()">
                <div style="padding:18px 0;border-bottom:1px solid var(--border);">
                  <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:8px;">{{ section.label }}</p>
                  <p style="font-size:.88rem;color:var(--text);line-height:1.8;">{{ section.value }}</p>
                </div>
              </ng-container>
              <div *ngIf="competitiveLandscape()" style="padding:18px 0;border-bottom:1px solid var(--border);">
                <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">Competitive Landscape</p>
                <p *ngIf="competitiveLandscape()?.market_structure" style="font-size:.88rem;color:var(--text);line-height:1.8;margin-bottom:18px;">{{ competitiveLandscape()!.market_structure }}</p>
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
                <span style="color:var(--text-muted);flex-shrink:0;margin-top:2px;">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </app-result-card>
        </div>


      </div>

      <div *ngIf="!loading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>

    <!-- Email Modal -->
    <div *ngIf="showEmailModal" style="position:fixed;inset:0;background:rgba(14,15,17,.85);display:flex;align-items:center;justify-content:center;z-index:40;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:100%;max-width:520px;margin:0 16px;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <span style="font-size:.72rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Send Questions to Founder</span>
          <button (click)="closeEmailModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;line-height:1;">×</button>
        </div>

        <!-- Founder recipient selection -->
        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Send To</p>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
          <ng-container *ngFor="let email of founderEmails()">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.85rem;color:var(--text);">
              <input type="checkbox" [checked]="selectedRecipients.has(email)" (change)="toggleRecipient(email)"
                style="accent-color:var(--accent);width:auto;flex-shrink:0;" />
              {{ email }}
            </label>
          </ng-container>
          <p *ngIf="founderEmails().length === 0" style="font-size:.82rem;color:var(--text-muted);font-style:italic;">No founder emails saved. Add them in the deck header.</p>
        </div>

        <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Select Questions</p>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;margin-bottom:12px;padding-right:4px;">
          <label *ngFor="let q of questions; let i = index"
            style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:.82rem;color:var(--text);line-height:1.5;">
            <input type="checkbox" [checked]="selectedIndices.has(i)" (change)="toggleIndex(i)"
              style="margin-top:3px;accent-color:var(--accent);width:auto;flex-shrink:0;" />
            <span>{{ i + 1 }}. {{ q.question }}
              <span *ngIf="deck && deck.emailed_questions.includes(i)" style="margin-left:6px;font-size:.75rem;color:var(--text-muted);">(emailed before)</span>
            </span>
          </label>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <button (click)="selectAll()" style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Select all</button>
          <span style="color:var(--border);">|</span>
          <button (click)="clearSelection()" style="background:none;border:none;font-size:.75rem;color:var(--text-muted);cursor:pointer;">Clear</button>
        </div>
        <p *ngIf="emailError" style="font-size:.85rem;color:#e05252;margin-bottom:10px;">{{ emailError }}</p>
        <p *ngIf="emailSuccess" style="font-size:.85rem;color:#3dca7e;margin-bottom:10px;">✓ Email sent successfully!</p>
        <button (click)="sendEmail()" [disabled]="sendingEmail || selectedRecipients.size === 0 || selectedIndices.size === 0"
          style="width:100%;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.88rem;font-weight:700;padding:11px;cursor:pointer;"
          [style.opacity]="sendingEmail || selectedRecipients.size === 0 || selectedIndices.size === 0 ? '0.4' : '1'">
          {{ sendingEmail ? 'Sending…' : 'Send ' + selectedIndices.size + ' Question' + (selectedIndices.size === 1 ? '' : 's') + ' to ' + selectedRecipients.size + ' Recipient' + (selectedRecipients.size === 1 ? '' : 's') }}
        </button>
      </div>
    </div>
  `,
})
export class DeckDetailComponent implements OnInit, OnDestroy {
  deck: DeckDetail | null = null;
  questions: FounderQuestion[] = [];
  loading = true;
  showEmailModal = false;
  selectedRecipients = new Set<string>();
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
        this.loading = false;
        if (d.status === 'processing') this.pollUntilComplete(id);
      },
      error: () => (this.loading = false),
    });
  }

  ngOnDestroy() { if (this.pollTimer) clearTimeout(this.pollTimer); }

  private pollUntilComplete(id: string) {
    this.pollTimer = setTimeout(() => {
      this.deckService.getDeck(id).subscribe({
        next: d => {
          this.deck = d;
          this.questions = d.founder_questions.map(q => ({ ...q }));
          if (d.status === 'processing') {
            this.pollUntilComplete(id);
          } else if (d.status === 'complete') {
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

  answeredCount() { return this.questions.filter(q => q.answer?.trim()).length; }

  private readonly INDUSTRY_HEAD_KEYS = [
    { key: 'value_chain_position', label: 'Value Chain Position' },
    { key: 'market_size',          label: 'Market Size' },
    { key: 'market_timing',        label: 'Market Timing' },
  ] as const;

  private readonly INDUSTRY_TAIL_KEYS = [
    { key: 'unit_economics',   label: 'Unit Economics' },
    { key: 'regulatory',       label: 'Regulatory' },
    { key: 'failure_modes',    label: 'Failure Modes' },
    { key: 'winners_playbook', label: "Winners' Playbook" },
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

  founderEmails(): string[] {
    if (!this.deck) return [];
    return [this.deck.founder_email_1, this.deck.founder_email_2, this.deck.founder_email_3]
      .filter(e => e && e !== 'N/A');
  }

  openEmailModal() {
    if (!this.deck) return;
    this.selectedRecipients = new Set(this.founderEmails());
    this.selectedIndices = new Set(this.questions.map((_, i) => i));
    this.emailError = '';
    this.emailSuccess = false;
    this.showEmailModal = true;
  }

  toggleRecipient(email: string) {
    if (this.selectedRecipients.has(email)) this.selectedRecipients.delete(email);
    else this.selectedRecipients.add(email);
    this.selectedRecipients = new Set(this.selectedRecipients);
  }

  toggleIndex(i: number) {
    if (this.selectedIndices.has(i)) this.selectedIndices.delete(i);
    else this.selectedIndices.add(i);
    this.selectedIndices = new Set(this.selectedIndices);
  }

  selectAll() { this.selectedIndices = new Set(this.questions.map((_, i) => i)); }
  clearSelection() { this.selectedIndices = new Set(); }

  sendEmail() {
    if (!this.deck || !this.selectedRecipients.size || !this.selectedIndices.size) return;
    this.sendingEmail = true;
    this.emailError = '';
    const indices = Array.from(this.selectedIndices);
    const sends = Array.from(this.selectedRecipients).map(email =>
      this.deckService.emailQuestions(this.deck!.id, email, indices).toPromise()
    );
    Promise.all(sends).then(results => {
      const last = results[results.length - 1];
      if (last) this.deck!.emailed_questions = last.emailed_questions;
      this.emailSuccess = true;
      this.sendingEmail = false;
      setTimeout(() => this.closeEmailModal(), 2000);
    }).catch(err => {
      this.emailError = err?.error?.error || 'Failed to send email.';
      this.sendingEmail = false;
    });
  }

  closeEmailModal() { this.showEmailModal = false; this.selectedRecipients = new Set(); this.emailError = ''; this.emailSuccess = false; }
}
