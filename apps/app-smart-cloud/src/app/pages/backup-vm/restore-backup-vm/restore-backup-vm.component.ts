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
import { getCurrentRegionAndProject, getUniqueObjects } from '@shared';
import {
  BackupVm,
  RestoreFormCurrent,
  RestoreInstanceBackup,
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
  Order,
  OrderItem,
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
import { OrderService } from 'src/app/shared/services/order.service';

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
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class RestoreBackupVmComponent implements OnInit {
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

  ipPublicValue: number = 0;

  backupVmModel: BackupVm;
  backupPackage: PackageBackupModel;
  listExternalAttachVolume: VolumeBackup[] = [];
  listSecurityGroupBackups: any[] = [];

  selectedOption: string = 'current';
  isLoadingCurrent: boolean = false;
  isLoading: boolean = false;

  disableKeypair: boolean = false;

  numberMonth: number = 1;

  passwordVisible = false;

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
    private orderService: OrderService,
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
    this.getVolumeUnitMoney();
    this.getListGpuType();
    this.getAllIPPublic();
    this.getListNetwork();
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
    this.getAllSSHKey();
    this.checkExistName();
    this.cdr.detectChanges();
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
  restoreInstanceBackup: RestoreInstanceBackup = new RestoreInstanceBackup();
  instanceInit() {
    this.restoreInstanceBackup.instanceBackupId = this.backupVmModel?.id;
    this.restoreInstanceBackup.volumeBackupIds = this.listIDAttachVolume;
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
    this.restoreInstanceBackup.encryption = false;
    if (this.isCustomconfig) {
      this.restoreInstanceBackup.offerId = 0;
      this.restoreInstanceBackup.offerFlavorId = 0;
      this.restoreInstanceBackup.ram = this.configCustom.ram;
      this.restoreInstanceBackup.cpu = this.configCustom.vCPU;
      this.restoreInstanceBackup.volumeSize = this.configCustom.capacity;
    } else if (this.isGpuConfig) {
      this.restoreInstanceBackup.offerId = 0;
      this.restoreInstanceBackup.offerFlavorId = 0;
      this.restoreInstanceBackup.ram = this.configGPU.ram;
      this.restoreInstanceBackup.cpu = this.configGPU.CPU;
      this.restoreInstanceBackup.volumeSize = this.configGPU.storage;
      this.restoreInstanceBackup.gpuCount = this.configGPU.GPU;
      this.restoreInstanceBackup.gpuTypeOfferId = this.configGPU.gpuOfferId;
    } else {
      this.restoreInstanceBackup.offerId = this.offerFlavor.id;
      this.offerFlavor.characteristicValues.forEach((e) => {
        if (e.charOptionValues[0] == 'Id') {
          this.restoreInstanceBackup.offerFlavorId = Number.parseInt(
            e.charOptionValues[1]
          );
        }
        if (e.charOptionValues[0] == 'RAM') {
          this.restoreInstanceBackup.ram = Number.parseInt(
            e.charOptionValues[1]
          );
        }
        if (e.charOptionValues[0] == 'CPU') {
          this.restoreInstanceBackup.cpu = Number.parseInt(
            e.charOptionValues[1]
          );
        }
        if (e.charOptionValues[0] == 'HDD') {
          this.restoreInstanceBackup.volumeSize = Number.parseInt(
            e.charOptionValues[1]
          );
        }
      });
    }
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

  totalAmount: number = 0;
  totalVAT: number = 0;
  totalincludesVAT: number = 0;
  totalAmountVolume: number = 0;
  totalVATVolume: number = 0;
  totalPaymentVolume: number = 0;
  getTotalAmount() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.instanceInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(
      this.restoreInstanceBackup
    );
    itemPayment.specificationType = 'restore_instancebackup';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.dataService.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalVAT = Number.parseFloat(result.data.totalVAT.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.isLoading = false;
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
        this.initFlavors();

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
            tempBS.price = e.size * this.unitPriceVolumeHDD;
            tempBS.VAT = e.size * this.unitVATVolumeHDD;
            tempBS.priceAndVAT = e.size * this.unitPaymentVolumeHDD;
          } else {
            tempBS.type = 'SSD';
            tempBS.price = e.size * this.unitPriceVolumeSSD;
            tempBS.VAT = e.size * this.unitVATVolumeSSD;
            tempBS.priceAndVAT = e.size * this.unitPaymentVolumeSSD;
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

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: any[] = [];
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
        this.cdr.detectChanges();
      });
  }

  listPort: Port[] = [];
  port: string = '';
  hidePort: boolean = true;
  getListPort() {
    if (this.vlanNetwork == '') {
      this.hidePort = true;
      this.port = '';
    } else {
      this.hidePort = false;
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
  }

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(
        this.region,
        this.tokenService.get()?.userId,
        this.project
      )
      .subscribe((data: any) => {
        this.listSecurityGroup = getUniqueObjects(data, 'name');
        this.listSecurityGroup.forEach((e) => {
          if (e.name.toUpperCase() == 'DEFAULT') {
            this.selectedSecurityGroup.push(e.name);
          }
        });
        this.cdr.detectChanges();
      });
  }
  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  isPreConfigPackage = true;
  isCustomconfig = false;
  isGpuConfig = false;
  onClickConfigPackage() {
    this.isPreConfigPackage = true;
    this.isCustomconfig = false;
    this.isGpuConfig = false;
    this.resetData();
  }

  onClickCustomConfig() {
    this.isPreConfigPackage = false;
    this.isCustomconfig = true;
    this.isGpuConfig = false;
    this.resetData();
  }

  onClickGpuConfig() {
    this.isPreConfigPackage = false;
    this.isCustomconfig = false;
    this.isGpuConfig = true;
    this.resetData();
    this.configGPU.gpuOfferId = this.listGPUType[0].id;
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
  }

  resetData() {
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.configGPU = new ConfigGPU();
    this.configCustom = new ConfigCustom();
    this.volumeUnitPrice = 0;
    this.volumeIntoMoney = 0;
    this.ramUnitPrice = 0;
    this.ramIntoMoney = 0;
    this.cpuUnitPrice = 0;
    this.cpuIntoMoney = 0;
    this.gpuUnitPrice = 0;
    this.gpuIntoMoney = 0;
    this.totalAmount = 0;
    this.totalVAT = 0;
    this.totalincludesVAT = 0;
    this.restoreInstanceBackup.ram = 0;
    this.restoreInstanceBackup.cpu = 0;
    this.restoreInstanceBackup.volumeSize = 0;
    this.restoreInstanceBackup.gpuCount = 0;
  }

  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;
  password: string = '';
  offerFlavor: any = null;
  listOfferFlavors: OfferItem[] = [];
  selectedElementFlavor: string = null;
  selectedSSHKeyName: string;
  initFlavors(): void {
    this.dataService
      .getListOffers(this.region, 'VM-Flavor')
      .subscribe((data: any) => {
        let listOfferFlavorsTemp = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
        if (this.activeBlockHDD) {
          this.listOfferFlavors = listOfferFlavorsTemp.filter((e) =>
            e.offerName.includes('HDD')
          );
        } else {
          this.listOfferFlavors = listOfferFlavorsTemp.filter((e) =>
            e.offerName.includes('SSD')
          );
        }
        this.listOfferFlavors.forEach((e: OfferItem) => {
          e.description = '';
          e.characteristicValues.forEach((ch) => {
            if (ch.charOptionValues[0] == 'CPU') {
              e.description += ch.charOptionValues[1] + ' vCPU / ';
            }
            if (ch.charOptionValues[0] == 'RAM') {
              e.description += ch.charOptionValues[1] + ' GB RAM / ';
            }
            if (ch.charOptionValues[0] == 'HDD') {
              if (this.activeBlockHDD) {
                e.description += ch.charOptionValues[1] + ' GB HDD';
              } else {
                e.description += ch.charOptionValues[1] + ' GB SSD';
              }
            }
          });
        });
        this.listOfferFlavors = this.listOfferFlavors.sort(
          (a, b) => a.price.fixedPrice.amount - b.price.fixedPrice.amount
        );
        console.log('list flavor check', this.listOfferFlavors);
        this.cdr.detectChanges();
      });
  }

  onInputFlavors(event: any) {
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.getTotalAmount();
    console.log(this.offerFlavor);
  }

  selectElementInputFlavors(id: string) {
    this.selectedElementFlavor = id;
  }

  volumeUnitPrice = 0;
  volumeIntoMoney = 0;
  ramUnitPrice = 0;
  ramIntoMoney = 0;
  cpuUnitPrice = 0;
  cpuIntoMoney = 0;
  gpuUnitPrice = 0;
  gpuIntoMoney = 0;
  getUnitPrice(
    volumeSize: number,
    ram: number,
    cpu: number,
    gpu: number,
    gpuOfferId: number
  ) {
    let tempInstance: RestoreInstanceBackup = new RestoreInstanceBackup();
    tempInstance.instanceBackupId = this.backupVmModel?.id;
    tempInstance.offerId = 0;
    tempInstance.offerFlavorId = 0;
    tempInstance.volumeSize = volumeSize;
    tempInstance.ram = ram;
    tempInstance.cpu = cpu;
    tempInstance.gpuCount = gpu;
    tempInstance.gpuTypeOfferId = gpuOfferId;
    tempInstance.projectId = this.project;
    tempInstance.regionId = this.region;
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(tempInstance);
    itemPayment.specificationType = 'restore_instancebackup';
    itemPayment.serviceDuration = 1;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.dataService.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien/đơn giá', result);
      if (volumeSize == 1) {
        this.volumeUnitPrice = Number.parseFloat(
          result.data.totalAmount.amount
        );
        if (this.isCustomconfig) {
          this.volumeIntoMoney =
            this.volumeUnitPrice * this.configCustom.capacity;
        }
        if (this.isGpuConfig) {
          this.volumeIntoMoney = this.volumeUnitPrice * this.configGPU.storage;
        }
      }
      if (ram == 1) {
        this.ramUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        if (this.isCustomconfig) {
          this.ramIntoMoney = this.ramUnitPrice * this.configCustom.ram;
        }
        if (this.isGpuConfig) {
          this.ramIntoMoney = this.ramUnitPrice * this.configGPU.ram;
        }
      }
      if (cpu == 1) {
        this.cpuUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        if (this.isCustomconfig) {
          this.cpuIntoMoney = this.cpuUnitPrice * this.configCustom.vCPU;
        }
        if (this.isGpuConfig) {
          this.cpuIntoMoney = this.cpuUnitPrice * this.configGPU.CPU;
        }
      }
      if (gpu == 1) {
        this.gpuUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        if (this.isGpuConfig) {
          this.gpuIntoMoney = this.gpuUnitPrice * this.configGPU.GPU;
        }
      }
      this.cdr.detectChanges();
    });
  }

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
        this.getUnitPrice(0, 0, 1, 0, null);
        this.getTotalAmount();
      });
  }

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
        this.getUnitPrice(0, 1, 0, 0, null);
        this.getTotalAmount();
      });
  }

  minCapacity: number;
  maxCapacity: number;
  stepCapacity: number;
  surplus: number;
  getConfigurations() {
    this.configurationService.getConfigurations('BLOCKSTORAGE').subscribe({
      next: (data) => {
        let valueArray = data.valueString.split('#');
        this.minCapacity = valueArray[0];
        this.stepCapacity = valueArray[1];
        this.maxCapacity = valueArray[2];
        this.surplus = valueArray[2] % valueArray[1];
        this.cdr.detectChanges();
      },
    });
  }

  dataSubjectCapacity: Subject<any> = new Subject<any>();
  changeCapacity(value: number) {
    this.dataSubjectCapacity.next(value);
  }
  onChangeCapacity() {
    this.dataSubjectCapacity.pipe(debounceTime(700)).subscribe((res) => {
      if (res > this.maxCapacity) {
        this.configCustom.capacity = this.maxCapacity - this.surplus;
        this.cdr.detectChanges();
      }
      if (this.configCustom.capacity % this.stepCapacity > 0) {
        this.notification.warning(
          '',
          this.i18n.fanyi('app.notify.amount.capacity', {
            number: this.stepCapacity,
          })
        );
        this.configCustom.capacity =
          this.configCustom.capacity -
          (this.configCustom.capacity % this.stepCapacity);
      }
      this.getUnitPrice(1, 0, 0, 0, null);
      this.getTotalAmount();
    });
  }
  //#endregion

  //#region Cấu hình GPU
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

  dataSubjectCpuGpu: Subject<any> = new Subject<any>();
  changeCpuOfGpu(value: number) {
    this.dataSubjectCpuGpu.next(value);
  }

  onChangeCpuOfGpu() {
    this.dataSubjectCpuGpu
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(0, 0, 1, 0, null);
        this.getTotalAmount();
      });
  }

  dataSubjectRamGpu: Subject<any> = new Subject<any>();
  changeRamOfGpu(value: number) {
    this.dataSubjectRamGpu.next(value);
  }
  onChangeRamOfGpu() {
    this.dataSubjectRamGpu
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(0, 1, 0, 0, null);
        this.getTotalAmount();
      });
  }

  dataSubjectStorageGpu: Subject<any> = new Subject<any>();
  changeStorageOfGpu(value: number) {
    this.dataSubjectStorageGpu.next(value);
  }
  onChangeStorageOfGpu() {
    this.dataSubjectStorageGpu
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(1, 0, 0, 0, null);
        this.getTotalAmount();
      });
  }

  dataSubjectGpu: Subject<any> = new Subject<any>();
  changeGpu(value: number) {
    this.dataSubjectGpu.next(value);
  }
  onChangeGpu() {
    this.dataSubjectGpu
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (this.configGPU.gpuOfferId != 0) {
          this.getUnitPrice(0, 0, 0, 1, this.configGPU.gpuOfferId);
        }
        this.getTotalAmount();
      });
  }

  gpuTypeName: string = '';
  changeGpuType() {
    this.gpuTypeName = this.listGPUType.filter(
      (e) => e.id == this.configGPU.gpuOfferId
    )[0].offerName;
    if (this.configGPU.GPU != 0) {
      this.getUnitPrice(0, 0, 0, 1, this.configGPU.gpuOfferId);
    }
    if (this.configGPU.GPU != 0 && this.configGPU.gpuOfferId != 0) {
      this.getTotalAmount();
    }
  }
  //#endregion
  //#region volume gắn ngoài
  listOfDataBlockStorage: BlockStorage[] = [];

  unitPriceVolumeHDD: number = 0;
  unitVATVolumeHDD: number = 0;
  unitPaymentVolumeHDD: number = 0;
  unitPriceVolumeSSD: number = 0;
  unitVATVolumeSSD: number = 0;
  unitPaymentVolumeSSD: number = 0;
  // Lấy giá tiền của Volume gắn thêm 1GB/1Tháng
  getVolumeUnitMoney() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.catalogService
      .getCatalogOffer(null, this.region, null, 'volume-hdd')
      .subscribe((data) => {
        let offer = data.find(
          (offer) => offer.status.toUpperCase() == 'ACTIVE'
        );
        let temVolumeCreate = new VolumeCreate();
        temVolumeCreate.volumeType = 'hdd';
        temVolumeCreate.volumeSize = 1;
        temVolumeCreate.projectId = this.project.toString();
        temVolumeCreate.serviceType = 2;
        temVolumeCreate.serviceInstanceId = 0;
        temVolumeCreate.customerId = this.tokenService.get()?.userId;
        temVolumeCreate.isTrial = false;
        temVolumeCreate.regionId = this.region;
        temVolumeCreate.serviceName = '';
        temVolumeCreate.offerId = offer.id;
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(temVolumeCreate);
        itemPayment.specificationType = 'volume_create';
        itemPayment.serviceDuration = 1;
        itemPayment.sortItem = 0;
        let dataPayment: DataPayment = new DataPayment();
        dataPayment.orderItems = [itemPayment];
        dataPayment.projectId = this.project;
        this.dataService.getPrices(dataPayment).subscribe((result) => {
          console.log('thanh tien volume', result);
          this.unitPriceVolumeHDD = Number.parseFloat(
            result.data.totalAmount.amount
          );
          this.unitVATVolumeHDD = Number.parseFloat(
            result.data.totalVAT.amount
          );
          this.unitPaymentVolumeHDD = Number.parseFloat(
            result.data.totalPayment.amount
          );
          this.cdr.detectChanges();
        });
      });

    this.catalogService
      .getCatalogOffer(null, this.region, null, 'volume-ssd')
      .subscribe((data) => {
        let offer = data.find(
          (offer) => offer.status.toUpperCase() == 'ACTIVE'
        );
        let temVolumeCreate = new VolumeCreate();
        temVolumeCreate.volumeType = 'ssd';
        temVolumeCreate.volumeSize = 1;
        temVolumeCreate.projectId = this.project.toString();
        temVolumeCreate.serviceType = 2;
        temVolumeCreate.serviceInstanceId = 0;
        temVolumeCreate.customerId = this.tokenService.get()?.userId;
        temVolumeCreate.isTrial = false;
        temVolumeCreate.regionId = this.region;
        temVolumeCreate.serviceName = '';
        temVolumeCreate.offerId = offer.id;
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(temVolumeCreate);
        itemPayment.specificationType = 'volume_create';
        itemPayment.serviceDuration = 1;
        itemPayment.sortItem = 0;
        let dataPayment: DataPayment = new DataPayment();
        dataPayment.orderItems = [itemPayment];
        dataPayment.projectId = this.project;
        this.dataService.getPrices(dataPayment).subscribe((result) => {
          console.log('thanh tien volume', result);
          this.unitPriceVolumeSSD = Number.parseFloat(
            result.data.totalAmount.amount
          );
          this.unitVATVolumeSSD = Number.parseFloat(
            result.data.totalVAT.amount
          );
          this.unitPaymentVolumeSSD = Number.parseFloat(
            result.data.totalPayment.amount
          );
          this.getDetailBackupById(this.idBackup);
          this.cdr.detectChanges();
        });
      });
  }

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
          tempBS.price = e.size * this.unitPriceVolumeHDD;
          tempBS.VAT = e.size * this.unitVATVolumeHDD;
          tempBS.priceAndVAT = e.size * this.unitPaymentVolumeHDD;
        } else {
          tempBS.type = 'SSD';
          tempBS.price = e.size * this.unitPriceVolumeSSD;
          tempBS.VAT = e.size * this.unitVATVolumeSSD;
          tempBS.priceAndVAT = e.size * this.unitPaymentVolumeSSD;
        }
        this.listOfDataBlockStorage.push(tempBS);
      }
    });
  }
  //#endregion

  //#region selectedPasswordOrSSHkey
  listSSHKey: SHHKeyModel[] = [];
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;

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
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
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

  onChangeTime(numberMonth: number) {
    this.numberMonth = numberMonth;
    this.getTotalAmount();

    this.totalAmountVolume = 0;
    this.totalVATVolume = 0;
    this.totalPaymentVolume = 0;
    // this.listOfDataBlockStorage.forEach((bs) => {
    //   this.totalAmountVolume += bs.price * this.numberMonth;
    //   this.totalVATVolume += bs.VAT * this.numberMonth;
    //   this.totalPaymentVolume += bs.priceAndVAT * this.numberMonth;
    // });
    this.cdr.detectChanges();
  }
  //#endregion

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  restore(): void {
    this.isLoading = true;
    if (this.isPreConfigPackage == true && this.offerFlavor == null) {
      this.notification.error(
        '',
        this.i18n.fanyi('app.notify.choose.config.package.required')
      );
      return;
    }
    if (
      this.isCustomconfig == true &&
      (this.configCustom.vCPU == 0 ||
        this.configCustom.ram == 0 ||
        this.configCustom.capacity == 0)
    ) {
      this.notification.error(
        '',
        this.i18n.fanyi('app.notify.optional.configuration.invalid')
      );
      return;
    }
    if (
      this.isGpuConfig == true &&
      (this.configGPU.CPU == 0 ||
        this.configGPU.ram == 0 ||
        this.configGPU.storage == 0 ||
        this.configGPU.GPU == 0 ||
        this.configGPU.gpuOfferId == 0)
    ) {
      this.notification.error(
        '',
        this.i18n.fanyi('app.notify.gpu.configuration.invalid')
      );
      return;
    }

    this.instanceInit();
    this.dataService
      .checkflavorforimage(
        this.backupVmModel?.systemInfoBackups[0].imageIdInt,
        this.restoreInstanceBackup.volumeSize,
        this.restoreInstanceBackup.ram,
        this.restoreInstanceBackup.cpu
      )
      .subscribe({
        next: (data) => {
          this.orderItem = [];
          let specificationInstance = JSON.stringify(
            this.restoreInstanceBackup
          );
          let orderItemInstance = new OrderItem();
          orderItemInstance.orderItemQuantity = 1;
          orderItemInstance.specification = specificationInstance;
          orderItemInstance.specificationType = 'restore_instancebackup';
          orderItemInstance.price = this.totalAmount;
          orderItemInstance.serviceDuration = this.numberMonth;
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
                  var returnPath: string = window.location.pathname;
                  console.log('restore instance', this.restoreInstanceBackup);
                  this.router.navigate(['/app-smart-cloud/order/cart'], {
                    state: { data: this.order, path: returnPath },
                  });
                } else {
                  this.isVisiblePopupError = true;
                  this.errorList = result.data;
                }
              },
              error: (error) => {
                this.notification.error(
                  this.i18n.fanyi('app.status.fail'),
                  error.error.detail
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
