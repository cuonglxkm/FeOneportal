import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NotificationService, UserModel } from '../../../../../../../../libs/common-utils/src';
import { environment } from '@env/environment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { OrderDetailDTO } from 'src/app/shared/models/order.model';
import { PaymentModel } from 'src/app/shared/models/payment.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { LoadingService } from '@delon/abc/loading';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PriceType } from 'src/app/core/models/enum';
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
    payment: PaymentModel = null;
    serviceInfo: ServiceInfo = new ServiceInfo();
    data: OrderDetailDTO = null
    userModel$: Observable<UserModel>;
    id: number;
    userModel: UserModel
    orderNumber:string
    isLoading: boolean = false
    isPrint: boolean = false
    priceType: PriceType;
    PriceType = PriceType;
  constructor(
    private service: PaymentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.getUser()
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.orderNumber = this.activatedRoute.snapshot.paramMap.get('orderNumber');
    this.getPaymentDetail();
    this.getOrderDetail(this.orderNumber);
    
    this.notificationService.connection.on('UpdateStatePayment', (data) => {
      if(data && data["serviceId"] && Number(data["serviceId"]) == this.id){
        setTimeout(() => {
          window.location.reload()
        },500)
      }
    });
  }

  getUser(){
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
  }

  getPaymentDetail() {
    this.isLoading = true
    this.service.getPaymentById(this.id).subscribe({
      next: (data) => {
        this.payment = {
          ...data,
          eInvoiceCodePadded: data.eInvoiceCode != null ? data.eInvoiceCode.toString().padStart(8, '0') : null
        }
        this.cdr.detectChanges()
        this.isLoading = false
      },
      error: (e) => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
        this.router.navigate(['/app-smart-cloud/billing/payments']);
      },
    });
  }

  getPriceType(){
    var serviceSpec = JSON.parse(this.data?.orderItems[0]?.serviceDetail);
    var offerPriceType = serviceSpec?.OfferPriceType ?? "PerMonth";
    this.priceType = PriceType[offerPriceType as keyof typeof PriceType];
  }

  getOrderDetail(id: string) {
    this.orderService.getOrderBycode(id).subscribe({
      next: (data) => {
        this.data = data;
        this.getPriceType();
        this.cdr.detectChanges()
      },
      error: (e) => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
        this.router.navigate(['/app-smart-cloud/billing/payments']);
      },
    });
  }

  download(id: number) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service.exportInvoice(id)
    .pipe(finalize(() => this.loadingSrv.close()))
    .subscribe((data) => {
      const element = document.createElement('div');
      element.style.width = '268mm';
      element.style.height = '371mm';
      if (typeof data === 'string' && data.trim().length > 0) {
        element.innerHTML = data;
        
        document.body.appendChild(element);
        
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          pdf.save(`invoice_${id}.pdf`);
          
          document.body.removeChild(element);
        });
      } else {
        console.log('error:', data);
      }
    }, (error) => {
      console.log('error:', error);
    });
  }

  payNow() {
    window.location.href = this.payment.paymentUrl
  }

  printInvoice(id: number) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service.exportInvoice(id)
    .pipe(finalize(() => this.loadingSrv.close()))
    .subscribe((data) => {
      const element = document.createElement('div');
      element.style.width = '268mm';
      element.style.height = '371mm';
      if (typeof data === 'string' && data.trim().length > 0) {
        element.innerHTML = data;
        
        document.body.appendChild(element);
        
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          window.open(pdf.output('bloburl'), '_blank');
          document.body.removeChild(element);
        });
      } else {
        console.log('error:', data);
      }
    }, (error) => {
      console.log('error:', error)
    });
  }
}
