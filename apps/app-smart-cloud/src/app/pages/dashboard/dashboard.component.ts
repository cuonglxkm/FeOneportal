import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { PaymentService } from '../../shared/services/payment.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {
  region = JSON.parse(localStorage.getItem('regionId'));
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

  value: string;

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;

  pageSizes = [5, 10, 20, 50];

  @ViewChild('pieChart', { static: true }) private pieChart: ElementRef;

  breadcrumb: boolean = true;

  constructor(private dashboardService: DashboardService,
    private router: Router,
    private paymentService: PaymentService,
    private notification: NzNotificationService,
    private commonService: CommonService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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

  //Lấy thông tin dịch vụ 4 card: Thông tin dịch vụ, Đang hoạt động, Sắp hết hạn và Hết hạn
  getSubscriptionsDashboard() {
    this.isLoading = true;
    this.dashboardService.getSubscriptionsDashboard().subscribe(data => {
      this.isLoading = false;
      this.subscriptionsDashboard = data;
      console.log("123", this.subscriptionsDashboard)
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

  changeInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressed = false;
    this.dataSubjectInputSearch.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectInputSearch.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressed) {
        this.value = res.trim();
        this.getSubscriptionsNearExpire();
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getSubscriptionsNearExpire();
  }

  loadingNearExpire: boolean = false;

  //Lấy thông tin dịch vụ sắp hết hạn
  getSubscriptionsNearExpire() {
    this.loadingNearExpire = true;
    this.dashboardService.getSubscriptionsNearExpire(this.pageSize, this.pageIndex, this.value).subscribe(data => {
      this.listSubscriptionsNearExpire = data;
      console.log("listSubscriptionsNearExpire", this.listSubscriptionsNearExpire)
      this.loadingNearExpire = false;
    }, error => {
      this.loadingNearExpire = false;
      // this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'))
    });
  }

  //Lấy thông tin dịch vụ chi phí sử dụng
  getPaymentCost() {
    this.isLoading = true;
    this.dashboardService.paymentCostUsePaging(this.pageSize, this.pageIndex).subscribe(data => {
      this.listPaymentCostUse = data;
      // console.log('list pay ment', this.listPaymentCostUse[0].serviceTypes)
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.listPaymentCostUse = null;
      // this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'))
    });
  }

  //Vẽ biểu đồ chi phí sử dụng
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
          content: ''
        },
        interactions: [{ type: 'element-active' }],
        theme: 'custom-theme',
        tooltip: {
          formatter: (data) => {
            const total = dataChart.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((data.value / total) * 100).toFixed(2);
            return {
              name: data.type,
              value: `${new Intl.NumberFormat('de-DE').format(data.value)} VND`
            };
          }
        }
      });

      piePlot.render();
    }, error => {
      this.isLoading = false;
      this.dataPaymentCost = [];
      // this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'))
    });
  }


  //Dẫn sang xem chi tiết thanh toán
  navigateToDetailPayment(id: number, paymentOrder: string) {
    this.isLoading = true;
    this.paymentService.getPaymentByPaymentNumber(paymentOrder).subscribe(data => {
      this.isLoading = false;
      this.router.navigate(['/app-smart-cloud/billing/payments/detail/' + id + '/' + data.orderNumber]);
    });
  }

  //Dẫn sang trang gia hạn
  navigateToExtend(serviceInstanceId: number, serviceType: number, regionId: number) {
    switch (serviceType) {
      case 1:
        //VM
        // this.router.navigate(['/app-smart-cloud/instances/instances-extend/' + serviceInstanceId]);
        this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-extend/' + serviceInstanceId, '/app-smart-cloud/instances-advance/instances-extend/' + serviceInstanceId)
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
        this.router.navigate(['/app-smart-cloud/ip-public/extend/' + serviceInstanceId]);
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
        this.router.navigate(['/app-smart-cloud/project/extend/' + serviceInstanceId]);
        break;
      case 13:
        //OBJECT STORAGE
        if (regionId === 7) {
          this.router.navigate(['/app-smart-cloud/object-storage-advance/extend/']);
        } else if (regionId === 5) {
          this.router.navigate(['/app-smart-cloud/object-storage/extend/']);
        }
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
        this.router.navigate(['/app-smart-cloud/vpn-site-to-site/extend/' + serviceInstanceId]);
        break;
      case 21:
        //KAFKA
        break;
      case 22:
        //SNAPSHOT_PACKAGE
        this.router.navigate(['/app-smart-cloud/snapshot/packages/extend/' + serviceInstanceId]);
        break;
      case 23:
        //MONGO_DB
        break;
      case 24:
        //FILE SYSTEM SNAPSHOT
        this.router.navigate(['/app-smart-cloud/file-system-snapshot/extend/' + serviceInstanceId]);
        break;
      case 27:
        //WAF
        this.router.navigate(['/app-smart-cloud/waf/extend/' + serviceInstanceId]);
        break;
      case 100:
        //OTHER
        break;
      default:
        break;
    }
  }

  // Lấy tên của dịch vụ (sử dụng để phục vụ i18n)
  getServiceName(serviceType) {
    switch (serviceType) {
      case 1:
        //VM
        return this.i18n.fanyi('app.instances');
      case 2:
        //VOLUME
        return this.i18n.fanyi('app.volume');
      case 3:
        //SNAPSHOT
        return this.i18n.fanyi('app.snapshot');
      case 4:
        //IP PUBLIC
        return this.i18n.fanyi('app.ip-public');
      case 5:
        //LOAD BALANCER F5
        return this.i18n.fanyi('app.load-balancer.f5');
      case 6:
        // VM SNAPSHOT
        return this.i18n.fanyi('app.vm.snapshot');
      case 7:
        //SNAPSHOT VOLUME
        return this.i18n.fanyi('app.snapshot.volume');
      case 8:
        // BACKUP VOLUME
        return this.i18n.fanyi('app.backup.volume');
      case 9:
        //BACKUP VM
        return this.i18n.fanyi('app.backup.vm');
      case 10:
        //KEY PAIR
        return this.i18n.fanyi('app.keypair');
      case 11:
        // SECURITY_GROUP
        return this.i18n.fanyi('app.security.group');
      case 12:
        //VPC
        return this.i18n.fanyi('app.vpc');
      case 13:
        //OBJECT STORAGE
        return this.i18n.fanyi('app.object-storage');
      case 14:
        //BACKUP_PACKET
        return this.i18n.fanyi('app.backup-package');
      case 15:
        //LOAD BALANCER SDN
        return this.i18n.fanyi('app.load-balancer');
      case 16:
        //VLAN
        return this.i18n.fanyi('app.vlan');
      case 17:
        //ROUTER
        return this.i18n.fanyi('app.router');
      case 18:
        //FILE SYSTEM
        return this.i18n.fanyi('app.file-system');
      case 19:
        //K8s
        return this.i18n.fanyi('app.k8s');
      case 20:
        //VPN_SITE_TO_SITE
        return this.i18n.fanyi('app.vpns2s');
      case 21:
        //KAFKA
        return this.i18n.fanyi('app.kafka');
      case 22:
        //SNAPSHOT_PACKAGE
        return this.i18n.fanyi('app.snapshot-package1');
      case 23:
        //MONGO_DB
        return this.i18n.fanyi('app.mongo');
      case 24:
        //FILE SYSTEM SNAPSHOT
        return this.i18n.fanyi('app.file-system-snapshot');

      case 27:
        //WAF
        return this.i18n.fanyi('app.WAF');
        break;
      case 29:
        //WAF
        return this.i18n.fanyi('app.Endpoint');
      case 100:
        //OTHER
        return this.i18n.fanyi('app.other');
      default:
        break;
    }
  }

  //Lấy thông tin role khi vào trang DASHBOARD
  getUserRole(): string[] {
    const token = this.tokenService.get()?.token;
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || []; // Adjust 'roles' to the actual key used in your token
    }
    return [];
  }

  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('The token is not valid JWT');
    }
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }

  ngOnInit() {
    setTimeout(() => {
      this.getSubscriptionsDashboard();
      this.getSubscriptionsNearExpire();
      this.getPaymentCost();
      this.getDataChart();
    }, 1500);
    this.onChangeInputChange();
    console.log('role', this.getUserRole());
    if (this.getUserRole().includes('SI')) {
      localStorage.setItem('role', 'SI');
    } else {
      localStorage.setItem('role', '');
    }
  }
}
