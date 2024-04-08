import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KubernetesCluster } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { VlanService } from '../../services/vlan.service';

@Component({
  selector: 'one-portal-overall',
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.css'],
})
export class OverallComponent implements OnInit {

  serviceOrderCode: string;
  detailCluster: KubernetesCluster;

  constructor(
    private clusterService: ClusterService,
    private vlanService: VlanService,
    private notificationService: NzNotificationService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
    });
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.detailCluster = new KubernetesCluster(r.data);

          this.getVlanbyId(this.detailCluster.vpcNetworkId);
          this.getKubeConfig(this.detailCluster.serviceOrderCode);

        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      });
  }

  yamlString: string;
  getKubeConfig(serviceOrderCode: string) {
    this.clusterService.getKubeConfig(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.yamlString = r.data;
        } else {
          this.notificationService.error("Thất bại", "Có lỗi xảy ra trong quá trình tải xuống. Vui lòng thử lại sau");
        }
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

}
