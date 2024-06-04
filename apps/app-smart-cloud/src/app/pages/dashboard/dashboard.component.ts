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


@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  subscriptionsDashboard = new SubscriptionsDashboard();

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
    this.dashboardService.getHeader().subscribe(data => {
      console.log(data)
    });
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.subscriptionsDashboard = data;
      this.dashboardSubscription = data?.details;
      const transformedArray = this.dashboardSubscription.map(item => ({
        item: item.serviceTypeName,
        count: item.dataCount
      }));
      console.log('data', transformedArray);

      const dataChart = this.dashboardSubscription.map(item => ({
        type: item.serviceTypeName,
        value: item.dataCount
      }));
      const piePlot = new Pie(this.pieChart.nativeElement, {
        appendPadding: 10,
        data: dataChart,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
          type: 'inner',
          offset: '-10%',
          content: '{percentage}'
        },
        interactions: [{ type: 'element-active' }],
        theme: 'custom-theme'
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

  navigateToExtend(serviceInstanceId: number, serviceType: number) {
    switch (serviceType) {
      case 1:
        //VM
        break;
      case 2:
        //VOLUME
        this.router.navigate(['/app-smart-cloud/volumes/renew/', serviceInstanceId])
        break;
      case 3:
        //SNAPSHOT
        break;
      case 4:
        //IP PUBLIC
        break;
      case 5:
        //LOAD BALANCER F5
        break;
      case 6:
        // VM SNAPSHOT
        break;
      case 7:
        //SNAPSHOT VOLUME
        break;
      case 8:
        // BACKUP VOLUME
        break;
      case 9:
        //BACKUP VM
        break;
      case 10:
        //KEY PAIR
        break;
      case 11:
        // SECURITY_GROUP
        break;
      case 12:
        //VPC
        break;
      case 13:
        //OBJECT STORAGE
        break;
      case 14:
        this.router.navigate(['/app-smart-cloud/backup/packages/extend/', serviceInstanceId])
        //BACKUP_PACKET
        break;
      case 15:
        this.router.navigate(['/app-smart-cloud/load-balancer/extend/normal/', serviceInstanceId])
        //LOAD BALANCER SDN
        break;
      case 16:
        //VLAN
        break;
      case 17:
        //ROUTER
        break;
      case 18:
        this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + serviceInstanceId + '/extend'])
        //SHAREFILE_STORAGE
        break;
      case 19:
        //K8s
        break;
      case 20:
        //VPN_SITE_TO_SITE
        break;
      case 21:
        //KAFKA
        break;
      case 22:
        //SNAPSHOT_PACKAGE
        break;
      case 23:
        //MONGO_DB
        break;
      case 24:
        //OTHER
        break;
      default:
        break;
    }
  }
  ngOnInit() {
    this.getSubscriptionsDashboard();
    this.getSubscriptionsNearExpire();
    this.getPaymentCost();
  }
}
