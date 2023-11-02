import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DestroyService } from '@core/services/common/destory.service';
import { TabService } from '@core/services/common/tab.service';
import { TabModel } from '@app/core/models/interfaces/tab';
import { Menu } from '@app/core/models/interfaces/types';
import { SplitNavStoreService } from '@store/common-store/split-nav-store.service';
import { ThemeService } from '@store/common-store/theme.service';
import { fnStopMouseEvent } from '@utils/tools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class TabComponent implements OnInit {
  tabsSourceData: TabModel[] = [];
  tabsSourceData$ = this.tabService.getTabArray$();
  themesOptions$ = this.themesService.getThemesMode();
  isNightTheme$ = this.themesService.getIsNightTheme();
  leftMenuArray$: Observable<Menu[]> = this.splitNavStoreService.getSplitLeftNavArrayStore();
  isOverMode$ = this.themesService.getIsOverMode();
  isOverMode = false;
  isCollapsed$ = this.themesService.getIsCollapsed();
  isCollapsed = false;

  constructor(
    public tabService: TabService,
    private nzContextMenuService: NzContextMenuService,
    private splitNavStoreService: SplitNavStoreService,
    private themesService: ThemeService,
    private destroy$: DestroyService,
    public router: Router,
    public cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(filter((event: NzSafeAny) => event instanceof NavigationEnd)).subscribe((event: NzSafeAny) => {
      this.cdr.markForCheck();
    });
  }

  get currentIndex(): number {
    return this.tabService.getCurrentTabIndex();
  }

  public trackByTab(index: number, tab: TabModel): string {
    return tab.title;
  }

  // Click the tab to jump to the corresponding path
  goPage(tab: TabModel): void {
    this.router.navigateByUrl(tab.path);
  }

  // Right click to close the right tab
  closeRithTab(tab: TabModel, e: MouseEvent, index: number): void {
    fnStopMouseEvent(e);
    this.tabService.delRightTab(tab.path, index);
  }

  // Right click to close the left tab
  closeLeftTab(tab: TabModel, e: MouseEvent, index: number): void {
    if (index === 0) {
      return;
    }
    fnStopMouseEvent(e);
    this.tabService.delLeftTab(tab.path, index);
  }

  // close other tabs
  closeOtherTab(tab: TabModel, e: MouseEvent, index: number): void {
    fnStopMouseEvent(e);
    this.tabService.delOtherTab(tab.path, index);
  }

  // Right click to close the current Tab
  closeTab(tab: TabModel, e: MouseEvent, index: number): void {
    fnStopMouseEvent(e);
    this.closeCurrentTab(tab, index);
  }

  // Click the close icon on the tab
  clickCloseIcon(indexObj: { index: number }): void {
    this.closeCurrentTab(this.tabsSourceData[indexObj.index], indexObj.index);
  }

  // Close the current Tab
  closeCurrentTab(tab: TabModel, index: number): void {
    if (this.tabsSourceData.length === 1) {
      return;
    }
    this.tabService.delTab(tab, index);
    // ngZoneEventCoalescing, ngZoneRunCoalescing example, please see main.ts
    this.cdr.detectChanges();
  }

  refresh(): void {
    this.tabService.refresh();
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }

  ngOnInit(): void {
    this.tabsSourceData$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.tabsSourceData = res;
    });
  }
}
