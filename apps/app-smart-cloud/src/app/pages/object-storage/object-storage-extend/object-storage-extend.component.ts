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

@Component({
  selector: 'one-portal-object-storage-extend',
  templateUrl: './object-storage-extend.component.html',
  styleUrls: ['../object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageExtendComponent implements OnInit {
  id: any;
  issuedDate: Date = new Date();
  numberMonth: number = 1;
  newExpiredDate: string;
  valueStringConfiguration: string;
  minStorage: number;
  maxStorage: number;
  stepStorage: number;
  orderObject: OrderItemObject = new OrderItemObject();
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  region = JSON.parse(localStorage.getItem('regionId'));
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: ObjectStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    private configurationsService: ConfigurationsService
  ) {}
  url = window.location.pathname;
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    if (!this.url.includes('advance')) {
      if(Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL
      }else{
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    this.getObjectStorage();
    this.getTotalAmount();
    this.cdr.detectChanges();
  }

  objectStorage: ObjectStorage = new ObjectStorage();
  getObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .getObjectStorage(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          this.objectStorage = data;
          this.id = this.objectStorage.id;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.error.message,
            this.i18n.fanyi('app.notification.object.storage.fail')
          );
          this.navigateToBucketList();
        },
      });
  }

  invalid: boolean = false;
  onChangeTime(value) {
    if (value == undefined) {
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

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  objectStorageExtend: ObjectStorageExtend = new ObjectStorageExtend();
  initobjectStorageExtend() {
    this.objectStorageExtend.newExpireDate = this.newExpiredDate;
    this.objectStorageExtend.customerId = this.tokenService.get()?.userId;
    this.objectStorageExtend.userEmail = this.tokenService.get()?.email;
    this.objectStorageExtend.actorEmail = this.tokenService.get()?.email;
    this.objectStorageExtend.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.UserObjectStorageExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.objectStorageExtend.regionId = this.region;
    this.objectStorageExtend.serviceType = 13;
    this.objectStorageExtend.actionType = 3;
    this.objectStorageExtend.serviceInstanceId = this.id;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.initobjectStorageExtend();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.objectStorageExtend);
    itemPayment.specificationType = 'objectstorage_extend';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.service.getTotalAmount(dataPayment).subscribe((result) => {
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
    this.initobjectStorageExtend();
    let specification = JSON.stringify(this.objectStorageExtend);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_extend';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Gia hạn object storage';
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

  getConfigurations() {
    this.configurationsService
      .getConfigurations('BLOCKSTORAGE')
      .subscribe((data) => {
        this.valueStringConfiguration = data.valueString;
        const arr = this.valueStringConfiguration.split('#');
        this.minStorage = Number.parseInt(arr[0]);
        this.stepStorage = Number.parseInt(arr[1]);
      });
  }

  navigateToBucketList(){
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }
}
