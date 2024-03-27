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
import { finalize } from 'rxjs';
import { PaymentSummaryService } from '../../services/payment-summary.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';

class ServiceInfo {
  name: string;
  price: number;
  duration: number;
  amount: number;
  currency: number;
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

  constructor(
    private service: InstancesService,
    private psService: PaymentSummaryService,
    private router: Router,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private loadingSrv: LoadingService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
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
        var serviceItem = new ServiceInfo();
        switch (e.specificationType) {
          case 'instance_create':
            serviceItem.name = 'Tạo máy ảo';
            break;
          case 'instance_resize':
            serviceItem.name = 'Chỉnh sửa máy ảo';
            break;
          case 'instance_extend':
            serviceItem.name = 'Gia hạn máy ảo';
            break;
          case 'volume_create':
            serviceItem.name = 'Tạo Volume';
            break;
          case 'volume_resize':
            serviceItem.name = 'Chỉnh sửa Volume';
            break;
          case 'volume_extend':
            serviceItem.name = 'Gia hạn Volume';
            break;
          case 'ip_create':
            serviceItem.name = 'Tạo IP';
            break;
          case 'ip_extend':
            serviceItem.name = 'Gia hạn IP';
            break;
          case 'k8s_create':
            this.serviceType = 'k8s';
            serviceItem.name = 'Tạo cluster';
            break;
          case 'objectstorage_create':
            serviceItem.name = 'Tạo Object Storage';
            break;
          case 'objectstorage_resize':
            serviceItem.name = 'Chỉnh sửa Object Storage';
            break;
          case 'objectstorage_extend':
            serviceItem.name = 'Gia hạn Object Storage';
            break;
          default:
            serviceItem.name = '';
            break;
        }
        serviceItem.price = e.price;
        serviceItem.duration = e.serviceDuration;
        serviceItem.amount = e.orderItemQuantity;
        serviceItem.currency = e.price * e.serviceDuration;
        this.listServiceInfo.push(serviceItem);
      });
      this.listServiceInfo.forEach((e) => {
        this.totalAmount += e.currency;
      });
    }
  }

  ngOnInit(): void {
    let email = this.tokenService.get()?.email;
    const accessToken = this.tokenService.get()?.token;

    let baseUrl = environment['baseUrl'];
    this.http
      .get<UserModel>(`${baseUrl}/users/${email}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + accessToken,
        }),
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .subscribe({
        next: (res) => {
          this.userModel = res;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
        },
      });
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
            'Lây danh sách Voucher không thất bại'
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

  payNow() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .create(this.order)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (data: any) => {
          window.location.href = data.data;
        },
        error: (e) => {
          this.notification.error(e.statusText, 'Tạo order không thành công');
        },
      });
  }

  navigateToCreate() {
    this.router.navigate([this.returnPath]);
  }
}
