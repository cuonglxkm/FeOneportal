import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouteReuseStrategy } from '@angular/router';
import { first } from 'rxjs/operators';

import { IsNightKey, ThemeOptionsKey } from '@config/constant';
import { LoginInOutService } from '@core/services/common/login-in-out.service';
import { SimpleReuseStrategy } from '@app/core/services/common/strategy/reuse-strategy';
import { TabService } from '@core/services/common/tab.service';
import { ThemeSkinService } from '@core/services/common/theme-skin.service';
import { WindowService } from '@core/services/common/window.service';
import { ThemeService } from '@store/common-store/theme.service';
import { Color, NormalModel, SettingInterface, Theme, ThemeMode } from '@app/core/models/interfaces/theme-setting';
import { fnFormatToHump } from '@utils/tools';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzMessageService } from 'ng-zorro-antd/message';

type SpecialTheme = 'color-weak' | 'grey-theme';
type SpecialThemeHump = 'colorWeak' | 'greyTheme';

@Component({
  selector: 'app-setting-drawer',
  templateUrl: './setting-drawer.component.html',
  styleUrls: ['./setting-drawer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingDrawerComponent implements OnInit {
  themesOptions$ = this.themesService.getThemesMode();
  isNightTheme$ = this.themesService.getIsNightTheme();
  _isNightTheme = false;
  _themesOptions: SettingInterface = {
    theme: 'dark',
    color: '#1890FF',
    mode: 'mixi',
    fixedTab: false,
    isShowTab: true,
    splitNav: true,
    greyTheme: false,
    colorWeak: false,
    fixedLeftNav: true,
    fixedHead: true,
    hasTopArea: true,
    hasFooterArea: true,
    hasNavArea: true,
    hasNavHeadArea: true
  };
  isCollapsed = false;
  dragging = false;

  themes: Theme[] = [
    {
      key: 'dark',
      image: '/assets/imgs/theme-dark.svg',
      title: 'Dark menu style',
      isChecked: true
    },
    {
      key: 'light',
      image: '/assets/imgs/theme-light.svg',
      title: 'Bright color menu style',
      isChecked: false
    }
  ];
  colors: Color[] = [
    {
      key: 'dust',
      color: '#F5222D',
      title: 'Dust Red',
      isChecked: false
    },
    {
      key: 'volcano',
      color: '#FA541C',
      title: 'Volcano',
      isChecked: false
    },
    {
      key: 'sunset',
      color: '#FAAD14',
      title: 'Sunset Orange',
      isChecked: false
    },
    {
      key: 'cyan',
      color: '#13C2C2',
      title: 'Cyan',
      isChecked: false
    },
    {
      key: 'green',
      color: '#52C41A',
      title: 'Polar Green',
      isChecked: false
    },
    {
      key: 'daybreak',
      color: '#1890FF',
      title: 'Daybreak Blue (default)',
      isChecked: true
    },
    {
      key: 'geekblue',
      color: '#2F54EB',
      title: 'Geek Blue',
      isChecked: false
    },
    {
      key: 'purple',
      color: '#722ED1',
      title: 'Golden Purple',
      isChecked: false
    }
  ];
  modes: ThemeMode[] = [
    {
      key: 'side',
      image: '/assets/imgs/menu-side.svg',
      title: 'Side Menu Layout',
      isChecked: true
    },
    {
      key: 'top',
      image: '/assets/imgs/menu-top.svg',
      title: 'Top Menu Layout',
      isChecked: false
    },
    {
      key: 'mixi',
      image: '/assets/imgs/menu-top.svg',
      title: 'Mix Menu Layout',
      isChecked: false
    }
  ];

  constructor(
    private themesService: ThemeService,
    private loginInOutService: LoginInOutService,
    private tabService: TabService,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private doc: Document,
    public message: NzMessageService,
    private nzConfigService: NzConfigService,
    private themeSkinService: ThemeSkinService,
    private windowServe: WindowService,
    private rd2: Renderer2
  ) { }

  changeCollapsed(): void {
    if (!this.dragging) {
      this.isCollapsed = !this.isCollapsed;
    } else {
      this.dragging = false;
    }
  }

  changePrimaryColor(color: Color): void {
    this.selOne(color as NormalModel, this.colors);
    this.nzConfigService.set('theme', { primaryColor: color.color });
    this._themesOptions.color = color.color;
    this.setThemeOptions();
  }

  // Modify the night theme
  changeNightTheme(isNight: boolean): void {
    this.windowServe.setStorage(IsNightKey, `${isNight}`);
    this.themesService.setIsNightTheme(isNight);
    this.themeSkinService.toggleTheme().then();
  }

  // Choose one isChecked to be true and the others to be false
  selOne(item: NormalModel, itemArray: NormalModel[]): void {
    itemArray.forEach(_item => (_item.isChecked = false));
    item.isChecked = true;
  }

  changeMode(mode: ThemeMode): void {
    this.selOne(mode, this.modes);
    this.themesService.setIsCollapsed(false);
    this._themesOptions.mode = mode.key;
    this.setThemeOptions();
  }

  // switch theme
  changeTheme(themeItem: Theme): void {
    this.selOne(themeItem, this.themes);
    this._themesOptions.theme = themeItem.key;
    this.setThemeOptions();
  }

  // Set theme parameters
  setThemeOptions(): void {
    this.themesService.setThemesMode(this._themesOptions);
    this.windowServe.setStorage(ThemeOptionsKey, JSON.stringify(this._themesOptions));
  }

  // Modify the fixed header
  changeFixed(isTrue: boolean, type: 'isShowTab' | 'splitNav' | 'fixedTab' | 'fixedLeftNav' | 'fixedHead' | 'hasTopArea' | 'hasFooterArea' | 'hasNavArea' | 'hasNavHeadArea'): void {
    // When the head is not fixed, the label is not fixed
    if (type === 'fixedHead' && !isTrue) {
      this._themesOptions['fixedTab'] = false;
    }
    this._themesOptions[type] = isTrue;
    this.setThemeOptions();

    // If you do not display multiple tags, you need to clear the tab and all components that have been cached
    if (type === 'isShowTab') {
      if (!isTrue) {
        SimpleReuseStrategy.deleteAllRouteSnapshot(this.activatedRoute.snapshot).then(() => {
          this.tabService.clearTabs();
        });
      } else {
        this.tabService.refresh();
      }
    }
  }

  // Modify the special theme, color weak theme, gray theme
  changeSpecialTheme(e: boolean, themeType: SpecialTheme): void {
    const name = this.doc.getElementsByTagName('html');
    const theme = fnFormatToHump(themeType);
    if (e) {
      this.rd2.addClass(name[0], themeType);
    } else {
      this.rd2.removeClass(name[0], themeType);
    }
    this._themesOptions[theme as SpecialThemeHump] = e;
    this.setThemeOptions();
  }

  initThemeOption(): void {
    this.isNightTheme$.pipe(first()).subscribe(res => (this._isNightTheme = res));
    this.themesOptions$.pipe(first()).subscribe(res => {
      this._themesOptions = res;
    });

    // Special mode theme change (Color Weakness Mode, Gray Mode)
    (['grey-theme', 'color-weak'] as SpecialTheme[]).forEach(item => {
      const specialTheme = fnFormatToHump(item);
      this.changeSpecialTheme(this._themesOptions[specialTheme as SpecialThemeHump], item);
    });

    this.modes.forEach(item => {
      item.isChecked = item.key === this._themesOptions.mode;
    });
    this.colors.forEach(item => {
      item.isChecked = item.color === this._themesOptions.color;
    });
    this.changePrimaryColor(this.colors.find(item => item.isChecked)!);
    this.themes.forEach(item => {
      item.isChecked = item.key === this._themesOptions.theme;
    });
  }

  ngOnInit(): void {
    this.initThemeOption();
  }

  dragEnd(): void {
    if (this.dragging) {
      setTimeout(() => {
        this.dragging = false;
      });
    }
  }
}
