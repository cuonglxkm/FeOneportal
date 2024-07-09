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
        case '02':
          this.causeOfFail = this.i18n.fanyi('app.transaction.fail');
          break;
        case '04':
          this.causeOfFail = this.i18n.fanyi('app.transaction.exceed.time');
          break;
        case '16':
          this.causeOfFail = this.i18n.fanyi('app.transaction.procress');
          break;
        case '17':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.correct');;
          break;
        case '23':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.correct');
          break;
        case '24':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.correct');
          break;
        case '18':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.block');
          break;
        case '19':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.block');
          break;
        case '25':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.block');
          break;
        case '20':
          this.causeOfFail = this.i18n.fanyi('app.transaction.card.not.money');
          break;
        case '22':
          this.causeOfFail = this.i18n.fanyi('app.transaction.otp.not.correct');
          break;
        case '70':
          this.causeOfFail = this.i18n.fanyi('app.transaction.cancel');
          break;
        case '111':
          this.causeOfFail = this.i18n.fanyi('app.transaction.max.money');
          break;
        case '112':
          this.causeOfFail = this.i18n.fanyi('app.transaction.max.money');
          break;
        case '113':
          this.causeOfFail = this.i18n.fanyi('app.transaction.max.money');
          break;
        case '114':
          this.causeOfFail = this.i18n.fanyi('app.transaction.max.money');
          break;
        case '97':
          this.causeOfFail = this.i18n.fanyi('app.transaction.bank.error');
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
        if (this.paymentSuccess === false) {
          this.paymentService
            .cancelPayment(this.paymentCode)
            .subscribe((data) => {
              console.log(data);
            });
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
