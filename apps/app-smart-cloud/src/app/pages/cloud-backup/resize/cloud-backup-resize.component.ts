import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { OrderService } from 'src/app/shared/services/order.service';
import { WafService } from 'src/app/shared/services/waf.service';
import { slider } from '../../../../../../../libs/common-utils/src';
import {
  DataPayment,
  ItemPayment,
  OfferItem,
  Order,
  OrderItem,
} from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import {
  ServiceActionType,
  ServiceType,
} from 'src/app/shared/enums/common.enum';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { OrderItemObject } from 'src/app/shared/models/price';
import { CloudBackup, CloudBackupResize } from '../cloud-backup.model';
import { LoadingService } from '@delon/abc/loading';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

@Component({
  selector: 'one-portal-cloud-backup-resize',
  templateUrl: './cloud-backup-resize.component.html',
  styleUrls: ['./cloud-backup-resize.component.less'],
  animations: [slider],
})
export class CloudBackupResizeComponent implements OnInit {

  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;
  domains: string[] = []
  ipPublics: string[] = []
  dateNow: any;
  today: any;
  expiredDate: any;
  selectedDescription: string = '';
  selectedConfig: string = '';
  selectedNameFlavor: string = '';

  id: any;
  total: any;
  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  totalVAT = 0;
  selectPackge = '';
  private searchSubject = new Subject<string>();
  selectedOfferId: number = 0;
  currentOffer: any;
  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  dataSubjectStorage: Subject<number> = new Subject<number>();
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  form = new FormGroup({
    storage: new FormControl(
      { value: 4, disabled: false },
      { validators: [Validators.required] }
    ),
  });

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private service: CloudBackupService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private catalogService: ObjectStorageService,
    private orderService: OrderService,
    private loadingSrv: LoadingService,
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getCloudBackupById(this.id);
    this.getOffers();
    this.dateNow = new Date();
    this.calculate();
    this.onChangeStorage();
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
  calculate() {
    this.searchSubject.next('');
  }

  cloudBackupDetail: CloudBackup = new CloudBackup();
  changeStorage(value: number) {
    console.log('value', value);
    this.dataSubjectStorage.next(value);
  }
  onChangeStorage() {
    this.dataSubjectStorage
      .pipe(
        debounceTime(300)
      )
      .subscribe((res) => {
        this.getTotalAmount();
      });
  }

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
          this.cloudBackupDetail = data;
        },
        error: (error) => {
          this.isLoading = false
          this.cloudBackupDetail = null;
          this.router.navigate(['/app-smart-cloud/cloud-backup']);
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            'Bản ghi không tồn tại'
          );
        }
      });
  }

  isLastDomain(domain: string): boolean {
    return this.domains.indexOf(domain) === this.domains.length - 1;
  }

  isLastIpPublic(ipPublic: string): boolean {
    return this.ipPublics.indexOf(ipPublic) === this.ipPublics.length - 1;
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
  cloudBackupResize: CloudBackupResize = new CloudBackupResize();
  initCloudBackupResize() {
    this.cloudBackupResize.customerId = this.tokenService.get()?.userId;
    this.cloudBackupResize.userEmail = this.tokenService.get()?.email;
    this.cloudBackupResize.actorEmail = this.tokenService.get()?.email;
    this.cloudBackupResize.regionId = 0;
    //this.CloudBackupResize.serviceType = ServiceType.CloudBackup;
    this.cloudBackupResize.actionType = ServiceActionType.RESIZE;
    this.cloudBackupResize.serviceInstanceId = this.id;
    this.cloudBackupResize.newOfferId = this.selectedOfferId;
    this.cloudBackupResize.serviceName = this.cloudBackupDetail?.name;
  }

  orderObject: OrderItemObject = new OrderItemObject();

  getTotalAmount() {
    this.initCloudBackupResize();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.cloudBackupResize);
    itemPayment.specificationType = 'cloud_backup_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.catalogService.getTotalAmount(dataPayment).subscribe((result) => {
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.totalVAT = result?.data?.totalVAT?.amount;
      this.orderObject = result.data;
      this.cdr.detectChanges();
    });
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];

  update() {
    this.orderItem = [];
    this.initCloudBackupResize();
    let specification = JSON.stringify(this.cloudBackupResize);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'cloud_backup_resize';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = 1;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'Điều chỉnh CloudBackup';
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
