import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InstancesService } from '../instances.service';
import {
  InstanceAction,
  InstancesModel,
  Network,
  SecurityGroupModel,
  UpdateInstances,
  VlanSubnet,
} from '../instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { NotificationService, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import {
  FormSearchNetwork,
  NetWorkModel,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

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
    { text: this.i18n.fanyi('app.status.all'), value: '' },
    { text: this.i18n.fanyi('app.status.running'), value: 'KHOITAO' },
    { text: this.i18n.fanyi('app.status.suspended'), value: 'TAMNGUNG' },
  ];

  listIPAddressOnVLAN: [{ id: ''; text: 'Chọn địa chỉ IP' }];

  selectedOptionAction: string;
  region: number;
  projectId: number;
  project: ProjectModel;
  activeCreate: boolean = false;
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private notificationService: NotificationService,
    private vlanService: VlanService
  ) {}

  ngOnInit() {
    console.log('current language', this.i18n.currentLang);
    this.searchParam.status = '';
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.userId = this.tokenService.get()?.userId;
    this.getListNetwork();
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
            case 'REBOOT':
              var record = this.dataList[foundIndex];

              record.taskState = data.taskState;

              this.dataList[foundIndex] = record;
              this.cdr.detectChanges();
              break;

            case 'RESIZING':
            case 'RESIZED':
              var record = this.dataList[foundIndex];

              if (data.status) {
                record.status = data.status;
              }

              if (data.taskState) {
                record.taskState = data.taskState;
              }

              if (data.flavorName) {
                record.flavorName = data.flavorName;
              }

              this.dataList[foundIndex] = record;
              this.cdr.detectChanges();
              break;
          }
        }
      }
    });
    this.checkExistName();
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

  listVlanNetwork: NetWorkModel[] = [];
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
        this.listVlanNetwork = data.records;
        this.cdr.detectChanges();
      });
  }

  changeVlanNetwork(networkCloudId: string) {
    this.listSubnet = [];
    this.instanceAction.subnetId = null;
    this.instanceAction.ipAddress = null;
    this.getVlanSubnets(networkCloudId);
  }

  listSubnet: VlanSubnet[] = [];
  loadingSubnet: boolean = false;
  getVlanSubnets(networkCloudId: string): void {
    this.loadingSubnet = true;
    this.dataService
      .getVlanSubnets(9999, 0, this.region, networkCloudId)
      .pipe(
        finalize(() => {
          this.loadingSubnet = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listSubnet = data.records;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Subnet không thành công'
          );
        },
      });
  }

  instanceAction: InstanceAction = new InstanceAction();
  showHandleGanVLAN(id: number) {
    this.instanceAction = new InstanceAction();
    this.instanceAction.id = id;
    this.instanceAction.command = 'attachinterface';
    this.isVisibleGanVLAN = true;
  }

  handleCancelGanVLAN(): void {
    this.isVisibleGanVLAN = false;
  }

  handleOkGanVLAN(): void {
    this.isVisibleGanVLAN = false;
    this.dataService.postAction(this.instanceAction).subscribe({
      next: (data: any) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Gắn VLAN thành công');
          this.reloadTable();
        } else {
          this.notification.error('', 'Gắn VLAN không thành công');
        }
      },
      error: (e) => {
        this.notification.error(e.statusText, 'Gắn VLAN không thành công');
      },
    });
  }

  listOfPrivateNetwork: Network[];
  getListIpPublic(id: number) {
    this.dataService
      .getPortByInstance(id, this.region)
      .subscribe((dataNetwork: any) => {
        //list IP Lan
        this.listOfPrivateNetwork = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        this.cdr.detectChanges();
      });
  }

  showHandleGoKhoiVLAN(id: number) {
    this.instanceAction = new InstanceAction();
    this.instanceAction.id = id;
    this.instanceAction.command = 'detachinterface';
    this.isVisibleGoKhoiVLAN = true;
  }

  handleCancelGoKhoiVLAN(): void {
    this.isVisibleGoKhoiVLAN = false;
  }

  handleOkGoKhoiVLAN(): void {
    this.isVisibleGoKhoiVLAN = false;
    this.dataService.postAction(this.instanceAction).subscribe({
      next: (data: any) => {
        if (data == 'Thao tác thành công') {
          this.notification.success('', 'Gỡ khỏi VLAN thành công');
          this.reloadTable();
        } else {
          this.notification.error('', 'Gỡ khỏi VLAN không thành công');
        }
      },
      error: (e) => {
        this.notification.error(e.statusText, 'Gỡ khỏi VLAN không thành công');
      },
    });
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
          this.notification.success(
            '',
            'Yêu cầu khởi động lại máy ảo đã được gửi đi'
          );
          setTimeout(() => {
            this.reloadTable();
          }, 1500);
        } else {
          ('Yêu cầu khởi động lại máy ảo thất bại');
        }
      },
      error: (e) => {
        this.notification.error('', 'Yêu cầu khởi động lại máy ảo thất bại');
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
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/)],
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

  //Kiểm tra trùng tên máy ảo
  dataSubjectName: Subject<any> = new Subject<any>();
  changeName(value: number) {
    this.dataSubjectName.next(value);
  }

  isExistName: boolean = false;
  checkExistName() {
    this.dataSubjectName
      .pipe(
        debounceTime(300) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (this.updateInstances.name == this.instanceEdit.name) {
          this.isExistName = false;
          this.cdr.detectChanges();
        } else {
          this.dataService
            .checkExistName(res, this.region)
            .subscribe((data) => {
              if (data == true) {
                this.isExistName = true;
              } else {
                this.isExistName = false;
              }
              this.cdr.detectChanges();
            });
        }
      });
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

  createBackupSchedule(id: number) {
    this.router.navigate([
      '/app-smart-cloud/schedule/backup/create',
      { instanceId: id },
    ]);
  }
}
