import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  AppValidator,
  UserModel,
} from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { Order, OrderItem } from 'src/app/pages/instances/instances.model';
import { InstancesService } from 'src/app/pages/instances/instances.service';
import { finalize } from 'rxjs';
import { PaymentSummaryService } from '../../services/payment-summary.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { InvoiceService } from '../../services/invoice.service';
import {
  FormCreateUserInvoice,
  FormInitUserInvoice,
} from '../../models/invoice';
import { TAX_CODE_REGEX } from '../../constants/constants';
import { PriceType } from 'src/app/core/models/enum';

class ServiceInfo {
  name: string;
  price: number;
  duration: number;
  amount: number;
  currency: number;
  type: string;
}

class Discount {
  promotionCode: string;
  value: number;
  description: string;
  endDate: string;
}

@Component({
  selector: 'one-portal-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummaryComponent implements OnInit {
  listServiceInfo: ServiceInfo[] = [];
  userModel: UserModel = {};
  order: Order = new Order();
  formInitUserInvoice: FormInitUserInvoice = new FormInitUserInvoice();
  acceptTerm: boolean = false;
  totalAmount: number = 0;
  promotion: number = 0;
  inputCode: string = '';
  loading: boolean = true;
  returnPath: string;
  serviceType: string;
  isVisibleCustomerInvoice: boolean = false;
  isVisibleConfirm: boolean = false;
  customerGroup: any;
  customerGroups: any;
  customerType: any;
  customerTypes: any;
  email: string;
  totalPayment: number;
  totalVAT: number;
  priceType: number;
  formCreatUserInvoice: FormCreateUserInvoice = new FormCreateUserInvoice();
  isExportInvoice: boolean = false;
  isCheckedExportInvoice: boolean = true;
  isLoadingUpdateInfo: boolean = false;
  isLoadingGetUser: boolean = false;
  radioValue = 1;
  options = [
    { label: this.i18n.fanyi('app.invoice.export.customer1'), value: 1 },
    { label: this.i18n.fanyi('app.invoice.export.customer2'), value: 2 },
  ];
  public PriceType = PriceType;
  constructor(
    private service: InstancesService,
    private psService: PaymentSummaryService,
    private router: Router,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private loadingSrv: LoadingService,
    private fb: NonNullableFormBuilder,
    private userService: UserService,
    private invoiceService: InvoiceService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any; path: string };

    if (state) {
      this.returnPath = state.path;
      const myOrder = state.data;

      this.order.customerId = myOrder.customerId;
      this.order.createdByUserId = myOrder.createdByUserId;
      this.order.note = myOrder.note;
      this.order.orderItems = myOrder.orderItems;
      this.totalPayment = myOrder.totalPayment;
      this.totalVAT = myOrder.totalVAT;
      this.priceType = myOrder.orderItems.length > 0 ? myOrder.orderItems[0].priceType ?? PriceType.PerMonth : PriceType.PerMonth;
      console.log('order summary', this.order);
      this.order.orderItems.forEach((e: OrderItem) => {
        var serviceItem = new ServiceInfo();
        const specificationObj = JSON.parse(e.specification);
        switch (e.specificationType) {
          case 'instance_create':
            serviceItem.name =
              this.i18n.fanyi('app.instances') +
              ` - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'instance_resize':
            serviceItem.name =
              this.i18n.fanyi('app.instances') +
              ` - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'instance_extend':
            serviceItem.name =
              this.i18n.fanyi('app.instances') +
              ` - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'volume_create':
            serviceItem.name = `Volume - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'volume_resize':
            serviceItem.name = `Volume - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'volume_extend':
            serviceItem.name = `Volume - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'ip_create':
            serviceItem.name = `IP`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'ip_extend':
            serviceItem.name = `IP`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'k8s_create':
            this.serviceType = 'k8s';
            serviceItem.name = `k8s - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'k8s_resize':
            this.serviceType = 'k8s';
            serviceItem.name = `k8s - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.text.upgrade');
            break;
          case 'k8s_extend':
            this.serviceType = 'k8s';
            serviceItem.name = `k8s - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'objectstorage_create':
            serviceItem.name = `Object Storage`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'objectstorage_resize':
            serviceItem.name = `Object Storage`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'objectstorage_extend':
            serviceItem.name = `Object Storage`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'kafka_create':
            this.serviceType = 'kafka';
            serviceItem.name = `Kafka - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'kafka_resize':
            this.serviceType = 'kafka';
            serviceItem.name = `Kafka - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.text.upgrade');
            break;
          case 'kafka_extend':
            this.serviceType = 'kafka';
            serviceItem.name = `Kafka - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'vpnsitetosite_create':
            serviceItem.name = `Vpn Site To Site`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'vpnsitetosite_extend':
            serviceItem.name = `Vpn Site To Site`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'vpnsitetosite_resize':
            serviceItem.name = `Vpn Site To Site`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'snapshotpackage_create':
            serviceItem.name = `Gói Snapshot  - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'snapshotpackage_resize':
            serviceItem.name = `Gói Snapshot  - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'mongodb_create':
            this.serviceType = 'mongodb';
            serviceItem.name = `Mongodb - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'mongodb_extend':
            this.serviceType = 'mongodb';
            serviceItem.name = `Mongodb - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'sharesnapshot_create':
            serviceItem.name = `File System Snapshot - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'filestorage_create':
            serviceItem.name = `File System - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'filestorage_resize':
            serviceItem.name = `File System - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'filestorage_extend':
            serviceItem.name = `File System - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'sharesnapshot_extend':
            serviceItem.name = `File System Snapshot - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'mongodb_resize':
            this.serviceType = 'mongodb';
            serviceItem.name = `Mongodb - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.text.upgrade');
            break;
          case 'ecr_resize':
            this.serviceType = 'ecr';
            serviceItem.name = `ecr - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'ecr_extend':
            this.serviceType = 'ecr';
            serviceItem.name = `ecr - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'ecr_create':
            this.serviceType = 'ecr';
            serviceItem.name = `ecr - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'vpc_create':
            serviceItem.name = `VPC - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'vpc_resize':
            serviceItem.name = `VPC - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'vpc_extend':
            serviceItem.name = `VPC - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'k8s_prem_create':
            this.serviceType = 'k8s_prem';
            serviceItem.name = `VPK - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'k8s_prem_resize':
            this.serviceType = 'k8s_prem';
            serviceItem.name = `VPK - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.text.upgrade');
            break;
          case 'k8s_prem_extend':
            this.serviceType = 'k8s_prem';
            serviceItem.name = `VPK - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'backuppackage_create':
            serviceItem.name = `Backup Package - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'backuppacket_resize':
            serviceItem.name = `Backup Package - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'backuppacket_extend':
            serviceItem.name = `Backup Package - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'restore_volumebackup':
            serviceItem.name = `Backup Volume - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.restore');
            break;
          case 'snapshotpackage_create':
            serviceItem.name = `Gói Snapshot - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'snapshotpackage_resize':
            serviceItem.name = `Gói Snapshot - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'snapshotpackage_extend':
            serviceItem.name = `Gói Snapshot  - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'restore_instancebackup':
            serviceItem.name = `Backup VM - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.restore');
            break;
          case 'waf_create':
            serviceItem.name = `WAF - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'waf_resize':
            serviceItem.name = `WAF - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.resize');
            break;
          case 'waf_extend':
            serviceItem.name = `WAF - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'loadbalancer_create':
            serviceItem.name = `Load Balancer SDN - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'loadbalancer_extend':
            serviceItem.name = `Load Balancer SDN - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.button.extend');
            break;
          case 'endpoint_create':
            serviceItem.name = `Endpoint - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'cloudbackup_create':
            serviceItem.name = `Cloud Backup - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'cloudbackup_resize':
            serviceItem.name = `Cloud Backup - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.resize');
            break;
          case 'cloudbackup_entend':
            serviceItem.name = `Cloud Backup - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.extend');
            break;
          default:
            serviceItem.name = '';
            break;
        }
        serviceItem.price = e.price / e.serviceDuration;
        serviceItem.amount = e.orderItemQuantity;
        serviceItem.duration = e.serviceDuration;
        serviceItem.currency = e.price;
        this.listServiceInfo.push(serviceItem);
      });
      this.listServiceInfo.forEach((e) => {
        this.totalAmount += e.currency;
      });
    }
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.email = this.tokenService.get()?.email;
    const accessToken = this.tokenService.get()?.token;
    this.isLoadingGetUser = true;
    let baseUrl = environment['baseUrl'];
    this.http
      .get<UserModel>(`${baseUrl}/users/${this.tokenService.get()?.email}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + accessToken,
        }),
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .subscribe({
        next: (res) => {
          this.userModel = res;
          this.isLoadingGetUser = false
          console.log(this.userModel);
          if (this.userModel && this.userModel.customerInvoice === null) {
            this.isVisibleCustomerInvoice = true;
            this.formCustomerInvoice.controls.email.setValue(
              this.userModel.email
            );
            this.formCustomerInvoice.controls.nameCustomer.setValue(
              this.userModel.fullName
            );
            this.formCustomerInvoice.controls.address.setValue(
              this.userModel.address
            );
            this.formCustomerInvoice.controls.phoneNumber.setValue(
              this.userModel.phoneNumber
            );
            this.getListCustomerGroup();
          } else if (
            this.userModel &&
            this.userModel.customerInvoice !== null
          ) {
            if (this.userModel.customerInvoice.customerGroupId === 1) {
              this.radioValue = 2;
            } else {
              this.radioValue = 1;
            }
            this.getDataExportInvoice();
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoadingGetUser = false
          console.log(error);
        },
      });
  }

  formCustomerInvoice: FormGroup<{
    nameCompany: FormControl<string>;
    email: FormControl<string>;
    phoneNumber: FormControl<string>;
    nameCustomer: FormControl<string>;
    taxCode: FormControl<string>;
    address: FormControl<string>;
  }> = this.fb.group({
    nameCompany: ['', Validators.required],
    email: ['', [Validators.required, AppValidator.validEmail]],
    phoneNumber: ['', [Validators.required, AppValidator.validPhoneNumber]],
    nameCustomer: [
      '',
      [Validators.required, AppValidator.cannotContainSpecialCharactor],
    ],
    taxCode: ['', [Validators.required, Validators.pattern(TAX_CODE_REGEX)]],
    address: ['', Validators.required],
  });

  formExportInvoice: FormGroup<{
    nameCompany: FormControl<string>;
    email: FormControl<string>;
    phoneNumber: FormControl<string>;
    nameCustomer: FormControl<string>;
    taxCode: FormControl<string>;
    address: FormControl<string>;
  }> = this.fb.group({
    nameCompany: [''],
    email: ['', [Validators.required, AppValidator.validEmail]],
    phoneNumber: ['', [AppValidator.validPhoneNumber]],
    nameCustomer: [
      '',
      [Validators.required, AppValidator.cannotContainSpecialCharactor],
    ],
    taxCode: ['', [Validators.pattern(TAX_CODE_REGEX)]],
    address: [''],
  });

  changeOptionInvoices(value: string) {
    console.log(this.radioValue);
    if (this.radioValue === 2) {
      this.formExportInvoice.controls.address.clearValidators();
      this.formExportInvoice.controls.address.updateValueAndValidity();
      this.formExportInvoice.controls.taxCode.setValidators([
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formExportInvoice.controls.taxCode.updateValueAndValidity();
      this.formExportInvoice.controls.phoneNumber.setValidators([
        AppValidator.validPhoneNumber,
      ]);
      this.formExportInvoice.controls.phoneNumber.updateValueAndValidity();
      this.formExportInvoice.controls.nameCompany.clearValidators();
      this.formExportInvoice.controls.nameCompany.updateValueAndValidity();
    } else {
      this.formExportInvoice.controls.address.setValidators(
        Validators.required
      );
      this.formExportInvoice.controls.address.updateValueAndValidity();
      this.formExportInvoice.controls.taxCode.setValidators([
        Validators.required,
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formExportInvoice.controls.taxCode.updateValueAndValidity();
      this.formExportInvoice.controls.phoneNumber.setValidators([
        Validators.required,
        AppValidator.validPhoneNumber,
      ]);
      this.formExportInvoice.controls.phoneNumber.updateValueAndValidity();
      this.formExportInvoice.controls.nameCompany.setValidators([
        Validators.required,
      ]);
      this.formExportInvoice.controls.nameCompany.updateValueAndValidity();
    }
  }

  listDiscount: Discount[] = [];
  discountPicked: string = '';
  getListDiscount() {
    this.loading = true;
    this.psService
      .getDiscounts('', 9999, 1)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listDiscount = data.records;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.get.list.voucher.fail')
          );
        },
      });
  }

  checkedExistDiscount: boolean = true;
  applyInputDiscount() {
    this.psService.getDiscountByCode(this.inputCode).subscribe({
      next: (data) => {
        this.checkedExistDiscount = true;
        this.order.couponCode = this.inputCode;
        this.isVisibleDiscount = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.checkedExistDiscount = false;
        this.cdr.detectChanges();
      },
    });
  }

  chooseDiscount(code: string) {
    if (this.discountPicked === code) {
      this.discountPicked = null;
    } else {
      this.discountPicked = code;
    }
  }

  isVisibleDiscount: boolean = false;
  showModal() {
    this.isVisibleDiscount = true;
    this.inputCode = '';
    this.checkedExistDiscount = true;
    this.getListDiscount();
  }

  handleCancelDiscount() {
    this.isVisibleDiscount = false;
  }

  handleOkDiscount(): void {
    this.order.couponCode = this.discountPicked;
    this.isVisibleDiscount = false;
  }

  getListCustomerGroup() {
    this.userService.getCustomerGroup().subscribe({
      next: (data) => {
        this.customerGroups = data;
        this.customerGroup = data[0].id;
        let customerGroupFilter = this.customerGroups.filter(
          (item) => item.id === this.customerGroup
        );
        this.customerTypes = customerGroupFilter[0].customerTypes;
        this.customerType = this.customerTypes[0].id;
        console.log(this.customerType);

        if (this.customerType === 1) {
          this.formCustomerInvoice.controls.taxCode.setValidators([
            Validators.pattern(TAX_CODE_REGEX),
          ]);
          this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
          this.formCustomerInvoice.controls.nameCompany.clearValidators();
          this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
        } else {
          this.formCustomerInvoice.controls.taxCode.setValidators([
            Validators.required,
            Validators.pattern(TAX_CODE_REGEX),
          ]);
          this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
          this.formCustomerInvoice.controls.nameCompany.setValidators([
            Validators.required,
          ]);
          this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
        }
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('Lấy danh sách thất bại')
        );
      },
    });
  }

  changeCustomerGroup(id) {
    console.log(id);

    let customerGroupFilter = this.customerGroups.filter(
      (item) => item.id === id
    );
    this.customerTypes = customerGroupFilter[0].customerTypes;
    this.customerType = this.customerTypes[0].id;
    console.log(this.customerType);

    if (this.customerType === 1) {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.clearValidators();
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    } else {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.required,
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.setValidators([
        Validators.required,
      ]);
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    }
  }

  navigateToTerm(event: Event) {
    event.preventDefault();
    const url = environment.cloud_baseUrl + '/terms-and-conditions';
    window.open(url, '_blank');
  }

  changeCustomerType(id) {
    console.log(this.customerType);

    if (id === 1 || id === 2) {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.clearValidators();
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    } else {
      this.formCustomerInvoice.controls.taxCode.setValidators([
        Validators.required,
        Validators.pattern(TAX_CODE_REGEX),
      ]);
      this.formCustomerInvoice.controls.taxCode.updateValueAndValidity();
      this.formCustomerInvoice.controls.nameCompany.setValidators([
        Validators.required,
      ]);
      this.formCustomerInvoice.controls.nameCompany.updateValueAndValidity();
    }
  }

  initUserInvoice() {
    this.formInitUserInvoice.Address =
      this.formExportInvoice.controls.address.value;
    this.formInitUserInvoice.CompanyName =
      this.formExportInvoice.controls.nameCompany.value;
    this.formInitUserInvoice.BuyerName =
      this.formExportInvoice.controls.nameCustomer.value;
    this.formInitUserInvoice.TaxCode =
      this.formExportInvoice.controls.taxCode.value;
    this.formInitUserInvoice.PhoneNumber =
      this.formExportInvoice.controls.phoneNumber.value;
    this.formInitUserInvoice.Email =
      this.formExportInvoice.controls.email.value;
    this.formInitUserInvoice.CustomerType = this.radioValue;
  }
  payNow() {
    this.pay();
  }

  pay() {
    this.initUserInvoice();
    this.isCheckedExportInvoice === true
      ? (this.order.invoiceInfo = JSON.stringify(this.formInitUserInvoice))
      : (this.order.invoiceInfo = '');
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .create(this.order)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (result: any) => {
          if (result.code == 310) {
            window.location.href = result.data;
          } else if (result.code == 200) {
            this.router.navigate([
              `/app-smart-cloud/order/detail/${result.data.id}`,
            ]);
          }
          console.log(result);
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notify.fail.order.create')
          );
        },
      });
  }

  handleOkUpdateCustomerInvoice() {
    this.isVisibleConfirm = true;
  }

  handleCancelConfirm() {
    this.isVisibleConfirm = false;
  }

  handleOk() {
    this.isLoadingUpdateInfo = true;
    this.formCreatUserInvoice.companyName =
      this.formCustomerInvoice.controls.nameCompany.value;
    this.formCreatUserInvoice.address =
      this.formCustomerInvoice.controls.address.value;
    this.formCreatUserInvoice.phoneNumber =
      this.formCustomerInvoice.controls.phoneNumber.value;
    this.formCreatUserInvoice.fullName =
      this.formCustomerInvoice.controls.nameCustomer.value;
    this.formCreatUserInvoice.email =
      this.formCustomerInvoice.controls.email.value;
    this.formCreatUserInvoice.taxCode =
      this.formCustomerInvoice.controls.taxCode.value;
    this.formCreatUserInvoice.customerGroupId = this.customerGroup;
    this.formCreatUserInvoice.customerTypeId = this.customerType;
    this.formCreatUserInvoice.customerId = this.tokenService.get()?.userId;
    console.log(this.formCreatUserInvoice);

    this.invoiceService.createInvoice(this.formCreatUserInvoice).subscribe({
      next: (data) => {
        this.isLoadingUpdateInfo = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          this.i18n.fanyi('app.invoice.pop-up.update.success')
        );
        this.isVisibleConfirm = false;
        this.isVisibleCustomerInvoice = false;
        this.getUser();
      },
      error: (e) => {
        this.isLoadingUpdateInfo = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.invoice.pop-up.update.fail')
        );
      },
    });
  }

  navigateToCreate() {
    this.router.navigate([this.returnPath]);
  }

  getDataExportInvoice() {
    this.formExportInvoice.controls.email.setValue(
      this.userModel.customerInvoice.email
    );
    this.formExportInvoice.controls.nameCustomer.setValue(
      this.userModel.customerInvoice.fullName
    );
    this.formExportInvoice.controls.address.setValue(
      this.userModel.customerInvoice.address
    );
    this.formExportInvoice.controls.phoneNumber.setValue(
      this.userModel.customerInvoice.phoneNumber
    );
    this.formExportInvoice.controls.taxCode.setValue(
      this.userModel.customerInvoice.taxCode
    );
    this.formExportInvoice.controls.nameCompany.setValue(
      this.userModel.customerInvoice.companyName
    );
  }

  updateExportInvoice(event) {
    if (this.userModel && this.userModel.customerInvoice && event === true) {
      this.getDataExportInvoice();
    }
  }
}
