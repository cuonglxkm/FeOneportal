import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-desc',
  templateUrl: './desc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Details component example',
    breadcrumb: ['Home', 'Components', 'Detail Component'],
    desc: 'A series of detail components'
  };

  constructor() {}

  ngOnInit(): void {}
}
