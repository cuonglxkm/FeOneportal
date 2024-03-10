import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KubernetesCluster, WorkerGroupModel } from '../model/cluster.model';
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

  // for switch
  isLoadingAutoHealing: boolean;
  isLoadingAutoScale: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cluserService: ClusterService,
    private notificationService: NzNotificationService
  ) {
    this.isLoadingAutoHealing = false;
    this.isLoadingAutoScale = false;
  }

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

        this.autoScaleValue = this.detailCluster.autoScaling;
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

  handleChangeScaleNode(item: WorkerGroupModel) {
    console.log(item);
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

  ngOnInit(): void {
      console.log({label: this.label, value: this.value, type: this.type});
  }
}

