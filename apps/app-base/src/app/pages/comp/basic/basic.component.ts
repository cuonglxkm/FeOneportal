import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Basic Components',
    breadcrumb: ['Home', 'Components', 'Basic Components'],
    desc: 'A series of basic components'
  };

  constructor() {}

  ngOnInit(): void {}
}
