import { Component, OnInit } from '@angular/core';
import { KubernetesCluster } from '../../model/cluster.model';
import { RegionModel } from '../../shared/models/region.model';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { ProjectModel } from '../../shared/models/project.model';
import { ClusterService } from '../../services/cluster.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'one-portal-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.css'],
})
export class ExtensionComponent implements OnInit {

  detailCluster: KubernetesCluster;
  serviceOrderCode: string;

  constructor(
    private clusterService: ClusterService,
    private notificationService: NzNotificationService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
    });
  }

  regionId: number;
  projectId: number;
  cloudProfileId: string;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.detailCluster = new KubernetesCluster(r.data);

          this.titleService.setTitle('Gia hạn dịch vụ ' + this.detailCluster.clusterName);
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      });
  }

}
