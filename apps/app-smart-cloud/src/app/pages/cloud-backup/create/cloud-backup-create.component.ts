import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { NAME_REGEX, USERNAME_REGEX } from 'src/app/shared/constants/constants';
import { OrderItemObject } from 'src/app/shared/models/price';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { DataPayment, ItemPayment, OfferItem, Order, OrderItem } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { slider } from '../../../../../../../libs/common-utils/src';
import { PriceType } from 'src/app/core/models/enum';
import { LoadingService } from '@delon/abc/loading';
import { DecimalPipe } from '@angular/common';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';
import { CloudBackupCreate } from 'src/app/shared/models/cloud-backup-init';

@Component({
  selector: 'one-portal-cloud-backup-create',
  templateUrl: './cloud-backup-create.component.html',
  styleUrls: ['./cloud-backup-create.component.less'],
  animations: [slider]
})
export class CloudBackupCreateComponent implements OnInit {

  listOffers: OfferItem[] = [];
  today = new Date();
  expiredDate = new Date();
  numOfMonth: number;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;

  selectedOfferId: number = 0;
  priceType: number = 0;

  cloudBackupCreate = new CloudBackupCreate();
  totalincludesVAT: number = 0;

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    capacity: [1, Validators.required],
    description: [''],
    time: [1]
  });

  orderObject: OrderItemObject = new OrderItemObject();
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private service: ObjectStorageService,
    private cloudBackupService: CloudBackupService,
    private loadingSrv: LoadingService,
  ) {

  }
  ngOnInit() {
    this.form.controls.email.disable();
    this.getOffers();
    this.checkExistName();
    this.checkExistUsername();
  }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight' &&
        key !== 'Tab') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }
  // Hàm để định dạng số với dấu phẩy
  formatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  dataSubjectName: Subject<string> = new Subject<string>();
  dataSubjectUserame: Subject<string> = new Subject<string>();
  changeName(value: string) {
    this.dataSubjectName.next(value);
  }

  changeCapacity(value: number) {
    this.getTotalAmount();
  }

  isExistName: boolean = false;
  isExistUsername: boolean = false;
  checkExistName() {
    this.dataSubjectName
      .pipe(
        debounceTime(300)
      )
      .subscribe((res) => {
        this.cloudBackupService
          .checkExitName(res)
          .subscribe((data) => {
            this.isExistName = data;
          });
      });
  }
  checkExistUsername() {
    this.dataSubjectUserame
      .pipe(
        debounceTime(300)
      )
      .subscribe((res) => {
        this.cloudBackupService
          .checkExitUsername(res)
          .subscribe((data) => {
            this.isExistUsername = data;
          });
      });
  }

  initCloudBackup() {
    this.cloudBackupCreate.customerId = this.tokenService.get()?.userId;
    this.cloudBackupCreate.userEmail = this.tokenService.get()?.email;
    this.cloudBackupCreate.actorEmail = this.tokenService.get()?.email;
    this.cloudBackupCreate.actionType = 0; //create
    this.cloudBackupCreate.createDate = this.today;
    this.cloudBackupCreate.serviceName = this.form.controls.name.value;
    this.cloudBackupCreate.expireDate = this.expiredDate;
    this.cloudBackupCreate.offerId = this.selectedOfferId;
    this.cloudBackupCreate.offerPriceType = PriceType[this.priceType];
    this.cloudBackupCreate.isSendMail = true;
    this.cloudBackupCreate.name = this.form.controls.name.value;
    this.cloudBackupCreate.capacity = this.form.controls.capacity.value;
    this.cloudBackupCreate.description = this.form.controls.description.value;
  }
  isInvalid: boolean = false
  onChangeTime(numberMonth: number) {
    if (numberMonth === undefined) {
      this.isInvalid = true
    } else {
      this.isInvalid = false;
      this.numOfMonth = numberMonth;
      this.expiredDate = new Date(this.today);
      this.expiredDate.setDate(this.today.getDate() + numberMonth * 30);
      this.form.controls.time.setValue(numberMonth);
      this.getTotalAmount();
    }
  }

  getTotalAmount() {
    if (!this.selectedOfferId) {
      return;
    }
    this.initCloudBackup();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;//this.form.controls.capacity.value;
    itemPayment.specificationString = JSON.stringify(this.cloudBackupCreate);
    itemPayment.specificationType = 'cloud-backup_create';
    itemPayment.serviceDuration = this.form.controls.time.value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.service.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.orderObject = result.data;
      this.cdr.detectChanges();
    });
  }
  getOffers(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' })
    this.instancesService.getDetailProductByUniqueName('cloud-backup')
      .subscribe(
        data => {
          // this.instancesService
          //   .getListOffersByProductIdNoRegion(data[0].id)
          //   .subscribe((data: any) => {
          //     this.listOffers = data.filter(
          //       (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
          //     );
          //     this.selectedOfferId = this.listOffers[0].id;
          //     this.priceType = this.listOffers[0].price.priceType;
          //     this.getTotalAmount();
          //     this.loadingSrv.close()
          //   });
          this.loadingSrv.close()
        }
      );
  }

  orderItem: OrderItem[] = [];
  order: Order = new Order();
  handleSubmit() {
    this.orderItem = [];
    this.initCloudBackup();
    let specification = JSON.stringify(this.cloudBackupCreate);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;//this.form.controls.capacity.value;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'cloud_backup_create';
    orderItemOS.price = this.totalAmount;
    orderItemOS.priceType = this.priceType;
    orderItemOS.serviceDuration = this.form.controls.time.value;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo cloud backup';
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
