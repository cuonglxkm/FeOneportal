import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InstancesService } from '../instances.service';
import {
  CheckIPAddressModel,
  Instance,
  InstanceAction,
  InstancesModel,
  Network,
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
import { debounceTime, Subject, Subscription } from 'rxjs';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import {
  BackupSchedule,
  FormSearchScheduleBackup,
} from '../../../shared/models/schedule.model';
import { ScheduleService } from '../../../shared/services/schedule.service';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { CommonService } from 'src/app/shared/services/common.service';

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
  searchParam: SearchParam = new SearchParam();
  dataList: Instance[] = [];
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
  isCreateOrder: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  typeVpc: number;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private catalogService: CatalogService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private notificationService: NotificationService,
    private vlanService: VlanService,
    private backupScheduleService: ScheduleService,
    private commonSrv: CommonService,
    private policyService: PolicyService
  ) {}
  url = window.location.pathname;

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    this.userId = this.tokenService.get()?.userId;
    this.getActiveServiceByRegion();
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
            case 'REBOOT_STARTED':
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
            case 'DETACH':
              this.reloadTable();
            case 'ATTACH':
              this.reloadTable();
            case 'RESTORED':
              this.updateRowState(taskState, foundIndex);
              break;
            case 'RESTORING':
              this.updateRowState(taskState, foundIndex);
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

  //Lấy các dịch vụ hỗ trợ theo region
  isVolumeSnapshotHdd: boolean = false;
  isVolumeSnapshotSsd: boolean = false;
  isBackupVm: boolean = false;

  getActiveServiceByRegion() {
    this.catalogService
      .getActiveServiceByRegion(
        ['volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-vm'],
        this.region
      )
      .subscribe((data) => {
        console.log('support service', data);
        this.isVolumeSnapshotHdd = data.filter(
          (e) => e.productName == 'volume-snapshot-hdd'
        )[0].isActive;
        this.isVolumeSnapshotSsd = data.filter(
          (e) => e.productName == 'volume-snapshot-ssd'
        )[0].isActive;
        this.isBackupVm = data.filter(
          (e) => e.productName == 'backup-vm'
        )[0].isActive;
        this.cdr.detectChanges();
      });
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  //#region chức năng tìm kiếm
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

  //#endregion

  isFirstVisit: boolean = true;

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.isFirstVisit = false;
    this.activeCreate = false;
    this.loading = true;
    this.region = region?.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
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
    this.isCreateOrder = this.policyService.hasPermission("order:Create");
  }

  doSearch() {
    this.pageIndex = 1;
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
            if(e.status == 403){
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.non.permission')
              );
            } else {
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.notify.get.list.instance')
              );
            }
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
            if(e.status == 403){
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.non.permission')
              );
            } else {
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.notify.get.list.instance')
              );
            }
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

  //#region Gắn Vlan máy ảo
  listVlanNetwork: NetWorkModel[] = [];
  vlanCloudId: string;
  isLoadingNetwork: boolean = true;

  getListNetwork(): void {
    this.isLoadingNetwork = true;
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
        this.isLoadingNetwork = false;
        this.vlanCloudId = this.listVlanNetwork[0].cloudId;
        this.instanceAction.networkId = this.vlanCloudId;
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
            this.disableAttachVlan = false;
            this.instanceAction.portId = this.listPort[0].id;
          } else {
            this.disableAttachVlan = true;
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
    this.isInvalidIPAddress = false;
    this.instanceAction = new InstanceAction();
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

  disableAttachVlan: boolean = true;
  changeAttachType() {
    this.instanceAction.portId = null;
    this.instanceAction.ipAddress = null;
    if (this.listSubnet?.length != 0 && !this.isChoosePort) {
      this.disableAttachVlan = false;
    } else if (this.listPort?.length != 0 && this.isChoosePort) {
      this.disableAttachVlan = false;
    } else {
      this.disableAttachVlan = true;
    }
  }

  isInvalidIPAddress: boolean = false;
  invalidIPAddress: string;
  checkIPAddressModel: CheckIPAddressModel = new CheckIPAddressModel();
  dataSubjectGateway: Subject<any> = new Subject<any>();

  inputIPAddress(value) {
    this.isInvalidIPAddress = true;
    this.dataSubjectGateway.next(value);
  }

  //Validate ip address
  onCheckIPAddress() {
    this.dataSubjectGateway.pipe(debounceTime(500)).subscribe((res) => {
      if (res == null || res == '') {
        this.invalidIPAddress = '';
        this.isInvalidIPAddress = false;
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

  //#endregion

  //#region Gỡ khỏi Vlan
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

  //#endregion

  //#region Tắt máy ảo
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

  //#endregion

  //#region Bật máy ảo
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

  //#endregion

  //#region Khởi động lại máy ảo
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

  //#endregion

  //#region Rescuse, UnRescue
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

  //#endregion

  //#region Chỉnh sửa tên máy ảo
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/)],
    }),
  });
  updateInstances: UpdateInstances = new UpdateInstances();
  isVisibleEdit = false;
  instanceEdit: Instance;

  modalEdit(data: Instance) {
    this.instanceEdit = data;
    this.isVisibleEdit = true;
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

  //#endregion

  openConsole(id: number): void {
    if(this.region === RegionID.ADVANCE){
      this.router.navigateByUrl(
        '/app-smart-cloud/instances-advance/instances-console/' + id,
        {
          state: {
            vmId: id,
          },
        }
      );
    }else{
      this.router.navigateByUrl(
        '/app-smart-cloud/instances/instances-console/' + id,
        {
          state: {
            vmId: id,
          },
        }
      );
    }
  }

  navigateToCreate() {
    if (this.project.type == 1) {
      // this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc']);
      this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-create-vpc','/app-smart-cloud/instances-advance/instances-create-vpc')
    } else {
      // this.router.navigate(['/app-smart-cloud/instances/instances-create']);
      this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-create','/app-smart-cloud/instances-advance/instances-create')
    //   if(this.region === RegionID.ADVANCE){
    //     this.router.navigate(['/app-smart-cloud/instances-advance/instances-create'])
    // }else{
    //     this.router.navigate(['/app-smart-cloud/instances/instances-create'])
    // }
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
    this.getListScheduleBackup(id);
  }

  isLoading = false;
  listScheduleBackup: BackupSchedule[] = [];

  getListScheduleBackup(id) {
    this.isLoading = true;
    let formSearch = new FormSearchScheduleBackup();
    formSearch.customerId = this.tokenService.get()?.userId;
    formSearch.scheduleName = '';
    formSearch.scheduleStatus = 'ACTIVE';
    formSearch.regionId = this.region;
    formSearch.projectId = this.projectId;
    formSearch.serviceType = 1;
    formSearch.pageSize = 99999;
    formSearch.pageIndex = 1;
    formSearch.serviceId = id;
    this.backupScheduleService.search(formSearch).subscribe(
      (data) => {
        this.isLoading = false;
        this.listScheduleBackup = data?.records;
        if (this.listScheduleBackup?.length <= 0) {
          if (this.typeVpc == 1) {
            this.router.navigate([
              '/app-smart-cloud/schedule/backup/create/vpc',
              { type: 'INSTANCE', instanceId: id },
            ]);
          } else {
            this.router.navigate([
              '/app-smart-cloud/schedule/backup/create',
              { type: 'INSTANCE', instanceId: id },
            ]);
          }
        } else {
          this.listScheduleBackup.forEach((item) => {
            if (this.typeVpc == 1) {
              if (item.serviceId == id) {
                this.notification.warning(
                  '',
                  this.i18n.fanyi('schedule.backup.block.create')
                );
              } else {
                this.router.navigate([
                  '/app-smart-cloud/schedule/backup/create/vpc',
                  { type: 'INSTANCE', instanceId: id },
                ]);
              }
            } else {
              if (item.serviceId == id) {
                this.notification.warning(
                  '',
                  this.i18n.fanyi('schedule.backup.block.create')
                );
              } else {
                this.router.navigate([
                  '/app-smart-cloud/schedule/backup/create',
                  { type: 'INSTANCE', instanceId: id },
                ]);
              }
            }
          });
        }
      },
      (error) => {
        this.isLoading = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.failData')
        );
      }
    );
  }

  createSnapshot(id: number) {
    // this.router.navigate(
    //   ['/app-smart-cloud/snapshot/create', { instanceId: id }],
    //   { queryParams: { navigateType: 1 } }
    // );
    this.router.navigate(
      ['/app-smart-cloud/snapshot/create'],
      { queryParams:{ instanceId: id ,  navigateType: 1 } }
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
      ['/app-smart-cloud/schedule/snapshot/create'],
      { queryParams: { instanceId: id, snapshotTypeCreate: 1 } }
    );
  }

  navigateToInstanceList(){
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
  }

  navigateToInstanceDetail(id){
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-detail/' + id, '/app-smart-cloud/instances-advance/instances-detail/' + id)
  }
}
