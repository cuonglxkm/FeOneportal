import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaCreateReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaVersion } from 'src/app/core/models/kafka-version.model';
import { OfferKafka } from 'src/app/core/models/offer.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { ProjectModel } from 'src/app/core/models/project.model';
import { RegionModel } from 'src/app/core/models/region.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { KafkaService } from 'src/app/services/kafka.service';

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

  isVisibleCancle = false;
  listOfferKafka: OfferKafka[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
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
      vCpu: [0, [Validators.required]],
      ram: [0, [Validators.required]],
      storage: [0, [Validators.required, Validators.min(1), Validators.max(1024)]],
      broker: [3, [Validators.required]],
      usageTime: [1, [Validators.required]],
      configType: [0, [Validators.required]],
      numPartitions: [3],
      defaultReplicationFactor: [3],
      minInsyncReplicas: [2],
      offsetTopicReplicationFactor: [3],
      logRetentionHours: [168],
      logSegmentBytes: [1073741824]
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
              offerKafka[characteristic] = Number.parseInt(item.charOptionValues[0]);
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

  onChangeCpu(event: number) {
    this.cpu = event;  
  }

  onChangeRam(event: number) {
    this.ram = event;
  }

  onChangeStorage(event: number) {
    this.storage = event;
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

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.getListOffers();
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onSubmitPayment() {

    const kafka = this.myform.getRawValue();
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    kafka.offerId = this.chooseitem != null ? this.chooseitem.id : 0;
    kafka.regionId = this.regionId;
    kafka.projectId = this.projectId;
    kafka.vpcId = this.projectId;
    kafka.offerName = this.chooseitem != null ? this.chooseitem.offerName : '';

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = (this.unitPrice.cpu * this.cpu + this.unitPrice.ram * this.ram + this.unitPrice.storage * this.storage) * this.usageTime;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAKFA_CREATE_TYPE;
    orderItem.specification = JSON.stringify(kafka);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
    // this.createKafkaService();
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
        minInsync.setErrors(null)
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
        replicationFactor.setErrors(null)
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
    const d = new Date();
    d.setMonth(this.createDate.getMonth() + this.usageTime);
    this.expiryDate = new Date(d.getTime());
  }

}
