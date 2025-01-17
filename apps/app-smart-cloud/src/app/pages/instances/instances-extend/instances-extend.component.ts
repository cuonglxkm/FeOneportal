import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DataPayment,
  InstanceExtend,
  InstancesModel,
  ItemPayment,
  Network,
  Order,
  OrderItem,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { asapScheduler, finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { OrderService } from 'src/app/shared/services/order.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-instances-extend',
  templateUrl: './instances-extend.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesExtendComponent implements OnInit {
  loading = true;
  instancesModel: InstancesModel;
  listSecurityGroupModel: SecurityGroupModel[] = [];
  id: number;
  regionId: number;
  customerId: number;
  email: string;
  instanceExtend: InstanceExtend = new InstanceExtend();
  numberMonth: number = 1;
  newExpiredDate: string;
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    private commonSrv: CommonService
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

  hasRoleSI: boolean;
  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId;
    this.email = this.tokenService.get()?.email;
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.hasRoleSI = localStorage.getItem('role').includes('SI');
    this.service.getById(this.id, true).subscribe({
      next: (data) => {
        this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
        this.instancesModel = data;
        this.regionId = this.instancesModel.regionId;
        this.loading = false;
        this.getTotalAmount();
        this.service
          .getAllSecurityGroupByInstance(
            this.instancesModel.cloudId,
            this.regionId,
            this.instancesModel.customerId,
            this.instancesModel.projectId
          )
          .pipe(finalize(() => this.loadingSrv.close()))
          .subscribe((datasg: any) => {
            this.listSecurityGroupModel = datasg;
            this.cdr.detectChanges();
          });
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.notification.error(e.error.message, '');
        // this.router.navigate(['/app-smart-cloud/instances']);
        this.commonSrv.navigateAdvance('/app-smart-cloud/instances','/app-smart-cloud/instances-advance')
      },
    });
  }

  invalid: boolean = false;
  onChangeTime(value) {
    if (value == undefined) {
      this.invalid = true;
      this.totalAmount = 0;
      this.totalVAT = 0;
      this.totalincludesVAT = 0;
    } else {
      this.invalid = false;
      this.numberMonth = value;
      this.getTotalAmount();
    }
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  instanceExtendInit() {
    this.instanceExtend.regionId = this.regionId;
    this.instanceExtend.serviceName = this.instancesModel.name;
    this.instanceExtend.customerId = this.customerId;
    this.instanceExtend.projectId = this.instancesModel.projectId;
    this.instanceExtend.typeName =
      'SharedKernel.IntegrationEvents.InstanceExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceExtend.serviceType = 1;
    this.instanceExtend.actionType = 3;
    this.instanceExtend.serviceInstanceId = this.instancesModel.id;
    this.instanceExtend.newExpireDate = this.newExpiredDate;
    this.instanceExtend.userEmail = this.email;
    this.instanceExtend.actorEmail = this.email;
  }

  totalAmount: number = 0;
  totalVAT: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.instanceExtendInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceExtend);
    itemPayment.specificationType = 'instance_extend';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.instancesModel.projectId;
    console.log('dataPayment extend', dataPayment);
    this.service.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.newExpiredDate = result.data.orderItemPrices[0].expiredDate;
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalVAT = Number.parseFloat(result.data.totalVAT.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  isLoading: boolean = false;
  handleOkExtend(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.orderItem = [];
    this.instanceExtendInit();
    let specificationInstance = JSON.stringify(this.instanceExtend);
    let orderItemInstanceResize = new OrderItem();
    orderItemInstanceResize.orderItemQuantity = 1;
    orderItemInstanceResize.specification = specificationInstance;
    orderItemInstanceResize.specificationType = 'instance_extend';
    orderItemInstanceResize.price = this.totalAmount;
    orderItemInstanceResize.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemInstanceResize);

    this.order.customerId = this.customerId;
    this.order.createdByUserId = this.customerId;
    this.order.note = 'instance extend';
    this.totalVAT = this.totalVAT;
    this.totalincludesVAT = this.totalincludesVAT;
    this.order.orderItems = this.orderItem;
    console.log('order instance resize', this.order);

    this.orderService
      .validaterOrder(this.order)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            if (this.hasRoleSI) {
              this.service.create(this.order).subscribe((data) => {
                this.isLoading = false;
                if (data != null) {
                  if (data.code == 200) {
                    this.isLoading = false;
                    this.notification.success(
                      this.i18n.fanyi('app.status.success'),
                      this.i18n.fanyi('app.notify.extend.instance.success')
                    );
                    this.router.navigate(['/app-smart-cloud/volumes']);
                  }
                } else {
                  this.isLoading = false;
                }
              });
            } else {
              var returnPath: string = window.location.pathname;
              this.router.navigate(['/app-smart-cloud/order/cart'], {
                state: { data: this.order, path: returnPath },
              });
            }
          } else {
            this.isVisiblePopupError = true;
            this.errorList = result.data;
          }
        },
        error: (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            error.error.message
          );
        },
      });
  }

  onRegionChange(region: any) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances','/app-smart-cloud/instances-advance')
  }

  onProjectChange(project: any) {
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances','/app-smart-cloud/instances-advance')
  }

  navigateToEdit() {
    // this.router.navigate([
    //   '/app-smart-cloud/instances/instances-edit/' + this.id,
    // ]);
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-edit/' + this.id,'/app-smart-cloud/instances-advance/instances-edit/' + this.id)
  }

  navigateToChangeImage() {
    // this.router.navigate([
    //   '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    // ]);
    this.commonSrv.navigateAdvance( '/app-smart-cloud/instances/instances-edit-info/' + this.id, '/app-smart-cloud/instances-advance/instances-edit-info/' + this.id)
  }

  cancel() {
    // this.router.navigate([
    //   '/app-smart-cloud/instances/instances-detail/' + this.id,
    // ]);
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-detail/' + this.id,'/app-smart-cloud/instances-advance/instances-detail/' + this.id)
  }

  navigateToInstanceList(){
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
  }

  navigateToInstanceDetail(){
    this.commonSrv.navigateAdvance('/app-smart-cloud/instances/instances-detail/' + this.id, '/app-smart-cloud/instances-advance/instances-detail/' + this.id)
  }

  protected readonly asapScheduler = asapScheduler;
}
