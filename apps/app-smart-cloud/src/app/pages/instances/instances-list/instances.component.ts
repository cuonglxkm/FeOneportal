import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { InstancesService } from '../instances.service';
import { PageHeaderType } from 'src/app/core/models/interfaces/page';
import { InstancesModel } from '../instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectService } from 'src/app/shared/services/project.service';

class SearchParam {
  status: string = '';
  name: string = '';
}

@Component({
  selector: 'one-portal-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.less'],
})
export class InstancesComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;
  searchParam: Partial<SearchParam> = {};
  dataList: InstancesModel[] = [];

  pageIndex = 1;
  pageSize = 10;
  total = 1;
  loading = true;
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

  selectedOptionAction: string;
  actionData: InstancesModel;

  region: number;
  projectId: number;
  project: ProjectModel;
  activeCreate: boolean = false;
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.searchParam.status = '';
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
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
    this.project = project;
    this.activeCreate = false;
    this.loading = true;
    this.projectId = project.id;
    this.getDataList();
  }

  doSearch() {
    if (this.region != undefined && this.region != null) {
      this.loading = true;
      this.dataService
        .search(
          this.pageIndex,
          this.pageSize,
          this.region,
          this.projectId,
          this.searchParam.name,
          this.searchParam.status,
          true,
          this.tokenService.get()?.userId
        )
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
          error: (error) => {
            this.notification.error(
              '',
              'Lấy danh sách máy ảo không thành công'
            );
          },
        });
    }
  }

  getDataList() {
    if (this.region != undefined && this.region != null) {
      this.loading = true;
      this.dataService
        .search(
          this.pageIndex,
          this.pageSize,
          this.region,
          this.projectId,
          this.searchParam.name,
          this.searchParam.status,
          true,
          this.tokenService.get()?.userId
        )
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
          error: (error) => {
            this.dataList = [];
            this.activeCreate = true;
            this.notification.error(
              '',
              'Lấy danh sách máy ảo không thành công'
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

  showHandleGanVLAN() {
    this.isVisibleGanVLAN = true;
  }

  handleCancelGanVLAN(): void {
    this.actionData = null;
    this.isVisibleGanVLAN = false;
  }

  handleOkGanVLAN(): void {
    this.notification.success('', 'Gắn VLAN thành công');
    //this.actionData = null;
    this.isVisibleGanVLAN = false;
    // var body = {};
    // this.dataService.postAction(this.actionData.id, body).subscribe(
    //   (data: any) => {
    //     console.log(data);
    //     if (data == true) {
    //       this.notification.success('', 'Gắn VLAN thành công');
    //     } else {
    //       this.notification.error('', 'Gắn VLAN không thành công');
    //     }
    //   },
    //   () => {
    //     this.notification.error('', 'Gắn VLAN không thành công');
    //   }
    // );
  }

  showHandleGoKhoiVLAN() {
    this.isVisibleGoKhoiVLAN = true;
  }

  handleCancelGoKhoiVLAN(): void {
    this.actionData = null;
    this.isVisibleGoKhoiVLAN = false;
  }

  handleOkGoKhoiVLAN(): void {
    this.notification.success('', 'Gỡ khỏi VLAN thành công');
    this.isVisibleGoKhoiVLAN = false;
  }

  isExpand = false;
  clickIPAddress(): void {
    this.isExpand = !this.isExpand;
  }

  isVisibleShutdown: boolean = false;
  instanceControlId: number = 0;
  showModalShutdown(id: number) {
    this.isVisibleShutdown = true;
    this.instanceControlId = id;
  }
  handleOkShutdown() {
    this.isVisibleShutdown = false;
    var body = {
      command: 'shutdown',
      id: this.instanceControlId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data: any) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Tắt máy ảo thành công');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'Tắt máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error('', 'Tắt máy ảo không thành công');
      },
    });
  }
  handleCancelShutdown() {
    this.isVisibleShutdown = false;
  }

  isVisibleStart: boolean = false;
  showModalStart(id: number) {
    this.isVisibleStart = true;
    this.instanceControlId = id;
  }
  handleOkStart() {
    this.isVisibleStart = false;
    var body = {
      command: 'start',
      id: this.instanceControlId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data: any) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Bật máy ảo thành công');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'Bật máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error('', 'Bật máy ảo không thành công');
      },
    });
  }
  handleCancelStart() {
    this.isVisibleStart = false;
  }

  isVisibleRestart: boolean = false;
  showModalRestart(id: number) {
    this.isVisibleRestart = true;
    this.instanceControlId = id;
  }
  handleOkRestart() {
    this.isVisibleRestart = false;
    var body = {
      command: 'restart',
      id: this.instanceControlId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Khởi động lại máy ảo thành công');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          ('Khởi động lại máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error('', 'Khởi động lại máy ảo không thành công');
      },
    });
  }
  handleCancelRestart() {
    this.isVisibleRestart = false;
  }

  isVisibleRescue: boolean = false;
  showModalRescue(id: number) {
    this.isVisibleRescue = true;
    this.instanceControlId = id;
  }
  handleOkRescue() {
    this.isVisibleRescue = false;
    var body = {
      command: 'rescue',
      id: this.instanceControlId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'RESCUE máy ảo thành công');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'RESCUE máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error('', 'RESCUE máy ảo không thành công');
      },
    });
  }
  handleCancelRescue() {
    this.isVisibleRescue = false;
  }

  openConsole(id: number): void {
    this.router.navigateByUrl(
      '/app-smart-cloud/instances/instances-console/' + id,
      {
        state: {
          vmId: id,
        },
      }
    );
  }

  navigateToCreate() {
    if (this.project.type == 0) {
      this.router.navigate(['/app-smart-cloud/instances/instances-create']);
    } else {
      this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc']);
    }
  }
  navigateToEdit(id: number) {
    if (this.project.type == 0) {
      this.router.navigate(['/app-smart-cloud/instances/instances-edit/' + id]);
    } else {
      this.router.navigate(['/app-smart-cloud/instances/instances-edit-vpc/' + id]);
    }
  }

  navigateToCreateBackup(id: number) {
    console.log('data ', id);
    // this.dataService.setSelectedObjectId(id)
    this.router.navigate([
      '/app-smart-cloud/instance/' + id + '/create-backup-vm',
    ]);
  }
}
