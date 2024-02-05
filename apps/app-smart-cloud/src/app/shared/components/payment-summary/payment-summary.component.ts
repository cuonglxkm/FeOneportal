import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UserModel } from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';

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
  serviceInfo: ServiceInfo = new ServiceInfo();
  listServiceInfo: ServiceInfo[] = [];
  userModel: UserModel;
  id: number;

  constructor(
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
          'Authorization': "Bearer " + accessToken
        }),
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .subscribe({
        next: (res) => {
          this.userModel = res;
        },
        error: (error) => {
          console.log(error);
        }
      }
      );
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.serviceInfo.name = 'Volume';
    this.serviceInfo.price = 1000000;
    this.serviceInfo.duration = 6;
    this.serviceInfo.amount = 1;
    this.serviceInfo.currency = 6000000;
    this.listServiceInfo.push(this.serviceInfo);
    this.listServiceInfo.push(this.serviceInfo);
  }

  payNow() {}
}