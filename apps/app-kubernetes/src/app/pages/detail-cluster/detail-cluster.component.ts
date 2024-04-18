import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { finalize } from 'rxjs';
import { KubernetesCluster, UpgradeVersionClusterDto, WorkerGroupModel } from '../../model/cluster.model';
import { K8sVersionModel } from '../../model/k8s-version.model';
import { ClusterService } from '../../services/cluster.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { WorkerTypeModel } from '../../model/worker-type.model';
import { VolumeTypeModel } from '../../model/volume-type.model';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NetWorkModel } from '../../model/vlan.model';

@Component({
  selector: 'one-portal-detail-cluster',
  templateUrl: './detail-cluster.component.html',
  styleUrls: ['./detail-cluster.component.css'],
})
export class DetailClusterComponent implements OnInit, OnChanges {

  @Input('detailCluster') detailCluster: KubernetesCluster;
  @Input('vpcNetwork') vpcNetwork: string;
  @Input('yamlString') yamlString: string;
  @Input('sshKeyString') sshKeyString: string;

  serviceOrderCode: string;

  // for uprgade
  showModalUpgradeVersion: boolean;
  isUpgradingVersion: boolean;
  upgradeVersionCluster: string;

  upgradeForm: FormGroup;

  listOfK8sVersion: K8sVersionModel[];
  listOfVPCNetworks: NetWorkModel[];

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

  listOfCurrentWorkerGroup: WorkerGroupModel[];

  constructor(
    private router: Router,
    private clusterService: ClusterService,
    private notificationService: NzNotificationService,
    private clipboardService: ClipboardService,
    private fb: FormBuilder,
    private modalService: NzModalService
  ) {
    this.listOfK8sVersion = [];
    this.showModalKubeConfig = false;
    this.showModalUpgradeVersion = false;
    this.isUpgradingVersion = false;
    this.isEditMode = false;

    this.listFormWorkerGroupUpgrade = this.fb.array([]);
  }

  ngOnInit(): void {
    this.upgradeForm = this.fb.group({
      clusterName: [null,
        [Validators.required, Validators.pattern(KubernetesConstant.CLUTERNAME_PATTERN), Validators.minLength(5), Validators.maxLength(50)]],
      volumeCloudSize: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeCloudType: [null, [Validators.required]],
      workerGroup: this.listFormWorkerGroupUpgrade
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detailCluster']?.currentValue) {
      this.detailCluster = changes['detailCluster'].currentValue;
      this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;
      this.regionId = this.detailCluster.regionId;
      this.listOfCurrentWorkerGroup = this.detailCluster.workerGroup;
      this.initFormWorkerGroup(this.detailCluster.workerGroup);
    }
  }

  onConfirmUpgradeService() {
    this.modalService.confirm({
      nzTitle: `Nâng cấp cluster ${this.detailCluster.clusterName}`,
      nzContent: `Hệ thống sẽ bị gián đoạn trong quá trình nâng cấp.<br>Bạn có muốn nâng cấp không?`,
      nzOkText: "Xác nhận",
      nzCancelText: "Hủy bỏ",
      nzOnOk: () => this.onSubmitUpgrade()
    });
  }

  isUpgrading: boolean = false;
  onSubmitUpgrade() {
    this.isUpgrading = true;
    const data = this.upgradeForm.value;
    console.log({data: data});
    this.isUpgrading = false;
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
  }

  initFormWorkerGroup(wgs: WorkerGroupModel[]) {
    for (let i = 0; i < wgs.length; i++) {
      const isAutoScale = wgs[i].autoScaling;
      let nodeNumber: number;
      if (isAutoScale) {
        nodeNumber = wgs[i].nodeNumber;
      } else {
        nodeNumber = wgs[i].minimumNode;
      }

      const wg = this.fb.group({
        id: [wgs[i].id],
        workerGroupName: [wgs[i].workerGroupName,
          [Validators.required, Validators.maxLength(16), this.validateUnique(i), Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
        nodeNumber: [nodeNumber, [Validators.required, Validators.min(1), Validators.max(10)]],
        volumeStorage: [wgs[i].volumeSize, [Validators.required, Validators.min(20), Validators.max(1000)]],
        volumeType: [wgs[i].volumeType, [Validators.required]],
        configType: [wgs[i].machineTypeName, [Validators.required]],
        autoScalingWorker: [wgs[i].autoScaling, Validators.required],
        autoHealing: [wgs[i].autoHealing, Validators.required],
        minimumNode: [null],
        maximumNode: [null],
        ram: [wgs[i].ram],
        cpu: [wgs[i].cpu]
      });

      this.listFormWorkerGroupUpgrade.push(wg);
    }

    // init other info
    this.upgradeForm.get('clusterName').setValue(this.detailCluster.clusterName);
    this.upgradeForm.get('volumeCloudSize').setValue(this.detailCluster.volumeCloudSize);
    this.upgradeForm.get('volumeCloudType').setValue(this.detailCluster.volumeCloudType);
  }

  addWorkerGroup(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorkerGroupUpgrade ? this.listFormWorkerGroupUpgrade.length : 0;
    const wg = this.fb.group({
      id: [null],
      workerGroupName: [null,
        [Validators.required, Validators.maxLength(16), this.validateUnique(index), Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
      nodeNumber: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [KubernetesConstant.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      autoScalingWorker: [false, Validators.required],
      autoHealing: [false, Validators.required],
      minimumNode: [null],
      maximumNode: [null],
      ram: [null],
      cpu: [null]
    });
    this.listFormWorkerGroupUpgrade.push(wg);
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
    this.clearFormWorker();
    this.initFormWorkerGroup(this.listOfCurrentWorkerGroup);
    console.log(this.listOfCurrentWorkerGroup);
  }

  clearFormWorker() {
    while (this.listFormWorkerGroupUpgrade.length != 0) {
      this.listFormWorkerGroupUpgrade.removeAt(0);
    }
  }

  onChangeNodeNumber(event: number, index: number) {
    const idWorker = this.listFormWorkerGroupUpgrade.at(index).get('id').value;
    if (idWorker) {
      const oldWorkerInfo = this.listOfCurrentWorkerGroup.find(item => item.id == idWorker);
      if (event && Number(event) < oldWorkerInfo.nodeNumber) {
        this.listFormWorkerGroupUpgrade.at(index).get('nodeNumber').setErrors({invalid: true});
      } else {
        delete this.listFormWorkerGroupUpgrade.at(index).get('nodeNumber').errors?.invalid;
      }
    }
  }

  onChangeConfigType(event: string, index: number) {
    const idWorker = this.listFormWorkerGroupUpgrade.at(index).get('id').value;
    if (idWorker) {
      const oldWorkerInfo = this.listOfCurrentWorkerGroup.find(item => item.id == idWorker);
      const selectedConfig = this.listOfWorkerType.find(item => event == item.machineName);
      if (selectedConfig.cpu < oldWorkerInfo.cpu || selectedConfig.ram < oldWorkerInfo.ram) {
        this.listFormWorkerGroupUpgrade.at(index).get('configType').setErrors({invalid: true});
      } else {
        delete this.listFormWorkerGroupUpgrade.at(index).get('configType').errors?.invalid;
      }
    }
  }

  onChangeVolumeWorker(event: number, index: number) {
    const idWorker = this.listFormWorkerGroupUpgrade.at(index).get('id').value;
    // worker is existed and all parameters must be equal or greater than current
    if (idWorker) {
      const oldWorkerInfo = this.listOfCurrentWorkerGroup.find(item => item.id == idWorker);
      if (event && Number(event) < oldWorkerInfo.volumeSize) {
        this.listFormWorkerGroupUpgrade.at(index).get('volumeStorage').setErrors({invalid: true});
      } else {
        delete this.listFormWorkerGroupUpgrade.at(index).get('volumeStorage').errors?.invalid;
      }
    }
  }

  validateForm() {
    for (const i in this.upgradeForm.controls) {
      this.upgradeForm.controls[i].markAsDirty();
      this.upgradeForm.controls[i].updateValueAndValidity();
    }
  }

  isAutoScale: boolean;
  onChangeAutoScale(event: any) {
    this.isAutoScale = event;
  }

  isAutoScaleAtIndex(index: number) {
    return this.listFormWorkerGroupUpgrade.at(index).get('autoScalingWorker').value;
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

  // for ssh key
  handleCopySSHKey() {
    this.clipboardService.copy(this.sshKeyString);
    this.notificationService.success("Đã sao chép", null);
  }

  handleDownloadSSHkey() {
    const blob = new Blob([this.sshKeyString], { type: 'application/x-pem-file' });
    const url = window.URL.createObjectURL(blob);

    // create a ele to download
    var dlink = document.createElement("a");
    dlink.download = 'k8s-' + this.detailCluster.clusterName + '.ssh_keypair';
    dlink.href = url;
    dlink.onclick = function (e) {
      // revokeObjectURL needs a delay to work properly
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
      }, 1500);
    };
    dlink.click(); dlink.remove();
  }

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
    const blob = new Blob([this.yamlString], { type: 'text/yaml' });
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

