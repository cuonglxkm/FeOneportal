import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ObjectStorage
} from 'src/app/shared/models/object-storage.model';
import { OrderItemObject } from 'src/app/shared/models/price';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { WafService } from 'src/app/shared/services/waf.service';
import { WafDetailDTO, WAFExtend } from '../waf.model';
import { DataPayment, ItemPayment, OfferItem, Order, OrderItem } from '../../instances/instances.model';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';

@Component({
  selector: 'one-portal-waf-extend',
  templateUrl: './waf-extend.component.html',
  styleUrls: ['./waf-extend.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WAFExtendComponent implements OnInit {
  id: any;
  issuedDate: Date = new Date();
  numberMonth: number = 1;
  newExpiredDate: string;
  valueStringConfiguration: string;
  orderObject: OrderItemObject = new OrderItemObject();
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  domains: string[] = []
  ipPublics: string[] = []
  isLoading: boolean = false;
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: WafService,
    private totalService: ObjectStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    private configurationsService: ConfigurationsService
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getWAFById(this.id);
    this.getTotalAmount();
    this.cdr.detectChanges();
  }

  objectStorage: ObjectStorage = new ObjectStorage();
  offerItem: OfferItem = new OfferItem();


  invalid: boolean = false;
  onChangeTime(value) {
    console.log(value);
    
    if (value == 0 || value == undefined) {
      this.invalid = true;
      this.totalAmount = 0;
      this.totalincludesVAT = 0;
      this.orderObject = null;
    } else {
      this.invalid = false;
      this.numberMonth = value;
      this.getTotalAmount();
    }
  }


  WAFExtend: WAFExtend = new WAFExtend();
  WAFDetail: WafDetailDTO = new WafDetailDTO();

  isLastDomain(domain: string): boolean {
    return this.domains.indexOf(domain) === this.domains.length - 1;
  }

  getWAFById(id) {
    this.isLoading = true
    this.service
      .getDetail(id)
      .subscribe(
        (data) => {
          this.isLoading = false
          this.WAFDetail = data;
          this.getOfferById(data.offerId)
          if (data?.wafDomains !== null) {
            this.domains = data.wafDomains
              .sort((a, b) => a.id - b.id)
              .map((item) => item.domain);
            this.ipPublics = data.wafDomains
              .sort((a, b) => a.id - b.id)
              .map((item) => item.ipPublic);
          }
        },
        (error) => {
          this.isLoading = false
          this.WAFDetail = null;
          if(error.status == 500){
            this.router.navigate(['/app-smart-cloud/waf']);
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            'Bản ghi không tồn tại'
          );
          }
        }
      );
  }


  getOfferById(id) {
    this.service
      .getOffersById(id)
      .subscribe(
        (data) => {
          this.offerItem = data;
          this.offerItem.description = '';
          this.offerItem.characteristicValues.forEach((ch) => {
            if (ch.charName == 'Domain') {
              this.offerItem.description += `${ch.charOptionValues} Domain`;
            }
          });
          this.offerItem.characteristicValues.forEach((ch) => {
             if(ch.charName == 'DDOS' && ch.charOptionValues[0] == 'true'){
              this.offerItem.description += `<br/>Có chống tấn công DDOS`
            }else if(ch.charName == 'WAF' && ch.charOptionValues[0] == 'true'){
              this.offerItem.description += `<br/>Có tường lửa (WAF) chặn tấn công Top 10 OWASP`
             }else if(ch.charName == 'IP/GeoBlock' && ch.charOptionValues[0] == 'true'){
              this.offerItem.description += `<br/>Có giới hạn truy cập theo IP, dải IP...`
             }else if(ch.charName == 'UsageTraffic'){
              this.offerItem.description += `<br/>${ch.charOptionValues} GB Lưu lượng sử dụng`
             }
          });
        },
        (error) => {
          this.offerItem = null;
        }
      );
  }
  initWAFExtend() {
    this.WAFExtend.newExpireDate = this.newExpiredDate;
    this.WAFExtend.customerId = this.tokenService.get()?.userId;
    this.WAFExtend.userEmail = this.tokenService.get()?.email;
    this.WAFExtend.actorEmail = this.tokenService.get()?.email;
    this.WAFExtend.serviceName = this.WAFDetail.name;
    this.WAFExtend.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.GenericExtendSpecificaton,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.WAFExtend.serviceType = ServiceType.WAF;
    this.WAFExtend.actionType = ServiceActionType.EXTEND;
    this.WAFExtend.serviceInstanceId = this.id;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.initWAFExtend();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.WAFExtend);
    itemPayment.specificationType = 'waf_extend';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.totalService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.newExpiredDate = result.data.orderItemPrices[0].expiredDate;
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.orderObject = result.data;
      this.cdr.detectChanges();
    });
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  extend() {
    this.orderItem = [];
    this.initWAFExtend();
    let specification = JSON.stringify(this.WAFExtend);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'waf_extend';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Gia hạn WAF';
    this.order.orderItems = this.orderItem;
    this.orderService.validaterOrder(this.order).subscribe({
      next: (data) => {
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: this.order, path: returnPath },
          });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          e.error.detail
        );
      },
    });
  }
}
