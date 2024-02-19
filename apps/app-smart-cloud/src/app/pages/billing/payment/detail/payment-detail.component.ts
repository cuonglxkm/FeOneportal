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
  listServiceInfo: ServiceInfo[] = [];
  userModel: UserModel = {};
  id: number;

  constructor(
    private service: PaymentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {}

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
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getPaymentDetail();
    this.serviceInfo.name = 'Volume';
    this.serviceInfo.price = 1000000;
    this.serviceInfo.duration = 6;
    this.serviceInfo.amount = 1;
    this.serviceInfo.currency = 6000000;
    this.listServiceInfo.push(this.serviceInfo);
    this.listServiceInfo.push(this.serviceInfo);
  }

  getPaymentDetail() {
    this.service.getPaymentById(this.id).subscribe((data: any) => {
      this.payment = data;
      this.cdr.detectChanges();
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

  payNow() {}
}
