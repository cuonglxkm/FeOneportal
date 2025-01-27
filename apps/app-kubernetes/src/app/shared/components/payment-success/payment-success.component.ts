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
  paymentSuccess: boolean = false;
  causeOfFail: string = '';

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
          this.causeOfFail = 'Giao dịch thất bại';
          break;
        case '02':
          this.causeOfFail = 'Dữ liệu không đúng định dạng';
          break;
        case '03':
          this.causeOfFail = 'Mã giao dịch đã tồn tại';
          break;
        case '04':
          this.causeOfFail = 'Timeout';
          break;
        case '05':
          this.causeOfFail = 'Không tìm thấy dữ liệu';
          break;
        case '06':
          this.causeOfFail = 'Lỗi hệ thống';
          break;
        case '07':
          this.causeOfFail = 'Chữ ký không đúng';
          break;
        case '08':
          this.causeOfFail = 'Merchant service đang bị khóa';
          break;
        case '09':
          this.causeOfFail = 'Merchant service không tồn tại';
          break;
        case '96':
          this.causeOfFail = 'Hệ thống đang bảo trì';
          break;
        default:
          this.causeOfFail = 'Lỗi không xác định';
          break;
      }
    }

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
