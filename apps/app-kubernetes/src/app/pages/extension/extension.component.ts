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
  costPerMonth: number;
  extendMonth: number;
  expiryDate: number;

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
      let d = new Date(this.detailCluster.createdDate);
      d.setMonth(d.getMonth() + Number(this.detailCluster.usageTime));
      this.expiryDate = d.getTime();

      this.getVlanbyId(this.detailCluster.vpcNetworkId);

      this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);

      // init pack info
      if (this.detailCluster.offerId != 0) {
        this.currentPack = this.listOfServicePack.find(pack => pack.offerId = this.detailCluster.offerId);
        console.log({abc: this.currentPack});
      }

      // init calculate cost
      this.onSelectUsageTime(this.extendMonth);
    });
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
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

  expectedExpirationDate: number;
  onSelectUsageTime(event: any) {
    if (event) {
      let d = new Date(this.expiryDate);
      d.setMonth(d.getMonth() + Number(event));
      d.setDate(d.getDate() + 1);
      this.expectedExpirationDate = d.getTime();

      this.onCalculatePrice();
    }
  }

  onCalculatePrice() {
    let offerId = this.detailCluster.offerId;

    if (offerId != 0) {
      this.costPerMonth = this.currentPack.price;
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

      this.costPerMonth = totalRam * this.priceOfRam + totalCpu * this.priceOfCpu + totalStorage * this.priceOfSsd;
    }

    this.vatCost = this.costPerMonth * 0.1;
    this.totalCost = (this.costPerMonth + this.vatCost) * this.extendMonth;
  }

  onExtendService() {
    let order = new Order();
    const userId = this.tokenService.get()?.userId;
    order.customerId = userId;
    order.createdByUserId = userId;
    order.orderItems = [];

    let orderItem = new OrderItem();
    orderItem.price = this.costPerMonth;
    orderItem.serviceDuration = this.extendMonth;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = KubernetesConstant.CLUSTER_EXTEND_TYPE;

    let req = {
      serviceName: this.detailCluster.clusterName,
      jsonData: JSON.stringify({
        ServiceOrderCode: this.serviceOrderCode,
        ExtendMonth: this.extendMonth
      })
    };
    orderItem.specification = JSON.stringify(req);

    order.orderItems = [...order.orderItems, orderItem];

    // console.log({order: order});
    let returnPath = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: order, path: returnPath}});
  }

  showModalCancelExtend() {
    this.isShowModalCancelExtend = true;
  }

  handleCancelModal() {
    this.isShowModalCancelExtend = false;
  }

}
