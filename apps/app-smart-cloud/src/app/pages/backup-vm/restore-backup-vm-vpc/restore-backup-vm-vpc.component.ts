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
  slider,
} from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  BackupVm,
  RestoreFormCurrent,
  SecurityGroupBackup,
  VolumeBackup,
} from '../../../shared/models/backup-vm';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import {
  DataPayment,
  InstanceCreate,
  IPPublicModel,
  ItemPayment,
  OfferItem,
  SecurityGroupModel,
  SHHKeyModel,
  VolumeCreate,
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
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { BlockStorage } from '../../instances/instances-create/instances-create.component';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { LoadingService } from '@delon/abc/loading';
import { TotalVpcResource } from 'src/app/shared/models/vpc.model';

class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
}
class ConfigGPU {
  CPU: number = 0;
  ram: number = 0;
  storage: number = 0;
  GPU: number = 0;
  gpuOfferId: number = 0;
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

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/)],
    }),
    passOrKeyFormControl: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
        ),
      ],
    }),
  });

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  userId: number;
  idBackup: number;

  backupVmModel: BackupVm;
  backupPackage: PackageBackupModel;
  listExternalAttachVolume: VolumeBackup[] = [];
  listSecurityGroupBackups: SecurityGroupBackup[] = [];

  selectedOption: string = 'current';

  isLoadingCurrent: boolean = false;
  isLoadingNew: boolean = false;

  disableKeypair: boolean = false;

  numberMonth: number = 1;

  ipPublicValue: number = 0;
  passwordVisible = false;
  remainingRAM: number = 0;
  remainingVolume: number = 0;
  remainingVCPU: number = 0;
  remainingGpu: number = 0;

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
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
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
    private projectService: ProjectService,
    private backupPackageService: PackageBackupService,
    private catalogService: CatalogService,
    private notification: NzNotificationService,
    private dataService: InstancesService,
    private vlanService: VlanService,
    private cdr: ChangeDetectorRef,
    private configurationService: ConfigurationsService,
    private loadingSrv: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    if (this.activeBlockPassword == true) {
      this.initPassword();
    }
  }

  @ViewChild('myCarouselFlavor') myCarouselFlavor: NguCarousel<any>;
  reloadCarousel: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.reloadCarousel = true;
    this.updateActivePoint();
  }

  ngAfterViewInit(): void {
    this.updateActivePoint(); // Gọi hàm này sau khi view đã được init để đảm bảo có giá trị cần thiết
  }

  updateActivePoint(): void {
    // Gọi hàm reloadCarousel khi cần reload
    if (this.reloadCarousel) {
      this.reloadCarousel = false;
      setTimeout(() => {
        this.myCarouselFlavor.reset();
      }, 100);
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
    this.getListGpuType();
    this.getAllIPPublic();
    this.getListNetwork();
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
    this.getAllSSHKey();
    this.cdr.detectChanges();
  }

  infoVPC: TotalVpcResource = new TotalVpcResource();
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
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm']);
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

  configCustom: ConfigCustom = new ConfigCustom();
  configGPU: ConfigGPU = new ConfigGPU();
  instanceCreate: InstanceCreate = new InstanceCreate();

  instanceInit() {
    this.instanceCreate.description = null;
    // this.instanceCreate.imageId = this.hdh;
    this.instanceCreate.iops = 0;
    // this.instanceCreate.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.keypairName = this.validateForm
      .get('formNew')
      .get('keypair').value;
    this.instanceCreate.securityGroups = this.validateForm
      .get('formNew')
      .get('securityGroupIds').value;
    this.instanceCreate.network = null;
    this.instanceCreate.isUsePrivateNetwork =
      this.validateForm.get('formNew').get('vlan').value == '' ? false : true;
    if (this.validateForm.get('formNew').get('vlan').value != '') {
      this.instanceCreate.privateNetId = this.validateForm
        .get('formNew')
        .get('vlan').value;
    }
    if (this.port != '') {
      this.instanceCreate.privatePortId = this.port;
    }
    this.instanceCreate.ipPublic = this.validateForm
      .get('formNew')
      .get('ipPublic').value;
    this.instanceCreate.password = this.validateForm
      .get('formNew')
      .get('password').value;
    // this.instanceCreate.snapshotCloudId = this.selectedSnapshot;
    this.instanceCreate.encryption = false;
    // this.instanceCreate.isUseIPv6 = this.isUseIPv6;
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;
    // if (this.isCustomconfig) {
    this.instanceCreate.offerId = 0;
    this.instanceCreate.flavorId = 0;
    this.instanceCreate.ram = this.configCustom.ram;
    this.instanceCreate.cpu = this.configCustom.vCPU;
    this.instanceCreate.volumeSize = this.configCustom.capacity;
    // }
    // this.instanceCreate.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.projectId = this.project;
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
    // this.instanceCreate.customerId = this.tokenService.get()?.userId;

    // let currentDate = new Date();
    // let lastDate = new Date();
    // lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    // this.instanceCreate.createDate = currentDate.toISOString().substring(0, 19);
    // this.instanceCreate.expireDate = lastDate.toISOString().substring(0, 19);

    this.instanceCreate.saleDept = null;
    this.instanceCreate.saleDeptCode = null;
    this.instanceCreate.contactPersonEmail = null;
    this.instanceCreate.contactPersonPhone = null;
    this.instanceCreate.contactPersonName = null;
    this.instanceCreate.note = null;
    this.instanceCreate.createDateInContract = null;
    this.instanceCreate.am = null;
    this.instanceCreate.amManager = null;
    this.instanceCreate.isTrial = false;
    this.instanceCreate.couponCode = null;
    this.instanceCreate.dhsxkd_SubscriptionId = null;
    this.instanceCreate.dSubscriptionNumber = null;
    this.instanceCreate.dSubscriptionType = null;
    this.instanceCreate.oneSME_SubscriptionId = null;
    this.instanceCreate.regionId = this.region;
    // this.instanceCreate.userEmail = this.tokenService.get()['email'];
    // this.instanceCreate.actorEmail = this.tokenService.get()['email'];
  }

  totalAmount: number = 0;
  totalVAT: number = 0;
  totalincludesVAT: number = 0;
  totalAmountVolume: number = 0;
  totalVATVolume: number = 0;
  totalPaymentVolume: number = 0;
  getTotalAmount() {
    this.instanceInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceCreate);
    itemPayment.specificationType = 'instance_create';
    itemPayment.serviceDuration = 1;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.dataService.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.cdr.detectChanges();
    });
  }

  listIDAttachVolume: number[] = [];
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
        if (
          this.backupVmModel?.volumeBackups
            .filter((e) => e.isBootable == true)[0]
            .typeName.toUpperCase()
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
          this.listIDAttachVolume.push(e.id);
          let tempBS = new BlockStorage();
          tempBS.id = e.id;
          tempBS.name = e.name;
          tempBS.capacity = e.size;
          if (e.typeName.toUpperCase().includes('HDD')) {
            tempBS.type = 'HDD';
          } else {
            tempBS.type = 'SSD';
          }
          this.listOfDataBlockStorage.push(tempBS);
        });

        this.listSecurityGroupBackups = this.backupVmModel.securityGroupBackups;
        this.listSecurityGroupBackups.forEach((e) => {
          if (e.sgName.toUpperCase() == 'DEFAULT') {
            this.selectedSecurityGroup.push(e.sgName);
          }
        });
        this.getBackupPackage(this.backupVmModel?.backupPacketId);
        this.cdr.detectChanges();
      });
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

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    this.selectedSecurityGroup = [];
    if (this.selectedOption === 'current') {
      this.listSecurityGroupBackups.forEach((e) => {
        if (e.sgName.toUpperCase() == 'DEFAULT') {
          this.selectedSecurityGroup.push(e.sgName);
        }
      });
    } else if (this.selectedOption === 'new') {
      this.getAllSecurityGroup();
    }
    this.cdr.detectChanges();
  }

  submitFormCurrent() {
    this.isLoadingCurrent = true;
    console.log('current', 'confirm click');
    let formRestoreCurrent = new RestoreFormCurrent();
    formRestoreCurrent.instanceBackupId = this.backupVmModel?.id;
    this.backupService.restoreCurrentBackupVm(formRestoreCurrent).subscribe(
      (data) => {
        this.isLoadingCurrent = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Khôi phục vào máy ảo hiện tại thành công'
        );
        this.router.navigate(['/app-smart-cloud/backup-vm']);
      },
      (error) => {
        this.isLoadingCurrent = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          'Khôi phục vào máy ảo hiện tại thất bại' + error.error.detail
        );
      }
    );
  }

  getBackupPackage(value) {
    this.backupPackageService.detail(value).subscribe((data) => {
      this.backupPackage = data;
    });
  }

  //#region  cấu hình
  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;
  isCustomconfig = true;
  isGpuConfig = false;
  listGPUType: OfferItem[] = [];
  getListGpuType() {
    this.dataService
      .getListOffers(this.region, 'vm-flavor-gpu')
      .subscribe((data) => {
        this.listGPUType = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
      });
  }

  onClickCustomConfig() {
    this.isCustomconfig = true;
    this.isGpuConfig = false;
    this.resetData();
    this.disableHDD = false;
  }

  disableHDD: boolean = false;
  onClickGpuConfig() {
    this.isCustomconfig = false;
    this.isGpuConfig = true;
    this.resetData();
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.remainingVolume =
      this.infoVPC.cloudProject.quotaSSDInGb -
      this.infoVPC.cloudProjectResourceUsed.ssd;
    this.disableHDD = true;
  }

  resetData() {
    this.instanceCreate.cpu = 0;
    this.instanceCreate.volumeSize = 0;
    this.instanceCreate.ram = 0;
    this.instanceCreate.gpuCount = 0;
  }

  minCapacity: number;
  maxCapacity: number;
  stepCapacity: number;
  getConfigurations() {
    this.configurationService.getConfigurations('BLOCKSTORAGE').subscribe({
      next: (data) => {
        let valueArray = data.valueString.split('#');
        this.minCapacity = valueArray[0];
        this.stepCapacity = valueArray[1];
        this.maxCapacity = valueArray[2];
      },
    });
  }

  isValidCapacity: boolean = false;
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
        if (this.instanceCreate.volumeSize % this.stepCapacity > 0) {
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.amount.capacity', {
              number: this.stepCapacity,
            })
          );
          this.instanceCreate.volumeSize =
            this.instanceCreate.volumeSize -
            (this.instanceCreate.volumeSize % this.stepCapacity);
          this.checkValidConfig();
          this.cdr.detectChanges();
        }
        if (this.instanceCreate.volumeSize > this.remainingVolume) {
          this.isValidCapacity = false;
          if (this.activeBlockHDD) {
            this.notification.error(
              '',
              this.i18n.fanyi('app.notify.amount.capacity.add', {
                num1: this.infoVPC.cloudProjectResourceUsed.hdd,
                num2: this.infoVPC.cloudProject.quotaHddInGb,
                num3: this.instanceCreate.volumeSize - this.remainingVolume,
              })
            );
          } else {
            this.notification.error(
              '',
              this.i18n.fanyi('app.notify.amount.capacity.add', {
                num1: this.infoVPC.cloudProjectResourceUsed.ssd,
                num2: this.infoVPC.cloudProject.quotaSSDInGb,
                num3: this.instanceCreate.volumeSize - this.remainingVolume,
              })
            );
          }
        } else {
          this.isValidCapacity = true;
        }
      });
  }

  isValidVCPU: boolean = false;
  dataSubjectVCPU: Subject<any> = new Subject<any>();
  changeVCPU(value: number) {
    this.dataSubjectVCPU.next(value);
  }
  onChangeVCPU() {
    this.dataSubjectVCPU
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (this.instanceCreate.cpu > this.remainingVCPU) {
          this.isValidVCPU = false;
          this.notification.error(
            '',
            this.i18n.fanyi('app.notify.amount.cpu.add', {
              num1: this.infoVPC.cloudProjectResourceUsed.cpu,
              num2: this.infoVPC.cloudProject.quotavCpu,
              num3: this.instanceCreate.cpu - this.remainingVCPU,
            })
          );
        } else {
          this.isValidVCPU = true;
        }
      });
  }

  isValidRam: boolean = false;
  dataSubjectRam: Subject<any> = new Subject<any>();
  changeRam(value: number) {
    this.dataSubjectRam.next(value);
  }
  onChangeRam() {
    this.dataSubjectRam
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (this.instanceCreate.ram > this.remainingRAM) {
          this.isValidRam = false;
          this.notification.error(
            '',
            this.i18n.fanyi('app.notify.amount.ram.add', {
              num1: this.infoVPC.cloudProjectResourceUsed.ram,
              num2: this.infoVPC.cloudProject.quotaRamInGb,
              num3: this.instanceCreate.ram - this.remainingRAM,
            })
          );
        } else {
          this.isValidRam = true;
        }
      });
  }

  isValid: boolean = false;
  checkValidConfig() {
    if (
      this.isCustomconfig &&
      (!this.instanceCreate.volumeSize ||
        this.instanceCreate.volumeSize == 0 ||
        !this.instanceCreate.ram ||
        this.instanceCreate.ram == 0 ||
        !this.instanceCreate.cpu ||
        this.instanceCreate.cpu == 0)
    ) {
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  selectedSecurityGroup: any[] = [];
  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(this.project, '', this.userId, this.region, 9999, 1, true)
      .subscribe((data: any) => {
        const currentDateTime = new Date().toISOString();
        this.listIPPublic = data.records.filter(
          (e) =>
            e.status == 0 && new Date(e.expiredDate) > new Date(currentDateTime)
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

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(
        this.region,
        this.tokenService.get()?.userId,
        this.project
      )
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
        this.listSecurityGroup.forEach((e) => {
          if (e.name.toUpperCase() == 'DEFAULT') {
            this.selectedSecurityGroup.push(e.name);
          }
        });
        this.cdr.detectChanges();
      });
  }
  //#endregion

  selectedElementFlavor: string = null;
  selectElementInputFlavors(id: string) {
    this.selectedElementFlavor = id;
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
    this.form.setControl(
      'passOrKeyFormControl',
      new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
          ),
        ],
      })
    );
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.password = null;
    this.form.setControl(
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
      if (this.listIDAttachVolume.includes(e.id)) {
        let tempBS = new BlockStorage();
        tempBS.id = e.id;
        tempBS.name = e.name;
        tempBS.capacity = e.size;
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
}
