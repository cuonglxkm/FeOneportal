import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

import { fadeRouteAnimation } from '@app/animations/fade.animation';
import { DestroyService } from '@core/services/common/destory.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { SearchListStoreService } from '@store/biz-store-service/search-list/search-list-store.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

interface TabInterface {
  label: string;
  url: string;
}

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeRouteAnimation],
  providers: [DestroyService]
})
export class SearchListComponent implements OnInit {
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<NzSafeAny>;
  @ViewChild('headerFooter', { static: true }) headerFooter!: TemplateRef<NzSafeAny>;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Search List (article)',
    desc: this.headerContent,
    breadcrumb: ['Home', 'List Page', 'Search Table'],
    footer: this.headerFooter
  };
  currentSelTab: number = 0;

  tabData: TabInterface[] = [
    { label: 'Articles', url: '/admin/page-demo/list/search-list/article' },
    { label: 'Project', url: '/admin/page-demo/list/search-list/project' },
    { label: 'Application', url: '/admin/page-demo/list/search-list/application' }
  ];

  constructor(private searchListService: SearchListStoreService, private activatedRoute: ActivatedRoute, private destroy$: DestroyService, private router: Router, private cdr: ChangeDetectorRef) {
    this.searchListService
      .getCurrentSearchListComponentStore()
      .pipe(takeUntil(this.destroy$))
      .subscribe(componentType => {
        this.pageHeaderInfo = {
          title: componentType,
          desc: this.headerContent,
          footer: this.headerFooter,
          breadcrumb: ['Home', 'List Page', componentType]
        };
        this.cdr.markForCheck();
      });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      if (event instanceof RouterEvent) {
        this.currentSelTab = this.tabData.findIndex(item => {
          return item.url === event.url;
        });
      }
    });
  }

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['key'];
  }

  to(item: TabInterface): void {
    this.router.navigateByUrl(item.url);
  }

  ngOnInit(): void {}
}
