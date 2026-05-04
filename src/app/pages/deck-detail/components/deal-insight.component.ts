// Deal Insight panel: on-demand AI synthesis of all available context into a structured
// intelligence brief — stage, ratings, key metrics, comparables, one-line verdict.

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeckService, DealInsight } from '../../../core/deck.service';
import { InsightRefreshService } from '../../../core/insight-refresh.service';

const SCORE_STYLE: Record<string, string> = {
  'Strong':     'color:#3dca7e;border-color:rgba(61,202,126,.35);background:rgba(61,202,126,.08)',
  'Promising':  'color:#4f8ef7;border-color:rgba(79,142,247,.35);background:rgba(79,142,247,.08)',
  'Early':      'color:#f0c040;border-color:rgba(240,192,64,.35);background:rgba(240,192,64,.08)',
  'Weak':       'color:#e05252;border-color:rgba(224,82,82,.35);background:rgba(224,82,82,.08)',
  'Unclear':    'color:var(--text-muted);border-color:var(--border);background:var(--surface-2)',
};

const STAGE_STYLE: Record<string, string> = {
  'Pre-Idea':      'color:#e05252;border-color:rgba(224,82,82,.4)',
  'Pre-Revenue':   'color:#f0c040;border-color:rgba(240,192,64,.4)',
  'Early Revenue': 'color:#4f8ef7;border-color:rgba(79,142,247,.4)',
  'Growth':        'color:#3dca7e;border-color:rgba(61,202,126,.4)',
  'Scaling':       'color:#a78bfa;border-color:rgba(167,139,250,.4)',
};

@Component({
  selector: 'app-deal-insight',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;">

      <!-- Header row -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
        <span style="font-size:.65rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;">Deal Intelligence</span>
        <button (click)="load()" [disabled]="loading"
          style="font-size:.72rem;font-weight:700;color:var(--accent);background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);padding:5px 14px;cursor:pointer;"
          [style.opacity]="loading ? '0.5' : '1'">
          {{ loading ? 'Analysing…' : insight ? '↺ Refresh' : '✦ Generate Insight' }}
        </button>
      </div>

      <!-- Empty state -->
      <p *ngIf="!insight && !loading" style="font-size:.82rem;color:var(--text-muted);line-height:1.6;">
        Click <strong style="color:var(--text);">Generate Insight</strong> to get an AI-synthesised brief — stage rating, dimension scores, key metrics pulled from all uploaded notes and materials, and comparable companies.
      </p>

      <!-- Loading -->
      <div *ngIf="loading" style="display:flex;align-items:center;gap:10px;color:var(--text-muted);font-size:.82rem;padding:8px 0;">
        <span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;"></span>
        Synthesising all context…
      </div>

      <div *ngIf="insight && !loading">

        <!-- One-line verdict -->
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:20px;">
          <p style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Verdict</p>
          <p style="font-size:.92rem;color:var(--text);line-height:1.6;font-style:italic;">"{{ insight.one_line_verdict }}"</p>
        </div>

        <!-- Stage + ratings row -->
        <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;align-items:flex-start;">

          <!-- Stage -->
          <div style="display:flex;flex-direction:column;gap:8px;min-width:140px;">
            <p style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;">Stage</p>
            <span [style]="stageStyle()" style="font-size:.82rem;font-weight:700;border:1px solid;border-radius:6px;padding:6px 14px;width:fit-content;">
              {{ insight.stage_label }}
            </span>
            <p style="font-size:.75rem;color:var(--text-muted);line-height:1.55;">{{ insight.stage_rationale }}</p>
          </div>

          <!-- Ratings grid -->
          <div style="flex:1;min-width:260px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;">
            <div *ngFor="let r of insight.ratings"
              style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">{{ r.dimension }}</span>
                <span [style]="scoreStyle(r.score)" style="font-size:.65rem;font-weight:700;border:1px solid;border-radius:4px;padding:2px 7px;">{{ r.score }}</span>
              </div>
              <p style="font-size:.75rem;color:var(--text-muted);line-height:1.5;">{{ r.rationale }}</p>
            </div>
          </div>
        </div>

        <!-- Key metrics -->
        <div *ngIf="insight.key_metrics.length > 0" style="margin-bottom:20px;">
          <p style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">Key Metrics</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <div *ngFor="let m of insight.key_metrics"
              style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:8px 14px;display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:.62rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">{{ m.label }}</span>
              <span style="font-size:.92rem;font-weight:700;color:var(--text);">{{ m.value }}</span>
            </div>
          </div>
        </div>

        <!-- Comparables -->
        <div *ngIf="insight.comparables.length > 0">
          <p style="font-size:.62rem;letter-spacing:.08em;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">Comparable Companies</p>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div *ngFor="let c of insight.comparables"
              style="display:flex;align-items:baseline;gap:10px;font-size:.8rem;line-height:1.55;">
              <span style="font-weight:700;color:var(--text);white-space:nowrap;">{{ c.name }}</span>
              <span style="font-size:.65rem;font-weight:600;color:#4f8ef7;background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.25);border-radius:4px;padding:1px 6px;white-space:nowrap;">{{ c.geography }}</span>
              <span style="color:var(--text-muted);">{{ c.note }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`@keyframes spin { to { transform: rotate(360deg); } }`],
})
export class DealInsightComponent implements OnInit, OnDestroy {
  @Input() deckId = '';

  insight: DealInsight | null = null;
  loading = false;
  private sub?: Subscription;

  constructor(private deckService: DeckService, private insightRefresh: InsightRefreshService) {}

  ngOnInit() {
    this.sub = this.insightRefresh.refresh$.subscribe(id => {
      if (id === this.deckId) this.load();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  load() {
    this.loading = true;
    this.deckService.getInsight(this.deckId).subscribe({
      next: res => { this.insight = res; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  stageStyle() {
    return STAGE_STYLE[this.insight?.stage_label ?? ''] ?? 'color:var(--text-muted);border-color:var(--border)';
  }

  scoreStyle(score: string) {
    return SCORE_STYLE[score] ?? SCORE_STYLE['Unclear'];
  }
}
