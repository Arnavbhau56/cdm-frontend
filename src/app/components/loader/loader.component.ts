// Loader component: full-screen overlay spinner with a configurable status message.

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
      <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-700 text-sm font-medium">{{ message }}</p>
    </div>
  `,
})
export class LoaderComponent {
  @Input() message = 'Loading...';
}
