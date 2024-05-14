import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, catchError, finalize, map } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { JsonDataCreate, KafkaCreateOrder, KafkaCreateReq, RegionResource } from 'src/app/core/models/kafka-create-req.model';
import { KafkaVersion } from 'src/app/core/models/kafka-version.model';
import { OfferKafka } from 'src/app/core/models/offer.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { ProjectModel } from 'src/app/core/models/project.model';
import { RegionModel } from 'src/app/core/models/region.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { FormSearchNetwork, FormSearchSubnet, NetWorkModel, Subnet } from 'src/app/core/models/vlan.model';
import { KafkaService } from 'src/app/services/kafka.service';
import { VlanService } from 'src/app/services/vlan.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-create-kafka',
  templateUrl: './create-kafka.component.html',
  styleUrls: ['./create-kafka.component.css'],
})
export class CreateKafkaComponent implements OnInit {

  myform: FormGroup;

  chooseitem: OfferKafka;

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 4, all: 0 },
    load: 1,
    speed: 250,
    // interval: {timing: 4000, initialDelay: 4000},
    loop: true,
    touch: true,
    velocity: 0.2,
    point: {
      visible: true
    }
  }

  listOfServicePack: ServicePack[] = [];

  listOfKafkaVersion: KafkaVersion[] = [];

  showCustomConfig = false;

  kafkaCreateReq: KafkaCreateReq;
  servicePackCode: string;
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  usageTime = 1;
  createDate: Date;
  expiryDate: Date;
  ram = 0;
  cpu = 0;
  storage = 0;
  unitPrice = {
    ram: 240000,
    cpu: 105000,
    storage: 8500
  }

  regionId: number;
  projectId: number;
  cloudProfileId: string;
  vlanId: number;
  listOfVPCNetworks: NetWorkModel[];
  listOfSubnets: Subnet[];

  isVisibleCancle = false;
  listOfferKafka: OfferKafka[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private vlanService: VlanService,
  ) {
    this.listOfVPCNetworks = [];
    this.listOfSubnets = [];
  }

  ngOnInit(): void {
    this.getListVersion();
    this.initForm();
    this.createDate = new Date();
    this.setExpiryDate();
    this.getUnitPrice();
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      version: [null],
      description: [null, [Validators.maxLength(500)]],
      vCpu: [null, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(16)]],
      ram: [null, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(64)]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(2000), Validators.pattern("^[0-9]*$")]],
      broker: [3, [Validators.required]],
      usageTime: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      configType: [0, [Validators.required]],
      numPartitions: [3],
      defaultReplicationFactor: [3],
      minInsyncReplicas: [2],
      offsetTopicReplicationFactor: [3],
      logRetentionHours: [168],
      logSegmentBytes: [1073741824],
      vpcNetwork: [null, [Validators.required]],
      subnet: [null, [Validators.required]],
      subnetId: [null, [Validators.required]],
      subnetCloudId: [null, [Validators.required]],

    });

    this.myform.controls.broker.disable();
  }

  getListPackage() {
    this.kafkaService.getListPackageAvailable()
    .subscribe(
      res => {
        if (res && res.code == 200) {
          this.listOfServicePack = camelizeKeys(res.data) as ServicePack[];
        }
      }
    )
  }

  getUnitPrice() {
    const unitMap = {
      'cpu': 'cpu',
      'ram': 'ram',
      'storage': 'storage_ssd'
    };
    this.kafkaService.getUnitPrice()
    .subscribe(
      res => {
        if (res && res.code == 200) {
          res.data.forEach(e => {
            const map = unitMap[e.item];
            if (map) {
              this.unitPrice[map] = e.price;
            }
          })
        }
      }
    )
  }

  getListOffers() {
    this.listOfferKafka = [];
    const characteristicMap = {
      'cpu': 'cpu',
      'ram': 'ram',
      'storage': 'storage'
    };
    this.kafkaService.getListOffers(this.regionId, 'kafka')
    .subscribe(
      (data) => {
        data.forEach(offer => {
          const offerKafka = new OfferKafka();
          offerKafka.id = offer.id;
          offerKafka.offerName = offer.offerName;
          offerKafka.price = offer.price;
          offerKafka.broker = 3;
          offer.characteristicValues.forEach(item => {
            const characteristic = characteristicMap[item.charName];
            if (characteristic) {
              offerKafka[characteristic] = Number.parseInt(item.charOptionValues[0]) / 3;
            }
          });
          this.listOfferKafka.push(offerKafka);
        });
        this.listOfferKafka = this.listOfferKafka.sort(
          (a, b) => a.price.fixedPrice.amount - b.price.fixedPrice.amount
        );
      }
    )
  }

  onChangeCpu(event) {
    this.cpu = event;  
  }

  onChangeRam(event) {
    this.ram = event;
  }

  onChangeStorage(event) {
    this.storage = event;
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

  getListVersion() {
    this.kafkaService.getListVersion()
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.listOfKafkaVersion = camelizeKeys(res.data) as KafkaVersion[];
          }
        }
      )
  }

  vlanCloudId: string;
  formSearchSubnet: FormSearchSubnet = new FormSearchSubnet();
  onSelectedVlan(vlanId: number) {
    this.vlanId = vlanId;
    if (this.vlanId) {
      // this.getSubnetByVlanNetwork();
      const vlan = this.listOfVPCNetworks.find(item => item.id == vlanId);
      this.vlanCloudId = vlan.cloudId;

      this.formSearchSubnet.pageSize = 1000;
      this.formSearchSubnet.pageNumber = 0;
      this.formSearchSubnet.networkId = this.vlanId;
      this.formSearchSubnet.region = this.regionId;
      this.formSearchSubnet.vpcId = this.projectId;
      this.formSearchSubnet.customerId = this.tokenService.get()?.userId;

      this.vlanService.getListSubnet(this.formSearchSubnet)
      .subscribe((r) => {
        if (r && r.records) {
          this.listOfSubnets = r.records;
        }
      })

      // clear subnet
      this.myform.get('subnet').setValue(null);
    }
  }

  formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
  getVlanNetwork(projectId: number) {
    this.formSearchNetwork.projectId = projectId;
    this.formSearchNetwork.pageSize = 1000;
    this.formSearchNetwork.pageNumber = 0;
    this.formSearchNetwork.region = this.regionId;

    if (projectId && this.regionId) {
      this.vlanService.getVlanNetworks(this.formSearchNetwork)
      .subscribe((r) => {
        if (r && r.records) {
          this.listOfVPCNetworks = r.records;
        }
      });
    }
  }

  refreshVPCNetwork() {
    this.getVlanNetwork(this.projectId);
  }

  refreshSubnet() {
    this.getSubnetByVlanNetwork();
  }

  getSubnetByVlanNetwork() {
    this.formSearchSubnet.pageSize = 1000;
    this.formSearchSubnet.pageNumber = 0;
    this.formSearchSubnet.networkId = this.vlanId;
    this.formSearchSubnet.region = this.regionId;
    this.formSearchSubnet.vpcId = this.projectId;
    this.formSearchSubnet.customerId = this.tokenService.get()?.userId;

    this.vlanService.getListSubnet(this.formSearchSubnet).pipe(
      map(r => r.records),
      catchError(response => {
        console.error("fail to get list subnet: {}", response);
        return EMPTY;
      })
    )
    .subscribe((data: any) => {
      this.listOfSubnets = data;
    });
  }

  onSelectSubnet(subnetId: number) {
    const subnet = this.listOfSubnets.find(item => item.id == subnetId);
    if (subnet != null) {
      this.myform.get('subnetId').setValue(subnetId);
      this.myform.get('subnetCloudId').setValue(subnet.subnetCloudId);
    }
  }

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.getListOffers();
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.getVlanNetwork(this.projectId);
  }

  onSubmitPayment() {

    const jsonData = new JsonDataCreate();
    const kafkaSpec = new KafkaCreateOrder();

    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];

    jsonData.version = this.myform.controls['version'].value;
    jsonData.description = this.myform.controls['description'].value;
    jsonData.numPartitions = this.myform.controls['numPartitions'].value;
    jsonData.defaultReplicationFactor = this.myform.controls['defaultReplicationFactor'].value;
    jsonData.minInsyncReplicas = this.myform.controls['minInsyncReplicas'].value;
    jsonData.offsetTopicReplicationFactor = this.myform.controls['offsetTopicReplicationFactor'].value;
    jsonData.logRetentionHours = this.myform.controls['logRetentionHours'].value;
    jsonData.logSegmentBytes = this.myform.controls['logSegmentBytes'].value;
    jsonData.subnetId = this.myform.controls['subnetId'].value;
    jsonData.subnetCloudId = this.myform.controls['subnetCloudId'].value;
    jsonData.networkId = this.vlanId;

    kafkaSpec.serviceName = this.myform.controls['serviceName'].value;
    kafkaSpec.vCpu = this.myform.controls['vCpu'].value;
    kafkaSpec.ram = this.myform.controls['ram'].value;
    kafkaSpec.storage = this.myform.controls['storage'].value;
    kafkaSpec.broker = this.myform.controls['broker'].value;
    kafkaSpec.usageTime = this.myform.controls['usageTime'].value;
    kafkaSpec.offerId = this.chooseitem != null ? this.chooseitem.id : 0;
    kafkaSpec.offerName = this.chooseitem != null ? this.chooseitem.offerName : '';
    kafkaSpec.jsonData = JSON.stringify(jsonData);
    kafkaSpec.regionId = this.regionId;
    kafkaSpec.projectId = this.projectId;
    kafkaSpec.vpcId = this.projectId;
    kafkaSpec.createDate = this.createDate.toISOString().substring(0, 19);
    kafkaSpec.expireDate = this.expiryDate.toISOString().substring(0, 19);

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = (this.unitPrice.cpu * this.cpu + this.unitPrice.ram * this.ram + this.unitPrice.storage * this.storage) * this.usageTime;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAKFA_CREATE_TYPE;
    orderItem.specification = JSON.stringify(kafkaSpec);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
    // this.createKafkaService();
  }

  checkRegionResource() {
    const regionResource = new RegionResource();
    regionResource.regionId = this.regionId.toString();
    regionResource.cpu = this.myform.controls['vCpu'].value * 3;
    regionResource.ram = this.myform.controls['ram'].value * 3;
    regionResource.storage = this.myform.controls['storage'].value * 3;

    this.kafkaService.checkRegionResource(regionResource)
    .subscribe((data) => {
      if (data && data.code == 200) {
        this.onSubmitPayment();
      } else {
        this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
      }
    })
  }

  checkExistedService() {
    const serviceName = this.myform.controls['serviceName'].value;
    this.kafkaService.checkExistedService(serviceName, this.regionId, this.projectId)
    .subscribe((data) => {
      if (data && data.code == 200) {
        this.checkRegionResource();
      } else {
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'Dịch vụ đã tồn tại');
      }
    })
  }

  createKafkaService() {
    const dto = this.myform;
    this.kafkaCreateReq = {
      serviceName: dto.get('serviceName').value,
      version: dto.get('version').value,
      description: dto.get('description').value,
      ram: dto.get('ram').value,
      cpu: dto.get('vCpu').value,
      servicePackCode: this.servicePackCode,
      storage: dto.get('storage').value,
      brokers: dto.get('broker').value,
      usageTime: dto.get('usageTime').value,
      configType: dto.get('configType').value,
      numPartitions: dto.get('numPartitions').value,
      defaultReplicationFactor: dto.get('defaultReplicationFactor').value,
      minInsyncReplicas: dto.get('minInsyncReplicas').value,
      offsetTopicReplicationFactor: dto.get('offsetTopicReplicationFactor').value,
      logRetentionHours: dto.get('logRetentionHours').value,
      logSegmentBytes: dto.get('logSegmentBytes').value,
    }

    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.createKafkaService(this.kafkaCreateReq)
        .pipe(
          finalize(() => this.loadingSrv.close())
        )
        .subscribe(
          (data) => {
            if (data && data.code == 200) {
              this.notification.success('Thành công', data.msg);
              // navigate
              this.navigateToList();
            } else {
              this.notification.error('Thất bại', data.msg);
            }
          }
        );

  }

  onChangeDefaultReplicationFactor() {
    const replicationFactor = this.myform.controls['defaultReplicationFactor'];
    const minInsync = this.myform.controls['minInsyncReplicas'];
    if (replicationFactor.value != null && minInsync.value != null) {
      if (minInsync.value > replicationFactor.value) {
        replicationFactor.setErrors({'invalidvalue': true})
      } else {
        if (minInsync.hasError('invalidvalue')) {
          minInsync.setErrors(null);
        }
      }
    }
  }

  onChangeReplicationFactorAndMinInsync() {
    const replicationFactor = this.myform.controls['defaultReplicationFactor'];
    const minInsync = this.myform.controls['minInsyncReplicas'];
    if (replicationFactor.value != null && minInsync.value != null) {
      if (minInsync.value > replicationFactor.value) {
        minInsync.setErrors({'invalidvalue': true})
      } else {
        if (replicationFactor.hasError('invalidvalue')) {
          replicationFactor.setErrors(null);
        }
      }
    }
  }
  
  handleChoosePack(item: OfferKafka) {
    this.chooseitem = item;
    this.myform.get('vCpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('storage').setValue(item.storage);
    this.myform.get('broker').setValue(item.broker);
    this.ram = item.ram;
    this.cpu = item.cpu;
    this.storage = item.storage;
  }

  clicktab(){    
    this.chooseitem = null;
  }

  onCancelCreate() {
    this.isVisibleCancle = true;
  }

  handleCancelPopup() {
    this.isVisibleCancle = false;
  }

  handleOkCancle() {
    this.isVisibleCancle = false;
    this.navigateToList()
  }
  
  navigateToList() {
    this.router.navigate(['/app-kafka']);
  }

  isNumber(event) {
    const reg = new RegExp('^[0-9]+$');
    const input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  onChangeConfig(event: number) {
    if (event == 1) {
      this.showCustomConfig = true;
      this.addValidateForAdvancedConfig();
    } else {
      this.showCustomConfig = false;
      this.removeValidateOfAdvancedConfig();
    }
  }

  addValidateForAdvancedConfig() {
    this.myform.controls['numPartitions'].setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    this.myform.controls['defaultReplicationFactor'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['minInsyncReplicas'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['offsetTopicReplicationFactor'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['logRetentionHours'].setValidators([Validators.required, Validators.min(-1), Validators.max(2147483647)]);
    this.myform.controls['logSegmentBytes'].setValidators([Validators.required, Validators.min(1), Validators.max(10737418240)]);

    this.updateValueAndValidConfig();
  }

  removeValidateOfAdvancedConfig() {
    this.myform.controls['numPartitions'].clearValidators();
    this.myform.controls['defaultReplicationFactor'].clearValidators();
    this.myform.controls['minInsyncReplicas'].clearValidators();
    this.myform.controls['offsetTopicReplicationFactor'].clearValidators();
    this.myform.controls['logRetentionHours'].clearValidators();
    this.myform.controls['logSegmentBytes'].clearValidators();

    this.updateValueAndValidConfig();
  }

  updateValueAndValidConfig() {
    this.myform.controls['numPartitions'].updateValueAndValidity();
    this.myform.controls['defaultReplicationFactor'].updateValueAndValidity();
    this.myform.controls['minInsyncReplicas'].updateValueAndValidity();
    this.myform.controls['offsetTopicReplicationFactor'].updateValueAndValidity();
    this.myform.controls['logRetentionHours'].updateValueAndValidity();
    this.myform.controls['logSegmentBytes'].updateValueAndValidity();
  }

  onChangeUsageTime() {
    this.usageTime = this.myform.controls.usageTime.value;
    this.setExpiryDate();
  }

  setExpiryDate() {
    // const d = new Date();
    // d.setMonth(this.createDate.getMonth() + this.usageTime);
    // this.expiryDate = new Date(d.getTime());
    
    this.expiryDate = new Date(this.createDate.getTime() + (this.usageTime * 30 * 24 * 60 * 60 * 1000));
  }

}
