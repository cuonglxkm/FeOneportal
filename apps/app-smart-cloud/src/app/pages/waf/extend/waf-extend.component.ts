import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, finalize } from 'rxjs';
import {
  ObjectStorage,
  ObjectStorageExtend,
} from 'src/app/shared/models/object-storage.model';
import {
  DataPayment,
  ItemPayment,
  Order,
  OrderItem,
} from '../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { OrderItemObject } from 'src/app/shared/models/price';
import { OrderService } from 'src/app/shared/services/order.service';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { WafService } from 'src/app/shared/services/waf.service';
import { WafDetailDTO, WAFExtend } from '../waf.model';

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
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: WafService,
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
    // this.getTotalAmount();
    this.cdr.detectChanges();
  }

  objectStorage: ObjectStorage = new ObjectStorage();


  invalid: boolean = false;
  onChangeTime(value) {
    if (value.length == 0) {
      this.invalid = true;
      this.totalAmount = 0;
      this.totalincludesVAT = 0;
      this.orderObject = null;
    } else {
      this.invalid = false;
      this.numberMonth = value;
      // this.getTotalAmount();
    }
  }


  WAFExtend: WAFExtend = new WAFExtend();
  WAFDetail: WafDetailDTO = new WafDetailDTO();

  getWAFById(id) {
    this.service
      .getDetail(id)
      .subscribe(
        (data) => {
          this.WAFDetail = data;
        },
        (error) => {
          this.WAFDetail = null;
        }
      );
  }
  initobjectStorageExtend() {
    this.WAFExtend.newExpireDate = this.newExpiredDate;
    this.WAFExtend.customerId = this.tokenService.get()?.userId;
    this.WAFExtend.userEmail = this.tokenService.get()?.email;
    this.WAFExtend.actorEmail = this.tokenService.get()?.email;
    this.WAFExtend.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.UserObjectStorageExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.WAFExtend.serviceType = 13;
    this.WAFExtend.actionType = 3;
    this.WAFExtend.serviceInstanceId = this.id;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  // getTotalAmount() {
  //   this.initobjectStorageExtend();
  //   let itemPayment: ItemPayment = new ItemPayment();
  //   itemPayment.orderItemQuantity = 1;
  //   itemPayment.specificationString = JSON.stringify(this.objectStorageExtend);
  //   itemPayment.specificationType = 'objectstorage_extend';
  //   itemPayment.serviceDuration = this.numberMonth;
  //   itemPayment.sortItem = 0;
  //   let dataPayment: DataPayment = new DataPayment();
  //   dataPayment.orderItems = [itemPayment];
  //   this.service.getTotalAmount(dataPayment).subscribe((result) => {
  //     console.log('thanh tien', result);
  //     this.newExpiredDate = result.data.orderItemPrices[0].expiredDate;
  //     this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
  //     this.totalincludesVAT = Number.parseFloat(
  //       result.data.totalPayment.amount
  //     );
  //     this.orderObject = result.data;
  //     this.cdr.detectChanges();
  //   });
  // }

  // order: Order = new Order();
  // orderItem: OrderItem[] = [];
  // extend() {
  //   this.orderItem = [];
  //   this.initobjectStorageExtend();
  //   let specification = JSON.stringify(this.objectStorageExtend);
  //   let orderItemOS = new OrderItem();
  //   orderItemOS.orderItemQuantity = 1;
  //   orderItemOS.specification = specification;
  //   orderItemOS.specificationType = 'objectstorage_extend';
  //   orderItemOS.price = this.totalAmount;
  //   orderItemOS.serviceDuration = this.numberMonth;
  //   this.orderItem.push(orderItemOS);

  //   this.order.customerId = this.tokenService.get()?.userId;
  //   this.order.createdByUserId = this.tokenService.get()?.userId;
  //   this.order.note = 'Gia hạn object storage';
  //   this.order.orderItems = this.orderItem;
  //   this.orderService.validaterOrder(this.order).subscribe({
  //     next: (data) => {
  //       if (data.success) {
  //         var returnPath: string = window.location.pathname;
  //         this.router.navigate(['/app-smart-cloud/order/cart'], {
  //           state: { data: this.order, path: returnPath },
  //         });
  //       } else {
  //         this.isVisiblePopupError = true;
  //         this.errorList = data.data;
  //       }
  //     },
  //     error: (e) => {
  //       this.notification.error(
  //         this.i18n.fanyi('app.status.fail'),
  //         e.error.detail
  //       );
  //     },
  //   });
  // }
}
