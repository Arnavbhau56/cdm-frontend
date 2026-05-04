import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FounderQuestionsComponent } from '../deck-detail/components/founder-questions.component';
import { DeckService, DeckDetail, FounderQuestion } from '../../core/deck.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

const SECTOR_KEYWORDS: { label: string; keywords: string[] }[] = [
  { label: 'Business Model', keywords: ['revenue', 'monetis', 'business model', 'pricing', 'unit economics', 'margin', 'ltv', 'cac'] },
  { label: 'Market & GTM', keywords: ['market', 'gtm', 'go-to-market', 'channel', 'distribution', 'customer acquisition', 'tam', 'sam', 'som'] },
  { label: 'Product & Technology', keywords: ['product', 'tech', 'platform', 'feature', 'roadmap', 'ip', 'patent', 'moat', 'differenti'] },
  { label: 'Traction & Growth', keywords: ['traction', 'growth', 'mrr', 'arr', 'churn', 'retention', 'user', 'customer', 'metric'] },
  { label: 'Team & Founders', keywords: ['team', 'founder', 'hire', 'talent', 'experience', 'background', 'co-founder'] },
  { label: 'Financials & Fundraise', keywords: ['fund', 'raise', 'runway', 'burn', 'capital', 'valuation', 'financial', 'cash', 'invest'] },
  { label: 'Legal & Compliance', keywords: ['legal', 'regulat', 'compliance', 'license', 'contract', 'liability', 'risk'] },
];

function categorise(q: string): string {
  const lower = q.toLowerCase();
  for (const { label, keywords } of SECTOR_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return label;
  }
  return 'Other';
}

interface SectorGroup {
  label: string;
  questions: { q: FounderQuestion; originalIndex: number }[];
  flat: FounderQuestion[];
}

@Component({
  selector: 'app-questions-page',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, FormsModule, NavbarComponent, LoaderComponent, FounderQuestionsComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading questions..." />

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
          <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
            style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
            ↓ Download Deck
          </a>
        </div>

        <!-- Top tab nav -->
        <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;width:fit-content;margin-bottom:28px;">
          <a [routerLink]="['/deck', deck.id]"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Deck Analysis
          </a>
          <a [routerLink]="['/deck', deck.id, 'call-notes']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);border-right:1px solid var(--border);">
            Call Notes
          </a>
          <span style="font-size:.78rem;font-weight:600;padding:8px 18px;color:var(--accent);background:var(--accent-dim);cursor:default;border-right:1px solid var(--border);">
            Questions
          </span>
          <a [routerLink]="['/deck', deck.id, 'intelligence']"
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);">
            Intelligence
          </a>
        </div>

        <!-- Stats row -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 22px;margin-bottom:28px;display:flex;gap:28px;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;gap:3px;">
            <span style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Total</span>
            <span style="font-size:1.1rem;font-weight:700;color:var(--text);">{{ questions.length }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <span style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Answered</span>
            <span style="font-size:1.1rem;font-weight:700;color:#3dca7e;">{{ answeredCount() }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;">
            <span style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Sectors</span>
            <span style="font-size:1.1rem;font-weight:700;color:var(--text);">{{ groups.length }}</span>
          </div>
        </div>

        <!-- Sector groups -->
        <div *ngFor="let group of groups" style="margin-bottom:28px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text);">{{ group.label }}</span>
            <span style="font-size:.68rem;font-weight:600;padding:2px 8px;border-radius:4px;border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);">{{ group.questions.length }}</span>
          </div>
          <app-founder-questions
            [deckId]="deck.id"
            [questions]="group.flat"
            [emailedIndices]="groupEmailedIndices(group)"
            [hideActions]="true"
            (questionsChanged)="onGroupChanged(group, $event)"
            (emailModal)="openEmailModal()">
          </app-founder-questions>
        </div>

        <!-- Single action bar at the bottom -->
        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;align-items:center;padding-top:24px;border-top:1px solid var(--border);">
          <button (click)="addingGlobal = true"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;">
            + Add Question
          </button>
          <button (click)="openEmailModal()"
            style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:7px 16px;cursor:pointer;">
            Email to Founder
          </button>
          <button (click)="autoAnswer()" [disabled]="autoAnswering"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;display:flex;align-items:center;gap:6px;"
            [style.opacity]="autoAnswering ? '0.5' : '1'">
            <span>{{ autoAnswering ? 'Finding answers…' : '✦ Try to find answers' }}</span>
          </button>
          <button (click)="suggestOpen = true"
            style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;">
            ✦ Suggest Questions
          </button>
        </div>

        <!-- Add question inline -->
        <div *ngIf="addingGlobal"
          style="margin-top:12px;background:var(--surface-2);border:1px solid var(--accent);border-radius:var(--radius);padding:12px 14px;display:flex;flex-direction:column;gap:8px;">
          <input [(ngModel)]="newQuestionText" placeholder="Enter new question…" style="font-size:.85rem;" />
          <div style="display:flex;gap:8px;">
            <button (click)="confirmAddGlobal()"
              style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:6px 14px;cursor:pointer;">Add</button>
            <button (click)="addingGlobal = false; newQuestionText = ''"
              style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:6px 14px;cursor:pointer;">Cancel</button>
          </div>
        </div>

        <!-- Suggest Questions panel -->
        <div *ngIf="suggestOpen"
          style="margin-top:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">AI Question Suggestions</span>
            <button (click)="closeSuggest()" style="background:none;border:none;color:var(--text-muted);font-size:1.1rem;cursor:pointer;line-height:1;">×</button>
          </div>
          <div *ngIf="suggestions.length === 0 && !suggesting" style="display:flex;flex-direction:column;gap:10px;">
            <p style="font-size:.8rem;color:var(--text-muted);line-height:1.6;">Tell the model what angle to focus on — e.g. <em>"go deeper on GTM"</em>, <em>"probe the product moat"</em>.</p>
            <textarea [(ngModel)]="suggestPrompt" rows="3" placeholder="e.g. Dig deeper into product differentiation…" style="resize:vertical;font-size:.85rem;"></textarea>
            <div style="display:flex;gap:8px;">
              <button (click)="runSuggest()" [disabled]="!suggestPrompt.trim()"
                style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:8px 18px;cursor:pointer;"
                [style.opacity]="!suggestPrompt.trim() ? '0.4' : '1'">Generate</button>
              <button (click)="closeSuggest()"
                style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:8px 14px;cursor:pointer;">Cancel</button>
            </div>
          </div>
          <div *ngIf="suggesting" style="display:flex;align-items:center;gap:10px;padding:16px 0;color:var(--text-muted);font-size:.82rem;">
            <span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;"></span>
            Generating questions…
          </div>
          <div *ngIf="suggestions.length > 0 && !suggesting" style="display:flex;flex-direction:column;gap:0;">
            <p style="font-size:.72rem;color:var(--text-muted);margin-bottom:12px;">Accept or reject each suggestion.</p>
            <div *ngFor="let s of suggestions; let si = index"
              [style.opacity]="s.decided ? '0.45' : '1'"
              style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);transition:opacity .2s;">
              <div style="flex:1;min-width:0;">
                <p style="font-size:.86rem;color:var(--text);line-height:1.65;">{{ si + 1 }}. {{ s.text }}</p>
              </div>
              <div *ngIf="!s.decided" style="display:flex;gap:6px;flex-shrink:0;margin-top:2px;">
                <button (click)="acceptSuggestion(si)" style="background:rgba(61,202,126,.12);border:1px solid rgba(61,202,126,.4);border-radius:4px;color:#3dca7e;font-size:.72rem;font-weight:700;padding:4px 10px;cursor:pointer;">✓ Accept</button>
                <button (click)="rejectSuggestion(si)" style="background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.3);border-radius:4px;color:#e05252;font-size:.72rem;font-weight:700;padding:4px 10px;cursor:pointer;">✗ Reject</button>
              </div>
              <span *ngIf="s.decided && s.accepted" style="flex-shrink:0;font-size:.68rem;font-weight:600;color:#3dca7e;margin-top:4px;">Added ✓</span>
              <span *ngIf="s.decided && !s.accepted" style="flex-shrink:0;font-size:.68rem;color:var(--text-muted);margin-top:4px;">Rejected</span>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
              <button (click)="acceptAllSuggestions()" style="background:rgba(61,202,126,.12);border:1px solid rgba(61,202,126,.4);border-radius:var(--radius);color:#3dca7e;font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">Accept All</button>
              <button (click)="rejectAllSuggestions()" style="background:rgba(224,82,82,.08);border:1px solid rgba(224,82,82,.3);border-radius:var(--radius);color:#e05252;font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">Reject All</button>
              <button (click)="suggestPrompt = ''; suggestions = []" style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.72rem;padding:6px 14px;cursor:pointer;">Try Different Prompt</button>
              <button (click)="commitSuggestions()" [disabled]="!hasSuggestionAccepted()"
                style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:6px 16px;cursor:pointer;margin-left:auto;"
                [style.opacity]="!hasSuggestionAccepted() ? '0.4' : '1'">
                Save Accepted ({{ suggestionAcceptedCount() }})
              </button>
            </div>
          </div>
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
  styles: [`@keyframes spin { to { transform: rotate(360deg); } }`],
})
export class QuestionsPageComponent implements OnInit {
  deck: DeckDetail | null = null;
  questions: FounderQuestion[] = [];
  groups: SectorGroup[] = [];
  loading = true;

  addingGlobal = false;
  newQuestionText = '';
  autoAnswering = false;
  suggestOpen = false;
  suggestPrompt = '';
  suggesting = false;
  suggestions: { text: string; decided: boolean; accepted: boolean }[] = [];

  showEmailModal = false;
  recipientEmail = '';
  selectedIndices = new Set<number>();
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;

  constructor(private route: ActivatedRoute, private deckService: DeckService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.questions = d.founder_questions.map(q => ({ ...q }));
        this.buildGroups();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private buildGroups() {
    const map = new Map<string, { q: FounderQuestion; originalIndex: number }[]>();
    this.questions.forEach((q, i) => {
      const label = categorise(q.question);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push({ q, originalIndex: i });
    });
    this.groups = Array.from(map.entries()).map(([label, questions]) => ({ label, questions, flat: questions.map(x => x.q) }));
  }

  answeredCount() { return this.questions.filter(q => q.answer?.trim()).length; }

  confirmAddGlobal() {
    if (!this.newQuestionText.trim()) return;
    this.questions = [...this.questions, { question: this.newQuestionText.trim(), answer: '' }];
    this.newQuestionText = '';
    this.addingGlobal = false;
    this.deckService.saveQuestions(this.deck!.id, this.questions).subscribe({
      next: res => { this.questions = res.founder_questions.map(q => ({ ...q })); this.buildGroups(); },
    });
  }

  autoAnswer() {
    this.autoAnswering = true;
    this.deckService.autoAnswerQuestions(this.deck!.id).subscribe({
      next: res => {
        this.autoAnswering = false;
        this.questions = res.founder_questions.map(q => ({ ...q }));
        if (this.deck) this.deck.founder_questions = this.questions;
        this.buildGroups();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success',
          title: res.updated > 0 ? `${res.updated} answer${res.updated === 1 ? '' : 's'} found` : 'No new answers found',
          showConfirmButton: false, timer: 3500, timerProgressBar: true, background: '#16181c', color: res.updated > 0 ? '#3dca7e' : '#f0c040' });
      },
      error: () => { this.autoAnswering = false; },
    });
  }

  runSuggest() {
    if (!this.suggestPrompt.trim()) return;
    this.suggesting = true;
    this.suggestions = [];
    this.deckService.suggestQuestions(this.deck!.id, this.suggestPrompt.trim()).subscribe({
      next: res => { this.suggesting = false; this.suggestions = res.suggestions.map(s => ({ text: s, decided: false, accepted: false })); },
      error: () => { this.suggesting = false; },
    });
  }

  closeSuggest() { this.suggestOpen = false; this.suggestPrompt = ''; this.suggestions = []; }
  acceptSuggestion(i: number) { this.suggestions[i] = { ...this.suggestions[i], decided: true, accepted: true }; }
  rejectSuggestion(i: number) { this.suggestions[i] = { ...this.suggestions[i], decided: true, accepted: false }; }
  acceptAllSuggestions() { this.suggestions = this.suggestions.map(s => ({ ...s, decided: true, accepted: true })); }
  rejectAllSuggestions() { this.suggestions = this.suggestions.map(s => ({ ...s, decided: true, accepted: false })); }
  hasSuggestionAccepted() { return this.suggestions.some(s => s.accepted); }
  suggestionAcceptedCount() { return this.suggestions.filter(s => s.accepted).length; }

  commitSuggestions() {
    const toAdd = this.suggestions.filter(s => s.accepted).map(s => ({ question: s.text, answer: '' }));
    if (!toAdd.length) return;
    this.questions = [...this.questions, ...toAdd];
    this.deckService.saveQuestions(this.deck!.id, this.questions).subscribe({
      next: res => {
        this.questions = res.founder_questions.map(q => ({ ...q }));
        if (this.deck) this.deck.founder_questions = this.questions;
        this.buildGroups();
        this.closeSuggest();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${toAdd.length} question${toAdd.length === 1 ? '' : 's'} added`, showConfirmButton: false, timer: 2500, timerProgressBar: true, background: '#16181c', color: '#3dca7e' });
      },
    });
  }

  groupEmailedIndices(group: SectorGroup): number[] {
    if (!this.deck) return [];
    return group.questions
      .map((x, localIdx) => this.deck!.emailed_questions.includes(x.originalIndex) ? localIdx : -1)
      .filter(i => i !== -1);
  }

  onGroupChanged(group: SectorGroup, updated: FounderQuestion[]) {
    updated.forEach((q, localIdx) => {
      const orig = group.questions[localIdx];
      if (orig) {
        this.questions[orig.originalIndex] = q;
        orig.q = q;
      }
    });
    group.flat = group.questions.map(x => x.q);
    if (this.deck) this.deck.founder_questions = [...this.questions];
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
      next: res => {
        this.deck!.emailed_questions = res.emailed_questions;
        this.emailSuccess = true;
        this.sendingEmail = false;
        setTimeout(() => this.closeEmailModal(), 2000);
      },
      error: err => { this.emailError = err.error?.error || 'Failed to send email.'; this.sendingEmail = false; },
    });
  }

  closeEmailModal() { this.showEmailModal = false; this.recipientEmail = ''; this.emailError = ''; this.emailSuccess = false; }
}
