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
import { Subject, debounceTime } from 'rxjs';
import {
  ObjectStorageCreate,
  ObjectStorageResize,
} from 'src/app/shared/models/object-storage.model';
import { DataPayment, ItemPayment, Order, OrderItem } from '../../instances/instances.model';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';

@Component({
  selector: 'one-portal-object-storage-edit',
  templateUrl: './object-storage-edit.component.html',
  styleUrls: ['./object-storage-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageEditComponent implements OnInit {
  today: Date = new Date();
  numberMonth: number = 1;
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();
  objectStorageResize: ObjectStorageResize = new ObjectStorageResize();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: ObjectStorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTotalAmount();
  }

  initObjectStorageResize() {
    this.objectStorageResize.newQuota = 0;
    this.objectStorageResize.customerId = this.tokenService.get()?.userId;
    this.objectStorageResize.userEmail = this.tokenService.get()?.email;
    this.objectStorageResize.actorEmail = this.tokenService.get()?.email;
    this.objectStorageResize.vpcId = 0;
    this.objectStorageResize.regionId = 0;
    this.objectStorageResize.serviceType = 13;
    this.objectStorageResize.actionType = 0;
    this.objectStorageResize.serviceInstanceId = 0;
    this.objectStorageResize.newOfferId = 0;
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
        this.initObjectStorageResize();
        let itemPayment: ItemPayment = new ItemPayment();
        itemPayment.orderItemQuantity = 1;
        itemPayment.specificationString = JSON.stringify(
          this.objectStorageCreate
        );
        itemPayment.specificationType = 'objectstorage_resize';
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
  update() {
    this.initObjectStorageResize();
    let specification = JSON.stringify(this.objectStorageResize);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_resize';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Điều chỉnh object storage';
    this.order.orderItems = this.orderItem;

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }
}
