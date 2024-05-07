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

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: ObjectStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.onChangeCapacity();
    this.onChangeTime();
  }

  dataSubjectTime: Subject<any> = new Subject<any>();
  changeTime(value: number) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime() {
    this.dataSubjectTime
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.numberMonth = res;
        if (res == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
          this.expiredDate = null;
        } else {
          let lastDate = new Date();
          lastDate.setDate(this.today.getDate() + this.numberMonth * 30);
          this.expiredDate = lastDate;
          this.totalincludesVAT * this.numberMonth;
          this.getTotalAmount();
        }
      });
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
  dataSubject: Subject<any> = new Subject<any>();
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

  getTotalAmount() {
    this.initObjectStorage();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.objectStorageCreate);
    itemPayment.specificationType = 'objectstorage_create';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.service.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.cdr.detectChanges();
    });
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  create() {
    this.initObjectStorage();
    let specification = JSON.stringify(this.objectStorageCreate);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_create';
    orderItemOS.price = this.totalAmount / this.numberMonth;
    orderItemOS.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo object storage';
    this.order.orderItems = this.orderItem;

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }
}
