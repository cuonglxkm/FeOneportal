import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import {
  DataChart,
  PaymentCostUse,
  SubscriptionsDashboard,
  SubscriptionsNearExpire
} from '../../shared/models/dashboard.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';
import { Pie } from '@antv/g2plot';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';


@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  subscriptionsDashboard: SubscriptionsDashboard[];
  subscriptionDashboardService = new SubscriptionsDashboard();
  subscriptionDashboardActive = new SubscriptionsDashboard();
  subscriptionDashboardNearExpire = new SubscriptionsDashboard();
  subscriptionDashboardExpire = new SubscriptionsDashboard();

  listSubscriptionsNearExpire: BaseResponse<SubscriptionsNearExpire[]>;
  listPaymentCostUse: BaseResponse<PaymentCostUse[]>;

  pageSize: number = 5;
  pageIndex: number = 1;

  isLoading: boolean = false;

  dataPaymentCost: DataChart[];

  @ViewChild('pieChart', { static: true }) private pieChart: ElementRef;

  constructor(private dashboardService: DashboardService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
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

  getSubscriptionsDashboard() {
    this.isLoading = true;
    this.dashboardService.getHeader().subscribe(data => {
      console.log(data);
    });
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.isLoading = false;
      this.subscriptionsDashboard = data;
      this.subscriptionsDashboard.forEach(item => {
        if (item.type == 'total') {
          this.subscriptionDashboardService = item;
        }
        if (item.type == 'active') {
          this.subscriptionDashboardActive = item;
        }
        if (item.type == 'near-expire') {
          this.subscriptionDashboardNearExpire = item;
        }
        if (item.type == 'expire') {
          this.subscriptionDashboardExpire = item;
        }
      });
    });
  }

  getSubscriptionsNearExpire() {
    this.isLoading = true;
    this.dashboardService.getSubscriptionsNearExpire(this.pageSize, this.pageIndex).subscribe(data => {
      this.listSubscriptionsNearExpire = data;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
    });
  }

  getPaymentCost() {
    this.isLoading = true;
    this.dashboardService.paymentCostUsePaging(this.pageSize, this.pageIndex).subscribe(data => {
      this.listPaymentCostUse = data;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.listPaymentCostUse = null;
    });
  }

  getDataChart() {
    this.isLoading = true;
    this.dashboardService.paymentCostUseTotal().subscribe(data => {
      this.isLoading = false;
      this.dataPaymentCost = data;

      const dataChart = this.dataPaymentCost.map(item => ({
        type: this.getServiceName(item.serviceType),
        value: item.totalAmount,
        formattedValue: new Intl.NumberFormat('de-DE').format(item.totalAmount)
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
        theme: 'custom-theme',
        tooltip: {
          formatter: (data) => {
            const total = dataChart.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((data.value / total) * 100).toFixed(2);
            return {
              name: data.type,
              value: `${new Intl.NumberFormat('de-DE').format(data.value)} (${percentage}%)`
            };
          }
        }
      });

      piePlot.render();
    }, error => {
      this.isLoading = false;
      this.dataPaymentCost = [];
    });
  }


  navigateToDetailPayment(id: number, paymentOrder: string) {
    this.router.navigate(['/app-smart-cloud/billing/payments/detail/' + id + '/' + paymentOrder]);
  }

  navigateToExtend(serviceInstanceId: number, serviceType: number) {
    switch (serviceType) {
      case 1:
        //VM
        this.router.navigate(['/app-smart-cloud/instances/instances-extend/'+ serviceInstanceId])
        break;
      case 2:
        //VOLUME
        this.router.navigate(['/app-smart-cloud/volumes/renew/' + serviceInstanceId]);
        break;
      case 3:
        //SNAPSHOT
        break;
      case 4:
        //IP PUBLIC
        this.router.navigate(['/app-smart-cloud/ip-public/extend/' + serviceInstanceId])
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
        this.router.navigate(['/app-smart-cloud/project/extend/' + serviceInstanceId])
        break;
      case 13:
        //OBJECT STORAGE
        break;
      case 14:
        this.router.navigate(['/app-smart-cloud/backup/packages/extend/', serviceInstanceId]);
        //BACKUP_PACKET
        break;
      case 15:
        this.router.navigate(['/app-smart-cloud/load-balancer/extend/normal/', serviceInstanceId]);
        //LOAD BALANCER SDN
        break;
      case 16:
        //VLAN
        break;
      case 17:
        //ROUTER
        break;
      case 18:
        //FILE SYSTEM
        this.router.navigate(['/app-smart-cloud/file-storage/file-system/' + serviceInstanceId + '/extend']);
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
        //FILE SYSTEM SNAPSHOT
        break;
      case 100:
        //OTHER
        break;
      default:
        break;
    }
  }

  getServiceName(serviceType) {
    switch (serviceType) {
      case 1:
        //VM
        return this.i18n.fanyi('app.instances')
      case 2:
        //VOLUME
        return this.i18n.fanyi('app.volume')
      case 3:
        //SNAPSHOT
        return this.i18n.fanyi('app.snapshot')
      case 4:
        //IP PUBLIC
        return this.i18n.fanyi('app.ip-public')
      case 5:
        //LOAD BALANCER F5
        return this.i18n.fanyi('app.load-balancer.f5')
      case 6:
        // VM SNAPSHOT
        return this.i18n.fanyi('app.vm.snapshot')
      case 7:
        //SNAPSHOT VOLUME
        return this.i18n.fanyi('app.snapshot.volume')
      case 8:
        // BACKUP VOLUME
        return this.i18n.fanyi('app.backup.volume')
      case 9:
        //BACKUP VM
        return this.i18n.fanyi('app.backup.vm')
      case 10:
        //KEY PAIR
        return this.i18n.fanyi('app.keypair')
      case 11:
        // SECURITY_GROUP
        return this.i18n.fanyi('app.security.group')
      case 12:
        //VPC
        return this.i18n.fanyi('app.vpc')
      case 13:
        //OBJECT STORAGE
        return this.i18n.fanyi('app.object-storage')
      case 14:
        //BACKUP_PACKET
        return this.i18n.fanyi('app.backup-package')
      case 15:
        //LOAD BALANCER SDN
        return this.i18n.fanyi('app.load-balancer')
      case 16:
        //VLAN
        return this.i18n.fanyi('app.vlan')
      case 17:
        //ROUTER
        return this.i18n.fanyi('app.router')
      case 18:
        //FILE SYSTEM
        return this.i18n.fanyi('app.file-system')
      case 19:
        //K8s
        return this.i18n.fanyi('app.k8s')
      case 20:
        //VPN_SITE_TO_SITE
        return this.i18n.fanyi('app.vpns2s')
      case 21:
        //KAFKA
        return this.i18n.fanyi('app.kafka')
      case 22:
        //SNAPSHOT_PACKAGE
        return this.i18n.fanyi('app.snapshot-package1')
      case 23:
        //MONGO_DB
        return this.i18n.fanyi('app.mongo')
      case 24:
        //FILE SYSTEM SNAPSHOT
        return this.i18n.fanyi('app.file-system-snapshot')
      case 100:
        //OTHER
        return this.i18n.fanyi('app.other')
      default:
        break;
    }
  }

  ngOnInit() {
    this.getSubscriptionsDashboard();
    this.getSubscriptionsNearExpire();
    this.getPaymentCost();
    this.getDataChart();
  }
}
