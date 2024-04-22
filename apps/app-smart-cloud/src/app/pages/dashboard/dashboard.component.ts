import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import { PaymentCostUse, SubscriptionsDashboard, SubscriptionsNearExpire } from '../../shared/models/dashboard.model';

@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit{
  subscriptionsDashboard = new SubscriptionsDashboard()
  subscriptionsNearExpire = new SubscriptionsNearExpire()
  paymentCostUse = new PaymentCostUse()

  listSubscriptionsNearExpire: SubscriptionsNearExpire[] = []
  listPaymentCostUse: PaymentCostUse[] = []

  pageSize: number = 10
  pageIndex: number = 1

  constructor(private dashboardService: DashboardService) {
  }

  getSubscriptionsDashboard() {
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.subscriptionsDashboard = data
    })
  }

  getSubscriptionsNearExpire() {
    this.dashboardService.getSubscriptionsNearExpire(this.pageSize, this.pageIndex).subscribe(data => {
      this.listSubscriptionsNearExpire = data
    })
  }

  getPaymentCost() {
    this.dashboardService.paymentCostUse(this.pageSize, this.pageIndex).subscribe(data => {
      this.listPaymentCostUse = data
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

  ngOnInit() {
    this.getSubscriptionsDashboard();
    this.getSubscriptionsNearExpire();
    this.getPaymentCost();
  }
}
