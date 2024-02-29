import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  RouterInteface,
  RouterStatic,
} from 'src/app/shared/models/router.model';
import { RouterService } from 'src/app/shared/services/router.service';

@Component({
  selector: 'one-portal-router-detail',
  templateUrl: './router-detail.component.html',
  styleUrls: ['../router-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterDetailComponent implements OnInit {
  routerId: number;
  regionId: number;
  vpcId: number;
  listOfRouterInteface: RouterInteface[] = [];
  listOfRouterStatic: RouterStatic[] = [];
  loading: boolean = true;

  constructor(
    private service: RouterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getRouterInterfaces();
    this.getRouterStatic();
  }

  getRouterInterfaces() {
    this.loading = true;
    this.service
      .getRouterInterfaces(this.routerId, this.regionId, this.vpcId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listOfRouterInteface = data;
        },
        error: (e) => {
          this.notification.error(
            '',
            'Lấy danh sách Router Interface không thành công'
          );
        },
      });
  }

  getRouterStatic() {
    this.loading = true;
    this.service
      .getRouterStatics(this.routerId, this.regionId, this.vpcId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listOfRouterStatic = data;
        },
        error: (e) => {
          this.notification.error(
            '',
            'Lấy danh sách Router Static không thành công'
          );
        },
      });
  }

  isVisibleCreateInterface = false;
  modalCreateRouterInterface() {
    this.isVisibleCreateInterface = true;
  }

  handleCancelCreateInterface() {
    this.isVisibleCreateInterface = false;
  }

  handleOkCreateInterface() {
    this.isVisibleCreateInterface = false;
    this.notification.success('', 'Tạo mới Router Interface thành công');
  }

  isVisibleCreateStatic = false;
  modalCreateRouterStatic() {
    this.isVisibleCreateStatic = true;
  }

  handleCancelCreateStatic() {
    this.isVisibleCreateStatic = false;
  }

  handleOkCreateStatic() {
    this.isVisibleCreateStatic = false;
    this.notification.success('', 'Tạo mới Static Router thành công');
  }

  isVisibleDeleteInterface: boolean = false;
  routerInterfaceId: number = 0;
  modalDeleteInterface(id: number) {
    this.isVisibleDeleteInterface = true;
    this.routerInterfaceId = id;
  }
  handleOkDeleteInterface() {
    this.isVisibleDeleteInterface = false;
    // this.service.deleteRouterInterface(this.routerInterfaceId).subscribe({
    //   next: (data: any) => {
    //     if (data == 'Thao tác thành công') {
    //       this.notification.success('', 'Xóa Router Interface thành công');
    //       setTimeout(() => {
    //         this.getRouterInterfaces();
    //       }, 1500);
    //     } else {
    //       this.notification.error('', 'Xóa Router Interface không thành công');
    //     }
    //   },
    //   error: (e) => {
    //     this.notification.error('', 'Xóa Router Interface không thành công');
    //   },
    // });
  }
  handleCancelDeleteInterface() {
    this.isVisibleDeleteInterface = false;
  }

  isVisibleDeleteStatic: boolean = false;
  staticRouterId: number = 0;
  modalDeleteStatic(id: number) {
    this.isVisibleDeleteStatic = true;
    this.staticRouterId = id;
  }
  handleOkDeleteStatic() {
    this.isVisibleDeleteStatic = false;
    // this.service.deleteStaticRouter(this.staticRouterId).subscribe({
    //   next: (data: any) => {
    //     if (data == 'Thao tác thành công') {
    //       this.notification.success('', 'Xóa Static Router thành công');
    //       setTimeout(() => {
    //         this.getRouterStatic();
    //       }, 1500);
    //     } else {
    //       this.notification.error('', 'Xóa Static Router không thành công');
    //     }
    //   },
    //   error: (e) => {
    //     this.notification.error('', 'Xóa Static Router không thành công');
    //   },
    // });
  }
  handleCancelDeleteStatic() {
    this.isVisibleDeleteStatic = false;
  }

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/vpc/router']);
  }
}
