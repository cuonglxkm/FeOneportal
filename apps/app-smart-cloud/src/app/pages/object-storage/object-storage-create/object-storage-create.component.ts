import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { addDays } from 'date-fns';
import { ObjectStorageCreate } from 'src/app/shared/models/object-storage.model';
import {
  DataPayment,
  ItemPayment,
  Order,
  OrderItem,
} from '../../instances/instances.model';
import { Subject, debounceTime } from 'rxjs';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { OrderItemObject } from 'src/app/shared/models/price';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { OrderService } from 'src/app/shared/services/order.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-object-storage-create',
  templateUrl: './object-storage-create.component.html',
  styleUrls: ['../object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageCreateComponent implements OnInit {
  today: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.today, 30);
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();
  valueStringConfiguration: string;
  minStorage: number;
  maxStorage: number;
  stepStorage: number;
  unitPrice = 0;
  dataSubject: Subject<any> = new Subject<any>();
  timeSelected: any;
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: ObjectStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private configurationsService: ConfigurationsService,
    private fb: NonNullableFormBuilder,
    private orderService: OrderService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  ngOnInit(): void {
    this.dataSubject.next(1);
    this.onChangeCapacity();
    this.getConfigurations();
    this.getTotalAmount();
  }

  validateForm: FormGroup<{
    time: FormControl<number>;
  }> = this.fb.group({
    time: [1],
  });

  dataSubjectTime: Subject<any> = new Subject<any>();
  changeTime(value: number) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime(value) {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  initObjectStorage() {
    this.objectStorageCreate.customerId = this.tokenService.get()?.userId;
    this.objectStorageCreate.userEmail = this.tokenService.get()?.email;
    this.objectStorageCreate.actorEmail = this.tokenService.get()?.email;
    this.objectStorageCreate.projectId = 0;
    this.objectStorageCreate.regionId = 0;
    this.objectStorageCreate.serviceType = 13;
    this.objectStorageCreate.actionType = 0;
    this.objectStorageCreate.serviceInstanceId = 0;
    this.objectStorageCreate.createDate = this.today
      .toISOString()
      .substring(0, 19);
    this.objectStorageCreate.expireDate = this.expiredDate
      .toISOString()
      .substring(0, 19);
    this.objectStorageCreate.offerId = 0;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;

  changeCapacity(value: number) {
    this.dataSubject.next(value);
  }
  onChangeCapacity() {
    this.dataSubject
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getTotalAmount();
      });
  }

  orderObject: OrderItemObject = new OrderItemObject();
  orderItem: OrderItem[] = [];
  getTotalAmount() {
    this.initObjectStorage();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.objectStorageCreate);
    itemPayment.specificationType = 'objectstorage_create';
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
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

  order: Order = new Order();

  create() {
    this.orderItem = [];
    this.initObjectStorage();
    let specification = JSON.stringify(this.objectStorageCreate);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_create';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.validateForm.controls.time.value;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo object storage';
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
        this.maxStorage = Number.parseInt(arr[2]);
      });
  }
}
