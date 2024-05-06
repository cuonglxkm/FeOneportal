import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { addDays } from 'date-fns';
import { Subject, debounceTime } from 'rxjs';
import {
  ObjectStorageCreate,
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

@Component({
  selector: 'one-portal-object-storage-extend',
  templateUrl: './object-storage-extend.component.html',
  styleUrls: ['../object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageExtendComponent implements OnInit {
  issuedDate: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.issuedDate, 30);
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: ObjectStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getTotalAmount();
  }

  onChangeTime() {
    let lastDate = new Date();
    lastDate.setDate(this.issuedDate.getDate() + this.numberMonth * 30);
    this.expiredDate = lastDate;
  }

  objectStorageExtend: ObjectStorageExtend = new ObjectStorageExtend();
  initobjectStorageExtend() {
    this.objectStorageExtend.newExpireDate = this.expiredDate
      .toISOString()
      .substring(0, 19);
    this.objectStorageExtend.customerId = this.tokenService.get()?.userId;
    this.objectStorageExtend.userEmail = this.tokenService.get()?.email;
    this.objectStorageExtend.actorEmail = this.tokenService.get()?.email;
    this.objectStorageExtend.projectId = 0;
    this.objectStorageExtend.regionId = 0;
    this.objectStorageExtend.serviceType = 13;
    this.objectStorageExtend.actionType = 0;
    this.objectStorageExtend.serviceInstanceId = 0;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  dataSubject: Subject<any> = new Subject<any>();
  changeTotalAmount(value: number) {
    this.dataSubject.next(value);
  }
  getTotalAmount() {
    this.dataSubject
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.initobjectStorageExtend();
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(
          this.objectStorageCreate
        );
        itemPayment.specificationType = 'objectstorage_extend';
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
      });
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  extend() {
    this.initobjectStorageExtend();
    let specification = JSON.stringify(this.objectStorageExtend);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_extend';
    orderItemOS.price = this.totalAmount / this.numberMonth;
    orderItemOS.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Gia hạn object storage';
    this.order.orderItems = this.orderItem;

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }
}
