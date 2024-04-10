import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs';
import { KubernetesCluster, UpgradeVersionClusterDto, WorkerGroupModel } from '../../model/cluster.model';
import { K8sVersionModel } from '../../model/k8s-version.model';
import { VPCNetworkModel } from '../../model/vpc-network.model';
import { ClusterService } from '../../services/cluster.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { WorkerTypeModel } from '../../model/worker-type.model';
import { VolumeTypeModel } from '../../model/volume-type.model';

@Component({
  selector: 'one-portal-detail-cluster',
  templateUrl: './detail-cluster.component.html',
  styleUrls: ['./detail-cluster.component.css'],
})
export class DetailClusterComponent implements OnInit, OnChanges {

  @Input('detailCluster') detailCluster: KubernetesCluster;
  @Input('vpcNetwork') vpcNetwork: string;
  @Input("yamlString") yamlString: string;

  serviceOrderCode: string;

  // for uprgade
  showModalUpgradeVersion: boolean;
  isUpgradingVersion: boolean;
  upgradeVersionCluster: string;

  upgradeForm: FormGroup;

  listOfK8sVersion: K8sVersionModel[];
  listOfVPCNetworks: VPCNetworkModel[];

  // kubeconfig
  showModalKubeConfig: boolean;

  // upgrade variable
  isEditMode: boolean;
  listFormWorkerGroupUpgrade: FormArray;
  upgradeClusterName: string;
  workerGroupConfig: any;
  upgradeVolumeCloudSize: number;
  upgradeVolumeType: string;

  cloudProfileId: string;
  regionId: number;

  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];

  constructor(
    private router: Router,
    private clusterService: ClusterService,
    private notificationService: NzNotificationService,
    private clipboardService: ClipboardService,
    private fb: FormBuilder
  ) {
    this.listOfK8sVersion = [];
    this.showModalKubeConfig = false;
    this.showModalUpgradeVersion = false;
    this.isUpgradingVersion = false;
    this.isEditMode = false;
  }

  ngOnInit(): void {
    this.listFormWorkerGroupUpgrade = this.fb.array([]);
    this.upgradeForm = this.fb.group({
      workerGroup: this.listFormWorkerGroupUpgrade
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detailCluster']) {
      if (changes['detailCluster'].currentValue) {
        this.detailCluster = changes['detailCluster'].currentValue;
        this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;
        this.regionId = this.detailCluster.regionId;
      }
    }
  }

  onEditCluster() {
    this.isEditMode = true;
    this.initUpgradeData();
    this.getListWorkerType(this.regionId, this.cloudProfileId);
    this.getListVolumeType(this.regionId, this.cloudProfileId);
  }

  initUpgradeData() {
    this.upgradeClusterName = this.detailCluster.clusterName;
    this.upgradeVolumeType = this.detailCluster.volumeCloudType;
    this.upgradeVolumeCloudSize = this.detailCluster.volumeCloudSize;

    const wgs = this.detailCluster.workerGroup;
    console.log(wgs);
    for (let i = 0; i < wgs.length; i++) {
      const index = this.listFormWorkerGroupUpgrade ? this.listFormWorkerGroupUpgrade.length : 0;
      const wg = this.fb.group({
        workerGroupName: [wgs[i].workerGroupName,
          [Validators.required, Validators.maxLength(16), this.validateUnique(index), Validators.pattern('^[a-z0-9-_]*$')]],
        nodeNumber: [wgs[i].nodeNumber, [Validators.required, Validators.min(1), Validators.max(10)]],
        volumeStorage: [wgs[i].volumeSize, [Validators.required, Validators.min(20), Validators.max(1000)]],
        volumeType: [wgs[i].volumeType, [Validators.required]],
        volumeTypeId: [null, [Validators.required]],
        configType: [null, [Validators.required]],
        configTypeId: [null, [Validators.required]],
        autoScalingWorker: [wgs[i].autoScaling, Validators.required],
        autoHealing: [wgs[i].autoHealing, Validators.required],
        minimumNode: [null],
        maximumNode: [null]
      });

      this.listFormWorkerGroupUpgrade.push(wg);
    }
  }

  // validate duplicate worker group name
  validateUnique(index: number) {
    return (control: AbstractControl) => {
      if (control.value) {
        const formArray = control.parent
          ? (control.parent.parent as FormArray)
          : null;
        if (formArray) {
          const attributes = formArray.value.map((x) => x.workerGroupName);
          return attributes.indexOf(control.value) >= 0 && attributes.indexOf(control.value) < index
            ? { duplicateName: true }
            : null;
        }
      }
    };
  }

  checkDuplicate(index: number) {
    this.listFormWorkerGroupUpgrade.controls.forEach((x, i) => {
      if (index != i)
        (x as FormGroup).get('workerGroupName').updateValueAndValidity()
    })
  }

  getListWorkerType(regionId: number,cloudProfileName: string) {
    this.listOfWorkerType = [];
    this.clusterService.getListWorkerTypes(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfWorkerType = r.data;
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      })
  }

  getListVolumeType(regionId: number,cloudProfileName: string) {
    this.listOfVolumeType = [];
    this.clusterService.getListVolumeTypes(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfVolumeType = r.data;
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      });
  }

  onCancelEdit() {
    this.isEditMode = false;
  }

  onEditClusterName(value: string) {
    console.log({value: value});
  }

  onChangeVolumeSize(value: string) {
    console.log({value: value});
  }

  // 0: formGroup, 1: formArray
  onValidateUpgradeInput(currentValue: number, upgradeValue: number,
    control: string, type: number, index?: number) {

  }

  isNumber(event) {
    const reg = new RegExp('^[0-9]+$');
    const input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
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

  get workerGroupName() {
    return null;
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

