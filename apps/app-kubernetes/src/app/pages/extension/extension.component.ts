import { Component, Inject, OnInit } from '@angular/core';
import { KubernetesCluster, Order, OrderItem } from '../../model/cluster.model';
import { RegionModel } from '../../shared/models/region.model';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { ProjectModel } from '../../shared/models/project.model';
import { ClusterService } from '../../services/cluster.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PackModel } from '../../model/pack.model';
import { forkJoin } from 'rxjs';
import { VlanService } from '../../services/vlan.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { PriceModel } from '../../model/price.model';
import { UserInfo } from '../../model/user.model';

@Component({
  selector: 'one-portal-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.css'],
})
export class ExtensionComponent implements OnInit {

  detailCluster: KubernetesCluster;
  serviceOrderCode: string;

  totalCost: number;
  vatCost: number;
  costByMonth: number;
  costAMonth: number;
  extendMonth: number;
  expiryDate: Date;

  listOfServicePack: PackModel[];
  listOfPriceItem: PriceModel[];

  currentPack: PackModel;

  isSubmitting: boolean;
  isShowModalCancelExtend: boolean;

  constructor(
    private clusterService: ClusterService,
    private notificationService: NzNotificationService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private vlanService: VlanService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.isShowModalCancelExtend = false;
    this.isSubmitting = false;
    this.extendMonth = 1;
    this.listOfServicePack = [];
    this.listOfPriceItem = [];

    this.getListPriceItem();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
    });
    this.getUserInfo(this.tokenService.get()?.userId);
  }

  regionId: number;
  projectId: number;
  cloudProfileId: string;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;

    let detailClusterObs = this.clusterService.getDetailCluster(this.serviceOrderCode);
    let listPackObs = this.clusterService.getListPack(this.cloudProfileId);

    forkJoin([detailClusterObs, listPackObs]).subscribe((response: any[]) => {
      // get list pack
      response[1].data?.forEach(item => {
        const p = new PackModel(item);
        this.listOfServicePack.push(p);
      });

      // get detail cluster
      this.detailCluster = new KubernetesCluster(response[0].data);
      this.expiryDate = this.detailCluster.expiredDate;

      this.getVlanbyId(this.detailCluster.vpcNetworkId);

      this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);

      // init pack info
      if (this.detailCluster.offerId != 0) {
        this.currentPack = this.listOfServicePack.find(pack => pack.offerId = this.detailCluster.offerId);
        // console.log({abc: this.currentPack});
      }

      // init calculate cost
      this.setUsageTime();
    });
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  userInfo: UserInfo;
  getUserInfo(userId: number) {
    this.clusterService.getUserInfo(userId)
    .subscribe((r: any) => {
      this.userInfo = r;
    });
  }

  vpcNetwork: string;
  getVlanbyId(vlanId: number) {
    this.vlanService.getVlanById(vlanId)
      .subscribe((r: any) => {
        if (r) {
          this.vpcNetwork = r.name;
        }
      });
  }

  getListPriceItem() {
    this.clusterService.getListPriceItem()
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfPriceItem = r.data;
        this.initPrice();
      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  priceOfCpu: number;
  priceOfRam: number;
  priceOfSsd: number;
  priceOfHdd: number;
  initPrice() {
    this.listOfPriceItem.forEach(data => {
      switch (data.item) {
        case 'cpu':
          this.priceOfCpu = data.price;
          break;
        case 'ram':
          this.priceOfRam = data.price;
          break;
        case 'storage_ssd':
          this.priceOfSsd = data.price;
          break;
        case 'storage_hdd':
          this.priceOfHdd = data.price;
          break;
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  statusInput: string;
  msgError: string;
  errMin = 'cluster.validate.min-error.extend';
  errMax = 'cluster.validate.max-error.extend';
  onChangeDuration() {
    if (this.extendMonth < 1) {
      this.statusInput = 'error';
      this.msgError = this.errMin;
      return;
    } else if (this.extendMonth > 100) {
      this.statusInput = 'error';
      this.msgError = this.errMax;
      return;
    } else {
      this.statusInput = null;
      this.msgError = '';
    }
    this.setUsageTime();
  }


  expectedExpirationDate: number;
  setUsageTime() {
    let d = new Date(this.expiryDate);
    d.setDate(d.getDate() + Number(this.extendMonth) * 30 + 1);
    this.expectedExpirationDate = d.getTime();

    this.onCalculatePrice();
  }

  onCalculatePrice() {
    let offerId = this.detailCluster.offerId;

    if (offerId != 0) {
      this.costAMonth = this.currentPack.price;
      this.costByMonth = this.currentPack.price * this.extendMonth;
    } else {
      let wgs = this.detailCluster.workerGroup;
      let totalRam = 0, totalCpu = 0, totalStorage = 0;

      for (let i = 0; i < wgs.length; i++) {
        const cpu = wgs[i].cpu ? wgs[i].cpu : 0;
        const ram = wgs[i].ram ? wgs[i].ram : 0;
        const storage = +wgs[i].volumeSize ? +wgs[i].volumeSize : 0;
        const autoScale = wgs[i].autoScaling;
        let nodeNumber: number;
        if (autoScale) {
          // TODO: ...
        } else {
          nodeNumber = wgs[i].minimumNode ? wgs[i].minimumNode : 0;
        }

        totalCpu += nodeNumber * cpu;
        totalRam += nodeNumber * ram;
        totalStorage += nodeNumber * storage;
      }

      this.costAMonth = totalRam * this.priceOfRam + totalCpu * this.priceOfCpu + totalStorage * this.priceOfSsd;
      this.costByMonth = this.costAMonth * this.extendMonth;
    }

    this.vatCost = this.costByMonth * 0.1;
    this.totalCost = this.costByMonth + this.vatCost;
  }

  onCalculateResource() {
    const wgs = this.detailCluster.workerGroup;
    let totalCpu = 0, totalRam = 0, totalStorage = 0;
    for (let i = 0; i < wgs.length; i++) {
      const cpu = wgs[i].cpu ? wgs[i].cpu : 0;
      const ram = wgs[i].ram ? wgs[i].ram : 0;
      const storage = +wgs[i].volumeSize ? +wgs[i].volumeSize : 0;
      const autoScale = wgs[i].autoScaling;
      let nodeNumber: number;
      if (autoScale) {
        // TODO: ...
      } else {
        nodeNumber = wgs[i].minimumNode ? wgs[i].minimumNode : 0;
      }

      totalCpu += nodeNumber * cpu;
      totalRam += nodeNumber * ram;
      totalStorage += nodeNumber * storage;
    }
    return {totalRam, totalCpu, totalStorage};
  }

  onExtendService() {
    let order = new Order();
    const userId = this.tokenService.get()?.userId;
    order.customerId = userId;
    order.createdByUserId = userId;
    order.orderItems = [];

    let orderItem = new OrderItem();
    orderItem.price = this.costAMonth;
    orderItem.serviceDuration = this.extendMonth;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = KubernetesConstant.CLUSTER_EXTEND_TYPE;

    const resource = this.onCalculateResource();
    let req = {
      serviceName: this.detailCluster.clusterName,
      newExpireDate: new Date(this.expectedExpirationDate).toISOString().substring(0, 19),
      serviceType: KubernetesConstant.K8S_TYPE_ID,
      currentOfferId: this.detailCluster.offerId,
      totalRam: resource.totalRam,
      totalCpu: resource.totalCpu,
      totalStorage: resource.totalStorage,
      jsonData: JSON.stringify({
        ServiceOrderCode: this.serviceOrderCode,
        ExtendMonth: this.extendMonth,
        Id: this.userInfo.id,
        UserName: this.userInfo.name,
        PhoneNumber: this.userInfo.phoneNumber,
        UserEmail: this.userInfo.email
      })
    };
    orderItem.specification = JSON.stringify(req);

    order.orderItems = [...order.orderItems, orderItem];

    // console.log({order: order});
    let returnPath = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: order, path: returnPath}});
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }

  showModalCancelExtend() {
    this.isShowModalCancelExtend = true;
  }

  handleCancelModal() {
    this.isShowModalCancelExtend = false;
  }

}
