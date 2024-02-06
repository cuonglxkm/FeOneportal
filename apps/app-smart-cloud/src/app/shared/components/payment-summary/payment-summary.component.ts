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
import { InstanceService } from '../../services/instance.service';
import { InstancesService } from 'src/app/pages/instances/instances.service';
import { finalize } from 'rxjs';

class ServiceInfo {
  name: string;
  price: number;
  duration: number;
  amount: number;
  currency: number;
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
  loadingSrv: any;
  notification: any;

  constructor(
    private service: InstancesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };

    if (state) {
      const myOrder = state.data;
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
            serviceItem.name = 'Tạo volume';
            break;
          case 'volume_resize':
            serviceItem.name = 'Chỉnh sửa volume';
            break;
          case 'volume_extend':
            serviceItem.name = 'Gia hạn volume';
            break;
          case 'ip_create':
            serviceItem.name = 'Tạo IP';
            break;
          case 'ip_extend':
            serviceItem.name = 'Gia hạn IP';
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

  payNow() {
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
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Tạo order máy ảo không thành công');
        },
      });
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/instances/instances-create']);
  }
}
