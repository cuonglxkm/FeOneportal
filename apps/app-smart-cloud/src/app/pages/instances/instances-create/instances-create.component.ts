import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
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
import { Observable, of } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { SnapshotVolumeService } from 'src/app/shared/services/snapshot-volume.service';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';

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
  price?: number = 0;
  priceAndVAT?: number = 0;
}
class Network {
  id: number = 0;
  ip?: string = '';
  amount?: number = 1;
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
      validators: [
        Validators.required,
        Validators.max(50),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ],
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

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private snapshotVLService: SnapshotVolumeService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
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

  @ViewChild('myCarouselImage') myCarouselImage: NguCarousel<any>;
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
        this.myCarouselImage.reset();
        this.myCarouselFlavor.reset();
      }, 100);
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
    this.getAllSSHKey();
    this.cdr.detectChanges();
  }

  getUser() {}
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

  onInputHDH(event: any, index: number, imageTypeId: number) {
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
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
    if (
      this.isCustomconfig &&
      this.configCustom.vCPU != 0 &&
      this.configCustom.ram != 0 &&
      this.configCustom.capacity != 0
    ) {
      this.getTotalAmount();
    }
    this.initFlavors();
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
    if (
      this.isCustomconfig &&
      this.configCustom.vCPU != 0 &&
      this.configCustom.ram != 0 &&
      this.configCustom.capacity != 0
    ) {
      this.getTotalAmount();
    }
    this.initFlavors();
  }

  isCustomconfig = false;
  onClickConfigPackage() {
    this.isCustomconfig = false;
    this.offerFlavor = null;
    this.selectedElementFlavor = null;
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
  }

  onClickCustomConfig() {
    this.configCustom = new ConfigCustom();
    this.totalAmount = 0;
    this.totalincludesVAT = 0;
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
        this.listOfferFlavors = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
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

  onChangeVCPU() {
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
  }

  onChangeRam() {
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
  }

  onChangeCapacity() {
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

  onChangeTime() {
    if (this.hdh != null && this.offerFlavor != null) {
      this.getTotalAmount();
    }
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

  onInputBlockStorage() {
    this.getTotalAmountBlockStorage();
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
  }

  deleteRowIPv6(id: number): void {
    this.listOfDataIPv6 = this.listOfDataIPv6.filter((d) => d.id !== id);
  }

  onInputIPv4() {
    this.getTotalAmountIPv4();
    const filteredArrayHas = this.listOfDataIPv4.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length == 0) {
      this.defaultIPv4 = new Network();
      this.idIPv4++;
      this.defaultIPv4.id = this.idIPv4;
      this.listOfDataIPv4.push(this.defaultIPv4);
    }
    this.cdr.detectChanges();
  }

  onInputIPv6() {
    this.getTotalAmountIPv6();
    const filteredArrayHas = this.listOfDataIPv6.filter(
      (item) => item.ip == ''
    );

    if (filteredArrayHas.length == 0) {
      this.defaultIPv6 = new Network();
      this.idIPv6++;
      this.defaultIPv6.id = this.idIPv6;
      this.listOfDataIPv6.push(this.defaultIPv6);
    }
    this.cdr.detectChanges();
  }
  //#endregion

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: any) {
    // this.router.navigate(['/app-smart-cloud/instances']);
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
    this.instanceCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceCreate.vpcId = this.projectId;
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
    this.instanceCreate.customerId = this.tokenService.get()?.userId;

    let currentDate = new Date();
    let lastDate = new Date();
    lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    this.instanceCreate.createDate = currentDate.toISOString().substring(0, 19);
    this.instanceCreate.expireDate = lastDate.toISOString().substring(0, 19);

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
    this.instanceCreate.actionType = 0;
    this.instanceCreate.regionId = this.region;
    this.instanceCreate.userEmail = this.tokenService.get()['email'];
    this.instanceCreate.actorEmail = this.tokenService.get()['email'];
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
    this.volumeCreate.vpcId = this.projectId.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;

    let currentDate = new Date();
    let lastDate = new Date();
    lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    this.volumeCreate.createDate = currentDate.toISOString().substring(0, 19);
    this.volumeCreate.expireDate = lastDate.toISOString().substring(0, 19);

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
    this.volumeCreate.offerId =
      this.volumeCreate.volumeType == 'hdd' ? 145 : 156;
    this.volumeCreate.couponCode = null;
    this.volumeCreate.dhsxkd_SubscriptionId = null;
    this.volumeCreate.dSubscriptionNumber = null;
    this.volumeCreate.dSubscriptionType = null;
    this.volumeCreate.oneSME_SubscriptionId = null;
    this.volumeCreate.actionType = 1;
    this.volumeCreate.regionId = this.region;
    this.volumeCreate.serviceName = blockStorage.name;
    this.volumeCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = this.tokenService.get()?.email;
    this.volumeCreate.actorEmail = this.tokenService.get()?.email;
  }

  ipCreate: IpCreate = new IpCreate();
  ipInit(ip: Network) {
    this.ipCreate.id = 0;
    this.ipCreate.duration = 0;
    this.ipCreate.ipAddress = null;
    this.ipCreate.vmToAttachId = null;
    this.ipCreate.offerId = 50;
    this.ipCreate.networkId = ip.ip;
    this.ipCreate.useIPv6 = null;
    this.ipCreate.vpcId = this.projectId;
    this.ipCreate.oneSMEAddonId = null;
    this.ipCreate.serviceType = 0;
    this.ipCreate.serviceInstanceId = 0;
    this.ipCreate.customerId = this.tokenService.get()?.userId;

    let currentDate = new Date();
    let lastDate = new Date();
    lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    this.ipCreate.createDate = currentDate.toISOString().substring(0, 19);
    this.ipCreate.expireDate = lastDate.toISOString().substring(0, 19);

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
    this.ipCreate.serviceName = null;
    this.ipCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.ipCreate.userEmail = this.tokenService.get()?.email;
    this.ipCreate.actorEmail = this.tokenService.get()?.email;
  }

  save(): void {
    if (!this.isSnapshot && this.hdh == null) {
      this.notification.error('', 'Vui lòng chọn hệ điều hành');
      return;
    }
    if (this.isCustomconfig == false && this.offerFlavor == null) {
      this.notification.error('', 'Vui lòng chọn gói cấu hình');
      return;
    }
    if (
      this.isCustomconfig == true &&
      (this.configCustom.vCPU == 0 ||
        this.configCustom.ram == 0 ||
        this.configCustom.capacity == 0)
    ) {
      this.notification.error('', 'Cấu hình tùy chỉnh chưa hợp lệ');
      return;
    }
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
      if (e.ip != '') {
        this.ipInit(e);
        let specificationIP = JSON.stringify(this.ipCreate);
        let orderItemIP = new OrderItem();
        orderItemIP.orderItemQuantity = 1;
        orderItemIP.specification = specificationIP;
        orderItemIP.specificationType = 'ip_create';
        orderItemIP.price = e.price;
        orderItemIP.serviceDuration = this.numberMonth;
        this.orderItem.push(orderItemIP);
      }
    });

    this.listOfDataIPv6.forEach((e: Network) => {
      if (e.ip != '') {
        this.ipInit(e);
        let specificationIP = JSON.stringify(this.ipCreate);
        let orderItemIP = new OrderItem();
        orderItemIP.orderItemQuantity = 1;
        orderItemIP.specification = specificationIP;
        orderItemIP.specificationType = 'ip_create';
        orderItemIP.price = e.price;
        orderItemIP.serviceDuration = this.numberMonth;
        this.orderItem.push(orderItemIP);
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
  getTotalAmountBlockStorage() {
    this.totalAmountVolume = 0;
    this.totalAmountVolumeVAT = 0;
    this.listOfDataBlockStorage.forEach((e: BlockStorage) => {
      if (e.type != '') {
        this.volumeInit(e);
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
          e.price =
            Number.parseFloat(result.data.totalAmount.amount) /
            this.numberMonth;
          this.totalAmountVolume += e.price;
          e.priceAndVAT = Number.parseFloat(result.data.totalPayment.amount);
          this.totalAmountVolumeVAT += e.priceAndVAT;
          this.cdr.detectChanges();
        });
      }
    });
  }

  totalAmountIPv4 = 0;
  totalAmountIPv4VAT = 0;
  getTotalAmountIPv4() {
    this.totalAmountIPv4 = 0;
    this.totalAmountIPv4VAT = 0;
    this.listOfDataIPv4.forEach((e: Network) => {
      if (e.ip != '') {
        this.ipInit(e);
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(this.ipCreate);
        itemPayment.specificationType = 'ip_create';
        itemPayment.serviceDuration = this.numberMonth;
        itemPayment.sortItem = 0;
        let dataPayment: DataPayment = new DataPayment();
        dataPayment.orderItems = [itemPayment];
        dataPayment.projectId = this.projectId;
        this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
          console.log('thanh tien ipv4', result);
          e.price =
            Number.parseFloat(result.data.totalAmount.amount) /
            this.numberMonth;
          this.totalAmountIPv4 += e.price;
          e.priceAndVAT = Number.parseFloat(result.data.totalPayment.amount);
          this.totalAmountIPv4VAT += e.priceAndVAT;
          this.cdr.detectChanges();
        });
      }
    });
  }

  totalAmountIPv6 = 0;
  totalAmountIPv6VAT = 0;
  getTotalAmountIPv6() {
    this.totalAmountIPv6 = 0;
    this.totalAmountIPv6VAT = 0;
    this.listOfDataIPv6.forEach((e: Network) => {
      if (e.ip != '') {
        this.ipInit(e);
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(this.ipCreate);
        itemPayment.specificationType = 'ip_create';
        itemPayment.serviceDuration = this.numberMonth;
        itemPayment.sortItem = 0;
        let dataPayment: DataPayment = new DataPayment();
        dataPayment.orderItems = [itemPayment];
        dataPayment.projectId = this.projectId;
        this.dataService.getTotalAmount(dataPayment).subscribe((result) => {
          console.log('thanh tien ipv6', result);
          e.price = Number.parseFloat(result.data.totalAmount.amount);
          this.totalAmountIPv6 += e.price;
          e.priceAndVAT = Number.parseFloat(result.data.totalPayment.amount);
          this.totalAmountIPv6VAT += e.priceAndVAT;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  userChangeProject() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }
}
