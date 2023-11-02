import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-ripple',
  templateUrl: './ripple.component.html',
  styleUrls: ['./ripple.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RippleComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Ripple',
    breadcrumb: ['Home', 'Features', 'Ripple']
  };
  centered = false;
  disabled = false;
  unbounded = false;
  radius: number = 0;
  color: string = 'red';

  constructor() {}

  ngOnInit(): void {}
}
