import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DataPayment,
  Flavors,
  IPPublicModel,
  IPSubnetModel,
  InstanceResize,
  InstancesModel,
  ItemPayment,
  Network,
  OfferItem,
  Order,
  OrderItem,
  SecurityGroupModel,
  UpdateInstances,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { finalize } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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

@Component({
  selector: 'one-portal-instances-edit',
  templateUrl: './instances-edit.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditComponent implements OnInit {
  listOfOption: Array<{ value: string; label: string }> = [];
  reverse = true;
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });

  //danh sách các biến của form model
  id: number;
  instancesModel: InstancesModel;

  updateInstances: UpdateInstances = new UpdateInstances();
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
  numberMonth: number = 1;
  hdh: any;
  offerFlavor: OfferItem = null;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh

  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 5, all: 0 },
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
    private route: Router,
    private router: ActivatedRoute,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.userId = this.tokenService.get()?.userId;
    this.userEmail = this.tokenService.get()?.email;
    this.id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
  }

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

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        console.log('getAllSecurityGroup', data);
        this.listSecurityGroup = data;
        //this.selectedSecurityGroup.push(this.listSecurityGroup[0]);
      });
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  listOfferFlavors: OfferItem[] = [];

  selectedElementFlavor: number = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
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
              e.description += ch.charOptionValues[1] + ' VCPU / ';
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
              if (this.activeBlockHDD) {
                e.description += ch.charOptionValues[1] + ' GB HDD';
              } else {
                e.description += ch.charOptionValues[1] + ' GB SSD';
              }
              if (
                Number.parseInt(ch.charOptionValues[1]) !=
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
    // Handle the region change event
    this.region = region.regionId;
    this.id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    this.getCurrentInfoInstance(this.id);
    this.selectedSecurityGroup = [];
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.selectedSecurityGroup = [];
    this.getAllSecurityGroup();
  }

  getCurrentInfoInstance(instanceId: number): void {
    this.dataService.getById(instanceId, true).subscribe((data: any) => {
      this.instancesModel = data;
      if (this.instancesModel.volumeType == 0) {
        this.activeBlockHDD = true;
        this.activeBlockSSD = false;
      }
      if (this.instancesModel.volumeType == 1) {
        this.activeBlockHDD = false;
        this.activeBlockSSD = true;
      }
      this.cdr.detectChanges();
      this.selectedElementFlavor = this.instancesModel.flavorId;
      this.region = this.instancesModel.regionId;
      this.projectId = this.instancesModel.projectId;
      this.dataService
        .getAllSecurityGroupByInstance(
          this.instancesModel.cloudId,
          this.instancesModel.regionId,
          this.instancesModel.customerId,
          this.instancesModel.projectId
        )
        .pipe(finalize(() => this.loadingSrv.close()))
        .subscribe((datasg: any) => {
          console.log('getAllSecurityGroupByInstance', datasg);
          var arraylistSecurityGroup = datasg.map((obj) => obj.id.toString());
          this.selectedSecurityGroup = arraylistSecurityGroup;
          this.cdr.detectChanges();
        });
      this.initFlavors();
      this.getListIpPublic();
    });
  }

  listIPStr = '';
  getListIpPublic() {
    this.dataService
      .getPortByInstance(this.id, this.region)
      .subscribe((dataNetwork: any) => {
        let listOfDataNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == true
        );
        let listIP: string[] = [];
        listOfDataNetwork.forEach((e) => {
          listIP = listIP.concat(e.fixedIPs);
        });
        this.listIPStr = listIP.join(', ');
        this.cdr.detectChanges();
      });
  }

  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  save(): void {
    this.modalSrv.create({
      nzTitle: 'Xác nhận thông tin thay đổi',
      nzContent:
        'Quý khách chắn chắn muốn thực hiện thay đổi thông tin máy ảo?',
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
    });
    this.instanceResize.addRam = 0;
    this.instanceResize.addCpu = 0;
    this.instanceResize.addBtqt = 0;
    this.instanceResize.addBttn = 0;
    this.instanceResize.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.InstanceResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceResize.newOfferId = this.offerFlavor.id;
    this.instanceResize.serviceType = 1;
    this.instanceResize.actionType = 4;
    this.instanceResize.serviceInstanceId = this.instancesModel.id;
    this.instanceResize.regionId = this.region;
    this.instanceResize.serviceName = null;
    this.instanceResize.customerId = this.userId;
    this.instanceResize.vpcId = this.projectId;
    this.instanceResize.userEmail = this.userEmail;
    this.instanceResize.actorEmail = this.tokenService.get()?.email;
  }

  readyEdit(): void {
    this.updateInstances.id = this.instancesModel.id;
    this.updateInstances.name = this.instancesModel.name;
    this.updateInstances.regionId = this.region;
    this.updateInstances.projectId = this.projectId;
    this.updateInstances.customerId = this.userId;
    this.updateInstances.securityGroups = this.selectedSecurityGroup.join(',');
    console.log('update instance', this.updateInstances);

    if (this.offerFlavor != null) {
      this.instanceResizeInit();
      let specificationInstance = JSON.stringify(this.instanceResize);
      let orderItemInstanceResize = new OrderItem();
      orderItemInstanceResize.orderItemQuantity = 1;
      orderItemInstanceResize.specification = specificationInstance;
      orderItemInstanceResize.specificationType = 'instance_resize';
      orderItemInstanceResize.price = this.totalincludesVAT;
      orderItemInstanceResize.serviceDuration = this.numberMonth;
      this.orderItem.push(orderItemInstanceResize);

      this.order.customerId = this.userId;
      this.order.createdByUserId = this.userId;
      this.order.note = 'instance resize';
      this.order.orderItems = this.orderItem;

      console.log('order instance resize', this.order);

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
            this.notification.error(
              '',
              'Tạo order thay đổi cấu hình không thành công'
            );
          }
        );
    }

    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.dataService
      .update(this.updateInstances)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (next) => {
          console.log(next);
          this.notification.success('', 'Cập nhật máy ảo thành công');
          this.route.navigate(['/app-smart-cloud/instances']);
        },
        error: (e) => {
          console.log(e);
          this.notification.error('', 'Cập nhật máy ảo không thành công');
        },
      });
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.instanceResizeInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceResize);
    itemPayment.specificationType = 'instance_create';
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
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}
