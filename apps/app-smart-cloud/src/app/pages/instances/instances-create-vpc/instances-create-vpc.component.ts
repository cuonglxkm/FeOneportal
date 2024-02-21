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
import { Observable, finalize, of } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { SnapshotVolumeService } from 'src/app/shared/services/snapshot-volume.service';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface InstancesForm {
  name: FormControl<string>;
}
@Component({
  selector: 'one-portal-instances-create',
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
  ipPublicValue: number;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  hdh: any = null;
  selectedSSHKeyName: string;
  selectedSnapshot: number;
  isEncryptVolume: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private snapshotVLService: SnapshotVolumeService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private loadingSrv: LoadingService
  ) {}

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
    this.getAllImageType();
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
          if (e.status == 'Active') {
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

  selectedElementFlavor: string = null;
  isInitialClass = true;
  isNewClass = false;

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

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    this.listSecurityGroup = [];
    this.listIPPublic = [];
    this.selectedSecurityGroup = [];
    this.ipPublicValue = 0;
    this.initSnapshot();
    this.getAllIPPublic();
    this.getAllOfferImage(this.imageTypeId);
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
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;

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

  save(): void {
    if (!this.isSnapshot && this.hdh == null) {
      this.notification.error('', 'Vui lòng chọn hệ điều hành');
      return;
    }
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

    var returnPath: string = window.location.pathname;
    console.log('instance create', this.instanceCreate);
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }

  cancel(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }
}
