import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { UserModel } from '../../../../../../../../libs/common-utils/src';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { PaymentModel } from 'src/app/shared/models/payment.model';
import { Observable, pipe, shareReplay, tap } from 'rxjs';
import { OrderService } from 'src/app/shared/services/order.service';
import { OrderDTOSonch } from 'src/app/shared/models/order.model';

class ServiceInfo {
  name: string;
  price: number;
  duration: number;
  amount: number;
  currency: number;
}

@Component({
  selector: 'one-portal-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailComponent implements OnInit {
    payment: PaymentModel = new PaymentModel();
    serviceInfo: ServiceInfo = new ServiceInfo();
    data: OrderDTOSonch
    userModel$: Observable<UserModel>;
    id: number;
    userModel: UserModel
  orderNumber:string
  constructor(
    private service: PaymentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    let email = this.tokenService.get()?.email;
    const accessToken = this.tokenService.get()?.token;

    let baseUrl = environment['baseUrl'];
    this.userModel$ = this.http.get<UserModel>(`${baseUrl}/users/${email}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + accessToken,
      }),
    }).pipe(
      tap(user => {
        this.userModel = user;
        console.log(this.userModel);
        
      }),
      shareReplay(1) 
    );
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.orderNumber = this.activatedRoute.snapshot.paramMap.get('orderNumber');
    
    this.getPaymentDetail();
    this.getOrderDetail()
  }

  getPaymentDetail() {
    this.service.getPaymentById(this.id).subscribe((data: any) => {
      this.payment = data;
    });
  }

  getOrderDetail() {
    this.orderService.getOrderBycode(this.orderNumber).subscribe((data: any) => {
      this.data = data;
      console.log("Huyen", this.data)
    });
  }

  download(id: number) {
    this.service.export(id).subscribe((data: Blob) => {
      // const blob = new Blob([data], {type: 'application/docx' });
      let downloadURL = window.URL.createObjectURL(data);
      let link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'invoice_' + id + '.docx';
      link.click();
    });
  }

  payNow() {
    window.location.href = this.payment.paymentUrl
  }
}
