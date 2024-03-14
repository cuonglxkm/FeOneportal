import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentModel } from '../../models/payment.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'one-portal-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.less'],
})
export class PaymentSuccessComponent implements OnInit {
  payment: PaymentModel;
  paymentCode = '';
  orderId: number;
  constructor(
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

    this.paymentService
      .getPaymentByPaymentNumber(this.paymentCode)
      .subscribe((data) => {
        this.payment = data;
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
