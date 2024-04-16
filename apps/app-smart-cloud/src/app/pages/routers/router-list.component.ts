import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import {
  RouterCreate,
  RouterModel,
  RouterUpdate,
} from 'src/app/shared/models/router.model';
import { RouterService } from 'src/app/shared/services/router.service';
import {
  FormSearchNetwork,
  NetWorkModel,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';

@Component({
  selector: 'one-portal-router-list',
  templateUrl: './router-list.component.html',
  styleUrls: ['./router-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterListComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;
  dataList: RouterModel[] = [];
  isTrigger: boolean = false;
  currentPage = 1;
  pageSize = 10;
  total = 1;
  loading = true;
  filterGender = [
    { text: 'male', value: 'male' },
    { text: 'female', value: 'female' },
  ];
  searchGenderList: string[] = [];
  filterStatus = [
    { text: 'Tất cả trạng thái', value: '' },
    { text: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
    { text: 'Tạm ngưng', value: 'TAMNGUNG' },
  ];

  listVLAN: [{ id: ''; text: 'Chọn VLAN' }];
  listSubnet: [{ id: ''; text: 'Chọn Subnet' }];
  listIPAddress: [{ id: ''; text: 'Chọn địa chỉ IP' }];
  listIPAddressOnVLAN: [{ id: ''; text: 'Chọn địa chỉ IP' }];

  cloudId: string;
  region: number;
  projectId: number;
  project: ProjectModel;
  activeCreate: boolean = false;
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: RouterService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private vlanService: VlanService
  ) {}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getListNetwork();
  }

  selectedChecked(e: any): void {
    // @ts-ignore
    this.checkedCashArray = [...e];
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.activeCreate = false;
    this.loading = true;
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.activeCreate = false;
    this.loading = true;
    this.projectId = project.id;
    this.getDataList();
  }

  doSearch() {
    if (this.region != undefined && this.region != null) {
      this.loading = true;
      this.dataService
        .getListRouter(this.region, this.pageSize, this.currentPage)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (next) => {
            this.dataList = next.records;
            this.total = next.totalCount;
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Lấy danh sách Router không thành công'
            );
          },
        });
    }
  }

  getDataList() {
    if (this.region != undefined && this.region != null) {
      this.loading = true;
      this.dataService
        .getListRouter(this.region, this.pageSize, this.currentPage)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (data) => {
            if (data != null && data.records && data.records.length > 0) {
              this.activeCreate = false;
              this.dataList = data.records;
              this.total = data.totalCount;
            } else {
              this.activeCreate = true;
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.dataList = [];
            this.activeCreate = true;
            this.notification.error(
              e.statusText,
              'Lấy danh sách Router không thành công'
            );
          },
        });
    }
  }

  reloadTable() {
    this.dataList = [];
    this.getDataList();
  }

  getStatus(value: string): string {
    const foundItem = this.filterStatus.find((item) => item.value === value);

    if (foundItem) {
      return foundItem.text;
    } else {
      return value;
    }
  }

  listNetwork: NetWorkModel[] = [];

  getListNetwork(): void {
    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
    formSearchNetwork.region = this.region;
    formSearchNetwork.project = this.projectId;
    formSearchNetwork.pageNumber = 0;
    formSearchNetwork.pageSize = 9999;
    formSearchNetwork.vlanName = '';
    this.vlanService
      .getVlanNetworks(formSearchNetwork)
      .subscribe((data: any) => {
        this.listNetwork = data.records;
        this.cdr.detectChanges();
      });
  }

  routerCreate: RouterCreate = new RouterCreate();
  isVisibleCreate = false;
  modalCreate() {
    this.isVisibleCreate = true;
    this.isTrigger = false;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false;
    this.routerCreate.adminState = this.isTrigger;
    this.routerCreate.customerId = this.tokenService.get()?.userId;
    this.routerCreate.regionId = this.region;
    this.routerCreate.vpcId = this.projectId;
    this.dataService.createRouter(this.routerCreate).subscribe({
      next: (data) => {
        this.notification.success('', 'Tạo mới Router thành công');
        this.getListNetwork();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Tạo mới Router không thành công'
        );
      },
    });
  }

  routerUpdate: RouterUpdate = new RouterUpdate();
  isVisibleEdit = false;
  modalEdit(dataRouter: RouterModel) {
    this.isVisibleEdit = true;
    this.isTrigger = dataRouter.status.toUpperCase() == 'ACTIVE' ? true : false;
    this.cloudId = dataRouter.cloudId;
    this.routerUpdate.id = dataRouter.cloudId;
    this.routerUpdate.adminState = dataRouter.adminState;
    this.routerUpdate.customerId = this.tokenService.get()?.userId;
    this.routerUpdate.regionId = dataRouter.regionId;
    this.routerUpdate.routerName = dataRouter.routerName;
    this.routerUpdate.vpcId = dataRouter.vpcId;
    this.routerUpdate.networkId = dataRouter.networkId;
  }

  handleCancelEdit() {
    this.isVisibleEdit = false;
  }

  handleOkEdit() {
    this.isVisibleEdit = false;
    this.dataService.updateRouter(this.routerUpdate).subscribe({
      next: (data) => {
        this.notification.success('', 'Chỉnh sửa Router thành công');
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Chỉnh sửa Router không thành công'
        );
      },
    });
  }

  isVisibleDelete: boolean = false;
  nameVerify: string;
  nameRouterDelete: string;
  modalDelete(cloudId: string, nameRouter: string) {
    this.nameVerify = '';
    this.cloudId = cloudId;
    this.nameRouterDelete = nameRouter;
    this.isVisibleDelete = true;
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.notification.success('', 'Xóa Router thành công');
    if (this.nameVerify == this.nameRouterDelete) {
      this.dataService
        .deleteRouter(this.cloudId, this.region, this.projectId)
        .subscribe({
          next: (data) => {
            console.log(data);
            this.notification.success('', 'Xóa Router thành công');
            this.reloadTable();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Xóa Router không thành công'
            );
          },
        });
    } else {
      this.notification.error('', 'Xóa Router không thành công');
    }
  }
}
