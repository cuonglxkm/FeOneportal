import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-object-storage',
  templateUrl: './object-storage.component.html',
  styleUrls: ['./object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageComponent {
  constructor(private router: Router) {}
  navigateCreate() {
    this.router.navigate(['/app-smart-cloud/object-storage/extend']);
  }
}
