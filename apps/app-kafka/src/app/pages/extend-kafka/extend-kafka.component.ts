import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { camelizeKeys } from 'humps';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaExtend } from 'src/app/core/models/kafka-create-req.model';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { KafkaService } from 'src/app/services/kafka.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from 'src/app/core/i18n/i18n.service';

@Component({
  selector: 'one-portal-extend-kafka',
  templateUrl: './extend-kafka.component.html',
  styleUrls: ['./extend-kafka.component.css'],
})
export class ExtendKafkaComponent implements OnInit {

  itemDetail: KafkaDetail;
  serviceOrderCode: string;

  regionId: number;
  projectId: number;

  extendAmount = 0;
  currentDate: Date;
  createDate: Date;
  expiryDate: Date;
  startExpiryDate: Date;
  expectExpiryDate: Date;
  duration = 0;
  statusInput: NzStatus = null;
  msgError = '';
  errMin = 'Nhập số tháng tối thiểu là 1';
  errMax = 'Nhập số tháng tối đa là 100';
  unitPrice = {
    ram: 240000,
    cpu: 105000,
    storage: 8500
  }

  constructor(
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
  }

  ngOnInit(): void {
    const regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getUnitPrice();

    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      if (this.serviceOrderCode) {
        this.getDetail();
      }
    });

    if (localStorage.getItem('locale') == AppConstants.LOCALE_EN) {
      this.changeLangData();
    }

  }

  changeLangData() {
    this.errMin = 'The minimum number of months is 1';
    this.errMax = 'The maximum number of months is 100';
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

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
            this.currentDate = new Date();
            this.createDate = new Date(this.itemDetail.createdDate);
            this.expiryDate = this.startExpiryDate = new Date(this.itemDetail.expiryDate);
            this.startExpiryDate.setDate(this.expiryDate.getDate() + 1);
            this.setExpectExpiryDate();
          } else {
            this.notification.error('Thất bại', res.msg);
          }
        }
      )
  }

  backToList() {
    this.router.navigate(['/app-kafka']);
  }

  onChangeDuration() {
    if (this.duration < 1) {
      this.statusInput = 'error';
      this.msgError = this.errMin;
    } else if (this.duration > 100) {
      this.statusInput = 'error';
      this.msgError = this.errMax;
    } else {
      this.statusInput = null;
      this.msgError = '';
    }
    this.setExpectExpiryDate();
    this.setExtendAmount();
  }

  setExtendAmount() {
    this.extendAmount = (this.unitPrice.cpu * this.itemDetail.cpu + this.unitPrice.ram * this.itemDetail.ram + this.unitPrice.storage * this.itemDetail.storage) * this.duration;
  }

  setExpectExpiryDate() {
    const d = new Date(this.itemDetail.expiryDate)
    d.setDate(d.getDate() + 1);
    d.setMonth(d.getMonth() + this.duration);
    this.expectExpiryDate = new Date(d.getTime());
  }

  kafkaExtendObj: KafkaExtend = new KafkaExtend();
  initkafkaExtend() {
    this.kafkaExtendObj.serviceOrderCode = this.itemDetail.serviceOrderCode;
    this.kafkaExtendObj.serviceName = this.itemDetail.serviceName;
    this.kafkaExtendObj.newExpireDate = this.expectExpiryDate
      .toISOString()
      .substring(0, 19);
    this.kafkaExtendObj.customerId = this.tokenService.get()?.userId;
    this.kafkaExtendObj.userEmail = this.tokenService.get()?.email;
    this.kafkaExtendObj.actorEmail = this.tokenService.get()?.email;
    this.kafkaExtendObj.vpcId = this.projectId;
    this.kafkaExtendObj.regionId = this.regionId;
    this.kafkaExtendObj.serviceType = AppConstants.KAFKA_TYPE_ID;
    this.kafkaExtendObj.actionType = 0;
    this.kafkaExtendObj.serviceInstanceId = 0;
  }

  onSubmitPayment() {
    this.initkafkaExtend();
    // handle payment
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    data.note = 'Gia hạn Kafka';

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = this.extendAmount;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAFKA_EXTEND_TYPE;
    orderItem.specification = JSON.stringify(this.kafkaExtendObj);
    orderItem.serviceDuration = this.duration;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
  }

}
