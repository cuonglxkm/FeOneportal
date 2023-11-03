import {ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {DrawerWrapService} from "@app/drawer/base-drawer";
import {ModalWrapService} from "@widget/base-modal";
import {LockScreenStoreService} from "@store/common-store/lock-screen-store.service";
import {PreloaderService} from "@core/services/common/preloader.service";
import {SpinService} from "@store/common-store/spin.service";
import {NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {NzI18nService, vi_VN} from "ng-zorro-antd/i18n";
import {TranslateService} from "@ngx-translate/core";
import {fnStopMouseEvent} from "@utils/tools";
import {filter, takeUntil} from "rxjs/operators";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {NavDrawerComponent} from "@app/layout/admin/nav-drawer/nav-drawer.component";
import {DestroyService} from "@core/services/common/destory.service";
import {ThemeService} from "@store/common-store/theme.service";
import {DriverService} from "@core/services/common/driver.service";
import {WindowService} from "@core/services/common/window.service";
import {IsFirstLogin} from "@config/constant";
import {fadeRouteAnimation} from "@app/animations/fade.animation";

@Component({
  selector: 'one-portal-nx-welcome',
  template: `
    <app-lock-screen *ngIf="(lockedState$ | async)!.locked"></app-lock-screen>
    <nz-back-top></nz-back-top>
    <div class="full-height" [@fadeRouteAnimation]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
    <div *ngIf="loading$ | async" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1001;background:rgba(24,144,255,0.1);">
      <div style="position:absolute;top: 50%;left:50%;margin:-16px 0 0 -16px;">
        <nz-spin nzSize="large"></nz-spin>
      </div>
    </div>

    <ng-template #modalBtnTpl>
      <div class="center">
        <span class="hover-blue full-height flex-auto text-right d-i-b" (click)="fullScreenIconClick($event)">
          <i class="m-r-8" nz-icon [nzType]="!modalFullScreenFlag ? 'fullscreen' : 'fullscreen-exit'" nzTheme="outline"></i>
        </span>
        <span (click)="modalFullScreenFlag = false" class="hover-red full-height flex-auto d-i-b">
          <i nz-icon nzType="close" nzTheme="outline"></i>
        </span>
      </div>
    </ng-template>

    <ng-template #drawerFootDefaultTpl>
      <div class="end-start-center">
        <button nzType="default" class="m-r-8" (click)="drawerWrapService.cancel()" nz-button>Cancel</button>
        <button nzType="primary" (click)="drawerWrapService.sure()" nz-button>OK</button>
      </div>
    </ng-template>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeRouteAnimation],
  providers: [DestroyService]
})
export class NxWelcomeComponent {
  loading$ = this.spinService.getCurrentGlobalSpinStore();
  lockedState$ = this.lockScreenStoreService.getLockScreenStore();
  @ViewChild('modalBtnTpl') modalBtnTpl!: TemplateRef<any>;
  @ViewChild('drawerFootDefaultTpl') drawerFootDefaultTpl!: TemplateRef<any>;
  modalFullScreenFlag = false;

  constructor(
    public drawerWrapService: DrawerWrapService,
    private modalWrapService: ModalWrapService,
    private lockScreenStoreService: LockScreenStoreService,
    private preloader: PreloaderService,
    private spinService: SpinService,
    public router: Router,
    private i18n: NzI18nService, private translate: TranslateService
  ) {
    this.i18n.setLocale(vi_VN)
    // this.i18n.setDateLocale(vi)
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
  }

  // All dialogs expand the maximize button, and the compromise method of passing templateRef to the Modal basic service
  fullScreenIconClick($event: MouseEvent): void {
    this.modalFullScreenFlag = !this.modalFullScreenFlag;
    fnStopMouseEvent($event);
    this.modalWrapService.fullScreenIconClick();
  }

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['key'];
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event: NzSafeAny) => event instanceof NavigationEnd)).subscribe((event: NzSafeAny) => {
      this.spinService.setCurrentGlobalSpinStore(false);
    });
  }

  ngAfterViewInit(): void {
    this.preloader.removePreLoader();
    this.modalWrapService.setTemplate(this.modalBtnTpl);
    this.drawerWrapService.setTemplate(this.drawerFootDefaultTpl);
  }
}
