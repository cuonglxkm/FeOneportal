import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { KafkaCreateReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaVersion } from 'src/app/core/models/kafka-version.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  selector: 'one-portal-create-kafka',
  templateUrl: './create-kafka.component.html',
  styleUrls: ['./create-kafka.component.css'],
})
export class CreateKafkaComponent implements OnInit {

  myform: FormGroup;

  carouselItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  chooseitem: ServicePack;
  effect = 'scrollx';

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 3, lg: 3, all: 0 },
    slide: 3,
    speed: 250,
    point: {
      visible: true
    },
    load: 2,
    velocity: 0,
    touch: true,
  }

  listOfServicePack: ServicePack[] = [
    {
      servicePackCode: 'small',
      servicePackName: 'Small',
      price: 360172,
      unit: 'đ/tháng',
      broker: 3,
      vCpu: 2,
      ram: 2,
      storage: 2
    },
    {
      servicePackCode: 'medium',
      servicePackName: 'Medium',
      price: 720344,
      unit: 'đ/tháng',
      broker: 3,
      vCpu: 2,
      ram: 8,
      storage: 15
    },
    {
      servicePackCode: 'large',
      servicePackName: 'Large',
      price: 1440688,
      unit: 'đ/tháng',
      broker: 3,
      vCpu: 4,
      ram: 16,
      storage: 15
    },
    {
      servicePackCode: 'xLarge',
      servicePackName: 'XLarge',
      price: 2881376,
      unit: 'đ/tháng',
      broker: 3,
      vCpu: 8,
      ram: 32,
      storage: 15
    }
  ];

  listOfKafkaVersion: KafkaVersion[] = [
    {
      apacheKafkaVersion: '3.7.0',
      helmChartVersion: '2.0.0'
    }
  ]

  showCustomConfig = false;

  kafkaCreateReq: KafkaCreateReq = new KafkaCreateReq();
  servicePackCode: string;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
  ) {
  }

  ngOnInit(): void {
    this.myform = this.fb.group({
      kafkaName: [null,
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

  onSubmitPayment() {
    this.createKafkaService();
  }

  createKafkaService() {
    const dto = this.myform;
    this.kafkaCreateReq.serviceName = dto.get('kafkaName').value;
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
    this.myform.get('vCpu').setValue(item.vCpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('storage').setValue(item.storage);
    this.myform.get('broker').setValue(item.broker);
  }

  clicktab(){
    console.log("click tabs");
    
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
