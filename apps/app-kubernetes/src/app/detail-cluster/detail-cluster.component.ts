import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KubernetesCluster, UpgradeVersionClusterDto, WorkerGroupModel } from '../model/cluster.model';
import { ClusterService } from '../services/cluster.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { K8sVersionModel } from '../model/k8s-version.model';
import { finalize } from 'rxjs';

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

  // for switch
  isLoadingAutoHealing: boolean;
  isLoadingAutoScale: boolean;

  // for uprgade
  showModalUpgradeVersion: boolean;
  isUpgradingVersion: boolean;
  upgradeVersionCluster: string;

  listOfK8sVersion: K8sVersionModel[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private clusterService: ClusterService,
    private notificationService: NzNotificationService
  ) {
    this.listOfK8sVersion = [];

    this.isLoadingAutoHealing = false;
    this.isLoadingAutoScale = false;
    this.showModalUpgradeVersion = false;
    this.isUpgradingVersion = false;
  }

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

        this.autoScaleValue = this.detailCluster.autoScaling;
        this.autoHealingValue = this.detailCluster.autoHealing;

        // test
        this.detailCluster.upgradeVersion = '1.29.0';
        this.detailCluster.currentVersion = '1.28.2';

      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  getListVersion(regionId: number) {
    this.clusterService.getListK8sVersion(regionId, null)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfK8sVersion = r.data;
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

  handleChangeScaleNode(item: WorkerGroupModel) {
    console.log(item);
  }

  handleShowModalUpgradeVersion() {
    // this.getListVersion(this.detailCluster.regionId);
    this.getListVersion(3);   // fix to test
    this.showModalUpgradeVersion = true;
  }

  handleCancelShowModalUpgrade() {
    this.showModalUpgradeVersion = false;
    this.upgradeVersionCluster = null;
  }

  handleUpgadeVersionCluster() {
    this.isUpgradingVersion = true;

    let upgradeDto: UpgradeVersionClusterDto = new UpgradeVersionClusterDto();
    upgradeDto.clusterName = this.detailCluster.clusterName;
    upgradeDto.namespace = this.detailCluster.namespace;
    upgradeDto.regionId = this.detailCluster.regionId;
    upgradeDto.version = this.upgradeVersionCluster;

    this.clusterService.upgradeVersionCluster(upgradeDto)
    .pipe(finalize(() => {
      this.isUpgradingVersion = false;
      this.showModalUpgradeVersion = false;
    })).subscribe((r: any) => {
      if (r && r.code == 200) {
        this.notificationService.success("Thành công", r.message);
        this.back2list();
      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }

}

@Component({
  selector: 'row-data',
  template: `
  <style>
    .danger-color {color: #ea3829;}
  </style>
  <div nz-row>
    <div nz-col nzSpan="8">
      {{label}}
    </div>
    <div nz-col nzSpan="16" style="font-weight: 600;"
      [ngClass]="type === 'danger' ? 'danger-color' : ''">
      <ng-container *ngIf="(value + '').length <= 30; else truncateValueTpl">
        {{value}}
      </ng-container>
      <ng-template #truncateValueTpl>
        <div nz-popover
          [nzPopoverTitle]="label"
          [nzPopoverContent]="contentTpl"
          nzPopoverPlacement="bottom">
          {{value | truncateLabel}}
        </div>

        <ng-template #contentTpl>
          <div style="width: fit-content">{{value}}</div>
        </ng-template>
      </ng-template>
    </div>
  </div>
  `
})
export class RowDetailData implements OnInit {
  @Input('label') label: string;
  @Input('value') value: any;
  @Input('type') type: string;

  constructor() {}

  ngOnInit(): void { }
}

