import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
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
import { Observable, concatMap, finalize, from, of } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { SnapshotVolumeService } from 'src/app/shared/services/snapshot-volume.service';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';

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
@Component({
  selector: 'one-portal-instances-create',
  templateUrl: './instances-create.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesCreateComponent implements OnInit {
  images = [
    'assets/logo.svg',
    'assets/logo.svg',
    'assets/logo.svg',
    'assets/logo.svg',
  ];

  public carouselTileItems$: Observable<number[]>;
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 5, all: 0 },
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
  region: number;
  projectId: number;
  userId: number;
  user: any;
  today: Date = new Date();
  ipPublicValue: number;
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  numberMonth: number = 1;
  hdh: any = null;
  flavor: any = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  selectedSSHKeyName: string;
  selectedSnapshot: number;

  getUser() {

  }
  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  isLoading = false;
  listSelectedImage = [];
  selectedImageTypeId: number;
  listOfImageByImageType = [];
  imageTypeId = [];

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      this.listImageTypes.forEach((e) => {
        this.imageTypeId.push(e.id);
      });
      console.log('list image types', this.listImageTypes);
    });
  }

  getAllImageByImageType(imageTypeId: any[]) {
    this.listOfImageByImageType = [];
    // Đảm bảo tuần tự ds Image theo như ds ImageType tương ứng
    from(imageTypeId)
      .pipe(
        concatMap((e) =>
          this.dataService.getAllImage(null, this.region, e, this.userId)
        )
      )
      .subscribe((result) => {
        this.listOfImageByImageType.push(result);
      });
    console.log('list of image by imagetype', this.listOfImageByImageType);
  }

  onInputHDH(event: any, index: number, imageTypeId: number) {
    this.hdh = event;
    this.selectedImageTypeId = imageTypeId;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      if (i != index) {
        this.listSelectedImage[i] = 0;
      }
    }
    console.log('Hệ điều hành', this.hdh);
    console.log('list seleted Image', this.listSelectedImage);
  }

  //#endregion

  //#region  Snapshot
  isSnapshot: boolean = true;
  listImages: Images[] = [];
  listSnapshot: SnapshotVolumeDto[] = [];
  size: number;
  status: string;

  initSnapshot(): void {
    if (this.isSnapshot) {
      this.snapshotVLService
        .getSnapshotVolumes(
          this.tokenService.get()?.userId,
          this.projectId,
          this.region,
          this.size,
          99999,
          1,
          this.status,
          '',
          ''
        )
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
      .getAllIPPublic(this.region, this.userId, 0, 9999, 1, false, '')
      .subscribe((data: any) => {
        this.listIPPublic = data.records;
        console.log('list IP public', this.listIPPublic);
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
        this.cdr.detectChanges();
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

  onSelectedSecurityGroup(event: any) {
    this.selectedSecurityGroup = event;
    console.log('list selected Security Group', this.selectedSecurityGroup);
  }

  //#region selectedPasswordOrSSHkey
  listSSHKey: SHHKeyModel[] = [];
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;

  initPassword(): void {
    this.activeBlockPassword = true;
    this.activeBlockSSHKey = false;
    this.selectedSSHKeyName = null;
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.password = null;
    this.getAllSSHKey();
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

  onSSHKeyChange(event?: any) {
    this.selectedSSHKeyName = event;
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
  activeIPv4: boolean = false;
  activeIPv6: boolean = false;
  idIPv4 = 0;
  idIPv6 = 0;
  listOfDataIPv4: Network[] = [];
  listOfDataIPv6: Network[] = [];
  defaultIPv4: Network = new Network();
  defaultIPv6: Network = new Network();
  listIPSubnetModel: IPSubnetModel[] = [];

  initIPv4(): void {
    this.activeIPv4 = true;
    this.listOfDataIPv4.push(this.defaultIPv4);

    this.dataService.getAllIPSubnet(this.region).subscribe((data: any) => {
      this.listIPSubnetModel = data;
      // var resultHttp = data;
      // this.listOfDataNetwork.push(...resultHttp);
    });
  }

  initIPv6(): void {
    this.activeIPv6 = true;
    this.listOfDataIPv6.push(this.defaultIPv6);

    this.dataService.getAllIPSubnet(this.region).subscribe((data: any) => {
      this.listIPSubnetModel = data;
      // var resultHttp = data;
      // this.listOfDataNetwork.push(...resultHttp);
    });
  }

  deleteRowIPv4(id: number): void {
    this.listOfDataIPv4 = this.listOfDataIPv4.filter((d) => d.id !== id);
  }

  deleteRowIPv6(id: number): void {
    this.listOfDataIPv6 = this.listOfDataIPv6.filter((d) => d.id !== id);
  }

  onInputIPv4(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataIPv4.filter((item) => item.ip !== '');
    const filteredArrayHas = this.listOfDataIPv4.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataIPv4[index].ip = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultIPv4 = new Network();
      this.idIPv4++;
      this.defaultIPv4.id = this.idIPv4;
      this.listOfDataIPv4.push(this.defaultIPv4);
    }
    this.cdr.detectChanges();
  }

  onInputIPv6(index: number, event: any) {
    // const inputElement = this.renderer.selectRootElement('#type_' + index);
    // const inputValue = inputElement.value;
    // Sử dụng filter() để lọc các object có trường 'type' khác rỗng
    const filteredArray = this.listOfDataIPv6.filter((item) => item.ip !== '');
    const filteredArrayHas = this.listOfDataIPv6.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length > 0) {
      this.listOfDataIPv6[index].ip = event;
    } else {
      // Add a new row with the same value as the current row
      //const currentItem = this.itemsTest[count];
      //this.itemsTest.splice(count + 1, 0, currentItem);
      this.defaultIPv6 = new Network();
      this.idIPv6++;
      this.defaultIPv6.id = this.idIPv6;
      this.listOfDataIPv6.push(this.defaultIPv6);
    }
    this.cdr.detectChanges();
  }
  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private snapshotVLService: SnapshotVolumeService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,
    private renderer: Renderer2,
    private loadingSrv: LoadingService
  ) {
    this.tempData = [
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
    this.listSecurityGroup = [];
    this.listIPPublic = [];
    this.selectedSecurityGroup = [];
    this.ipPublicValue = 0;
    this.initFlavors();
    this.initSnapshot();
    this.getAllIPPublic();
    this.getAllImageByImageType(this.imageTypeId);
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
    this.instanceCreate.description = null;
    this.instanceCreate.flavorId = this.flavor.id;
    this.instanceCreate.imageId = this.hdh;
    this.instanceCreate.iops = 0;
    this.instanceCreate.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.keypairName = this.selectedSSHKeyName;
    this.instanceCreate.securityGroups = this.selectedSecurityGroup;
    this.instanceCreate.network = null;
    this.instanceCreate.volumeSize = this.flavor.hdd;
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
    this.instanceCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceCreate.vpcId = this.projectId;
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
    this.instanceCreate.customerId = this.tokenService.get()?.userId;
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
    this.instanceCreate.regionId = this.region;
    this.instanceCreate.userEmail = this.tokenService.get()['email'];
    this.instanceCreate.actorEmail = this.tokenService.get()['email'];

    this.volumeCreate.volumeType = 'hdd';
    this.volumeCreate.volumeSize = 1;
    this.volumeCreate.description = null;
    this.volumeCreate.createFromSnapshotId = null;
    this.volumeCreate.instanceToAttachId = null;
    this.volumeCreate.isMultiAttach = false;
    this.volumeCreate.isEncryption = false;
    this.volumeCreate.vpcId = this.projectId.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;
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
    orderItemInstance.specificationType = 'instance_create';
    orderItemInstance.price = 1;
    orderItemInstance.serviceDuration = 1;
    this.orderItem.push(orderItemInstance);
    console.log("order instance", orderItemInstance);

    let specificationVolume = JSON.stringify(this.volumeCreate);
    let orderItemVolume = new OrderItem();
    orderItemVolume.orderItemQuantity = 1;
    orderItemVolume.specification = specificationVolume;
    orderItemVolume.specificationType = 'volume_create';
    orderItemVolume.price = 1;
    orderItemVolume.serviceDuration = 1;
    this.orderItem.push(orderItemVolume);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo vm';
    this.order.orderItems = this.orderItem;

    console.log('instance create', this.instanceCreate);

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
          this.message.success('Tạo order máy ảo thành công');
          this.router.navigateByUrl(`/app-smart-cloud/instances`);
        },
        (error) => {
          console.log(error.error);
          this.message.error('Tạo order máy ảo không thành công');
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
