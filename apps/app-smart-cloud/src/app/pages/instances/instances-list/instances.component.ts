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
import {
  InstancesModel,
  SecurityGroupModel,
  UpdateInstances,
} from '../instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectService } from 'src/app/shared/services/project.service';
import { NotificationService } from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  userId: number;

  pageIndex = 1;
  pageSize = 10;
  total = 1;
  loading = true;
  filterStatus = [
    { text: 'Tất cả trạng thái', value: '' },
    { text: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { text: 'Đang hoạt động', value: 'KHOITAO' },
    { text: 'Chậm gia hạn, vi phạm điều khoản', value: 'TAMNGUNG' },
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
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.searchParam.status = '';
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.userId = this.tokenService.get()?.userId;
    this.getAllSecurityGroup();
    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
    }

    this.notificationService.connection.on('UpdateInstance', (data) => {
      if (data) {
        let instanceId = data.serviceId;
        let actionType = data.actionType;

        var foundIndex = this.dataList.findIndex((x) => x.id == instanceId);
        if (!instanceId) {
          return;
        }
        var foundIndex = this.dataList.findIndex((x) => x.id == instanceId);
        if (foundIndex > -1) {
          switch (actionType) {
            case 'CREATE':
              var record = this.dataList[foundIndex];

              record.status = data.status;
              record.taskState = data.taskState;
              record.ipPrivate = data.ipPrivate;
              record.ipPublic = data.ipPublic;

              this.dataList[foundIndex] = record;
              this.cdr.detectChanges();
              break;

            case 'SHUTOFF':
            case 'START':
              var record = this.dataList[foundIndex];

              record.taskState = data.taskState;

              this.dataList[foundIndex] = record;
              this.cdr.detectChanges();
              break;
          }
        }
      }
    });
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
          error: (e) => {
            this.notification.error(
              e.statusText,
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
          error: (e) => {
            this.dataList = [];
            this.activeCreate = true;
            this.notification.error(
              e.statusText,
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
          this.notification.success('', 'Yêu cầu tắt máy ảo đã được gửi đi');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'Yêu cầu tắt máy ảo không thất bại');
        }
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Yêu cầu tắt máy ảo không thực hiện được'
        );
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
          this.notification.success('', 'Yêu cầu bật máy ảo đã được gửi đi');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'Yêu cầu bật máy ảo thất bại');
        }
      },
      error: (e) => {
        this.notification.error(e.statusText, 'Yêu cầu bật máy ảo thất bại');
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
        this.notification.error(e.statusText, 'RESCUE máy ảo không thành công');
      },
    });
  }
  handleCancelRescue() {
    this.isVisibleRescue = false;
  }

  isVisibleUnRescue: boolean = false;
  showModalUnRescue(id: number) {
    this.isVisibleUnRescue = true;
    this.instanceControlId = id;
  }
  handleOkUnRescue() {
    this.isVisibleUnRescue = false;
    var body = {
      command: 'unrescue',
      id: this.instanceControlId,
    };
    this.dataService.postAction(body).subscribe({
      next: (data) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'UNRESCUE máy ảo thành công');
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          this.notification.error('', 'UNRESCUE máy ảo không thành công');
        }
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'UNRESCUE máy ảo không thành công'
        );
      },
    });
  }
  handleCancelUnRescue() {
    this.isVisibleUnRescue = false;
  }

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.max(50),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ],
    }),
  });
  updateInstances: UpdateInstances = new UpdateInstances();
  selectedSecurityGroup: string[] = [];
  isVisibleEdit = false;
  instanceEdit: InstancesModel;
  currentSecurityGroup: string[] = [];
  modalEdit(data: InstancesModel) {
    this.instanceEdit = data;
    this.selectedSecurityGroup = [];
    this.dataService
      .getAllSecurityGroupByInstance(
        data.cloudId,
        data.regionId,
        data.customerId,
        data.projectId
      )
      .subscribe({
        next: (datasg: any) => {
          console.log('getAllSecurityGroupByInstance', datasg);
          datasg.forEach((e) => {
            this.selectedSecurityGroup.push(e.id);
            this.currentSecurityGroup.push(e.id);
          });
          this.isVisibleEdit = true;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.isVisibleEdit = true;
          this.notification.error(
            e.statusText,
            'Lấy SecurityGroup của máy ảo không thành công'
          );
          this.cdr.detectChanges();
        },
      });
    this.updateInstances.name = data.name;
    this.updateInstances.customerId = this.userId;
    this.updateInstances.id = data.id;
  }

  handleCancelEdit() {
    this.isVisibleEdit = false;
  }

  handleOkEdit() {
    this.isVisibleEdit = false;
    this.updateInstances.securityGroups = this.selectedSecurityGroup.join(',');
    this.dataService.update(this.updateInstances).subscribe({
      next: (next) => {
        this.notification.success('', 'Chỉnh sửa máy ảo thành công');
        this.reloadTable();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Chỉnh sửa máy ảo không thành công'
        );
      },
    });
  }

  //#region Chọn Security Group
  listSecurityGroup: SecurityGroupModel[] = [];
  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        console.log('getAllSecurityGroup', data);
        this.listSecurityGroup = data;
      });
  }
  //#endregion

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
      this.router.navigate([
        '/app-smart-cloud/instances/instances-edit-vpc/' + id,
      ]);
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
