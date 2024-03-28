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

  kafkaCreateReq: KafkaCreateReq = new KafkaCreateReq();
  servicePackCode: string;
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  usageTime = 1;

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
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      version: [null],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      vCpu: [null, [Validators.required]],
      ram: [null, [Validators.required]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(1024)]],
      broker: [3, [Validators.required]],
      configType: [0, [Validators.required]],
      numPartitions: [3],
      defaultReplicationFactor: [3],
      minInsyncReplicas: [2],
      offsetTopicReplicationFactor: [3],
      logRetentionHours: [168],
      logSegmentBytes: [1073741824]
    });
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

  onSubmitPayment() {

    const kafka = this.myform.value;
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    kafka.offerId = 229;

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = 100000;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAKFA_CREATE_TYPE;
    orderItem.specification = JSON.stringify(kafka);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    // this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
    this.createKafkaService();
  }

  createKafkaService() {
    const dto = this.myform;
    this.kafkaCreateReq.serviceName = dto.get('serviceName').value;
    this.kafkaCreateReq.version = dto.get('version').value;
    this.kafkaCreateReq.description = dto.get('description').value;
    this.kafkaCreateReq.servicePackCode = this.servicePackCode;
    this.kafkaCreateReq.cpu = dto.get('vCpu').value;
    this.kafkaCreateReq.ram = dto.get('ram').value;
    this.kafkaCreateReq.storage = dto.get('storage').value;
    this.kafkaCreateReq.brokers = dto.get('broker').value;
    this.kafkaCreateReq.configType = dto.get('configType').value;
    this.kafkaCreateReq.numPartitions = dto.get('numPartitions').value;
    this.kafkaCreateReq.defaultReplicationFactor = dto.get('defaultReplicationFactor').value;
    this.kafkaCreateReq.minInsyncReplicas = dto.get('minInsyncReplicas').value;
    this.kafkaCreateReq.offsetTopicReplicationFactor = dto.get('offsetTopicReplicationFactor').value;
    this.kafkaCreateReq.logRetentionHours = dto.get('logRetentionHours').value;
    this.kafkaCreateReq.logSegmentBytes = dto.get('logSegmentBytes').value;

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
    this.myform.controls['num.partitions'].setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    this.myform.controls['default.replication.factor'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['min.insync.replicas'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['offset.topic.replication.factor'].setValidators([Validators.required, Validators.min(1), Validators.max(3)]);
    this.myform.controls['log.retention.hours'].setValidators([Validators.required, Validators.min(-1), Validators.max(2147483647)]);
    this.myform.controls['log.segment.bytes'].setValidators([Validators.required, Validators.min(1), Validators.max(10737418240)]);

    this.myform.controls['num.partitions'].updateValueAndValidity();
    this.myform.controls['default.replication.factor'].updateValueAndValidity();
    this.myform.controls['min.insync.replicas'].updateValueAndValidity();
    this.myform.controls['offset.topic.replication.factor'].updateValueAndValidity();
    this.myform.controls['log.retention.hours'].updateValueAndValidity();
    this.myform.controls['log.segment.bytes'].updateValueAndValidity();
  }

  removeValidateOfAdvancedConfig() {
    this.myform.controls['num.partitions'].clearValidators();
    this.myform.controls['default.replication.factor'].clearValidators();
    this.myform.controls['min.insync.replicas'].clearValidators();
    this.myform.controls['offset.topic.replication.factor'].clearValidators();
    this.myform.controls['log.retention.hours'].clearValidators();
    this.myform.controls['log.segment.bytes'].clearValidators();

    this.myform.controls['num.partitions'].updateValueAndValidity();
    this.myform.controls['default.replication.factor'].updateValueAndValidity();
    this.myform.controls['min.insync.replicas'].updateValueAndValidity();
    this.myform.controls['offset.topic.replication.factor'].updateValueAndValidity();
    this.myform.controls['log.retention.hours'].updateValueAndValidity();
    this.myform.controls['log.segment.bytes'].updateValueAndValidity();
  }

}
