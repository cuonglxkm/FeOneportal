import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.less'],
})
export class PaymentSuccessComponent implements OnInit {
  paymentCode = '';
  orderId = 25710;
  totalAmount = 1000;

  constructor(private router: Router){}
  ngOnInit(): void {
    var data = window.location.search.replace('?', '').split('&');
    var dataString = data.find((x) => x.includes('data'));
    this.paymentCode =
      dataString && dataString.split('=').length > 1
        ? dataString.split('=')[1]
        : null;

    setTimeout(() => {
      this.router.navigate([`/app-smart-cloud/order/detail/${this.orderId}`]);
    }, 5000);
  }
}
