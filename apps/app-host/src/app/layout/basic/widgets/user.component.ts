import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ModalHelper, SettingsService, User } from '@delon/theme';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ModalResetPassComponent } from './modal-resetpass.component';

@Component({
  selector: 'header-user',
  template: `
    <div
      class="alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm" />
      {{ user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-md">
      
        <div nz-menu-item routerLink="/profile">
          <img src="assets/imgs/account-icon.svg" alt="" />
          {{ 'menu.account.center' | i18n }}
        </div>
        <div nz-menu-item (click)="openResetPass()">
          <img src="assets/imgs/reset_pass_icon.svg" alt="" />
          {{ 'menu.account.reset.password' | i18n }}
        </div>
        <!--        <div nz-menu-item routerLink="/pro/account/settings">-->
        <!--          <i nz-icon nzType="setting" class="mr-sm"></i>-->
        <!--          {{ 'menu.account.settings' | i18n }}-->
        <!--        </div>-->
        <!--        <div nz-menu-item routerLink="/exception/trigger">-->
        <!--          <i nz-icon nzType="close-circle" class="mr-sm"></i>-->
        <!--          {{ 'menu.account.trigger' | i18n }}-->
        <!--        </div>-->
        <li nz-menu-divider></li>
        <div nz-menu-item (click)="logout()">
          <img src="assets/imgs/logout-icon.svg" alt="" />
          {{ 'menu.account.logout' | i18n }}
        </div>
      </div>
    </nz-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent {
  get user(): User {
    return this.settings.user;
  }

  constructor(
    private settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient
  ) {}

  private readonly mh = inject(ModalHelper);

  openResetPass() {
    this.mh.create(ModalResetPassComponent).subscribe({});
  }

  logout(): void {
    let id_token = this.tokenService.get()!['id_token'];
    this.tokenService.clear();
    // this.httpClient.get(environment['sso'].issuer
    //   + `/connect/logout?post_logout_redirect_uri=${decodeURIComponent(environment['sso'].logout_callback)}`/* + '/logout'*/)
    //   .subscribe(data => {
    //     console.log(data)
    //   }, error => {
    //     console.log(error)
    //   });

    window.location.href =
      environment['sso'].issuer +
      `/connect/logout?oi_au_id=${id_token}&post_logout_redirect_uri=${decodeURIComponent(
        environment['sso'].logout_callback
      )}`;
  }
}
