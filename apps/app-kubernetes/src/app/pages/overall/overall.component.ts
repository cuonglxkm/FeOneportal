import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KubernetesCluster } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { VlanService } from '../../services/vlan.service';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { switchMap } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'one-portal-overall',
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.css'],
})
export class OverallComponent implements OnInit {

  serviceOrderCode: string;
  detailCluster: KubernetesCluster;

  selectedIndexTab: number = 0;

  constructor(
    private clusterService: ClusterService,
    private vlanService: VlanService,
    private notificationService: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.selectedIndexTab = +localStorage.getItem('currentTab') || 0;

    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
      this.getSSHKey(this.serviceOrderCode);
    });
  }

  regionId: number;
  projectId: number;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onChangeTab(index: number) {
    this.selectedIndexTab = index;
    localStorage.setItem('currentTab', index + '');
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.detailCluster = new KubernetesCluster(r.data);

          this.getVlanbyId(this.detailCluster.vpcNetworkId);
          this.getKubeConfig(this.detailCluster.serviceOrderCode);

          this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);
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

  sshKeyString: string;
  getSSHKey(serviceOrderCode: string) {
    this.clusterService.getSSHKey(serviceOrderCode)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.sshKeyString = r.data;
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
