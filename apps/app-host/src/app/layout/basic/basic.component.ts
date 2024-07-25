import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SettingsService, User } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';

@Component({
  selector: 'layout-basic',
  template: `
    <layout-default
      [options]="{logo: logoTemplate}"
      [asideUser]="asideUserTpl"
      [content]="contentTpl"
      [customError]="null"
    >
      <!--      <layout-default-header-item direction="left">-->
      <!--        <a layout-default-header-item-trigger href="//github.com/ng-alain/ng-alain" target="_blank">-->
      <!--          <i nz-icon nzType="github"></i>-->
      <!--        </a>-->
      <!--      </layout-default-header-item>-->
      <!--      <layout-default-header-item direction="left" hidden="mobile">-->
      <!--        <a layout-default-header-item-trigger routerLink="/passport/lock">-->
      <!--          <i nz-icon nzType="lock"></i>-->
      <!--        </a>-->
      <!--      </layout-default-header-item>-->
      <!--      <layout-default-header-item direction="left" hidden="pc">-->
      <!--        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">-->
      <!--          <i nz-icon nzType="search"></i>-->
      <!--        </div>-->
      <!--      </layout-default-header-item>-->
      <!--      <layout-default-header-item direction="middle">-->
      <!--        <header-search class="alain-default__search" [(toggleChange)]="searchToggleStatus" />-->
      <!--      </layout-default-header-item>-->
      <!--      <layout-default-header-item direction="right">-->
      <!--        <header-notify />-->
      <!--      </layout-default-header-item>-->

      <ng-template #logoTemplate>
      <a (click)="navigateToCloud($event)" class="alain-default__header-logo-link">
          <img
            class="alain-default__header-logo-expanded"
            src="assets/imgs/logo_vnpt_white.svg"
            alt="Logo VNPT"
          />
          <img
            class="alain-default__header-logo-collapsed"
            src="assets/imgs/logo_vnpt_icon_white.svg"
            alt="Logo VNPT"
          />
        </a>
      </ng-template>
      <layout-default-header-item direction="right" hidden="mobile">
        <header-task />
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <header-icon />
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <div
          layout-default-header-item-trigger
          nz-dropdown
          [nzDropdownMenu]="settingsMenu"
          nzTrigger="click"
          nzPlacement="bottomRight"
        >
          <i nz-icon nzType="setting"></i>
        </div>
        <nz-dropdown-menu #settingsMenu="nzDropdownMenu">
          <div nz-menu style="width: 200px;">
            <div nz-menu-item>
              <header-rtl />
            </div>
            <div nz-menu-item>
              <header-fullscreen />
            </div>
            <div nz-menu-item>
              <header-clear-storage />
            </div>
            <div nz-menu-item>
              <header-i18n />
            </div>
          </div>
        </nz-dropdown-menu>
      </layout-default-header-item>

      <layout-default-header-item direction="right">
        <header-user />
      </layout-default-header-item>

      <ng-template #asideUserTpl>
        <!--        <div nz-dropdown nzTrigger="click" [nzDropdownMenu]="userMenu" class="alain-default__aside-user">-->
        <!--          <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user.avatar" />-->
        <!--          <div class="alain-default__aside-user-info">-->
        <!--            <strong>{{ user.name }}</strong>-->
        <!--            <p class="mb0">{{ user.email }}</p>-->
        <!--          </div>-->
        <!--        </div>-->
        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item routerLink="/pro/account/center">
              {{ 'menu.account.center' | i18n }}
            </li>
            <li nz-menu-item routerLink="/pro/account/settings">
              {{ 'menu.account.settings' | i18n }}
            </li>
          </ul>
        </nz-dropdown-menu>
      </ng-template>
      <ng-template #contentTpl>
        <router-outlet />
      </ng-template>
      <footer
        style="display: flex; align-items: center; justify-content: center;"
      >
        <a href="https://vnpt.com.vn/" target="_blank">
          Powered by
          <img
            style="margin-left: 10px"
            src="assets/imgs/logo-vnpt.svg"
            alt=""
          />
        </a>
      </footer>
    </layout-default>

    <setting-drawer *ngIf="showSettingDrawer" />
    <theme-btn />
  `,
})
export class LayoutBasicComponent {
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  get user(): User {
    return this.settings.user;
  }

  navigateToCloud(event: Event){
    event.preventDefault()
    window.location.href = environment.sso.cloud_baseUrl;
  }

  constructor(private settings: SettingsService) {}
}
