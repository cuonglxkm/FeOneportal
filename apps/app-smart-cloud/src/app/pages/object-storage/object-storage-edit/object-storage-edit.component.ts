import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { addDays } from 'date-fns';
import { Subject, debounceTime, finalize } from 'rxjs';
import {
  ObjectStorage,
  ObjectStorageCreate,
  ObjectStorageResize,
} from 'src/app/shared/models/object-storage.model';
import {
  DataPayment,
  ItemPayment,
  Order,
  OrderItem,
} from '../../instances/instances.model';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';

@Component({
  selector: 'one-portal-object-storage-extend',
  templateUrl: './object-storage-edit.component.html',
  styleUrls: ['./object-storage-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectStorageEditComponent implements OnInit {
  id: any;
  today: Date = new Date();
  addQuota: number = 0;
  objectStorageResize: ObjectStorageResize = new ObjectStorageResize();
  valueStringConfiguration: string
  minStorage: number
  maxStorage: number
  stepStorage: number

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: ObjectStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private configurationsService: ConfigurationsService
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getObjectStorage();
    this.getTotalAmount();
  }

  objectStorage: ObjectStorage = new ObjectStorage();
  getObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .getObjectStorage()
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          this.objectStorage = data;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.error.detail,
            this.i18n.fanyi('app.notification.object.storage.fail')
          );
        },
      });
  }

  initObjectStorageResize() {
    this.objectStorageResize.newQuota =
      this.addQuota + this.objectStorage.quota;
    this.objectStorageResize.customerId = this.tokenService.get()?.userId;
    this.objectStorageResize.userEmail = this.tokenService.get()?.email;
    this.objectStorageResize.actorEmail = this.tokenService.get()?.email;
    this.objectStorageResize.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.UserObjectStorageExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.objectStorageResize.regionId = 0;
    this.objectStorageResize.serviceType = 13;
    this.objectStorageResize.actionType = 4;
    this.objectStorageResize.serviceInstanceId = this.id;
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
          this.objectStorageResize
        );
        itemPayment.specificationType = 'objectstorage_resize';
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

  getConfigurations() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueStringConfiguration = data.valueString;
      const arr = this.valueStringConfiguration.split('#')
      this.minStorage = Number.parseInt(arr[0])
      this.stepStorage = Number.parseInt(arr[1])
    })
  }
}
