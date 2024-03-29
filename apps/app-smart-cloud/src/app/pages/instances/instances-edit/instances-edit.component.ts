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
import {
  DataPayment,
  InstanceResize,
  InstancesModel,
  ItemPayment,
  Network,
  OfferItem,
  Order,
  OrderItem,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { debounceTime, Subject } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  iops?: string = '000';
  priceHour?: string = '000';
  priceMonth?: string = '000';
}

@Component({
  selector: 'one-portal-instances-edit',
  templateUrl: './instances-edit.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditComponent implements OnInit {
  //danh sách các biến của form model
  id: number;
  instancesModel: InstancesModel;
  instanceNameEdit: string = '';

  instanceResize: InstanceResize = new InstanceResize();
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  region: number;
  projectId: number;
  userId: number;
  userEmail: string;
  today: Date = new Date();
  ipPublicValue: string = '';
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  offerFlavor: OfferItem = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  isConfigPackage: boolean = true;
  cardHeight: string = '160px';

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

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private loadingSrv: LoadingService,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {}

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

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.userEmail = this.tokenService.get()?.email;
    this.id = Number.parseInt(this.activeRoute.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getListIpPublic();
    this.getCurrentInfoInstance(this.id);

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
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
  }

  isCustomconfig = false;
  onClickConfigPackage() {
    this.resetChangeConfig();
    this.isCustomconfig = false;
  }

  onClickCustomConfig() {
    this.resetChangeConfig();
    this.isCustomconfig = true;
  }

  resetChangeConfig(): void {
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
    this.instanceResize.cpu = null;
    this.instanceResize.ram = null;
    this.instanceResize.storage = null;
  }

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  listOfferFlavors: OfferItem[] = [];

  selectedElementFlavor: number = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
    this.dataService
      .getListOffers(this.region, 'VM-Flavor')
      .subscribe((data: any) => {
        this.listOfferFlavors = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
        if (this.instancesModel.volumeType == 0) {
          this.listOfferFlavors = this.listOfferFlavors.filter((e) =>
            e.offerName.includes('HDD')
          );
        } else {
          this.listOfferFlavors = this.listOfferFlavors.filter((e) =>
            e.offerName.includes('SSD')
          );
        }
        this.listOfferFlavors.forEach((e: OfferItem, index: number) => {
          e.description = '';
          e.characteristicValues.forEach((ch) => {
            if (
              ch.charOptionValues[0] == 'Id' &&
              Number.parseInt(ch.charOptionValues[1]) ===
                this.instancesModel.flavorId
            ) {
              this.listOfferFlavors[index] = null;
            }
            if (ch.charOptionValues[0] == 'CPU') {
              e.description += ch.charOptionValues[1] + ' vCPU / ';
              if (
                Number.parseInt(ch.charOptionValues[1]) <
                this.instancesModel.cpu
              ) {
                this.listOfferFlavors[index] = null;
              }
            }
            if (ch.charOptionValues[0] == 'RAM') {
              e.description += ch.charOptionValues[1] + ' GB RAM / ';
              if (
                Number.parseInt(ch.charOptionValues[1]) <
                this.instancesModel.ram
              ) {
                this.listOfferFlavors[index] = null;
              }
            }
            if (ch.charOptionValues[0] == 'HDD') {
              if (this.instancesModel.volumeType == 0) {
                e.description += ch.charOptionValues[1] + ' GB HDD';
              } else {
                e.description += ch.charOptionValues[1] + ' GB SSD';
              }
              if (
                Number.parseInt(ch.charOptionValues[1]) <
                this.instancesModel.storage
              ) {
                this.listOfferFlavors[index] = null;
              }
            }
          });
        });
        this.listOfferFlavors = this.listOfferFlavors.filter((e) => e != null);
        console.log('list offer flavor chỉnh sửa', this.listOfferFlavors);
        this.cdr.detectChanges();
      });
  }

  onInputFlavors(flavorId: any) {
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === flavorId
    );
    this.getTotalAmount();
  }

  selectElementInputFlavors(id: any) {
    this.selectedElementFlavor = id;
  }

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  getCurrentInfoInstance(instanceId: number): void {
    this.dataService.getById(instanceId, true).subscribe((data: any) => {
      this.instancesModel = data;
      this.instanceNameEdit = this.instancesModel.name;
      if (
        this.instancesModel.flavorId == 0 ||
        this.instancesModel.flavorId == null
      ) {
        this.isConfigPackage = false;
        this.isCustomconfig = true;
      }
      this.cdr.detectChanges();
      this.selectedElementFlavor = this.instancesModel.flavorId;
      this.region = this.instancesModel.regionId;
      this.projectId = this.instancesModel.projectId;
      this.initFlavors();
    });
  }

  listIPPublicStr = '';
  listIPLanStr = '';
  getListIpPublic() {
    this.dataService
      .getPortByInstance(this.id, this.region)
      .subscribe((dataNetwork: any) => {
        //list IP public
        let listOfPublicNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == true
        );
        let listIPPublic: string[] = [];
        listOfPublicNetwork.forEach((e) => {
          listIPPublic = listIPPublic.concat(e.fixedIPs);
        });
        this.listIPPublicStr = listIPPublic.join(', ');

        //list IP Lan
        let listOfPrivateNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        let listIPLan: string[] = [];
        listOfPrivateNetwork.forEach((e) => {
          listIPLan = listIPLan.concat(e.fixedIPs);
        });
        this.listIPLanStr = listIPLan.join(', ');
        this.cdr.detectChanges();
      });
  }

  onReloadInstanceDetail() {
    setTimeout(() => {
      this.dataService.getById(this.id, true).subscribe((data: any) => {
        this.instancesModel = data;
        this.cdr.detectChanges();
      });
    }, 5000);
  }

  volumeUnitPrice = 0;
  volumeIntoMoney = 0;
  ramUnitPrice = 0;
  ramIntoMoney = 0;
  cpuUnitPrice = 0;
  cpuIntoMoney = 0;
  getUnitPrice(volumeSize: number, ram: number, cpu: number) {
    let tempInstance: InstanceResize = new InstanceResize();
    tempInstance.currentFlavorId = this.instancesModel.flavorId;
    tempInstance.cpu = cpu + this.instancesModel.cpu;
    tempInstance.ram = ram + this.instancesModel.ram;
    tempInstance.storage = volumeSize + this.instancesModel.storage;
    tempInstance.newOfferId = 0;
    tempInstance.newFlavorId = 0;
    tempInstance.serviceInstanceId = this.instancesModel.id;
    tempInstance.vpcId = this.projectId;
    tempInstance.regionId = this.region;
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(tempInstance);
    itemPayment.specificationType = 'instance_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.projectId;
    this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien/đơn giá', result);
      if (volumeSize != 0) {
        this.volumeUnitPrice =
          Number.parseFloat(result.data.totalAmount.amount) /
          this.configCustom.capacity;
        this.volumeIntoMoney = Number.parseFloat(
          result.data.totalAmount.amount
        );
      }
      if (ram != 0) {
        this.ramUnitPrice =
          Number.parseFloat(result.data.totalAmount.amount) /
          this.configCustom.ram;
        this.ramIntoMoney = Number.parseFloat(result.data.totalAmount.amount);
      }
      if (cpu != 0) {
        this.cpuUnitPrice =
          Number.parseFloat(result.data.totalAmount.amount) /
          this.configCustom.vCPU;
        this.cpuIntoMoney = Number.parseFloat(result.data.totalAmount.amount);
      }
      this.cdr.detectChanges();
    });
  }

  onChangeConfigCustom() {
    if (
      this.configCustom.vCPU == 0 &&
      this.configCustom.ram == 0 &&
      this.configCustom.capacity == 0
    ) {
      this.totalAmount = 0;
      this.totalincludesVAT = 0;
    } else {
      this.getTotalAmount();
    }
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
        if (this.configCustom.vCPU == 0) {
          this.cpuUnitPrice = 0;
          this.cpuIntoMoney = 0;
          this.instanceResize.cpu = this.instancesModel.cpu;
        } else {
          this.getUnitPrice(0, 0, this.configCustom.vCPU);
        }
        this.onChangeConfigCustom();
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
        if (this.configCustom.ram == 0) {
          this.ramUnitPrice = 0;
          this.ramIntoMoney = 0;
          this.instanceResize.ram = this.instancesModel.ram;
        } else {
          this.getUnitPrice(0, this.configCustom.ram, 0);
        }
        this.onChangeConfigCustom();
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
        if (this.configCustom.capacity == 0) {
          this.volumeUnitPrice = 0;
          this.volumeIntoMoney = 0;
          this.instanceResize.storage = this.instancesModel.storage;
        } else {
          this.getUnitPrice(this.configCustom.capacity, 0, 0);
        }
        this.onChangeConfigCustom();
      });
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }
  navigateToEdit() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }
  returnPage(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  save(): void {
    this.modalSrv.create({
      nzTitle: 'Xác nhận thông tin thay đổi',
      nzContent: 'Quý khách chắn chắn muốn thực hiện điều chỉnh máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.readyEdit();
      },
    });
  }

  instanceResizeInit() {
    this.instanceResize.description = null;
    this.instanceResize.currentFlavorId = this.instancesModel.flavorId;
    if (this.isCustomconfig) {
      this.instanceResize.cpu =
        this.configCustom.vCPU + this.instancesModel.cpu;
      this.instanceResize.ram = this.configCustom.ram + this.instancesModel.ram;
      this.instanceResize.storage =
        this.configCustom.capacity + this.instancesModel.storage;
      this.instanceResize.newOfferId = 0;
      this.instanceResize.newFlavorId = 0;
    } else {
      this.instanceResize.newOfferId = this.offerFlavor.id;
      this.offerFlavor.characteristicValues.forEach((e) => {
        if (e.charOptionValues[0] == 'Id') {
          this.instanceResize.newFlavorId = Number.parseInt(
            e.charOptionValues[1]
          );
        }
        if (e.charOptionValues[0] == 'RAM') {
          this.instanceResize.ram = Number.parseInt(e.charOptionValues[1]);
        }
        if (e.charOptionValues[0] == 'CPU') {
          this.instanceResize.cpu = Number.parseInt(e.charOptionValues[1]);
        }
        if (e.charOptionValues[0] == 'HDD' || e.charOptionValues[0] == 'SSD') {
          this.instanceResize.storage = Number.parseInt(e.charOptionValues[1]);
        }
      });
    }
    this.instanceResize.addBtqt = 0;
    this.instanceResize.addBttn = 0;
    // this.instanceResize.typeName =
    //   'SharedKernel.IntegrationEvents.Orders.Specifications.InstanceResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    // this.instanceResize.serviceType = 1;
    // this.instanceResize.actionType = 4;
    this.instanceResize.serviceInstanceId = this.instancesModel.id;
    this.instanceResize.regionId = this.region;
    this.instanceResize.serviceName = 'Điều chỉnh';
    this.instanceResize.vpcId = this.projectId;
  }

  readyEdit(): void {
    this.instanceResizeInit();
    let specificationInstance = JSON.stringify(this.instanceResize);
    let orderItemInstanceResize = new OrderItem();
    orderItemInstanceResize.orderItemQuantity = 1;
    orderItemInstanceResize.specification = specificationInstance;
    orderItemInstanceResize.specificationType = 'instance_resize';
    orderItemInstanceResize.price = this.totalAmount;
    this.orderItem.push(orderItemInstanceResize);

    this.order.customerId = this.userId;
    this.order.createdByUserId = this.userId;
    this.order.note = 'instance resize';
    this.order.orderItems = this.orderItem;
    console.log('order instance resize', this.order);

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.instanceResizeInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceResize);
    itemPayment.specificationType = 'instance_resize';
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

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }
}
