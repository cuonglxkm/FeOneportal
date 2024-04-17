import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaUpgradeReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-upgrade-kafka',
  templateUrl: './upgrade-kafka.component.html',
  styleUrls: ['./upgrade-kafka.component.css'],
})
export class UpgradeKafkaComponent implements OnInit {

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
  servicePackCode: string;
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  usageTime = 1;
  itemDetail: KafkaDetail;
  serviceOrderCode: string;
  createDate: Date;
  expiryDate: Date;
  kafkaUpgradeDto: KafkaUpgradeReq;
  ram: number;
  cpu: number;
  storage: number;
  pricePerRam = 200000;
  pricePerCpu = 100000;
  pricePerStorage = 150000;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      if (this.serviceOrderCode) {
        this.getDetail();
      }
    });

    this.getListPackage();
    this.initForm();
  }

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
            this.createDate = new Date(this.itemDetail.createdDate);
            this.setExpiryDate();
            this.updateDataForm();
            this.ram = this.itemDetail.ram;
            this.cpu = this.itemDetail.cpu;
            this.storage = this.itemDetail.storage;
            // phát sự kiện để render lại 
            this.cdr.markForCheck();
          } else {
            this.notification.error('Thất bại', res.msg);
          }
        }
      )
  }

  initForm() {
    this.myform = this.fb.group({
      vCpu: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      ram: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(1024), Validators.pattern("^[0-9]*$")]],
      broker: [3, [Validators.required]],
      usageTime: [1, [Validators.required, Validators.pattern("^[0-9]*$")]]
    });
  }

  updateDataForm() {
    this.myform.controls.vCpu.setValue(this.itemDetail.cpu);
    this.myform.controls.ram.setValue(this.itemDetail.ram);
    this.myform.controls.storage.setValue(this.itemDetail.storage);
    this.myform.controls.broker.disable();
    // this.myform.controls.storage.setValidators([Validators.minLength(this.itemDetail.storage)]);

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

  backToList() {
    this.router.navigate(['/app-kafka']);
  }

  handleChoosePack(item: ServicePack) {
    this.chooseitem = item;
    this.servicePackCode = item.servicePackCode;
    this.myform.get('vCpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('storage').setValue(item.storage);
    this.myform.get('broker').setValue(item.broker);
  }

  clicktab() {
    this.chooseitem = null;
  }

  onChangeUsageTime() {
    this.usageTime = this.myform.controls.usageTime.value;
    this.setExpiryDate();
  }

  setExpiryDate() {
    this.expiryDate = new Date(this.createDate.getTime() + (this.usageTime * 30 * 24 * 60 * 60 * 1000));
  }

  onSubmitPayment() {
    // handle payment
    const kafka = this.myform.getRawValue();
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    kafka.newOfferId = 286;
    kafka.serviceName = this.itemDetail.serviceName;
    kafka.serviceOrderCode = this.itemDetail.serviceOrderCode;

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = 600000;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAFKA_UPGRADE_TYPE;
    orderItem.specification = JSON.stringify(kafka);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
    // this.upgrade();
  }

  upgrade() {
    const dto = this.myform;
    this.kafkaUpgradeDto.serviceName = this.itemDetail.serviceName;
    this.kafkaUpgradeDto.serviceOrderCode = this.itemDetail.serviceOrderCode;
    this.kafkaUpgradeDto.version = this.itemDetail.version;
    this.kafkaUpgradeDto.description = this.itemDetail.description;
    this.kafkaUpgradeDto.servicePackCode = this.servicePackCode;
    this.kafkaUpgradeDto.cpu = dto.get('vCpu').value;
    this.kafkaUpgradeDto.ram = dto.get('ram').value;
    this.kafkaUpgradeDto.storage = dto.get('storage').value;
    this.kafkaUpgradeDto.servicePackCode = this.servicePackCode;
    this.kafkaUpgradeDto.usageTime = this.usageTime;

    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.upgrade(this.kafkaUpgradeDto)
      .pipe(
        finalize(() => this.loadingSrv.close())
      )
      .subscribe(
        (data) => {
          if (data && data.code == 200) {
            this.notification.success('Thành công', data.msg);
            // navigate
            this.backToList();
          } else {
            this.notification.error('Thất bại', data.msg);
          }
        }
      );
  }


}
