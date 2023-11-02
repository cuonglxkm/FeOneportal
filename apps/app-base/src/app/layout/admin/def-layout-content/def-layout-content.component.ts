import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@core/services/common/destory.service';
import { SplitNavStoreService } from '@store/common-store/split-nav-store.service';
import { ThemeService } from '@store/common-store/theme.service';
import { SettingInterface } from '@app/core/models/interfaces/theme-setting';

@Component({
  selector: 'app-def-layout-content',
  templateUrl: './def-layout-content.component.html',
  styleUrls: ['./def-layout-content.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class DefLayoutContentComponent implements OnInit {
  showChats = true;
  isNightTheme$ = this.themesService.getIsNightTheme();
  themesOptions$ = this.themesService.getThemesMode();
  isMixiMode = false;
  themesOptions: SettingInterface = {
    theme: 'dark',
    color: '',
    mode: 'side',
    splitNav: false,
    isShowTab: true,
    fixedTab: false,
    colorWeak: false,
    greyTheme: false,
    fixedHead: false,
    fixedLeftNav: false,
    hasTopArea: true,
    hasFooterArea: true,
    hasNavArea: true,
    hasNavHeadArea: true
  };
  isFixedLeftNav = false;
  isOverMode$: Observable<boolean> = this.themesService.getIsOverMode();
  isCollapsed$: Observable<boolean> = this.themesService.getIsCollapsed();
  // In mixed mode, judge whether the top menu has a submenu, if there is no submenu, hide the left menu
  mixiModeLeftNav = this.splitNavStoreService.getSplitLeftNavArrayStore();
  contentMarginTop = '48px';

  constructor(private destroy$: DestroyService, private themesService: ThemeService, private splitNavStoreService: SplitNavStoreService) { }

  changeCollapsed(isCollapsed: boolean): void {
    this.themesService.setIsCollapsed(isCollapsed);
  }

  getThemeOptions(): void {
    this.themesOptions$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.themesOptions = res;
      this.isMixiMode = res.mode === 'mixi';
      this.isFixedLeftNav = this.themesOptions.fixedLeftNav;

      if (this.themesOptions.fixedHead && !this.isMixiMode && this.themesOptions.hasTopArea) {
        this.contentMarginTop = this.themesOptions.isShowTab ? (this.themesOptions.fixedTab ? '96px' : '48px') : '48px';
      } else {
        this.contentMarginTop = this.themesOptions.isShowTab ? (this.themesOptions.fixedTab ? '48px' : '0px') : '0px';
      }
    });
  }

  ngOnInit(): void {
    this.getThemeOptions();
  }
}
