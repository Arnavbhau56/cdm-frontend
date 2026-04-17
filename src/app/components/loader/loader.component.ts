// Loader: dark overlay spinner matching PathCredit Logger style.

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div style="position:fixed;inset:0;background:rgba(14,15,17,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;">
      <div style="width:28px;height:28px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;margin-bottom:12px;"></div>
      <p style="font-size:.82rem;color:var(--text-muted);">{{ message }}</p>
    </div>
  `,
})
export class LoaderComponent {
  @Input() message = 'Loading...';
}
