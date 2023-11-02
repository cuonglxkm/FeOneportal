import { Component, ChangeDetectionStrategy } from '@angular/core';

/* This component creates a blank page in order to solve the hidden page that f12 can still view when the screen is locked */
@Component({
  selector: 'app-empty-for-lock',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyForLockComponent {}
