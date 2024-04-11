import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaCreateReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaVersion } from 'src/app/core/models/kafka-version.model';
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

  chooseitem: ServicePack;

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
  ram = 1;
  cpu = 1;
  storage = 1;
  pricePerRam = 200000;
  pricePerCpu = 100000;
  pricePerStorage = 150000;

  regionId: number;
  projectId: number;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
  }

  ngOnInit(): void {
    this.getListPackage();
    this.getListVersion();
    this.initForm();
    this.createDate = new Date();
    this.setExpiryDate();
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      version: [null],
      description: [null, [Validators.maxLength(500)]],
      vCpu: [null, [Validators.required]],
      ram: [null, [Validators.required]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(1024)]],
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
    kafka.offerId = 229;
    kafka.regionId = this.regionId;
    kafka.projectId = this.projectId;
    kafka.vpcId = this.projectId;

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = (this.pricePerCpu * this.cpu + this.pricePerRam * this.ram + this.pricePerStorage * this.storage) * this.usageTime;
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

  onChangeReplicationFactorAndMinInsync() {
    console.log("");
  }
  
  handleChoosePack(item: ServicePack) {
    this.chooseitem = item;
    this.servicePackCode = item.servicePackCode;
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
    this.modalService.create({
      nzTitle: 'Xác nhận hủy tạo mới Kafka',
      nzContent: '<h3>Bạn có chắc chắn muốn ngừng tạo mới dịch vụ Kafka?'
        + '<br> <i>Lưu ý: Các thông tin đã nhập sẽ không được lưu lại.</i></h3>',
      nzBodyStyle: { textAlign: 'center' },
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: false,
      nzOnOk: () => this.navigateToList(),
      nzCancelText: 'Hủy'
    });
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
