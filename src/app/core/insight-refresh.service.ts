import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InsightRefreshService {
  readonly refresh$ = new Subject<string>(); // emits deckId

  trigger(deckId: string) { this.refresh$.next(deckId); }
}
