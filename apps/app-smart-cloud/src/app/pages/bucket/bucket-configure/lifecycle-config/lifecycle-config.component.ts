import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'one-portal-lifecycle-config',
  templateUrl: './lifecycle-config.component.html',
  styleUrls: ['./lifecycle-config.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LifecycleConfigComponent {}
