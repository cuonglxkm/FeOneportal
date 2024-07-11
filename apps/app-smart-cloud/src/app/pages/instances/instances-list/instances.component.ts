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
  CheckIPAddressModel,
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
import {
  NotificationService,
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, Subscription } from 'rxjs';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
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

  typeVpc: number;

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
    
    this.notificationService.connection.on('UpdateInstance', (data) => {
      if (data) {
        let instanceId = data.serviceId;
        let actionType = data.actionType;
        var taskState = data?.data?.taskState ?? '';
        var flavorName = data?.data?.flavorName ?? '';

        var foundIndex = this.dataList.findIndex((x) => x.id == instanceId);
        if (foundIndex > -1) {
          switch (actionType) {
            case 'SHUTOFF':
              this.reloadTable();
            case 'START':
              this.reloadTable();
            case 'REBOOTING':
              this.updateRowState(taskState, foundIndex);
            case 'REBOOT':
              this.updateRowState(taskState, foundIndex);
              break;
            case 'RESIZING':
              this.updateRowState(taskState, foundIndex);
              break;
            case 'RESIZED':
              var record = this.dataList[foundIndex];
              if (taskState) {
                record.taskState = taskState;
              }
              if (flavorName) {
                record.flavorName = flavorName;
              }
              this.dataList[foundIndex] = record;
              this.cdr.detectChanges();
              break;
            case 'RESIZEFAILED':
              this.reloadTable();
            case 'REBUILDING':
              this.updateRowState(taskState, foundIndex);
              break;
            case 'REBUILDED':
              this.updateRowState(taskState, foundIndex);
              break;
            case 'DELETING':
              this.updateRowState(taskState, foundIndex);
            case 'DELETED':
              this.reloadTable();
          }
        } else {
          switch (actionType) {
            case 'CREATING':
            case 'CREATED':
              this.activeCreate = false;
              this.getDataList();
              break;
          }
        }
      }
    });
    this.checkExistName();
    this.onCheckIPAddress();
    this.onChangeSearchParam();
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  dataSubjectSearchParam: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  changeSearchParam(value: string) {
    this.enterPressed = false;
    this.dataSubjectSearchParam.next(value);
  }

  onChangeSearchParam() {
    this.searchSubscription = this.dataSubjectSearchParam
      .pipe(debounceTime(700))
      .subscribe((res) => {
        if (!this.enterPressed) {
          this.doSearch();
        }
      });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    this.doSearch();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  isFirstVisit: boolean = true;
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.isFirstVisit = false;
    this.activeCreate = false;
    this.loading = true;
    this.region = region?.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.isFirstVisit = false;
    this.project = project;
    this.activeCreate = false;
    this.loading = true;
    this.projectId = project?.id;
    this.typeVpc = project?.type;
    this.getDataList();
    this.getListNetwork();
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
          this.searchParam.name.trim(),
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
              this.i18n.fanyi('app.notify.get.list.instance')
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
              this.dataList = [];
              this.activeCreate = true;
            }
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.dataList = [];
            this.activeCreate = true;
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notify.get.list.instance')
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
  vlanCloudId: string;
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
        this.vlanCloudId = this.listVlanNetwork[0].cloudId;
        this.getListPort(this.vlanCloudId);
        this.getVlanSubnets(this.vlanCloudId);
        this.cdr.detectChanges();
      });
  }

  listPort: Port[] = [];
  portLoading: boolean;
  getListPort(networkCloudId: string) {
    this.portLoading = true;
    this.listPort = [];
    this.dataService
      .getListAllPortByNetwork(networkCloudId, this.region)
      .subscribe({
        next: (data) => {
          this.listPort = data.filter((e) => e.attachedDeviceId == '');
          this.portLoading = false;
          if (this.listPort.length != 0) {
            this.instanceAction.portId = this.listPort[0].id;
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.get.list.port')
          );
        },
      });
  }

  changeVlanNetwork(networkCloudId: string) {
    this.instanceAction.ipAddress = null;
    this.getVlanSubnets(networkCloudId);
    this.getListPort(networkCloudId);
  }

  listSubnet: VlanSubnet[] = [];
  listSubnetStr: string = '';
  loadingSubnet: boolean = false;
  getVlanSubnets(networkCloudId: string): void {
    this.listSubnet = [];
    this.listSubnetStr = '';
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
          this.listSubnetStr = this.listSubnet
            .map((item) => `${item.name} (${item.subnetAddressRequired})`)
            .join(', ');
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('router.nofitacation.subnet.fail')
          );
        },
      });
  }

  instanceAction: InstanceAction = new InstanceAction();
  isChoosePort: boolean = true;
  showHandleGanVLAN(id: number) {
    this.isChoosePort = true;
    this.instanceAction = new InstanceAction();
    this.instanceAction.networkId = this.vlanCloudId;
    this.getListNetwork();
    this.instanceAction.id = id;
    this.instanceAction.command = 'attachinterface';
    this.instanceAction.customerId = this.userId;
    this.isVisibleGanVLAN = true;
  }

  handleCancelGanVLAN(): void {
    this.isVisibleGanVLAN = false;
  }

  handleOkGanVLAN(): void {
    this.isVisibleGanVLAN = false;
    this.dataService.postAction(this.instanceAction).subscribe({
      next: (data: any) => {
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.attach.vlan.success')
        );
        this.getDataList();
        this.getDataList();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.attach.vlan.fail')
        );
      },
    });
  }

  navigatetoCreatePort() {
    let selectedVlan = this.listVlanNetwork.filter(
      (e) => e.cloudId == this.instanceAction.networkId
    );
    this.router.navigate(
      [`/app-smart-cloud/vlan/network/detail/${selectedVlan[0].id}`],
      {
        state: { selectedIndextab: 1 },
      }
    );
  }

  changeAttachType() {
    this.instanceAction.portId = null;
    this.instanceAction.ipAddress = null;
  }

  isInvalidIPAddress: boolean = false;
  invalidIPAddress: string;
  checkIPAddressModel: CheckIPAddressModel = new CheckIPAddressModel();
  dataSubjectGateway: Subject<any> = new Subject<any>();
  inputIPAddress(value) {
    this.dataSubjectGateway.next(value);
  }

  onCheckIPAddress() {
    this.dataSubjectGateway.pipe(debounceTime(500)).subscribe((res) => {
      if (res == null || res == '') {
        this.invalidIPAddress = '';
      } else {
        this.checkIPAddressModel.ipAddress = res;
        this.checkIPAddressModel.listCIDR = this.listVlanNetwork
          .filter((e) => e.cloudId == this.instanceAction.networkId)[0]
          .subnetAddressRequired.split(', ');
        this.checkIPAddressModel.networkId = this.instanceAction.networkId;
        this.checkIPAddressModel.regionId = this.region;
        this.dataService
          .checkIpAvailableToListSubnet(this.checkIPAddressModel)
          .subscribe({
            next: (data) => {
              this.isInvalidIPAddress = false;
              this.invalidIPAddress = '';
            },
            error: (error) => {
              this.isInvalidIPAddress = true;
              if (error.status == '400') {
                console.log('error', error.error);
                if (error.error.includes('Ip khong thuoc Allocation Pool!'))
                  this.invalidIPAddress = this.i18n.fanyi(
                    'validation.ip.address.not.of.pool'
                  );
                if (error.error.includes('Port khong co san!'))
                  this.invalidIPAddress = this.i18n.fanyi(
                    'validation.ip.address.exist'
                  );
              } else {
                this.invalidIPAddress = this.i18n.fanyi(
                  'validation.ip.address.pattern'
                );
              }
            },
          });
      }
    });
  }

  listOfPrivateNetwork: Network[];
  getListIpPrivate(id: number) {
    this.dataService
      .getPortByInstance(id, this.region)
      .subscribe((dataNetwork: any) => {
        //list IP Lan
        this.listOfPrivateNetwork = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        this.isVisibleGoKhoiVLAN = true;
        this.cdr.detectChanges();
      });
  }

  showHandleGoKhoiVLAN(id: number) {
    this.instanceAction = new InstanceAction();
    this.instanceAction.id = id;
    this.instanceAction.command = 'detachinterface';
    this.instanceAction.customerId = this.userId;
    this.getListIpPrivate(id);
    this.isVisibleGoKhoiVLAN = true;
  }

  handleCancelGoKhoiVLAN(): void {
    this.isVisibleGoKhoiVLAN = false;
  }

  handleOkGoKhoiVLAN(): void {
    this.isVisibleGoKhoiVLAN = false;
    this.dataService.postAction(this.instanceAction).subscribe({
      next: (data: any) => {
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.detach.vlan.success')
        );
        this.getDataList();
        this.getDataList();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.detach.vlan.fail')
        );
      },
    });
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.request.shutdown.instances.success')
        );
        setTimeout(() => {
          this.reloadTable();
        }, 1500);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.request.shutdown.instances.fail')
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.request.start.instances.success')
        );
        setTimeout(() => {
          this.reloadTable();
        }, 1500);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.request.start.instances.fail')
        );
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.request.reboot.instances.success')
        );
        setTimeout(() => {
          this.reloadTable();
        }, 1500);
      },
      error: (e) => {
        this.notification.error(
          '',
          this.i18n.fanyi('app.notify.request.reboot.instances.fail')
        );
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.rescue.instances.success')
        );
        setTimeout(() => {
          this.reloadTable();
        }, 1500);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.rescue.instances.fail')
        );
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.unrescue.instances.success')
        );
        setTimeout(() => {
          this.reloadTable();
        }, 1500);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.unrescue.instances.fail')
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
            this.i18n.fanyi('app.notify.get.sg.of.instance.fail')
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
            .checkExistName(res, this.region, this.projectId)
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
        this.notification.success(
          '',
          this.i18n.fanyi('app.notify.edit.instances.success')
        );
        this.reloadTable();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notify.edit.instances.fail')
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
    if (this.project.type == 1) {
      this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc']);
    } else {
      this.router.navigate(['/app-smart-cloud/instances/instances-create']);
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
    if (this.typeVpc == 1) {
      this.router.navigate([
        '/app-smart-cloud/backup-vm/create/vpc',
        { instanceId: id },
      ]);
    } else {
      this.router.navigate([
        '/app-smart-cloud/backup-vm/create/no-vpc',
        { instanceId: id },
      ]);
    }
  }

  createBackupSchedule(id: number) {
    this.router.navigate([
      '/app-smart-cloud/schedule/backup/create',
      { instanceId: id },
    ]);
  }

  createSnapshot(id: number) {
    this.router.navigate(
      ['/app-smart-cloud/snapshot/create', { instanceId: id }],
      { queryParams: { navigateType: 1 } }
    );
  }

  instancesModel: InstancesModel = new InstancesModel();
  detailConfigPackage(id: number) {
    this.instancesModel = new InstancesModel();
    this.dataService.getById(id, true).subscribe({
      next: (data: any) => {
        this.instancesModel = data;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.notification.error(
          '',
          this.i18n.fanyi('app.notify.get.service.package.fail')
        );
      },
    });
  }

  updateRowState(taskState: string, foundIndex: number) {
    var record = this.dataList[foundIndex];
    if (taskState) {
      record.taskState = taskState;
    }
    this.dataList[foundIndex] = record;
    this.cdr.detectChanges();
  }

  navigateToCreateScheduleSnapshot(id: number) {
    this.router.navigate(
      ['/app-smart-cloud/schedule/snapshot/create', { instanceId: id }],
      { queryParams: { snapshotTypeCreate: 1 } }
    );
  }
}
