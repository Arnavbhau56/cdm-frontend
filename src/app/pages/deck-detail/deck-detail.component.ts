// Deck detail: dark theme with accordion founder questions, inline edit/add/delete, and answer tracking.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckService, DeckDetail, Comment, FounderQuestion } from '../../core/deck.service';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, RouterLink, NavbarComponent, ResultCardComponent, LoaderComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="loading" message="Loading analysis..." />

      <div *ngIf="!loading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:32px;">
          <div>
            <h1 style="font-size:1.1rem;font-weight:700;letter-spacing:.04em;">{{ deck.startup_name }}</h1>
            <span *ngIf="deck.sector"
              style="display:inline-block;margin-top:6px;font-size:.7rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid #4f8ef7;border-radius:4px;padding:2px 7px;color:#4f8ef7;">
              {{ deck.sector }}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <a *ngIf="deck.pdf_url" [href]="deck.pdf_url" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:7px 14px;text-decoration:none;">
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
            style="font-size:.78rem;font-weight:500;padding:8px 18px;text-decoration:none;color:var(--text-muted);background:var(--surface);">
            Call Notes
          </a>
        </div>

        <!-- Founder Email -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 22px;margin-bottom:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Founder Email</span>
            <button *ngIf="!editingFounder" (click)="editingFounder = true"
              style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Edit</button>
            <div *ngIf="editingFounder" style="display:flex;gap:8px;">
              <button (click)="saveFounder()" [disabled]="savingFounder"
                style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.78rem;padding:3px 10px;cursor:pointer;">
                {{ savingFounder ? '…' : '✓ Save' }}
              </button>
              <button (click)="cancelEditFounder()"
                style="background:none;border:none;color:var(--text-muted);font-size:.78rem;cursor:pointer;">Cancel</button>
            </div>
          </div>
          <div *ngIf="!editingFounder">
            <a *ngIf="deck.founder_email" [href]="'mailto:' + deck.founder_email"
              style="font-size:.88rem;color:var(--accent);text-decoration:none;">{{ deck.founder_email }}</a>
            <p *ngIf="!deck.founder_email" style="font-size:.82rem;color:var(--text-muted);font-style:italic;">No email found — click Edit to add manually.</p>
          </div>
          <div *ngIf="editingFounder">
            <input [(ngModel)]="founderDraft.founder_email" type="email" placeholder="founder@startup.com" style="max-width:360px;" />
          </div>
        </div>

        <!-- Business Model -->
        <app-result-card title="Business & Revenue Model">
          <p style="font-size:.88rem;color:var(--text);line-height:1.75;">{{ deck.business_model }}</p>
        </app-result-card>

        <!-- Industry Context -->
        <div style="margin-top:24px;">
          <app-result-card title="Industry Context">
            <p style="font-size:.88rem;color:var(--text);line-height:1.75;">{{ deck.industry_context }}</p>
          </app-result-card>
        </div>

        <!-- Key Risks -->
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

        <!-- Founder Questions — Accordion -->
        <div style="margin-top:24px;">
          <app-result-card title="Founder Questions">

            <div style="display:flex;flex-direction:column;gap:8px;">

              <!-- Existing questions -->
              <div *ngFor="let q of editableQuestions; let i = index"
                style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;animation:slideIn .2s ease both;">

                <!-- Question row — entire row is clickable -->
                <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;"
                  (click)="toggleAccordion(i)">

                  <!-- Status badge -->
                  <span *ngIf="q.answer.trim()"
                    title="Answered"
                    style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(61,202,126,.15);border:1px solid rgba(61,202,126,.4);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#3dca7e;">✓</span>
                  <span *ngIf="!q.answer.trim()"
                    title="Not answered"
                    style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(240,192,64,.1);border:1px solid rgba(240,192,64,.3);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--accent);">?</span>

                  <!-- Question text / edit input -->
                  <div style="flex:1;min-width:0;">
                    <span *ngIf="editingQuestionIndex !== i"
                      style="font-size:.88rem;color:var(--text);line-height:1.6;">
                      {{ i + 1 }}. {{ q.question }}
                    </span>
                    <input *ngIf="editingQuestionIndex === i"
                      [(ngModel)]="q.question"
                      style="font-size:.85rem;padding:6px 10px;"
                      (click)="$event.stopPropagation()" />
                  </div>

                  <!-- Emailed badge -->
                  <span *ngIf="isEmailed(i)"
                    style="flex-shrink:0;font-size:.65rem;font-weight:600;color:#3dca7e;background:rgba(61,202,126,.1);border:1px solid rgba(61,202,126,.3);border-radius:4px;padding:2px 6px;">
                    ✓ Emailed
                  </span>

                  <!-- Action buttons -->
                  <div style="display:flex;gap:6px;flex-shrink:0;" (click)="$event.stopPropagation()">
                    <button *ngIf="editingQuestionIndex !== i" (click)="editingQuestionIndex = i"
                      style="background:none;border:none;color:var(--text-muted);font-size:.8rem;cursor:pointer;padding:2px 5px;border-radius:4px;"
                      title="Edit question">✎</button>
                    <button *ngIf="editingQuestionIndex === i" (click)="saveQuestions(); editingQuestionIndex = -1"
                      style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.75rem;padding:2px 8px;cursor:pointer;">✓</button>
                    <button (click)="removeQuestion(i)"
                      style="background:none;border:none;color:var(--text-muted);font-size:.9rem;cursor:pointer;padding:2px 5px;border-radius:4px;"
                      title="Delete question">×</button>
                  </div>

                  <!-- Chevron — always visible, part of the clickable row -->
                  <span style="color:var(--text-muted);font-size:.75rem;flex-shrink:0;">
                    {{ openAccordions.has(i) ? '▲' : '▼' }}
                  </span>
                </div>

                <!-- Answer panel -->
                <div *ngIf="openAccordions.has(i)"
                  style="border-top:1px solid var(--border);padding:12px 14px;background:var(--bg);">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <p style="font-size:.65rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Answer</p>
                  </div>
                  <textarea
                    [id]="'answer-' + i"
                    [(ngModel)]="q.answer"
                    placeholder="Write the answer here…"
                    rows="3"
                    style="resize:vertical;font-size:.85rem;margin-bottom:8px;"></textarea>
                  <button (click)="saveQuestions(i)"
                    style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:6px 14px;cursor:pointer;">
                    Save
                  </button>
                </div>
              </div>

              <!-- Add new question -->
              <div *ngIf="addingQuestion"
                style="background:var(--surface-2);border:1px solid var(--accent);border-radius:var(--radius);padding:12px 14px;display:flex;flex-direction:column;gap:8px;">
                <input [(ngModel)]="newQuestionText" placeholder="Enter new question…" style="font-size:.85rem;" />
                <div style="display:flex;gap:8px;">
                  <button (click)="confirmAddQuestion()"
                    style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:6px 14px;cursor:pointer;">
                    Add
                  </button>
                  <button (click)="addingQuestion = false; newQuestionText = ''"
                    style="background:none;border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;padding:6px 14px;cursor:pointer;">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
              <button (click)="addingQuestion = true"
                style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-muted);font-size:.75rem;font-weight:600;padding:7px 14px;cursor:pointer;">
                + Add Question
              </button>
              <button (click)="openEmailModal()"
                style="background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.75rem;font-weight:700;padding:7px 16px;cursor:pointer;">
                Email to Founder
              </button>
            </div>

          </app-result-card>
        </div>

        <!-- Team Notes -->
        <div style="margin-top:24px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;">
          <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:16px;">Team Notes</span>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            <p *ngIf="comments.length === 0" style="font-size:.82rem;color:var(--text-muted);">No notes yet.</p>
            <div *ngFor="let c of comments"
              style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div style="flex:1;min-width:0;">
                <p style="font-size:.85rem;color:var(--text);">{{ c.body }}</p>
                <p style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">{{ c.author_name }} · {{ c.created_at | date:'dd MMM yyyy, h:mm a' }}</p>
              </div>
              <button (click)="deleteComment(c.id)"
                style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:2px 5px;border-radius:4px;line-height:1;flex-shrink:0;">×</button>
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <textarea [(ngModel)]="newComment" placeholder="Add a note for the team…" rows="2" style="flex:1;resize:none;"></textarea>
            <button (click)="addComment()" [disabled]="!newComment.trim() || savingComment"
              style="align-self:flex-end;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:9px 14px;cursor:pointer;white-space:nowrap;"
              [style.opacity]="!newComment.trim() || savingComment ? '0.4' : '1'">
              {{ savingComment ? '…' : '+ Add Note' }}
            </button>
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
          <label *ngFor="let q of editableQuestions; let i = index"
            style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:.82rem;color:var(--text);line-height:1.5;">
            <input type="checkbox" [checked]="selectedIndices.has(i)" (change)="toggleQuestion(i)"
              style="margin-top:3px;accent-color:var(--accent);width:auto;flex-shrink:0;" />
            <span>{{ i + 1 }}. {{ q.question }}
              <span *ngIf="isEmailed(i)" style="margin-left:6px;font-size:.68rem;color:#3dca7e;">(emailed before)</span>
            </span>
          </label>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <button (click)="selectAll()" style="background:none;border:none;font-size:.75rem;color:var(--accent);cursor:pointer;">Select all</button>
          <span style="color:var(--border);">|</span>
          <button (click)="selectNone()" style="background:none;border:none;font-size:.75rem;color:var(--text-muted);cursor:pointer;">Clear</button>
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
export class DeckDetailComponent implements OnInit {
  deck: DeckDetail | null = null;
  comments: Comment[] = [];
  loading = true;
  newComment = '';
  savingComment = false;
  editingFounder = false;
  savingFounder = false;
  founderDraft = { founder_email: '' };

  // Questions
  editableQuestions: FounderQuestion[] = [];
  openAccordions = new Set<number>();
  editingQuestionIndex = -1;
  addingQuestion = false;
  newQuestionText = '';

  // Email modal
  showEmailModal = false;
  recipientEmail = '';
  selectedIndices = new Set<number>();
  sendingEmail = false;
  emailError = '';
  emailSuccess = false;

  constructor(private route: ActivatedRoute, private deckService: DeckService, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.editableQuestions = d.founder_questions.map(q => ({ ...q }));
        this.loading = false;
        this.loadComments();
      },
      error: () => (this.loading = false),
    });
  }

  isEmailed(i: number) { return !!this.deck?.emailed_questions?.includes(i); }

  toggleAccordion(i: number) {
    if (this.openAccordions.has(i)) this.openAccordions.delete(i);
    else this.openAccordions.add(i);
    this.openAccordions = new Set(this.openAccordions);
  }

  focusAnswer(i: number) {
    setTimeout(() => {
      const el = document.getElementById('answer-' + i) as HTMLTextAreaElement;
      if (el) el.focus();
    }, 50);
  }

  saveQuestions(index?: number) {
    if (!this.deck) return;
    // If called from a specific answer Save button, skip if that answer is empty
    if (index !== undefined && !this.editableQuestions[index]?.answer.trim()) return;
    this.deckService.saveQuestions(this.deck.id, this.editableQuestions).subscribe({
      next: res => {
        this.deck!.founder_questions = res.founder_questions;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Answer saved',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#16181c',
          color: '#3dca7e',
        });
      },
    });
  }

  removeQuestion(i: number) {
    this.editableQuestions.splice(i, 1);
    this.editableQuestions = [...this.editableQuestions];
    this.openAccordions.delete(i);
    this.saveQuestions();
  }

  confirmAddQuestion() {
    if (!this.newQuestionText.trim()) return;
    this.editableQuestions = [...this.editableQuestions, { question: this.newQuestionText.trim(), answer: '' }];
    this.newQuestionText = '';
    this.addingQuestion = false;
    this.saveQuestions();
  }

  // Founder contact
  saveFounder() {
    if (!this.deck) return;
    this.savingFounder = true;
    this.deckService.updateFounderContact(this.deck.id, this.founderDraft).subscribe({
      next: res => { this.deck!.founder_email = res.founder_email; this.editingFounder = false; this.savingFounder = false; },
      error: () => (this.savingFounder = false),
    });
  }

  cancelEditFounder() { this.editingFounder = false; }

  // Email modal
  openEmailModal() {
    if (!this.deck) return;
    this.recipientEmail = this.deck.founder_email || '';
    this.selectedIndices = new Set(this.editableQuestions.map((_, i) => i));
    this.emailError = '';
    this.emailSuccess = false;
    this.showEmailModal = true;
  }

  toggleQuestion(i: number) {
    if (this.selectedIndices.has(i)) this.selectedIndices.delete(i);
    else this.selectedIndices.add(i);
    this.selectedIndices = new Set(this.selectedIndices);
  }

  selectAll() { this.selectedIndices = new Set(this.editableQuestions.map((_, i) => i)); }
  selectNone() { this.selectedIndices = new Set(); }

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

  // Comments
  loadComments() {
    if (!this.deck) return;
    this.deckService.getComments(this.deck.id).subscribe({ next: c => (this.comments = c) });
  }

  addComment() {
    if (!this.deck || !this.newComment.trim()) return;
    this.savingComment = true;
    this.deckService.addComment(this.deck.id, this.newComment.trim()).subscribe({
      next: c => { this.comments = [...this.comments, c]; this.newComment = ''; this.savingComment = false; },
      error: () => (this.savingComment = false),
    });
  }

  deleteComment(id: string) {
    if (!this.deck) return;
    this.deckService.deleteComment(this.deck.id, id).subscribe({
      next: () => (this.comments = this.comments.filter(c => c.id !== id)),
    });
  }

  deleteDeck() {
    if (!this.deck) return;
    Swal.fire({
      title: `Delete "${this.deck.startup_name}"?`,
      text: 'This will permanently remove the deck and all its analysis.',
      icon: 'warning',
      background: '#16181c',
      color: '#e8eaf0',
      showCancelButton: true,
      confirmButtonColor: '#e05252',
      cancelButtonColor: '#2a2d35',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.deckService.deleteDeck(this.deck!.id).subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
    });
  }

  downloadReport() {
    if (!this.deck) return;
    const d = this.deck;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 48;
    const maxW = pageW - margin * 2;
    let y = 56;

    const addPage = () => { doc.addPage(); y = 56; };
    const checkY = (needed = 20) => { if (y + needed > 780) addPage(); };

    const writeWrapped = (text: string, fontSize: number, bold: boolean) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) { checkY(fontSize + 4); doc.text(line, margin, y); y += fontSize + 4; }
    };

    // Title
    writeWrapped('CDM Capital — VC Brief', 16, true);
    writeWrapped(d.startup_name + (d.sector ? '  |  ' + d.sector : ''), 11, false);
    y += 12;

    // Sections
    const sections: { title: string; body: () => void }[] = [
      { title: '1. Business & Revenue Model', body: () => writeWrapped(d.business_model || '—', 10, false) },
      { title: '2. Industry Context',         body: () => writeWrapped(d.industry_context || '—', 10, false) },
      {
        title: '3. Key Risks',
        body: () => d.key_risks.forEach((r, i) => writeWrapped(`${i + 1}.  ${r}`, 10, false)),
      },
      {
        title: '4. Founder Questions',
        body: () => this.editableQuestions.forEach((q, i) => {
          writeWrapped(`${i + 1}.  ${q.question}${this.isEmailed(i) ? '  [Emailed]' : ''}`, 10, true);
          if (q.answer?.trim()) { writeWrapped('    ' + q.answer, 10, false); }
          y += 6;
        }),
      },
    ];

    for (const s of sections) {
      checkY(30);
      doc.setDrawColor(60, 65, 80);
      doc.line(margin, y, pageW - margin, y);
      y += 14;
      writeWrapped(s.title, 11, true);
      y += 4;
      s.body();
      y += 16;
    }

    doc.save(`${d.startup_name} - CDM Report.pdf`);
  }
}
