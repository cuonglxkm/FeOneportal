import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { RegionModel, slider } from '../../../../../../../libs/common-utils/src';
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
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';

@Component({
  selector: 'one-portal-cloud-backup-resize',
  templateUrl: './cloud-backup-resize.component.html',
  styleUrls: ['./cloud-backup-resize.component.less'],
  animations: [slider],
})
export class CloudBackupResizeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
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
  
  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;
  storage: number = 0;
  priceType: any;
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  form = new FormGroup({
    storage: new FormControl(
      { value: 0, disabled: false },
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
    private configurationsService: ConfigurationsService,
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getStepBlock('CLOUDBACKUP');
    this.getCloudBackupById(this.id);
    this.getOffers();
    this.dateNow = new Date();
    this.calculate();
    this.onChangeStorage();
    this.inputChangeBlock.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberBlock(data));
  }

  getStepBlock(name: string) {
    this.configurationsService.getConfigurations(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = 0; 
      console.log("this.minBlock",this.minBlock)
      this.stepBlock = parseInt(parts[1]);
      console.log("this.stepBlock",this.stepBlock)
      this.maxBlock = parseInt(parts[2]);
      console.log("this.maxBlock",this.maxBlock)
      this.storage = 0;
    })
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
    this.isLoading=true;
    this.instancesService.getDetailProductByUniqueName('cloud-backup')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductIdNoRegion(data[0].id)
            .subscribe((data: any) => {
              var offers = data.filter(
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );
              this.selectedOfferId = offers[0].id;
              this.priceType = offers[0].price.priceType;
              
              this.isLoading=false;
              this.getTotalAmount();
            });
        }
      );
  }
  cloudBackupResize: CloudBackupResize = new CloudBackupResize();
  initCloudBackupResize() {
    this.cloudBackupResize.customerId = this.tokenService.get()?.userId;
    this.cloudBackupResize.userEmail = this.tokenService.get()?.email;
    this.cloudBackupResize.actorEmail = this.tokenService.get()?.email;
    //this.CloudBackupResize.serviceType = ServiceType.CloudBackup;
    this.cloudBackupResize.actionType = ServiceActionType.RESIZE;
    this.cloudBackupResize.serviceInstanceId = this.id;
    this.cloudBackupResize.offerId = this.selectedOfferId;
    this.cloudBackupResize.serviceName = this.cloudBackupDetail?.name;
    this.cloudBackupResize.projectId = this.project;
    this.cloudBackupResize.vpcId = this.project;
    this.cloudBackupResize.regionId = this.region;
    this.cloudBackupResize.currentSize = this.cloudBackupDetail?.storage;
    this.cloudBackupResize.newSize = this.form.controls.storage.value+this.cloudBackupDetail?.storage;
  }

  orderObject: OrderItemObject = new OrderItemObject();

  getTotalAmount() {
    this.initCloudBackupResize();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.cloudBackupResize);
    itemPayment.specificationType = 'cloudbackup_resize';
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
    orderItemOS.specificationType = 'cloudbackup_resize';
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

  checkNumberBlock(value: number): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      this.notification.warning('', messageStepNotification);
      return;
    }
    let adjustedValue = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
    if (adjustedValue > this.maxBlock) {
      adjustedValue = Math.floor(this.maxBlock / this.stepBlock) * this.stepBlock;
    } else if (adjustedValue < this.minBlock) {
      this.notification.warning('', messageStepNotification);
      adjustedValue = this.minBlock;
    }
    if (numericValue !== adjustedValue) {
      this.notification.warning('', messageStepNotification);
    }
    this.storage = adjustedValue;
    this.form.controls.storage.setValue(adjustedValue);
    this.getTotalAmount();
  }
  private inputChangeBlock = new Subject<number>();
  onInputChange(value: number): void {
    this.inputChangeBlock.next(value);
  }
  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab') {
      event.preventDefault();
    }
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    setTimeout(() => {
      //this.getListVolume(true);
    }, 2500);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }
}
