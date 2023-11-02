import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { TabService } from '@core/services/common/tab.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Tab page operation example, if you need to display details on the current tab page, please click the table view button in the "List Page > Query Form" to demonstrate the effect',
    breadcrumb: ['Home', 'Extensions', 'Tab']
  };
  routerPath = this.router.url;

  constructor(private router: Router, private tabService: TabService, private cdr: ChangeDetectorRef) {}

  changeTabTitle(title: string): void {
    this.tabService.changeTabTitle(title);
  }

  closeRight(): void {
    this.tabService.delRightTab(this.router.url, this.tabService.getCurrentTabIndex());
  }
  closeLeft(): void {
    this.tabService.delLeftTab(this.router.url, this.tabService.getCurrentTabIndex());
  }

  closeOther(): void {
    this.tabService.delOtherTab(this.router.url, this.tabService.getCurrentTabIndex());
  }

  closeCurrent(): void {
    const tabArray = this.tabService.getTabArray();
    this.tabService.delTab(tabArray[this.tabService.getCurrentTabIndex()], this.tabService.getCurrentTabIndex());
  }

  openDetailPage(i: number): void {
    this.router.navigate(['admin/feat/tabs/example-detail'], { queryParams: { id: i } });
  }

  refresh(): void {
    this.tabService.refresh();
  }

  ngOnInit(): void {}
}
