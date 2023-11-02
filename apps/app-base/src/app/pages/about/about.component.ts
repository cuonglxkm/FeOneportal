import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { DateFormat } from '@shared/pipes/map.pipe';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    console.log('123');
  }
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'About',
    breadcrumb: ['Home', 'Extended', 'About'],
    desc: 'Description'
  };
  data = new Date();
  dateFormat = DateFormat.DateTime;
  constructor() {}

  ngOnInit(): void {}
}
