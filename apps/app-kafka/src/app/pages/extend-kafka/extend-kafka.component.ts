import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { camelizeKeys } from 'humps';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { KafkaService } from 'src/app/services/kafka.service';

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
  duration: number;
  statusInput: NzStatus = null;
  msgError = '';
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
    private _activatedRoute: ActivatedRoute
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
      this.msgError = 'Nhập số tháng tối thiểu là 1';
    } else if (this.duration > 100) {
      this.statusInput = 'error';
      this.msgError = 'Nhập số tháng tối đa là 100'
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

  onSubmitPayment() {
    // handle payment
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    const kafka = null;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = this.extendAmount;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAFKA_EXTEND_TYPE;
    orderItem.specification = JSON.stringify(kafka);
    orderItem.serviceDuration = this.duration;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
  }

}