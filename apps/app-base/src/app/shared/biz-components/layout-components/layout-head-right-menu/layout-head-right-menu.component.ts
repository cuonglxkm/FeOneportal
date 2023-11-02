import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginInOutService } from '@core/services/common/login-in-out.service';
import { WindowService } from '@core/services/common/window.service';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '@services/system/account.service';
import { UserPsd, UserToken } from '@app/core/models/interfaces/user';
import { SpinService } from '@store/common-store/spin.service';
import { UserInfoService } from '@store/common-store/userInfo.service';
import { ModalBtnStatus } from '@widget/base-modal';
import { ChangePasswordService } from '@widget/biz-widget/change-password/change-password.service';
import { LockWidgetService } from '@widget/common-widget/lock-widget/lock-widget.service';
import { SearchRouteService } from '@widget/common-widget/search-route/search-route.service';
import { en_US, NzI18nService, vi_VN } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { TokenKey } from '@app/config/constant';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-layout-head-right-menu',
  templateUrl: './layout-head-right-menu.component.html',
  styleUrls: ['./layout-head-right-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutHeadRightMenuComponent implements OnInit {
  user!: UserPsd;
  currentUser!: UserToken

  constructor(
    private router: Router,
    private changePasswordModalService: ChangePasswordService,
    private spinService: SpinService,
    private loginOutService: LoginInOutService,
    private lockWidgetService: LockWidgetService,
    private windowServe: WindowService,
    private activatedRoute: ActivatedRoute,
    private searchRouteService: SearchRouteService,
    public message: NzMessageService,
    private userInfoService: UserInfoService,
    private accountService: AccountService,
    private i18n: NzI18nService,
    private translate: TranslateService
  ) {
    let token = this.windowServe.getSessionStorage(TokenKey)
    const helper = new JwtHelperService();
    if (token) {
      const rs = helper.decodeToken(token)
      if (rs) this.currentUser = rs
    }
  }

  // Lock screen
  lockScreen(): void {
    this.lockWidgetService
      .show({
        nzTitle: 'Lock screen',
        nzStyle: { top: '25px' },
        nzWidth: '520px',
        nzFooter: null,
        nzMaskClosable: true
      })
      .subscribe();
  }

  // Change Password
  changePassWorld(): void {
    this.changePasswordModalService.show({ nzTitle: 'Change Password' }).subscribe(({ modalValue, status }) => {
      if (status === ModalBtnStatus.Cancel) {
        return;
      }
      this.userInfoService.getUserInfo().subscribe(res => {
        this.user = {
          id: res.userId,
          oldPassword: modalValue.oldPassword,
          newPassword: modalValue.newPassword
        };
      });
      this.accountService.editAccountPsd(this.user).subscribe(() => {
        this.loginOutService.loginOut().then();
        this.message.success('The modification is successful, please log in again');
      });
    });
  }

  showSearchModal(): void {
    const modalOptions: ModalOptions = {
      nzClosable: false,
      nzMaskClosable: true,
      nzStyle: { top: '48px' },
      nzFooter: null,
      nzBodyStyle: { padding: '0' }
    };
    this.searchRouteService.show(modalOptions);
  }

  goLogin(): void {
    this.loginOutService.loginOut().then();
  }

  clean(): void {
    this.windowServe.clearStorage();
    this.windowServe.clearSessionStorage();
    this.loginOutService.loginOut().then();
    this.message.success('Clear is successful, please log in again');
  }

  showMessage(): void {
    this.message.info('Switch successfully');
  }

  goPage(path: string): void {
    this.router.navigateByUrl(`/admin/page-demo/personal/${path}`);
  }

  curLangCode() {
    return this.i18n.getLocale();
  }

  changeLanguage(language: string) {
    this.i18n.setLocale(language === 'vi_VN' ? vi_VN : en_US);
    // this.i18n.setDateLocale(language === 'vi_VN' ? vi : enUS)
    this.translate.use(language === 'vi_VN' ? 'vi' : 'en')
  }

  ngOnInit(): void { }
}
