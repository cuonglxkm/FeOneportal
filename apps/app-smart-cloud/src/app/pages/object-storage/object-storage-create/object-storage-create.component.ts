import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { addDays } from 'date-fns';
import { ObjectStorageCreate } from 'src/app/shared/models/object-storage.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order, OrderItem } from '../../instances/instances.model';

@Component({
  selector: 'one-portal-object-storage-create',
  templateUrl: './object-storage-create.component.html',
  styleUrls: ['../object-storage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageCreateComponent {
  today: Date = new Date();
  numberMonth: number = 1;
  expiredDate: Date = addDays(this.today, 30);
  objectStorageCreate: ObjectStorageCreate = new ObjectStorageCreate();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onChangeTime() {
    let lastDate = new Date();
    lastDate.setDate(this.today.getDate() + this.numberMonth * 30);
    this.expiredDate = lastDate;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmout() {}

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  create() {
    this.objectStorageCreate.customerId = this.tokenService.get()?.userId;
    this.objectStorageCreate.userEmail = this.tokenService.get()?.email;
    this.objectStorageCreate.actorEmail = this.tokenService.get()?.email;
    this.objectStorageCreate.vpcId = 0;
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
