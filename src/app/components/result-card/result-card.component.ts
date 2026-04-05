// Result card component: renders a single analysis section with a title and slot for content.

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-result-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-8">
      <h2 class="text-base font-semibold text-gray-900 mb-5">{{ title }}</h2>
      <ng-content />
    </div>
  `,
})
export class ResultCardComponent {
  @Input() title = '';
}
