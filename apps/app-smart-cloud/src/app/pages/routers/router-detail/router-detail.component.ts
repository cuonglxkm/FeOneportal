import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STIcon } from '@delon/abc/st';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  RouterInteface,
  RouterIntefaceCreate,
  StaticRouter,
} from 'src/app/shared/models/router.model';
import { FormSearchSubnet, Subnet } from 'src/app/shared/models/vlan.model';
import { RouterService } from 'src/app/shared/services/router.service';
import { VlanService } from 'src/app/shared/services/vlan.service';

@Component({
  selector: 'one-portal-router-detail',
  templateUrl: './router-detail.component.html',
  styleUrls: ['../router-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterDetailComponent implements OnInit {
  routerId: string;
  regionId: number;
  vpcId: number;
  networkId: number;
  listOfRouterInteface: RouterInteface[] = [];
  listOfRouterStatic: StaticRouter[] = [];
  loading: boolean = true;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: RouterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private vlanService: VlanService
  ) {}

  ngOnInit(): void {
    this.routerId = this.activatedRoute.snapshot.paramMap.get('routerId');
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.vpcId = regionAndProject.projectId;
    this.getRouterInterfaces();
    this.getRouterStatic();
    this.getListSubnet();
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
            e.statusText,
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
            e.statusText,
            'Lấy danh sách Router Static không thành công'
          );
        },
      });
  }

  listSubnet: Subnet[] = [];
  getListSubnet() {
    let formSearchSubnet = new FormSearchSubnet();
    formSearchSubnet.networkId = this.networkId;
    formSearchSubnet.customerId = this.tokenService.get()?.userId;
    formSearchSubnet.region = this.regionId;
    formSearchSubnet.pageSize = 9999;
    formSearchSubnet.pageNumber = 0;
    formSearchSubnet.name = null;

    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe((data) => {
      console.log('data-subnet', data);
      this.listSubnet = data.records;
    });
  }

  isVisibleCreateInterface = false;
  routerInterfaceCreate: RouterIntefaceCreate = new RouterIntefaceCreate();
  modalCreateRouterInterface() {
    this.isVisibleCreateInterface = true;
  }

  handleCancelCreateInterface() {
    this.isVisibleCreateInterface = false;
  }

  handleOkCreateInterface() {
    this.isVisibleCreateInterface = false;
    this.routerInterfaceCreate.regionId = this.regionId;
    this.routerInterfaceCreate.routerId = this.routerId;
    this.service.createRouterInterface(this.routerInterfaceCreate).subscribe({
      next: (data) => {
        this.notification.success('', 'Tạo mới Router Interface thành công');
        this.getRouterInterfaces();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Tạo mới Router Interface không thành công'
        );
      },
    });
  }

  isVisibleCreateStatic = false;
  staticRouterCreate: StaticRouter = new StaticRouter();
  modalCreateRouterStatic() {
    this.isVisibleCreateStatic = true;
    this.staticRouterCreate.routerId = this.routerId;
    this.staticRouterCreate.regionId = this.regionId;
    this.staticRouterCreate.customerId = this.tokenService.get()?.userId;
    this.staticRouterCreate.vpcId = this.vpcId;
    this.service.createStaticRouter(this.staticRouterCreate).subscribe({
      next: (data) => {
        this.notification.success('', 'Tạo mới Static Router thành công');
        this.getRouterStatic();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Tạo mới Static Router không thành công'
        );
      },
    });
  }

  handleCancelCreateStatic() {
    this.isVisibleCreateStatic = false;
  }

  handleOkCreateStatic() {
    this.isVisibleCreateStatic = false;
    this.notification.success('', 'Tạo mới Static Router thành công');
  }

  isVisibleDeleteInterface: boolean = false;
  subnetId: number = 0;
  modalDeleteInterface(subnetId: number) {
    this.isVisibleDeleteInterface = true;
    this.subnetId = subnetId;
  }
  handleOkDeleteInterface() {
    this.isVisibleDeleteInterface = false;
    this.service
      .deleteRouterInterface(
        this.routerId,
        this.regionId,
        this.subnetId,
        this.vpcId
      )
      .subscribe({
        next: (data: any) => {
          if (data == 'Thao tác thành công') {
            this.notification.success('', 'Xóa Router Interface thành công');
            setTimeout(() => {
              this.getRouterInterfaces();
            }, 1500);
          } else {
            this.notification.error(
              '',
              'Xóa Router Interface không thành công'
            );
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Xóa Router Interface không thành công'
          );
        },
      });
  }
  handleCancelDeleteInterface() {
    this.isVisibleDeleteInterface = false;
  }

  isVisibleDeleteStatic: boolean = false;
  destinationCIDR: string = '';
  nextHop: string = '';
  modalDeleteStatic(item: StaticRouter) {
    this.isVisibleDeleteStatic = true;
    this.destinationCIDR = item.destinationCIDR;
    this.nextHop = item.nextHop;
  }
  handleOkDeleteStatic() {
    this.isVisibleDeleteStatic = false;
    this.service
      .deleteStaticRouter(
        this.routerId,
        this.destinationCIDR,
        this.nextHop,
        this.regionId,
        this.vpcId
      )
      .subscribe({
        next: (data: any) => {
          if (data == 'Thao tác thành công') {
            this.notification.success('', 'Xóa Static Router thành công');
            setTimeout(() => {
              this.getRouterStatic();
            }, 1500);
          } else {
            this.notification.error('', 'Xóa Static Router không thành công');
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Xóa Static Router không thành công'
          );
        },
      });
  }
  handleCancelDeleteStatic() {
    this.isVisibleDeleteStatic = false;
  }

  onRegionChange(region: any) {
    this.navigateToList();
  }
  onProjectChange(project: any) {
    this.navigateToList();
  }

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/network/router']);
  }
}
