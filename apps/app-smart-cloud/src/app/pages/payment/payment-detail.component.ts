import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

class UserPayment {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

class Payment {
  orderCode: string;
  billCode: string;
  paymentCode: string;
  createdDate: string;
  paymentMethod: string;
  status: string;
}

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
  userPayment: UserPayment = new UserPayment();
  payment: Payment = new Payment();
  serviceInfo: ServiceInfo = new ServiceInfo();
  listServiceInfo: ServiceInfo[] = [];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.userPayment.name = 'Nguyen Huu Vu';
    this.userPayment.phoneNumber = '0987654321';
    this.userPayment.email = 'vu@gmail.com';
    this.userPayment.address = 'La khe, Ha Dong, Ha Noi';
    this.payment.billCode = '6789X8789S';
    this.payment.orderCode = '0987895XS8';
    this.payment.paymentCode = '222222SS22';
    this.payment.paymentMethod = 'Thanh toán trả trước';
    this.payment.createdDate = '2023-11-20T01:34:12.367Z';
    this.payment.status = 'DATHANHTOAN';
    this.serviceInfo.name = 'Volume';
    this.serviceInfo.price = 1000000;
    this.serviceInfo.duration = 6;
    this.serviceInfo.amount = 1;
    this.serviceInfo.currency = 6000000;
    this.listServiceInfo.push(this.serviceInfo);
    this.listServiceInfo.push(this.serviceInfo);
  }

  payNow(){}
}
