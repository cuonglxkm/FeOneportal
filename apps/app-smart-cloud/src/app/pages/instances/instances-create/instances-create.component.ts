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
  IpCreate,
  OfferItem,
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
  capacity?: number = 0;
  encrypt?: boolean = false;
  multiattach?: boolean = false;
  price?: number = 1;
}
class Network {
  id: number = 0;
  ip?: string = '';
  amount?: number = 0;
  price?: number = 1;
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

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.max(50), Validators.pattern(/^[a-zA-Z0-9]+$/)],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
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
  ipPublicValue: number;
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  numberMonth: number = 1;
  hdh: any = null;
  offerFlavor: any = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh
  selectedSSHKeyName: string;
  selectedSnapshot: number;

  getUser() {}
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
    this.initFlavors();
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.initFlavors();
  }

  isCustomconfig = false;
  onClickConfigPackage() {
    this.isCustomconfig = false;
  }

  onClickCustomConfig() {
    this.isCustomconfig = true;
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
  listOfferFlavors: OfferItem[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

  selectedElementFlavor: string = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
    this.activeBlockFlavors = true;
    this.activeBlockFlavorCloud = false;
    this.dataService
      .getListOffers(136, this.region, 'VM-Flavor')
      .subscribe((data: any) => {
        this.listOfferFlavors = data;
        if (this.activeBlockHDD) {
          this.listOfferFlavors = this.listOfferFlavors.filter((e) =>
            e.offerName.includes('HDD')
          );
        } else {
          this.listOfferFlavors = this.listOfferFlavors.filter((e) =>
            e.offerName.includes('SSD')
          );
        }
        this.listOfferFlavors.forEach((e: OfferItem) => {
          e.description = '';
          e.characteristicValues.forEach((ch) => {
            if (ch.charOptionValues[0] == 'CPU') {
              e.description += ch.charOptionValues[1] + ' VCPU / ';
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
        this.cdr.detectChanges();
      });
  }

  initFlavorCloud(): void {
    this.activeBlockFlavors = false;
    this.activeBlockFlavorCloud = true;
  }

  onInputFlavors(event: any) {
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    console.log(this.offerFlavor);
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

  onInputIPv4() {
    this.defaultIPv4 = new Network();
    this.idIPv4++;
    this.defaultIPv4.id = this.idIPv4;
    this.listOfDataIPv4.push(this.defaultIPv4);
    this.cdr.detectChanges();
  }

  onInputIPv6() {
    this.defaultIPv6 = new Network();
    this.idIPv6++;
    this.defaultIPv6.id = this.idIPv6;
    this.listOfDataIPv6.push(this.defaultIPv6);
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
    if (this.offerFlavor == null) {
      this.message.error('Vui lòng chọn gói cấu hình');
      return;
    }
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
      this.instanceCreate.flavorId = 0;
      this.instanceCreate.ram = this.configCustom.ram;
      this.instanceCreate.cpu = this.configCustom.vCPU;
      this.instanceCreate.volumeSize = this.configCustom.capacity;
    } else {
      this.offerFlavor.characteristicValues.forEach((e) => {
        if ((e.charOptionValues[0] == 'Id')) {
          this.instanceCreate.flavorId = Number.parseInt(e.charOptionValues[1]);
        }
        if ((e.charOptionValues[0] == 'RAM')) {
          this.instanceCreate.ram = Number.parseInt(e.charOptionValues[1]);
        }
        if ((e.charOptionValues[0] == 'CPU')) {
          this.instanceCreate.cpu = Number.parseInt(e.charOptionValues[1]);
        }
        if ((e.charOptionValues[0] == 'HDD')) {
          this.instanceCreate.volumeSize = Number.parseInt(
            e.charOptionValues[1]
          );
        }
      });
    }
    this.instanceCreate.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
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
    this.instanceCreate.offerId = this.offerFlavor.id;
    this.instanceCreate.couponCode = null;
    this.instanceCreate.dhsxkd_SubscriptionId = null;
    this.instanceCreate.dSubscriptionNumber = null;
    this.instanceCreate.dSubscriptionType = null;
    this.instanceCreate.oneSME_SubscriptionId = null;
    this.instanceCreate.actionType = 0;
    this.instanceCreate.regionId = this.region;
    this.instanceCreate.userEmail = this.tokenService.get()['email'];
    this.instanceCreate.actorEmail = this.tokenService.get()['email'];

    let specificationInstance = JSON.stringify(this.instanceCreate);
    let orderItemInstance = new OrderItem();
    orderItemInstance.orderItemQuantity = 1;
    orderItemInstance.specification = specificationInstance;
    orderItemInstance.specificationType = 'instance_create';
    orderItemInstance.price = 1;
    orderItemInstance.serviceDuration = 1;
    this.orderItem.push(orderItemInstance);
    console.log('order instance', orderItemInstance);

    this.listOfDataBlockStorage.forEach((e: BlockStorage) => {
      if (e.type != '' && e.name != '' && e.capacity) {
        let volumeCreate = new VolumeCreate();
        volumeCreate.volumeType = e.type;
        volumeCreate.volumeSize = e.capacity;
        volumeCreate.description = null;
        volumeCreate.createFromSnapshotId = null;
        volumeCreate.instanceToAttachId = null;
        volumeCreate.isMultiAttach = e.multiattach;
        volumeCreate.isEncryption = e.encrypt;
        volumeCreate.vpcId = this.projectId.toString();
        volumeCreate.oneSMEAddonId = null;
        volumeCreate.serviceType = 2;
        volumeCreate.serviceInstanceId = 0;
        volumeCreate.customerId = this.tokenService.get()?.userId;
        volumeCreate.createDate = '0001-01-01T00:00:00';
        volumeCreate.expireDate = '0001-01-01T00:00:00';
        volumeCreate.saleDept = null;
        volumeCreate.saleDeptCode = null;
        volumeCreate.contactPersonEmail = null;
        volumeCreate.contactPersonPhone = null;
        volumeCreate.contactPersonName = null;
        volumeCreate.note = null;
        volumeCreate.createDateInContract = null;
        volumeCreate.am = null;
        volumeCreate.amManager = null;
        volumeCreate.isTrial = false;
        volumeCreate.offerId = 2;
        volumeCreate.couponCode = null;
        volumeCreate.dhsxkd_SubscriptionId = null;
        volumeCreate.dSubscriptionNumber = null;
        volumeCreate.dSubscriptionType = null;
        volumeCreate.oneSME_SubscriptionId = null;
        volumeCreate.actionType = 1;
        volumeCreate.regionId = this.region;
        volumeCreate.serviceName = e.name;
        volumeCreate.typeName =
          'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
        volumeCreate.userEmail = this.tokenService.get()?.email;
        volumeCreate.actorEmail = this.tokenService.get()?.email;

        let specificationVolume = JSON.stringify(volumeCreate);
        let orderItemVolume = new OrderItem();
        orderItemVolume.orderItemQuantity = 1;
        orderItemVolume.specification = specificationVolume;
        orderItemVolume.specificationType = 'volume_create';
        orderItemVolume.price = e.price;
        orderItemVolume.serviceDuration = 1;
        this.orderItem.push(orderItemVolume);
      }
    });

    this.listOfDataIPv4.forEach((e: Network) => {
      let ipCreate = new IpCreate();
      if (e.ip != '' && e.amount != 0) {
        ipCreate.id = 0;
        ipCreate.duration = 0;
        ipCreate.ipAddress = null;
        ipCreate.vmToAttachId = null;
        ipCreate.offerId = 0;
        ipCreate.networkId = e.ip;
        ipCreate.useIPv6 = null;
        ipCreate.vpcId = this.projectId;
        ipCreate.oneSMEAddonId = null;
        ipCreate.serviceType = 0;
        ipCreate.serviceInstanceId = 0;
        ipCreate.customerId = this.tokenService.get()?.userId;
        ipCreate.createDate = '0001-01-01T00:00:00';
        ipCreate.expireDate = '0001-01-01T00:00:00';
        ipCreate.saleDept = null;
        ipCreate.saleDeptCode = null;
        ipCreate.contactPersonEmail = null;
        ipCreate.contactPersonPhone = null;
        ipCreate.contactPersonName = null;
        ipCreate.note = null;
        ipCreate.createDateInContract = null;
        ipCreate.am = null;
        ipCreate.amManager = null;
        ipCreate.isTrial = false;
        ipCreate.couponCode = null;
        ipCreate.dhsxkd_SubscriptionId = null;
        ipCreate.dSubscriptionNumber = null;
        ipCreate.dSubscriptionType = null;
        ipCreate.oneSME_SubscriptionId = null;
        ipCreate.actionType = 0;
        ipCreate.regionId = this.region;
        ipCreate.serviceName = null;
        ipCreate.typeName =
          'SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
        ipCreate.userEmail = this.tokenService.get()?.email;
        ipCreate.actorEmail = this.tokenService.get()?.email;

        let specificationIP = JSON.stringify(ipCreate);
        let orderItemIP = new OrderItem();
        orderItemIP.orderItemQuantity = 1;
        orderItemIP.specification = specificationIP;
        orderItemIP.specificationType = 'ip_create';
        orderItemIP.price = e.price;
        orderItemIP.serviceDuration = 1;
        this.orderItem.push(orderItemIP);
      }
    });

    this.listOfDataIPv6.forEach((e: Network) => {
      let ipCreate = new IpCreate();
      if (e.ip != '' && e.amount != 0) {
        ipCreate.id = 0;
        ipCreate.duration = 0;
        ipCreate.ipAddress = null;
        ipCreate.vmToAttachId = null;
        ipCreate.offerId = 0;
        ipCreate.networkId = e.ip;
        ipCreate.useIPv6 = null;
        ipCreate.vpcId = this.projectId;
        ipCreate.oneSMEAddonId = null;
        ipCreate.serviceType = 0;
        ipCreate.serviceInstanceId = 0;
        ipCreate.customerId = this.tokenService.get()?.userId;
        ipCreate.createDate = '0001-01-01T00:00:00';
        ipCreate.expireDate = '0001-01-01T00:00:00';
        ipCreate.saleDept = null;
        ipCreate.saleDeptCode = null;
        ipCreate.contactPersonEmail = null;
        ipCreate.contactPersonPhone = null;
        ipCreate.contactPersonName = null;
        ipCreate.note = null;
        ipCreate.createDateInContract = null;
        ipCreate.am = null;
        ipCreate.amManager = null;
        ipCreate.isTrial = false;
        ipCreate.couponCode = null;
        ipCreate.dhsxkd_SubscriptionId = null;
        ipCreate.dSubscriptionNumber = null;
        ipCreate.dSubscriptionType = null;
        ipCreate.oneSME_SubscriptionId = null;
        ipCreate.actionType = 0;
        ipCreate.regionId = this.region;
        ipCreate.serviceName = null;
        ipCreate.typeName =
          'SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
        ipCreate.userEmail = this.tokenService.get()?.email;
        ipCreate.actorEmail = this.tokenService.get()?.email;

        let specificationIP = JSON.stringify(ipCreate);
        let orderItemIP = new OrderItem();
        orderItemIP.orderItemQuantity = 1;
        orderItemIP.specification = specificationIP;
        orderItemIP.specificationType = 'ip_create';
        orderItemIP.price = e.price;
        orderItemIP.serviceDuration = 1;
        this.orderItem.push(orderItemIP);
      }
    });

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
          window.location.href = data.data;
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
