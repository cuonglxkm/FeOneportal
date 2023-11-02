import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-keep-scroll-page',
  templateUrl: './keep-scroll-page.component.html',
  styleUrls: ['./keep-scroll-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeepScrollPageComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Keep Scroll',
    breadcrumb: ['Home', 'Extended', 'Keep Scroll'],
    desc: "After 2 days of work, I am finally satisfied. By default, pages that can be reused will cache scroll bars. If the page is set to not be reused, the scrollbars will not be cached either. If you need a reusable page without caching scroll bars, set needKeepScroll to no' in the routing configuration"
  };
  constructor() {}

  ngOnInit(): void {}
}
