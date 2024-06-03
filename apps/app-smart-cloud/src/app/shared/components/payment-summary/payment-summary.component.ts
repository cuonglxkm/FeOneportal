import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { UserModel } from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { Order, OrderItem } from 'src/app/pages/instances/instances.model';
import { InstancesService } from 'src/app/pages/instances/instances.service';
import { finalize, filter } from 'rxjs';
import { PaymentSummaryService } from '../../services/payment-summary.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { InvoiceService } from '../../services/invoice.service';
import { FormCreateUserInvoice } from '../../models/invoice';


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
  acceptTerm: boolean = false;
  totalAmount: number = 0;
  promotion: number = 0;
  inputCode: string = '';
  loading: boolean = true;
  returnPath: string;
  serviceType: string;
  isVisibleCustomerInvoice: boolean = false;
  customerGroup: any
  customerGroups: any
  customerType: any
  customerTypes: any
  email: string
  formCreatUserInvoice: FormCreateUserInvoice = new FormCreateUserInvoice()
  isExportInvoice: boolean = false
  isCheckedExportInvoice: boolean = false
  radioValue = '1';
  options = [
    { label: '1', value: 'Khách hàng doanh nghiệp' },
    { label: '2', value: 'Khách hàng cá nhân' },
  ];

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
      console.log({ path: this.returnPath });
      const myOrder = state.data;
      console.log(state.data);

      this.order.customerId = myOrder.customerId;
      this.order.createdByUserId = myOrder.createdByUserId;
      this.order.note = myOrder.note;
      this.order.orderItems = myOrder.orderItems;
      console.log('order summary', this.order);
      this.order.orderItems.forEach((e: OrderItem) => {
        console.log(e);

        var serviceItem = new ServiceInfo();
        const specificationObj = JSON.parse(e.specification);
        console.log(specificationObj);

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
            serviceItem.name = `Snapshot Package - ${specificationObj.serviceName}`;
            serviceItem.type = this.i18n.fanyi('app.label.create');
            break;
          case 'snapshotpackage_resize':
            serviceItem.name = `Snapshot Package - ${specificationObj.serviceName}`;
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
          default:
            serviceItem.name = '';
            break;
        }
        serviceItem.price = e.price / e.serviceDuration;
        serviceItem.duration = e.serviceDuration;
        serviceItem.amount = e.orderItemQuantity;
        if (serviceItem.type == this.i18n.fanyi('app.button.resize')) {
          serviceItem.currency = e.price;
        } else {
          serviceItem.currency = e.price
        }
        this.listServiceInfo.push(serviceItem);
      });
      this.listServiceInfo.forEach((e) => {
        this.totalAmount += e.currency;
      });
    }
  }

  ngOnInit(): void {
    this.email = this.tokenService.get()?.email;
    const accessToken = this.tokenService.get()?.token;

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
          console.log(this.userModel);
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  formCustomerInvoice: FormGroup<{
    nameCompany: FormControl<string>
    email: FormControl<string>
    phoneNumber: FormControl<string>
    nameCustomer: FormControl<string>
    taxCode: FormControl<string>
    address: FormControl<string>
  }> = this.fb.group({
    nameCompany: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    nameCustomer: ['', [Validators.required]],
    taxCode: ['', [Validators.required]],
    address: ['', [Validators.required]]
  });

  formExportInvoice: FormGroup<{
    nameCompany: FormControl<string>
    email: FormControl<string>
    phoneNumber: FormControl<string>
    nameCustomer: FormControl<string>
    taxCode: FormControl<string>
    address: FormControl<string>
  }> = this.fb.group({
    nameCompany: ['', [Validators.required]],
    email: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    nameCustomer: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]$/)]],
    taxCode: ['', [Validators.required, Validators.pattern(/^[0-9-]$/)]],
    address: ['', [Validators.required]]
  });

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
        this.customerGroups = data

        console.log(this.customerGroups);
        this.customerGroup = data[0].id
        let customerGroupFilter =  this.customerGroups.filter((item) => item.id === this.customerGroup)
        this.customerTypes = customerGroupFilter[0].customerTypes
        this.customerType = this.customerTypes[0].id
        
      }, 
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('Lấy danh sách thất bại')
        );
      },
    })
  }

  changeCustomerGroup(id){
    console.log(id);
    
    let customerGroupFilter = this.customerGroups.filter((item) => item.id === id)
    this.customerTypes = customerGroupFilter[0].customerTypes
    this.customerType = this.customerTypes[0].id
  }
  payNow() {    
    if(this.userModel && this.userModel.customerInvoice === null){
      this.isVisibleCustomerInvoice = true
      this.formCustomerInvoice.controls.email.setValue(this.userModel.email)
      this.formCustomerInvoice.controls.nameCustomer.setValue(this.userModel.fullName)
      this.formCustomerInvoice.controls.address.setValue(this.userModel.address)
      this.formCustomerInvoice.controls.phoneNumber.setValue(this.userModel.phoneNumber)
      this.getListCustomerGroup()
    }else{
      this.pay()
    }
  }
  

  pay(){
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

  handleOkUpdateCustomerInvoice(){
  //  this.pay()
   this.formCreatUserInvoice.companyName = this.formCustomerInvoice.controls.nameCompany.value
   this.formCreatUserInvoice.address = this.formCustomerInvoice.controls.address.value
   this.formCreatUserInvoice.phoneNumber = this.formCustomerInvoice.controls.phoneNumber.value
   this.formCreatUserInvoice.fullName = this.formCustomerInvoice.controls.nameCustomer.value
   this.formCreatUserInvoice.email = this.formCustomerInvoice.controls.email.value
   this.formCreatUserInvoice.taxCode = this.formCustomerInvoice.controls.taxCode.value
   this.formCreatUserInvoice.customerGroupId = this.customerGroup
   this.formCreatUserInvoice.customerTypeId = this.customerType
   this.formCreatUserInvoice.customerId = this.tokenService.get()?.userId
   console.log(this.formCreatUserInvoice);
   
    this.invoiceService.create(this.formCreatUserInvoice).subscribe({
      next: (data) => {
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          this.i18n.fanyi('Cập nhật thông tin xuất hóa đơn thành công')
        );
        this.isVisibleCustomerInvoice = false
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('Cập nhật thông tin xuất hóa đơn thất bại')
        );
      },
    })

  }

  navigateToCreate() {
    this.router.navigate([this.returnPath]);
  }

  handleCancelUpdateCustomerInvoice(){
    this.isVisibleCustomerInvoice = false
  }

  updateExportInvoice(event){
    console.log(event);
    
    if(this.userModel && this.userModel.customerInvoice && event === true){
      this.formCustomerInvoice.controls.email.setValue(this.userModel.customerInvoice.email)
      this.formCustomerInvoice.controls.nameCustomer.setValue(this.userModel.customerInvoice.fullName)
      this.formCustomerInvoice.controls.address.setValue(this.userModel.customerInvoice.address)
      this.formCustomerInvoice.controls.phoneNumber.setValue(this.userModel.customerInvoice.phoneNumber)
      this.formCustomerInvoice.controls.taxCode.setValue(this.userModel.customerInvoice.taxCode)
      this.formCustomerInvoice.controls.nameCompany.setValue(this.userModel.customerInvoice.companyName)
    }
  }

}
