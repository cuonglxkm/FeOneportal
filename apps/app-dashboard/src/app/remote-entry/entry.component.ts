import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [CommonModule, NxWelcomeComponent],
  selector: 'one-portal-app-dashboard-entry',
  template: `<one-portal-nx-welcome></one-portal-nx-welcome>`,
})
export class RemoteEntryComponent {}
