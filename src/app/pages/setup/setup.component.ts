import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({ selector: 'app-setup', standalone: true, imports: [], template: '' })
export class SetupComponent {
  constructor(router: Router) { router.navigate(['/dashboard']); }
}
