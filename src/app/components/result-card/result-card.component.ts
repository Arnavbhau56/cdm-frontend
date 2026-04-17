// Result card: dark surface card matching PathCredit Logger activity-card style.

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-result-card',
  standalone: true,
  template: `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;">
      <h2 style="font-family:var(--font-body);font-size:.72rem;letter-spacing:.1em;color:var(--text-muted);text-transform:uppercase;margin-bottom:14px;">{{ title }}</h2>
      <ng-content />
    </div>
  `,
})
export class ResultCardComponent {
  @Input() title = '';
}
