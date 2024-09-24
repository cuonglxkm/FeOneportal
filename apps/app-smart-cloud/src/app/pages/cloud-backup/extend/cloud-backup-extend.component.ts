import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ObjectStorage
} from 'src/app/shared/models/object-storage.model';
import { OrderItemObject } from 'src/app/shared/models/price';
import { OrderService } from 'src/app/shared/services/order.service';
import { DataPayment, ItemPayment, OfferItem, Order, OrderItem } from '../../instances/instances.model';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { CloudBackup, CloudBackupExtend } from '../cloud-backup.model';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';
import { ServiceActionType } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-cloud-backup-extend',
  templateUrl: './cloud-backup-extend.component.html',
  styleUrls: ['./cloud-backup-extend.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloudBackupExtendComponent implements OnInit {
  id: any;
  issuedDate: Date = new Date();
  numberMonth: number = 1;
  newExpiredDate: string;
  valueStringConfiguration: string;
  orderObject: OrderItemObject = new OrderItemObject();
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  isLoading: boolean = false;
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: CloudBackupService,
    private totalService: ObjectStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getCloudBackupById(this.id);
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


  CloudBackupExtend: CloudBackupExtend = new CloudBackupExtend();
  CloudBackupDetail: CloudBackup = new CloudBackup();


  getCloudBackupById(id) {
    this.isLoading = true
    this.service
      .getCloudBackupById(id)
      .subscribe({
        next: (data) => {
          if (data == undefined || data == null) {
            this.router.navigate(['/app-smart-cloud/cloud-backup']);
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
          }
          this.isLoading = false
          this.CloudBackupDetail = data;
        },
        error: (error) => {
          this.isLoading = false
          this.CloudBackupDetail = null;
          if(error.status == 500){
            this.router.navigate(['/app-smart-cloud/cloud-backup']);
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
          }
        }
      });
  }


  getOfferById(id) {
    this.service
      .getOfferById(id)
      .subscribe({
        next: (data) => {
          this.offerItem = data;
          this.offerItem.description = '';
        },
        error: (error) => {
          this.offerItem = null;
        }
      });
  }
  initCloudBackupExtend() {
    this.CloudBackupExtend.newExpireDate = this.newExpiredDate;
    this.CloudBackupExtend.customerId = this.tokenService.get()?.userId;
    this.CloudBackupExtend.userEmail = this.tokenService.get()?.email;
    this.CloudBackupExtend.actorEmail = this.tokenService.get()?.email;
    this.CloudBackupExtend.serviceName = this.CloudBackupDetail.name;
    //this.CloudBackupExtend.serviceType = ServiceType.CloudBackup;
    this.CloudBackupExtend.actionType = ServiceActionType.EXTEND;
    this.CloudBackupExtend.serviceInstanceId = this.id;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.initCloudBackupExtend();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.CloudBackupExtend);
    itemPayment.specificationType = 'cloud_backup_extend';
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
  orderItems: OrderItem[] = [];
  extend() {
    this.orderItems = [];
    this.initCloudBackupExtend();
    let specification = JSON.stringify(this.CloudBackupExtend);
    let orderItem = new OrderItem();
    orderItem.orderItemQuantity = 1;
    orderItem.specification = specification;
    orderItem.specificationType = 'cloud_backup_extend';
    orderItem.price = this.totalAmount;
    orderItem.serviceDuration = this.numberMonth;
    this.orderItems.push(orderItem);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Gia hạn CloudBackup';
    this.order.orderItems = this.orderItems;
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
