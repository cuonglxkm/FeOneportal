import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import {
  getCurrentRegionAndProject,
  getListGpuConfigRecommend,
  getUniqueObjects,
} from '@shared';
import {
  BackupVm,
  RestoreFormCurrent,
  RestoreInstanceBackup,
  VolumeBackup,
  VolumeExternalBackup,
} from '../../../shared/models/backup-vm';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import {
  GpuConfigRecommend,
  GpuProject,
  GpuUsage,
  InfoVPCModel,
  InstancesModel,
  IPPublicModel,
  OfferItem,
  Order,
  OrderItem,
  SHHKeyModel,
} from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
} from '../../../shared/models/vlan.model';
import { VlanService } from '../../../shared/services/vlan.service';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { LoadingService } from '@delon/abc/loading';
import { OrderService } from 'src/app/shared/services/order.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  newName?: string;
  capacity?: number = 0;
  minCapacity?: number = 0;
  encrypt?: boolean = false;
  multiattach?: boolean = false;
}
@Component({
  selector: 'one-portal-restore-backup-vm-vpc',
  templateUrl: './restore-backup-vm-vpc.component.html',
  styleUrls: ['./restore-backup-vm-vpc.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestoreBackupVmVpcComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 4, all: 0 },
    speed: 250,
    point: {
      visible: true,
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy',
  };

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  userId: number;
  idBackup: number;
  restoreInstanceBackup: RestoreInstanceBackup = new RestoreInstanceBackup();

  backupVmModel: BackupVm;
  listExternalAttachVolume: VolumeBackup[] = [];
  listSecurityGroupBackups: any[] = [];

  selectedOption: string = 'current';

  isLoadingCurrent: boolean = false;
  isLoading: boolean = false;

  disableKeypair: boolean = false;

  numberMonth: number = 1;

  ipPublicValue: number = 0;
  passwordVisible = false;
  remainingRAM: number = 0;
  remainingVolume: number = 0;
  remainingVCPU: number = 0;
  remainingGpu: number = 0;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  validateForm = new FormGroup({
    formCurrent: new FormGroup({
      securityGroupIds: new FormControl(null as string[]),
      volumeAttachIds: new FormControl(null as number[]),
    }),
    formNew: new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_]*$/),
        ],
      }),
      passOrKeyFormControl: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]).{12,20}$/
          ),
        ],
      }),
    }),
  });

  get formCurrent() {
    return this.validateForm.get('formCurrent') as FormGroup;
  }

  get formNew() {
    return this.validateForm.get('formNew') as FormGroup;
  }

  constructor(
    private router: Router,
    private backupService: BackupVmService,
    private activatedRoute: ActivatedRoute,
    private catalogService: CatalogService,
    private notification: NzNotificationService,
    private dataService: InstancesService,
    private vlanService: VlanService,
    private cdr: ChangeDetectorRef,
    private configurationService: ConfigurationsService,
    private loadingSrv: LoadingService,
    private orderService: OrderService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    if (this.activeBlockPassword == true) {
      this.initPassword();
    }
  }

  ngOnInit() {
    this.userId = this.tokenService.get()?.userId;
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.idBackup = Number.parseInt(
      this.activatedRoute.snapshot.paramMap.get('id')
    );
    this.getConfigurations();
    this.getDetailBackupById(this.idBackup);
    this.getInfoVPC();
    this.getAllIPPublic();
    this.getListNetwork();
    this.onChangeCapacity();
    this.checkExistName();
    this.getAllSSHKey();
    this.getListOptionGpuValue();
    this.getActiveServiceByRegion();
    this.cdr.detectChanges();
  }

  //Lấy các dịch vụ hỗ trợ theo region
  isSupportEncryption: boolean = false;
  isSupportMultiAttachment: boolean = false;
  isVmGpu: boolean = false;
  getActiveServiceByRegion() {
    this.catalogService
      .getActiveServiceByRegion(
        ['Encryption', 'MultiAttachment', 'vm-gpu'],
        this.region
      )
      .subscribe((data) => {
        console.log('support service', data);
        this.isSupportMultiAttachment = data.filter(
          (e) => e.productName == 'MultiAttachment'
        )[0].isActive;
        this.isSupportEncryption = data.filter(
          (e) => e.productName == 'Encryption'
        )[0].isActive;
        this.isVmGpu = data.filter(
          (e) => e.productName == 'vm-gpu'
        )[0].isActive;
      });
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
        this.dataService
          .checkExistName(res, this.region, this.project)
          .subscribe((data) => {
            if (data == true) {
              this.isExistName = true;
            } else {
              this.isExistName = false;
            }
            this.cdr.detectChanges();
          });
      });
  }

  infoVPC: InfoVPCModel = new InfoVPCModel();
  getInfoVPC() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.dataService
      .getInfoVPC(this.project)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          this.infoVPC = data;
          this.remainingVolume =
            this.infoVPC.cloudProject.quotaHddInGb -
            this.infoVPC.cloudProjectResourceUsed.hdd;
          this.remainingRAM =
            this.infoVPC.cloudProject.quotaRamInGb -
            this.infoVPC.cloudProjectResourceUsed.ram;
          this.remainingVCPU =
            this.infoVPC.cloudProject.quotavCpu -
            this.infoVPC.cloudProjectResourceUsed.cpu;

          if (this.infoVPC.cloudProject.gpuProjects.length != 0) {
            this.getListGpuType();
          }
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.get.vpc.info.fail')
          );
        },
      });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của các phím mũi tên

      const tabs = document.querySelectorAll('.ant-tabs-tab'); // Lấy danh sách các tab
      const activeTab = document.querySelector('.ant-tabs-tab-active'); // Lấy tab đang active

      // Tìm index của tab đang active
      let activeTabIndex = Array.prototype.indexOf.call(tabs, activeTab);

      if (event.key === 'ArrowLeft') {
        activeTabIndex -= 1; // Di chuyển tới tab trước đó
      } else if (event.key === 'ArrowRight') {
        activeTabIndex += 1; // Di chuyển tới tab tiếp theo
      }

      // Kiểm tra xem tab có hợp lệ không
      if (activeTabIndex >= 0 && activeTabIndex < tabs.length) {
        (tabs[activeTabIndex] as HTMLElement).click(); // Kích hoạt tab mới
      }
    }
  }

  instanceModel: InstancesModel;
  selectedIndextab: number = 0;
  listAttachVolume: VolumeBackup[] = [];
  getDetailBackupById(id) {
    this.backupService
      .detail(id)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe((data) => {
        this.backupVmModel = data;
        this.dataService
          .getById(this.backupVmModel.instanceId)
          .subscribe((data) => {
            this.instanceModel = data;
            if (this.instanceModel.gpuType == null) {
              this.selectedIndextab = 0;
              this.onClickCustomConfig();
            } else {
              this.selectedIndextab = 1;
              this.onClickGpuConfig();
            }
          });
        if (
          this.backupVmModel?.volumeBackups
            .filter((e) => e.isBootable == true)[0]
            .volumeType.toUpperCase()
            .includes('HDD')
        ) {
          this.activeBlockHDD = true;
          this.activeBlockSSD = false;
        } else {
          this.activeBlockHDD = false;
          this.activeBlockSSD = true;
        }

        this.listExternalAttachVolume =
          this.backupVmModel?.volumeBackups.filter(
            (e) => e.isBootable == false
          );

        this.listExternalAttachVolume.forEach((e) => {
          this.listAttachVolume.push(e);
          let tempBS = new BlockStorage();
          tempBS.id = e.id;
          tempBS.name = e.name;
          tempBS.capacity = e.size;
          tempBS.minCapacity = e.size;
          if (e.typeName.toUpperCase().includes('HDD')) {
            tempBS.type = 'HDD';
          } else {
            tempBS.type = 'SSD';
          }
          this.listOfDataBlockStorage.push(tempBS);
        });

        this.listSecurityGroupBackups = getUniqueObjects(
          this.backupVmModel.securityGroupBackups,
          'sgName'
        );
        this.listSecurityGroupBackups.forEach((e) => {
          if (e.sgName.toUpperCase() == 'DEFAULT') {
            this.selectedSecurityGroup.push(e.sgName);
          }
        });
        this.cdr.detectChanges();
      });
  }

  // Khôi phục vào máy ảo hiện tại
  submitFormCurrent() {
    this.isLoadingCurrent = true;
    let formRestoreCurrent = new RestoreFormCurrent();
    formRestoreCurrent.instanceBackupId = this.backupVmModel?.id;
    formRestoreCurrent.securityGroups = this.selectedSecurityGroup;
    let listIDAttachVolume: number[] = [];
    this.listAttachVolume.forEach((e) => listIDAttachVolume.push(e.id));
    formRestoreCurrent.volumeBackupIds = listIDAttachVolume;
    this.backupService.restoreCurrentBackupVm(formRestoreCurrent).subscribe({
      next: (data) => {
        this.isLoadingCurrent = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          this.i18n.fanyi('app.notification.request.restore.current.vm.success')
        );
        this.router.navigate(['/app-smart-cloud/backup-vm']);
      },
      error: (error) => {
        this.isLoadingCurrent = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.notification.request.restore.current.vm.fail')
        );
      },
    });
  }

  //#region  cấu hình
  configRecommend: GpuConfigRecommend;
  listOptionGpuValue: number[] = [];
  getListOptionGpuValue() {
    this.configurationService
      .getConfigurations('OPTIONGPUVALUE')
      .subscribe((data) => {
        this.listOptionGpuValue = data.valueString.split(', ').map(Number);
        this.listOptionGpuValue = this.listOptionGpuValue.filter(
          (e) => e <= this.remainingGpu
        );
      });
  }

  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;
  isCustomconfig = true;
  isGpuConfig = false;
  listGPUType: OfferItem[] = [];
  purchasedListGPUType: OfferItem[] = [];
  listGpuConfigRecommend: GpuConfigRecommend[] = [];
  getListGpuType() {
    this.dataService
      .getListOffers(this.region, 'vm-flavor-gpu')
      .subscribe((data) => {
        this.listGPUType = data?.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
        if (this.listGPUType) {
          this.listGpuConfigRecommend = getListGpuConfigRecommend(
            this.listGPUType
          );
        }
        console.log('list gpu config recommend', this.listGpuConfigRecommend);
        let listGpuOfferIds: number[] = [];
        this.infoVPC.cloudProject.gpuProjects.forEach((gputype) =>
          listGpuOfferIds.push(gputype.gpuOfferId)
        );
        this.purchasedListGPUType = this.listGPUType.filter((e) =>
          listGpuOfferIds.includes(e.id)
        );
      });
  }

  onClickCustomConfig() {
    this.isCustomconfig = true;
    this.isGpuConfig = false;
    this.resetData();
  }

  onClickGpuConfig() {
    this.isCustomconfig = false;
    this.isGpuConfig = true;
    this.resetData();
    this.remainingVolume =
      this.infoVPC.cloudProject.quotaSSDInGb -
      this.infoVPC.cloudProjectResourceUsed.ssd;
    this.restoreInstanceBackup.gpuTypeOfferId = this.purchasedListGPUType[0].id;
    this.gpuTypeName = this.purchasedListGPUType.filter(
      (e) => e.id == this.restoreInstanceBackup.gpuTypeOfferId
    )[0].offerName;

    let gpuProject: GpuProject = this.infoVPC.cloudProject.gpuProjects.filter(
      (e) => e.gpuOfferId == this.restoreInstanceBackup.gpuTypeOfferId
    )[0];
    let gpuUsage: GpuUsage =
      this.infoVPC.cloudProjectResourceUsed.gpuUsages.filter(
        (e) => e.gpuOfferId == this.restoreInstanceBackup.gpuTypeOfferId
      )[0];
    if (gpuUsage) {
      this.remainingGpu = gpuProject.gpuCount - gpuUsage.gpuCount;
    } else {
      this.remainingGpu = gpuProject.gpuCount;
    }
    this.getListOptionGpuValue();
    this.cdr.detectChanges();
  }

  gpuTypeName: string = '';
  changeGpuType(id: number) {
    this.restoreInstanceBackup.gpuCount = 0;
    this.configRecommend = null;
    this.gpuTypeName = this.purchasedListGPUType.filter(
      (e) => e.id == id
    )[0].offerName;
    let gpuProject: GpuProject = this.infoVPC.cloudProject.gpuProjects.filter(
      (e) => e.gpuOfferId == id
    )[0];
    let gpuUsage: GpuUsage =
      this.infoVPC.cloudProjectResourceUsed.gpuUsages.filter(
        (e) => e.gpuOfferId == id
      )[0];
    if (gpuUsage) {
      this.remainingGpu = gpuProject.gpuCount - gpuUsage.gpuCount;
    } else {
      this.remainingGpu = gpuProject.gpuCount;
    }
    this.getListOptionGpuValue();
  }

  changeGpu() {
    this.configRecommend = this.listGpuConfigRecommend.filter(
      (e) =>
        e.id == this.restoreInstanceBackup.gpuTypeOfferId &&
        e.gpuCount == this.restoreInstanceBackup.gpuCount
    )[0];
    console.log('cấu hình đề recommend', this.configRecommend);
  }

  resetData() {
    this.restoreInstanceBackup.cpu = 0;
    this.restoreInstanceBackup.volumeSize =
      this.backupVmModel?.systemInfoBackups[0].rootSize < this.stepCapacity
        ? this.stepCapacity
        : this.backupVmModel?.systemInfoBackups[0].rootSize;

    this.restoreInstanceBackup.ram = 0;
    this.restoreInstanceBackup.gpuCount = 0;
    this.restoreInstanceBackup.gpuTypeOfferId = null;
    this.isValid = false;
    this.configRecommend = null;
  }

  minCapacity: number;
  maxCapacity: number = 0;
  stepCapacity: number = 0;
  getConfigurations() {
    this.configurationService.getConfigurations('BLOCKSTORAGE').subscribe({
      next: (data) => {
        let valueArray = data.valueString.split('#');
        this.minCapacity = Number.parseInt(valueArray[0]);
        this.stepCapacity = Number.parseInt(valueArray[1]);
        this.maxCapacity = Number.parseInt(valueArray[2]);
      },
    });
  }

  dataSubjectCapacity: Subject<any> = new Subject<any>();
  changeCapacity(value: number) {
    this.dataSubjectCapacity.next(value);
  }
  onChangeCapacity() {
    this.dataSubjectCapacity
      .pipe(
        debounceTime(700) // Đợi 700ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (this.restoreInstanceBackup.volumeSize % this.stepCapacity > 0) {
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.amount.capacity', {
              number: this.stepCapacity,
            })
          );
          this.restoreInstanceBackup.volumeSize =
            this.restoreInstanceBackup.volumeSize -
            (this.restoreInstanceBackup.volumeSize % this.stepCapacity);
          if (this.restoreInstanceBackup.volumeSize < this.stepCapacity) {
            this.restoreInstanceBackup.volumeSize =
              this.backupVmModel?.systemInfoBackups[0].rootSize <
              this.stepCapacity
                ? this.stepCapacity
                : this.backupVmModel?.systemInfoBackups[0].rootSize;
          }
        }
        if (
          this.restoreInstanceBackup.volumeSize <
          this.backupVmModel?.systemInfoBackups[0].rootSize
        ) {
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.amount.capacity.snapshot', {
              num: this.backupVmModel?.systemInfoBackups[0].rootSize,
            })
          );
          this.restoreInstanceBackup.volumeSize =
            this.backupVmModel?.systemInfoBackups[0].rootSize <
            this.stepCapacity
              ? this.stepCapacity
              : this.backupVmModel?.systemInfoBackups[0].rootSize;
        }
        this.checkValidConfig();
        this.cdr.detectChanges();
      });
  }

  isValid: boolean = false;
  checkValidConfig() {
    if (
      this.isCustomconfig &&
      (!this.restoreInstanceBackup.volumeSize ||
        this.restoreInstanceBackup.volumeSize == 0 ||
        !this.restoreInstanceBackup.ram ||
        this.restoreInstanceBackup.ram == 0 ||
        !this.restoreInstanceBackup.cpu ||
        this.restoreInstanceBackup.cpu == 0)
    ) {
      this.isValid = false;
    } else if (
      this.isGpuConfig &&
      (!this.restoreInstanceBackup.volumeSize ||
        this.restoreInstanceBackup.volumeSize == 0 ||
        !this.restoreInstanceBackup.ram ||
        this.restoreInstanceBackup.ram == 0 ||
        !this.restoreInstanceBackup.cpu ||
        this.restoreInstanceBackup.cpu == 0 ||
        !this.restoreInstanceBackup.gpuCount ||
        this.restoreInstanceBackup.gpuCount == 0)
    ) {
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: any[] = [];
  selectedSecurityGroup: any[] = [];
  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(this.project, '', this.userId, this.region, 9999, 1, true)
      .subscribe((data: any) => {
        this.listIPPublic = data.records.filter(
          (e) =>
            e.status.toUpperCase() == 'KHOITAO' &&
            e.resourceStatus.toUpperCase() == 'AVAILABLE'
        );
        console.log('list IP public', this.listIPPublic);
      });
  }

  listVlanNetwork: NetWorkModel[] = [];
  vlanNetwork: string = '';
  getListNetwork(): void {
    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
    formSearchNetwork.region = this.region;
    formSearchNetwork.project = this.project;
    formSearchNetwork.pageNumber = 0;
    formSearchNetwork.pageSize = 9999;
    formSearchNetwork.vlanName = '';
    this.vlanService
      .getVlanNetworks(formSearchNetwork)
      .subscribe((data: any) => {
        this.listVlanNetwork = data.records;
        this.vlanNetwork = this.listVlanNetwork[0].cloudId;
        this.getListPort();
        this.cdr.detectChanges();
      });
  }

  listPort: Port[] = [];
  port: string = '';
  getListPort() {
    this.listPort = [
      {
        id: '',
        name: '',
        fixedIPs: [this.i18n.fanyi('app.random')],
        macAddress: null,
        attachedDevice: null,
        status: null,
        adminStateUp: null,
        instanceName: null,
        subnetId: null,
        attachedDeviceId: null,
      },
    ];
    this.dataService
      .getListAllPortByNetwork(this.vlanNetwork, this.region)
      .subscribe({
        next: (data) => {
          data.forEach((e: Port) => {
            if (e.attachedDeviceId == '') {
              this.listPort.push(e);
            }
          });
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.get.list.port')
          );
        },
      });
  }
  //#endregion

  //#region selectedPasswordOrSSHkey
  listSSHKey: SHHKeyModel[] = [];
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;
  password?: string;
  selectedSSHKeyName: string;
  initPassword(): void {
    this.activeBlockPassword = true;
    this.activeBlockSSHKey = false;
    this.selectedSSHKeyName = null;
    (this.validateForm.get('formNew') as FormGroup).setControl(
      'passOrKeyFormControl',
      new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]).{12,20}$/
          ),
        ],
      })
    );
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.password = '';
    (this.validateForm.get('formNew') as FormGroup).setControl(
      'passOrKeyFormControl',
      new FormControl('', {
        validators: [Validators.required],
      })
    );
  }

  getAllSSHKey() {
    this.listSSHKey = [];
    this.dataService
      .getAllSSHKey(this.region, this.userId, 999999, 0)
      .subscribe((data: any) => {
        data.records.forEach((e) => {
          const itemMapper = new SHHKeyModel();
          itemMapper.id = e.id;
          itemMapper.displayName = e.name;
          this.listSSHKey.push(itemMapper);
        });
      });
  }
  //#endregion

  //#region volume gắn ngoài
  listOfDataBlockStorage: BlockStorage[] = [];
  changeAttachVolume() {
    this.listOfDataBlockStorage = [];
    this.listExternalAttachVolume.forEach((e) => {
      if (this.listAttachVolume.includes(e)) {
        let tempBS = new BlockStorage();
        tempBS.id = e.id;
        tempBS.name = e.name;
        tempBS.capacity = e.size;
        tempBS.minCapacity = e.size;
        if (e.typeName.toUpperCase().includes('HDD')) {
          tempBS.type = 'HDD';
        } else {
          tempBS.type = 'SSD';
        }
        this.listOfDataBlockStorage.push(tempBS);
      }
    });
  }
  //#endregion

  instanceInit() {
    this.restoreInstanceBackup.instanceBackupId = this.backupVmModel?.id;
    let selectedVolumeExternal: VolumeExternalBackup[] = [];
    this.listOfDataBlockStorage.forEach((e) => {
      let volumeExternal = new VolumeExternalBackup();
      volumeExternal.id = e.id;
      if (e.newName && e.newName.length != 0) {
        volumeExternal.name = e.newName;
      } else {
        volumeExternal.name = e.name
      }
      volumeExternal.size = e.capacity;
      selectedVolumeExternal.push(volumeExternal);
    });
    this.restoreInstanceBackup.volumeBackups = selectedVolumeExternal;
    this.restoreInstanceBackup.instanceName = this.backupVmModel?.instanceName;
    this.restoreInstanceBackup.keypairName = this.selectedSSHKeyName;
    this.restoreInstanceBackup.securityGroups = this.selectedSecurityGroup;
    this.restoreInstanceBackup.isUsePrivateNetwork =
      this.vlanNetwork == '' ? false : true;
    if (this.vlanNetwork != '') {
      this.restoreInstanceBackup.privateNetId = this.vlanNetwork;
    }
    if (this.port != '') {
      this.restoreInstanceBackup.privatePortId = this.port;
    }
    this.restoreInstanceBackup.ipPublic = this.ipPublicValue;
    this.restoreInstanceBackup.password = this.password;
    this.restoreInstanceBackup.projectId = this.project;
    this.restoreInstanceBackup.oneSMEAddonId = null;
    this.restoreInstanceBackup.serviceType = 1;
    this.restoreInstanceBackup.serviceInstanceId = 0;
    this.restoreInstanceBackup.saleDept = null;
    this.restoreInstanceBackup.saleDeptCode = null;
    this.restoreInstanceBackup.contactPersonEmail = null;
    this.restoreInstanceBackup.contactPersonPhone = null;
    this.restoreInstanceBackup.contactPersonName = null;
    this.restoreInstanceBackup.note = null;
    this.restoreInstanceBackup.createDateInContract = null;
    this.restoreInstanceBackup.am = null;
    this.restoreInstanceBackup.amManager = null;
    this.restoreInstanceBackup.isTrial = false;
    this.restoreInstanceBackup.couponCode = null;
    this.restoreInstanceBackup.dhsxkd_SubscriptionId = null;
    this.restoreInstanceBackup.dSubscriptionNumber = null;
    this.restoreInstanceBackup.dSubscriptionType = null;
    this.restoreInstanceBackup.oneSME_SubscriptionId = null;
    this.restoreInstanceBackup.regionId = this.region;
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  restore(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.dataService
      .checkflavorforimage(
        this.backupVmModel?.systemInfoBackups[0].imageIdInt,
        this.restoreInstanceBackup.volumeSize,
        this.restoreInstanceBackup.ram,
        this.restoreInstanceBackup.cpu
      )
      .subscribe({
        next: (data) => {
          this.instanceInit();
          this.orderItem = [];
          let specificationInstance = JSON.stringify(
            this.restoreInstanceBackup
          );
          let orderItemInstance = new OrderItem();
          orderItemInstance.orderItemQuantity = 1;
          orderItemInstance.specification = specificationInstance;
          orderItemInstance.specificationType = 'restore_instancebackup';
          this.orderItem.push(orderItemInstance);
          console.log('order instance', orderItemInstance);

          this.order.customerId = this.tokenService.get()?.userId;
          this.order.createdByUserId = this.tokenService.get()?.userId;
          this.order.note = 'restore vm';
          this.order.orderItems = this.orderItem;

          this.orderService
            .validaterOrder(this.order)
            .pipe(
              finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              })
            )
            .subscribe({
              next: (result) => {
                if (result.success) {
                  this.dataService.create(this.order).subscribe({
                    next: (data: any) => {
                      this.notification.success(
                        '',
                        this.i18n.fanyi(
                          'app.notify.success.new.instances.restore'
                        )
                      );
                      this.router.navigate(['/app-smart-cloud/instances']);
                    },
                    error: (e) => {
                      this.notification.error(
                        e.statusText,
                        this.i18n.fanyi('app.notify.fail.new.instances.restore')
                      );
                    },
                  });
                } else {
                  this.isVisiblePopupError = true;
                  this.errorList = result.data;
                }
              },
              error: (error) => {
                this.notification.error(
                  this.i18n.fanyi('app.status.fail'),
                  error.error.message
                );
              },
            });
        },
        error: (e) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          let numbers: number[] = [];
          const regex = /\d+/g;
          const matches = e.error.match(regex);
          if (matches) {
            numbers = matches.map((match) => parseInt(match));
            this.notification.error(
              '',
              this.i18n.fanyi('app.notify.check.config.for.os', {
                nameHdh: this.backupVmModel?.systemInfoBackups[0].osName,
                volume: numbers[0],
                ram: numbers[1],
                cpu: numbers[2],
              })
            );
          }
        },
      });
  }
}
