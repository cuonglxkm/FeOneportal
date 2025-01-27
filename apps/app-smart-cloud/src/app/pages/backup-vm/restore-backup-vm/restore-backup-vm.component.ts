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
  DataPayment,
  GpuConfigRecommend,
  InstancesModel,
  IPPublicModel,
  ItemPayment,
  OfferItem,
  Order,
  OrderItem,
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
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { LoadingService } from '@delon/abc/loading';
import { OrderService } from 'src/app/shared/services/order.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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
class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  newName?: string;
  capacity?: number = 0;
  minCapacity?: number = 0;
  encrypt?: boolean = false;
  multiattach?: boolean = false;
  price?: number = 0;
  VAT?: number = 0;
  priceAndVAT?: number = 0;
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
  listExternalAttachVolume: VolumeBackup[] = [];
  listSecurityGroupBackups: any[] = [];

  selectedOption: string = 'current';
  isLoadingCurrent: boolean = false;
  isLoading: boolean = false;

  disableKeypair: boolean = false;

  numberMonth: number = 1;

  passwordVisible = false;

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
    if (this.reloadCarousel && this.selectedOption == 'new') {
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
    this.getActiveServiceByRegion();
    this.getListOptionGpuValue();
    this.getConfigurations();
    this.getVolumeUnitMoney();
    this.getListGpuType();
    this.getAllIPPublic();
    this.getListNetwork();
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
    this.onChangeCpuOfGpu();
    this.onChangeRamOfGpu();
    this.onChangeStorageOfGpu();
    this.onChangeGpu();
    this.getAllSSHKey();
    this.checkExistName();
    this.getTotalAmountBlockStorage();
    this.cdr.detectChanges();
  }

  //Lấy các dịch vụ hỗ trợ theo region
  isSupportEncryption: boolean = false;
  isSupportMultiAttachment: boolean = false;
  isVmFlavor: boolean = true;
  isVmGpu: boolean = false;
  getActiveServiceByRegion() {
    this.catalogService
      .getActiveServiceByRegion(
        ['Encryption', 'MultiAttachment', 'vm-flavor', 'vm-gpu'],
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
        this.isVmFlavor = data.filter(
          (e) => e.productName == 'vm-flavor'
        )[0].isActive;
        if (this.isVmFlavor) {
          this.onClickConfigPackage();
        }
        this.isVmGpu = data.filter(
          (e) => e.productName == 'vm-gpu'
        )[0].isActive;
        this.cdr.detectChanges();
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
        this.checkValidConfig();
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
        this.restoreInstanceBackup.encryption =
          this.backupVmModel.volumeBackups.filter(
            (e) => e.isBootable == true
          )[0].isEncryption;
        this.dataService.getById(this.backupVmModel.instanceId).subscribe({
          next: (data) => {
            this.instanceModel = data;
            if (this.instanceModel.offerId == 0) {
              this.selectedIndextab = 1;
              this.onClickCustomConfig();
            }
            if (this.instanceModel.gpuType != null) {
              this.selectedIndextab = 2;
              this.onClickGpuConfig();
            }
          },
          error: (e) => {
            this.selectedIndextab = 0;
            this.onClickCustomConfig();
          },
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
        this.initFlavors();

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
            tempBS.price = e.size * this.unitPriceVolumeHDD;
            tempBS.VAT = Math.round(tempBS.price * 0.1);
            tempBS.priceAndVAT = tempBS.price + tempBS.VAT;
          } else {
            tempBS.type = 'SSD';
            tempBS.price = e.size * this.unitPriceVolumeSSD;
            tempBS.VAT = Math.round(tempBS.price * 0.1);
            tempBS.priceAndVAT = tempBS.price + tempBS.VAT;
          }
          this.listOfDataBlockStorage.push(tempBS);
        });
        this.getTotalAmount();

        if (this.backupVmModel.securityGroupBackups != null) {
          this.listSecurityGroupBackups = getUniqueObjects(
            this.backupVmModel.securityGroupBackups,
            'sgName'
          );
        }
        this.listSecurityGroupBackups.forEach((e) => {
          this.selectedSecurityGroup.push(e.sgName);
        });
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

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
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
        this.cdr.detectChanges();
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
  }

  resetData() {
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.configGPU = new ConfigGPU();
    this.configCustom = new ConfigCustom();
    if (this.isCustomconfig) {
      this.configCustom.capacity =
        this.backupVmModel?.systemInfoBackups[0].rootSize < this.stepCapacity
          ? this.stepCapacity
          : this.backupVmModel?.systemInfoBackups[0].rootSize;
    } else if (this.isGpuConfig) {
      this.configGPU.storage =
        this.backupVmModel?.systemInfoBackups[0].rootSize < this.stepCapacity
          ? this.stepCapacity
          : this.backupVmModel?.systemInfoBackups[0].rootSize;
    }
    this.volumeIntoMoney = 0;
    this.ramIntoMoney = 0;
    this.cpuIntoMoney = 0;
    this.gpuIntoMoney = 0;
    this.totalAmount = 0;
    this.totalVAT = 0;
    this.totalincludesVAT = 0;
    this.restoreInstanceBackup.ram = 0;
    this.restoreInstanceBackup.cpu = 0;
    this.restoreInstanceBackup.volumeSize = 0;
    if (this.isCustomconfig) {
      this.restoreInstanceBackup.volumeSize = this.configCustom.capacity;
      this.getUnitPrice(1, 0, 0, 0, null);
      this.getUnitPrice(0, 1, 0, 0, null);
      this.getUnitPrice(0, 0, 1, 0, null);
      this.getTotalAmount();
    } else if (this.isGpuConfig) {
      this.restoreInstanceBackup.volumeSize = this.configGPU.storage;
      this.getUnitPrice(1, 0, 0, 0, null);
      this.getUnitPrice(0, 1, 0, 0, null);
      this.getUnitPrice(0, 0, 1, 0, null);
      this.getUnitPrice(0, 0, 0, 1, this.listGPUType[0].id);
      this.getTotalAmount();
    }
    this.restoreInstanceBackup.gpuCount = 0;
    this.checkValidConfig();
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
        this.listOfferFlavors = this.listOfferFlavors.filter(
          (e) =>
            Number.parseInt(e.description.split(' ')[7]) >=
            this.backupVmModel?.systemInfoBackups[0].rootSize
        );
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
    this.checkValidConfig();
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
        this.checkValidConfig();
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
        this.checkValidConfig();
        this.cdr.detectChanges();
      });
  }

  minCapacity: number = 0;
  maxCapacity: number = 0;
  stepCapacity: number = 0;
  surplus: number;
  getConfigurations() {
    this.configurationService.getConfigurations('BLOCKSTORAGE').subscribe({
      next: (data) => {
        let valueArray = data.valueString.split('#');
        this.minCapacity = Number.parseInt(valueArray[0]);
        this.stepCapacity = Number.parseInt(valueArray[1]);
        this.maxCapacity = Number.parseInt(valueArray[2]);
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
        if (this.configCustom.capacity < this.stepCapacity) {
          this.configCustom.capacity =
            this.backupVmModel?.systemInfoBackups[0].rootSize <
            this.stepCapacity
              ? this.stepCapacity
              : this.backupVmModel?.systemInfoBackups[0].rootSize;
        }
      }
      if (
        this.configCustom.capacity <
        this.backupVmModel?.systemInfoBackups[0].rootSize
      ) {
        this.notification.warning(
          '',
          this.i18n.fanyi('app.notify.amount.capacity.snapshot', {
            num: this.backupVmModel?.systemInfoBackups[0].rootSize,
          })
        );
        this.configCustom.capacity =
          this.backupVmModel?.systemInfoBackups[0].rootSize < this.stepCapacity
            ? this.stepCapacity
            : this.backupVmModel?.systemInfoBackups[0].rootSize;
        this.cdr.detectChanges();
      }
      this.getUnitPrice(1, 0, 0, 0, null);
      this.getTotalAmount();
      this.checkValidConfig();
    });
  }
  //#endregion

  //#region Cấu hình GPU
  configRecommend: GpuConfigRecommend;
  listOptionGpuValue: number[] = [];
  getListOptionGpuValue() {
    this.configurationService
      .getConfigurations('OPTIONGPUVALUE')
      .subscribe(
        (data) =>
          (this.listOptionGpuValue = data.valueString.split(', ').map(Number))
      );
  }

  listGpuConfigRecommend: GpuConfigRecommend[] = [];
  listGPUType: OfferItem[] = [];
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
        this.cdr.detectChanges();
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
        this.checkValidConfig();
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
        this.checkValidConfig();
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
        if (this.configGPU.storage > this.maxCapacity) {
          this.configGPU.storage = this.maxCapacity - this.surplus;
          this.cdr.detectChanges();
        }
        if (this.configGPU.storage % this.stepCapacity > 0) {
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.amount.capacity', {
              number: this.stepCapacity,
            })
          );
          this.configGPU.storage =
            this.configGPU.storage -
            (this.configGPU.storage % this.stepCapacity);
          if (this.configGPU.storage < this.stepCapacity) {
            this.configGPU.storage =
              this.backupVmModel?.systemInfoBackups[0].rootSize <
              this.stepCapacity
                ? this.stepCapacity
                : this.backupVmModel?.systemInfoBackups[0].rootSize;
          }
        }
        if (
          this.configGPU.storage <
          this.backupVmModel?.systemInfoBackups[0].rootSize
        ) {
          this.notification.warning(
            '',
            this.i18n.fanyi('app.notify.amount.capacity.snapshot', {
              num: this.backupVmModel?.systemInfoBackups[0].rootSize,
            })
          );
          this.configGPU.storage =
            this.backupVmModel?.systemInfoBackups[0].rootSize <
            this.stepCapacity
              ? this.stepCapacity
              : this.backupVmModel?.systemInfoBackups[0].rootSize;
        }
        this.getUnitPrice(1, 0, 0, 0, null);
        this.getTotalAmount();
        this.checkValidConfig();
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
          this.configRecommend = this.listGpuConfigRecommend.filter(
            (e) =>
              e.id == this.configGPU.gpuOfferId &&
              e.gpuCount == this.configGPU.GPU
          )[0];
          console.log('cấu hình đề recommend', this.configRecommend);
        }
        this.getTotalAmount();
        this.checkValidConfig();
      });
  }

  gpuTypeName: string = '';
  changeGpuType() {
    this.gpuTypeName = this.listGPUType.filter(
      (e) => e.id == this.configGPU.gpuOfferId
    )[0].offerName;
    if (this.configGPU.GPU != 0) {
      this.getUnitPrice(0, 0, 0, 1, this.configGPU.gpuOfferId);
      this.configRecommend = this.listGpuConfigRecommend.filter(
        (e) =>
          e.id == this.configGPU.gpuOfferId && e.gpuCount == this.configGPU.GPU
      )[0];
      console.log('cấu hình đề recommend', this.configRecommend);
    }
    if (this.configGPU.GPU != 0 && this.configGPU.gpuOfferId != 0) {
      this.getTotalAmount();
    }
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
    } else if (this.isPreConfigPackage && this.selectedElementFlavor) {
      this.isValid = true;
    } else {
      this.isValid = true;
    }
  }
  //#endregion
  //#region volume gắn ngoài
  listOfDataBlockStorage: BlockStorage[] = [];

  unitPriceVolumeHDD: number = 0;
  unitPriceVolumeSSD: number = 0;
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
          this.getDetailBackupById(this.idBackup);
          this.cdr.detectChanges();
        });
      });
  }

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
          tempBS.price = e.size * this.unitPriceVolumeHDD;
          tempBS.VAT = Math.round(tempBS.price * 0.1);
          tempBS.priceAndVAT = tempBS.price + tempBS.VAT;
        } else {
          tempBS.type = 'SSD';
          tempBS.price = e.size * this.unitPriceVolumeSSD;
          tempBS.VAT = Math.round(tempBS.price * 0.1);
          tempBS.priceAndVAT = tempBS.price + tempBS.VAT;
        }
        this.listOfDataBlockStorage.push(tempBS);
      }
      this.getTotalAmount();
    });
  }

  dataBSSubject: Subject<any> = new Subject<any>();
  changeTotalAmountBlockStorage(id: number, value: any) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.dataBSSubject.next({
      id: id,
      value: value,
    });
  }

  getTotalAmountBlockStorage() {
    let id: number, value: any;
    this.dataBSSubject.pipe(debounceTime(500)).subscribe((res) => {
      id = res.id;
      value = res.value;
      let index = this.listOfDataBlockStorage.findIndex((obj) => obj.id == id);
      let changeBlockStorage: BlockStorage = this.listOfDataBlockStorage[index];
      if (changeBlockStorage.capacity % this.stepCapacity > 0) {
        this.notification.warning(
          '',
          this.i18n.fanyi('app.notify.amount.capacity', {
            number: this.stepCapacity,
          })
        );
        changeBlockStorage.capacity =
          changeBlockStorage.capacity -
          (changeBlockStorage.capacity % this.stepCapacity);
      }
      if (changeBlockStorage.type.toUpperCase() == 'HDD') {
        changeBlockStorage.price =
          changeBlockStorage.capacity * this.unitPriceVolumeHDD;
        changeBlockStorage.VAT = Math.round(changeBlockStorage.price * 0.1);
        changeBlockStorage.priceAndVAT =
          changeBlockStorage.price + changeBlockStorage.VAT;
        this.listOfDataBlockStorage[index] = changeBlockStorage;
      } else if (changeBlockStorage.type.toUpperCase() == 'SSD') {
        changeBlockStorage.price =
          changeBlockStorage.capacity * this.unitPriceVolumeSSD;
        changeBlockStorage.VAT = Math.round(changeBlockStorage.price * 0.1);
        changeBlockStorage.priceAndVAT =
          changeBlockStorage.price + changeBlockStorage.VAT;
        this.listOfDataBlockStorage[index] = changeBlockStorage;
      }
      this.getTotalAmount();
      this.loadingSrv.close();
      this.cdr.detectChanges();
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

  onChangeTime(value) {
    if (value == undefined) {
      this.isValid = false;
      this.totalAmount = 0;
      this.totalVAT = 0;
      this.totalincludesVAT = 0;
    } else {
      this.isValid = true;
      this.numberMonth = value;
      this.getTotalAmount();
    }
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

  configCustom: ConfigCustom = new ConfigCustom();
  configGPU: ConfigGPU = new ConfigGPU();
  restoreInstanceBackup: RestoreInstanceBackup = new RestoreInstanceBackup();
  instanceInit() {
    this.restoreInstanceBackup.instanceBackupId = this.backupVmModel?.id;
    let selectedVolumeExternal: VolumeExternalBackup[] = [];
    this.listOfDataBlockStorage.forEach((e) => {
      let volumeExternal = new VolumeExternalBackup();
      volumeExternal.id = e.id;
      if (e.newName && e.newName.length != 0) {
        volumeExternal.name = e.newName;
      } else {
        volumeExternal.name = (e.name + '_' + this.instanceModel.name).slice(
          0,
          49
        );
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
    if (this.isCustomconfig) {
      this.restoreInstanceBackup.offerId = 0;
      this.restoreInstanceBackup.ram = this.configCustom.ram;
      this.restoreInstanceBackup.cpu = this.configCustom.vCPU;
      this.restoreInstanceBackup.volumeSize = this.configCustom.capacity;
    } else if (this.isGpuConfig) {
      this.restoreInstanceBackup.offerId = 0;
      this.restoreInstanceBackup.ram = this.configGPU.ram;
      this.restoreInstanceBackup.cpu = this.configGPU.CPU;
      this.restoreInstanceBackup.volumeSize = this.configGPU.storage;
      this.restoreInstanceBackup.gpuCount = this.configGPU.GPU;
      this.restoreInstanceBackup.gpuTypeOfferId = this.configGPU.gpuOfferId;
    } else {
      if (this.offerFlavor) {
        this.restoreInstanceBackup.offerId = this.offerFlavor.id;
        this.offerFlavor.characteristicValues.forEach((e) => {
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
}
