import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentModel } from '../../models/payment.model';
import { OrderService } from '../../services/order.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.less'],
})
export class PaymentSuccessComponent implements OnInit {
  payment: PaymentModel;
  paymentCode = '';
  orderId: number;
  paymentSuccess: boolean = false;
  causeOfFail: string = '';
  serviceName: string = '';
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    var data = window.location.search.replace('?', '').split('&');
    var dataString = data.find((x) => x.includes('data'));
    this.paymentCode =
      dataString && dataString.split('=').length > 1
        ? dataString.split('=')[1]
        : null;

    var resultString = data.find((x) => x.includes('vnptpayResponseCode'));
    var resultCode =
      resultString && resultString.split('=').length > 1
        ? resultString.split('=')[1]
        : null;
    if (resultCode == '00') {
      this.paymentSuccess = true;
    } else {
      this.paymentSuccess = false;
      switch (resultCode) {
        case '01':
          this.causeOfFail = this.i18n.fanyi('app.transaction.fail');
          break;
        case '02':
          this.causeOfFail = this.i18n.fanyi('app.data.format.not.correct');
          break;
        case '03':
          this.causeOfFail = this.i18n.fanyi('app.transaction.code.exist');
          break;
        case '04':
          this.causeOfFail = 'Timeout';
          break;
        case '05':
          this.causeOfFail = this.i18n.fanyi('app.data.not.found');
          break;
        case '06':
          this.causeOfFail = this.i18n.fanyi('app.system.error');
          break;
        case '07':
          this.causeOfFail = this.i18n.fanyi('app.signature.incorrect');
          break;
        case '08':
          this.causeOfFail = this.i18n.fanyi('app.merchant.service.locked');
          break;
        case '09':
          this.causeOfFail = this.i18n.fanyi('app.merchant.service.not.exist');
          break;
        case '96':
          this.causeOfFail = this.i18n.fanyi('app.system.maintenance');
          break;
        default:
          this.causeOfFail = this.i18n.fanyi('app.undefined.error');
          break;
      }
    }

    this.paymentService
      .getPaymentByPaymentNumber(this.paymentCode)
      .subscribe((data) => {
        this.payment = data;
        if(this.paymentSuccess === false){
          this.paymentService.cancelPayment(this.paymentCode).subscribe((data) => {
            console.log(data);
          })
        }
        this.orderService
          .getOrderBycode(this.payment.orderNumber)
          .subscribe((result) => {
            this.orderId = result.id;   
            setTimeout(() => {
              this.router.navigate([
                `/app-smart-cloud/order/detail/${this.orderId}`,
              ]);
            }, 5000);
          });
      });
  }

}
