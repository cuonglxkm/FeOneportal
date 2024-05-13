import { MongodbInfor } from './../../../model/mongodb-infor.model';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ServiceAvailablePackage } from '../../../model/servicePackage';
import { MongoService } from '../../../service/mongo.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from '../../../shared/models/region.model';
import { MongoCreateReq } from '../../../model/mongo-create.model';
import { ProjectModel } from '../../../shared/models/project.model';
import {
  FormSearchNetwork,
  FormSearchSubnet,
  NetWorkModel,
  Subnet,
} from '../../../model/vlan.model';
import { VlanService } from '../../../service/vlan.service';
import { EMPTY, catchError, forkJoin, map, max } from 'rxjs';
import { MongoPackDto, OfferPack } from '../../../model/offer.model';
import {
  Order,
  OrderData,
  OrderItem,
  OrderItemWithPack,
  OrderItemWithPackInfo,
} from '../../../model/order.model';
import { AppConstants } from '../../../constant/app-constant';
import { UtilService } from '../../../service/utils.service';
import { LoadingService } from '@delon/abc/loading';
import { PaymentService } from '../../../service/payment.service';

interface MongodbChoosen {
  serviceName: string;
  version: string;
  description: string;
  regionId: number;
  vpcId: number;
  offerId: number;
  offerName: string;
  ram: number;
  cpu: number;
  storage: number;
  vlan: string;
  subnet: string;
  duration: number;
  customerId: number;
  userEmail: string;
  actionType: number;
  serviceInstanceId: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-create-cluster',
  templateUrl: './create-cluster.component.html',
  styleUrls: ['./create-cluster.component.css'],
})
export class CreateClusterComponent {
  myform: FormGroup;
  chooseitem: MongoPackDto;
  vlanId: number;
  regionId: number;
  // projectId: number;
  projectInfraId: number;

  listOfServiceAvailablePackage: MongoPackDto[] = [];
  listOfVersion: string[] = [];
  listOfVPCNetworks: NetWorkModel[];
  listOfSubnets: Subnet[];
  isUsingPackConfig = false;
  expiryDate: number;
  currentDate: string;
  minStorage = 40;
  maxStorage: number;
  isValidStorage = false;

  cpuPrice = 0;
  ramPrice = 0;
  storagePrice = 0;

  listSubnetByNetwork: string[];

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 4, all: 0 },
    load: 1,
    speed: 250,
    // interval: {timing: 4000, initialDelay: 4000},
    loop: true,
    touch: true,
    velocity: 0.2,
    point: {
      visible: true,
    },
  };
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;

  isVisibleCancle: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: NzModalService,
    private cluster: MongoService,
    private vlanService: VlanService,
    private utilService : UtilService,
    private loading : LoadingService,
    private payment : PaymentService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.chooseitem = new MongoPackDto()
    this.getCurrentDate();
  }

  ngOnInit(): void {
    this.getPrice()
    this.getCatalogOffer();
    // this.getAllServicePack()
    this.getListOfVersion();
    this.initForm();
    this.myform.get('node').setValue(3)
    this.myform.get('node').disable()
    // this.getSubnetByVlanNetwork()
  }

  getPrice() {
    this.payment.getUnitPrice().subscribe(
      (r : any) => {
        r.data.forEach(i => {
          if(i.item.includes("cpu")) {
            this.cpuPrice = i.price
          } else if(i.item.includes("ram")) {
            this.ramPrice = i.price
          } else if(i.item.includes("storage")) {
            this.storagePrice = i.price
          }
        });
      }
    )
    // console.log('ok', this.cpuPrice, this.ramPrice, this.storagePrice)
  }

  formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
  refreshVPCNetwork() {
    this.getVlanNetwork(this.projectInfraId);
  }

  getVlanNetwork(projectId: number) {
    this.formSearchNetwork.projectId = projectId;
    this.formSearchNetwork.pageSize = 1000;
    this.formSearchNetwork.pageNumber = 0;
    this.formSearchNetwork.region = this.regionId;
    if (projectId && this.regionId) {
      this.vlanService
        .getVlanNetworks(this.formSearchNetwork)
        .subscribe((r: any) => {
          if (r && r.records) {
            this.listOfVPCNetworks = r.records;
          }
        });
    }
  }

  onInputUsage(event: any) {
    if (event) {
      // is number
      const numberReg = new RegExp('^[0-9]+$');
      const input = event.key;
      if (!numberReg.test(input)) {
        event.preventDefault();
      }
    }
  }

  getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = (today.getMonth() + 1).toString(); // Months start at 0
    let dd = today.getDate().toString();

    if (+dd < 10) dd = '0' + dd;
    if (+mm < 10) mm = '0' + mm;

    this.currentDate = dd + '/' + mm + '/' + yyyy;
  }

  onSelectUsageTime(event: any) {
    if (event) {
      const d = new Date();
      d.setMonth(d.getMonth() + Number(event));
      this.expiryDate = d.getTime();
    }
  }

  maxStorageOfCpu : number;
  maxStorageOfRam : number;
  onChangeCpuConfig() {
    const cpu = this.myform.get('cpu').value;
    const ram = this.myform.get('ram').value;


    if (cpu >= 2 && cpu <= 4) {
      this.maxStorageOfCpu = 500;
    } else if (cpu >= 5 && cpu <= 8) {
      this.maxStorageOfCpu = 1000;
    } else if (cpu >= 9 && cpu <= 16) {
      this.maxStorageOfCpu = 1500;
    } else if (cpu >= 17 && cpu <= 32) {
      this.maxStorageOfCpu = 2000;
    } else if (cpu >= 33 && cpu <= 64) {
      this.maxStorageOfCpu = 3000;
    } else {
      this.maxStorageOfCpu = 3000;
    }

    if(Number(ram) && Number(cpu) &&
    this.myform.get('cpu').valid &&
    this.myform.get('ram').valid) {
      this.maxStorage = Math.max(this.maxStorageOfCpu, this.maxStorageOfRam);
      this.isValidStorage = true;
    } else {
      this.isValidStorage = false
    }
    this.chooseitem.cpu = this.myform.get('cpu').value
    this.chooseitem.storage = this.myform.get('storage').value
  }

  onChangeRamConfig() {
    const cpu = this.myform.get('cpu').value;
    const ram = this.myform.get('ram').value;


    if (ram >= 4 && ram <= 8) {
      this.maxStorageOfRam = 500;
    } else if (ram >= 9 && ram <= 16) {
      this.maxStorageOfRam = 1000;
    } else if (ram >= 17 && ram <= 32) {
      this.maxStorageOfRam = 1500;
    } else if (ram >= 33 && ram <= 64) {
      this.maxStorageOfRam = 2000;
    } else if (ram >= 65 && ram <= 128) {
      this.maxStorageOfRam = 3000;
    } else {
      this.maxStorageOfRam = 3000;
    }
    this.myform.get('cpu').updateValueAndValidity()
    this.myform.get('ram').updateValueAndValidity()
    if(Number(ram) && Number(cpu) &&
      this.myform.get('cpu').valid && this.myform.get('ram').valid) {
        this.maxStorage = Math.max(this.maxStorageOfCpu, this.maxStorageOfRam);
        this.isValidStorage = true;
      } else {
        this.isValidStorage = false
      }
      this.chooseitem.ram = this.myform.get('ram').value
      this.chooseitem.storage = this.myform.get('storage').value
      
  }

  onBlurStorage() {
    const storage_value = this.myform.get('storage').value;
    if (storage_value < this.minStorage) {
      this.myform.get('storage').setValue(this.minStorage);
    } else if (storage_value > this.maxStorage) {
      this.myform.get('storage').setValue(this.maxStorage);
    }
    this.chooseitem.storage = this.myform.get('storage').value;
  }

  onchangeStorage(storage: number) {
    this.chooseitem.storage = this.myform.get('storage').value;
  }

  vlanCloudId: string;
  formSearchSubnet: FormSearchSubnet = new FormSearchSubnet();
  onSelectedVlan(vlanId: number) {
    this.vlanId = vlanId;
    if (this.vlanId) {
      this.getSubnetByVlanNetwork();
      const vlan = this.listOfVPCNetworks.find((item) => item.id == vlanId);
      this.vlanCloudId = vlan.cloudId;

      this.formSearchSubnet.pageSize = 1000;
      this.formSearchSubnet.pageNumber = 0;
      this.formSearchSubnet.networkId = this.vlanId;
      this.formSearchSubnet.region = this.regionId;
      this.formSearchSubnet.vpcId = this.projectInfraId;
      this.formSearchSubnet.customerId = this.tokenService.get()?.userId;
      const subnetObs = this.vlanService.getListSubnet(this.formSearchSubnet);
      const subnetUsedObs = this.cluster.getSubnetByNamespaceAndNetwork(
        this.projectInfraId,
        vlanId
      );

      // clear subnet
      this.myform.get('subnet').setValue(null);

      forkJoin({ subnetObs, subnetUsedObs }).subscribe((data) => {
        this.listOfSubnets = data['subnetObs'].records;
        this.listSubnetByNetwork = data['subnetUsedObs'].data;
      });
    }
  }

  getSubnetByVlanNetwork() {
    this.formSearchSubnet.pageSize = 1000;
    this.formSearchSubnet.pageNumber = 0;
    this.formSearchSubnet.networkId = this.vlanId;
    this.formSearchSubnet.region = this.regionId;
    this.formSearchSubnet.vpcId = this.projectInfraId;
    this.formSearchSubnet.customerId = this.tokenService.get()?.userId;

    this.vlanService
      .getListSubnet(this.formSearchSubnet)
      .pipe(
        map((r) => r.records),
        catchError((response) => {
          console.error('fail to get list subnet: {}', response);
          return EMPTY;
        })
      )
      .subscribe((data: any) => {
        this.listOfSubnets = data;
      });
  }

  refreshSubnet() {
    this.getSubnetByVlanNetwork();
  }

  checkOverLapseIP() {
    // let cidr = this.myform.get('cidr').value;
    // let subnet = this.subnetAddress;
    // const reg = new RegExp(KubernetesConstant.CIDR_PATTERN);
    // if (!reg.test(cidr)) return;
    // if (cidr && subnet) {
    //   if (overlapCidr(cidr, subnet)) {
    //     this.myform.get('cidr').setErrors({overlap: true});
    //   } else {
    //     delete this.myform.get('cidr').errors?.overlap;
    //   }
    //   if (overlapCidr(cidr, KubernetesConstant.CIDR_CHECK)) {
    //     this.myform.get('cidr').setErrors({cidr_used: true});
    //   } else {
    //     delete this.myform.get('cidr').errors?.cidr_used;
    //   }
    // }
  }

  subnetAddress: string;
  onSelectSubnet(subnetId: number) {
    // check subnet
    const subnet = this.listOfSubnets.find((item) => item.id == subnetId);
    if (subnet != null) {
      const selectedVpcNetworkId = this.myform.get('vpcNetwork').value;

      this.subnetAddress = subnet.subnetAddressRequired;
      if (this.listSubnetByNetwork && this.listSubnetByNetwork.length > 0) {
        if (!this.listSubnetByNetwork.includes(this.subnetAddress)) {
          this.myform.get('subnet').setErrors({ usedSubnet: true });
          return;
        } else {
          delete this.myform.get('subnet').errors?.usedSubnet;
        }
      }
      this.myform.get('subnetId').setValue(subnetId);
      this.myform.get('networkCloudId').setValue(subnet.networkCloudId);
      this.myform.get('subnetCloudId').setValue(subnet.subnetCloudId);
    }
  }

  handleOkCancle() {
    this.isVisibleCancle = false;
    this.router.navigate(['/app-mongodb-replicaset']);
    // this.navigateToList()
  }

  handleCancelPopup() {
    this.isVisibleCancle = false;
  }
  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;

    this.getVlanNetwork(this.projectInfraId);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  // getAllServicePack() {
  //   this.cluster.getAllServiePack().subscribe(
  //     (data: any) => {
  //       this.listOfServiceAvailablePackage = data.data
  //     }
  //   )
  // }

  getListOfVersion() {
    this.cluster.getAllVersion('').subscribe((data: any) => {
      this.listOfVersion = data.data;
    });
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_-]*$'),
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      version: [null, [Validators.required]],
      description: [
        null,
        [
          Validators.maxLength(500)
        ],
      ],
      cpu: [null, [Validators.required, Validators.min(2), Validators.max(64)]],
      ram: [
        null,
        [Validators.required, Validators.min(4), Validators.max(128)],
      ],
      storage: [80, [Validators.required]],
      node: [null, [Validators.required]],
      subnet: [null, [Validators.required]],
      autoScalingWorker: [null],
      vpcNetwork: [null, [Validators.required]],
      usageTime: [1, [Validators.required]],
    });

    this.myform.get("storage").valueChanges.subscribe(r => {
      this.onchangeStorage(r)
    })
  }

  submitForm() {
    console.log('submit form');
  }

  clicktab() {
    this.chooseitem = null;
  }

  handleChoosePack(item: MongoPackDto) {
    this.chooseitem = item;
    this.myform.get('cpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('node').setValue(item.node);
    this.myform.get('storage').setValue(item.storage);



    // // onchange set price

    const info = new OrderItemWithPackInfo();
    info.regionId = this.regionId;
    info.offerId = this.chooseitem.id;

    const pack = new OrderItemWithPack();
    pack.orderItemQuantity = 1;
    pack.specificationString = JSON.stringify(info);
    pack.specificationType = 'mongodb_create';
    pack.serviceDuration = this.myform.get('usageTime').value;
    pack.sortItem = 1;

    const listOfOrderData: OrderItemWithPack[] = [];
    listOfOrderData.push(pack);
    // call api
    const orderItem = new OrderData();
    orderItem.orderItems = listOfOrderData;
    orderItem.projectId = this.projectInfraId;
    this.cluster.getPricePackMongo(orderItem).subscribe((r) => {
      console.log('call api get order with data: ', r);
    });
  }

  onSubmitPayment() {
    const mongodb = this.myform.value;
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    data.note = '';

    const mongodbChoosen: MongodbChoosen = {
      serviceName: mongodb.serviceName,
      version: mongodb.version,
      description: mongodb.description,
      regionId: this.regionId,
      vpcId: this.projectInfraId,
      offerId: this.chooseitem.id,
      offerName: this.chooseitem.offerName,
      ram: mongodb.ram,
      cpu: mongodb.cpu,
      storage: mongodb.storage,
      vlan: '',
      subnet: '',
      duration: mongodb.usageTime,
      customerId: userId,
      userEmail: this.tokenService.get()?.email,
      actionType: 0,
      serviceInstanceId: 0,
    };
    // mongodb.offerId = this.chooseitem != null ? this.chooseitem.id : 0;
    // mongodb.regionId = this.regionId;
    // mongodb.projectId = this.projectId;
    // mongodb.vpcId = this.projectId;
    // mongodb.offerName = this.chooseitem != null ? this.chooseitem.offerName : '';

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = 100000;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.MONGODB_CREATE_TYPE;
    orderItem.specification = JSON.stringify(mongodbChoosen);
    orderItem.serviceDuration = mongodb.usageTime;
    orderItem.sortItem = 0;

    data.orderItems = [...data.orderItems, orderItem];
    const returnPath = window.location.pathname;

    // điều hướng tới trang thanh toán của smartcloud
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: data, path: returnPath },
    });
  }

  canclePayment() {
    this.router.navigate(['/app-mongodb-replicaset']);
  }

  onCancelCreate() {
    // this.modalService.confirm({
    //   nzTitle: 'Xác nhận hủy ',
    //   nzContent: `Toàn bộ thông tin vừa chọn của bạn sẽ không được lưu lại. Bạn có muốn ngừng khởi tạo dịch vụ ? `,
    //   nzOkText: 'Xác nhận',
    //   nzOkType: 'primary',
    //   nzOkDanger: true,
    //   nzOnOk: () => this.canclePayment(),
    //   nzCancelText: 'Hủy bỏ',
    //   nzOnCancel: () => console.log('Cancel')
    // });
    this.isVisibleCancle = true;
  }

  paymentPackMongodb() {
    console.log('payment package mongodb');
  }

  getCatalogOffer() {
    // this.listOfferKafka = [];
    const characteristicMap = {
      cpu: 'cpu',
      ram: 'ram',
      storage: 'storage',
    };
    this.cluster.getCatalogsOffer().subscribe((data: any) => {
      data.forEach((offer) => {
        const offerMongodb = new MongoPackDto();
        offerMongodb.id = offer.id;
        offerMongodb.offerName = offer.offerName;
        offerMongodb.price = offer.price;
        offerMongodb.node = 3;
        offer.characteristicValues.forEach((item) => {
          const characteristic = characteristicMap[item.charName];
          if (characteristic) {
            offerMongodb[characteristic] = Number.parseInt(
              item.charOptionValues[0]
            );
          }
        });
        this.listOfServiceAvailablePackage.push(offerMongodb);
      });
      this.listOfServiceAvailablePackage =
        this.listOfServiceAvailablePackage.sort(
          (a, b) => a.price.fixedPrice.amount - b.price.fixedPrice.amount
        );
    });
  }

  // this.cluster.getCatalogsOffer().subscribe(
  //   (r : OfferPack[]) => {
  //     this.listOfServiceAvailablePackage = r
  //     console.log('rss :', this.listOfServiceAvailablePackage)
  //   }
  // )
}
