import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  InstanceCreate,
  IPPublicModel,
  IPSubnetModel,
  ImageTypesModel,
  SHHKeyModel,
  SecurityGroupModel,
  VolumeCreate,
  Order,
  OrderItem,
  IpCreate,
  OfferItem,
  Image,
  DataPayment,
  ItemPayment,
} from '../instances.model';
import { Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { SnapshotVolumeService } from 'src/app/shared/services/snapshot-volume.service';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { Subject, debounceTime } from 'rxjs';
import { addDays } from 'date-fns';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';

interface InstancesForm {
  name: FormControl<string>;
}
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
  GPUType: string = '';
}
class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  capacity?: number = 0;
  encrypt?: boolean = false;
  multiattach?: boolean = false;
  price?: number = 0;
  priceAndVAT?: number = 0;
}
class Network {
  id: number = 0;
  ip?: string = '';
  amount?: number = 0;
  price?: number = 0;
  priceAndVAT?: number = 0;
}
@Component({
  selector: 'one-portal-instances-create',
  templateUrl: './instances-create.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesCreateComponent implements OnInit {
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

  listGPUType: any[] = [
    { type: 'a30', displayName: 'Nvidia A30' },
    { type: 'a100', displayName: 'Nvidia A100' },
  ];

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/)],
    }),
    passOrKeyFormControl: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,}$/
        ),
      ],
    }),
  });

  //danh sách các biến của form model
  instanceCreate: InstanceCreate = new InstanceCreate();
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  region: number;
  projectId: number;
  userId: number;
  user: any;
  today: Date = new Date();
  ipPublicValue: number = 0;
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password: string = '';
  numberMonth: number = 1;
  hdh: any = null;
  offerFlavor: any = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  configGPU: ConfigGPU = new ConfigGPU();
  selectedSSHKeyName: string;
  selectedSnapshot: number;
  cardHeight: string = '160px';

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private snapshotVLService: SnapshotVolumeService,
    private catalogService: CatalogService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private loadingSrv: LoadingService,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver,
    private vlanService: VlanService
  ) {}

  @ViewChild('nameInput') firstInput: ElementRef;
  @ViewChild('myCarouselImage') myCarouselImage: NguCarousel<any>;
  @ViewChild('myCarouselFlavor') myCarouselFlavor: NguCarousel<any>;
  reloadCarousel: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.reloadCarousel = true;
    this.updateActivePoint();
  }

  ngAfterViewInit(): void {
    this.firstInput.nativeElement.focus();
    this.updateActivePoint(); // Gọi hàm này sau khi view đã được init để đảm bảo có giá trị cần thiết
  }

  updateActivePoint(): void {
    // Gọi hàm reloadCarousel khi cần reload
    if (this.reloadCarousel) {
      this.reloadCarousel = false;
      setTimeout(() => {
        this.myCarouselImage.reset();
        this.myCarouselFlavor.reset();
      }, 100);
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

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.initIpSubnet();
    this.initFlavors();
    this.initSnapshot();
    this.getAllIPPublic();
    this.getAllImageType();
    this.getAllSecurityGroup();

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((result) => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          // Màn hình cỡ nhỏ
          this.cardHeight = '130px';
        } else if (result.breakpoints[Breakpoints.Small]) {
          // Màn hình cỡ nhỏ - trung bình
          this.cardHeight = '180px';
        } else if (result.breakpoints[Breakpoints.Medium]) {
          // Màn hình trung bình
          this.cardHeight = '210px';
        } else if (result.breakpoints[Breakpoints.Large]) {
          // Màn hình lớn
          this.cardHeight = '165px';
        } else if (result.breakpoints[Breakpoints.XLarge]) {
          // Màn hình rất lớn
          this.cardHeight = '150px';
        }

        // Cập nhật chiều cao của card bằng Renderer2
        this.renderer.setStyle(
          this.el.nativeElement,
          'height',
          this.cardHeight
        );
      });
    this.cdr.detectChanges();
    this.checkExistName();
    this.getTotalAmountBlockStorage();
    this.getTotalAmountIPv4();
    this.getTotalAmountIPv6();
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
    this.onChangeTime();
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
        this.dataService.checkExistName(res, this.region).subscribe((data) => {
          if (data == true) {
            this.isExistName = true;
          } else {
            this.isExistName = false;
          }
          this.cdr.detectChanges();
        });
      });
  }

  //Kiểm tra khu vực có IPv6
  hasOfferIpv6: boolean = false;
  checkOfferIpv6() {
    this.catalogService
      .getCatalogOffer(101, this.region, null, null)
      .subscribe({
        next: (data) => {
          if (data) {
            this.hasOfferIpv6 = true;
          } else {
            this.hasOfferIpv6 = false;
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy offer ipv6 không thành công'
          );
          this.hasOfferIpv6 = false;
        },
      });
  }

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  isLoading = false;
  listSelectedImage = [];
  selectedImageTypeId: number;
  listOfImageByImageType: Map<number, Image[]> = new Map();
  imageTypeId = [];

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      this.listImageTypes.forEach((e) => {
        this.imageTypeId.push(e.id);
      });
      this.getAllOfferImage(this.imageTypeId);
      console.log('list image types', this.listImageTypes);
    });
  }

  getAllOfferImage(imageTypeId: any[]) {
    imageTypeId.forEach((id) => {
      let listImage: Image[] = [];
      this.listOfImageByImageType.set(id, listImage);
    });
    this.dataService
      .getListOffers(this.region, 'VM-Image')
      .subscribe((data: OfferItem[]) => {
        data.forEach((e: OfferItem) => {
          if (e.status.toUpperCase() == 'ACTIVE') {
            let tempImage = new Image();
            e.characteristicValues.forEach((char) => {
              if (char.charOptionValues[0] == 'Id') {
                tempImage.id = Number.parseInt(char.charOptionValues[1]);
                tempImage.name = e.offerName;
              }
              if (char.charOptionValues[0] == 'ImageTypeId') {
                this.listOfImageByImageType
                  .get(Number.parseInt(char.charOptionValues[1]))
                  .push(tempImage);
              }
            });
          }
        });
        this.cdr.detectChanges();
        console.log('list Images', this.listOfImageByImageType);
      });
  }

  nameHdh: string = '';
  isLinuxHDH: boolean = false;
  onInputHDH(event: any, index: number, imageTypeId: number) {
    if (imageTypeId == 1) {
      this.getAllSSHKey();
    } else {
      this.listSSHKey = [];
    }
    this.hdh = event;
    this.selectedImageTypeId = imageTypeId;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      if (i != index) {
        this.listSelectedImage[i] = 0;
      }
    }
    if (this.offerFlavor != null) {
      this.getTotalAmount();
    }
    if (this.isCustomconfig) {
      this.changeCapacity(event);
      this.changeRam(event);
      this.changeVCPU(event);
    }
    const filteredImages = this.listOfImageByImageType
      .get(imageTypeId)
      .filter((e) => e.id == event);
    this.nameHdh = filteredImages.length > 0 ? filteredImages[0].name : '';
    console.log('Hệ điều hành', this.hdh);
    console.log('list seleted Image', this.listSelectedImage);
  }

  //#endregion

  //#region  Snapshot
  isSnapshot: boolean = false;
  listSnapshot: SnapshotVolumeDto[] = [];
  size: number;
  status: string;

  initSnapshot(): void {
    this.selectedSnapshot = null;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      this.listSelectedImage[i] = 0;
    }
    if (this.isSnapshot) {
      this.snapshotVLService
        .getSnapshotVolumes(9999, 1, this.region, this.projectId, '', '', '')
        .subscribe((data: any) => {
          this.listSnapshot = data.records.filter(
            (e: any) => e.fromRootVolume == true
          );
          console.log('list snapshot volume root', this.listSnapshot);
        });
    }
  }

  //#endregion

  //#region HDD hay SDD
  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;

  initHDD(): void {
    this.activeBlockHDD = true;
    this.activeBlockSSD = false;
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
    this.getUnitPrice(1, 0, 0);
    if (
      this.isCustomconfig &&
      this.configCustom.vCPU != 0 &&
      this.configCustom.ram != 0 &&
      this.configCustom.capacity != 0
    ) {
      this.getTotalAmount();
    }
    this.listOfferFlavors = [];
    this.initFlavors();
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
    this.getUnitPrice(1, 0, 0);
    if (
      this.isCustomconfig &&
      this.configCustom.vCPU != 0 &&
      this.configCustom.ram != 0 &&
      this.configCustom.capacity != 0
    ) {
      this.getTotalAmount();
    }
    this.listOfferFlavors = [];
    this.initFlavors();
  }

  isPreConfigPackage = true;
  isCustomconfig = false;
  isGpuConfig = false;
  onClickConfigPackage() {
    this.isPreConfigPackage = true;
    this.isCustomconfig = false;
    this.isGpuConfig = false;
    this.resetData();
    this.disableHDD = false;
  }

  onClickCustomConfig() {
    this.isPreConfigPackage = false;
    this.isCustomconfig = true;
    this.isGpuConfig = false;
    this.resetData();
    this.disableHDD = false;
  }

  disableHDD: boolean = false;
  onClickGpuConfig() {
    this.isPreConfigPackage = false;
    this.isCustomconfig = false;
    this.isGpuConfig = true;
    this.resetData();
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.disableHDD = true;
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
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];
  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(
        this.projectId,
        '',
        this.userId,
        this.region,
        9999,
        1,
        false
      )
      .subscribe((data: any) => {
        this.listIPPublic = data.records.filter((e) => e.status == 0);
        console.log('list IP public', this.listIPPublic);
      });
  }

  listVlanNetwork: NetWorkModel[] = [];
  vlanNetwork: string;
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

  listPort: Port[] = [];
  port: string;
  getListPort() {
    this.dataService
      .getListAllPortByNetwork(this.vlanNetwork, this.region)
      .subscribe({
        next: (data) => {
          this.listPort = data;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Port không thành công'
          );
        },
      });
  }

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(
        this.region,
        this.tokenService.get()?.userId,
        this.projectId
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

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  listOfferFlavors: OfferItem[] = [];
  selectedElementFlavor: string = null;
  isInitialClass = true;
  isNewClass = false;

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
    if (this.hdh != null) {
      this.getTotalAmount();
    }
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
  getUnitPrice(volumeSize: number, ram: number, cpu: number) {
    let tempInstance: InstanceCreate = new InstanceCreate();
    tempInstance.imageId = this.hdh;
    tempInstance.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    tempInstance.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
    tempInstance.offerId = 0;
    tempInstance.flavorId = 0;
    tempInstance.volumeSize = volumeSize;
    tempInstance.ram = ram;
    tempInstance.cpu = cpu;
    tempInstance.projectId = this.projectId;
    tempInstance.regionId = this.region;
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(tempInstance);
    itemPayment.specificationType = 'instance_create';
    itemPayment.serviceDuration = 1;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.projectId;
    this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien/đơn giá', result);
      if (volumeSize == 1) {
        this.volumeUnitPrice = Number.parseFloat(
          result.data.totalAmount.amount
        );
        this.volumeIntoMoney =
          this.volumeUnitPrice * this.configCustom.capacity;
      }
      if (ram == 1) {
        this.ramUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        this.ramIntoMoney = this.ramUnitPrice * this.configCustom.ram;
      }
      if (cpu == 1) {
        this.cpuUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        this.cpuIntoMoney = this.cpuUnitPrice * this.configCustom.vCPU;
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
        this.getUnitPrice(0, 0, 1);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0 &&
          this.hdh != null
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.vCPU == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
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
        this.getUnitPrice(0, 1, 0);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0 &&
          this.hdh != null
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.ram == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
      });
  }

  dataSubjectCapacity: Subject<any> = new Subject<any>();
  changeCapacity(value: number) {
    this.dataSubjectCapacity.next(value);
  }
  onChangeCapacity() {
    this.dataSubjectCapacity
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(1, 0, 0);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0 &&
          this.hdh != null
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.capacity == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
      });
  }

  dataSubjectCpuGpu: Subject<any> = new Subject<any>();
  changeCpuOfGpu(value: number) {
    this.dataSubjectCpuGpu.next(value);
  }

  dataSubjectRamGpu: Subject<any> = new Subject<any>();
  changeRamOfGpu(value: number) {
    this.dataSubjectRamGpu.next(value);
  }

  dataSubjectStorageGpu: Subject<any> = new Subject<any>();
  changeStorageOfGpu(value: number) {
    this.dataSubjectStorageGpu.next(value);
  }

  dataSubjectGpu: Subject<any> = new Subject<any>();
  changeGpu(value: number) {
    this.dataSubjectGpu.next(value);
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
    this.form.setControl(
      'passOrKeyFormControl',
      new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,}$/
          ),
        ],
      })
    );
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.password = '';
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
      .getAllSSHKey(this.projectId, this.region, this.userId, 999999, 0)
      .subscribe((data: any) => {
        data.records.forEach((e) => {
          const itemMapper = new SHHKeyModel();
          itemMapper.id = e.id;
          itemMapper.displayName = e.name;
          this.listSSHKey.push(itemMapper);
        });
      });
  }

  expiredDate: Date = addDays(this.today, 30);
  dataSubjectTime: Subject<any> = new Subject<any>();
  changeTime(value: number) {
    this.dataSubjectTime.next(value);
  }
  onChangeTime() {
    this.dataSubjectTime
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + this.numberMonth * 30);
        this.expiredDate = currentDate;
        if (
          this.hdh != null &&
          (this.offerFlavor != null ||
            (this.configCustom.vCPU != 0 &&
              this.configCustom.ram != 0 &&
              this.configCustom.capacity != 0))
        ) {
          this.getTotalAmount();
        }

        this.totalAmountVolume = 0;
        this.totalAmountVolumeVAT = 0;
        this.listOfDataBlockStorage.forEach((bs) => {
          this.totalAmountVolume += bs.price * this.numberMonth;
          this.totalAmountVolumeVAT += bs.priceAndVAT * this.numberMonth;
        });

        this.totalAmountIPv4 = 0;
        this.totalAmountIPv4VAT = 0;
        this.listOfDataIPv4.forEach((item) => {
          this.totalAmountIPv4 += item.price * this.numberMonth;
          this.totalAmountIPv4VAT += item.priceAndVAT * this.numberMonth;
        });

        this.totalAmountIPv6 = 0;
        this.totalAmountIPv6VAT = 0;
        this.listOfDataIPv6.forEach((item) => {
          this.totalAmountIPv6 += item.price * this.numberMonth;
          this.totalAmountIPv6VAT += item.priceAndVAT * this.numberMonth;
        });
        this.cdr.detectChanges();
      });
  }
  //#endregion

  //#region BlockStorage
  activeBlockStorage: boolean = false;
  idBlockStorage = 0;
  listOfDataBlockStorage: BlockStorage[] = [];
  defaultBlockStorage: BlockStorage = new BlockStorage();
  typeBlockStorage: Array<{ value: string; label: string }> = [
    { value: 'hdd', label: 'HDD' },
    { value: 'ssd', label: 'SSD' },
  ];

  initBlockStorage(): void {
    this.activeBlockStorage = true;
    this.listOfDataBlockStorage.push(this.defaultBlockStorage);
  }
  deleteRowBlockStorage(id: number): void {
    this.listOfDataBlockStorage = this.listOfDataBlockStorage.filter(
      (d) => d.id !== id
    );
    this.externalVolume();
  }

  onInputBlockStorage(id: number, value: any) {
    this.changeTotalAmountBlockStorage(id, value);
    const filteredArrayHas = this.listOfDataBlockStorage.filter(
      (item) => item.type == ''
    );

    if (filteredArrayHas.length == 0) {
      this.defaultBlockStorage = new BlockStorage();
      this.idBlockStorage++;
      this.defaultBlockStorage.id = this.idBlockStorage;
      this.listOfDataBlockStorage.push(this.defaultBlockStorage);
    }
    this.cdr.detectChanges();
  }

  externalVolumeHdd: number = 0;
  externalVolumeSsd: number = 0;
  externalVolume() {
    this.externalVolumeHdd = 0;
    this.externalVolumeSsd = 0;
    this.listOfDataBlockStorage.forEach((e) => {
      if (e.type == 'hdd') {
        this.externalVolumeHdd += e.capacity;
      }
      if (e.type == 'ssd') {
        this.externalVolumeSsd += e.capacity;
      }
    });
    this.cdr.detectChanges();
  }
  //#endregion
  //#region Network
  activeIPv4: boolean = false;
  activeIPv6: boolean = false;
  idIPv4 = 0;
  idIPv6 = 0;
  listOfDataIPv4: Network[] = [];
  listOfDataIPv6: Network[] = [];
  defaultIPv4: Network = new Network();
  defaultIPv6: Network = new Network();
  listIPSubnetModel: IPSubnetModel[] = [];

  initIpSubnet(): void {
    this.dataService.getAllIPSubnet(this.region).subscribe((data: any) => {
      this.listIPSubnetModel = data;
      this.cdr.detectChanges();
    });
  }

  initIPv4(): void {
    this.activeIPv4 = true;
    this.listOfDataIPv4.push(this.defaultIPv4);
  }

  initIPv6(): void {
    this.activeIPv6 = true;
    this.listOfDataIPv6.push(this.defaultIPv6);
  }

  deleteRowIPv4(id: number): void {
    this.listOfDataIPv4 = this.listOfDataIPv4.filter((d) => d.id !== id);
    this.externalIp(this.listOfDataIPv4, true);
  }

  deleteRowIPv6(id: number): void {
    this.listOfDataIPv6 = this.listOfDataIPv6.filter((d) => d.id !== id);
    this.externalIp(this.listOfDataIPv6, false);
  }

  onInputIPv4(value: any, id: number) {
    this.listOfDataIPv4.forEach((e) => {
      if (e.id == id) {
        e.amount = 1;
      }
    });
    this.changeTotalAmountIPv4(value);
    const filteredArrayHas = this.listOfDataIPv4.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length == 0) {
      this.defaultIPv4 = new Network();
      this.idIPv4++;
      this.defaultIPv4.id = this.idIPv4;
      this.listOfDataIPv4.push(this.defaultIPv4);
    }
    this.externalIp(this.listOfDataIPv4, true);
    this.cdr.detectChanges();
  }

  onInputIPv6(value: any, id: number) {
    this.listOfDataIPv6.forEach((e) => {
      if (e.id == id) {
        e.amount = 1;
      }
    });
    this.changeTotalAmountIPv6(value);
    const filteredArrayHas = this.listOfDataIPv6.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length == 0) {
      this.defaultIPv6 = new Network();
      this.idIPv6++;
      this.defaultIPv6.id = this.idIPv6;
      this.listOfDataIPv6.push(this.defaultIPv6);
    }
    this.externalIp(this.listOfDataIPv6, false);
    this.cdr.detectChanges();
  }

  numberOfIpv4: number = 0;
  numberOfIpv6: number = 0;
  externalIp(listIp: Network[], checkIpv4: boolean) {
    if (checkIpv4) {
      this.numberOfIpv4 = 0;
    } else {
      this.numberOfIpv6 = 0;
    }
    listIp.forEach((e) => {
      if (e.ip != '') {
        if (checkIpv4) {
          this.numberOfIpv4 += e.amount;
        } else {
          this.numberOfIpv6 += e.amount;
        }
      }
    });
  }
  //#endregion

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  userChangeProject() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  createInstancesForm(): FormGroup<InstancesForm> {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  instanceInit() {
    this.instanceCreate.description = null;

    this.instanceCreate.imageId = this.hdh;
    this.instanceCreate.iops = 0;
    this.instanceCreate.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.keypairName = this.selectedSSHKeyName;
    this.instanceCreate.securityGroups = this.selectedSecurityGroup;
    this.instanceCreate.network = null;
    this.instanceCreate.isUsePrivateNetwork = this.isUseLAN;
    this.instanceCreate.ipPublic = this.ipPublicValue;
    this.instanceCreate.password = this.password;
    this.instanceCreate.snapshotCloudId = this.selectedSnapshot;
    this.instanceCreate.encryption = false;
    this.instanceCreate.isUseIPv6 = this.isUseIPv6;
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;
    if (this.isCustomconfig) {
      this.instanceCreate.offerId = 0;
      this.instanceCreate.flavorId = 0;
      this.instanceCreate.ram = this.configCustom.ram;
      this.instanceCreate.cpu = this.configCustom.vCPU;
      this.instanceCreate.volumeSize = this.configCustom.capacity;
    } else if (this.isGpuConfig) {
      this.instanceCreate.offerId = 0;
      this.instanceCreate.flavorId = 0;
      this.instanceCreate.ram = this.configGPU.ram;
      this.instanceCreate.cpu = this.configGPU.CPU;
      this.instanceCreate.volumeSize = this.configGPU.storage;
      this.instanceCreate.gpuCount = this.configGPU.GPU;
      this.instanceCreate.gpuType = this.configGPU.GPUType;
    } else {
      this.instanceCreate.offerId = this.offerFlavor.id;
      this.offerFlavor.characteristicValues.forEach((e) => {
        if (e.charOptionValues[0] == 'Id') {
          this.instanceCreate.flavorId = Number.parseInt(e.charOptionValues[1]);
        }
        if (e.charOptionValues[0] == 'RAM') {
          this.instanceCreate.ram = Number.parseInt(e.charOptionValues[1]);
        }
        if (e.charOptionValues[0] == 'CPU') {
          this.instanceCreate.cpu = Number.parseInt(e.charOptionValues[1]);
        }
        if (e.charOptionValues[0] == 'HDD') {
          this.instanceCreate.volumeSize = Number.parseInt(
            e.charOptionValues[1]
          );
        }
      });
    }
    this.instanceCreate.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.gpuType = this.configGPU.GPUType;
    this.instanceCreate.gpuCount = this.configGPU.GPU;
    this.instanceCreate.projectId = this.projectId;
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

  volumeCreate: VolumeCreate = new VolumeCreate();
  volumeInit(blockStorage: BlockStorage) {
    this.volumeCreate.volumeType = blockStorage.type;
    this.volumeCreate.volumeSize = blockStorage.capacity;
    this.volumeCreate.description = null;
    this.volumeCreate.createFromSnapshotId = null;
    this.volumeCreate.instanceToAttachId = null;
    this.volumeCreate.isMultiAttach = blockStorage.multiattach;
    this.volumeCreate.isEncryption = blockStorage.encrypt;
    this.volumeCreate.projectId = this.projectId.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;

    // let currentDate = new Date();
    // let lastDate = new Date();
    // lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    // this.volumeCreate.createDate = currentDate.toISOString().substring(0, 19);
    // this.volumeCreate.expireDate = lastDate.toISOString().substring(0, 19);

    this.volumeCreate.saleDept = null;
    this.volumeCreate.saleDeptCode = null;
    this.volumeCreate.contactPersonEmail = null;
    this.volumeCreate.contactPersonPhone = null;
    this.volumeCreate.contactPersonName = null;
    this.volumeCreate.note = null;
    this.volumeCreate.createDateInContract = null;
    this.volumeCreate.am = null;
    this.volumeCreate.amManager = null;
    this.volumeCreate.isTrial = false;
    this.volumeCreate.couponCode = null;
    this.volumeCreate.dhsxkd_SubscriptionId = null;
    this.volumeCreate.dSubscriptionNumber = null;
    this.volumeCreate.dSubscriptionType = null;
    this.volumeCreate.oneSME_SubscriptionId = null;
    this.volumeCreate.regionId = this.region;
    this.volumeCreate.serviceName = blockStorage.name;
  }

  ipCreate: IpCreate = new IpCreate();
  ipInit(ip: Network, checkIpv6: boolean) {
    this.ipCreate.id = 0;
    this.ipCreate.duration = 0;
    this.ipCreate.ipAddress = null;
    this.ipCreate.vmToAttachId = null;
    this.ipCreate.networkId = ip.ip;
    this.ipCreate.useIPv6 = checkIpv6 ? checkIpv6 : null;
    this.ipCreate.vpcId = this.projectId.toString();
    this.ipCreate.oneSMEAddonId = null;
    this.ipCreate.serviceType = 4;
    this.ipCreate.serviceInstanceId = 0;
    this.ipCreate.customerId = this.tokenService.get()?.userId;

    // let currentDate = new Date();
    // let lastDate = new Date();
    // lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    // this.ipCreate.createDate = currentDate.toISOString().substring(0, 19);
    // this.ipCreate.expireDate = lastDate.toISOString().substring(0, 19);

    this.ipCreate.saleDept = null;
    this.ipCreate.saleDeptCode = null;
    this.ipCreate.contactPersonEmail = null;
    this.ipCreate.contactPersonPhone = null;
    this.ipCreate.contactPersonName = null;
    this.ipCreate.note = null;
    this.ipCreate.createDateInContract = null;
    this.ipCreate.am = null;
    this.ipCreate.amManager = null;
    this.ipCreate.isTrial = false;
    this.ipCreate.couponCode = null;
    this.ipCreate.dhsxkd_SubscriptionId = null;
    this.ipCreate.dSubscriptionNumber = null;
    this.ipCreate.dSubscriptionType = null;
    this.ipCreate.oneSME_SubscriptionId = null;
    this.ipCreate.actionType = 0;
    this.ipCreate.regionId = this.region;
    this.ipCreate.serviceName = checkIpv6 ? 'IPv6' : 'IPv4';
  }

  save(): void {
    if (!this.isSnapshot && this.hdh == null) {
      this.notification.error('', 'Vui lòng chọn hệ điều hành');
      return;
    }
    if (this.isSnapshot && this.selectedSnapshot == null) {
      this.notification.error('', 'Vui lòng chọn Snapshot ');
      return;
    }
    if (this.isPreConfigPackage == true && this.offerFlavor == null) {
      this.notification.error('', 'Vui lòng chọn gói cấu hình');
      return;
    }
    if (
      this.isCustomconfig == true &&
      (this.configCustom.vCPU == 0 ||
        this.configCustom.ram == 0 ||
        this.configCustom.capacity == 0)
    ) {
      this.notification.error('', 'Cấu hình tùy chọn chưa hợp lệ');
      return;
    }
    if (
      this.isGpuConfig == true &&
      (this.configGPU.CPU == 0 ||
        this.configGPU.ram == 0 ||
        this.configGPU.storage == 0 ||
        this.configGPU.GPU == 0 ||
        this.configGPU.GPUType == '')
    ) {
      this.notification.error('', 'Cấu hình GPU chưa hợp lệ');
      return;
    }
    // if (
    //   this.isCustomconfig == true &&
    //   (this.configCustom.vCPU / this.configCustom.ram <= 0.5 ||
    //     this.configCustom.vCPU / this.configCustom.ram >= 1)
    // ) {
    //   this.notification.error(
    //     'Cấu hình chưa hợp lệ',
    //     'Tỷ lệ CPU/RAM nằm trong khoảng 0.5 < CPU/RAM < 1'
    //   );
    //   return;
    // }

    this.instanceInit();
    let specificationInstance = JSON.stringify(this.instanceCreate);
    let orderItemInstance = new OrderItem();
    orderItemInstance.orderItemQuantity = 1;
    orderItemInstance.specification = specificationInstance;
    orderItemInstance.specificationType = 'instance_create';
    orderItemInstance.price = this.totalAmount / this.numberMonth;
    orderItemInstance.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemInstance);
    console.log('order instance', orderItemInstance);

    this.listOfDataBlockStorage.forEach((e: BlockStorage) => {
      if (e.type != '' && e.capacity != 0) {
        this.volumeInit(e);
        let specificationVolume = JSON.stringify(this.volumeCreate);
        let orderItemVolume = new OrderItem();
        orderItemVolume.orderItemQuantity = 1;
        orderItemVolume.specification = specificationVolume;
        orderItemVolume.specificationType = 'volume_create';
        orderItemVolume.price = e.price;
        orderItemVolume.serviceDuration = this.numberMonth;
        this.orderItem.push(orderItemVolume);
      }
    });

    this.listOfDataIPv4.forEach((e: Network) => {
      if (e.ip != '' && e.amount > 0) {
        for (let i = 0; i < e.amount; ++i) {
          this.ipInit(e, false);
          let specificationIP = JSON.stringify(this.ipCreate);
          let orderItemIP = new OrderItem();
          orderItemIP.orderItemQuantity = 1;
          orderItemIP.specification = specificationIP;
          orderItemIP.specificationType = 'ip_create';
          orderItemIP.price = e.price;
          orderItemIP.serviceDuration = this.numberMonth;
          this.orderItem.push(orderItemIP);
        }
      }
    });

    this.listOfDataIPv6.forEach((e: Network) => {
      if (e.ip != '' && e.amount > 0) {
        for (let i = 0; i < e.amount; ++i) {
          this.ipInit(e, true);
          this.ipCreate.useIPv6 = true;
          let specificationIP = JSON.stringify(this.ipCreate);
          let orderItemIP = new OrderItem();
          orderItemIP.orderItemQuantity = 1;
          orderItemIP.specification = specificationIP;
          orderItemIP.specificationType = 'ip_create';
          orderItemIP.price = e.price;
          orderItemIP.serviceDuration = this.numberMonth;
          this.orderItem.push(orderItemIP);
        }
      }
    });

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo vm';
    this.order.orderItems = this.orderItem;

    var returnPath: string = window.location.pathname;
    console.log('instance create', this.instanceCreate);
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.instanceInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceCreate);
    itemPayment.specificationType = 'instance_create';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.projectId;
    this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.cdr.detectChanges();
    });
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  dataBSSubject: Subject<any> = new Subject<any>();
  changeTotalAmountBlockStorage(id: number, value: any) {
    this.dataBSSubject.next({
      id: id,
      value: value,
    });
  }

  getTotalAmountBlockStorage() {
    let id: number, value: any;
    this.dataBSSubject
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        id = res.id;
        value = res.value;
        this.totalAmountVolume = 0;
        this.totalAmountVolumeVAT = 0;
        let index = this.listOfDataBlockStorage.findIndex(
          (obj) => obj.id == id
        );
        let changeBlockStorage = this.listOfDataBlockStorage[index];
        this.volumeInit(changeBlockStorage);
        let productId = changeBlockStorage.type == 'hdd' ? 2 : 61;
        this.catalogService
          .getCatalogOffer(productId, this.region, null, null)
          .subscribe((data) => {
            let offer = data.find(
              (offer) => offer.status.toUpperCase() == 'ACTIVE'
            );
            this.volumeCreate.offerId = offer.id;
            let itemPayment: ItemPayment = new ItemPayment();
            itemPayment.orderItemQuantity = 1;
            itemPayment.specificationString = JSON.stringify(this.volumeCreate);
            itemPayment.specificationType = 'volume_create';
            itemPayment.serviceDuration = this.numberMonth;
            itemPayment.sortItem = 0;
            let dataPayment: DataPayment = new DataPayment();
            dataPayment.orderItems = [itemPayment];
            dataPayment.projectId = this.projectId;
            this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
              console.log('thanh tien volume', result);
              changeBlockStorage.price =
                Number.parseFloat(result.data.totalAmount.amount) /
                this.numberMonth;
              changeBlockStorage.priceAndVAT =
                Number.parseFloat(result.data.totalPayment.amount) /
                this.numberMonth;
              this.listOfDataBlockStorage[index] = changeBlockStorage;
              this.listOfDataBlockStorage.forEach((e: BlockStorage) => {
                this.totalAmountVolume += e.price * this.numberMonth;
                this.totalAmountVolumeVAT += e.priceAndVAT * this.numberMonth;
              });
              this.cdr.detectChanges();
            });
          });
      });
  }

  totalAmountIPv4 = 0;
  totalAmountIPv4VAT = 0;
  dataSubjectIpv4: Subject<any> = new Subject<any>();
  changeTotalAmountIPv4(value: number) {
    this.dataSubjectIpv4.next(value);
  }
  getTotalAmountIPv4() {
    this.dataSubjectIpv4
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.totalAmountIPv4 = 0;
        this.totalAmountIPv4VAT = 0;
        this.listOfDataIPv4.forEach((e: Network) => {
          if (e.ip != '') {
            this.ipInit(e, false);
            this.catalogService
              .getCatalogOffer(3, this.region, null, null)
              .subscribe((data) => {
                let offer = data.find(
                  (offer) => offer.status.toUpperCase() == 'ACTIVE'
                );
                this.ipCreate.offerId = offer.id;
                let itemPayment: ItemPayment = new ItemPayment();
                itemPayment.orderItemQuantity = e.amount;
                itemPayment.specificationString = JSON.stringify(this.ipCreate);
                itemPayment.specificationType = 'ip_create';
                itemPayment.serviceDuration = this.numberMonth;
                itemPayment.sortItem = 0;
                let dataPayment: DataPayment = new DataPayment();
                dataPayment.orderItems = [itemPayment];
                dataPayment.projectId = this.projectId;
                this.dataService
                  .getTotalAmount(dataPayment)
                  .subscribe((result) => {
                    console.log('thanh tien ipv4', result);
                    e.price =
                      Number.parseFloat(result.data.totalAmount.amount) /
                      this.numberMonth;
                    this.totalAmountIPv4 += Number.parseFloat(
                      result.data.totalAmount.amount
                    );
                    e.priceAndVAT =
                      Number.parseFloat(result.data.totalPayment.amount) /
                      this.numberMonth;
                    this.totalAmountIPv4VAT += Number.parseFloat(
                      result.data.totalPayment.amount
                    );
                    this.cdr.detectChanges();
                  });
              });
          }
        });
      });
  }

  totalAmountIPv6 = 0;
  totalAmountIPv6VAT = 0;
  dataSubjectIpv6: Subject<any> = new Subject<any>();
  changeTotalAmountIPv6(value: number) {
    this.dataSubjectIpv6.next(value);
  }
  getTotalAmountIPv6() {
    this.dataSubjectIpv6
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.totalAmountIPv6 = 0;
        this.totalAmountIPv6VAT = 0;
        this.listOfDataIPv6.forEach((e: Network) => {
          if (e.ip != '') {
            this.ipInit(e, true);
            this.catalogService
              .getCatalogOffer(101, this.region, null, null)
              .subscribe((data) => {
                let offer = data.find(
                  (offer) => offer.status.toUpperCase() == 'ACTIVE'
                );
                this.ipCreate.offerId = offer.id;
                let itemPayment: ItemPayment = new ItemPayment();
                itemPayment.orderItemQuantity = e.amount;
                itemPayment.specificationString = JSON.stringify(this.ipCreate);
                itemPayment.specificationType = 'ip_create';
                itemPayment.serviceDuration = this.numberMonth;
                itemPayment.sortItem = 0;
                let dataPayment: DataPayment = new DataPayment();
                dataPayment.orderItems = [itemPayment];
                dataPayment.projectId = this.projectId;
                this.dataService
                  .getTotalAmount(dataPayment)
                  .subscribe((result) => {
                    console.log('thanh tien ipv6', result);
                    e.price =
                      Number.parseFloat(result.data.totalAmount.amount) /
                      this.numberMonth;
                    this.totalAmountIPv6 += Number.parseFloat(
                      result.data.totalAmount.amount
                    );
                    e.priceAndVAT =
                      Number.parseFloat(result.data.totalPayment.amount) /
                      this.numberMonth;
                    this.totalAmountIPv6VAT += Number.parseFloat(
                      result.data.totalPayment.amount
                    );
                    this.cdr.detectChanges();
                  });
              });
          }
        });
      });
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  navigateToSecurity(): void {
    this.router.navigate(['/app-smart-cloud/security-group/list']);
  }
}
