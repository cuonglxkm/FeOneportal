import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KubernetesCluster } from '../model/cluster.model';
import { ClusterService } from '../services/cluster.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-detail-cluster',
  templateUrl: './detail-cluster.component.html',
  styleUrls: ['./detail-cluster.component.css'],
})
export class DetailClusterComponent implements OnInit {

  serviceOrderCode: string;
  detailCluster: KubernetesCluster;

  autoScaleValue: boolean;
  autoHealingValue: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cluserService: ClusterService,
    private notificationService: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
    });
  }

  getDetailCluster(serviceOrderCode: string) {
    this.cluserService.getDetailCluster(serviceOrderCode)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.detailCluster = new KubernetesCluster(r.data);

        this.autoScaleValue = this.detailCluster.autoScale;
        this.autoHealingValue = this.detailCluster.autoHealing;

      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  handleExtension() {
    console.log(this.serviceOrderCode);
  }

  handleEditCluster() {
    console.log(this.serviceOrderCode);
  }

  handleShowModalUpgradeVersion() {
    console.log(this.detailCluster.upgradeVersion);
  }

}
