import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { DeckHeaderComponent } from '../deck-detail/components/deck-header.component';
import { DeckService, DeckDetail, DealInsight, Comment } from '../../core/deck.service';

const SCORE_STYLE: Record<string, string> = {
  'Strong':   'color:#3dca7e;border-color:rgba(61,202,126,.4);background:rgba(61,202,126,.08)',
  'Promising':'color:#4f8ef7;border-color:rgba(79,142,247,.4);background:rgba(79,142,247,.08)',
  'Early':    'color:#f0c040;border-color:rgba(240,192,64,.4);background:rgba(240,192,64,.08)',
  'Weak':     'color:#e05252;border-color:rgba(224,82,82,.4);background:rgba(224,82,82,.08)',
  'Unclear':  'color:var(--text-muted);border-color:var(--border);background:var(--surface-2)',
};

const STAGE_STYLE: Record<string, string> = {
  'Pre-Idea':     'color:#e05252;border-color:rgba(224,82,82,.4)',
  'Pre-Product':  'color:#e05252;border-color:rgba(224,82,82,.4)',
  'Pre-Revenue':  'color:#f0c040;border-color:rgba(240,192,64,.4)',
  'Early Revenue':'color:#4f8ef7;border-color:rgba(79,142,247,.4)',
  'Growth':       'color:#3dca7e;border-color:rgba(61,202,126,.4)',
  'Scaling':      'color:#a78bfa;border-color:rgba(167,139,250,.4)',
};

const REC_STYLE: Record<string, string> = {
  'Pass':         'color:#e05252;border-color:rgba(224,82,82,.4);background:rgba(224,82,82,.08)',
  'Watch':        'color:#f0c040;border-color:rgba(240,192,64,.4);background:rgba(240,192,64,.08)',
  'Soft Interest':'color:#4f8ef7;border-color:rgba(79,142,247,.4);background:rgba(79,142,247,.08)',
  'Take Meeting': 'color:#3dca7e;border-color:rgba(61,202,126,.4);background:rgba(61,202,126,.08)',
  'Fast Track':   'color:#a78bfa;border-color:rgba(167,139,250,.4);background:rgba(167,139,250,.08)',
};

@Component({
  selector: 'app-intelligence-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink, FormsModule, NavbarComponent, LoaderComponent, DeckHeaderComponent],
  template: `
    <div style="min-height:100vh;background:var(--bg);">
      <app-navbar />
      <app-loader *ngIf="deckLoading" message="Loading..." />

      <div *ngIf="!deckLoading && deck" style="max-width:88vw;margin:0 auto;padding:36px 24px 64px;">

        <app-deck-header [deck]="deck" active="intelligence" (deckChanged)="deck = $event" />

        <!-- Team Notes -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;margin-bottom:24px;">
          <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:12px;">Team Notes</span>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
            <p *ngIf="comments.length === 0" style="font-size:.82rem;color:var(--text-muted);">No notes yet.</p>
            <div *ngFor="let c of comments"
              style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div style="flex:1;min-width:0;">
                <p style="font-size:.85rem;color:var(--text);">{{ c.body }}</p>
                <p style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">{{ c.author_name }} · {{ c.created_at | date:'dd MMM yyyy, h:mm a' }}</p>
              </div>
              <button (click)="deleteComment(c.id)" style="background:none;border:none;color:var(--text-muted);font-size:1rem;cursor:pointer;padding:2px 5px;border-radius:4px;line-height:1;flex-shrink:0;">×</button>
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <textarea [(ngModel)]="newNote" placeholder="Add a note for the team…" rows="2" style="flex:1;resize:none;"></textarea>
            <button (click)="addComment()" [disabled]="!newNote.trim() || savingNote"
              style="align-self:flex-end;background:var(--accent);color:#0e0f11;border:none;border-radius:var(--radius);font-size:.72rem;font-weight:700;padding:9px 14px;cursor:pointer;white-space:nowrap;"
              [style.opacity]="!newNote.trim() || savingNote ? '0.4' : '1'">
              {{ savingNote ? '…' : '+ Add Note' }}
            </button>
          </div>
        </div>

        <!-- Generate button -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button (click)="generate()" [disabled]="loading"
            style="font-size:.78rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:8px 20px;cursor:pointer;"
            [style.opacity]="loading ? '0.5' : '1'">
            {{ loading ? 'Analysing\u2026' : insight ? '\u21ba Refresh Intelligence' : '\u2726 Generate Deal Intelligence' }}
          </button>
          <div *ngIf="loading" style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:.8rem;">
            <span style="display:inline-block;width:13px;height:13px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;"></span>
            Synthesising all context\u2026
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!insight && !loading"
          style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:40px 32px;text-align:center;">
          <p style="font-size:.88rem;color:var(--text-muted);line-height:1.7;max-width:520px;margin:0 auto;">
            Generate a full AI-synthesised deal brief \u2014 founder assessment, TAM, problem quality, unit economics, stage, overall score out of 100, and a recommendation \u2014 synthesised from the deck, call notes, and all uploaded materials.
          </p>
        </div>

        <div *ngIf="insight && !loading" style="display:flex;flex-direction:column;gap:20px;">

          <!-- Verdict + Score -->
          <div style="display:grid;grid-template-columns:1fr 220px;gap:16px;">

            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;">
              <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">One-Line Verdict</p>
              <p style="font-size:1rem;color:var(--text);line-height:1.65;font-style:italic;">"{{ insight.one_line_verdict }}"</p>
            </div>

            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px;display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);">Overall Score</p>
                <button *ngIf="!editingScore" (click)="startScoreEdit()"
                  style="background:none;border:none;font-size:.72rem;color:var(--accent);cursor:pointer;">Edit</button>
                <div *ngIf="editingScore" style="display:flex;gap:6px;">
                  <button (click)="saveScoreEdit()"
                    style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:4px;color:var(--accent);font-size:.72rem;padding:2px 8px;cursor:pointer;">\u2713</button>
                  <button (click)="cancelScoreEdit()"
                    style="background:none;border:none;color:var(--text-muted);font-size:.72rem;cursor:pointer;">\u2715</button>
                </div>
              </div>
              <div style="display:flex;align-items:baseline;gap:6px;">
                <span *ngIf="!editingScore" [style.color]="scoreColor()" style="font-size:2.6rem;font-weight:800;line-height:1;">{{ displayScore }}</span>
                <input *ngIf="editingScore" [(ngModel)]="editScoreValue" type="number" min="0" max="100"
                  style="width:68px;font-size:1.8rem;font-weight:800;text-align:center;padding:4px 6px;" />
                <span style="font-size:.82rem;color:var(--text-muted);">/ 100</span>
              </div>
              <div style="height:5px;background:var(--surface-2);border-radius:3px;overflow:hidden;">
                <div [style.width]="displayScore + '%'" [style.background]="scoreColor()"
                  style="height:100%;border-radius:3px;transition:width .4s;"></div>
              </div>
              <p style="font-size:.72rem;color:var(--text-muted);line-height:1.55;">{{ insight.score_rationale }}</p>
            </div>
          </div>

          <!-- Stage + Recommendation -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 22px;">
              <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Stage</p>
              <span [style]="stageStyle()" style="font-size:.82rem;font-weight:700;border:1px solid;border-radius:6px;padding:5px 14px;display:inline-block;margin-bottom:10px;">
                {{ insight.stage_label }}
              </span>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
                <li *ngFor="let point of parsePoints(insight.stage_rationale)" style="display:flex;gap:8px;font-size:.82rem;color:var(--text-muted);line-height:1.6;">
                  <span style="color:var(--accent);flex-shrink:0;margin-top:2px;">•</span>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 22px;">
              <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Recommendation</p>
              <span [style]="recStyle()" style="font-size:.82rem;font-weight:700;border:1px solid;border-radius:6px;padding:5px 14px;display:inline-block;margin-bottom:10px;">
                {{ insight.recommendation }}
              </span>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
                <li *ngFor="let point of parsePoints(insight.recommendation_rationale)" style="display:flex;gap:8px;font-size:.82rem;color:var(--text-muted);line-height:1.6;">
                  <span style="color:var(--accent);flex-shrink:0;margin-top:2px;">•</span>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Dimension ratings -->
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;">
            <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px;">Dimension Ratings</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
              <div *ngFor="let r of insight.ratings"
                style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:.75rem;font-weight:700;color:var(--text);">{{ r.dimension }}</span>
                  <span [style]="dimScoreStyle(r.score)" style="font-size:.65rem;font-weight:700;border:1px solid;border-radius:4px;padding:2px 8px;">{{ r.score }}</span>
                </div>
                <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
                  <li *ngFor="let point of parsePoints(r.rationale)" style="display:flex;gap:8px;font-size:.8rem;color:var(--text-muted);line-height:1.6;">
                    <span style="color:var(--accent);flex-shrink:0;margin-top:2px;">•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div *ngIf="insight.key_metrics.length > 0" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;">
            <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;">Key Metrics</p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <div *ngFor="let m of insight.key_metrics"
                style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;display:flex;flex-direction:column;gap:3px;">
                <span style="font-size:.6rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">{{ m.label }}</span>
                <span style="font-size:1rem;font-weight:700;color:var(--text);">{{ m.value }}</span>
              </div>
            </div>
          </div>

          <!-- Comparables -->
          <div *ngIf="insight.comparables.length > 0" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;">
            <p style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;">Comparable Companies</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div *ngFor="let c of insight.comparables"
                style="display:flex;align-items:baseline;gap:10px;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);">
                <span style="font-size:.82rem;font-weight:700;color:var(--text);white-space:nowrap;min-width:130px;">{{ c.name }}</span>
                <span style="font-size:.65rem;font-weight:600;color:#4f8ef7;background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.25);border-radius:4px;padding:1px 7px;white-space:nowrap;">{{ c.geography }}</span>
                <span style="font-size:.8rem;color:var(--text-muted);line-height:1.55;">{{ c.note }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div *ngIf="!deckLoading && !deck" style="text-align:center;padding:80px 20px;color:var(--text-muted);">Deck not found.</div>
    </div>
  `,
  styles: [`@keyframes spin { to { transform: rotate(360deg); } }`],
})
export class IntelligencePageComponent implements OnInit {
  deck: DeckDetail | null = null;
  insight: DealInsight | null = null;
  deckLoading = true;
  loading = false;
  editingScore = false;
  editScoreValue = 0;
  displayScore = 0;
  comments: Comment[] = [];
  newNote = '';
  savingNote = false;

  constructor(private route: ActivatedRoute, private deckService: DeckService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.deckService.getDeck(id).subscribe({
      next: d => {
        this.deck = d;
        this.deckLoading = false;
        this.deckService.getComments(id).subscribe({ next: c => (this.comments = c) });
        this.deckService.getCachedInsight(id).subscribe({
          next: res => {
            if (res && res.overall_score !== undefined) {
              this.insight = res;
              this.displayScore = res.overall_score ?? 0;
              this.editScoreValue = this.displayScore;
            }
          },
          error: () => {},
        });
      },
      error: () => { this.deckLoading = false; },
    });
  }

  generate() {
    if (!this.deck) return;
    this.loading = true;
    this.deckService.getInsight(this.deck.id).subscribe({
      next: res => {
        this.insight = res;
        this.displayScore = res.overall_score ?? 0;
        this.editScoreValue = this.displayScore;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  addComment() {
    if (!this.newNote.trim() || !this.deck) return;
    this.savingNote = true;
    this.deckService.addComment(this.deck.id, this.newNote.trim()).subscribe({
      next: c => { this.comments = [...this.comments, c]; this.newNote = ''; this.savingNote = false; },
      error: () => (this.savingNote = false),
    });
  }

  deleteComment(id: string) {
    if (!this.deck) return;
    this.deckService.deleteComment(this.deck.id, id).subscribe({
      next: () => (this.comments = this.comments.filter(c => c.id !== id)),
    });
  }

  startScoreEdit() { this.editScoreValue = this.displayScore; this.editingScore = true; }
  saveScoreEdit() { this.displayScore = Math.min(100, Math.max(0, this.editScoreValue)); this.editingScore = false; }
  cancelScoreEdit() { this.editScoreValue = this.displayScore; this.editingScore = false; }

  scoreColor() {
    if (this.displayScore >= 70) return '#3dca7e';
    if (this.displayScore >= 50) return '#4f8ef7';
    if (this.displayScore >= 35) return '#f0c040';
    return '#e05252';
  }

  stageStyle() { return STAGE_STYLE[this.insight?.stage_label ?? ''] ?? 'color:var(--text-muted);border-color:var(--border)'; }
  recStyle() { return REC_STYLE[this.insight?.recommendation ?? ''] ?? 'color:var(--text-muted);border-color:var(--border);background:var(--surface-2)'; }
  dimScoreStyle(score: string) { return SCORE_STYLE[score] ?? SCORE_STYLE['Unclear']; }

  parsePoints(text: string): string[] {
    if (!text) return [];
    // Split by sentence endings (. ! ?) followed by space or end of string
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    return sentences;
  }
}
