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
import { OrderItemObject } from 'src/app/shared/models/price';
import { OrderService } from 'src/app/shared/services/order.service';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  form = new FormGroup({
    storage: new FormControl('', {
      validators: [Validators.required],
    }),
  });

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

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.getConfigurations();
    this.getObjectStorage();
    this.onChangeTotalAmount();
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  objectStorage: ObjectStorage = new ObjectStorage();
  getObjectStorage() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .getObjectStorage(this.region)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe({
        next: (data) => {
          if(data.status === 'TAMNGUNG'){
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Object Storage đã hết hạn, vui lòng gia hạn thêm'
            );
            if (this.region === RegionID.ADVANCE) {
              this.router.navigateByUrl('/app-smart-cloud/object-storage-advance/extend');
            } else {
              this.router.navigateByUrl('/app-smart-cloud/object-storage/extend');
            }
          }else{
            this.objectStorage = data;
            this.id = this.objectStorage.id;
            this.objectStorageResize.newQuota =
              this.addQuota + this.objectStorage.quota;
            this.dataSubject.next(0);
          }
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

  initObjectStorageResize() {
    this.objectStorageResize.newQuota =
      this.addQuota + this.objectStorage.quota;
    this.objectStorageResize.customerId = this.tokenService.get()?.userId;
    this.objectStorageResize.userEmail = this.tokenService.get()?.email;
    this.objectStorageResize.actorEmail = this.tokenService.get()?.email;
    this.objectStorageResize.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.UserObjectStorageExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.objectStorageResize.regionId = this.region;
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

  onChangeTotalAmount() {
    this.dataSubject.pipe(debounceTime(500)).subscribe((res) => {
      if (res % this.stepStorage > 0) {
        this.notification.warning(
          '',
          this.i18n.fanyi('app.notify.amount.capacity', {
            number: this.stepStorage,
          })
        );
        this.addQuota = res - (res % this.stepStorage);
      }
      this.getTotalAmount();
    });
  }

  getTotalAmount() {
    this.initObjectStorageResize();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.objectStorageResize);
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
      this.orderObject = result.data;
      this.cdr.detectChanges();
    });
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  update() {
    this.orderItem = [];
    this.initObjectStorageResize();
    let specification = JSON.stringify(this.objectStorageResize);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'objectstorage_resize';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = 1;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Điều chỉnh object storage';
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

  navigateToBucketList() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }
}
