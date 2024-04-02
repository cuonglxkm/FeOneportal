import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs';
import { KubernetesCluster, UpgradeVersionClusterDto, WorkerGroupModel } from 'src/app/model/cluster.model';
import { K8sVersionModel } from 'src/app/model/k8s-version.model';
import { VPCNetworkModel } from 'src/app/model/vpc-network.model';
import { ClusterService } from 'src/app/services/cluster.service';

@Component({
  selector: 'one-portal-detail-cluster',
  templateUrl: './detail-cluster.component.html',
  styleUrls: ['./detail-cluster.component.css'],
})
export class DetailClusterComponent implements OnInit {

  @Input('detailCluster') detailCluster: KubernetesCluster;
  @Input('vpcNetwork') vpcNetwork: string;
  @Input("yamlString") yamlString: string;

  serviceOrderCode: string;

  // for uprgade
  showModalUpgradeVersion: boolean;
  isUpgradingVersion: boolean;
  upgradeVersionCluster: string;

  listOfK8sVersion: K8sVersionModel[];
  listOfVPCNetworks: VPCNetworkModel[];

  // kubeconfig
  showModalKubeConfig: boolean;

  constructor(
    private router: Router,
    private clusterService: ClusterService,
    private notificationService: NzNotificationService,
    private clipboardService: ClipboardService
  ) {
    this.listOfK8sVersion = [];
    this.showModalKubeConfig = false;
    this.showModalUpgradeVersion = false;
    this.isUpgradingVersion = false;
  }

  ngOnInit(): void {

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

  handleChangeScaleNode(item: WorkerGroupModel) {
    console.log(item);
  }

  handleShowModalUpgradeVersion() {
    this.getListVersion(this.detailCluster.regionId);
    this.showModalUpgradeVersion = true;
  }

  handleCancelShowModalUpgrade() {
    this.showModalUpgradeVersion = false;
    this.upgradeVersionCluster = null;
  }

  handleSyncClusterInfo() { }

  // for kubeconfig
  handleViewKubeConfig() {
    this.showModalKubeConfig = true;
  }

  handleCancelModalViewKubeConfig() {
    this.showModalKubeConfig = false;
  }

  handleCopyKubeConfig() {
    this.clipboardService.copy(this.yamlString);
    this.notificationService.success("Đã sao chép", null);
  }

  handleCopyAPIEndpoint() {
    this.clipboardService.copy(this.detailCluster.apiEndpoint);
    this.notificationService.success("Đã sao chép", null);
  }

  handleDownloadKubeConfig() {
    const blob = new Blob([this.yamlString], { type: 'text/yaml' })
    const url = window.URL.createObjectURL(blob);

    // create a ele to download
    var dlink = document.createElement("a");
    dlink.download = this.detailCluster.clusterName + '_kubeconfig.yaml';
    dlink.href = url;
    dlink.onclick = function (e) {
      // revokeObjectURL needs a delay to work properly
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
      }, 1500);
    };
    dlink.click(); dlink.remove();
  }

  handleUpgadeVersionCluster() {
    this.isUpgradingVersion = true;

    let upgradeDto: UpgradeVersionClusterDto = new UpgradeVersionClusterDto();
    upgradeDto.clusterName = this.detailCluster.clusterName;
    upgradeDto.namespace = this.detailCluster.namespace;
    upgradeDto.regionId = this.detailCluster.regionId;
    upgradeDto.version = this.upgradeVersionCluster;
    upgradeDto.serviceOrderCode = this.detailCluster.serviceOrderCode;

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

  constructor() { }

  ngOnInit(): void { }
}

