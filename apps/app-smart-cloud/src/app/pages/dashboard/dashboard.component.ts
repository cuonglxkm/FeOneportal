import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import {
  ChartDataSubscription,
  PaymentCostUse,
  SubscriptionsDashboard,
  SubscriptionsNearExpire
} from '../../shared/models/dashboard.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';
import { Pie } from '@antv/g2plot';
import { Chart } from '@antv/g2';

interface dataChart {
  name: string;
  count: number;
}

@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  subscriptionsDashboard = new SubscriptionsDashboard();
  subscriptionsNearExpire = new SubscriptionsNearExpire();
  paymentCostUse = new PaymentCostUse();

  listSubscriptionsNearExpire: BaseResponse<SubscriptionsNearExpire[]>;
  listPaymentCostUse: BaseResponse<PaymentCostUse[]>;

  pageSize: number = 5;
  pageIndex: number = 1;

  isLoadingNearExpire: boolean = false;
  isLoadingPaymentCost: boolean = false;

  dashboardSubscription: ChartDataSubscription[] = [];

  @ViewChild('pieChart', { static: true }) private pieChart: ElementRef;

  constructor(private dashboardService: DashboardService,
              private router: Router) {
  }

  getSubscriptionsDashboard() {
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.subscriptionsDashboard = data;
      this.dashboardSubscription = data?.details;
      const transformedArray = this.dashboardSubscription.map(item => ({
        item: item.serviceTypeName,
        count: item.dataCount
      }));
      console.log('daata', transformedArray);

      const data3 = this.dashboardSubscription.map(item => ({
        type: item.serviceTypeName,
        value: item.dataCount
      }))
      const piePlot = new Pie(this.pieChart.nativeElement, {
        appendPadding: 10,
        data: data3,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
          type: 'inner',
          offset: '-10%',
          content: '{percentage}',
        },
        interactions: [{ type: 'element-active' }],
        theme: 'custom-theme',
      });

      piePlot.render();
    });
  }

  getSubscriptionsNearExpire() {
    this.isLoadingNearExpire = true;
    this.dashboardService.getSubscriptionsNearExpire(this.pageSize, this.pageIndex).subscribe(data => {
      this.listSubscriptionsNearExpire = data;
      this.isLoadingNearExpire = false;
    });
  }

  getPaymentCost() {
    this.isLoadingPaymentCost = true;
    this.dashboardService.paymentCostUse(this.pageSize, this.pageIndex).subscribe(data => {
      this.listPaymentCostUse = data;
      this.isLoadingPaymentCost = false;
    });
  }

  onPageSizeNearExpireChange(value) {
    this.pageSize = value;
    this.getSubscriptionsNearExpire();
  }

  onPageIndexCostChange(value) {
    this.pageIndex = value;
    this.getPaymentCost();
  }

  onPageSizeCostChange(value) {
    this.pageSize = value;
    this.getPaymentCost();
  }

  onPageIndexNearExpireChange(value) {
    this.pageIndex = value;
    this.getSubscriptionsNearExpire();
  }

  navigateToDetailPayment(id: number, paymentOrder: string) {
    this.router.navigate(['/app-smart-cloud/billing/payments/detail/' + id + '/' + paymentOrder]);
  }

  ngOnInit() {
    this.getSubscriptionsDashboard();
    this.getSubscriptionsNearExpire();
    this.getPaymentCost();
  }
}
