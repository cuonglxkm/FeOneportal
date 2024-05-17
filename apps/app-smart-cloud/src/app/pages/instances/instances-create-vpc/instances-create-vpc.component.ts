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
  ImageTypesModel,
  SHHKeyModel,
  SecurityGroupModel,
  Order,
  OrderItem,
  OfferItem,
  Image,
} from '../instances.model';
import { Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { Observable, Subject, debounceTime, finalize, of } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadingService } from '@delon/abc/loading';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { SnapshotVolumeService } from 'src/app/shared/services/snapshot-volume.service';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
} from 'src/app/shared/models/vlan.model';
import { VlanService } from 'src/app/shared/services/vlan.service';
import { TotalVpcResource } from 'src/app/shared/models/vpc.model';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

interface InstancesForm {
  name: FormControl<string>;
}
@Component({
  selector: 'one-portal-instances-create-vpc',
  templateUrl: './instances-create-vpc.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesCreateVpcComponent implements OnInit {
  images = [
    'assets/logo.svg',
    'assets/logo.svg',
    'assets/logo.svg',
    'assets/logo.svg',
  ];

  public carouselTileItems$: Observable<number[]>;
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

  tempData: any[];

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

  //danh sách các biến của form model
  instanceCreate: InstanceCreate = new InstanceCreate();
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  region: number;
  projectId: number;
  userId: number;
  user: any;
  ipPublicValue: number = 0;
  isUseLAN: boolean = true;
  passwordVisible = false;
  password?: string;
  hdh: any = null;
  selectedSSHKeyName: string;
  selectedSnapshot: number;
  cardHeight: string = '140px';
  remainingRAM: number = 0;
  remainingVolume: number = 0;
  remainingVCPU: number = 0;
  remainingGpu: number = 0;

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

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private snapshotVLService: SnapshotVolumeService,
    private vlanService: VlanService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private loadingSrv: LoadingService,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {}

  @ViewChild('myCarouselImage') myCarouselImage: NguCarousel<any>;
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
        this.myCarouselImage.reset();
      }, 100);
    }
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getAllImageType();
    this.initSnapshot();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
    this.getListNetwork();
    this.getInfoVPC();
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

  infoVPC: TotalVpcResource = new TotalVpcResource();
  getInfoVPC() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.dataService
      .getInfoVPC(this.projectId)
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
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.get.vpc.info.fail')
          );
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

  nameImage: string = '';
  disableKeypair: boolean = false;
  onInputHDH(
    event: any,
    index: number,
    imageTypeId: number,
    uniqueKey: string
  ) {
    if (uniqueKey.toUpperCase() == 'WINDOWS') {
      if (!this.activeBlockPassword) {
        this.initPassword();
      }
      this.listSSHKey = [];
      this.disableKeypair = true;
    } else {
      this.disableKeypair = false;
      this.getAllSSHKey();
    }
    this.hdh = event;
    this.selectedImageTypeId = imageTypeId;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      if (i != index) {
        this.listSelectedImage[i] = 0;
      }
    }
    const filteredImages = this.listOfImageByImageType
      .get(imageTypeId)
      .filter((e) => e.id == event);
    this.nameImage = filteredImages.length > 0 ? filteredImages[0].name : '';
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

  onChangeSnapshot(event?: any) {
    this.selectedSnapshot = event;
  }

  //#endregion

  //#region HDD hay SDD
  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;
  initHDD(): void {
    this.activeBlockHDD = true;
    this.activeBlockSSD = false;
    this.remainingVolume =
      this.infoVPC.cloudProject.quotaHddInGb -
      this.infoVPC.cloudProjectResourceUsed.hdd;
    this.instanceCreate.volumeSize = 0;
    this.cdr.detectChanges();
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.remainingVolume =
      this.infoVPC.cloudProject.quotaSSDInGb -
      this.infoVPC.cloudProjectResourceUsed.ssd;
    this.instanceCreate.volumeSize = 0;
    this.cdr.detectChanges();
  }
  //#endregion

  //#region  cấu hình
  isCustomconfig = true;
  isGpuConfig = false;
  listGPUType: OfferItem[] = [];

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
    this.disableHDD = true;
  }

  resetData() {
    this.instanceCreate.cpu = 0;
    this.instanceCreate.volumeSize = 0;
    this.instanceCreate.ram = 0;
    this.instanceCreate.gpuCount = 0;
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
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
        true
      )
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
    formSearchNetwork.project = this.projectId;
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

  selectedElementFlavor: string = null;
  selectElementInputFlavors(id: string) {
    this.selectedElementFlavor = id;
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

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: any) {
    this.router.navigate(['/app-smart-cloud/instances']);
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

  instanceInit() {
    this.instanceCreate.description = null;
    this.instanceCreate.imageId = this.hdh;
    this.instanceCreate.iops = 0;
    this.instanceCreate.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.keypairName = this.selectedSSHKeyName;
    this.instanceCreate.securityGroups = this.selectedSecurityGroup;
    this.instanceCreate.network = null;
    this.instanceCreate.isUsePrivateNetwork =
      this.vlanNetwork == '' ? false : true;
    if (this.vlanNetwork != '') {
      this.instanceCreate.privateNetId = this.vlanNetwork;
    }
    if (this.port != '') {
      this.instanceCreate.privatePortId = this.port;
    }
    this.instanceCreate.ipPublic = this.ipPublicValue;
    this.instanceCreate.password = this.password;
    this.instanceCreate.snapshotCloudId = this.selectedSnapshot;
    this.instanceCreate.encryption = false;
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;
    this.instanceCreate.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.projectId = this.projectId;
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
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
  }

  isVisibleCreate: boolean = false;
  showModalCreate() {
    if (!this.isSnapshot && this.hdh == null) {
      this.notification.error(
        '',
        this.i18n.fanyi('app.notify.choose.os.required')
      );
      return;
    }
    this.isVisibleCreate = true;
  }

  handleOkCreate(): void {
    this.dataService
      .checkflavorforimage(
        this.hdh,
        this.instanceCreate.volumeSize,
        this.instanceCreate.ram,
        this.instanceCreate.cpu
      )
      .subscribe({
        next: (data) => {
          this.isVisibleCreate = false;
          this.instanceInit();

          let specificationInstance = JSON.stringify(this.instanceCreate);
          let orderItemInstance = new OrderItem();
          orderItemInstance.orderItemQuantity = 1;
          orderItemInstance.specification = specificationInstance;
          orderItemInstance.specificationType = 'instance_create';
          this.orderItem.push(orderItemInstance);
          console.log('order instance', orderItemInstance);

          this.order.customerId = this.tokenService.get()?.userId;
          this.order.createdByUserId = this.tokenService.get()?.userId;
          this.order.note = 'tạo vm';
          this.order.orderItems = this.orderItem;

          // var returnPath: string = window.location.pathname;
          // console.log('instance create', this.instanceCreate);
          // this.router.navigate(['/app-smart-cloud/order/cart'], {
          //   state: { data: this.order, path: returnPath },
          // });

          this.dataService.create(this.order).subscribe({
            next: (data: any) => {
              this.notification.success(
                '',
                this.i18n.fanyi('app.notify.success.instances.order.create')
              );
              this.router.navigate(['/app-smart-cloud/instances']);
            },
            error: (e) => {
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.notify.fail.instances.order.create')
              );
            },
          });
        },
        error: (e) => {
          let numbers: number[] = [];
          const regex = /\d+/g;
          const matches = e.error.match(regex);
          if (matches) {
            numbers = matches.map((match) => parseInt(match));
            this.notification.error(
              '',
              this.i18n.fanyi('app.notify.check.config.for.os', {
                nameHdh: this.nameImage,
                volume: numbers[0],
                ram: numbers[1],
                cpu: numbers[2],
              })
            );
          }
        },
      });
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }
}
