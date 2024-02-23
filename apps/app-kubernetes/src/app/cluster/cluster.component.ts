import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { K8sVersionModel } from '../model/k8s-version.model';
import { SubnetModel, VPCNetworkModel } from '../model/vpc-network.model';
import { ClusterService } from '../services/cluster.service';
import { WorkerTypeModel } from '../model/worker-type.model';
import { VolumeTypeModel } from '../model/volume-type.model';
import { KubernetesConstant } from '../constants/kubernetes.constant';
import { RegionModel } from '../shared/models/region.model';

@Component({
  selector: 'one-portal-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.css'],
})
export class ClusterComponent implements OnInit {

  myform: FormGroup;
  listFormWorkerGroup: FormArray;
  selectedInfra: string;

  isAutoScaleEnable: boolean;

  listOfK8sVersion: K8sVersionModel[];
  listOfVPCNetworks: VPCNetworkModel[];
  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];
  listOfCIDR: any[];
  listOfSubnets: SubnetModel[];

  // infrastructure info
  region: number;
  cloudProfileName: string;

  public DEFAULT_CIDR = KubernetesConstant.DEFAULT_CIDR;
  public DEFAULT_VOLUME_TYPE = KubernetesConstant.DEFAULT_VOLUME_TYPE;
  public DEFAULT_NETWORK_TYPE = KubernetesConstant.DEFAULT_NETWORK_TYPE;

  constructor(
    private fb: FormBuilder,
    private clusterService: ClusterService,
    private modalService: NzModalService,
    private router: Router
  ) {
    this.listOfK8sVersion = [];
    this.listOfSubnets = [];
    this.listOfVPCNetworks = [];
    this.listOfCIDR = [];
    this.listOfVolumeType = [];
    this.listOfWorkerType = [];
  }

  ngOnInit(): void {
    this.listFormWorkerGroup = this.fb.array([]);

    this.myform = this.fb.group({
      clusterName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      kubernetesVersion: [null, [Validators.required]],
      region: [null, [Validators.required]],

      autoScalingWorker: [false],
      autoHealing: [false],

      networkType: [this.DEFAULT_NETWORK_TYPE, Validators.required],
      vpcNetwork: [null, Validators.required],
      cidr: [this.DEFAULT_CIDR, Validators.required],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      subnet: [null, [Validators.required]],

      workerGroup: this.listFormWorkerGroup,
    });

    // init worker group
    this.addWorkerGroup();
  }

  addWorkerGroup(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorkerGroup ? this.listFormWorkerGroup.length : 0;
    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index)]],
      nodeNumber: [3, [Validators.required]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [this.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      minimumNode: [null],
      maximumNode: [null]
    });
    this.listFormWorkerGroup.push(wg);
  }

  getListK8sVersion(cloudProfileName: string) {
    this.clusterService.getListK8sVersion(cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfK8sVersion = r.data;

          // select latest version of kubernetes
          const len = this.listOfK8sVersion?.length;
          const latestVersion: K8sVersionModel = this.listOfK8sVersion?.[len - 1];
          this.myform.get('kubernetesVersion').setValue(latestVersion.k8sVersion);
        }
      });
  }

  getListWorkerType(cloudProfileName: string) {
    this.clusterService.getListWorkerTypes(cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfWorkerType = r.data;
        }
      })
  }

  getListVolumeType(cloudProfileName: string) {
    this.clusterService.getListVolumeTypes(cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfVolumeType = r.data;
        }
      });
  }

  getVPCNetwork(cloudProfileName: string) {
    this.clusterService.getVPCNetwork(cloudProfileName)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfVPCNetworks = r.data;
      }
    });
  }

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.cloudProfileName = region.cloudId;

    this.getListK8sVersion(this.cloudProfileName);
    this.getListWorkerType(this.cloudProfileName);
    this.getListVolumeType(this.cloudProfileName);

    this.myform.get('region').setValue(region.regionId);

    // TODO: handle reset select box of previous region ...

  }

  onSelectVolumeType(volumeType: string, index: number) {
    const selectedVolumeType = this.listOfVolumeType.find(item => item.volumeType === volumeType);
    console.log(selectedVolumeType);
    this.listFormWorkerGroup.at(index).get('volumeTypeId').setValue(selectedVolumeType.id);
  }

  onSelectWorkerType(machineName: string, index: number) {
    const selectedWorkerType = this.listOfWorkerType.find(item => item.machineName === machineName);
    console.log(selectedWorkerType);
    this.listFormWorkerGroup.at(index).get('configTypeId').setValue(selectedWorkerType.id);
  }

  onChangeAdvancedConfig() {
    const isAutoScaleWorker = this.myform.get('autoScalingWorker').value;
    if (isAutoScaleWorker) {
      this.isAutoScaleEnable = true;
      this.addValidateMinimumNode();
      this.addValidateMaximumNode();
    } else {
      this.isAutoScaleEnable = false;
      this.removeValidateMinimumNode();
      this.removeValidateMaximumNode();
    }
  }

  // validator
  addValidateMaximumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('maximumNode').setValidators([Validators.required]);
      this.listFormWorkerGroup.at(i).get('maximumNode').updateValueAndValidity();
    }
  }

  removeValidateMaximumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('maximumNode').clearValidators();
      this.listFormWorkerGroup.at(i).get('maximumNode').updateValueAndValidity();
    }
  }

  addValidateMinimumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('minimumNode').setValidators([Validators.required]);
      this.listFormWorkerGroup.at(i).get('minimumNode').updateValueAndValidity();
    }
  }

  removeValidateMinimumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('minimumNode').clearValidators();
      this.listFormWorkerGroup.at(i).get('minimumNode').updateValueAndValidity();
    }
  }

  removeWorkerGroup(index: number, e: MouseEvent): void {
    e.preventDefault();
    this.listFormWorkerGroup.removeAt(index);
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
    this.listFormWorkerGroup.controls.forEach((x, i) => {
      if (index != i)
        (x as FormGroup).get('workerGroupName').updateValueAndValidity()
    })
  }

  // get data
  get clusterName() {
    return this.myform.get('clusterName').value;
  }

  get kubernetesVersion() {
    return this.myform.get('kubernetesVersion').value;
  }

  get regionName() {
    return this.myform.get('reigon').value;
  }

  syncVPCNetwork() {
    console.log(123);
  }

  syncSubnet() {
    console.log(123);
  }

  onCancelCreate() {
    this.modalService.confirm({
      nzTitle: 'Hủy tạo mới cluster',
      nzContent: 'Cluster của bạn chưa được tạo. <br>Bạn có muốn hủy tạo mới và xóa bản nháp?',
      nzOkText: "Xác nhận",
      nzCancelText: "Hủy",
      nzOnOk: () => this.back2list()
    });
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }

  isNumber(event) {
    const reg = new RegExp('^[0-9]+$');
    const input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  onSubmitPayment() {
    const cluster = this.myform.value;
    console.log({data: cluster});
    this.clusterService.testCreateCluster(cluster)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        console.log({r: r});
      }
    });
  }

}
