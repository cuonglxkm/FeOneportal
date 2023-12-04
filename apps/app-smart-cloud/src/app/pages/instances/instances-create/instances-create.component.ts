import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  InstanceCreate,
  Flavors,
  IPPublicModel,
  IPSubnetModel,
  ImageTypesModel,
  Images,
  InstancesModel,
  SHHKeyModel,
  SecurityGroupModel,
  Snapshot,
  VolumeCreate,
  Order,
  OrderItem,
} from '../instances.model';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { da, tr } from 'date-fns/locale';
import {Observable, finalize, interval, startWith, take, map, of} from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import {NguCarouselConfig} from "@ngu/carousel";
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';

interface InstancesForm {
  name: FormControl<string>;
}
class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  iops?: string = '000';
  priceHour?: string = '000';
  priceMonth?: string = '000';
}
class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  code?: boolean = false;
  multiattach?: boolean = false;
  price?: string = '000';
}
class Network {
  id: number = 0;
  ip?: string = '';
  amount?: number = 0;
  ipv6?: boolean = false;
  price?: string = '000';
}
interface CarouselData {
  id?: string;
  text: string;
  dataMerge?: number;
  width: number;
  dotContent?: string;
  src?: string;
  dataHash?: string;
}

@Component({
  selector: 'one-portal-instances-create',
  templateUrl: './instances-create.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesCreateComponent implements OnInit {


  images = ['assets/logo.svg', 'assets/logo.svg', 'assets/logo.svg', 'assets/logo.svg'];

  public carouselTileItems$: Observable<number[]>;
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 5, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy'
  };
  tempData: any[];





  reverse = true;
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });

  //danh sách các biến của form model
  instanceCreate: InstanceCreate = new InstanceCreate();
  volumeCreate: VolumeCreate = new VolumeCreate();
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  region: number = 3;
  projectId: number = 4079;
  customerId: number = 669;
  userId: number = 669;
  today: Date = new Date();
  ipPublicValue: string = '';
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  numberMonth: number = 1;
  hdh: any = null;
  flavor: any = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  selectedSSHKeyId: string = '';
  selectedSnapshot: number;

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;
  selectedTypeImageId: number;
  pagedCardListImages: Array<Array<any>> = [];

  carouselData: CarouselData[] = [
    { text: 'Slide 1 PM', dataMerge: 1, width: 350, dotContent: 'text1' },
    { text: 'Slide 2 PM', dataMerge: 2, width: 350, dotContent: 'text2' },
    { text: 'Slide 3 PM', dataMerge: 3, width: 350, dotContent: 'text3' },
    { text: 'Slide 4 PM', width: 350, dotContent: 'text4' },
    { text: 'Slide 5 PM', dataMerge: 4, width: 350, dotContent: 'text5' },
    { text: 'Slide 6 PM', dataMerge: 5, width: 350, dotContent: 'text5' },
    { text: 'Slide 7 PM', dataMerge: 6, width: 350, dotContent: 'text5' },
  ];
  activeSlides: WritableSignal<SlidesOutputData> = signal({});

  getPassedData(data: any) {
    this.activeSlides.set(data);
    // console.log(this.activeSlides());
  }

  customOptions: OwlOptions = {
    autoWidth: true,
    loop: true,
    items: 4,
    margin: 50,
    // slideBy: 'page',
    // mergeFit: true,
    // merge: true,
    // autoplay: true,
    // autoplayTimeout: 5000,
    // autoplayHoverPause: true,
    // autoplaySpeed: 4000,
    dotsSpeed: 500,
    // rewind: false,
    // dots: false,
    // dotsData: true,
    // mouseDrag: true,
    // touchDrag: false,
    pullDrag: true,
    smartSpeed: 400,
    // fluidSpeed: 499,
    dragEndSpeed: 350,
    dotsEach: 5,
    // center: true,
    // rewind: true,
    // rtl: true,
    // startPosition: 1,
    // navText: [ '<i class=fa-chevron-left>left</i>', '<i class=fa-chevron-right>right</i>' ],
    slideBy: 'page',
    responsive: {
      0: {
        items: 4,
        dotsEach: 5,
      },
      300: {
        items: 4,
        dotsEach: 5,
      }
    },
    // stagePadding: 40,
    nav: false,
  };
  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      for (let i = 0; i < this.listImageTypes.length; i += 4) {
        this.pagedCardListImages.push(this.listImageTypes.slice(i, i + 4));
      }
    });
  }

  getAllImageVersionByType(type: number) {
    this.dataService
      .getAllImage(null, this.region, type, this.customerId)
      .subscribe((data: any) => {
        this.listImageVersionByType = data;
      });
  }

  onInputHDH(index: number, event: any) {
    this.hdh = this.listImageVersionByType.find((x) => (x.id = event));
    this.selectedTypeImageId = this.hdh.imageTypeId;
  }

  //#endregion

  //#region  Snapshot
  isSnapshot: boolean = true;
  listImages: Images[] = [];
  listSnapshot: Snapshot[] = [];

  initSnapshot(): void {
    if (this.isSnapshot) {
      this.dataService
        .getAllSnapshot('', '', this.region, this.customerId)
        .subscribe((data: any) => {
          this.listSnapshot = data;
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
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];
  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(this.region, this.customerId, 0, 9999, 1, false, '')
      .subscribe((data: any) => {
        this.listIPPublic = data.records;
      });
  }

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
      });
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  activeBlockFlavors: boolean = true;
  activeBlockFlavorCloud: boolean = false;
  listFlavors: Flavors[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

  selectedElementFlavor: string = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
    this.activeBlockFlavors = true;
    this.activeBlockFlavorCloud = false;
    this.dataService
      .getAllFlavors(false, this.region, false, false, true)
      .subscribe((data: any) => {
        this.listFlavors = data;
        // Divide the cardList into pages with 4 cards per page
        for (let i = 0; i < this.listFlavors.length; i += 4) {
          this.pagedCardList.push(this.listFlavors.slice(i, i + 4));
        }
      });
  }

  initFlavorCloud(): void {
    this.activeBlockFlavors = false;
    this.activeBlockFlavorCloud = true;
  }

  onInputFlavors(event: any) {
    this.flavor = this.listFlavors.find((flavor) => flavor.id === event);
    console.log(this.flavor);
  }
  toggleClass(id: string) {
    this.selectedElementFlavor = id;
    if (this.selectedElementFlavor) {
      this.isInitialClass = !this.isInitialClass;
      this.isNewClass = !this.isNewClass;
    } else {
      this.isInitialClass = true;
      this.isNewClass = false;
    }

    this.cdr.detectChanges();
  }

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
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.getAllSSHKey();
  }

  getAllSSHKey() {
    this.listSSHKey = [];
    this.dataService
      .getAllSSHKey(this.projectId, this.region, this.customerId, 999999, 0)
      .subscribe((data: any) => {
        data.records.forEach((e) => {
          const itemMapper = new SHHKeyModel();
          itemMapper.id = e.id;
          itemMapper.displayName = e.name;
          this.listSSHKey.push(itemMapper);
        });
      });
  }

  onSSHKeyChange(event?: any) {
    this.selectedSSHKeyId = event;
    console.log('sshkey', event);
  }

  //#endregion

  //#region BlockStorage
  activeBlockStorage: boolean = false;
  idBlockStorage = 0;
  listOfDataBlockStorage: BlockStorage[] = [];
  defaultBlockStorage: BlockStorage = new BlockStorage();
  typeBlockStorage: Array<{ value: string; label: string }> = [
    { value: 'HDD', label: 'HDD' },
    { value: 'SSD', label: 'SSD' },
  ];

  initBlockStorage(): void {
    this.activeBlockStorage = true;
    this.listOfDataBlockStorage.push(this.defaultBlockStorage);
  }
  deleteRowBlockStorage(id: number): void {
    this.listOfDataBlockStorage = this.listOfDataBlockStorage.filter(
      (d) => d.id !== id
    );
  }

  onInputBlockStorage(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataBlockStorage.filter(
      (item) => item.type !== ''
    );
    const filteredArrayHas = this.listOfDataBlockStorage.filter(
      (item) => item.type == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataBlockStorage[index].type = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultBlockStorage = new BlockStorage();
      this.idBlockStorage++;
      this.defaultBlockStorage.id = this.idBlockStorage;
      this.listOfDataBlockStorage.push(this.defaultBlockStorage);
    }
    this.cdr.detectChanges();
  }
  //#endregion
  //#region Network
  activeNetwork: boolean = false;
  idNetwork = 0;
  listOfDataNetwork: Network[] = [];
  defaultNetwork: Network = new Network();
  listIPSubnetModel: IPSubnetModel[] = [];

  initNetwork(): void {
    this.activeNetwork = true;
    this.listOfDataNetwork.push(this.defaultNetwork);

    this.dataService.getAllIPSubnet(this.region).subscribe((data: any) => {
      this.listIPSubnetModel = data;
      // var resultHttp = data;
      // this.listOfDataNetwork.push(...resultHttp);
    });
  }
  deleteRowNetwork(id: number): void {
    this.listOfDataNetwork = this.listOfDataNetwork.filter((d) => d.id !== id);
  }

  onInputNetwork(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataNetwork.filter(
      (item) => item.ip !== ''
    );
    const filteredArrayHas = this.listOfDataNetwork.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataNetwork[index].ip = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultNetwork = new Network();
      this.idNetwork++;
      this.defaultNetwork.id = this.idNetwork;
      this.listOfDataNetwork.push(this.defaultNetwork);
    }
    this.cdr.detectChanges();
  }
  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,
    private renderer: Renderer2,
    private loadingSrv: LoadingService
  ) {

    this.tempData = [ this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],
      this.images[Math.floor(Math.random() * this.images.length)],

    ];

    this.carouselTileItems$ = of(this.tempData);

    // this.carouselTileItems$ = interval(500).pipe(
    //   startWith(-1),
    //   take(30),
    //   map(() => {
    //     const data = (this.tempData = [
    //       ...this.tempData,
    //       this.images[Math.floor(Math.random() * this.images.length)]
    //     ]);
    //
    //     return data;
    //   })
    // );

  }
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
    this.listSecurityGroup = [];
    this.listIPPublic = [];
    this.selectedSecurityGroup = [];
    this.ipPublicValue = '';
    this.initSnapshot();
    this.getAllSSHKey();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
    this.cdr.detectChanges();
  }

  onProjectChange(project: any) {
    // Handle the region change event
    this.projectId = project.id;
    this.listSecurityGroup = [];
    this.selectedSecurityGroup = [];
    this.getAllSecurityGroup();
    this.getAllSSHKey();
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.getAllImageType();
    this.initFlavors();
    this.getAllIPPublic();
    this.getAllSecurityGroup();
  }

  createInstancesForm(): FormGroup<InstancesForm> {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  // get items(): FormArray<FormGroup<InstancesForm>> {
  //   return this.form.controls.items;
  // }

  save(): void {
    let arraylistSecurityGroup = null;
    // if (this.selectedSecurityGroup.length > 0) {
    //   arraylistSecurityGroup = this.selectedSecurityGroup.map((obj) =>
    //     obj.id.toString()
    //   );
    // }
    if (!this.isSnapshot && this.hdh == null) {
      this.message.error('Vui lòng chọn hệ điều hành');
      return;
    }
    if (this.flavor == null) {
      this.message.error('Vui lòng chọn gói cấu hình');
      return;
    }
    this.instanceCreate.description = null; // this.region;
    this.instanceCreate.flavorId = 368; //this.flavor.id;
    this.instanceCreate.imageId = 113;
    this.instanceCreate.iops = 300;
    this.instanceCreate.vmType = null;
    this.instanceCreate.keypairName = null;
    this.instanceCreate.securityGroups = null;
    this.instanceCreate.network = null;
    this.instanceCreate.volumeSize = 1;
    this.instanceCreate.isUsePrivateNetwork = true;
    this.instanceCreate.ipPublic = null;
    this.instanceCreate.password = null;
    this.instanceCreate.snapshotCloudId = null;
    this.instanceCreate.encryption = false;
    this.instanceCreate.isUseIPv6 = false;
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;
    this.instanceCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceCreate.vpcId = "4079";
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
    this.instanceCreate.customerId = 669;
    this.instanceCreate.createDate = '2023-11-01T00:00:00';
    this.instanceCreate.expireDate = '2023-12-01T00:00:00';
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
    this.instanceCreate.offerId = -2446;
    this.instanceCreate.couponCode = null;
    this.instanceCreate.dhsxkd_SubscriptionId = null;
    this.instanceCreate.dSubscriptionNumber = null;
    this.instanceCreate.dSubscriptionType = null;
    this.instanceCreate.oneSME_SubscriptionId = null;
    this.instanceCreate.actionType = 0;
    this.instanceCreate.regionId = 3;
    this.instanceCreate.userEmail = 'toannv8@yandex.com';
    this.instanceCreate.actorEmail = 'toannv8@yandex.com';

    this.volumeCreate.volumeType = 'hdd';
    this.volumeCreate.volumeSize = 1;
    this.volumeCreate.description = null;
    this.volumeCreate.createFromSnapshotId = null;
    this.volumeCreate.instanceToAttachId = null;
    this.volumeCreate.isMultiAttach = false;
    this.volumeCreate.isEncryption = false;
    this.volumeCreate.vpcId = 4079;
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = 669;
    this.volumeCreate.createDate = '0001-01-01T00:00:00';
    this.volumeCreate.expireDate = '0001-01-01T00:00:00';
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
    this.volumeCreate.offerId = 2;
    this.volumeCreate.couponCode = null;
    this.volumeCreate.dhsxkd_SubscriptionId = null;
    this.volumeCreate.dSubscriptionNumber = null;
    this.volumeCreate.dSubscriptionType = null;
    this.volumeCreate.oneSME_SubscriptionId = null;
    this.volumeCreate.actionType = 1;
    this.volumeCreate.regionId = 3;
    this.volumeCreate.serviceName = 'volume-khaitesttaovmOrder';
    this.volumeCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = 'Khaitest';
    this.volumeCreate.actorEmail = 'Khaitest';

    let specificationInstance = JSON.stringify(this.instanceCreate);
    let orderItemInstance = new OrderItem();
    orderItemInstance.orderItemQuantity = 1;
    orderItemInstance.specification = specificationInstance;
    orderItemInstance.specificationType = "instance_create";
    orderItemInstance.price = 1;
    orderItemInstance.serviceDuration = 1;
    this.orderItem.push(orderItemInstance);

    let specificationVolume = JSON.stringify(this.volumeCreate);
    let orderItemVolume = new OrderItem();
    orderItemVolume.orderItemQuantity = 1;
    orderItemVolume.specification = specificationVolume;
    orderItemVolume.specificationType = "volume_create";
    orderItemVolume.price = 1;
    orderItemVolume.serviceDuration = 1;
    this.orderItem.push(orderItemVolume);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = "tạo vm";
    this.order.orderItems = this.orderItem;

    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.dataService
      .create(this.order)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.message.success('Tạo mới máy ảo thành công');
          this.router.navigateByUrl(`/app-smart-cloud/instances`);
        },
        (error) => {
          console.log(error.error);
          this.message.error('Tạo mới máy ảo không thành công');
        }
      );
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  _submitForm(): void {
    // this.formValidity(this.form.controls);
    // if (this.form.invalid) {
    //   return;
    // }
    this.save();
  }

  private formValidity(controls: NzSafeAny): void {
    Object.keys(controls).forEach((key) => {
      const control = (controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
  }
}
