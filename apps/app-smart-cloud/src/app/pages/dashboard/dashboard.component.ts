import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import { PaymentCostUse, SubscriptionsDashboard, SubscriptionsNearExpire } from '../../shared/models/dashboard.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit{
  subscriptionsDashboard = new SubscriptionsDashboard()
  subscriptionsNearExpire = new SubscriptionsNearExpire()
  paymentCostUse = new PaymentCostUse()

  listSubscriptionsNearExpire: BaseResponse<SubscriptionsNearExpire[]>
  listPaymentCostUse: BaseResponse<PaymentCostUse[]>

  pageSize: number = 5
  pageIndex: number = 1

  isLoadingNearExpire: boolean = false
  isLoadingPaymentCost: boolean = false

  constructor(private dashboardService: DashboardService,
              private router: Router) {
  }

  getSubscriptionsDashboard() {
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.subscriptionsDashboard = data
    })
  }

  getSubscriptionsNearExpire() {
    this.isLoadingNearExpire = true
    this.dashboardService.getSubscriptionsNearExpire(this.pageSize, this.pageIndex).subscribe(data => {
      this.listSubscriptionsNearExpire = data
      this.isLoadingNearExpire = false
    })
  }

  getPaymentCost() {
    this.isLoadingPaymentCost = true
    this.dashboardService.paymentCostUse(this.pageSize, this.pageIndex).subscribe(data => {
      this.listPaymentCostUse = data
      this.isLoadingPaymentCost = false
    })
  }

  onPageSizeNearExpireChange(value) {
    this.pageSize = value
    this.getSubscriptionsNearExpire();
  }

  onPageIndexCostChange(value) {
    this.pageIndex = value
    this.getPaymentCost();
  }

  onPageSizeCostChange(value) {
    this.pageSize = value
    this.getPaymentCost();
  }

  onPageIndexNearExpireChange(value) {
    this.pageIndex = value
    this.getSubscriptionsNearExpire();
  }

  navigateToDetailPayment(id: number, paymentOrder: string) {
    this.router.navigate(['/app-smart-cloud/billing/payments/detail/' + id +'/' + paymentOrder]);
  }

  ngOnInit() {
    this.getSubscriptionsDashboard();
    this.getSubscriptionsNearExpire();
    this.getPaymentCost();
  }
}
