import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'one-portal-static-web-hosting',
  templateUrl: './static-web-hosting.component.html',
  styleUrls: ['./static-web-hosting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticWebHostingComponent {}
